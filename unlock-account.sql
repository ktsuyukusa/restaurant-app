-- Unlock the user account by resetting failed login attempts
-- This will clear the account lock that was triggered by too many failed login attempts

UPDATE auth.users 
SET 
    failed_attempts = 0,
    locked_until = NULL,
    updated_at = NOW()
WHERE email = 'wasando.tsuyukusa@gmail.com';

-- Verify the account is unlocked
SELECT 
    id,
    email,
    failed_attempts,
    locked_until,
    last_sign_in_at,
    updated_at
FROM auth.users 
WHERE email = 'wasando.tsuyukusa@gmail.com';

-- Also check if the user exists in auth.users
SELECT 
    'auth.users' as table_name,
    id,
    email,
    failed_attempts,
    locked_until,
    created_at
FROM auth.users
WHERE email = 'wasando.tsuyukusa@gmail.com'

UNION ALL

SELECT 
    'public.users' as table_name,
    id,
    email,
    'N/A' as failed_attempts,
    'N/A' as locked_until,
    created_at
FROM users
WHERE email = 'wasando.tsuyukusa@gmail.com'; 