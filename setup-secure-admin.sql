-- Secure Admin Creation Script for Navikko
-- This script creates admin users with enhanced security for Japanese payment compliance (Komoju/Stripe)
-- Run this script only during initial system setup or by authorized personnel

-- Create admin_security table for IP restrictions and security settings
CREATE TABLE IF NOT EXISTS admin_security (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  allowed_ips TEXT[] DEFAULT '{}', -- Array of allowed IP addresses
  ip_restriction_enabled BOOLEAN DEFAULT true,
  last_login_ip INET,
  last_login_at TIMESTAMP WITH TIME ZONE,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  two_fa_enabled BOOLEAN DEFAULT true,
  two_fa_secret TEXT,
  backup_codes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_audit_log for compliance tracking
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource TEXT,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to create secure admin user
CREATE OR REPLACE FUNCTION create_secure_admin(
  admin_email TEXT,
  admin_password TEXT,
  admin_name TEXT,
  allowed_ip_addresses TEXT[] DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
  admin_profile_id UUID;
BEGIN
  -- Create auth user
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
  ) VALUES (
    gen_random_uuid(),
    admin_email,
    crypt(admin_password, gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object('name', admin_name, 'user_type', 'admin')
  ) RETURNING id INTO new_user_id;

  -- Create user profile
  INSERT INTO user_profiles (
    id,
    user_id,
    name,
    email,
    user_type,
    phone,
    language,
    location_consent,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    new_user_id,
    admin_name,
    admin_email,
    'admin',
    '',
    'en',
    false,
    NOW(),
    NOW()
  ) RETURNING id INTO admin_profile_id;

  -- Create admin security record
  INSERT INTO admin_security (
    user_id,
    allowed_ips,
    ip_restriction_enabled,
    two_fa_enabled
  ) VALUES (
    new_user_id,
    COALESCE(allowed_ip_addresses, '{}'),
    CASE WHEN array_length(allowed_ip_addresses, 1) > 0 THEN true ELSE false END,
    true
  );

  -- Log admin creation
  INSERT INTO admin_audit_log (
    user_id,
    action,
    resource,
    details
  ) VALUES (
    new_user_id,
    'ADMIN_CREATED',
    'admin_user',
    jsonb_build_object(
      'admin_email', admin_email,
      'admin_name', admin_name,
      'ip_restrictions_enabled', CASE WHEN array_length(allowed_ip_addresses, 1) > 0 THEN true ELSE false END
    )
  );

  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate admin IP access
CREATE OR REPLACE FUNCTION validate_admin_ip_access(
  user_id UUID,
  client_ip INET
) RETURNS BOOLEAN AS $$
DECLARE
  security_record RECORD;
BEGIN
  SELECT * INTO security_record 
  FROM admin_security 
  WHERE admin_security.user_id = validate_admin_ip_access.user_id;

  -- If no security record exists, deny access
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- If IP restriction is disabled, allow access
  IF NOT security_record.ip_restriction_enabled THEN
    RETURN true;
  END IF;

  -- If no allowed IPs are set, deny access
  IF array_length(security_record.allowed_ips, 1) IS NULL THEN
    RETURN false;
  END IF;

  -- Check if client IP is in allowed list
  RETURN client_ip = ANY(security_record.allowed_ips);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin actions for compliance
CREATE OR REPLACE FUNCTION log_admin_action(
  user_id UUID,
  action_name TEXT,
  resource_name TEXT DEFAULT NULL,
  client_ip INET DEFAULT NULL,
  client_user_agent TEXT DEFAULT NULL,
  action_success BOOLEAN DEFAULT true,
  action_details JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
  INSERT INTO admin_audit_log (
    user_id,
    action,
    resource,
    ip_address,
    user_agent,
    success,
    details
  ) VALUES (
    user_id,
    action_name,
    resource_name,
    client_ip,
    client_user_agent,
    action_success,
    action_details
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create RLS policies for admin security
ALTER TABLE admin_security ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can access admin security records
CREATE POLICY admin_security_policy ON admin_security
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.user_type = 'admin'
    )
  );

-- Only admins can access audit logs
CREATE POLICY admin_audit_policy ON admin_audit_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.user_type = 'admin'
    )
  );

-- Example: Create initial super admin (CHANGE THESE VALUES!)
-- Uncomment and modify the following line to create your first admin:
-- SELECT create_secure_admin(
--   'admin@navikko.com',
--   'CHANGE_THIS_STRONG_PASSWORD_123!',
--   'Super Administrator',
--   ARRAY['192.168.1.100', '10.0.0.50']  -- Add your allowed IP addresses
-- );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON admin_security TO authenticated;
GRANT SELECT, INSERT ON admin_audit_log TO authenticated;
GRANT EXECUTE ON FUNCTION create_secure_admin TO postgres;
GRANT EXECUTE ON FUNCTION validate_admin_ip_access TO authenticated;
GRANT EXECUTE ON FUNCTION log_admin_action TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_security_user_id ON admin_security(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_user_id ON admin_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_created_at ON admin_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_action ON admin_audit_log(action);

COMMENT ON TABLE admin_security IS 'Enhanced security settings for admin users - Japanese payment compliance';
COMMENT ON TABLE admin_audit_log IS 'Audit trail for admin actions - Required for Japanese financial regulations';
COMMENT ON FUNCTION create_secure_admin IS 'Creates admin user with enhanced security for Komoju/Stripe compliance';
COMMENT ON FUNCTION validate_admin_ip_access IS 'Validates admin IP access for Japanese payment security requirements';
COMMENT ON FUNCTION log_admin_action IS 'Logs admin actions for compliance and audit trail';