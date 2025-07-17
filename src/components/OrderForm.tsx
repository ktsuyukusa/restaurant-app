import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, MapPin, CreditCard, ShoppingCart, Plus, Minus, Trash2, Smartphone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import paymentService from '@/services/paymentService';
import PaymentMethodRegistration from './PaymentMethodRegistration';
import authService from '@/services/authService';

interface MenuItem {
  id: string;
  name: Record<string, string>;
  description?: Record<string, string>;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  spicy?: boolean;
  vegetarian?: boolean;
  glutenFree?: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
}

interface Restaurant {
  id: string;
  name: Record<string, string>;
  address?: Record<string, string>;
  phone: string;
  opening_hours?: string;
  komoju_merchant_id?: string;
  payjp_merchant_id?: string;
}

interface OrderFormProps {
  restaurant: Restaurant;
  menuItems: MenuItem[];
  onOrderComplete?: (orderId: string, orderData?: any) => void;
  onClose?: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ 
  restaurant, 
  menuItems, 
  onOrderComplete, 
  onClose 
}) => {
  const { t, currentLanguage } = useLanguage();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    pickupTime: '',
    notes: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'komoju' | 'payjp'>('komoju');
  const [showPaymentRegistration, setShowPaymentRegistration] = useState(false);
  const [userPaymentMethods, setUserPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    // Load user payment methods on mount
    const user = authService.getCurrentUser?.();
    if (user && user.paymentMethods) {
      setUserPaymentMethods(user.paymentMethods);
    }
  }, []);

  const getItemName = (item: MenuItem) => {
    return item.name[currentLanguage] || item.name.en || Object.values(item.name)[0];
  };

  const getItemDescription = (item: MenuItem) => {
    if (!item.description) return '';
    return item.description[currentLanguage] || item.description.en || Object.values(item.description)[0];
  };

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, {
          id: item.id,
          name: getItemName(item),
          price: item.price,
          quantity: 1,
          restaurantId: restaurant.id
        }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getPickupTimeOptions = () => {
    const options = [];
    const now = new Date();
    const currentHour = now.getHours();
    
    // Generate time slots for the next 24 hours
    for (let i = 0; i < 24; i++) {
      const hour = (currentHour + i) % 24;
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      options.push(timeString);
    }
    
    return options;
  };

  const handlePaymentMethodAdded = (paymentMethod: PaymentMethod) => {
    setUserPaymentMethods((prev) => [...prev, paymentMethod]);
    setShowPaymentRegistration(false);
  };

  const handleOrderClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (userPaymentMethods.length === 0) {
      setShowPaymentRegistration(true);
      return;
    }
    handleSubmit(e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsProcessing(true);
    try {
      // Create order in database (or mock if Supabase not configured)
      let order;
      let orderError;
      
      try {
        const result = await supabase
          .from('orders')
          .insert([{
            restaurant_id: restaurant.id,
            customer_name: customerInfo.name,
            customer_email: customerInfo.email,
            customer_phone: customerInfo.phone,
            pickup_time: customerInfo.pickupTime,
            notes: customerInfo.notes,
            total_amount: getTotalPrice(),
            status: 'pending',
            payment_method: paymentMethod,
            items: cart.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              quantity: item.quantity
            }))
          }])
          .select()
          .single();
        
        order = result.data;
        orderError = result.error;
      } catch (dbError) {
        console.log('Supabase not configured, using mock order');
        // Create mock order for testing
        order = {
          id: `mock-order-${Date.now()}`,
          restaurant_id: restaurant.id,
          customer_name: customerInfo.name,
          customer_email: customerInfo.email,
          customer_phone: customerInfo.phone,
          pickup_time: customerInfo.pickupTime,
          notes: customerInfo.notes,
          total_amount: getTotalPrice(),
          status: 'pending',
          payment_method: paymentMethod,
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          created_at: new Date().toISOString()
        };
        orderError = null;
      }

      if (orderError) throw orderError;

      // Create payment session
      const session = await createPaymentSession(order.id, getTotalPrice());
      
      if (session.payment_url) {
        // Redirect to payment provider
        window.location.href = session.payment_url;
      } else {
        // For testing/mock payments, mark as paid immediately
        try {
          await supabase
            .from('orders')
            .update({ status: 'paid' })
            .eq('id', order.id);
        } catch (dbError) {
          console.log('Supabase not configured, using mock order status update');
          // For mock orders, just update the local object
          order.status = 'paid';
        }
        
        // Pass the complete order object for mock orders
        onOrderComplete?.(order.id, order);
      }
    } catch (error) {
      console.error('Order error:', error);
      // Handle error
    } finally {
      setIsProcessing(false);
    }
  };

  const createPaymentSession = async (orderId: string, amount: number) => {
    try {
      const orderPayment = {
        order_id: orderId,
        restaurant_id: restaurant.id,
        amount: amount,
        currency: 'JPY',
        customer_email: customerInfo.email,
        customer_name: customerInfo.name,
        items: cart.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      };

      const session = await paymentService.createPaymentSession(orderPayment, paymentMethod);
      return session;
    } catch (error) {
      console.error('Payment session creation error:', error);
      return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {t('order.title', 'Order & Pay')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Menu Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('menu.title', 'Menu')}</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {menuItems.filter(item => item.available).map((item) => (
                  <Card key={item.id} className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{getItemName(item)}</h4>
                          {item.spicy && <Badge variant="destructive" className="text-xs">Spicy</Badge>}
                          {item.vegetarian && <Badge className="text-xs bg-green-100 text-green-800">Vegetarian</Badge>}
                          {item.glutenFree && <Badge className="text-xs bg-blue-100 text-blue-800">Gluten-Free</Badge>}
                        </div>
                        {getItemDescription(item) && (
                          <p className="text-sm text-gray-600 mt-1">{getItemDescription(item)}</p>
                        )}
                        <p className="text-lg font-semibold text-navikko-primary mt-2">
                          ¥{item.price.toLocaleString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => addToCart(item)}
                        className="ml-2"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('order.summary', 'Order Summary')}</h3>
              
              {/* Cart Items */}
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">¥{item.price.toLocaleString()} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {cart.length > 0 && (
                <>
                  <Separator />
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {t('order.total', 'Total')}: ¥{getTotalPrice().toLocaleString()}
                    </p>
                  </div>
                </>
              )}

              {/* Customer Information Form */}
              {cart.length > 0 && (
                <>
                  {showPaymentRegistration ? (
                    <PaymentMethodRegistration
                      onPaymentMethodAdded={handlePaymentMethodAdded}
                      onCancel={() => setShowPaymentRegistration(false)}
                    />
                  ) : (
                    <form onSubmit={handleOrderClick} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">{t('form.name', 'Name')} *</Label>
                          <Input
                            id="name"
                            value={customerInfo.name}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">{t('form.email', 'Email')} *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={customerInfo.email}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">{t('form.phone', 'Phone')}</Label>
                          <Input
                            id="phone"
                            value={customerInfo.phone}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="pickupTime">{t('order.pickupTime', 'Pickup Time')} *</Label>
                          <Select
                            value={customerInfo.pickupTime}
                            onValueChange={(value) => setCustomerInfo(prev => ({ ...prev, pickupTime: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('order.selectTime', 'Select pickup time')} />
                            </SelectTrigger>
                            <SelectContent>
                              {getPickupTimeOptions().map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="notes">{t('order.notes', 'Special Instructions')}</Label>
                        <Textarea
                          id="notes"
                          value={customerInfo.notes}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder={t('order.notesPlaceholder', 'Any special requests or dietary requirements...')}
                        />
                      </div>

                      {/* Payment Method Selection */}
                      <div>
                        <Label>{t('order.paymentMethod', 'Payment Method')}</Label>
                        <div className="flex gap-4 mt-2">
                          <Button
                            type="button"
                            variant={paymentMethod === 'komoju' ? 'default' : 'outline'}
                            onClick={() => setPaymentMethod('komoju')}
                            className="flex-1"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Credit Card
                          </Button>
                          <Button
                            type="button"
                            variant={paymentMethod === 'payjp' ? 'default' : 'outline'}
                            onClick={() => setPaymentMethod('payjp')}
                            className="flex-1"
                          >
                            <Smartphone className="h-4 w-4 mr-2" />
                            QR Code Payment
                          </Button>
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          QR Code supports PayPay, WeChat Pay, Alipay, and other mobile payments
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isProcessing || cart.length === 0}
                      >
                        {isProcessing ? (
                          <>{t('order.processing', 'Processing...')}</>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            {t('order.payNow', 'Pay Now')} - ¥{getTotalPrice().toLocaleString()}
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderForm; 