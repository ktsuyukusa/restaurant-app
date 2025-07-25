-- Check current RLS policies on users and admin_access tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('users', 'admin_access')
ORDER BY tablename, policyname;

-- Check if RLS is enabled on these tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('users', 'admin_access')
ORDER BY tablename;

-- Test if we can query the users table as anonymous
-- This should return data if policies are working correctly
SELECT COUNT(*) as user_count FROM users;

-- Test if we can query admin_access table as anonymous
-- This should return data if policies are working correctly
SELECT COUNT(*) as admin_count FROM admin_access; 