-- Clear old 2FA secret and start fresh
-- Run this in your Supabase SQL Editor: https://qqcoooscyzhyzmrcvsxi.supabase.co

-- Clear the old 2FA secret
UPDATE admin_access 
SET 
  two_factor_secret = NULL,
  two_factor_enabled = false,
  updated_at = NOW()
WHERE user_id = (SELECT id FROM users WHERE email = 'wasando.tsuyukusa@gmail.com');

-- Verify the clear
SELECT '2FA secret cleared! You can now set up fresh 2FA.' as status;
SELECT u.name, u.email, aa.level, aa.two_factor_enabled, aa.two_factor_secret
FROM users u
JOIN admin_access aa ON u.id = aa.user_id
WHERE u.email = 'wasando.tsuyukusa@gmail.com'; 