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
  id: string;
  name_ja: string;
  name_en: string;
  description_ja: string;
  photo: string;
  location: string;
  line_url: string;
  reservation_ok: boolean;
  type: string;
}

const RestaurantManagement: React.FC = () => {
  const { t } = useLanguage();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Restaurant>>({});
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name_ja">Japanese Name</Label>
                <Input
                  id="name_ja"
                  value={formData.name_ja || ''}
                  onChange={(e) => setFormData({...formData, name_ja: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="name_en">English Name</Label>
                <Input
                  id="name_en"
                  value={formData.name_en || ''}
                  onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description_ja">Description (Japanese)</Label>
              <Textarea
                id="description_ja"
                value={formData.description_ja || ''}
                onChange={(e) => setFormData({...formData, description_ja: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="photo">Photo URL</Label>
                <Input
                  id="photo"
                  value={formData.photo || ''}
                  onChange={(e) => setFormData({...formData, photo: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="line_url">LINE URL</Label>
                <Input
                  id="line_url"
                  value={formData.line_url || ''}
                  onChange={(e) => setFormData({...formData, line_url: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type || ''} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurantTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="reservation_ok"
                checked={formData.reservation_ok || false}
                onCheckedChange={(checked) => setFormData({...formData, reservation_ok: checked})}
              />
              <Label htmlFor="reservation_ok">Reservations Available</Label>
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
                  <h3 className="font-semibold">{restaurant.name_en} ({restaurant.name_ja})</h3>
                  <p className="text-sm text-gray-600 mt-1">{restaurant.description_ja}</p>
                  <div className="mt-2 text-sm space-y-1">
                    <p><strong>Type:</strong> {restaurant.type}</p>
                    <p><strong>Location:</strong> {restaurant.location}</p>
                    <p><strong>Reservations:</strong> {restaurant.reservation_ok ? 'Available' : 'Not Available'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(restaurant)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(restaurant.id)}>
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