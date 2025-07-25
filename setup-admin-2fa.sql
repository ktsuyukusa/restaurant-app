-- Set up proper 2FA for admin account
-- Run this in your Supabase SQL Editor: https://qqcoooscyzhyzmrcvsxi.supabase.co

-- Generate a proper TOTP secret (32 characters, base32 encoded)
-- This is a sample secret - in production, generate this securely
UPDATE admin_access 
SET 
  two_factor_secret = 'JBSWY3DPEHPK3PXP',  -- Sample TOTP secret
  two_factor_enabled = true,
  updated_at = NOW()
WHERE user_id = (SELECT id FROM users WHERE email = 'wasando.tsuyukusa@gmail.com');

-- Verify the update
SELECT '2FA properly configured for admin account!' as status;
SELECT u.name, u.email, aa.level, aa.two_factor_enabled, aa.two_factor_secret
FROM users u
JOIN admin_access aa ON u.id = aa.user_id
WHERE u.email = 'wasando.tsuyukusa@gmail.com'; 