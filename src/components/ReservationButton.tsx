import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedValue } from '@/utils/localization';
import ReservationForm from './ReservationForm';

interface Restaurant {
  id: string;
  name: Record<string, string>;
  external_booking_url?: string;
  external_booking_url_en?: string;
  notification_email?: string;
  notification_line_id?: string;
}

interface ReservationButtonProps {
  restaurant: Restaurant;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

const ReservationButton: React.FC<ReservationButtonProps> = ({ 
  restaurant, 
  variant = 'default',
  size = 'default',
  className = ''
}) => {
  const { t, currentLanguage } = useLanguage();
  const [isReservationOpen, setIsReservationOpen] = useState(false);

  // Check if restaurant has external booking
  const hasExternalBooking = restaurant.external_booking_url || restaurant.external_booking_url_en;
  const externalUrl = currentLanguage === 'en' && restaurant.external_booking_url_en 
    ? restaurant.external_booking_url_en 
    : restaurant.external_booking_url;

  const handleReservationClick = () => {
    if (hasExternalBooking && externalUrl) {
      // Open external booking URL
      window.open(externalUrl, '_blank');
    } else {
      // Open internal reservation form
      setIsReservationOpen(true);
    }
  };

  return (
    <>
      <Button
        onClick={handleReservationClick}
        variant={variant}
        size={size}
        className={`${hasExternalBooking ? 'bg-green-600 hover:bg-green-700' : 'bg-navikko-primary hover:bg-navikko-primary/90'} ${className}`}
      >
        <>
          <Calendar className="h-4 w-4 mr-2" />
          {t('reserve') || 'Reserve Table'}
        </>
      </Button>

      {/* Internal reservation form */}
      {!hasExternalBooking && (
        <ReservationForm
          restaurant={restaurant}
          isOpen={isReservationOpen}
          onClose={() => setIsReservationOpen(false)}
        />
      )}
    </>
  );
};

export default ReservationButton; 