import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSampleRestaurantLocalizedValue } from '@/utils/sampleRestaurants';
import ReservationButton from './ReservationButton';
import RestaurantOrderButton from './RestaurantOrderButton';

const RestaurantListDemo: React.FC = () => {
  const { t, currentLanguage } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-navikko-secondary mb-4">
          Restaurant List - Fixed Images Demo
        </h1>
        <p className="text-gray-600">
          This demo shows the restaurant list with proper image handling and fallbacks
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            id: 'az-dining-saku',
            name: {
              ja: 'AZ DINING 佐久店',
              en: 'AZ DINING Saku',
              pl: 'AZ DINING Saku',
              ko: 'AZ DINING 사쿠점',
              zh: 'AZ DINING 佐久店'
            },
            description: {
              ja: '佐久市の中心部にある、イタリアン料理を中心としたカジュアルダイニングレストラン。',
              en: 'A casual dining restaurant specializing in Italian cuisine located in the heart of Saku City.',
              pl: 'Restauracja casual dining specjalizująca się w kuchni włoskiej.',
              ko: '사쿠시 중심부에 위치한 이탈리안 요리를 전문으로 하는 캐주얼 다이닝 레스토랑입니다.',
              zh: '位于佐久市中心的休闲餐厅，专门提供意大利美食。'
            },
            address: {
              ja: '長野県佐久市岩村田1234-5',
              en: '1234-5 Iwamurata, Saku, Nagano Prefecture',
              pl: '1234-5 Iwamurata, Saku, Prefektura Nagano',
              ko: '나가노현 사쿠시 이와무라타 1234-5',
              zh: '长野县佐久市岩村田1234-5'
            },
            cuisine: 'Italian',
            rating: 4.5,
            priceRange: '¥¥',
            image_url: 'https://www.web-komachi.com/wp-content/uploads/2023/08/az-dining-saku-exterior.jpg',
            opening_hours: '11:00-22:00',
            phone: '+81-267-XX-XXXX',
            isOpen: true,
            external_booking_url: 'https://www.slow-style.com/restaurants/azdining-saku/',
            external_booking_url_en: 'https://www.slow-style.com/restaurants/azdining-saku/?lang=en',
            notification_email: 'reservations@azdining-saku.com',
            notification_line_id: '@azdining_saku',
            komoju_merchant_id: 'komoju_test_merchant_123',
            payjp_merchant_id: 'payjp_test_merchant_456'
          },
          {
            id: 'sakura-sushi',
            name: {
              ja: '桜寿司',
              en: 'Sakura Sushi',
              pl: 'Sakura Sushi',
              ko: '사쿠라 스시',
              zh: '樱花寿司'
            },
            description: {
              ja: '伝統的な江戸前寿司を提供する高級寿司店。',
              en: 'A premium sushi restaurant serving traditional Edomae sushi.',
              pl: 'Premium restauracja sushi serwująca tradycyjne sushi Edomae.',
              ko: '전통적인 에도마에 스시를 제공하는 프리미엄 스시 레스토랑입니다.',
              zh: '提供传统江户前寿司的高级寿司店。'
            },
            address: {
              ja: '長野県佐久市岩村田5678-9',
              en: '5678-9 Iwamurata, Saku, Nagano Prefecture',
              pl: '5678-9 Iwamurata, Saku, Prefektura Nagano',
              ko: '나가노현 사쿠시 이와무라타 5678-9',
              zh: '长野县佐久市岩村田5678-9'
            },
            cuisine: 'Japanese',
            rating: 4.8,
            priceRange: '¥¥¥',
            image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
            opening_hours: '17:00-23:00',
            phone: '+81-267-XX-XXXX',
            isOpen: true,
            notification_email: 'reservations@sakura-sushi.com',
            notification_line_id: '@sakura_sushi',
            komoju_merchant_id: 'komoju_test_merchant_789',
            payjp_merchant_id: 'payjp_test_merchant_012'
          },
          {
            id: 'tokyo-ramen',
            name: {
              ja: '東京ラーメン',
              en: 'Tokyo Ramen',
              pl: 'Tokyo Ramen',
              ko: '도쿄 라멘',
              zh: '东京拉面'
            },
            description: {
              ja: '本格的な東京風ラーメンを提供する人気店。',
              en: 'A popular restaurant serving authentic Tokyo-style ramen.',
              pl: 'Popularna restauracja serwująca autentyczne ramen w stylu tokijskim.',
              ko: '정통 도쿄 스타일 라멘을 제공하는 인기 레스토랑입니다.',
              zh: '提供正宗东京风格拉面的人气餐厅。'
            },
            address: {
              ja: '長野県佐久市岩村田1111-2',
              en: '1111-2 Iwamurata, Saku, Nagano Prefecture',
              pl: '1111-2 Iwamurata, Saku, Prefektura Nagano',
              ko: '나가노현 사쿠시 이와무라타 1111-2',
              zh: '长野县佐久市岩村田1111-2'
            },
            cuisine: 'Japanese',
            rating: 4.3,
            priceRange: '¥',
            image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
            opening_hours: '11:00-21:00',
            phone: '+81-267-XX-XXXX',
            isOpen: true,
            notification_email: 'reservations@tokyo-ramen.com',
            notification_line_id: '@tokyo_ramen',
            komoju_merchant_id: 'komoju_test_merchant_345',
            payjp_merchant_id: 'payjp_test_merchant_678'
          }
        ].map((restaurant) => {
          const name = getSampleRestaurantLocalizedValue(restaurant.name, currentLanguage);
          const description = getSampleRestaurantLocalizedValue(restaurant.description, currentLanguage);
          const address = getSampleRestaurantLocalizedValue(restaurant.address, currentLanguage);

          return (
            <Card key={restaurant.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-2 border-navikko-primary/20 bg-white">
              <div className="relative">
                <img
                  src={restaurant.image_url}
                  alt={name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const placeholder = target.nextElementSibling as HTMLElement;
                    if (placeholder) {
                      placeholder.classList.remove('hidden');
                      placeholder.classList.add('flex');
                    }
                  }}
                />
                <div className="hidden w-full h-48 bg-gray-200 items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🍽️</div>
                    <p className="text-sm text-gray-500">{name}</p>
                  </div>
                </div>
                <Badge
                  className={`absolute top-2 left-2 ${
                    restaurant.isOpen
                      ? 'bg-navikko-primary text-white'
                      : 'bg-gray-500 text-white'
                  }`}
                >
                  {restaurant.isOpen ? t('open') : t('closed')}
                </Badge>
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-navikko-secondary line-clamp-1">
                    {name}
                  </h3>
                  <div className="flex items-center gap-1 text-navikko-accent">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-medium">{restaurant.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-navikko-secondary">
                  <span className="bg-navikko-primary/10 px-2 py-1 rounded text-navikko-primary font-medium">
                    {restaurant.cuisine}
                  </span>
                  <span className="text-navikko-action font-medium">{restaurant.priceRange}</span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {description}
                  </p>
                )}
                
                <div className="space-y-2 text-sm text-navikko-secondary">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-navikko-primary" />
                    <span className="truncate">{address}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-navikko-primary" />
                    <span className="truncate">{restaurant.opening_hours}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-navikko-primary" />
                    <span className="truncate">{restaurant.phone}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <ReservationButton
                    restaurant={restaurant}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  />
                  <RestaurantOrderButton
                    restaurant={restaurant}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RestaurantListDemo; 