-- Manually update the 2FA secret to the new one
UPDATE admin_access 
SET 
    two_factor_secret = 'GKHHSSHCMFWWFU3Q3NDBAMWJCSVV730Y',
    updated_at = NOW()
WHERE user_id = '257df54d-2005-41dd-aa08-37a6c180d896';

-- Verify the update
SELECT 
    u.email,
    aa.two_factor_secret,
    aa.two_factor_enabled,
    aa.updated_at
FROM users u
JOIN admin_access aa ON u.id = aa.user_id
WHERE u.email = 'wasando.tsuyukusa@gmail.com'; 