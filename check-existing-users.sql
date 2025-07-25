-- Check existing users in the database
SELECT 
    id,
    email,
    name,
    user_type,
    created_at,
    updated_at
FROM users
ORDER BY created_at DESC;

-- Check if there are any users with the specific email
SELECT 
    id,
    email,
    name,
    user_type,
    created_at
FROM users 
WHERE email = 'wasando.tsuyukusa@gmail.com';

-- Check admin_access table for the user
SELECT 
    aa.id,
    aa.user_id,
    aa.level,
    aa.permissions,
    aa.access_code,
    u.email,
    u.name
FROM admin_access aa
JOIN users u ON aa.user_id = u.id
ORDER BY aa.created_at DESC;

-- Check if there's a mismatch between auth.users and public.users
-- First, let's see what's in auth.users
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users
WHERE email = 'wasando.tsuyukusa@gmail.com';

-- Check if the user exists in both tables with matching IDs
SELECT 
    'auth.users' as table_name,
    id,
    email,
    created_at
FROM auth.users
WHERE email = 'wasando.tsuyukusa@gmail.com'

UNION ALL

SELECT 
    'public.users' as table_name,
    id,
    email,
    created_at
FROM users
WHERE email = 'wasando.tsuyukusa@gmail.com'; 