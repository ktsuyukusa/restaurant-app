-- Updated database schema for restaurant management system
-- Run this after your existing schema.sql

-- Create menu_items table with multilingual support
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_ja TEXT,
  name_zh TEXT,
  name_ko TEXT,
  description_en TEXT,
  description_ja TEXT,
  description_zh TEXT,
  description_ko TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_spicy BOOLEAN DEFAULT false,
  is_vegetarian BOOLEAN DEFAULT false,
  is_gluten_free BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  pickup_time TEXT,
  notes TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  payment_method TEXT DEFAULT 'stripe',
  payment_session_id TEXT,
  items JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  guests INTEGER NOT NULL DEFAULT 2,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update restaurants table to support multilingual fields properly
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS name_ja TEXT,
ADD COLUMN IF NOT EXISTS name_zh TEXT,
ADD COLUMN IF NOT EXISTS name_ko TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_ja TEXT,
ADD COLUMN IF NOT EXISTS description_zh TEXT,
ADD COLUMN IF NOT EXISTS description_ko TEXT,
ADD COLUMN IF NOT EXISTS address_en TEXT,
ADD COLUMN IF NOT EXISTS address_ja TEXT,
ADD COLUMN IF NOT EXISTS address_zh TEXT,
ADD COLUMN IF NOT EXISTS address_ko TEXT;

-- Enable RLS on new tables
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menu_items
CREATE POLICY "Menu items are viewable by everyone" ON public.menu_items
  FOR SELECT USING (true);

CREATE POLICY "Restaurant owners can manage their menu items" ON public.menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'restaurant_owner'
    )
  );

CREATE POLICY "Admins can manage all menu items" ON public.menu_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- RLS Policies for orders
CREATE POLICY "Orders are viewable by restaurant owners and admins" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type IN ('restaurant_owner', 'admin')
    )
  );

CREATE POLICY "Restaurant owners can manage their orders" ON public.orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type IN ('restaurant_owner', 'admin')
    )
  );

-- RLS Policies for reservations
CREATE POLICY "Reservations are viewable by restaurant owners and admins" ON public.reservations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type IN ('restaurant_owner', 'admin')
    )
  );

CREATE POLICY "Restaurant owners can manage their reservations" ON public.reservations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type IN ('restaurant_owner', 'admin')
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON public.menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON public.orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_reservations_restaurant_id ON public.reservations(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON public.reservations(reservation_date);

-- Insert sample data for testing (optional)
-- This will help you test the restaurant management features

-- Sample restaurant (you can modify this)
INSERT INTO public.restaurants (
  name, name_en, name_ja, name_zh, name_ko,
  address, address_en, address_ja, address_zh, address_ko,
  phone, cuisine, rating, price_range, is_active,
  latitude, longitude, opening_hours
) VALUES (
  'Test Restaurant',
  'Test Restaurant',
  'テストレストラン',
  '测试餐厅',
  '테스트 레스토랑',
  'Test Address',
  'Test Address',
  'テスト住所',
  '测试地址',
  '테스트 주소',
  '080-1234-5678',
  'Italian',
  4.5,
  '$$',
  true,
  36.248,
  138.248,
  '11:00-22:00'
) ON CONFLICT DO NOTHING;