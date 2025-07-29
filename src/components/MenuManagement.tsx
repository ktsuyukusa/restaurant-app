import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Flame, Leaf, Wheat, Filter } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedValue } from '@/utils/localization';
import { getSupabaseClient } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';

interface MenuItem {
  id: string;
  restaurant_id: string;
  name_en: string;
  name_ja?: string;
  name_zh?: string;
  name_ko?: string;
  description_en?: string;
  description_ja?: string;
  description_zh?: string;
  description_ko?: string;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
  is_spicy?: boolean;
  is_vegetarian?: boolean;
  is_gluten_free?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Restaurant {
  id: string;
  name: string;
  name_en?: string;
  name_ja?: string;
  name_zh?: string;
  name_ko?: string;
}

interface MenuItemWithRestaurant extends MenuItem {
  restaurantId: string;
  restaurantName: Record<string, string>;
}

const MenuManagement: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const [menuItems, setMenuItems] = useState<MenuItemWithRestaurant[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedRestaurantFilter, setSelectedRestaurantFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    restaurant_id: '',
    name_en: '',
    name_ja: '',
    name_zh: '',
    name_ko: '',
    description_en: '',
    description_ja: '',
    description_zh: '',
    description_ko: '',
    price: 0,
    category: '',
    image: '',
    available: true,
    spicy: false,
    vegetarian: false,
    glutenFree: false
  });

  useEffect(() => {
    fetchMenuItems();
    fetchRestaurants();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          restaurants!inner(
            id,
            name,
            name_en,
            name_ja,
            name_zh,
            name_ko
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching menu items:', error);
        toast({
          title: "Error",
          description: "Failed to load menu items",
          variant: "destructive",
        });
        return;
      }

      const menuItemsWithRestaurant: MenuItemWithRestaurant[] = (data || []).map(item => ({
        ...item,
        restaurantId: item.restaurant_id,
        restaurantName: {
          en: item.restaurants.name_en || item.restaurants.name,
          ja: item.restaurants.name_ja || item.restaurants.name,
          zh: item.restaurants.name_zh || item.restaurants.name,
          ko: item.restaurants.name_ko || item.restaurants.name,
        }
      }));

      setMenuItems(menuItemsWithRestaurant);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive",
      });
    }
  };

  const fetchRestaurants = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, name_en, name_ja, name_zh, name_ko')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching restaurants:', error);
        return;
      }

      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  // Filter menu items based on selected restaurant
  const filteredMenuItems = selectedRestaurantFilter === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.restaurantId === selectedRestaurantFilter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const supabase = getSupabaseClient();
      
      const menuItemData = {
        restaurant_id: formData.restaurant_id,
        name_en: formData.name_en,
        name_ja: formData.name_ja || null,
        name_zh: formData.name_zh || null,
        name_ko: formData.name_ko || null,
        description_en: formData.description_en || null,
        description_ja: formData.description_ja || null,
        description_zh: formData.description_zh || null,
        description_ko: formData.description_ko || null,
        price: formData.price,
        category: formData.category,
        image_url: formData.image || null,
        is_available: formData.available,
        is_spicy: formData.spicy,
        is_vegetarian: formData.vegetarian,
        is_gluten_free: formData.glutenFree
      };

      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('menu_items')
          .update(menuItemData)
          .eq('id', editingItem.id);

        if (error) {
          console.error('Error updating menu item:', error);
          toast({
            title: "Error",
            description: "Failed to update menu item",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Add new item
        const { error } = await supabase
          .from('menu_items')
          .insert([menuItemData]);

        if (error) {
          console.error('Error creating menu item:', error);
          toast({
            title: "Error",
            description: "Failed to create menu item",
            variant: "destructive",
          });
          return;
        }
      }

      // Refresh the menu items list
      await fetchMenuItems();
      resetForm();
      
      toast({
        title: "Success",
        description: editingItem ? "Menu item updated successfully" : "Menu item created successfully",
      });
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast({
        title: "Error",
        description: "Failed to save menu item",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      restaurant_id: '',
      name_en: '',
      name_ja: '',
      name_zh: '',
      name_ko: '',
      description_en: '',
      description_ja: '',
      description_zh: '',
      description_ko: '',
      price: 0,
      category: '',
      image: '',
      available: true,
      spicy: false,
      vegetarian: false,
      glutenFree: false
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: MenuItemWithRestaurant) => {
    setEditingItem(item);
    setFormData({
      restaurant_id: item.restaurantId,
      name_en: item.name_en || '',
      name_ja: item.name_ja || '',
      name_zh: item.name_zh || '',
      name_ko: item.name_ko || '',
      description_en: item.description_en || '',
      description_ja: item.description_ja || '',
      description_zh: item.description_zh || '',
      description_ko: item.description_ko || '',
      price: item.price,
      category: item.category,
      image: item.image_url || '',
      available: item.is_available,
      spicy: item.is_spicy || false,
      vegetarian: item.is_vegetarian || false,
      glutenFree: item.is_gluten_free || false
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('confirm.delete'))) {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase
          .from('menu_items')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Error deleting menu item:', error);
          toast({
            title: "Error",
            description: "Failed to delete menu item",
            variant: "destructive",
          });
          return;
        }

        // Refresh the menu items list
        await fetchMenuItems();
        
        toast({
          title: "Success",
          description: "Menu item deleted successfully",
        });
      } catch (error) {
        console.error('Error deleting menu item:', error);
        toast({
          title: "Error",
          description: "Failed to delete menu item",
          variant: "destructive",
        });
      }
    }
  };

  const getLocalizedText = (text: Record<string, string> | string, lang: string) => {
    if (typeof text === 'string') return text;
    return getLocalizedValue(text, lang);
  };

  const getItemName = (item: MenuItemWithRestaurant) => {
    const nameObj = {
      en: item.name_en,
      ja: item.name_ja || item.name_en,
      zh: item.name_zh || item.name_en,
      ko: item.name_ko || item.name_en
    };
    return getLocalizedText(nameObj, currentLanguage);
  };

  const getItemDescription = (item: MenuItemWithRestaurant) => {
    const descObj = {
      en: item.description_en || '',
      ja: item.description_ja || item.description_en || '',
      zh: item.description_zh || item.description_en || '',
      ko: item.description_ko || item.description_en || ''
    };
    return getLocalizedText(descObj, currentLanguage);
  };

  const getRestaurantName = (restaurantName: Record<string, string>) => {
    return getLocalizedText(restaurantName, currentLanguage);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="text-navikko-primary hover:bg-navikko-primary/10"
          >
            ← Back
          </Button>
          <h1 className="text-2xl font-bold">{t('nav.menus')}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-navikko-primary" />
            <Select
              value={selectedRestaurantFilter}
              onValueChange={setSelectedRestaurantFilter}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by restaurant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Restaurants ({menuItems?.length || 0} items)</SelectItem>
                {restaurants?.map((restaurant) => {
                  const restaurantItemCount = menuItems?.filter(item => item.restaurantId === restaurant.id)?.length || 0;
                  return (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {getLocalizedText({
                        en: restaurant.name_en || restaurant.name,
                        ja: restaurant.name_ja || restaurant.name,
                        zh: restaurant.name_zh || restaurant.name,
                        ko: restaurant.name_ko || restaurant.name
                      }, currentLanguage)} ({restaurantItemCount} items)
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              {t('button.add')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? t('button.edit') : t('button.add')} {t('nav.menus')}
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
                        {getLocalizedText({
                          en: restaurant.name_en || restaurant.name,
                          ja: restaurant.name_ja || restaurant.name,
                          zh: restaurant.name_zh || restaurant.name,
                          ko: restaurant.name_ko || restaurant.name
                        }, currentLanguage)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_en">Name (English)</Label>
                  <Input
                    id="name_en"
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name_ja">Name (Japanese)</Label>
                  <Input
                    id="name_ja"
                    value={formData.name_ja}
                    onChange={(e) => setFormData({ ...formData, name_ja: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="name_zh">Name (Chinese)</Label>
                  <Input
                    id="name_zh"
                    value={formData.name_zh}
                    onChange={(e) => setFormData({ ...formData, name_zh: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="name_ko">Name (Korean)</Label>
                  <Input
                    id="name_ko"
                    value={formData.name_ko}
                    onChange={(e) => setFormData({ ...formData, name_ko: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description_en">Description (English)</Label>
                  <Input
                    id="description_en"
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description_ja">Description (Japanese)</Label>
                  <Input
                    id="description_ja"
                    value={formData.description_ja}
                    onChange={(e) => setFormData({ ...formData, description_ja: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description_zh">Description (Chinese)</Label>
                  <Input
                    id="description_zh"
                    value={formData.description_zh}
                    onChange={(e) => setFormData({ ...formData, description_zh: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description_ko">Description (Korean)</Label>
                  <Input
                    id="description_ko"
                    value={formData.description_ko}
                    onChange={(e) => setFormData({ ...formData, description_ko: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">{t('form.price')}</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="available"
                    checked={formData.available}
                    onCheckedChange={(checked) => setFormData({ ...formData, available: !!checked })}
                  />
                  <Label htmlFor="available">Available</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="spicy"
                    checked={formData.spicy}
                    onCheckedChange={(checked) => setFormData({ ...formData, spicy: !!checked })}
                  />
                  <Label htmlFor="spicy">Spicy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vegetarian"
                    checked={formData.vegetarian}
                    onCheckedChange={(checked) => setFormData({ ...formData, vegetarian: !!checked })}
                  />
                  <Label htmlFor="vegetarian">Vegetarian</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="glutenFree"
                    checked={formData.glutenFree}
                    onCheckedChange={(checked) => setFormData({ ...formData, glutenFree: !!checked })}
                  />
                  <Label htmlFor="glutenFree">Gluten Free</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingItem ? t('button.update') : t('button.create')}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  {t('button.cancel')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-navikko-secondary">Menu Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white rounded border">
            <div className="text-2xl font-bold text-navikko-primary">{menuItems?.length || 0}</div>
            <div className="text-sm text-gray-600">Total Menu Items</div>
          </div>
          {restaurants?.map((restaurant) => {
            const restaurantItemCount = menuItems?.filter(item => item.restaurantId === restaurant.id)?.length || 0;
            return (
              <div key={restaurant.id} className="text-center p-3 bg-white rounded border">
                <div className="text-lg font-semibold text-navikko-secondary">
                  {getLocalizedText({
                    en: restaurant.name_en || restaurant.name,
                    ja: restaurant.name_ja || restaurant.name,
                    zh: restaurant.name_zh || restaurant.name,
                    ko: restaurant.name_ko || restaurant.name
                  }, currentLanguage)}
                </div>
                <div className="text-2xl font-bold text-navikko-primary">{restaurantItemCount}</div>
                <div className="text-sm text-gray-600">Menu Items</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredMenuItems?.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{getItemName(item)}</div>
                  <div className="text-sm text-gray-600">{getRestaurantName(item.restaurantName)}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {item.image_url && (
                  <img src={item.image_url} alt={getItemName(item)} className="w-16 h-16 object-cover rounded" />
                )}
                <div className="flex-1">
                  <div className="font-semibold text-lg">¥{item.price}</div>
                  <div className="text-sm text-gray-600 mb-2">{getItemDescription(item)}</div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{item.category}</Badge>
                    {item.is_spicy && <Badge variant="outline" className="text-red-600"><Flame className="h-3 w-3 mr-1" />Spicy</Badge>}
                    {item.is_vegetarian && <Badge variant="outline" className="text-green-600"><Leaf className="h-3 w-3 mr-1" />Vegetarian</Badge>}
                    {item.is_gluten_free && <Badge variant="outline" className="text-blue-600"><Wheat className="h-3 w-3 mr-1" />Gluten Free</Badge>}
                    {!item.is_available && <Badge variant="outline" className="text-gray-500">Unavailable</Badge>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MenuManagement;