import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-2 border-navikko-primary/20 bg-white">
      <div className="relative">
        {imageError ? (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                <span className="text-white text-lg">🍽️</span>
              </div>
              <p className="text-sm text-gray-500">{name}</p>
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
          className={`absolute top-2 left-2 ${
            restaurant.isOpen
              ? 'bg-navikko-primary text-white'
              : 'bg-gray-500 text-white'
          }`}
        >
          {restaurant.isOpen ? t('open') : t('closed')}
        </Badge>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-navikko-secondary line-clamp-1">
            {name}
          </h3>
          <div className="flex items-center gap-1 text-navikko-accent">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm font-medium">{restaurant.rating}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-navikko-secondary">
          <span className="bg-navikko-primary/10 px-2 py-1 rounded text-navikko-primary font-medium">
            {restaurant.cuisine}
          </span>
          <span className="text-navikko-action font-medium">{restaurant.priceRange}</span>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {description}
          </p>
        )}
        
        <div className="space-y-2 text-sm text-navikko-secondary">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-navikko-primary" />
            <span className="truncate">{address}</span>
            <span className="text-navikko-action">• {restaurant.distance}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-navikko-primary" />
            <span className="truncate">{hours}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-navikko-primary" />
            <span className="truncate">{phone}</span>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button
            onClick={() => onViewDetails(restaurant.id)}
            className="flex-1 bg-navikko-primary hover:bg-navikko-primary/90 text-white"
            size="sm"
          >
            {t('viewMenu')}
          </Button>
          <RestaurantOrderButton
            restaurant={restaurant}
            variant="outline"
            size="sm"
            className="flex-1"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantCard;