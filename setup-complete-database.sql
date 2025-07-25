-- Complete Database Setup with 11-Language Support
-- Run this in your Supabase SQL Editor: https://qqcoooscyzhyzmrcvsxi.supabase.co

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  user_type TEXT NOT NULL CHECK (user_type IN ('customer', 'restaurant_owner', 'admin')),
  location_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_access table
CREATE TABLE IF NOT EXISTS admin_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('super_admin', 'admin', 'moderator')),
  permissions TEXT[] NOT NULL,
  access_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create restaurant_info table
CREATE TABLE IF NOT EXISTS restaurant_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  cuisine TEXT DEFAULT 'Other',
  description TEXT,
  subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('basic', 'premium', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'JPY',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('card', 'paypay')),
  last4 TEXT,
  brand TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'JPY',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create restaurants table with 11-language support
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  cuisine TEXT DEFAULT 'Other',
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  rating DECIMAL(3, 2) DEFAULT 0,
  price_range TEXT DEFAULT '$',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Additional fields for enhanced functionality
  image_url TEXT,
  opening_hours TEXT,
  phone_number TEXT,
  name_multilingual JSONB,
  address_multilingual JSONB,
  description_multilingual JSONB,
  external_booking_url TEXT,
  external_booking_url_en TEXT,
  notification_email TEXT,
  notification_line_id TEXT,
  komoju_merchant_id TEXT,
  payjp_merchant_id TEXT,
  menu_url TEXT
);

-- Create menus table with 11-language support
CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  category TEXT DEFAULT 'Main',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Additional fields for enhanced functionality
  name_multilingual JSONB,
  description_multilingual JSONB,
  image TEXT,
  spicy BOOLEAN DEFAULT false,
  vegetarian BOOLEAN DEFAULT false,
  gluten_free BOOLEAN DEFAULT false
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  party_size INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access to restaurants and menus
CREATE POLICY "public can read restaurants" ON restaurants
  FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "public can read menus" ON menus
  FOR SELECT TO anon USING (is_available = true);

-- Create RLS policies for users table - allow login functionality
-- Allow anonymous users to read user data by email for login purposes
CREATE POLICY "users can read by email for login" ON users
  FOR SELECT TO anon USING (true);

-- Allow authenticated users to read their own data
CREATE POLICY "users can read own data" ON users
  FOR SELECT TO authenticated USING (auth.uid()::text = id::text);

-- Allow authenticated users to update their own data
CREATE POLICY "users can update own data" ON users
  FOR UPDATE TO authenticated USING (auth.uid()::text = id::text);

-- Allow authenticated users to insert their own data
CREATE POLICY "users can insert own data" ON users
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = id::text);

-- Create RLS policies for admin_access table
CREATE POLICY "admins can read admin_access" ON admin_access
  FOR SELECT TO authenticated USING (user_id::text = auth.uid()::text);

CREATE POLICY "admins can insert admin_access" ON admin_access
  FOR INSERT TO authenticated WITH CHECK (user_id::text = auth.uid()::text);

-- Create RLS policies for other tables
CREATE POLICY "users can read own restaurant_info" ON restaurant_info
  FOR SELECT TO authenticated USING (user_id::text = auth.uid()::text);

CREATE POLICY "users can read own subscriptions" ON subscriptions
  FOR SELECT TO authenticated USING (user_id::text = auth.uid()::text);

CREATE POLICY "users can read own payment_methods" ON payment_methods
  FOR SELECT TO authenticated USING (user_id::text = auth.uid()::text);

CREATE POLICY "users can read own orders" ON orders
  FOR SELECT TO authenticated USING (user_id::text = auth.uid()::text);

CREATE POLICY "users can read own order_items" ON order_items
  FOR SELECT TO authenticated USING (order_id IN (
    SELECT id FROM orders WHERE user_id::text = auth.uid()::text
  ));

CREATE POLICY "users can read own reservations" ON reservations
  FOR SELECT TO authenticated USING (user_id::text = auth.uid()::text);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant_id ON reservations(restaurant_id);

-- Insert sample restaurant data with 11-language support
INSERT INTO restaurants (
  name, address, phone, cuisine, description, latitude, longitude, rating, price_range,
  image_url, opening_hours, phone_number, name_multilingual, address_multilingual, description_multilingual,
  external_booking_url, komoju_merchant_id, payjp_merchant_id, menu_url
) VALUES
(
  'AZ Dining Saku', 
  '123 Main Street, Saku, Nagano', 
  '+81-267-123-4567', 
  'Italian', 
  'Authentic Italian cuisine in the heart of Saku', 
  36.2048, 138.2529, 4.5, '$$',
  '/AZ Dining Saku/AZ inside.jpg',
  '11:00 - 22:00',
  '050-5266-1283',
  '{"en": "AZ Dining Saku", "ja": "AZ DINING 佐久店", "zh": "AZ餐厅佐久", "ko": "AZ 다이닝 사쿠", "pl": "AZ Dining Saku", "ms": "AZ Dining Saku", "id": "AZ Dining Saku", "th": "AZ Dining Saku", "vi": "AZ Dining Saku", "es": "AZ Dining Saku", "ro": "AZ Dining Saku"}',
  '{"en": "741 Iwamurata, Saku, Nagano Prefecture 385-0022", "ja": "〒385-0022 長野県佐久市岩村田741", "zh": "〒385-0022 长野县佐久市岩村田741", "ko": "〒385-0022 나가노현 사쿠시 이와무라타 741", "pl": "741 Iwamurata, Saku, Prefektura Nagano 385-0022", "ms": "741 Iwamurata, Saku, Prefektur Nagano 385-0022", "id": "741 Iwamurata, Saku, Prefektur Nagano 385-0022", "th": "741 Iwamurata, Saku, จังหวัดนากาโนะ 385-0022", "vi": "741 Iwamurata, Saku, Tỉnh Nagano 385-0022", "es": "741 Iwamurata, Saku, Prefectura de Nagano 385-0022", "ro": "741 Iwamurata, Saku, Prefectura Nagano 385-0022"}',
  '{"en": "Authentic Italian spaghetteria specializing in pasta dishes", "ja": "本格的なイタリアンスパゲッテリア", "zh": "正宗意大利面食店", "ko": "정통 이탈리안 스파게테리아", "pl": "Autentyczna włoska spaghetteria", "ms": "Spaghetteria Itali asli", "id": "Spaghetteria Italia otentik", "th": "สปาเก็ตเตอเรียอิตาลีแท้", "vi": "Spaghetteria Ý chính gốc", "es": "Spaghetteria italiana auténtica", "ro": "Spaghetteria italiană autentică"}',
  'https://www.slow-style.com/restaurants/azdining-saku/',
  'your-actual-komoju-merchant-id',
  'payjp_test_merchant_456',
  '/AZ Dining Saku/AZ menu.jpg'
),
(
  'Sakura Sushi', 
  '456 Cherry Blossom Ave, Saku', 
  '+81-267-234-5678', 
  'Japanese', 
  'Fresh sushi and traditional Japanese dishes', 
  36.2048, 138.2529, 4.3, '$$$',
  NULL,
  '11:00 - 21:00',
  '+81-267-234-5678',
  '{"en": "Sakura Sushi", "ja": "桜寿司", "zh": "樱花寿司", "ko": "사쿠라 스시", "pl": "Sakura Sushi", "ms": "Sakura Sushi", "id": "Sakura Sushi", "th": "ซากุระ ซูชิ", "vi": "Sakura Sushi", "es": "Sakura Sushi", "ro": "Sakura Sushi"}',
  '{"en": "456 Cherry Blossom Ave, Saku", "ja": "佐久市桜通り456", "zh": "佐久市樱花大道456", "ko": "사쿠시 벚꽃거리 456", "pl": "456 Aleja Wiśniowych Kwiatów, Saku", "ms": "456 Lebuh Bunga Sakura, Saku", "id": "456 Jalan Bunga Sakura, Saku", "th": "456 ถนนดอกซากุระ, ซากุ", "vi": "456 Đại lộ Hoa Anh đào, Saku", "es": "456 Avenida de las Flores de Cerezo, Saku", "ro": "456 Aleea Floarelor de Cireș, Saku"}',
  '{"en": "Fresh sushi and traditional Japanese dishes", "ja": "新鮮な寿司と伝統的な日本料理", "zh": "新鲜寿司和传统日本料理", "ko": "신선한 스시와 전통 일본 요리", "pl": "Świeże sushi i tradycyjne dania japońskie", "ms": "Sushi segar dan hidangan Jepun tradisional", "id": "Sushi segar dan hidangan Jepang tradisional", "th": "ซูชิสดและอาหารญี่ปุ่นดั้งเดิม", "vi": "Sushi tươi và món ăn Nhật truyền thống", "es": "Sushi fresco y platos japoneses tradicionales", "ro": "Sushi proaspăt și feluri de mâncare japoneze tradiționale"}',
  NULL,
  NULL,
  NULL,
  NULL
),
(
  'Café Europa', 
  '789 European Plaza, Saku', 
  '+81-267-345-6789', 
  'European', 
  'European-style café with pastries and coffee', 
  36.2048, 138.2529, 4.1, '$',
  NULL,
  '08:00 - 18:00',
  '+81-267-345-6789',
  '{"en": "Café Europa", "ja": "カフェ・ヨーロッパ", "zh": "欧洲咖啡厅", "ko": "카페 유럽", "pl": "Café Europa", "ms": "Café Europa", "id": "Café Europa", "th": "คาเฟ่ ยุโรป", "vi": "Café Europa", "es": "Café Europa", "ro": "Café Europa"}',
  '{"en": "789 European Plaza, Saku", "ja": "佐久市ヨーロッパ広場789", "zh": "佐久市欧洲广场789", "ko": "사쿠시 유럽광장 789", "pl": "789 Europejski Plac, Saku", "ms": "789 Dataran Eropah, Saku", "id": "789 Plaza Eropa, Saku", "th": "789 จัตุรัสยุโรป, ซากุ", "vi": "789 Quảng trường Châu Âu, Saku", "es": "789 Plaza Europea, Saku", "ro": "789 Piața Europeană, Saku"}',
  '{"en": "European-style café with pastries and coffee", "ja": "ヨーロッパ風カフェ、ペイストリーとコーヒー", "zh": "欧式咖啡厅，提供糕点和咖啡", "ko": "유럽풍 카페, 페이스트리와 커피", "pl": "Kawiarnia w stylu europejskim z ciastkami i kawą", "ms": "Kafe gaya Eropah dengan pastri dan kopi", "id": "Kafe bergaya Eropa dengan pastry dan kopi", "th": "คาเฟ่สไตล์ยุโรปพร้อมขนมอบและกาแฟ", "vi": "Quán cà phê kiểu châu Âu với bánh ngọt và cà phê", "es": "Café de estilo europeo con pastelería y café", "ro": "Cafenea în stil european cu patiserie și cafea"}',
  NULL,
  NULL,
  NULL,
  NULL
);

-- Insert sample menu items with 11-language support
INSERT INTO menus (restaurant_id, name, description, price, category, name_multilingual, description_multilingual) VALUES
((SELECT id FROM restaurants WHERE name = 'AZ Dining Saku' LIMIT 1), 'Carbonara', 'Classic Italian pasta with eggs, cheese, and pancetta', 1200, 'Main', '{"en": "Carbonara", "ja": "カルボナーラ", "zh": "卡邦尼拉", "ko": "카르보나라", "pl": "Carbonara", "ms": "Carbonara", "id": "Carbonara", "th": "คาร์โบนารา", "vi": "Carbonara", "es": "Carbonara", "ro": "Carbonara"}', '{"en": "Classic Italian pasta with eggs, cheese, and pancetta", "ja": "卵、チーズ、パンチェッタを使った本格的なイタリアンパスタ", "zh": "使用鸡蛋、奶酪和意式培根的经典意大利面", "ko": "계란, 치즈, 판체타를 사용한 정통 이탈리안 파스타", "pl": "Klasyczny włoski makaron z jajkami, serem i pancettą", "ms": "Pasta Itali klasik dengan telur, keju dan pancetta", "id": "Pasta Italia klasik dengan telur, keju dan pancetta", "th": "พาสต้าอิตาลีคลาสสิกกับไข่ ชีส และแพนเชตต้า", "vi": "Mì Ý cổ điển với trứng, phô mai và pancetta", "es": "Pasta italiana clásica con huevos, queso y panceta", "ro": "Paste italiene clasice cu ouă, brânză și pancetta"}'),
((SELECT id FROM restaurants WHERE name = 'AZ Dining Saku' LIMIT 1), 'Margherita Pizza', 'Traditional pizza with tomato and mozzarella', 1500, 'Main', '{"en": "Margherita Pizza", "ja": "マルゲリータピザ", "zh": "玛格丽特披萨", "ko": "마르게리타 피자", "pl": "Pizza Margherita", "ms": "Pizza Margherita", "id": "Pizza Margherita", "th": "พิซซ่ามาร์เกอริต้า", "vi": "Pizza Margherita", "es": "Pizza Margherita", "ro": "Pizza Margherita"}', '{"en": "Traditional pizza with tomato and mozzarella", "ja": "トマトとモッツァレラの伝統的なピザ", "zh": "使用番茄和马苏里拉奶酪的传统披萨", "ko": "토마토와 모짜렐라를 사용한 전통 피자", "pl": "Tradycyjna pizza z pomidorami i mozzarellą", "ms": "Pizza tradisional dengan tomato dan mozzarella", "id": "Pizza tradisional dengan tomat dan mozzarella", "th": "พิซซ่าแบบดั้งเดิมกับมะเขือเทศและมอสซาเรลล่า", "vi": "Pizza truyền thống với cà chua và mozzarella", "es": "Pizza tradicional con tomate y mozzarella", "ro": "Pizza tradițională cu roșii și mozzarella"}'),
((SELECT id FROM restaurants WHERE name = 'Sakura Sushi' LIMIT 1), 'Salmon Nigiri', 'Fresh salmon sushi', 300, 'Sushi', '{"en": "Salmon Nigiri", "ja": "サーモン握り", "zh": "三文鱼握寿司", "ko": "연어 니기리", "pl": "Nigiri z łososiem", "ms": "Nigiri Salmon", "id": "Nigiri Salmon", "th": "นิกิริแซลมอน", "vi": "Nigiri Cá hồi", "es": "Nigiri de Salmón", "ro": "Nigiri cu Somon"}', '{"en": "Fresh salmon sushi", "ja": "新鮮なサーモンの握り寿司", "zh": "新鲜三文鱼握寿司", "ko": "신선한 연어 니기리 스시", "pl": "Świeże sushi z łososiem", "ms": "Sushi salmon segar", "id": "Sushi salmon segar", "th": "ซูชิแซลมอนสด", "vi": "Sushi cá hồi tươi", "es": "Sushi de salmón fresco", "ro": "Sushi cu somon proaspăt"}'),
((SELECT id FROM restaurants WHERE name = 'Sakura Sushi' LIMIT 1), 'Tuna Roll', 'Spicy tuna roll', 800, 'Sushi', '{"en": "Tuna Roll", "ja": "マグロロール", "zh": "金枪鱼卷", "ko": "참치 롤", "pl": "Rolka z tuńczykiem", "ms": "Roll Tuna", "id": "Roll Tuna", "th": "โรลทูน่า", "vi": "Roll Cá ngừ", "es": "Roll de Atún", "ro": "Roll cu Ton"}', '{"en": "Spicy tuna roll", "ja": "スパイシーマグロロール", "zh": "辣味金枪鱼卷", "ko": "매운 참치 롤", "pl": "Ostra rolka z tuńczykiem", "ms": "Roll tuna pedas", "id": "Roll tuna pedas", "th": "โรลทูน่าเผ็ด", "vi": "Roll cá ngừ cay", "es": "Roll de atún picante", "ro": "Roll cu ton picant"}'),
((SELECT id FROM restaurants WHERE name = 'Café Europa' LIMIT 1), 'Croissant', 'Buttery French croissant', 250, 'Pastry', '{"en": "Croissant", "ja": "クロワッサン", "zh": "牛角面包", "ko": "크루아상", "pl": "Croissant", "ms": "Croissant", "id": "Croissant", "th": "ครัวซองต์", "vi": "Croissant", "es": "Croissant", "ro": "Croissant"}', '{"en": "Buttery French croissant", "ja": "バターたっぷりのフランス風クロワッサン", "zh": "黄油丰富的法式牛角面包", "ko": "버터가 풍부한 프랑스식 크루아상", "pl": "Maślany francuski croissant", "ms": "Croissant Perancis berkrim", "id": "Croissant Prancis berlemak", "th": "ครัวซองต์ฝรั่งเศสที่มีเนย", "vi": "Croissant Pháp bơ", "es": "Croissant francés con mantequilla", "ro": "Croissant francez cu unt"}'),
((SELECT id FROM restaurants WHERE name = 'Café Europa' LIMIT 1), 'Cappuccino', 'Italian coffee with steamed milk', 400, 'Beverage', '{"en": "Cappuccino", "ja": "カプチーノ", "zh": "卡布奇诺", "ko": "카푸치노", "pl": "Cappuccino", "ms": "Cappuccino", "id": "Cappuccino", "th": "คาปูชิโน", "vi": "Cappuccino", "es": "Cappuccino", "ro": "Cappuccino"}', '{"en": "Italian coffee with steamed milk", "ja": "蒸気で温めたミルクを使ったイタリアンコーヒー", "zh": "使用蒸汽加热牛奶的意大利咖啡", "ko": "증기로 데운 우유를 사용한 이탈리안 커피", "pl": "Włoska kawa z mlekiem na parze", "ms": "Kopi Itali dengan susu kukus", "id": "Kopi Italia dengan susu kukus", "th": "กาแฟอิตาลีกับนมร้อน", "vi": "Cà phê Ý với sữa hấp", "es": "Café italiano con leche al vapor", "ro": "Cafea italiană cu lapte aburit"}');

-- Verify the setup
SELECT 'Database setup completed successfully!' as status;
SELECT 'Restaurants with 11-language support:' as info;
SELECT name, name_multilingual, address_multilingual, description_multilingual 
FROM restaurants;

SELECT 'Menus with 11-language support:' as info;
SELECT name, name_multilingual, description_multilingual 
FROM menus; 