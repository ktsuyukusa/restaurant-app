-- Drop existing policies and recreate them properly
-- This will fix the 401 Unauthorized errors when accessing users table

-- Drop all existing policies on users table
DROP POLICY IF EXISTS "users can read by email for login" ON users;
DROP POLICY IF EXISTS "users can read own data" ON users;
DROP POLICY IF EXISTS "users can update own data" ON users;
DROP POLICY IF EXISTS "users can insert own data" ON users;

-- Drop all existing policies on admin_access table
DROP POLICY IF EXISTS "admins can read admin_access" ON admin_access;
DROP POLICY IF EXISTS "admins can insert admin_access" ON admin_access;

-- Recreate policies for users table
-- Allow anonymous users to read user data by email for login purposes (MOST IMPORTANT)
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

-- Recreate policies for admin_access table
-- Allow anonymous users to read admin_access for login verification
CREATE POLICY "admin_access can read for login" ON admin_access
  FOR SELECT TO anon USING (true);

-- Allow authenticated users to read their own admin access
CREATE POLICY "admins can read admin_access" ON admin_access
  FOR SELECT TO authenticated USING (user_id::text = auth.uid()::text);

-- Allow authenticated users to insert their own admin access
CREATE POLICY "admins can insert admin_access" ON admin_access
  FOR INSERT TO authenticated WITH CHECK (user_id::text = auth.uid()::text);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('users', 'admin_access')
ORDER BY tablename, policyname;
