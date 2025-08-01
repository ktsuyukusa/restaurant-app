-- Fix missing admin_access record for 2FA setup
-- Run this in your Supabase SQL Editor: https://qqcoooscyzhyzmrcvsxi.supabase.co

-- First, check if the admin user exists
SELECT 'Admin user found:' as status, id, name, email, user_type 
FROM users 
WHERE email = 'wasando.tsuyukusa@gmail.com';

-- Check if admin_access record exists
SELECT 'Existing admin_access records:' as status, user_id, level, two_factor_enabled, two_factor_secret
FROM admin_access 
WHERE user_id = (SELECT id FROM users WHERE email = 'wasando.tsuyukusa@gmail.com');

-- Insert missing admin_access record with 2FA secret
-- Generate a proper TOTP secret (32 characters, base32 encoded)
INSERT INTO admin_access (
  user_id,
  level,
  permissions,
  access_code,
  two_factor_secret,
  two_factor_enabled,
  created_at,
  updated_at
) 
SELECT 
  u.id,
  'super_admin',
  ARRAY['user_management', 'restaurant_management', 'system_settings', 'analytics', 'content_moderation', 'billing_management', 'security_settings'],
  'NAVIKKO_SUPER_ADMIN_2024',
  'PKKHZPR2QBZC54PTPEA7SVZ6ZNGE3MHI', -- 32-character base32 TOTP secret
  true,
  NOW(),
  NOW()
FROM users u 
WHERE u.email = 'wasando.tsuyukusa@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM admin_access aa WHERE aa.user_id = u.id
);

-- Verify the insert
SELECT 'Admin 2FA setup completed!' as status;
SELECT u.name, u.email, u.user_type, aa.level, aa.two_factor_enabled, aa.two_factor_secret
FROM users u
JOIN admin_access aa ON u.id = aa.user_id
WHERE u.email = 'wasando.tsuyukusa@gmail.com';

-- Show QR code setup information
SELECT 
  'Setup your Google Authenticator with this secret:' as instruction,
  aa.two_factor_secret as secret,
  'otpauth://totp/Navikko%20Admin:wasando.tsuyukusa@gmail.com?secret=' || aa.two_factor_secret || '&issuer=Navikko%20Admin' as qr_url
FROM admin_access aa
JOIN users u ON aa.user_id = u.id
WHERE u.email = 'wasando.tsuyukusa@gmail.com';