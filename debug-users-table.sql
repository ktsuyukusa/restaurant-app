-- Debug the users table specifically
-- Check if the users table exists and has data
SELECT 'users table exists' as check_type, COUNT(*) as result 
FROM information_schema.tables 
WHERE table_name = 'users' AND table_schema = 'public';

-- Check if there are any rows in the users table
SELECT 'users table row count' as check_type, COUNT(*) as result 
FROM users;

-- Check the structure of the users table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if RLS is enabled on users table
SELECT 'users RLS enabled' as check_type, rowsecurity as result 
FROM pg_tables 
WHERE tablename = 'users' AND schemaname = 'public';

-- Check all policies on users table
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users' AND schemaname = 'public';

-- Try to insert a test user to see if that works
INSERT INTO users (email, name, user_type) 
VALUES ('test@example.com', 'Test User', 'customer')
ON CONFLICT (email) DO NOTHING;

-- Check if the test user was inserted
SELECT 'test user inserted' as check_type, COUNT(*) as result 
FROM users WHERE email = 'test@example.com';

-- Clean up test user
DELETE FROM users WHERE email = 'test@example.com'; 