import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { orderService, restaurantService } from '../services/supabase';

interface CartCheckoutScreenProps {
  navigation: any;
  route: any;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
}

interface OrderData {
  restaurant_id: string;
  user_id: string;
  items: Array<{
    menu_item_id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  special_instructions?: string;
  delivery_address?: string;
  contact_phone?: string;
}

export const CartCheckoutScreen: React.FC<CartCheckoutScreenProps> = ({ navigation, route }) => {
  const { t, currentLanguage } = useLanguage();
  const { restaurantId, cartItems, total } = route.params;
  
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');

  const TAX_RATE = 0.08; // 8% tax rate
  const DELIVERY_FEE = 300; // ¥300 delivery fee

  useEffect(() => {
    fetchRestaurantDetails();
  }, [restaurantId]);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await restaurantService.getById(restaurantId);
      
      if (error) {
        Alert.alert(t('error'), 'Failed to load restaurant details');
        return;
      }

      setRestaurant(data);
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      Alert.alert(t('error'), 'Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * TAX_RATE;
  };

  const calculateDeliveryFee = () => {
    return orderType === 'delivery' ? DELIVERY_FEE : 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateDeliveryFee();
  };

  const handlePlaceOrder = async () => {
    if (!restaurant) {
      Alert.alert(t('error'), 'Restaurant information not available');
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      Alert.alert(t('error'), 'Please enter delivery address');
      return;
    }

    if (!contactPhone.trim()) {
      Alert.alert(t('error'), 'Please enter contact phone number');
      return;
    }

    try {
      setSubmitting(true);

      const orderData: OrderData = {
        restaurant_id: restaurantId,
        user_id: 'temp-user-id', // This should come from auth context
        items: cartItems.map(item => ({
          menu_item_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        status: 'new',
        special_instructions: specialInstructions.trim() || undefined,
        delivery_address: orderType === 'delivery' ? deliveryAddress : undefined,
        contact_phone: contactPhone,
      };

      const { data, error } = await orderService.create(orderData);

      if (error) {
        Alert.alert(t('error'), 'Failed to place order. Please try again.');
        return;
      }

      // Show success message and navigate back
      Alert.alert(
        t('order.order_confirmation'),
        `Order #${data.id} has been placed successfully!`,
        [
          {
            text: t('common.ok'),
            onPress: () => {
              navigation.navigate('Activity', { activeTab: 'orders' });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert(t('error'), 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderCartItem = (item: CartItem) => (
    <View key={item.id} style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemDescription}>{item.description}</Text>
      </View>
      <View style={styles.cartItemDetails}>
        <Text style={styles.cartItemQuantity}>x{item.quantity}</Text>
        <Text style={styles.cartItemPrice}>¥{(item.price * item.quantity).toLocaleString()}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="height"
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('order.checkout')}</Text>
          {restaurant && (
            <Text style={styles.restaurantName}>{restaurant.name_en}</Text>
          )}
        </View>

        {/* Order Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('order.order_type')}</Text>
          <View style={styles.orderTypeContainer}>
            <TouchableOpacity
              style={[
                styles.orderTypeButton,
                orderType === 'pickup' && styles.orderTypeButtonActive
              ]}
              onPress={() => setOrderType('pickup')}
            >
              <Text style={[
                styles.orderTypeText,
                orderType === 'pickup' && styles.orderTypeTextActive
              ]}>
                {t('order.pickup')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.orderTypeButton,
                orderType === 'delivery' && styles.orderTypeButtonActive
              ]}
              onPress={() => setOrderType('delivery')}
            >
              <Text style={[
                styles.orderTypeText,
                orderType === 'delivery' && styles.orderTypeTextActive
              ]}>
                {t('order.delivery')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('order.contact_info')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('order.phone_placeholder')}
            value={contactPhone}
            onChangeText={setContactPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* Delivery Address */}
        {orderType === 'delivery' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('order.delivery_address')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t('order.address_placeholder')}
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              multiline
              numberOfLines={3}
            />
          </View>
        )}

        {/* Special Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('order.special_instructions')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('order.instructions_placeholder')}
            value={specialInstructions}
            onChangeText={setSpecialInstructions}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('order.order_summary')}</Text>
          <View style={styles.orderItems}>
            {cartItems.map(renderCartItem)}
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('order.price_breakdown')}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{t('order.subtotal')}</Text>
            <Text style={styles.priceValue}>¥{calculateSubtotal().toLocaleString()}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>{t('order.tax')}</Text>
            <Text style={styles.priceValue}>¥{calculateTax().toLocaleString()}</Text>
          </View>
          {orderType === 'delivery' && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{t('order.delivery_fee')}</Text>
              <Text style={styles.priceValue}>¥{DELIVERY_FEE.toLocaleString()}</Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>{t('order.total')}</Text>
            <Text style={styles.totalValue}>¥{calculateTotal().toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.checkoutButton, submitting && styles.checkoutButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.checkoutButtonText}>
              {t('order.place_order')} - ¥{calculateTotal().toLocaleString()}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  orderTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  orderTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    backgroundColor: '#f8f9fa',
  },
  orderTypeButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  orderTypeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  orderTypeTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  orderItems: {
    gap: 12,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  cartItemDescription: {
    fontSize: 14,
    color: '#666',
  },
  cartItemDetails: {
    alignItems: 'flex-end',
  },
  cartItemQuantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  checkoutButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 