import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, Users, User, Phone, Mail, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedValue } from '@/utils/localization';

interface Restaurant {
  id: string;
  name: Record<string, string>;
  external_booking_url?: string;
  external_booking_url_en?: string;
  notification_email?: string;
  notification_line_id?: string;
}

interface ReservationFormProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
}

interface ReservationData {
  date: string;
  time: string;
  guests: number;
  name: string;
  contact: string;
  notes: string;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ restaurant, isOpen, onClose }) => {
  const { t, currentLanguage } = useLanguage();
  const [step, setStep] = useState<'form' | 'confirmation'>('form');
  const [formData, setFormData] = useState<ReservationData>({
    date: '',
    time: '',
    guests: 2,
    name: '',
    contact: '',
    notes: ''
  });

  const timeSlots = [
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
  ];

  const guestOptions = Array.from({ length: 10 }, (_, i) => i + 1);

  // Check if restaurant has external booking
  const hasExternalBooking = restaurant.external_booking_url || restaurant.external_booking_url_en;
  const externalUrl = currentLanguage === 'en' && restaurant.external_booking_url_en 
    ? restaurant.external_booking_url_en 
    : restaurant.external_booking_url;

  const handleExternalBooking = () => {
    if (externalUrl) {
      window.open(externalUrl, '_blank');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('confirmation');
  };

  const handleConfirm = async () => {
    try {
      // Save to database
      const { error } = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          ...formData,
          language: currentLanguage
        }),
      });

      if (error) throw error;

      // Send notification (this would be handled by your backend)
      await sendNotification();

      // Reset form and close
      setFormData({
        date: '',
        time: '',
        guests: 2,
        name: '',
        contact: '',
        notes: ''
      });
      setStep('form');
      onClose();
    } catch (err) {
      console.error('Error creating reservation:', err);
    }
  };

  const sendNotification = async () => {
    // This would integrate with your notification system (LINE, email, etc.)
    const notificationData = {
      restaurant_id: restaurant.id,
      restaurant_name: getLocalizedValue(restaurant.name, currentLanguage),
      reservation: formData,
      notification_email: restaurant.notification_email,
      notification_line_id: restaurant.notification_line_id
    };

    // Send to your notification endpoint
    await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });
  };

  const resetForm = () => {
    setFormData({
      date: '',
      time: '',
      guests: 2,
      name: '',
      contact: '',
      notes: ''
    });
    setStep('form');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t('reservation.title')}
          </DialogTitle>
        </DialogHeader>

        {hasExternalBooking ? (
          // External booking flow
          <div className="space-y-4">
            <div className="text-center py-6">
              <h3 className="text-lg font-semibold mb-2">
                {getLocalizedValue(restaurant.name, currentLanguage)}
              </h3>
              <p className="text-gray-600 mb-4">
                {t('reservation.external_message')}
              </p>
              <Button 
                onClick={handleExternalBooking}
                className="w-full bg-navikko-primary hover:bg-navikko-primary/90"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('reservation.external_button')}
              </Button>
            </div>
          </div>
        ) : (
          // Internal booking flow
          <>
            {step === 'form' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="date" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {t('reservation.date')}
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="time" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {t('reservation.time')}
                  </Label>
                  <Select
                    value={formData.time}
                    onValueChange={(value) => setFormData({ ...formData, time: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('reservation.select_time')} />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="guests" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {t('reservation.guests')}
                  </Label>
                  <Select
                    value={formData.guests.toString()}
                    onValueChange={(value) => setFormData({ ...formData, guests: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {guestOptions.map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? t('reservation.guest') : t('reservation.guests')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t('reservation.name')}
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contact" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {t('reservation.contact')}
                  </Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder={t('reservation.contact_placeholder')}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {t('reservation.notes')}
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder={t('reservation.notes_placeholder')}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                    {t('cancel')}
                  </Button>
                  <Button type="submit" className="flex-1 bg-navikko-primary hover:bg-navikko-primary/90">
                    {t('reservation.submit')}
                  </Button>
                </div>
              </form>
            ) : (
              // Confirmation step
              <div className="space-y-4">
                <div className="text-center py-4">
                  <h3 className="text-lg font-semibold mb-2">{t('reservation.confirm_title')}</h3>
                  <p className="text-gray-600">{t('reservation.confirm_message')}</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{getLocalizedValue(restaurant.name, currentLanguage)}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>{t('reservation.date')}:</span>
                      <span>{formData.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('reservation.time')}:</span>
                      <span>{formData.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('reservation.guests')}:</span>
                      <span>{formData.guests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('reservation.name')}:</span>
                      <span>{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('reservation.contact')}:</span>
                      <span>{formData.contact}</span>
                    </div>
                    {formData.notes && (
                      <div className="flex justify-between">
                        <span>{t('reservation.notes')}:</span>
                        <span>{formData.notes}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={resetForm} className="flex-1">
                    {t('reservation.edit')}
                  </Button>
                  <Button onClick={handleConfirm} className="flex-1 bg-navikko-primary hover:bg-navikko-primary/90">
                    {t('reservation.confirm')}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReservationForm; 