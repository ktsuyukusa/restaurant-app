-- Check current 2FA status for admin users
SELECT 
    u.email,
    u.id as user_id,
    aa.two_factor_secret,
    aa.two_factor_enabled,
    aa.updated_at
FROM users u
JOIN admin_access aa ON u.id = aa.user_id
WHERE u.email = 'wasando.tsuyukusa@gmail.com'; 