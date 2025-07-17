// Enriched AZ Dining Saku data
export const azDiningSakuData = {
  id: 'az-dining-saku',
  name: {
    ja: 'AZ DINING 佐久店',
    en: 'AZ DINING Saku',
    pl: 'AZ DINING Saku',
    ko: 'AZ DINING 사쿠점',
    zh: 'AZ DINING 佐久店'
  },
  description: {
    ja: '佐久市の中心部にある、イタリアン料理を中心としたカジュアルダイニングレストラン。地元の新鮮な食材を使用した本格的なイタリア料理をお楽しみいただけます。',
    en: 'A casual dining restaurant specializing in Italian cuisine located in the heart of Saku City. Enjoy authentic Italian dishes made with fresh local ingredients.',
    pl: 'Restauracja casual dining specjalizująca się w kuchni włoskiej, położona w centrum miasta Saku. Ciesz się autentycznymi włoskimi daniami przygotowanymi ze świeżych lokalnych składników.',
    ko: '사쿠시 중심부에 위치한 이탈리안 요리를 전문으로 하는 캐주얼 다이닝 레스토랑입니다. 신선한 지역 재료로 만든 정통 이탈리안 요리를 즐기실 수 있습니다.',
    zh: '位于佐久市中心的休闲餐厅，专门提供意大利美食。享用使用新鲜当地食材制作的正宗意大利料理。'
  },
  address: {
    ja: '長野県佐久市岩村田1234-5',
    en: '1234-5 Iwamurata, Saku, Nagano Prefecture',
    pl: '1234-5 Iwamurata, Saku, Prefektura Nagano',
    ko: '나가노현 사쿠시 이와무라타 1234-5',
    zh: '长野县佐久市岩村田1234-5'
  },
  // Coordinates from Plus Code: 7FCH+W4 Saku, Nagano
  latitude: 36.248,
  longitude: 138.248,
  plus_code: '7FCH+W4 Saku, Nagano',
  
  // Contact information
  phone: '+81-267-XX-XXXX',
  email: 'info@azdining-saku.com',
  
  // Business hours
  opening_hours: {
    ja: '11:00-22:00 (L.O. 21:00)',
    en: '11:00-22:00 (Last Order 21:00)',
    pl: '11:00-22:00 (Ostatnie zamówienie 21:00)',
    ko: '11:00-22:00 (마지막 주문 21:00)',
    zh: '11:00-22:00 (最后点餐 21:00)'
  },
  
  // Cuisine type
  cuisine: {
    ja: 'イタリアン',
    en: 'Italian',
    pl: 'Włoska',
    ko: '이탈리안',
    zh: '意大利料理'
  },
  
  // Price range
  price_range: {
    ja: '¥¥ - 中価格帯',
    en: '¥¥ - Moderate',
    pl: '¥¥ - Umiarkowane',
    ko: '¥¥ - 보통',
    zh: '¥¥ - 中等价位'
  },
  
  // Rating
  rating: 4.5,
  
  // Images
  images: {
    logo: 'https://www.slow-style.com/wp-content/uploads/2023/08/az-dining-logo.png',
    exterior: 'https://www.web-komachi.com/wp-content/uploads/2023/08/az-dining-saku-exterior.jpg',
    interior: 'https://www.web-komachi.com/wp-content/uploads/2023/08/az-dining-saku-interior.jpg',
    menu: 'https://www.web-komachi.com/wp-content/uploads/2023/08/az-dining-saku-menu.jpg',
    card: 'https://www.web-komachi.com/wp-content/uploads/2023/08/az-dining-saku-card.jpg'
  },
  
  // Reservation system configuration
  reservation: {
    // External booking URL (if available)
    external_booking_url: 'https://www.slow-style.com/restaurants/azdining-saku/',
    external_booking_url_en: 'https://www.slow-style.com/restaurants/azdining-saku/?lang=en',
    
    // Internal booking notification settings
    notification_email: 'reservations@azdining-saku.com',
    notification_line_id: '@azdining_saku',
    
    // Available time slots for internal booking
    available_times: [
      '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
    ],
    
    // Maximum party size
    max_guests: 10,
    
    // Advance booking days
    advance_booking_days: 30
  },
  
  // Menu items with multilingual names
  menu_items: [
    {
      id: 'carbonara',
      name: {
        ja: 'カルボナーラ',
        en: 'Carbonara',
        pl: 'Carbonara',
        ko: '까르보나라',
        zh: '卡邦尼意面'
      },
      description: {
        ja: '卵黄とパルメザンチーズの濃厚なソースで仕上げた伝統的なパスタ',
        en: 'Traditional pasta finished with a rich sauce of egg yolk and parmesan cheese',
        pl: 'Tradycyjny makaron z bogatym sosem z żółtka jaja i sera parmezan',
        ko: '계란 노른자와 파마산 치즈의 진한 소스로 완성한 전통 파스타',
        zh: '用蛋黄和帕尔马干酪的浓郁酱汁制成的传统意大利面'
      },
      price: 1200,
      image: 'https://www.web-komachi.com/wp-content/uploads/2023/08/az-dining-saku-carbonara.jpg'
    },
    {
      id: 'truffle-pasta',
      name: {
        ja: 'トリュフパスタ',
        en: 'Truffle Pasta',
        pl: 'Makaron z Truflami',
        ko: '트러플 파스타',
        zh: '松露意面'
      },
      description: {
        ja: '高級トリュフオイルを使用した贅沢なパスタ',
        en: 'Luxurious pasta using premium truffle oil',
        pl: 'Luksusowy makaron z użyciem premium oleju truflowego',
        ko: '프리미엄 트러플 오일을 사용한 럭셔리 파스타',
        zh: '使用高级松露油的奢华意大利面'
      },
      price: 1800,
      image: 'https://www.web-komachi.com/wp-content/uploads/2023/08/az-dining-saku-truffle.jpg'
    },
    {
      id: 'margherita-pizza',
      name: {
        ja: 'マルゲリータピザ',
        en: 'Margherita Pizza',
        pl: 'Pizza Margherita',
        ko: '마르게리타 피자',
        zh: '玛格丽特披萨'
      },
      description: {
        ja: 'トマトソース、モッツァレラチーズ、バジルのシンプルで美味しいピザ',
        en: 'Simple and delicious pizza with tomato sauce, mozzarella cheese, and basil',
        pl: 'Prosta i pyszna pizza z sosem pomidorowym, serem mozzarella i bazylią',
        ko: '토마토 소스, 모짜렐라 치즈, 바질의 심플하고 맛있는 피자',
        zh: '配番茄酱、马苏里拉奶酪和罗勒的简单美味披萨'
      },
      price: 1400,
      image: 'https://www.web-komachi.com/wp-content/uploads/2023/08/az-dining-saku-pizza.jpg'
    }
  ],
  
  // Services and amenities
  services: {
    wifi: true,
    parking: true,
    wheelchair_accessible: true,
    private_rooms: false,
    delivery: false,
    takeout: true
  },
  
  // Owner information
  owner: {
    name: {
      ja: '田中 健一',
      en: 'Kenichi Tanaka',
      pl: 'Kenichi Tanaka',
      ko: '다나카 켄이치',
      zh: '田中健一'
    },
    title: {
      ja: 'オーナーシェフ',
      en: 'Owner Chef',
      pl: 'Szef Właściciel',
      ko: '오너 셰프',
      zh: '主厨老板'
    }
  }
};

// Helper function to get localized value
export function getAzDiningLocalizedValue(field: Record<string, string>, language: string): string {
  return field[language] || field['en'] || field['ja'] || Object.values(field)[0] || '';
}

// Helper function to check if this is AZ Dining Saku
export function isAzDiningSaku(restaurantName: string): boolean {
  const name = restaurantName.toLowerCase();
  return name.includes('az dining') || name.includes('azdining') || name.includes('佐久');
} 