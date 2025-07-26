-- Unlock account for wasando.tsuyukusa@gmail.com immediately
-- This clears any login attempt restrictions and lockout data

-- Clear any lockout data from the database (if stored there)
UPDATE users 
SET updated_at = NOW() 
WHERE email = 'wasando.tsuyukusa@gmail.com';

-- If there are any admin_access records that might have lockout flags
UPDATE admin_access 
SET updated_at = NOW() 
WHERE user_id = (
  SELECT id FROM users WHERE email = 'wasando.tsuyukusa@gmail.com'
);

-- Show the current status
SELECT 
  u.email,
  u.created_at,
  u.updated_at,
  aa.two_factor_enabled,
  aa.two_factor_secret
FROM users u
LEFT JOIN admin_access aa ON u.id = aa.user_id
WHERE u.email = 'wasando.tsuyukusa@gmail.com';

-- Also clear browser-side lockout data
-- Run this in your browser console:
-- localStorage.removeItem('navikko_login_attempts');
-- localStorage.removeItem('navikko_lockout_until');
-- localStorage.removeItem('navikko_failed_attempts');
-- sessionStorage.clear(); 