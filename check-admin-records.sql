-- Check for multiple admin records for the same user
SELECT 
    u.email,
    u.id as user_id,
    aa.id as admin_access_id,
    aa.two_factor_secret,
    aa.two_factor_enabled,
    aa.updated_at,
    aa.created_at
FROM users u
JOIN admin_access aa ON u.id = aa.user_id
WHERE u.email = 'wasando.tsuyukusa@gmail.com'
ORDER BY aa.updated_at DESC;

-- Check all admin records
SELECT 
    u.email,
    u.id as user_id,
    aa.id as admin_access_id,
    aa.two_factor_secret,
    aa.two_factor_enabled,
    aa.updated_at
FROM users u
JOIN admin_access aa ON u.id = aa.user_id
WHERE u.user_type = 'admin'
ORDER BY aa.updated_at DESC; 