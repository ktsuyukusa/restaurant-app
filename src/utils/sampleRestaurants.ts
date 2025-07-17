// Sample restaurant data with proper images and multilingual support
export const sampleRestaurants = [
  {
    id: 'az-dining-saku',
    name: {
      ja: 'Spaghetteria AZ DINING 佐久店',
      en: 'Spaghetteria AZ DINING Saku',
      pl: 'Spaghetteria AZ DINING Saku',
      ko: '스파게테리아 AZ DINING 사쿠점',
      zh: '斯帕格蒂利亚 AZ DINING 佐久店'
    },
    description: {
      ja: '佐久市岩村田にある本格的なイタリアンスパゲッテリア。カルボナーラを中心としたパスタ料理とカフェメニューを提供。つどいの館こてさんね内に位置し、地元の方々に愛されるレストランです。',
      en: 'Authentic Italian spaghetteria located in Iwamurata, Saku City. Specializing in pasta dishes centered around carbonara, along with cafe menus. Located within Tsudoi no Yakata Kotesanne, a beloved local restaurant.',
      pl: 'Autentyczna włoska spaghetteria położona w Iwamurata, miasto Saku. Specjalizuje się w daniach z makaronu, szczególnie carbonara, oraz menu kawiarnianym.',
      ko: '사쿠시 이와무라타에 위치한 정통 이탈리안 스파게테리아입니다. 카르보나라를 중심으로 한 파스타 요리와 카페 메뉴를 제공합니다.',
      zh: '位于佐久市岩村田的正宗意大利面食店。专门提供以卡邦尼拉为主的意大利面料理和咖啡厅菜单。'
    },
    address: {
      ja: '〒385-0022 長野県佐久市岩村田741 つどいの館こてさんね内',
      en: '741 Iwamurata, Saku, Nagano Prefecture 385-0022 (Inside Tsudoi no Yakata Kotesanne)',
      pl: '741 Iwamurata, Saku, Prefektura Nagano 385-0022 (Wewnątrz Tsudoi no Yakata Kotesanne)',
      ko: '〒385-0022 나가노현 사쿠시 이와무라타 741 츠도이노야카타 코테산네 내',
      zh: '〒385-0022 长野县佐久市岩村田741 聚会馆小铁山内'
    },
    latitude: 36.248,
    longitude: 138.248,
    cuisine: 'Italian',
    rating: 4.5,
    priceRange: '¥¥',
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    opening_hours: '11:00-15:00 (L.O 14:30), 17:00-20:00 (L.O 19:30)',
    phone_number: '050-5266-1283',
    isOpen: true,
    external_booking_url: 'https://www.slow-style.com/restaurants/azdining-saku/',
    external_booking_url_en: 'https://www.slow-style.com/restaurants/azdining-saku/?lang=en',
    notification_email: 'reservations@azdining-saku.com',
    notification_line_id: '@azdining_saku',
    // Additional real information
    closed_days: 'Monday',
    parking: 'Shared parking with Kotesanne (9 spaces). Second parking lot available when full.',
    seating: 'Table: 8 seats, Counter: 8 seats',
    menu_url: 'https://www.slow-style.com/restaurants/azdining-saku/menu.html'
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
      ja: '伝統的な江戸前寿司を提供する高級寿司店。新鮮な魚介類と職人の技が光る本格寿司をお楽しみください。',
      en: 'A premium sushi restaurant serving traditional Edomae sushi. Enjoy authentic sushi with fresh seafood and master craftsmanship.',
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
    latitude: 36.250,
    longitude: 138.250,
    cuisine: 'Japanese',
    rating: 4.8,
    priceRange: '¥¥¥',
    image_url: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
    opening_hours: '17:00-23:00',
    phone_number: '+81-267-XX-XXXX',
    isOpen: true,
    notification_email: 'reservations@sakura-sushi.com',
    notification_line_id: '@sakura_sushi'
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
      ja: '本格的な東京風ラーメンを提供する人気店。濃厚なスープと麺の絶妙なバランスが自慢です。',
      en: 'A popular restaurant serving authentic Tokyo-style ramen. Proud of the perfect balance of rich soup and noodles.',
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
    latitude: 36.246,
    longitude: 138.246,
    cuisine: 'Japanese',
    rating: 4.3,
    priceRange: '¥',
    image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
    opening_hours: '11:00-21:00',
    phone_number: '+81-267-XX-XXXX',
    isOpen: true,
    notification_email: 'reservations@tokyo-ramen.com',
    notification_line_id: '@tokyo_ramen'
  },
  {
    id: 'pizza-napoli',
    name: {
      ja: 'ピザナポリ',
      en: 'Pizza Napoli',
      pl: 'Pizza Napoli',
      ko: '피자 나폴리',
      zh: '那不勒斯披萨'
    },
    description: {
      ja: 'ナポリ風の本格ピザを提供するイタリアンレストラン。石窯で焼き上げる香ばしいピザが人気です。',
      en: 'An Italian restaurant serving authentic Neapolitan pizza. Popular for its aromatic pizza baked in a stone oven.',
      pl: 'Restauracja włoska serwująca autentyczną pizzę neapolitańską.',
      ko: '나폴리 스타일의 정통 피자를 제공하는 이탈리안 레스토랑입니다.',
      zh: '提供那不勒斯风格正宗披萨的意大利餐厅。'
    },
    address: {
      ja: '長野県佐久市岩村田3333-4',
      en: '3333-4 Iwamurata, Saku, Nagano Prefecture',
      pl: '3333-4 Iwamurata, Saku, Prefektura Nagano',
      ko: '나가노현 사쿠시 이와무라타 3333-4',
      zh: '长野县佐久市岩村田3333-4'
    },
    latitude: 36.252,
    longitude: 138.252,
    cuisine: 'Italian',
    rating: 4.6,
    priceRange: '¥¥',
    image_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop',
    opening_hours: '11:00-22:00',
    phone_number: '+81-267-XX-XXXX',
    isOpen: true,
    notification_email: 'reservations@pizza-napoli.com',
    notification_line_id: '@pizza_napoli'
  },
  {
    id: 'kimchi-house',
    name: {
      ja: 'キムチハウス',
      en: 'Kimchi House',
      pl: 'Kimchi House',
      ko: '김치 하우스',
      zh: '泡菜屋'
    },
    description: {
      ja: '本格的な韓国料理を提供するレストラン。自家製キムチと韓国BBQが人気の店です。',
      en: 'A restaurant serving authentic Korean cuisine. Popular for homemade kimchi and Korean BBQ.',
      pl: 'Restauracja serwująca autentyczną kuchnię koreańską.',
      ko: '정통 한국 요리를 제공하는 레스토랑입니다.',
      zh: '提供正宗韩国料理的餐厅。'
    },
    address: {
      ja: '長野県佐久市岩村田5555-6',
      en: '5555-6 Iwamurata, Saku, Nagano Prefecture',
      pl: '5555-6 Iwamurata, Saku, Prefektura Nagano',
      ko: '나가노현 사쿠시 이와무라타 5555-6',
      zh: '长野县佐久市岩村田5555-6'
    },
    latitude: 36.244,
    longitude: 138.244,
    cuisine: 'Korean',
    rating: 4.4,
    priceRange: '¥¥',
    image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
    opening_hours: '11:00-22:00',
    phone_number: '+81-267-XX-XXXX',
    isOpen: true,
    notification_email: 'reservations@kimchi-house.com',
    notification_line_id: '@kimchi_house'
  },
  {
    id: 'thai-spice',
    name: {
      ja: 'タイスパイス',
      en: 'Thai Spice',
      pl: 'Thai Spice',
      ko: '타이 스파이스',
      zh: '泰式香料'
    },
    description: {
      ja: '本格的なタイ料理を提供するレストラン。辛さと酸味のバランスが絶妙なタイ料理が楽しめます。',
      en: 'A restaurant serving authentic Thai cuisine. Enjoy Thai dishes with perfect balance of spiciness and sourness.',
      pl: 'Restauracja serwująca autentyczną kuchnię tajską.',
      ko: '정통 태국 요리를 제공하는 레스토랑입니다.',
      zh: '提供正宗泰国料理的餐厅。'
    },
    address: {
      ja: '長野県佐久市岩村田7777-8',
      en: '7777-8 Iwamurata, Saku, Nagano Prefecture',
      pl: '7777-8 Iwamurata, Saku, Prefektura Nagano',
      ko: '나가노현 사쿠시 이와무라타 7777-8',
      zh: '长野县佐久市岩村田7777-8'
    },
    latitude: 36.254,
    longitude: 138.254,
    cuisine: 'Thai',
    rating: 4.2,
    priceRange: '¥¥',
    image_url: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&h=600&fit=crop',
    opening_hours: '11:00-22:00',
    phone_number: '+81-267-XX-XXXX',
    isOpen: true,
    notification_email: 'reservations@thai-spice.com',
    notification_line_id: '@thai_spice'
  }
];

// Helper function to get localized value
export function getSampleRestaurantLocalizedValue(field: Record<string, string>, language: string): string {
  return field[language] || field['en'] || field['ja'] || Object.values(field)[0] || '';
}

// Helper function to get restaurant by ID
export function getSampleRestaurantById(id: string) {
  return sampleRestaurants.find(restaurant => restaurant.id === id);
}

// Helper function to get all sample restaurants
export function getAllSampleRestaurants() {
  return sampleRestaurants;
} 