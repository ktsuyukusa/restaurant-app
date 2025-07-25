-- Recreate the Super Admin user properly
-- First, create the user in auth.users using Supabase Auth API
-- Note: This needs to be done via the Supabase Auth API, not direct SQL

-- For now, let's create the user in public.users first
-- The auth.users entry will be created when you sign up through the app

INSERT INTO users (
    id,
    email,
    name,
    phone,
    user_type,
    location_consent,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'wasando.tsuyukusa@gmail.com',
    'Kazuyoshi Tsuyukusa',
    '09081924614',
    'admin',
    false,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    user_type = EXCLUDED.user_type,
    updated_at = NOW()
RETURNING id, email, name, user_type;

-- Now create the admin_access record
-- We'll use the ID from the user we just created
INSERT INTO admin_access (
    user_id,
    level,
    permissions,
    access_code,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM users WHERE email = 'wasando.tsuyukusa@gmail.com'),
    'super_admin',
    ARRAY['user_management', 'restaurant_management', 'system_settings', 'analytics', 'content_moderation', 'billing_management', 'security_settings'],
    'SUPER_ADMIN_2024_DEV',
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    level = EXCLUDED.level,
    permissions = EXCLUDED.permissions,
    access_code = EXCLUDED.access_code,
    updated_at = NOW()
RETURNING user_id, level, permissions;

-- Verify the user was created
SELECT 
    u.id,
    u.email,
    u.name,
    u.user_type,
    aa.level,
    aa.permissions
FROM users u
LEFT JOIN admin_access aa ON u.id = aa.user_id
WHERE u.email = 'wasando.tsuyukusa@gmail.com'; 