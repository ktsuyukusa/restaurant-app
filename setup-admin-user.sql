-- Navikko Admin User Setup Script
-- This script creates admin users through database-level operations
-- as specified in OPTIMIZED_REGISTRATION_SYSTEM.md

-- Function to create secure admin users
CREATE OR REPLACE FUNCTION create_secure_admin(
    admin_email TEXT,
    admin_password TEXT,
    admin_name TEXT,
    admin_phone TEXT DEFAULT '',
    admin_level TEXT DEFAULT 'admin',
    allowed_ips TEXT[] DEFAULT ARRAY['127.0.0.1', 'localhost']
)
RETURNS JSON AS $$
DECLARE
    new_user_id UUID;
    admin_code TEXT;
    result JSON;
BEGIN
    -- Generate unique admin code
    admin_code := 'ADMIN-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    
    -- Create user record
    INSERT INTO users (
        email,
        name,
        phone,
        user_type,
        created_at
    ) VALUES (
        admin_email,
        admin_name,
        admin_phone,
        'admin',
        NOW()
    ) RETURNING id INTO new_user_id;
    
    -- Create admin access record
    INSERT INTO admin_access (
        user_id,
        level,
        permissions,
        access_code,
        allowed_ips,
        two_factor_enabled,
        created_at
    ) VALUES (
        new_user_id,
        admin_level,
        CASE 
            WHEN admin_level = 'super_admin' THEN 
                ARRAY['user_management', 'restaurant_management', 'system_settings', 'analytics', 'content_moderation', 'billing_management', 'security_settings']
            WHEN admin_level = 'admin' THEN 
                ARRAY['user_management', 'restaurant_management', 'system_settings', 'analytics', 'content_moderation']
            ELSE 
                ARRAY['content_moderation', 'user_management', 'analytics']
        END,
        admin_code,
        allowed_ips,
        false, -- 2FA will be set up separately
        NOW()
    );
    
    -- Return result
    result := json_build_object(
        'success', true,
        'user_id', new_user_id,
        'admin_code', admin_code,
        'email', admin_email,
        'level', admin_level,
        'message', 'Admin user created successfully. 2FA setup required.'
    );
    
    RETURN result;
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM,
        'message', 'Failed to create admin user'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to update admin IP restrictions
CREATE OR REPLACE FUNCTION update_admin_ips(
    admin_email TEXT,
    new_allowed_ips TEXT[]
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    UPDATE admin_access 
    SET allowed_ips = new_allowed_ips,
        updated_at = NOW()
    FROM users 
    WHERE users.id = admin_access.user_id 
    AND users.email = admin_email
    AND users.user_type = 'admin';
    
    IF FOUND THEN
        result := json_build_object(
            'success', true,
            'message', 'Admin IP restrictions updated successfully'
        );
    ELSE
        result := json_build_object(
            'success', false,
            'message', 'Admin user not found'
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to enable 2FA for admin
CREATE OR REPLACE FUNCTION enable_admin_2fa(
    admin_email TEXT,
    totp_secret TEXT
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    UPDATE admin_access 
    SET two_factor_secret = totp_secret,
        two_factor_enabled = true,
        updated_at = NOW()
    FROM users 
    WHERE users.id = admin_access.user_id 
    AND users.email = admin_email
    AND users.user_type = 'admin';
    
    IF FOUND THEN
        result := json_build_object(
            'success', true,
            'message', '2FA enabled successfully for admin user'
        );
    ELSE
        result := json_build_object(
            'success', false,
            'message', 'Admin user not found'
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- Create a super admin
-- SELECT create_secure_admin(
--     'admin@navikko.com',
--     'SecurePassword123!',
--     'System Administrator',
--     '+81-90-1234-5678',
--     'super_admin',
--     ARRAY['133.204.210.193', '127.0.0.1', 'localhost']
-- );

-- Create a regular admin
-- SELECT create_secure_admin(
--     'manager@navikko.com',
--     'ManagerPass456!',
--     'Restaurant Manager',
--     '+81-90-8765-4321',
--     'admin',
--     ARRAY['133.204.210.193', '192.168.1.100']
-- );

-- Update IP restrictions
-- SELECT update_admin_ips(
--     'admin@navikko.com',
--     ARRAY['133.204.210.193', '10.0.0.1', '127.0.0.1']
-- );

-- Enable 2FA (after secret is generated)
-- SELECT enable_admin_2fa(
--     'admin@navikko.com',
--     'JBSWY3DPEHPK3PXP'
-- );

-- View admin users
-- SELECT 
--     u.email,
--     u.name,
--     aa.level,
--     aa.access_code,
--     aa.allowed_ips,
--     aa.two_factor_enabled,
--     aa.created_at
-- FROM users u
-- JOIN admin_access aa ON u.id = aa.user_id
-- WHERE u.user_type = 'admin'
-- ORDER BY aa.created_at DESC;