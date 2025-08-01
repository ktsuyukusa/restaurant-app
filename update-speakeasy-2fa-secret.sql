-- Update admin 2FA secret with Speakeasy-generated secret (Backend Implementation)
-- Generated on: 2025-08-01T05:17:12.207Z
-- Library: speakeasy (battle-tested backend)
-- Secret: FQYDMO3NIVHVWWRBKJNWYJBVKRYGK2CXNFSUQOJGEROWQYT3NBXA

UPDATE admin_access 
SET two_factor_secret = 'FQYDMO3NIVHVWWRBKJNWYJBVKRYGK2CXNFSUQOJGEROWQYT3NBXA', 
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