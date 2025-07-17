import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Phone, Clock, Star, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedValue } from '@/utils/localization';
import { type RestaurantWithDistance } from '@/hooks/useDistanceCalculation';

interface RestaurantMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurants: RestaurantWithDistance[];
  userLocation?: { lat: number; lng: number } | null;
}

const RestaurantMapModal: React.FC<RestaurantMapModalProps> = ({
  isOpen,
  onClose,
  restaurants,
  userLocation
}) => {
  const { t, currentLanguage } = useLanguage();

  // Calculate map bounds to include all restaurants and user location
  const calculateMapBounds = () => {
    const lats = restaurants.map(r => r.latitude).filter(Boolean) as number[];
    const lngs = restaurants.map(r => r.longitude).filter(Boolean) as number[];
    
    if (userLocation) {
      lats.push(userLocation.lat);
      lngs.push(userLocation.lng);
    }

    if (lats.length === 0 || lngs.length === 0) {
      // Default to Saku, Nagano if no coordinates
      return {
        minLat: 36.248,
        maxLat: 36.248,
        minLng: 138.248,
        maxLng: 138.248
      };
    }

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Add some padding
    const latPadding = (maxLat - minLat) * 0.1;
    const lngPadding = (maxLng - minLng) * 0.1;

    return {
      minLat: minLat - latPadding,
      maxLat: maxLat + latPadding,
      minLng: minLng - lngPadding,
      maxLng: maxLng + lngPadding
    };
  };

  const bounds = calculateMapBounds();
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bounds.minLng},${bounds.minLat},${bounds.maxLng},${bounds.maxLat}&layer=mapnik&marker=${userLocation?.lat || bounds.minLat},${userLocation?.lng || bounds.minLng}`;

  const openInGoogleMaps = (restaurant: RestaurantWithDistance) => {
    if (restaurant.latitude && restaurant.longitude) {
      const address = getLocalizedValue(restaurant.address, currentLanguage) || '';
      const name = getLocalizedValue(restaurant.name, currentLanguage) || '';
      const query = encodeURIComponent(`${name}, ${address}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  const getDirections = (restaurant: RestaurantWithDistance) => {
    if (restaurant.latitude && restaurant.longitude && userLocation) {
      const query = encodeURIComponent(`${restaurant.latitude},${restaurant.longitude}`);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
    } else {
      const address = getLocalizedValue(restaurant.address, currentLanguage) || '';
      const name = getLocalizedValue(restaurant.name, currentLanguage) || '';
      const query = encodeURIComponent(`${name}, ${address}`);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t('search.nearby')} ({restaurants.length})
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[70vh]">
          {/* Map */}
          <div className="relative">
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: '8px' }}
              loading="lazy"
              title="Restaurant Map"
            />
            {userLocation && (
              <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded text-xs shadow">
                📍 Your location
              </div>
            )}
          </div>

          {/* Restaurant List */}
          <div className="overflow-y-auto space-y-3 pr-2">
            {restaurants.map((restaurant) => {
              const name = getLocalizedValue(restaurant.name, currentLanguage) || 'Restaurant';
              const address = getLocalizedValue(restaurant.address, currentLanguage) || '';
              const hours = restaurant.opening_hours || restaurant.openHours || '9:00 - 22:00';
              const phone = restaurant.phone_number || restaurant.phone || 'N/A';

              return (
                <Card key={restaurant.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-navikko-secondary">{name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{restaurant.rating}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-navikko-primary" />
                        <span className="flex-1">{address}</span>
                        <span className="text-navikko-action font-medium">{restaurant.distance}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-navikko-primary" />
                        <span>{hours}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-navikko-primary" />
                        <span>{phone}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button
                        onClick={() => getDirections(restaurant)}
                        size="sm"
                        className="flex-1 bg-navikko-primary hover:bg-navikko-primary/90 text-white"
                      >
                        Directions
                      </Button>
                      <Button
                        onClick={() => openInGoogleMaps(restaurant)}
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        View on Map
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantMapModal; 