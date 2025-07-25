-- Disable 2FA Requirement for Admin Accounts
-- Run this in your Supabase SQL Editor: https://qqcoooscyzhyzmrcvsxi.supabase.co

-- Create a configuration table to store app settings
CREATE TABLE IF NOT EXISTS app_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert or update the security configuration to disable 2FA
INSERT INTO app_config (key, value) 
VALUES ('security_config', '{"REQUIRE_2FA_FOR_ADMIN": false}')
ON CONFLICT (key) 
DO UPDATE SET 
  value = '{"REQUIRE_2FA_FOR_ADMIN": false}',
  updated_at = NOW();

-- Verify the configuration
SELECT '2FA requirement disabled for admin accounts!' as status;
SELECT key, value FROM app_config WHERE key = 'security_config'; 