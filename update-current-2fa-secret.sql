-- Update database with the current 2FA secret from the setup page
-- Run this in your Supabase SQL Editor: https://qqcoooscyzhyzmrcvsxi.supabase.co

-- Update the admin account with the current 2FA secret
UPDATE admin_access 
SET 
  two_factor_secret = 'EVUXV76SPLMOHG6ZN3M4B5',  -- Current secret from setup page
  two_factor_enabled = true,
  updated_at = NOW()
WHERE user_id = (SELECT id FROM users WHERE email = 'wasando.tsuyukusa@gmail.com');

-- Verify the update
SELECT '2FA secret updated with current secret!' as status;
SELECT u.name, u.email, aa.level, aa.two_factor_enabled, aa.two_factor_secret
FROM users u
JOIN admin_access aa ON u.id = aa.user_id
WHERE u.email = 'wasando.tsuyukusa@gmail.com'; 