import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Clock, Star, ArrowLeft, Flame, Leaf, Wheat, X, Maximize2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cuisineLabels } from '@/utils/dictionary';
import { getRestaurantById, type Restaurant, type MenuItem } from '@/utils/restaurantData';
import { getLocalizedValue } from '@/utils/localization';
import ReservationButton from './ReservationButton';
import PlaceholderImage from './PlaceholderImage';
import { isValidUrl } from '@/utils/securityHeaders';

interface RestaurantDetailsProps {
  restaurantId: string;
  onBack: () => void;
}

// Helper function to handle both string and object values
const getLocalized = (field: Record<string, string> | string | null | undefined, lang: string) => {
  if (!field || typeof field !== 'object') return field;
  return getLocalizedValue(field, lang);
};

const RestaurantDetails: React.FC<RestaurantDetailsProps> = ({ restaurantId, onBack }) => {
  const { t, currentLanguage } = useLanguage();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMenuModal, setShowMenuModal] = useState(false);

  useEffect(() => {
    fetchRestaurant();
  }, [restaurantId]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      // Use synchronized data instead of database
      const data = getRestaurantById(restaurantId);
      if (data) {
        setRestaurant(data);
      } else {
        console.error('Restaurant not found:', restaurantId);
      }
    } catch (err) {
      console.error('Error fetching restaurant:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMenu = (url: string) => {
    if (!url) return;
    
    // Convert relative paths to absolute URLs
    let fullUrl = url;
    if (url.startsWith('/')) {
      fullUrl = window.location.origin + url;
    }
    
    // Validate URL before opening
    if (isValidUrl(fullUrl)) {
      window.open(fullUrl, '_blank');
    } else {
      console.warn('Invalid menu URL:', url);
    }
  };

  if (loading) {
    return <div className="text-center py-8">{t('loading')}</div>;
  }

  if (!restaurant) {
    return <div className="text-center py-8">{t('error')}</div>;
  }

  const lang = currentLanguage;
  const name = String(getLocalized(restaurant.name, lang) || 'Restaurant');
  const description = String(getLocalized(restaurant.description, lang) || '');
  const address = String(getLocalized(restaurant.address, lang) || 'Address not available');
  const hours = restaurant.opening_hours || restaurant.openHours || '9:00 - 22:00';
  const phone = restaurant.phone_number || restaurant.phone || 'N/A';

  const getRestaurantImage = () => {
    return restaurant.image_url || restaurant.image || '/AZ inside.jpg';
  };

  const getItemName = (item: MenuItem): string => {
    return String(getLocalized(item.name, lang) || '');
  };

  const getItemDescription = (item: MenuItem): string => {
    return String(getLocalized(item.description, lang) || '');
  };

  return (
    <div className="space-y-6">
      <Button
        onClick={onBack}
        variant="outline"
        className="mb-4 border-navikko-primary text-navikko-primary hover:bg-navikko-primary hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        {t('back')}
      </Button>

      {/* Restaurant Menu - PRIMARY CONTENT */}
      {restaurant.menu && restaurant.menu.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl text-navikko-secondary">
                {name} - {t('menu')}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="text-navikko-secondary font-medium">{restaurant.rating}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {restaurant.menu.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={getItemName(item)} 
                      className="w-20 h-20 object-cover rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <PlaceholderImage 
                      size="md" 
                      alt={getItemName(item)}
                      className="w-20 h-20"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{getItemName(item)}</h3>
                      <span className="font-bold text-lg text-navikko-primary">¥{item.price}</span>
                    </div>
                    {item.description && (
                      <p className="text-gray-600 mb-2">{getItemDescription(item)}</p>
                    )}
                    <div className="flex gap-2">
                      <Badge variant="outline">{item.category}</Badge>
                      {item.spicy && <Badge variant="outline" className="text-red-600"><Flame className="h-3 w-3 mr-1" />Spicy</Badge>}
                      {item.vegetarian && <Badge variant="outline" className="text-green-600"><Leaf className="h-3 w-3 mr-1" />Vegetarian</Badge>}
                      {item.glutenFree && <Badge variant="outline" className="text-blue-600"><Wheat className="h-3 w-3 mr-1" />Gluten Free</Badge>}
                      {!item.available && <Badge variant="outline" className="text-gray-500">Unavailable</Badge>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Original Menu Image (if available) */}
      {restaurant.menuUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-navikko-secondary">
              {t('originalMenu')}
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              Click the image to view in full size
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="relative group">
                <img 
                  src={restaurant.menuUrl} 
                  alt={`${name} Menu`}
                  className="w-full max-w-4xl rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                  style={{ 
                    maxHeight: '80vh',
                    objectFit: 'contain',
                    imageRendering: '-webkit-optimize-contrast'
                  }}
                  onClick={() => setShowMenuModal(true)}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="h-4 w-4" />
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500 mb-2">
                If the menu image is unclear, please contact the restaurant directly.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleOpenMenu(restaurant.menuUrl || '')}
                className="text-navikko-primary border-navikko-primary hover:bg-navikko-primary hover:text-white"
              >
                Open Menu in New Tab
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Menu Modal */}
      {showMenuModal && restaurant.menuUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-2">
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button
                onClick={() => handleOpenMenu(restaurant.menuUrl || '')}
                variant="outline"
                size="sm"
                className="bg-white hover:bg-gray-100"
              >
                Open in New Tab
              </Button>
              <Button
                onClick={() => setShowMenuModal(false)}
                variant="outline"
                size="sm"
                className="bg-white hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <img 
              src={restaurant.menuUrl} 
              alt={`${name} Menu`}
              className="max-w-none max-h-none w-auto h-auto object-contain rounded-lg"
                              style={{
                  imageRendering: '-webkit-optimize-contrast',
                  maxWidth: '95vw',
                  maxHeight: '95vh'
                }}
            />
          </div>
        </div>
      )}

      {/* Reservation Button - SECONDARY ACTION */}
      <Card>
        <CardContent className="pt-6">
          <ReservationButton
            restaurant={restaurant}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Restaurant Information - BACKGROUND INFO AT BOTTOM */}
      <Card className="overflow-hidden">
        <div className="relative h-48">
          <img 
            src={getRestaurantImage()} 
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <div className="absolute top-4 right-4">
            <Badge className="bg-navikko-primary text-white">
              {restaurant.cuisine}
            </Badge>
          </div>
        </div>
        
        <CardHeader>
          <CardTitle className="text-xl text-navikko-secondary">
            {t('about')} {name}
          </CardTitle>
          {description && (
            <CardDescription className="text-base">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-navikko-secondary">
              <MapPin className="h-5 w-5" />
              <span className="truncate">{address}</span>
            </div>
            <div className="flex items-center gap-2 text-navikko-secondary">
              <Clock className="h-5 w-5" />
              <span className="truncate">{hours}</span>
            </div>
            <div className="flex items-center gap-2 text-navikko-secondary">
              <Phone className="h-5 w-5" />
              <span className="truncate">{phone}</span>
            </div>
            <div className="flex items-center gap-2 text-navikko-secondary">
              <span className="font-medium">{restaurant.priceRange}</span>
              <span>• {restaurant.distance}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RestaurantDetails;
