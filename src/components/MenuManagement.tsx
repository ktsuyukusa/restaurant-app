import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Flame, Leaf, Wheat, Filter } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLocalizedValue } from '@/utils/localization';
import { getAllMenuItems, getAllRestaurants, type MenuItem, type Restaurant } from '@/utils/restaurantData';

const MenuManagement: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const [menuItems, setMenuItems] = useState<Array<MenuItem & { restaurantId: string; restaurantName: Record<string, string> }>>([]);
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
    // Load synchronized data
    setMenuItems(getAllMenuItems());
    setRestaurants(getAllRestaurants());
  }, []);

  // Filter menu items based on selected restaurant
  const filteredMenuItems = selectedRestaurantFilter === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.restaurantId === selectedRestaurantFilter);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newItem: MenuItem = {
      id: editingItem?.id || Date.now().toString(),
      name: {
        en: formData.name_en,
        ja: formData.name_ja,
        zh: formData.name_zh,
        ko: formData.name_ko
      },
      description: {
        en: formData.description_en,
        ja: formData.description_ja,
        zh: formData.description_zh,
        ko: formData.description_ko
      },
      price: formData.price,
      category: formData.category,
      image: formData.image || '/placeholder.svg',
      available: formData.available,
      spicy: formData.spicy,
      vegetarian: formData.vegetarian,
      glutenFree: formData.glutenFree
    };

    if (editingItem) {
      // Update existing item
      const updatedItems = menuItems.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...newItem }
          : item
      );
      setMenuItems(updatedItems);
    } else {
      // Add new item
      const restaurant = restaurants.find(r => r.id === formData.restaurant_id);
      if (restaurant) {
        const newItemWithRestaurant = {
          ...newItem,
          restaurantId: formData.restaurant_id,
          restaurantName: restaurant.name
        };
        setMenuItems([newItemWithRestaurant, ...menuItems]);
      }
    }
    resetForm();
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

  const handleEdit = (item: MenuItem & { restaurantId: string; restaurantName: Record<string, string> }) => {
    setEditingItem(item);
    setFormData({
      restaurant_id: item.restaurantId,
      name_en: item.name.en || '',
      name_ja: item.name.ja || '',
      name_zh: item.name.zh || '',
      name_ko: item.name.ko || '',
      description_en: item.description?.en || '',
      description_ja: item.description?.ja || '',
      description_zh: item.description?.zh || '',
      description_ko: item.description?.ko || '',
      price: item.price,
      category: item.category,
      image: item.image || '',
      available: item.available,
      spicy: item.spicy || false,
      vegetarian: item.vegetarian || false,
      glutenFree: item.glutenFree || false
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm(t('confirm.delete'))) {
      const updatedItems = menuItems.filter(item => item.id !== id);
      setMenuItems(updatedItems);
    }
  };

  const getLocalizedText = (text: Record<string, string> | string, lang: string) => {
    if (typeof text === 'string') return text;
    return getLocalizedValue(text, lang);
  };

  const getItemName = (item: MenuItem) => {
    return getLocalizedText(item.name, currentLanguage);
  };

  const getItemDescription = (item: MenuItem) => {
    return getLocalizedText(item.description || '', currentLanguage);
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
                <SelectItem value="all">All Restaurants ({menuItems.length} items)</SelectItem>
                {restaurants.map((restaurant) => {
                  const restaurantItemCount = menuItems.filter(item => item.restaurantId === restaurant.id).length;
                  return (
                    <SelectItem key={restaurant.id} value={restaurant.id}>
                      {getLocalizedText(restaurant.name, currentLanguage)} ({restaurantItemCount} items)
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
                        {getLocalizedText(restaurant.name, currentLanguage)}
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
                  <input
                    type="checkbox"
                    id="available"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  />
                  <Label htmlFor="available">Available</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="spicy"
                    checked={formData.spicy}
                    onChange={(e) => setFormData({ ...formData, spicy: e.target.checked })}
                  />
                  <Label htmlFor="spicy">Spicy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="vegetarian"
                    checked={formData.vegetarian}
                    onChange={(e) => setFormData({ ...formData, vegetarian: e.target.checked })}
                  />
                  <Label htmlFor="vegetarian">Vegetarian</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="glutenFree"
                    checked={formData.glutenFree}
                    onChange={(e) => setFormData({ ...formData, glutenFree: e.target.checked })}
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
            <div className="text-2xl font-bold text-navikko-primary">{menuItems.length}</div>
            <div className="text-sm text-gray-600">Total Menu Items</div>
          </div>
          {restaurants.map((restaurant) => {
            const restaurantItemCount = menuItems.filter(item => item.restaurantId === restaurant.id).length;
            return (
              <div key={restaurant.id} className="text-center p-3 bg-white rounded border">
                <div className="text-lg font-semibold text-navikko-secondary">
                  {getLocalizedText(restaurant.name, currentLanguage)}
                </div>
                <div className="text-2xl font-bold text-navikko-primary">{restaurantItemCount}</div>
                <div className="text-sm text-gray-600">Menu Items</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredMenuItems.map((item) => (
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
                {item.image && (
                  <img src={item.image} alt={getItemName(item)} className="w-16 h-16 object-cover rounded" />
                )}
                <div className="flex-1">
                  <div className="font-semibold text-lg">¥{item.price}</div>
                  <div className="text-sm text-gray-600 mb-2">{getItemDescription(item)}</div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{item.category}</Badge>
                    {item.spicy && <Badge variant="outline" className="text-red-600"><Flame className="h-3 w-3 mr-1" />Spicy</Badge>}
                    {item.vegetarian && <Badge variant="outline" className="text-green-600"><Leaf className="h-3 w-3 mr-1" />Vegetarian</Badge>}
                    {item.glutenFree && <Badge variant="outline" className="text-blue-600"><Wheat className="h-3 w-3 mr-1" />Gluten Free</Badge>}
                    {!item.available && <Badge variant="outline" className="text-gray-500">Unavailable</Badge>}
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