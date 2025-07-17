import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSupabaseClient } from '@/lib/supabase';
import { getLocalizedValue } from '@/utils/localization';

interface NearbyRestaurant {
  id: string;
  name: Record<string, string>;
  address: Record<string, string>;
  distance: number;
  cuisine: string;
  rating: number;
  image_url?: string;
}

const NearbyPrompt: React.FC = () => {
  const { coords, error } = useGeolocation();
  const { t, currentLanguage } = useLanguage();
  const [nearbyRestaurants, setNearbyRestaurants] = useState<NearbyRestaurant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchNearbyRestaurants = async () => {
      if (!coords) return;

      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('is_active', true);

        if (error) {
          console.error('Error fetching restaurants:', error);
        } else {
          // Filter restaurants within 5km radius
          const nearby = (data || []).filter(restaurant => {
            if (!restaurant.latitude || !restaurant.longitude) return false;
            
            const distance = calculateDistance(
              coords.latitude,
              coords.longitude,
              restaurant.latitude,
              restaurant.longitude
            );
            
            return distance <= 5; // 5km radius
          });

          setNearbyRestaurants(nearby);
        }
      } catch (error) {
        console.error('Error fetching nearby restaurants:', error);
      }
    };

    fetchNearbyRestaurants();
  }, [coords]);

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

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>Location access denied or not available</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!coords && !error) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Getting your location...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Finding nearby restaurants...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (nearbyRestaurants.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Nearby Restaurants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">No restaurants found within 5km of your location.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Nearby Restaurants
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {nearbyRestaurants.map((restaurant) => (
          <div key={restaurant.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium">
                {getLocalizedValue(restaurant.name, currentLanguage)}
              </h4>
              <p className="text-sm text-gray-600">
                {getLocalizedValue(restaurant.address, currentLanguage)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {restaurant.cuisine}
                </Badge>
                <span className="text-xs text-gray-500">
                  {restaurant.distance.toFixed(1)}km away
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">★ {restaurant.rating}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default NearbyPrompt; 