import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../hooks/useLanguage';
import { restaurantService } from '../services/supabase';

interface RestaurantDetailsScreenProps {
  navigation: any;
  route: any;
}

export const RestaurantDetailsScreen: React.FC<RestaurantDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { t, currentLanguage } = useLanguage();
  const { restaurantId } = route.params;
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurantDetails();
  }, [restaurantId]);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await restaurantService.getById(restaurantId);
      
      if (error) {
        Alert.alert(t('common.error'), 'Failed to load restaurant details');
        return;
      }

      setRestaurant(data);
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      Alert.alert(t('common.error'), 'Failed to load restaurant details');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMenu = () => {
    navigation.navigate('Menu', { restaurantId });
  };

  const handleReserveTable = () => {
    navigation.navigate('Reservations', { restaurantId });
  };

  const handleGetDirections = () => {
    // Open maps app with restaurant location
    const url = `https://maps.google.com/?q=${restaurant?.latitude},${restaurant?.longitude}`;
    // In a real app, you would use Linking.openURL(url);
    Alert.alert('Directions', 'This would open the maps app with directions to the restaurant');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>{t('loading')}</Text>
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Restaurant not found</Text>
      </View>
    );
  }

  const getLocalizedName = () => {
    return currentLanguage === 'ja' ? restaurant.name_ja : restaurant.name_en;
  };

  const getLocalizedAddress = () => {
    return currentLanguage === 'ja' ? restaurant.address_ja : restaurant.address_en;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Restaurant Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: `https://via.placeholder.com/400x200/667eea/ffffff?text=${getLocalizedName().charAt(0)}` }}
          style={styles.image}
          resizeMode="cover"
        />
        {restaurant.is_open && (
          <View style={styles.openBadge}>
            <Text style={styles.openText}>{t('open')}</Text>
          </View>
        )}
      </View>

      {/* Restaurant Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{getLocalizedName()}</Text>
        <Text style={styles.cuisine}>{restaurant.cuisine_type}</Text>
        
        <View style={styles.addressContainer}>
          <Ionicons name="location" size={16} color="#666" />
          <Text style={styles.address}>{getLocalizedAddress()}</Text>
        </View>

        {restaurant.phone && (
          <View style={styles.phoneContainer}>
            <Ionicons name="call" size={16} color="#666" />
            <Text style={styles.phone}>{restaurant.phone}</Text>
          </View>
        )}

        {restaurant.description && (
          <Text style={styles.description}>{restaurant.description}</Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleViewMenu}>
          <Ionicons name="restaurant" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>{t('viewMenu')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleReserveTable}>
          <Ionicons name="calendar" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>{t('reserve')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleGetDirections}>
          <Ionicons name="navigate" size={24} color="#fff" />
          <Text style={styles.actionButtonText}>Directions</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
  },
  openBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  openText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cuisine: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  phone: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actionsContainer: {
    padding: 20,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
}); 