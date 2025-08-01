-- Enhanced fix for missing admin_access record for 2FA setup
-- Run this in your Supabase SQL Editor: https://qqcoooscyzhyzmrcvsxi.supabase.co

-- Step 1: Check if the admin user exists and get the exact user_id
SELECT 'Step 1: Admin user check' as step;
SELECT 'Admin user found:' as status, id, name, email, user_type 
FROM users 
WHERE email = 'wasando.tsuyukusa@gmail.com';

-- Step 2: Check current admin_access records for this user
SELECT 'Step 2: Current admin_access records' as step;
SELECT 'Existing admin_access records:' as status, user_id, level, two_factor_enabled, two_factor_secret
FROM admin_access 
WHERE user_id = (SELECT id FROM users WHERE email = 'wasando.tsuyukusa@gmail.com');

-- Step 3: Delete any existing admin_access records to start fresh
SELECT 'Step 3: Cleaning up existing records' as step;
DELETE FROM admin_access 
WHERE user_id = (SELECT id FROM users WHERE email = 'wasando.tsuyukusa@gmail.com');

-- Step 4: Insert the admin_access record with proper 2FA setup
SELECT 'Step 4: Creating new admin_access record' as step;
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
WHERE u.email = 'wasando.tsuyukusa@gmail.com';

-- Step 5: Verify the insert worked
SELECT 'Step 5: Verification' as step;
SELECT 'Admin 2FA setup completed!' as status;
SELECT u.id as user_id, u.name, u.email, u.user_type, aa.level, aa.two_factor_enabled, aa.two_factor_secret
FROM users u
JOIN admin_access aa ON u.id = aa.user_id
WHERE u.email = 'wasando.tsuyukusa@gmail.com';

-- Step 6: Test the exact query that the app uses
SELECT 'Step 6: Testing app query' as step;
SELECT 'Testing the exact query from authService.ts:' as info;
SELECT *
FROM admin_access
WHERE user_id = (SELECT id FROM users WHERE email = 'wasando.tsuyukusa@gmail.com');

-- Step 7: Show QR code setup information
SELECT 'Step 7: QR Code Setup' as step;
SELECT 
  'Setup your Google Authenticator with this secret:' as instruction,
  aa.two_factor_secret as secret,
  'otpauth://totp/Navikko%20Admin:wasando.tsuyukusa@gmail.com?secret=' || aa.two_factor_secret || '&issuer=Navikko%20Admin' as qr_url
FROM admin_access aa
JOIN users u ON aa.user_id = u.id
WHERE u.email = 'wasando.tsuyukusa@gmail.com';