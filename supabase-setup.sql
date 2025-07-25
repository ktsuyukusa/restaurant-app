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

-- Create restaurants table if not exists
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menus table if not exists
CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  category TEXT DEFAULT 'Main',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reservations table if not exists
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

-- Insert sample restaurant data
INSERT INTO restaurants (name, address, phone, cuisine, description, latitude, longitude, rating, price_range) VALUES
('AZ Dining Saku', '123 Main Street, Saku, Nagano', '+81-267-123-4567', 'Italian', 'Authentic Italian cuisine in the heart of Saku', 36.2048, 138.2529, 4.5, '$$'),
('Sakura Sushi', '456 Cherry Blossom Ave, Saku', '+81-267-234-5678', 'Japanese', 'Fresh sushi and traditional Japanese dishes', 36.2048, 138.2529, 4.3, '$$$'),
('Café Europa', '789 European Plaza, Saku', '+81-267-345-6789', 'European', 'European-style café with pastries and coffee', 36.2048, 138.2529, 4.1, '$');

-- Insert sample menu items
INSERT INTO menus (restaurant_id, name, description, price, category) VALUES
((SELECT id FROM restaurants WHERE name = 'AZ Dining Saku' LIMIT 1), 'Carbonara', 'Classic Italian pasta with eggs, cheese, and pancetta', 1200, 'Main'),
((SELECT id FROM restaurants WHERE name = 'AZ Dining Saku' LIMIT 1), 'Margherita Pizza', 'Traditional pizza with tomato and mozzarella', 1500, 'Main'),
((SELECT id FROM restaurants WHERE name = 'Sakura Sushi' LIMIT 1), 'Salmon Nigiri', 'Fresh salmon sushi', 300, 'Sushi'),
((SELECT id FROM restaurants WHERE name = 'Sakura Sushi' LIMIT 1), 'Tuna Roll', 'Spicy tuna roll', 800, 'Sushi'),
((SELECT id FROM restaurants WHERE name = 'Café Europa' LIMIT 1), 'Croissant', 'Buttery French croissant', 250, 'Pastry'),
((SELECT id FROM restaurants WHERE name = 'Café Europa' LIMIT 1), 'Cappuccino', 'Italian coffee with steamed milk', 400, 'Beverage'); 