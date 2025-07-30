-- Subscription and Payment System Schema
-- Run this after the main database schema

-- Create subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_code TEXT UNIQUE NOT NULL, -- 'starter', 'standard', 'premium'
  name_en TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  description_en TEXT,
  description_ja TEXT,
  features JSONB NOT NULL, -- Array of features
  max_menu_items INTEGER,
  max_languages INTEGER,
  has_reservations BOOLEAN DEFAULT false,
  has_analytics BOOLEAN DEFAULT false,
  has_api_access BOOLEAN DEFAULT false,
  has_multi_location BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pricing table for regional pricing
CREATE TABLE IF NOT EXISTS public.subscription_pricing (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  country_code TEXT NOT NULL, -- 'JP', 'KR', 'MY', 'TH', 'ID', 'VN', 'PL', 'RO'
  currency TEXT NOT NULL, -- 'JPY', 'KRW', 'MYR', 'THB', 'IDR', 'VND', 'PLN', 'RON'
  price_monthly INTEGER NOT NULL, -- Price in smallest currency unit (cents/yen)
  price_yearly INTEGER, -- Annual pricing with discount
  multiplier DECIMAL(3,2) NOT NULL, -- Regional pricing multiplier
  stripe_price_id TEXT, -- Stripe price ID for this region/plan
  paypal_plan_id TEXT, -- PayPal plan ID
  komoju_plan_id TEXT, -- Komoju plan ID for Japan
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plan_id, country_code)
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  trial_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  
  -- Payment provider integration IDs
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  paypal_subscription_id TEXT,
  komoju_subscription_id TEXT,
  
  -- Billing details
  country_code TEXT NOT NULL,
  currency TEXT NOT NULL,
  amount INTEGER NOT NULL, -- Monthly amount in smallest currency unit
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payments table for transaction history
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled', 'refunded')),
  payment_method TEXT, -- 'card', 'bank_transfer', 'convenience_store', etc.
  payment_provider TEXT NOT NULL, -- 'stripe', 'paypal', 'komoju'
  
  -- Provider-specific IDs
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  paypal_payment_id TEXT,
  komoju_payment_id TEXT,
  
  -- Metadata
  description TEXT,
  receipt_url TEXT,
  failure_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscription usage tracking
CREATE TABLE IF NOT EXISTS public.subscription_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL, -- 'menu_items', 'orders', 'api_calls'
  current_usage INTEGER DEFAULT 0,
  limit_value INTEGER,
  reset_date TIMESTAMPTZ, -- When usage resets (monthly)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subscription_id, metric_name)
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (plan_code, name_en, name_ja, description_en, description_ja, features, max_menu_items, max_languages, has_reservations, has_analytics, has_api_access, has_multi_location) VALUES
('starter', 'Starter Plan', 'スタータープラン', 'Perfect for small restaurants and cafes', '小規模レストランやカフェに最適', 
 '["Basic restaurant profile", "Menu management", "Order notifications", "QR code menu", "Basic analytics"]'::jsonb, 
 50, 2, false, false, false, false),
 
('standard', 'Standard Plan', 'スタンダードプラン', 'Ideal for growing restaurants', '成長中のレストランに理想的', 
 '["Everything in Starter", "Unlimited menu items", "Reservation management", "5 languages", "Advanced analytics", "Social media integration", "Custom QR branding"]'::jsonb, 
 -1, 5, true, true, false, false),
 
('premium', 'Premium Plan', 'プレミアムプラン', 'Complete solution for restaurant chains', 'レストランチェーン向けの完全ソリューション', 
 '["Everything in Standard", "Multi-location support", "All languages (12+)", "Custom branding", "API access", "Priority support", "Advanced integrations"]'::jsonb, 
 -1, 12, true, true, true, true);

-- Insert regional pricing
INSERT INTO public.subscription_pricing (plan_id, country_code, currency, price_monthly, price_yearly, multiplier) 
SELECT 
  sp.id,
  country.code,
  country.currency,
  CASE 
    WHEN sp.plan_code = 'starter' THEN (2980 * country.multiplier)::INTEGER
    WHEN sp.plan_code = 'standard' THEN (5980 * country.multiplier)::INTEGER  
    WHEN sp.plan_code = 'premium' THEN (12800 * country.multiplier)::INTEGER
  END,
  CASE 
    WHEN sp.plan_code = 'starter' THEN (2980 * 10 * country.multiplier)::INTEGER -- 10 months price for yearly
    WHEN sp.plan_code = 'standard' THEN (5980 * 10 * country.multiplier)::INTEGER
    WHEN sp.plan_code = 'premium' THEN (12800 * 10 * country.multiplier)::INTEGER
  END,
  country.multiplier
FROM public.subscription_plans sp
CROSS JOIN (
  VALUES 
    ('JP', 'JPY', 1.0),
    ('KR', 'KRW', 1.0),
    ('MY', 'MYR', 0.6),
    ('TH', 'THB', 0.6),
    ('ID', 'IDR', 0.4),
    ('VN', 'VND', 0.4),
    ('PL', 'PLN', 0.7),
    ('RO', 'RON', 0.5)
) AS country(code, currency, multiplier);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_restaurant_id ON public.subscriptions(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON public.subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON public.payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_subscription_pricing_country ON public.subscription_pricing(country_code);

-- Enable RLS on new tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription plans (public read)
CREATE POLICY "Subscription plans are viewable by everyone" ON public.subscription_plans
  FOR SELECT USING (true);

-- RLS Policies for subscription pricing (public read)
CREATE POLICY "Subscription pricing is viewable by everyone" ON public.subscription_pricing
  FOR SELECT USING (true);

-- RLS Policies for subscriptions (restaurant owners and admins)
CREATE POLICY "Restaurant owners can view their subscriptions" ON public.subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND (
        profiles.user_type = 'admin' OR
        (profiles.user_type = 'restaurant_owner' AND 
         EXISTS (SELECT 1 FROM public.restaurants WHERE restaurants.id = subscriptions.restaurant_id))
      )
    )
  );

CREATE POLICY "Admins can manage all subscriptions" ON public.subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );

-- RLS Policies for payments (same as subscriptions)
CREATE POLICY "Restaurant owners can view their payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      JOIN public.subscriptions ON subscriptions.id = payments.subscription_id
      WHERE profiles.id = auth.uid() 
      AND (
        profiles.user_type = 'admin' OR
        (profiles.user_type = 'restaurant_owner' AND 
         EXISTS (SELECT 1 FROM public.restaurants WHERE restaurants.id = subscriptions.restaurant_id))
      )
    )
  );

CREATE POLICY "Admins can manage all payments" ON public.payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'admin'
    )
  );