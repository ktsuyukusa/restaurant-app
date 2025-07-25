-- Add 2FA columns to admin_access table
-- Run this in your Supabase SQL Editor: https://qqcoooscyzhyzmrcvsxi.supabase.co

-- Add 2FA columns if they don't exist
DO $$
BEGIN
    -- Add two_factor_secret column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'admin_access' AND column_name = 'two_factor_secret') THEN
        ALTER TABLE admin_access ADD COLUMN two_factor_secret TEXT;
        RAISE NOTICE 'Added two_factor_secret column to admin_access table';
    END IF;

    -- Add two_factor_enabled column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'admin_access' AND column_name = 'two_factor_enabled') THEN
        ALTER TABLE admin_access ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added two_factor_enabled column to admin_access table';
    END IF;
END $$;

-- Now set up 2FA for admin account
UPDATE admin_access 
SET 
  two_factor_secret = 'JBSWY3DPEHPK3PXP',  -- Sample TOTP secret
  two_factor_enabled = true,
  updated_at = NOW()
WHERE user_id = (SELECT id FROM users WHERE email = 'wasando.tsuyukusa@gmail.com');

-- Verify the update
SELECT '2FA properly configured for admin account!' as status;
SELECT u.name, u.email, aa.level, aa.two_factor_enabled, aa.two_factor_secret
FROM users u
JOIN admin_access aa ON u.id = aa.user_id
WHERE u.email = 'wasando.tsuyukusa@gmail.com'; 