-- Update admin_access with fresh TOTP secret generated with corrected algorithm
-- Generated on: 2025-08-01T03:42:32.903Z
-- Secret: X4XSCC52WYUMPP22EROKAJGGFMBFXKTL
-- QR URL: otpauth://totp/Navikko:admin%40navikko.com?secret=X4XSCC52WYUMPP22EROKAJGGFMBFXKTL&issuer=Navikko&algorithm=SHA1&digits=6&period=30

UPDATE admin_access 
SET two_factor_secret = 'X4XSCC52WYUMPP22EROKAJGGFMBFXKTL', 
    two_factor_enabled = true 
WHERE user_id = (SELECT id FROM users WHERE email = 'admin@navikko.com');

-- Verify the update
SELECT 
    u.email,
    aa.two_factor_secret,
    aa.two_factor_enabled,
    aa.level,
    aa.permissions
FROM users u
JOIN admin_access aa ON u.id = aa.user_id
WHERE u.email = 'admin@navikko.com';