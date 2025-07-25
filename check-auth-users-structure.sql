-- Check the structure of auth.users table to see what columns exist
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'auth'
ORDER BY ordinal_position;

-- Check if the user exists in auth.users
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at,
    updated_at
FROM auth.users
WHERE email = 'wasando.tsuyukusa@gmail.com';

-- Check if there are any lock-related columns
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'auth' 
  AND (column_name ILIKE '%lock%' OR column_name ILIKE '%fail%' OR column_name ILIKE '%attempt%')
ORDER BY column_name;

-- Alternative: Try to delete and recreate the auth.users entry
-- This will remove any lock state
DELETE FROM auth.users 
WHERE email = 'wasando.tsuyukusa@gmail.com';

-- Verify the user was deleted from auth.users
SELECT 
    'auth.users after delete' as status,
    COUNT(*) as count
FROM auth.users
WHERE email = 'wasando.tsuyukusa@gmail.com';

-- Verify the user still exists in public.users
SELECT 
    'public.users' as table_name,
    id,
    email,
    name,
    user_type
FROM users
WHERE email = 'wasando.tsuyukusa@gmail.com'; 