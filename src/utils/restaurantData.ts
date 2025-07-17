// Comprehensive restaurant and menu data
export interface MenuItem {
  id: string;
  name: Record<string, string>; // Multilingual name
  description?: Record<string, string>; // Multilingual description
  price: number;
  category: string;
  image?: string;
  available: boolean;
  spicy?: boolean;
  vegetarian?: boolean;
  glutenFree?: boolean;
}

export interface Restaurant {
  id: string;
  name: Record<string, string>; // Multilingual name
  description?: Record<string, string>; // Multilingual description
  address?: Record<string, string>; // Multilingual address
  cuisine: string;
  rating: number;
  priceRange: string;
  distance: string;
  image: string;
  openHours: string;
  phone: string;
  isOpen: boolean;
  location?: string;
  image_url?: string;
  opening_hours?: string;
  phone_number?: string;
  name_multilingual?: Record<string, string>;
  address_multilingual?: Record<string, string>;
  description_multilingual?: Record<string, string>;
  // Reservation fields
  external_booking_url?: string;
  external_booking_url_en?: string;
  notification_email?: string;
  notification_line_id?: string;
  // Menu data
  menu?: MenuItem[];
  menuUrl?: string;
  // Payment integration
  komoju_merchant_id?: string;
  payjp_merchant_id?: string;
}

// Sample restaurant data with menus
export const sampleRestaurants: Restaurant[] = [
  {
    id: 'az-dining-saku',
    name: {
      en: 'AZ Dining Saku',
      ja: 'AZ DINING 佐久店',
      zh: 'AZ餐厅佐久',
      ko: 'AZ 다이닝 사쿠'
    },
    description: {
      en: 'Authentic Italian spaghetteria specializing in pasta dishes centered around carbonara, along with cafe menus. Located within Tsudoi no Yakata Kotesanne.',
      ja: '佐久市岩村田にある本格的なイタリアンスパゲッテリア。カルボナーラを中心としたパスタ料理とカフェメニューを提供。つどいの館こてさんね内に位置し、地元の方々に愛されるレストランです。',
      zh: '位于佐久市岩村田的正宗意大利面食店。专门提供以卡邦尼拉为主的意大利面料理和咖啡厅菜单。位于聚会馆小铁山内。',
      ko: '사쿠시 이와무라타에 위치한 정통 이탈리안 스파게테리아입니다. 카르보나라를 중심으로 한 파스타 요리와 카페 메뉴를 제공합니다. 츠도이노야카타 코테산네 내에 위치해 있습니다.'
    },
    address: {
      en: '741 Iwamurata, Saku, Nagano Prefecture 385-0022 (Inside Tsudoi no Yakata Kotesanne)',
      ja: '〒385-0022 長野県佐久市岩村田741 つどいの館こてさんね内',
      zh: '〒385-0022 长野县佐久市岩村田741 聚会馆小铁山内',
      ko: '〒385-0022 나가노현 사쿠시 이와무라타 741 츠도이노야카타 코테산네 내'
    },
    cuisine: 'Italian',
    rating: 4.5,
    priceRange: '¥¥',
    distance: '0.3 km',
    image: '/AZ Dining Saku/AZ inside.jpg',
    openHours: '11:00 - 22:00',
    phone: '050-5266-1283',
    isOpen: true,
    opening_hours: '11:00-15:00 (L.O 14:30), 17:00-20:00 (L.O 19:30)',
    phone_number: '050-5266-1283',
    external_booking_url: 'https://www.slow-style.com/restaurants/azdining-saku/',
    // Payment integration
    komoju_merchant_id: 'komoju_test_merchant_123',
    payjp_merchant_id: 'payjp_test_merchant_456',
    // Coordinates for distance calculation
    latitude: 36.248,
    longitude: 138.248,
    menuUrl: '/AZ Dining Saku/AZ menu.jpg',
    menu: [
      {
        id: 'az-1',
        name: {
          en: 'Carbonara',
          ja: 'カルボナーラ',
          zh: '卡邦尼拉',
          ko: '카르보나라'
        },
        description: {
          en: 'Classic Italian pasta with eggs, cheese, pancetta, and black pepper',
          ja: '卵、チーズ、パンチェッタ、黒胡椒を使った本格的なイタリアンパスタ',
          zh: '使用鸡蛋、奶酪、意式培根和黑胡椒的经典意大利面',
          ko: '계란, 치즈, 판체타, 후추를 사용한 정통 이탈리안 파스타'
        },
        price: 1300,
        category: 'Pasta',
        image: '/AZ Dining Saku/Carbonara set AZ.jpg',
        available: true
      },
      {
        id: 'az-2',
        name: {
          en: 'Spaghetti with Lemon',
          ja: 'レモンスパゲッティ',
          zh: '柠檬意面',
          ko: '레몬 스파게티'
        },
        description: {
          en: 'Fresh spaghetti with lemon zest, olive oil, and herbs',
          ja: 'レモンの皮、オリーブオイル、ハーブを使ったフレッシュなスパゲッティ',
          zh: '使用柠檬皮、橄榄油和香草的新鲜意面',
          ko: '레몬 껍질, 올리브 오일, 허브를 사용한 신선한 스파게티'
        },
        price: 1200,
        category: 'Pasta',
        image: '/AZ Dining Saku/Tagliatele AZ.jpg',
        available: true
      },
      {
        id: 'az-3',
        name: {
          en: 'Mushroom Pasta',
          ja: 'キノコパスタ',
          zh: '蘑菇意面',
          ko: '버섯 파스타'
        },
        description: {
          en: 'Pasta with mixed mushrooms in a creamy sauce',
          ja: 'クリームソースでキノコをたっぷり使ったパスタ',
          zh: '奶油酱汁配混合蘑菇的意面',
          ko: '크림 소스에 버섯을 듬뿍 넣은 파스타'
        },
        price: 1400,
        category: 'Pasta',
        image: '/AZ Dining Saku/Tagliatele AZ.jpg',
        available: true
      },
      {
        id: 'az-4',
        name: {
          en: 'Seafood Pasta',
          ja: 'シーフードパスタ',
          zh: '海鲜意面',
          ko: '해산물 파스타'
        },
        description: {
          en: 'Pasta with fresh seafood and rich tomato sauce',
          ja: '新鮮なシーフードとリッチなトマトソースのパスタ',
          zh: '新鲜海鲜配浓郁番茄酱的意面',
          ko: '신선한 해산물과 진한 토마토 소스의 파스타'
        },
        price: 1600,
        category: 'Pasta',
        image: '/AZ Dining Saku/Tagliatele AZ.jpg',
        available: true
      },
      {
        id: 'az-5',
        name: {
          en: 'Set Menu A',
          ja: 'セットメニューA',
          zh: '套餐A',
          ko: '세트 메뉴 A'
        },
        description: {
          en: 'Pasta of your choice with soup, salad, and dessert',
          ja: 'お好みのパスタにスープ、サラダ、デザート付き',
          zh: '自选意面配汤、沙拉和甜点',
          ko: '원하는 파스타에 수프, 샐러드, 디저트 포함'
        },
        price: 1800,
        category: 'Set Menu',
        image: '/AZ Dining Saku/Carbonara set AZ.jpg',
        available: true
      },
      {
        id: 'az-6',
        name: {
          en: 'Set Menu B',
          ja: 'セットメニューB',
          zh: '套餐B',
          ko: '세트 메뉴 B'
        },
        description: {
          en: 'Premium pasta with soup, salad, dessert, and coffee',
          ja: 'プレミアムパスタにスープ、サラダ、デザート、コーヒー付き',
          zh: '高级意面配汤、沙拉、甜点和咖啡',
          ko: '프리미엄 파스타에 수프, 샐러드, 디저트, 커피 포함'
        },
        price: 2200,
        category: 'Set Menu',
        image: '/AZ Dining Saku/Carbonara set AZ.jpg',
        available: true
      }
    ]
  },
  {
    id: 'sushi-umi',
    name: {
      en: 'Sushi Dokoro Umi',
      ja: '寿司処 海',
      zh: '寿司处 海',
      ko: '스시도코로 우미'
    },
    description: {
      en: 'Premium sushi restaurant specializing in fresh seafood',
      ja: '新鮮な魚介類に特化した高級寿司店',
      zh: '专营新鲜海鲜的高级寿司店',
      ko: '신선한 해산물에 특화된 프리미엄 스시집'
    },
    address: {
      en: '456 Ocean Avenue, Saku City, Nagano',
      ja: '長野県佐久市海通り456',
      zh: '长野县佐久市海通456',
      ko: '나가노현 사쿠시 우미도리 456'
    },
    cuisine: 'Sushi',
    rating: 4.9,
    priceRange: '¥¥¥',
    distance: '1.2 km',
    image: '',
    openHours: '11:30 - 21:30',
    phone: '+81-267-123-4568',
    isOpen: true,
    opening_hours: '11:30 - 21:30',
    phone_number: '+81-267-123-4568',
    // Payment integration
    komoju_merchant_id: 'komoju_test_merchant_789',
    payjp_merchant_id: 'payjp_test_merchant_012',
    // Coordinates for distance calculation
    latitude: 36.250,
    longitude: 138.250,
    menu: [
      {
        id: 'umi-1',
        name: {
          en: 'Premium Tuna Sashimi',
          ja: '本マグロ刺身',
          zh: '金枪鱼刺身',
          ko: '참치 회'
        },
        description: {
          en: 'Fresh bluefin tuna sashimi with wasabi and soy sauce',
          ja: '新鮮な本マグロの刺身、わさびと醤油付き',
          zh: '新鲜蓝鳍金枪鱼刺身配芥末和酱油',
          ko: '신선한 참치 회, 와사비와 간장 포함'
        },
        price: 2800,
        category: 'Sashimi',
        image: '',
        available: true
      },
      {
        id: 'umi-2',
        name: {
          en: 'Dragon Roll',
          ja: 'ドラゴンロール',
          zh: '龙卷',
          ko: '드래곤 롤'
        },
        description: {
          en: 'Eel and avocado roll topped with spicy tuna',
          ja: 'うなぎとアボカドのロールにスパイシーツナをトッピング',
          zh: '鳗鱼牛油果卷配辣金枪鱼',
          ko: '장어와 아보카도 롤에 매운 참치 토핑'
        },
        price: 1800,
        category: 'Sushi',
        image: '',
        available: true
      }
    ]
  },
  {
    id: 'ramen-ryu',
    name: {
      en: 'Ramen Ryu',
      ja: 'ラーメン 龍',
      zh: '拉面 龙',
      ko: '라멘 류'
    },
    description: {
      en: 'Authentic ramen shop with rich broths and handmade noodles',
      ja: '濃厚なスープと手打ち麺の本格ラーメン店',
      zh: '浓郁汤底和手工面条的正宗拉面店',
      ko: '진한 국물과 수제 면의 정통 라멘집'
    },
    address: {
      en: '789 Dragon Street, Saku City, Nagano',
      ja: '長野県佐久市龍町789',
      zh: '长野县佐久市龙町789',
      ko: '나가노현 사쿠시 류마치 789'
    },
    cuisine: 'Ramen',
    rating: 4.6,
    priceRange: '¥¥',
    distance: '0.8 km',
    image: '',
    openHours: '11:00 - 23:00',
    phone: '+81-267-123-4569',
    isOpen: true,
    opening_hours: '11:00 - 23:00',
    phone_number: '+81-267-123-4569',
    // Payment integration
    komoju_merchant_id: 'komoju_test_merchant_345',
    payjp_merchant_id: 'payjp_test_merchant_678',
    // Coordinates for distance calculation
    latitude: 36.246,
    longitude: 138.246,
    menu: [
      {
        id: 'ryu-1',
        name: {
          en: 'Seafood Bowl',
          ja: '海鮮丼',
          zh: '海鲜盖饭',
          ko: '해산물 덮밥'
        },
        description: {
          en: 'Fresh seafood over rice with wasabi and soy sauce',
          ja: '新鮮な魚介類の丼、わさびと醤油付き',
          zh: '新鲜海鲜盖饭配芥末和酱油',
          ko: '신선한 해산물 덮밥, 와사비와 간장 포함'
        },
        price: 1800,
        category: 'Rice Bowl',
        image: '',
        available: true
      },
      {
        id: 'ryu-2',
        name: {
          en: 'Spicy Miso Ramen',
          ja: '辛味噌ラーメン',
          zh: '辣味噌拉面',
          ko: '매운 미소 라멘'
        },
        description: {
          en: 'Spicy miso broth with chashu, corn, and green onions',
          ja: '辛い味噌スープにチャーシュー、コーン、ネギ',
          zh: '辣味噌汤配叉烧、玉米和葱花',
          ko: '매운 미소 국물에 차슈, 옥수수, 파'
        },
        price: 1200,
        category: 'Ramen',
        image: '',
        available: true,
        spicy: true
      }
    ]
  }
];

// Helper function to get restaurant by ID
export const getRestaurantById = (id: string): Restaurant | undefined => {
  return sampleRestaurants.find(restaurant => restaurant.id === id);
};

// Helper function to get all restaurants
export const getAllRestaurants = (): Restaurant[] => {
  return sampleRestaurants;
};

// Helper function to get menu items for a restaurant
export const getRestaurantMenu = (restaurantId: string): MenuItem[] => {
  const restaurant = getRestaurantById(restaurantId);
  return restaurant?.menu || [];
};

// Helper function to get all menu items across all restaurants
export const getAllMenuItems = (): Array<MenuItem & { restaurantId: string; restaurantName: Record<string, string> }> => {
  const allItems: Array<MenuItem & { restaurantId: string; restaurantName: Record<string, string> }> = [];
  
  sampleRestaurants.forEach(restaurant => {
    if (restaurant.menu) {
      restaurant.menu.forEach(item => {
        allItems.push({
          ...item,
          restaurantId: restaurant.id,
          restaurantName: restaurant.name
        });
      });
    }
  });
  
  return allItems;
}; 