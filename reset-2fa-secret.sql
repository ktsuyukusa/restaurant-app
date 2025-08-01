-- Reset admin 2FA secret with fresh-generated secret
-- Generated on: 2025-08-01T05:36:00.000Z
-- Library: Custom implementation with crypto.subtle (browser-based)
-- Secret: [NEW_SECRET] (to be replaced with actual secret from reset-2fa-qr-code.html)

UPDATE admin_access 
SET two_factor_secret = '[NEW_SECRET]', 
    two_factor_enabled = true 
WHERE user_id = (SELECT id FROM users WHERE email = 'admin@navikko.com');

-- Verification query to confirm the update
SELECT 
    u.email,
    aa.two_factor_secret,
    aa.two_factor_enabled,
    aa.updated_at
FROM admin_access aa
JOIN users u ON aa.user_id = u.id
WHERE u.email = 'admin@navikko.com';