-- Update 2FA secret to the current working secret
UPDATE admin_access 
SET two_factor_secret = 'PKKHZPR2QBZC54PTPEA7SVZ6ZNGE3MHI',
    two_factor_enabled = true
WHERE user_id = '257df54d-2005-41dd-aa08-37a6c180d896';

-- Verify the update
SELECT user_id, two_factor_secret, two_factor_enabled 
FROM admin_access 
WHERE user_id = '257df54d-2005-41dd-aa08-37a6c180d896'; 