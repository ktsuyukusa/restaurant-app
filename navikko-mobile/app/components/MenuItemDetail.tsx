import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { useLanguage } from '../hooks/useLanguage';

interface MenuItemDetailProps {
  visible: boolean;
  onClose: () => void;
  onAddToCart: (item: any, quantity: number) => void;
  item: any;
}

export const MenuItemDetail: React.FC<MenuItemDetailProps> = ({
  visible,
  onClose,
  onAddToCart,
  item,
}) => {
  const { t, currentLanguage } = useLanguage();
  const [quantity, setQuantity] = useState(1);

  const getLocalizedName = (field: string) => {
    const langField = `${field}_${currentLanguage}` as keyof typeof item;
    const fallbackField = `${field}_en` as keyof typeof item;
    return item[langField] || item[fallbackField] || '';
  };

  const handleAddToCart = () => {
    onAddToCart(item, quantity);
    setQuantity(1);
    onClose();
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (!item) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('menu.item_details')}</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Image */}
          {item.image_url && (
            <Image
              source={{ uri: item.image_url }}
              style={styles.itemImage}
              resizeMode="cover"
            />
          )}

          {/* Item Info */}
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{getLocalizedName('name')}</Text>
            <Text style={styles.itemDescription}>
              {getLocalizedName('description')}
            </Text>
            <Text style={styles.itemPrice}>¥{item.price.toLocaleString()}</Text>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>{t('menu.quantity')}</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={decreaseQuantity}
                disabled={quantity <= 1}
              >
                <Text style={[
                  styles.quantityButtonText,
                  quantity <= 1 && styles.quantityButtonTextDisabled
                ]}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={increaseQuantity}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Total Price */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>{t('menu.total')}</Text>
            <Text style={styles.totalPrice}>
              ¥{(item.price * quantity).toLocaleString()}
            </Text>
          </View>
        </ScrollView>

        {/* Add to Cart Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <Text style={styles.addToCartButtonText}>
              {t('menu.add_to_cart')} ({quantity})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  itemImage: {
    width: '100%',
    height: 200,
  },
  itemInfo: {
    padding: 16,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  quantitySection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f8f9fa',
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityButtonTextDisabled: {
    color: '#ccc',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '500',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f8f9fa',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  addToCartButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 