import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../hooks/useLanguage';
import { restaurantService } from '../services/supabase';

interface Restaurant {
  id: string;
  name_en: string;
  name_ja: string;
  address_en: string;
  address_ja: string;
  latitude: number;
  longitude: number;
  cuisine_type: string;
  rating: number;
  is_active: boolean;
}

export const MapListScreen = () => {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list'); // Default to list for web

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const { data, error } = await restaurantService.getAll();
      
      if (error) {
        console.error('Error fetching restaurants:', error);
        Alert.alert(t('error.title'), t('error.fetch_restaurants'));
        return;
      }

      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      Alert.alert(t('error.title'), t('error.fetch_restaurants'));
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantPress = (restaurant: Restaurant) => {
    navigation.navigate('RestaurantDetails' as never, { restaurant } as never);
  };

  const renderRestaurantItem = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      style={styles.restaurantItem}
      onPress={() => handleRestaurantPress(item)}
    >
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>
          {t('language') === 'ja' ? item.name_ja : item.name_en}
        </Text>
        <Text style={styles.restaurantAddress}>
          {t('language') === 'ja' ? item.address_ja : item.address_en}
        </Text>
        <Text style={styles.restaurantCuisine}>{item.cuisine_type}</Text>
        <Text style={styles.restaurantRating}>⭐ {item.rating}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderMapView = () => {
    // Maps functionality removed - show placeholder
    return (
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapPlaceholderText}>
          {t('map.map_not_available')}
        </Text>
        <Text style={styles.mapPlaceholderSubtext}>
          Please use the list view
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>{t('loading.restaurants')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('restaurants.title')}</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'map' && styles.activeToggle]}
            onPress={() => setViewMode('map')}
          >
            <Text style={[styles.toggleText, viewMode === 'map' && styles.activeToggleText]}>
              {t('restaurants.map')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && styles.activeToggle]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.toggleText, viewMode === 'list' && styles.activeToggleText]}>
              {t('restaurants.list')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'map' ? (
        renderMapView()
      ) : (
        <FlatList
          data={restaurants}
          renderItem={renderRestaurantItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#667eea',
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeToggleText: {
    color: '#fff',
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  mapPlaceholderText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  restaurantItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  restaurantAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  restaurantRating: {
    fontSize: 12,
    color: '#ffa000',
    fontWeight: '500',
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
}); 