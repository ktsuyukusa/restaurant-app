-- Fix Supabase Security Advisor Warnings
-- Run these commands in your Supabase SQL Editor

-- 1. Enable Leaked Password Protection
-- This prevents users from using compromised passwords from data breaches
ALTER SYSTEM SET auth.enable_leaked_password_protection = 'on';

-- 2. Configure additional MFA options
-- Enable TOTP (Time-based One-Time Password) for better security
INSERT INTO auth.mfa_factors (user_id, factor_type, secret, phone, status)
SELECT 
    id as user_id,
    'totp' as factor_type,
    NULL as secret,  -- Will be generated when user sets up TOTP
    NULL as phone,
    'unverified' as status
FROM auth.users 
WHERE id IN (
    SELECT user_id 
    FROM auth.mfa_factors 
    GROUP BY user_id 
    HAVING COUNT(*) < 2  -- Users with less than 2 MFA factors
)
ON CONFLICT DO NOTHING;

-- 3. Enable additional security policies
-- Force password complexity requirements
UPDATE auth.config 
SET 
    password_min_length = 12,
    password_require_letters = true,
    password_require_numbers = true,
    password_require_symbols = true,
    password_require_uppercase = true,
    password_require_lowercase = true
WHERE TRUE;

-- 4. Set session timeout for better security
UPDATE auth.config 
SET 
    jwt_exp = 3600,  -- 1 hour session timeout
    refresh_token_rotation_enabled = true,
    security_update_password_require_reauthentication = true
WHERE TRUE;

-- 5. Enable audit logging for security events
CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    event_type TEXT NOT NULL,
    event_details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow admins to read audit logs
CREATE POLICY "Admin can read audit logs" ON security_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );