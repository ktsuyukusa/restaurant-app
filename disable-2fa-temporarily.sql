-- Temporarily disable 2FA for admin account
-- Run this in your Supabase SQL Editor: https://qqcoooscyzhyzmrcvsxi.supabase.co

-- Disable 2FA for the admin account
UPDATE admin_access 
SET 
  two_factor_enabled = false,
  updated_at = NOW()
WHERE user_id = (SELECT id FROM users WHERE email = 'wasando.tsuyukusa@gmail.com');

-- Verify the change
SELECT '2FA temporarily disabled for admin account!' as status;
SELECT u.name, u.email, aa.level, aa.two_factor_enabled
FROM users u
JOIN admin_access aa ON u.id = aa.user_id
WHERE u.email = 'wasando.tsuyukusa@gmail.com';

-- IMPORTANT: Re-enable 2FA after you log in and set it up properly!
-- Run this later to re-enable:
-- UPDATE admin_access SET two_factor_enabled = true WHERE user_id = (SELECT id FROM users WHERE email = 'wasando.tsuyukusa@gmail.com'); 