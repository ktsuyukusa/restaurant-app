import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedValue } from '@/utils/localization';
import { type Restaurant } from '@/utils/restaurantData';
import RestaurantOrderButton from './RestaurantOrderButton';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onViewDetails: (id: string) => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onViewDetails }) => {
  const { t, currentLanguage } = useLanguage();
  const [imageError, setImageError] = useState(false);

  const name = getLocalizedValue(restaurant.name, currentLanguage) || 'Restaurant';
  const description = getLocalizedValue(restaurant.description, currentLanguage) || '';
  const address = getLocalizedValue(restaurant.address, currentLanguage) || 'Address not available';
  const hours = restaurant.opening_hours || restaurant.openHours || '9:00 - 22:00';
  const phone = restaurant.phone_number || restaurant.phone || 'N/A';
  const imageUrl = restaurant.image_url || restaurant.image || '/AZ inside.jpg';

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white rounded-xl">
      <div className="relative">
        {imageError ? (
          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-gray-600 text-2xl">🍽️</span>
              </div>
              <p className="text-sm text-gray-500 font-medium">{name}</p>
            </div>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-48 object-cover"
            onError={handleImageError}
          />
        )}
        <Badge
          className={`absolute top-3 left-3 px-2 py-1 text-xs font-medium ${
            restaurant.isOpen
              ? 'bg-green-500 text-white'
              : 'bg-gray-500 text-white'
          }`}
        >
          {restaurant.isOpen ? t('open') : t('closed')}
        </Badge>
      </div>
      
      <CardContent className="p-5">
        <div className="space-y-3">
          {/* Header with name and rating */}
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
              {name}
            </h3>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="text-sm font-semibold">{restaurant.rating}</span>
            </div>
          </div>
          
          {/* Cuisine and price */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">
              {restaurant.cuisine}
            </span>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm font-semibold text-gray-700">{restaurant.priceRange}</span>
          </div>
          
          {/* Description */}
          {description && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
          
          {/* Details */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="truncate block">{address}</span>
                <span className="text-gray-500 text-xs">• {restaurant.distance}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>{hours}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>{phone}</span>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => onViewDetails(restaurant.id)}
              className="flex-1 bg-navikko-primary hover:bg-navikko-primary/90 text-white font-medium rounded-lg"
              size="sm"
            >
              {t('viewMenu')}
            </Button>
            <RestaurantOrderButton
              restaurant={restaurant}
              variant="outline"
              size="sm"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantCard;