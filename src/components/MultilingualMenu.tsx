import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Globe, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { isValidUrl } from '@/utils/securityHeaders';

interface MenuItem {
  name: Record<string, string>;
  description: Record<string, string>;
  price: string;
  category: string;
  image?: string;
}

interface MultilingualMenuProps {
  restaurantId: string;
  menuUrl?: string;
  menuItems?: MenuItem[];
  originalMenuImage?: string;
}

const MultilingualMenu: React.FC<MultilingualMenuProps> = ({
  restaurantId,
  menuUrl,
  menuItems,
  originalMenuImage
}) => {
  const { t, language } = useLanguage();
  const [showOriginalImage, setShowOriginalImage] = useState(false);

  // Sample menu items for AZ DINING Saku (since we don't have the actual menu data)
  const azDiningMenuItems: MenuItem[] = [
    {
      name: {
        ja: 'カルボナーラ',
        en: 'Carbonara',
        pl: 'Carbonara',
        ko: '카르보나라',
        zh: '卡邦尼拉'
      },
      description: {
        ja: '卵黄、パルメザンチーズ、黒胡椒を使用した本格的なカルボナーラ。ベーコンとパスタの絶妙なバランス。',
        en: 'Authentic carbonara with egg yolk, parmesan cheese, and black pepper. Perfect balance of bacon and pasta.',
        pl: 'Autentyczna carbonara z żółtkiem jaja, parmezanem i czarnym pieprzem.',
        ko: '계란 노른자, 파마산 치즈, 후추를 사용한 정통 카르보나라. 베이컨과 파스타의 완벽한 조화.',
        zh: '使用蛋黄、帕尔马干酪和黑胡椒的正宗卡邦尼拉。培根和意大利面的完美平衡。'
      },
      price: '¥1,200',
      category: 'pasta'
    },
    {
      name: {
        ja: 'ペペロンチーノ',
        en: 'Peperoncino',
        pl: 'Peperoncino',
        ko: '페페론치노',
        zh: '佩佩龙奇诺'
      },
      description: {
        ja: '唐辛子とニンニクの香り豊かなペペロンチーノ。シンプルながら深い味わい。',
        en: 'Fragrant peperoncino with chili and garlic. Simple yet deeply flavorful.',
        pl: 'Aromatyczne peperoncino z chili i czosnkiem.',
        ko: '고추와 마늘의 향이 풍부한 페페론치노. 심플하지만 깊은 맛.',
        zh: '辣椒和大蒜香气浓郁的佩佩龙奇诺。简单但味道深厚。'
      },
      price: '¥1,000',
      category: 'pasta'
    },
    {
      name: {
        ja: 'アマトリチャーナ',
        en: 'Amatriciana',
        pl: 'Amatriciana',
        ko: '아마트리치아나',
        zh: '阿马特里恰纳'
      },
      description: {
        ja: 'トマトソースとベーコンのアマトリチャーナ。イタリアの伝統的な味わい。',
        en: 'Amatriciana with tomato sauce and bacon. Traditional Italian flavor.',
        pl: 'Amatriciana z sosem pomidorowym i bekonem.',
        ko: '토마토 소스와 베이컨의 아마트리치아나. 이탈리아 전통의 맛.',
        zh: '番茄酱和培根的阿马特里恰纳。意大利传统风味。'
      },
      price: '¥1,300',
      category: 'pasta'
    },
    {
      name: {
        ja: 'カフェラテ',
        en: 'Cafe Latte',
        pl: 'Cafe Latte',
        ko: '카페라떼',
        zh: '拿铁咖啡'
      },
      description: {
        ja: '濃厚なエスプレッソと滑らかなミルクのカフェラテ。',
        en: 'Rich espresso with smooth milk cafe latte.',
        pl: 'Bogate espresso z gładkim mlekiem.',
        ko: '진한 에스프레소와 부드러운 우유의 카페라떼.',
        zh: '浓郁的浓缩咖啡配顺滑牛奶的拿铁。'
      },
      price: '¥450',
      category: 'drinks'
    }
  ];

  const getLocalizedValue = (field: Record<string, string>, lang: string): string => {
    return field[lang] || field['en'] || field['ja'] || Object.values(field)[0] || '';
  };

  const getMenuItems = () => {
    if (restaurantId === 'az-dining-saku') {
      return azDiningMenuItems;
    }
    return menuItems || [];
  };

  const categories = [...new Set(getMenuItems().map(item => item.category))];

  const renderMenuItems = () => {
    const items = getMenuItems();
    
    if (items.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>{t('menu.no_items_available')}</p>
        </div>
      );
    }

    return (
      <Tabs defaultValue={categories[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {t(`menu.category.${category}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            {items
              .filter(item => item.category === category)
              .map((item, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {getLocalizedValue(item.name, language)}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {getLocalizedValue(item.description, language)}
                        </p>
                      </div>
                      <Badge variant="secondary" className="ml-4">
                        {item.price}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        ))}
      </Tabs>
    );
  };

  const handleOpenMenu = (url: string) => {
    if (!url) return;
    
    // Convert relative paths to absolute URLs
    let fullUrl = url;
    if (url.startsWith('/')) {
      fullUrl = window.location.origin + url;
    }
    
    // Validate URL before opening
    if (isValidUrl(fullUrl)) {
      window.open(fullUrl, '_blank');
    } else {
      console.warn('Invalid menu URL:', url);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('menu.title')}</h2>
        <div className="flex gap-2">
          {menuUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenMenu(menuUrl)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {t('menu.view_original')}
            </Button>
          )}
          {originalMenuImage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOriginalImage(!showOriginalImage)}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {showOriginalImage ? t('menu.hide_image') : t('menu.show_image')}
            </Button>
          )}
        </div>
      </div>

      {showOriginalImage && originalMenuImage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('menu.original_menu')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={originalMenuImage}
              alt="Original Menu"
              className="w-full h-auto rounded-lg shadow-sm"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('menu.multilingual_menu')} ({language.toUpperCase()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderMenuItems()}
        </CardContent>
      </Card>
    </div>
  );
};

export default MultilingualMenu; 