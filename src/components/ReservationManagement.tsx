import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Calendar, Clock, Users, MapPin, Phone, Mail, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSupabaseClient } from '@/lib/supabase';
import { getLocalizedValue } from '@/utils/localization';

interface Reservation {
  id: string;
  restaurant_id: string;
  name: string;
  date: string;
  comment: string;
  status: string;
  restaurant: {
    name: string;
    address: string;
    phone: string;
  };
  user: {
    name: string;
    email: string;
    phone: string;
  };
}

interface Restaurant {
  id: string;
  name_ja: string;
  name_en: string;
  name_json?: any;
}

// Fixed getLocalized helper function
const getLocalized = (field: any, lang: string) => {
  if (!field || typeof field !== 'object') return field;
  const fallbackLang = 'en';
  return field[lang] || field[fallbackLang] || Object.values(field)[0] || '';
};

const ReservationManagement: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [formData, setFormData] = useState({
    restaurant_id: '',
    name: '',
    date: '',
    comment: ''
  });

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('reservations')
          .select(`
            *,
            restaurants(name, address, phone),
            users(name, email, phone)
          `)
          .order('reservation_date', { ascending: true })
          .order('reservation_time', { ascending: true });

        if (error) {
          console.error('Error fetching reservations:', error);
        } else {
          setReservations(data || []);
        }
      } catch (error) {
        console.error('Error fetching reservations:', error);
      }
    };

    fetchReservations();
  }, []);

  const fetchRestaurants = async () => {
    const { data, error } = await getSupabaseClient()
      .from('restaurants')
      .select('id, name_ja, name_en, name_json')
      .order('name_en');
    
    if (error) {
      console.error('Error fetching restaurants:', error);
    } else {
      setRestaurants(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingReservation) {
      const { error } = await getSupabaseClient()
        .from('reservations')
        .update(formData)
        .eq('id', editingReservation.id);
      
      if (error) {
        console.error('Error updating reservation:', error);
      } else {
        fetchReservations();
        resetForm();
      }
    } else {
      const { error } = await getSupabaseClient()
        .from('reservations')
        .insert([formData]);
      
      if (error) {
        console.error('Error creating reservation:', error);
      } else {
        fetchReservations();
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setFormData({
      restaurant_id: '',
      name: '',
      date: '',
      comment: ''
    });
    setEditingReservation(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setFormData({
      restaurant_id: reservation.restaurant_id,
      name: reservation.name,
      date: reservation.date.slice(0, 16),
      comment: reservation.comment
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('confirm.delete'))) {
      const { error } = await getSupabaseClient()
        .from('reservations')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting reservation:', error);
      } else {
        fetchReservations();
      }
    }
  };

  const getRestaurantName = (restaurantId: string) => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (!restaurant) return '';
    
    // Try JSON field first (new format)
    if (restaurant.name_json) {
      return getLocalized(restaurant.name_json, currentLanguage);
    }
    
    // Fallback to specific language fields
    return currentLanguage === 'ja' ? restaurant.name_ja : restaurant.name_en;
  };

  const formatDate = (dateString: string) => {
    const locale = currentLanguage === 'ja' ? 'ja-JP' : 'en-US';
    return new Date(dateString).toLocaleString(locale);
  };

  const updateReservationStatus = async (id: string, status: string) => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Error updating reservation:', error);
      } else {
        // Refresh the list
        const updatedReservations = reservations.map(reservation =>
          reservation.id === id ? { ...reservation, status } : reservation
        );
        setReservations(updatedReservations);
      }
    } catch (error) {
      console.error('Error updating reservation:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('nav.reservations')}</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              {t('button.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingReservation ? t('button.edit') : t('button.add')} {t('reservation')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="restaurant_id">{t('form.restaurant')}</Label>
                <Select
                  value={formData.restaurant_id}
                  onValueChange={(value) => setFormData({ ...formData, restaurant_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('form.selectRestaurant')} />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        {getRestaurantName(restaurant.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">{t('reservation.name')}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">{t('reservation.date')}</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="comment">{t('reservation.notes')}</Label>
                <Textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  {t('button.cancel')}
                </Button>
                <Button type="submit" className="flex-1">
                  {editingReservation ? t('button.update') : t('button.create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {reservations.map((reservation) => (
          <Card key={reservation.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {reservation.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {getRestaurantName(reservation.restaurant_id)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(reservation)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(reservation.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">{t('reservation.date')}: </span>
                  {formatDate(reservation.date)}
                </div>
                {reservation.comment && (
                  <div>
                    <span className="font-medium">{t('reservation.notes')}: </span>
                    {reservation.comment}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReservationManagement;