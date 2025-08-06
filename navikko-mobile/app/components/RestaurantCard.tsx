import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Restaurant {
  id: string;
  name_ja: string;
  name_en: string;
  address_ja: string;
  address_en: string;
  cuisine_type: string;
  distance?: number;
  rating?: number;
  is_open?: boolean;
}

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
  currentLanguage: string;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onPress,
  currentLanguage,
}) => {
  const formatDistance = (distance?: number): string => {
    if (!distance) return '';
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const getLocalizedName = () => {
    return currentLanguage === 'ja' ? restaurant.name_ja : restaurant.name_en;
  };

  const getLocalizedAddress = () => {
    return currentLanguage === 'ja' ? restaurant.address_ja : restaurant.address_en;
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: `https://via.placeholder.com/80x80/667eea/ffffff?text=${getLocalizedName().charAt(0)}` }}
          style={styles.image}
          resizeMode="cover"
        />
        {restaurant.is_open && (
          <View style={styles.openBadge}>
            <Text style={styles.openText}>OPEN</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {getLocalizedName()}
        </Text>
        
        <Text style={styles.cuisine} numberOfLines={1}>
          {restaurant.cuisine_type}
        </Text>
        
        <Text style={styles.address} numberOfLines={2}>
          {getLocalizedAddress()}
        </Text>

        <View style={styles.footer}>
          {restaurant.distance && (
            <View style={styles.distanceContainer}>
              <Ionicons name="location" size={14} color="#666" />
              <Text style={styles.distance}>{formatDistance(restaurant.distance)}</Text>
            </View>
          )}
          
          {restaurant.rating && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.rating}>{restaurant.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.arrow}>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
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
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  openBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  openText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cuisine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  address: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distance: {
    fontSize: 12,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 12,
    color: '#666',
  },
  arrow: {
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 