import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';

interface MenuItem {
  id: string;
  restaurant_id: string;
  item_name: string;
  item_name_ja?: string;
  item_name_json?: any;
  price: number;
  photo?: string;
}

interface MenuDisplayProps {
  restaurantId: string;
}

// Fixed getLocalized helper function with proper fallback
const getLocalized = (field: any, lang: string) => {
  if (!field || typeof field !== 'object') return field;
  const fallbackLang = 'en';
  return field[lang] || field[fallbackLang] || Object.values(field)[0] || '';
};

const MenuDisplay: React.FC<MenuDisplayProps> = ({ restaurantId }) => {
  const { t, currentLanguage } = useLanguage();
  const { addToCart } = useAppContext();
  const { i18n } = useTranslation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuItems();
  }, [restaurantId]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .eq('restaurant_id', restaurantId);
      
      if (error) throw error;
      setMenuItems(data || []);
    } catch (err) {
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  const getItemName = (item: MenuItem) => {
    const currentLang = i18n.language;
    const fallbackLang = 'en';
    
    // Try JSON field first (new format) - use proper fallback logic
    if (item.item_name_json) {
      return item.item_name_json[currentLang] 
        || item.item_name_json[fallbackLang] 
        || Object.values(item.item_name_json)[0] 
        || '';
    }
    
    // Fallback to specific language field (old format)
    if (currentLang === 'ja' && item.item_name_ja) {
      return item.item_name_ja;
    }
    
    // Final fallback to plain field
    return item.item_name || '';
  };

  const handleAddToCart = (item: MenuItem) => {
    if (addToCart) {
      addToCart({
        id: item.id,
        name: getItemName(item),
        price: item.price,
        restaurantId: item.restaurant_id
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">{t('message.loading')}</div>;
  }

  if (menuItems.length === 0) {
    return (
      <div className="text-center py-8 text-navikko-secondary">
        {t('message.no_menus')}
      </div>
    );
  }

  const fallbackImage = '/placeholder.svg';

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-navikko-secondary mb-4">
        {t('nav.menus')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {menuItems.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-navikko-secondary">
                    {getItemName(item)}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    ¥{item.price.toLocaleString()}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="bg-navikko-accent text-navikko-secondary">
                  {t('nav.menus')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <img 
                    src={item.photo || fallbackImage} 
                    alt={getItemName(item)}
                    className="w-16 h-16 object-cover rounded-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = fallbackImage;
                    }}
                  />
                </div>
                <Button
                  onClick={() => handleAddToCart(item)}
                  className="bg-navikko-primary hover:bg-navikko-primary/90 text-white"
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {t('button.addToCart')}
                </Button>
              </div>
              
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
                  <details>
                    <summary className="cursor-pointer text-gray-600">Debug Info</summary>
                    <pre className="mt-2 text-xs overflow-auto">
                      {JSON.stringify({
                        item_name_json: item.item_name_json,
                        item_name_ja: item.item_name_ja,
                        item_name: item.item_name
                      }, null, 2)}
                    </pre>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MenuDisplay;