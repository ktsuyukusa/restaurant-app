-- Check 2FA Status for Admin Users
-- Run this in your Supabase SQL Editor: https://qqcoooscyzhyzmrcvsxi.supabase.co

-- Check current 2FA configuration
SELECT 
  u.id,
  u.email,
  u.name,
  u.user_type,
  aa.level,
  aa.two_factor_enabled,
  aa.two_factor_secret,
  aa.updated_at,
  CASE 
    WHEN aa.two_factor_secret IS NOT NULL THEN '✅ Secret configured'
    ELSE '❌ No secret configured'
  END as secret_status,
  CASE 
    WHEN aa.two_factor_enabled = true THEN '✅ 2FA enabled'
    ELSE '❌ 2FA disabled'
  END as enabled_status
FROM users u
LEFT JOIN admin_access aa ON u.id = aa.user_id
WHERE u.user_type = 'admin'
ORDER BY u.email;

-- Check if the secret matches the expected value
SELECT 
  u.email,
  aa.two_factor_secret,
  CASE 
    WHEN aa.two_factor_secret = 'CQ7MZG63KORNYIJV2DRNNQ' THEN '✅ Matches expected secret'
    WHEN aa.two_factor_secret IS NULL THEN '❌ No secret configured'
    ELSE '⚠️ Different secret configured'
  END as secret_match_status
FROM users u
LEFT JOIN admin_access aa ON u.id = aa.user_id
WHERE u.user_type = 'admin' AND u.email = 'wasando.tsuyukusa@gmail.com';

-- Summary
SELECT 
  COUNT(*) as total_admin_users,
  COUNT(aa.two_factor_secret) as users_with_secret,
  COUNT(CASE WHEN aa.two_factor_enabled = true THEN 1 END) as users_with_2fa_enabled,
  COUNT(CASE WHEN aa.two_factor_secret = 'CQ7MZG63KORNYIJV2DRNNQ' THEN 1 END) as users_with_correct_secret
FROM users u
LEFT JOIN admin_access aa ON u.id = aa.user_id
WHERE u.user_type = 'admin'; 