import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/components/ui/use-toast';
import { getSupabaseClient } from '@/lib/supabase';

interface Restaurant {
  id?: string;
  name: string;
  name_en?: string;
  name_ja?: string;
  name_romaji?: string;
  name_zh?: string;
  name_ko?: string;
  address: string;
  address_en?: string;
  address_ja?: string;
  address_romaji?: string;
  address_zh?: string;
  address_ko?: string;
  phone: string;
  cuisine: string;
  description?: string;
  description_en?: string;
  description_ja?: string;
  description_romaji?: string;
  description_zh?: string;
  description_ko?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  price_range?: string;
  is_active?: boolean;
  image_url?: string;
  opening_hours?: string;
  phone_number?: string;
  external_booking_url?: string;
  external_booking_url_en?: string;
  notification_email?: string;
  notification_line_id?: string;
  komoju_merchant_id?: string;
  payjp_merchant_id?: string;
  menu_url?: string;
  created_at?: string;
  updated_at?: string;
}

const RestaurantManagement: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  
  // Helper function to get language display name
  const getLanguageDisplayName = (langCode: string): string => {
    const languageNames: Record<string, string> = {
      'ja': 'Japanese',
      'zh': 'Chinese (uses Japanese data)',
      'ko': 'Korean',
      'pl': 'Polish',
      'ms': 'Malay',
      'id': 'Indonesian',
      'vi': 'Vietnamese',
      'th': 'Thai',
      'es': 'Spanish',
      'ro': 'Romanian'
    };
    return languageNames[langCode] || langCode.toUpperCase();
  };

  // Determine which secondary language to show (if any)
  // Default is Japanese, secondary is English or current system language
  const getSecondaryLanguage = () => {
    if (currentLanguage === 'ja') return 'en'; // Show English as secondary for Japanese users
    if (currentLanguage === 'zh') return 'ja'; // Chinese uses Japanese data
    return 'en'; // All other languages use English as secondary
  };

  const secondaryLang = getSecondaryLanguage();
  const primaryLang = currentLanguage === 'zh' ? 'ja' : 'ja'; // Japanese is always primary
  const showEnglish = currentLanguage !== 'ja'; // Show English when not Japanese
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Restaurant>>({
    name: '',
    name_en: '',
    name_ja: '',
    name_romaji: '',
    name_zh: '',
    name_ko: '',
    address: '',
    address_en: '',
    address_ja: '',
    address_romaji: '',
    address_zh: '',
    address_ko: '',
    description: '',
    description_en: '',
    description_ja: '',
    description_romaji: '',
    description_zh: '',
    description_ko: '',
    phone: '',
    cuisine: '',
    rating: 0,
    price_range: '$',
    latitude: 0,
    longitude: 0,
    is_active: true,
    image_url: '',
    opening_hours: '',
    external_booking_url: '',
    notification_email: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const restaurantTypes = ['Japanese', 'Italian', 'Chinese', 'Korean', 'French', 'Thai', 'Indian', 'American', 'Cafe', 'Izakaya'];

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching restaurants:', error);
        } else {
          setRestaurants(data || []);
        }
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();
      
      if (editingId) {
        const { error } = await supabase
          .from('restaurants')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('restaurants')
          .insert([formData]);

        if (error) throw error;
      }

      // Refresh the list
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
      
      setFormData({});
      setEditingId(null);
    } catch (error) {
      console.error('Error saving restaurant:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (restaurant: Restaurant) => {
    setFormData(restaurant);
    setEditingId(restaurant.id);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('confirm.delete'))) {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('restaurants')
          .delete()
          .eq('id', id);

        if (error) throw error;

        // Refresh the list
        const { data, error: fetchError } = await supabase
          .from('restaurants')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setRestaurants(data || []);
      } catch (error) {
        console.error('Error deleting restaurant:', error);
      }
    }
  };

  if (loading) return <div className="p-8 text-center">{t('loading')}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('restaurant_management')}</h1>
        <Button onClick={() => { setFormData({}); setEditingId(null); }}>
          <Plus className="h-4 w-4 mr-2" />
          {t('restaurant.add')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? t('restaurant.edit') : t('restaurant.add')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Restaurant Names (Japanese Primary) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('restaurant.names')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="name_ja">{t('restaurant.name_japanese')} *</Label>
                  <Input
                    id="name_ja"
                    value={formData.name_ja || ''}
                    onChange={(e) => {
                      const updates: Partial<Restaurant> = {
                        name_ja: e.target.value,
                        name: e.target.value
                      };
                      // If Chinese is current language, also update Chinese field
                      if (currentLanguage === 'zh') {
                        updates.name_zh = e.target.value;
                      }
                      setFormData({...formData, ...updates});
                    }}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name_romaji">{t('restaurant.name_romaji')} *</Label>
                  <Input
                    id="name_romaji"
                    value={formData.name_romaji || ''}
                    onChange={(e) => setFormData({...formData, name_romaji: e.target.value})}
                    placeholder="Romaji/English transliteration"
                    required
                  />
                </div>
                {showEnglish && (
                  <div>
                    <Label htmlFor="name_en">{t('restaurant.name_english')}</Label>
                    <Input
                      id="name_en"
                      value={formData.name_en || ''}
                      onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="cuisine">{t('restaurant.cuisine_type')}</Label>
              <Select value={formData.cuisine || ''} onValueChange={(value) => setFormData({...formData, cuisine: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={t('restaurant.select_cuisine')} />
                </SelectTrigger>
                <SelectContent>
                  {restaurantTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Addresses (Japanese Primary) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('restaurant.addresses')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="address_ja">{t('restaurant.address_japanese')} *</Label>
                  <Input
                    id="address_ja"
                    value={formData.address_ja || ''}
                    onChange={(e) => {
                      const updates: Partial<Restaurant> = {
                        address_ja: e.target.value,
                        address: e.target.value
                      };
                      // If Chinese is current language, also update Chinese field
                      if (currentLanguage === 'zh') {
                        updates.address_zh = e.target.value;
                      }
                      setFormData({...formData, ...updates});
                    }}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="address_romaji">{t('restaurant.address_romaji')} *</Label>
                  <Input
                    id="address_romaji"
                    value={formData.address_romaji || ''}
                    onChange={(e) => setFormData({...formData, address_romaji: e.target.value})}
                    placeholder="Romaji/English transliteration"
                    required
                  />
                </div>
                {showEnglish && (
                  <div>
                    <Label htmlFor="address_en">{t('restaurant.address_english')}</Label>
                    <Input
                      id="address_en"
                      value={formData.address_en || ''}
                      onChange={(e) => setFormData({...formData, address_en: e.target.value})}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="phone">{t('restaurant.phone_number')}</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
            
            {/* Descriptions (Japanese Primary) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('restaurant.descriptions')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="description_ja">{t('restaurant.description_japanese')}</Label>
                  <Textarea
                    id="description_ja"
                    value={formData.description_ja || ''}
                    onChange={(e) => {
                      const updates: Partial<Restaurant> = {
                        description_ja: e.target.value,
                        description: e.target.value
                      };
                      // If Chinese is current language, also update Chinese field
                      if (currentLanguage === 'zh') {
                        updates.description_zh = e.target.value;
                      }
                      setFormData({...formData, ...updates});
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="description_romaji">{t('restaurant.description_romaji')}</Label>
                  <Textarea
                    id="description_romaji"
                    value={formData.description_romaji || ''}
                    onChange={(e) => setFormData({...formData, description_romaji: e.target.value})}
                    placeholder="Romaji/English transliteration"
                  />
                </div>
                {showEnglish && (
                  <div>
                    <Label htmlFor="description_en">{t('restaurant.description_english')}</Label>
                    <Textarea
                      id="description_en"
                      value={formData.description_en || ''}
                      onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="image_url">{t('restaurant.image_url')}</Label>
                <Input
                  id="image_url"
                  value={formData.image_url || ''}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="opening_hours">{t('restaurant.opening_hours')}</Label>
                <Input
                  id="opening_hours"
                  value={formData.opening_hours || ''}
                  onChange={(e) => setFormData({...formData, opening_hours: e.target.value})}
                  placeholder={t('restaurant.opening_hours_placeholder')}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rating">{t('restaurant.rating')}</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating || ''}
                  onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="price_range">{t('restaurant.price_range')}</Label>
                <Select value={formData.price_range || '$'} onValueChange={(value) => setFormData({...formData, price_range: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$">{t('restaurant.price_budget')}</SelectItem>
                    <SelectItem value="$$">{t('restaurant.price_moderate')}</SelectItem>
                    <SelectItem value="$$$">{t('restaurant.price_expensive')}</SelectItem>
                    <SelectItem value="$$$$">{t('restaurant.price_very_expensive')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">{t('restaurant.latitude')}</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  value={formData.latitude || ''}
                  onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="longitude">{t('restaurant.longitude')}</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="0.000001"
                  value={formData.longitude || ''}
                  onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="external_booking_url">{t('restaurant.external_booking_url')}</Label>
                <Input
                  id="external_booking_url"
                  value={formData.external_booking_url || ''}
                  onChange={(e) => setFormData({...formData, external_booking_url: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="notification_email">{t('restaurant.notification_email')}</Label>
                <Input
                  id="notification_email"
                  type="email"
                  value={formData.notification_email || ''}
                  onChange={(e) => setFormData({...formData, notification_email: e.target.value})}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active !== false}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label htmlFor="is_active">{t('restaurant.active_restaurant')}</Label>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit">{editingId ? t('button.update') : t('button.create')}</Button>
              <Button type="button" variant="outline" onClick={() => { setFormData({}); setEditingId(null); }}>{t('button.cancel')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {restaurants.map((restaurant) => (
          <Card key={restaurant.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">{restaurant.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{restaurant.description}</p>
                  <div className="mt-2 text-sm space-y-1">
                    <p><strong>{t('restaurant.cuisine')}:</strong> {restaurant.cuisine}</p>
                    <p><strong>{t('address')}:</strong> {restaurant.address}</p>
                    <p><strong>{t('phone')}:</strong> {restaurant.phone}</p>
                    <p><strong>{t('restaurant.rating')}:</strong> {restaurant.rating || t('n/a')}</p>
                    <p><strong>{t('restaurant.price_range')}:</strong> {restaurant.price_range || t('n/a')}</p>
                    <p><strong>{t('restaurant.status')}:</strong> {restaurant.is_active ? t('restaurant.active') : t('restaurant.inactive')}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => window.location.href = `/restaurant/${restaurant.id}/dashboard`}
                    className="bg-navikko-primary hover:bg-navikko-primary/90"
                  >
                    {t('restaurant.manage')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(restaurant)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(restaurant.id!)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RestaurantManagement;