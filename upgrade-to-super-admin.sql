-- Upgrade Admin Account to Super Admin
-- Run this in your Supabase SQL Editor: https://qqcoooscyzhyzmrcvsxi.supabase.co

-- Update the admin_access level to super_admin
UPDATE admin_access 
SET level = 'super_admin', 
    permissions = ARRAY['read', 'write', 'delete', 'admin', 'super_admin'],
    updated_at = NOW()
WHERE user_id = (SELECT id FROM users WHERE email = 'wasando.tsuyukusa@gmail.com');

-- Verify the upgrade
SELECT 'Your account upgraded to Super Admin successfully!' as status;
SELECT u.name, u.email, u.user_type, aa.level, aa.permissions
FROM users u
JOIN admin_access aa ON u.id = aa.user_id
WHERE u.email = 'wasando.tsuyukusa@gmail.com'; 