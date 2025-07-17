import { useState, useEffect } from 'react';
import { useGeolocation } from './useGeolocation';

export interface RestaurantWithDistance {
  id: string;
  name: Record<string, string>;
  description?: Record<string, string>;
  address?: Record<string, string>;
  cuisine: string;
  rating: number;
  priceRange: string;
  distance: string;
  calculatedDistance?: number; // Distance in km from user location
  image: string;
  openHours: string;
  phone: string;
  isOpen: boolean;
  latitude?: number;
  longitude?: number;
  location?: string;
  image_url?: string;
  opening_hours?: string;
  phone_number?: string;
  external_booking_url?: string;
  external_booking_url_en?: string;
  notification_email?: string;
  notification_line_id?: string;
  menuUrl?: string;
}

export const useDistanceCalculation = (restaurants: RestaurantWithDistance[]) => {
  const { coords } = useGeolocation();
  const [restaurantsWithDistance, setRestaurantsWithDistance] = useState<RestaurantWithDistance[]>([]);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Format distance for display
  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else if (distance < 10) {
      return `${distance.toFixed(1)}km`;
    } else {
      return `${Math.round(distance)}km`;
    }
  };

  useEffect(() => {
    if (coords && restaurants.length > 0) {
      const restaurantsWithCalculatedDistance = restaurants.map(restaurant => {
        let calculatedDistance: number | undefined;
        let displayDistance = restaurant.distance; // Fallback to original distance

        // If restaurant has coordinates, calculate actual distance
        if (restaurant.latitude && restaurant.longitude) {
          calculatedDistance = calculateDistance(
            coords.latitude,
            coords.longitude,
            restaurant.latitude,
            restaurant.longitude
          );
          displayDistance = formatDistance(calculatedDistance);
        }

        return {
          ...restaurant,
          calculatedDistance,
          distance: displayDistance
        };
      });

      setRestaurantsWithDistance(restaurantsWithCalculatedDistance);
    } else {
      // If no location available, use original distances
      setRestaurantsWithDistance(restaurants);
    }
  }, [coords, restaurants]);

  return {
    restaurantsWithDistance,
    userLocation: coords ? { lat: coords.latitude, lng: coords.longitude } : null,
    hasLocation: !!coords
  };
}; 