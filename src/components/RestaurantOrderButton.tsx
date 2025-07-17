import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShoppingCart, CreditCard } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import OrderForm from './OrderForm';
import OrderConfirmation from './OrderConfirmation';
import { supabase } from '@/lib/supabase';

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

interface Restaurant {
  id: string;
  name: Record<string, string>;
  address?: Record<string, string>;
  phone: string;
  opening_hours?: string;
  komoju_merchant_id?: string;
  payjp_merchant_id?: string;
  menu?: MenuItem[];
}

interface RestaurantOrderButtonProps {
  restaurant: Restaurant;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const RestaurantOrderButton: React.FC<RestaurantOrderButtonProps> = ({
  restaurant,
  variant = 'default',
  size = 'default',
  className = ''
}) => {
  const { t, currentLanguage } = useLanguage();
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getRestaurantName = () => {
    return restaurant.name[currentLanguage] || restaurant.name.en || Object.values(restaurant.name)[0];
  };

  const hasPaymentMethods = () => {
    return restaurant.komoju_merchant_id || restaurant.payjp_merchant_id;
  };

  const loadMenuItems = async () => {
    if (restaurant.menu && restaurant.menu.length > 0) {
      setMenuItems(restaurant.menu);
      return;
    }

    setIsLoading(true);
    try {
      // Try to load menu from database
      let data, error;
      
      try {
        const result = await supabase
          .from('menus')
          .select('*')
          .eq('restaurant_id', restaurant.id);
        
        data = result.data;
        error = result.error;
      } catch (dbError) {
        console.log('Supabase not configured, using sample menu');
        data = [];
        error = null;
      }

      if (error) throw error;

      if (data && data.length > 0) {
        // Convert database format to MenuItem format
        const items: MenuItem[] = data.map(item => ({
          id: item.id,
          name: item.item_name_json || { en: item.item_name, ja: item.item_name_ja || item.item_name },
          description: item.description_json || { en: item.description || '' },
          price: item.price,
          category: item.category || 'Main',
          image: item.photo || undefined,
          available: item.available !== false,
          spicy: item.spicy || false,
          vegetarian: item.vegetarian || false,
          glutenFree: item.gluten_free || false
        }));
        setMenuItems(items);
      } else {
        // Fallback to sample menu if no database items
        setMenuItems([
          {
            id: 'sample-1',
            name: { en: 'Sample Dish', ja: 'サンプル料理', zh: '样品菜', ko: '샘플 요리' },
            description: { en: 'A delicious sample dish', ja: 'おいしいサンプル料理', zh: '美味的样品菜', ko: '맛있는 샘플 요리' },
            price: 1000,
            category: 'Main',
            available: true
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
      // Set fallback menu
      setMenuItems([
        {
          id: 'fallback-1',
          name: { en: 'Menu Available', ja: 'メニューあり', zh: '有菜单', ko: '메뉴 있음' },
          description: { en: 'Please contact restaurant for menu details', ja: 'メニューの詳細はレストランにお問い合わせください', zh: '菜单详情请联系餐厅', ko: '메뉴 세부사항은 레스토랑에 문의하세요' },
          price: 0,
          category: 'Info',
          available: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderClick = () => {
    if (!hasPaymentMethods()) {
      // Show message that ordering is not available
      alert(t('order.notAvailable', 'Online ordering is not available for this restaurant. Please contact them directly.'));
      return;
    }
    
    loadMenuItems();
    setIsOrderDialogOpen(true);
  };

  const handleOrderComplete = (orderId: string, orderData?: any) => {
    if (orderData) {
      // Use the provided order data (for mock orders)
      setCurrentOrder(orderData);
    } else {
      // Fetch the completed order details from database
      fetchOrderDetails(orderId);
    }
    setIsOrderDialogOpen(false);
    setIsConfirmationDialogOpen(true);
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      let data, error;
      
      try {
        const result = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();
        
        data = result.data;
        error = result.error;
      } catch (dbError) {
        console.log('Supabase not configured, using mock order details');
        // For mock orders, we'll use the order data passed from OrderForm
        return;
      }

      if (error) throw error;
      setCurrentOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleDownloadReceipt = () => {
    if (!currentOrder) return;

    // Generate receipt content
    const receiptContent = `
      Receipt
      =======
      Order ID: ${currentOrder.id}
      Date: ${new Date(currentOrder.created_at).toLocaleString()}
      Restaurant: ${getRestaurantName()}
      Customer: ${currentOrder.customer_name}
      Email: ${currentOrder.customer_email}
      Phone: ${currentOrder.customer_phone}
      Pickup Time: ${currentOrder.pickup_time}
      
      Items:
      ${currentOrder.items.map((item: any) => 
        `${item.name} x${item.quantity} - ¥${(item.price * item.quantity).toLocaleString()}`
      ).join('\n')}
      
      Total: ¥${currentOrder.total_amount.toLocaleString()}
      
      Status: ${currentOrder.status}
      Payment Method: ${currentOrder.payment_method}
    `;

    // Create and download file
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${currentOrder.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={className}
            onClick={handleOrderClick}
            disabled={isLoading}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {t('order.orderNow', 'Order Now')}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t('order.title', 'Order & Pay')} - {getRestaurantName()}
            </DialogTitle>
          </DialogHeader>
          <OrderForm
            restaurant={restaurant}
            menuItems={menuItems}
            onOrderComplete={handleOrderComplete}
            onClose={() => setIsOrderDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmationDialogOpen} onOpenChange={setIsConfirmationDialogOpen}>
        <DialogContent className="max-w-2xl">
          {currentOrder && (
            <OrderConfirmation
              order={currentOrder}
              onClose={() => setIsConfirmationDialogOpen(false)}
              onDownloadReceipt={handleDownloadReceipt}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RestaurantOrderButton; 