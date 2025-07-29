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
  name_zh?: string;
  name_ko?: string;
  address: string;
  address_en?: string;
  address_ja?: string;
  address_zh?: string;
  address_ko?: string;
  phone: string;
  cuisine: string;
  description?: string;
  description_en?: string;
  description_ja?: string;
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
  const getSecondaryLanguage = () => {
    if (currentLanguage === 'en') return null;
    if (currentLanguage === 'zh') return 'ja'; // Chinese uses Japanese data
    return currentLanguage;
  };

  const secondaryLang = getSecondaryLanguage();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Restaurant>>({
    name: '',
    name_en: '',
    name_ja: '',
    name_zh: '',
    name_ko: '',
    address: '',
    address_en: '',
    address_ja: '',
    address_zh: '',
    address_ko: '',
    description: '',
    description_en: '',
    description_ja: '',
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

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('nav.restaurants')} Management</h1>
        <Button onClick={() => { setFormData({}); setEditingId(null); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Restaurant
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit' : 'Add'} Restaurant</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Restaurant Names (Simplified Language Selection) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Restaurant Names</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_en">Name (English) *</Label>
                  <Input
                    id="name_en"
                    value={formData.name_en || ''}
                    onChange={(e) => setFormData({...formData, name_en: e.target.value, name: e.target.value})}
                    required
                  />
                </div>
                {secondaryLang && (
                  <div>
                    <Label htmlFor={`name_${secondaryLang}`}>
                      Name ({getLanguageDisplayName(secondaryLang)})
                    </Label>
                    <Input
                      id={`name_${secondaryLang}`}
                      value={formData[`name_${secondaryLang}` as keyof Restaurant] as string || ''}
                      onChange={(e) => {
                        const updates: Partial<Restaurant> = { [`name_${secondaryLang}`]: e.target.value } as Partial<Restaurant>;
                        // If Chinese is selected, also update Chinese field with Japanese data
                        if (currentLanguage === 'zh' && secondaryLang === 'ja') {
                          updates.name_zh = e.target.value;
                        }
                        setFormData({...formData, ...updates});
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="cuisine">Cuisine Type</Label>
              <Select value={formData.cuisine || ''} onValueChange={(value) => setFormData({...formData, cuisine: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cuisine type" />
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
            
            {/* Addresses (Simplified Language Selection) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Addresses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="address_en">Address (English) *</Label>
                  <Input
                    id="address_en"
                    value={formData.address_en || ''}
                    onChange={(e) => setFormData({...formData, address_en: e.target.value, address: e.target.value})}
                    required
                  />
                </div>
                {secondaryLang && (
                  <div>
                    <Label htmlFor={`address_${secondaryLang}`}>
                      Address ({getLanguageDisplayName(secondaryLang)})
                    </Label>
                    <Input
                      id={`address_${secondaryLang}`}
                      value={formData[`address_${secondaryLang}` as keyof Restaurant] as string || ''}
                      onChange={(e) => {
                        const updates: Partial<Restaurant> = { [`address_${secondaryLang}`]: e.target.value } as Partial<Restaurant>;
                        // If Chinese is selected, also update Chinese field with Japanese data
                        if (currentLanguage === 'zh' && secondaryLang === 'ja') {
                          updates.address_zh = e.target.value;
                        }
                        setFormData({...formData, ...updates});
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
            
            {/* Descriptions (Simplified Language Selection) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Descriptions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description_en">Description (English)</Label>
                  <Textarea
                    id="description_en"
                    value={formData.description_en || ''}
                    onChange={(e) => setFormData({...formData, description_en: e.target.value, description: e.target.value})}
                  />
                </div>
                {secondaryLang && (
                  <div>
                    <Label htmlFor={`description_${secondaryLang}`}>
                      Description ({getLanguageDisplayName(secondaryLang)})
                    </Label>
                    <Textarea
                      id={`description_${secondaryLang}`}
                      value={formData[`description_${secondaryLang}` as keyof Restaurant] as string || ''}
                      onChange={(e) => {
                        const updates: Partial<Restaurant> = { [`description_${secondaryLang}`]: e.target.value } as Partial<Restaurant>;
                        // If Chinese is selected, also update Chinese field with Japanese data
                        if (currentLanguage === 'zh' && secondaryLang === 'ja') {
                          updates.description_zh = e.target.value;
                        }
                        setFormData({...formData, ...updates});
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url || ''}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="opening_hours">Opening Hours</Label>
                <Input
                  id="opening_hours"
                  value={formData.opening_hours || ''}
                  onChange={(e) => setFormData({...formData, opening_hours: e.target.value})}
                  placeholder="e.g., 11:00 - 22:00"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rating">Rating</Label>
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
                <Label htmlFor="price_range">Price Range</Label>
                <Select value={formData.price_range || '$'} onValueChange={(value) => setFormData({...formData, price_range: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="$">$ (Budget)</SelectItem>
                    <SelectItem value="$$">$$ (Moderate)</SelectItem>
                    <SelectItem value="$$$">$$$ (Expensive)</SelectItem>
                    <SelectItem value="$$$$">$$$$ (Very Expensive)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="0.000001"
                  value={formData.latitude || ''}
                  onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
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
                <Label htmlFor="external_booking_url">External Booking URL</Label>
                <Input
                  id="external_booking_url"
                  value={formData.external_booking_url || ''}
                  onChange={(e) => setFormData({...formData, external_booking_url: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="notification_email">Notification Email</Label>
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
              <Label htmlFor="is_active">Active Restaurant</Label>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
              <Button type="button" variant="outline" onClick={() => { setFormData({}); setEditingId(null); }}>Cancel</Button>
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
                    <p><strong>Cuisine:</strong> {restaurant.cuisine}</p>
                    <p><strong>Address:</strong> {restaurant.address}</p>
                    <p><strong>Phone:</strong> {restaurant.phone}</p>
                    <p><strong>Rating:</strong> {restaurant.rating || 'N/A'}</p>
                    <p><strong>Price Range:</strong> {restaurant.price_range || 'N/A'}</p>
                    <p><strong>Status:</strong> {restaurant.is_active ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => window.location.href = `/restaurant/${restaurant.id}/dashboard`}
                    className="bg-navikko-primary hover:bg-navikko-primary/90"
                  >
                    Manage
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