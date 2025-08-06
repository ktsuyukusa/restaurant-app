import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { useLanguage } from '../hooks/useLanguage';
import { menuService } from '../services/supabase';
import { MenuItemDetail } from '../components/MenuItemDetail';

interface MenuScreenProps {
  navigation: any;
  route: any;
}

interface MenuCategory {
  id: string;
  name_en: string;
  name_ja: string;
  sort_order: number;
}

interface MenuItem {
  id: string;
  name_en: string;
  name_ja: string;
  description_en: string;
  description_ja: string;
  price: number;
  category_id: string;
  image_url?: string;
  is_available: boolean;
  sort_order: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
}

const { width } = Dimensions.get('window');

export const MenuScreen: React.FC<MenuScreenProps> = ({ navigation, route }) => {
  const { t, currentLanguage } = useLanguage();
  const { restaurantId } = route.params;
  
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showImages, setShowImages] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showItemDetail, setShowItemDetail] = useState(false);

  useEffect(() => {
    fetchMenuData();
  }, [restaurantId]);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      
      // Fetch categories and menu items in parallel
      const [categoriesResult, menuItemsResult] = await Promise.all([
        menuService.getCategories(restaurantId),
        menuService.getByRestaurantId(restaurantId)
      ]);

      if (categoriesResult.error) {
        Alert.alert(t('error'), 'Failed to load menu categories');
        return;
      }

      if (menuItemsResult.error) {
        Alert.alert(t('error'), 'Failed to load menu items');
        return;
      }

      setCategories(categoriesResult.data || []);
      setMenuItems(menuItemsResult.data || []);
      
      // Set first category as selected if available
      if (categoriesResult.data && categoriesResult.data.length > 0) {
        setSelectedCategory(categoriesResult.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching menu data:', error);
      Alert.alert(t('error'), 'Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  const getLocalizedName = (item: MenuItem | MenuCategory, field: string) => {
    const langField = `${field}_${currentLanguage}` as keyof typeof item;
    const fallbackField = `${field}_en` as keyof typeof item;
    return item[langField] || item[fallbackField] || '';
  };

  const getFilteredMenuItems = () => {
    if (!selectedCategory) return menuItems;
    return menuItems.filter(item => item.category_id === selectedCategory);
  };

  const addToCart = (item: MenuItem, quantity: number = 1) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      ));
    } else {
      const newCartItem: CartItem = {
        id: item.id,
        name: getLocalizedName(item, 'name'),
        price: item.price,
        quantity: quantity,
        description: getLocalizedName(item, 'description'),
      };
      setCart([...cart, newCartItem]);
    }
  };

  const handleItemPress = (item: MenuItem) => {
    setSelectedItem(item);
    setShowItemDetail(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(cart.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert(t('menu.cart_empty'), t('menu.add_items_first'));
      return;
    }
    
    navigation.navigate('CartCheckout', {
      restaurantId,
      cartItems: cart,
      total: getCartTotal(),
    });
  };

  const renderCategoryItem = ({ item }: { item: MenuCategory }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.id && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === item.id && styles.categoryTextActive
      ]}>
        {getLocalizedName(item, 'name')}
      </Text>
    </TouchableOpacity>
  );

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.menuItemContent}>
        {showImages && item.image_url && (
          <Image
            source={{ uri: item.image_url }}
            style={styles.menuItemImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.menuItemInfo}>
          <Text style={styles.menuItemName}>
            {getLocalizedName(item, 'name')}
          </Text>
          <Text style={styles.menuItemDescription}>
            {getLocalizedName(item, 'description')}
          </Text>
          <Text style={styles.menuItemPrice}>
            ¥{item.price.toLocaleString()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addToCart(item)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemPrice}>¥{item.price.toLocaleString()}</Text>
      </View>
      <View style={styles.cartItemControls}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('menu.title')}</Text>
        <TouchableOpacity
          style={styles.imageToggle}
          onPress={() => setShowImages(!showImages)}
        >
          <Text style={styles.imageToggleText}>
            {showImages ? t('menu.hide_image') : t('menu.show_image')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Categories */}
      {categories.length > 0 && (
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
      )}

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        <FlatList
          data={getFilteredMenuItems()}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.menuList}
        />
      </View>

      {/* Cart */}
      {cart.length > 0 && (
        <View style={styles.cartContainer}>
          <View style={styles.cartHeader}>
            <Text style={styles.cartTitle}>
              {t('menu.cart')} ({getCartItemCount()})
            </Text>
            <TouchableOpacity onPress={() => setCart([])}>
              <Text style={styles.clearCartText}>{t('menu.clear_cart')}</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            style={styles.cartList}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={styles.cartFooter}>
            <Text style={styles.cartTotal}>
              {t('menu.total')}: ¥{getCartTotal().toLocaleString()}
            </Text>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutButtonText}>
                {t('menu.checkout')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Menu Item Detail Modal */}
      <MenuItemDetail
        visible={showItemDetail}
        onClose={() => setShowItemDetail(false)}
        onAddToCart={addToCart}
        item={selectedItem}
      />
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  imageToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#667eea',
    borderRadius: 6,
  },
  imageToggleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  categoriesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  categoryButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  menuContainer: {
    flex: 1,
  },
  menuList: {
    padding: 16,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemContent: {
    flexDirection: 'row',
    padding: 16,
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  menuItemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    maxHeight: 300,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  cartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  clearCartText: {
    fontSize: 14,
    color: '#dc3545',
  },
  cartList: {
    maxHeight: 150,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  cartItemInfo: {
    flex: 1,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  cartItemPrice: {
    fontSize: 12,
    color: '#666',
  },
  cartItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  cartFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  cartTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  checkoutButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 