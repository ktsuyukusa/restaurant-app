-- Reset account lockout for admin user
-- Run this in your Supabase SQL Editor: https://qqcoooscyzhyzmrcvsxi.supabase.co

-- Clear any stored login attempts (this would be in localStorage in the browser)
-- For now, we'll just verify the admin account is still active

SELECT 'Admin account status:' as info;
SELECT u.name, u.email, u.user_type, aa.level, aa.two_factor_enabled
FROM users u
JOIN admin_access aa ON u.id = aa.user_id
WHERE u.email = 'wasando.tsuyukusa@gmail.com';

-- The lockout is stored in browser localStorage, not the database
-- You need to clear it from your browser or wait for the timeout 