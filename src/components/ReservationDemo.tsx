import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Phone, Star, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedValue } from '@/utils/localization';
import { azDiningSakuData } from '@/utils/azDiningData';
import ReservationButton from './ReservationButton';

const ReservationDemo: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const [selectedDemo, setSelectedDemo] = useState<'external' | 'internal'>('external');

  // Create demo restaurant data
  const externalBookingRestaurant = {
    ...azDiningSakuData,
    external_booking_url: 'https://www.slow-style.com/restaurants/azdining-saku/',
    external_booking_url_en: 'https://www.slow-style.com/restaurants/azdining-saku/?lang=en',
  };

  const internalBookingRestaurant = {
    ...azDiningSakuData,
    external_booking_url: undefined,
    external_booking_url_en: undefined,
    notification_email: 'reservations@azdining-saku.com',
    notification_line_id: '@azdining_saku',
  };

  const currentRestaurant = selectedDemo === 'external' ? externalBookingRestaurant : internalBookingRestaurant;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-navikko-secondary mb-4">
          Flexible Reservation System Demo
        </h1>
        <p className="text-gray-600 mb-6">
          This demo shows how the reservation system adapts to different restaurant configurations
        </p>
      </div>

      {/* Demo Type Selector */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setSelectedDemo('external')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedDemo === 'external'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          External Booking System
        </button>
        <button
          onClick={() => setSelectedDemo('internal')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedDemo === 'internal'
              ? 'bg-navikko-primary text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Internal Booking Form
        </button>
      </div>

      {/* Restaurant Card */}
      <Card className="overflow-hidden">
        <div className="relative h-64">
          <img
            src={currentRestaurant.images.exterior}
            alt={getLocalizedValue(currentRestaurant.name, currentLanguage)}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4">
            <Badge className="bg-navikko-primary text-white">
              {getLocalizedValue(currentRestaurant.cuisine, currentLanguage)}
            </Badge>
          </div>
          <div className="absolute top-4 left-4">
            <Badge className="bg-green-600 text-white">
              {selectedDemo === 'external' ? 'External Booking' : 'Internal Booking'}
            </Badge>
          </div>
        </div>

        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl text-navikko-secondary">
                {getLocalizedValue(currentRestaurant.name, currentLanguage)}
              </CardTitle>
              <p className="text-gray-600 mt-2">
                {getLocalizedValue(currentRestaurant.description, currentLanguage)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="text-navikko-secondary font-medium">{currentRestaurant.rating}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-navikko-secondary">
              <MapPin className="h-5 w-5" />
              <span>{getLocalizedValue(currentRestaurant.address, currentLanguage)}</span>
            </div>
            <div className="flex items-center gap-2 text-navikko-secondary">
              <Clock className="h-5 w-5" />
              <span>{getLocalizedValue(currentRestaurant.opening_hours, currentLanguage)}</span>
            </div>
            <div className="flex items-center gap-2 text-navikko-secondary">
              <Phone className="h-5 w-5" />
              <span>{currentRestaurant.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-navikko-secondary">
              <span className="font-medium">{getLocalizedValue(currentRestaurant.price_range, currentLanguage)}</span>
            </div>
          </div>

          {/* Booking System Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-navikko-secondary mb-2">
              Booking System Configuration:
            </h4>
            {selectedDemo === 'external' ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-green-600" />
                  <span>External booking URL configured</span>
                </div>
                <div className="text-gray-600">
                  Japanese: {externalBookingRestaurant.external_booking_url}
                </div>
                <div className="text-gray-600">
                  English: {externalBookingRestaurant.external_booking_url_en}
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-navikko-primary rounded-full"></span>
                  <span>Internal booking form enabled</span>
                </div>
                <div className="text-gray-600">
                  Notification Email: {internalBookingRestaurant.notification_email}
                </div>
                <div className="text-gray-600">
                  LINE ID: {internalBookingRestaurant.notification_line_id}
                </div>
              </div>
            )}
          </div>

          {/* Reservation Button */}
          <div className="flex justify-center pt-4">
            <ReservationButton
              restaurant={currentRestaurant}
              size="lg"
              className="px-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* System Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-green-600" />
              External Booking System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              <span>Redirects to restaurant's booking page</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              <span>Supports multiple languages</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              <span>No additional setup required</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              <span>Works with existing booking systems</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-2 h-2 bg-navikko-primary rounded-full"></span>
              Internal Booking Form
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-navikko-primary rounded-full"></span>
              <span>Complete booking form in the app</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-navikko-primary rounded-full"></span>
              <span>Automatic notifications (LINE/Email)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-navikko-primary rounded-full"></span>
              <span>Google Sheets integration</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-navikko-primary rounded-full"></span>
              <span>Multilingual support</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReservationDemo; 