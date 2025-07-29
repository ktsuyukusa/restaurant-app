import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Flame, Leaf, Wheat, ArrowLeft } from 'lucide-react';
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

const RestaurantSpecificMenu: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const { t, currentLanguage } = useLanguage();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['ja', currentLanguage === 'ja' ? 'en' : currentLanguage]);
  const [formData, setFormData] = useState({
    name_ja: '',
    name_en: '',
    name_zh: '',
    name_ko: '',
    name_pl: '',
    name_ms: '',
    name_id: '',
    name_vi: '',
    name_th: '',
    name_es: '',
    name_ro: '',
    description_ja: '',
    description_en: '',
    description_zh: '',
    description_ko: '',
    description_pl: '',
    description_ms: '',
    description_id: '',
    description_vi: '',
    description_th: '',
    description_es: '',
    description_ro: '',
    price: 0,
    category: '',
    image: '',
    available: true,
    spicy: false,
    vegetarian: false,
    glutenFree: false
  });

  // Available languages for selection
  const availableLanguages = [
    { code: 'ja', name: 'Japanese', required: true },
    { code: 'en', name: 'English' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ko', name: 'Korean' },
    { code: 'pl', name: 'Polish' },
    { code: 'ms', name: 'Malay' },
    { code: 'id', name: 'Indonesian' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'th', name: 'Thai' },
    { code: 'es', name: 'Spanish' },
    { code: 'ro', name: 'Romanian' }
  ];

  // Ensure Japanese is always included and current language is included by default
  useEffect(() => {
    const defaultLanguages = ['ja'];
    if (currentLanguage !== 'ja') {
      defaultLanguages.push(currentLanguage);
    } else {
      defaultLanguages.push('en'); // Add English as secondary for Japanese users
    }
    setSelectedLanguages(defaultLanguages);
  }, [currentLanguage]);

  const toggleLanguage = (langCode: string) => {
    if (langCode === 'ja') return; // Japanese is always required
    
    setSelectedLanguages(prev =>
      prev.includes(langCode)
        ? prev.filter(code => code !== langCode)
        : [...prev, langCode]
    );
  };

  const fetchRestaurantData = useCallback(async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurantId)
        .single();

      if (error) {
        console.error('Error fetching restaurant:', error);
        return;
      }

      setRestaurant(data);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    }
  }, [restaurantId]);

  const fetchMenuItems = useCallback(async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching menu items:', error);
        toast({
          title: "Error",
          description: "Failed to load menu items for this restaurant",
          variant: "destructive",
        });
        return;
      }

      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: "Error",
        description: "Failed to load menu items for this restaurant",
        variant: "destructive",
      });
    }
  }, [restaurantId]);

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantData();
      fetchMenuItems();
    }
  }, [restaurantId, fetchRestaurantData, fetchMenuItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const supabase = getSupabaseClient();
      
      const menuItemData = {
        restaurant_id: restaurantId,
        name_en: formData.name_en || null,
        name_ja: formData.name_ja || null,
        name_zh: formData.name_zh || (currentLanguage === 'zh' ? formData.name_ja : null),
        name_ko: formData.name_ko || null,
        name_pl: formData.name_pl || null,
        name_ms: formData.name_ms || null,
        name_id: formData.name_id || null,
        name_vi: formData.name_vi || null,
        name_th: formData.name_th || null,
        name_es: formData.name_es || null,
        name_ro: formData.name_ro || null,
        description_en: formData.description_en || null,
        description_ja: formData.description_ja || null,
        description_zh: formData.description_zh || (currentLanguage === 'zh' ? formData.description_ja : null),
        description_ko: formData.description_ko || null,
        description_pl: formData.description_pl || null,
        description_ms: formData.description_ms || null,
        description_id: formData.description_id || null,
        description_vi: formData.description_vi || null,
        description_th: formData.description_th || null,
        description_es: formData.description_es || null,
        description_ro: formData.description_ro || null,
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
      name_ja: '',
      name_en: '',
      name_zh: '',
      name_ko: '',
      name_pl: '',
      name_ms: '',
      name_id: '',
      name_vi: '',
      name_th: '',
      name_es: '',
      name_ro: '',
      description_ja: '',
      description_en: '',
      description_zh: '',
      description_ko: '',
      description_pl: '',
      description_ms: '',
      description_id: '',
      description_vi: '',
      description_th: '',
      description_es: '',
      description_ro: '',
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

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name_ja: item.name_ja || '',
      name_en: item.name_en || '',
      name_zh: item.name_zh || '',
      name_ko: item.name_ko || '',
      name_pl: '',
      name_ms: '',
      name_id: '',
      name_vi: '',
      name_th: '',
      name_es: '',
      name_ro: '',
      description_ja: item.description_ja || '',
      description_en: item.description_en || '',
      description_zh: item.description_zh || '',
      description_ko: item.description_ko || '',
      description_pl: '',
      description_ms: '',
      description_id: '',
      description_vi: '',
      description_th: '',
      description_es: '',
      description_ro: '',
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

  const getItemName = (item: MenuItem) => {
    const nameObj = {
      en: item.name_en,
      ja: item.name_ja || item.name_en,
      zh: item.name_zh || item.name_en,
      ko: item.name_ko || item.name_en
    };
    return getLocalizedText(nameObj, currentLanguage);
  };

  const getItemDescription = (item: MenuItem) => {
    const descObj = {
      en: item.description_en || '',
      ja: item.description_ja || item.description_en || '',
      zh: item.description_zh || item.description_en || '',
      ko: item.description_ko || item.description_en || ''
    };
    return getLocalizedText(descObj, currentLanguage);
  };

  const getRestaurantName = () => {
    if (!restaurant) return 'Restaurant';
    
    switch (currentLanguage) {
      case 'ja':
        return restaurant.name_ja || restaurant.name;
      case 'en':
        return restaurant.name_en || restaurant.name;
      default:
        return restaurant.name;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/restaurant/${restaurantId}/dashboard`)}
            className="text-navikko-primary hover:bg-navikko-primary/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">{getRestaurantName()} - Menu Management</h1>
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
                {editingItem ? t('button.edit') : t('button.add')} Menu Item
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Language Selection */}
              <div className="space-y-2">
                <Label>Languages to Support</Label>
                <div className="flex flex-wrap gap-2">
                  {availableLanguages.map((lang) => (
                    <div key={lang.code} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`lang-${lang.code}`}
                        checked={selectedLanguages.includes(lang.code)}
                        onChange={() => toggleLanguage(lang.code)}
                        disabled={lang.required}
                        className="rounded"
                        aria-label={`Select ${lang.name} language support`}
                        title={`Toggle ${lang.name} language support for menu items`}
                      />
                      <Label htmlFor={`lang-${lang.code}`} className={lang.required ? 'font-semibold' : ''}>
                        {lang.name} {lang.required && '*'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Name Fields */}
              <div className="space-y-4">
                <h4 className="font-semibold">Names</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedLanguages.map((langCode) => {
                    const lang = availableLanguages.find(l => l.code === langCode);
                    if (!lang) return null;
                    
                    return (
                      <div key={`name-${langCode}`}>
                        <Label htmlFor={`name_${langCode}`}>
                          Name ({lang.name}) {lang.required ? '*' : ''}
                        </Label>
                        <Input
                          id={`name_${langCode}`}
                          value={formData[`name_${langCode}` as keyof typeof formData] as string}
                          onChange={(e) => setFormData({ ...formData, [`name_${langCode}`]: e.target.value })}
                          required={lang.required}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Description Fields */}
              <div className="space-y-4">
                <h4 className="font-semibold">Descriptions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedLanguages.map((langCode) => {
                    const lang = availableLanguages.find(l => l.code === langCode);
                    if (!lang) return null;
                    
                    return (
                      <div key={`desc-${langCode}`}>
                        <Label htmlFor={`description_${langCode}`}>
                          Description ({lang.name})
                        </Label>
                        <Input
                          id={`description_${langCode}`}
                          value={formData[`description_${langCode}` as keyof typeof formData] as string}
                          onChange={(e) => setFormData({ ...formData, [`description_${langCode}`]: e.target.value })}
                        />
                      </div>
                    );
                  })}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white rounded border">
            <div className="text-2xl font-bold text-navikko-primary">{menuItems?.length || 0}</div>
            <div className="text-sm text-gray-600">Total Menu Items</div>
          </div>
          <div className="text-center p-3 bg-white rounded border">
            <div className="text-2xl font-bold text-green-600">
              {menuItems?.filter(item => item.is_available)?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Available Items</div>
          </div>
          <div className="text-center p-3 bg-white rounded border">
            <div className="text-2xl font-bold text-red-600">
              {menuItems?.filter(item => item.is_spicy)?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Spicy Items</div>
          </div>
          <div className="text-center p-3 bg-white rounded border">
            <div className="text-2xl font-bold text-blue-600">
              {menuItems?.filter(item => item.is_vegetarian)?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Vegetarian Items</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {menuItems?.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{getItemName(item)}</div>
                  <div className="text-sm text-gray-600">{getRestaurantName()}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                    aria-label={`Edit ${getItemName(item)} menu item`}
                    title={`Edit ${getItemName(item)} menu item`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    aria-label={`Delete ${getItemName(item)} menu item`}
                    title={`Delete ${getItemName(item)} menu item`}
                  >
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

export default RestaurantSpecificMenu;