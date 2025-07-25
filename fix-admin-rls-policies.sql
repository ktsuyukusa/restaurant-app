-- Fix RLS Policies for Admin Account Creation
-- Run this in your Supabase SQL Editor: https://qqcoooscyzhyzmrcvsxi.supabase.co

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "users can read by email for login" ON users;
DROP POLICY IF EXISTS "users can read own data" ON users;
DROP POLICY IF EXISTS "users can update own data" ON users;
DROP POLICY IF EXISTS "users can insert own data" ON users;

-- Create more permissive policies for user registration and admin creation
-- Allow anonymous users to insert new users (for registration)
CREATE POLICY "allow user registration" ON users
  FOR INSERT TO anon WITH CHECK (true);

-- Allow authenticated users to insert their own data
CREATE POLICY "users can insert own data" ON users
  FOR INSERT TO authenticated WITH CHECK (auth.uid()::text = id::text);

-- Allow users to read their own data
CREATE POLICY "users can read own data" ON users
  FOR SELECT TO authenticated USING (auth.uid()::text = id::text);

-- Allow users to read by email for login purposes
CREATE POLICY "users can read by email for login" ON users
  FOR SELECT TO anon USING (true);

-- Allow users to update their own data
CREATE POLICY "users can update own data" ON users
  FOR UPDATE TO authenticated USING (auth.uid()::text = id::text);

-- Fix admin_access policies
DROP POLICY IF EXISTS "admins can read admin_access" ON admin_access;
DROP POLICY IF EXISTS "admins can insert admin_access" ON admin_access;

-- Allow admin access creation for registration
CREATE POLICY "allow admin access creation" ON admin_access
  FOR INSERT TO anon WITH CHECK (true);

-- Allow users to read their own admin access
CREATE POLICY "users can read own admin access" ON admin_access
  FOR SELECT TO authenticated USING (user_id::text = auth.uid()::text);

-- Allow users to read admin access by user_id for verification
CREATE POLICY "users can read admin access by user_id" ON admin_access
  FOR SELECT TO anon USING (true);

-- Create your actual admin account
INSERT INTO users (id, email, name, phone, user_type, location_consent)
VALUES (
  gen_random_uuid(),
  'wasando.tsuyukusa@gmail.com',
  '露草和賛',
  '09081924614',
  'admin',
  true
);

INSERT INTO admin_access (user_id, level, permissions, access_code)
VALUES (
  (SELECT id FROM users WHERE email = 'wasando.tsuyukusa@gmail.com'),
  'admin',
  ARRAY['read', 'write', 'delete'],
  'your-admin-code-here'
);

-- Verify your admin account was created
SELECT 'Your admin account created successfully!' as status;
SELECT u.name, u.email, u.user_type, aa.level
FROM users u
JOIN admin_access aa ON u.id = aa.user_id
WHERE u.email = 'wasando.tsuyukusa@gmail.com'; 