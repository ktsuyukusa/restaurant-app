-- First, let's check the admin_access table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'admin_access' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check existing constraints on admin_access table
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.admin_access'::regclass;

-- Add unique constraint on user_id if it doesn't exist
ALTER TABLE admin_access 
ADD CONSTRAINT admin_access_user_id_unique UNIQUE (user_id);

-- Now recreate the Super Admin user properly
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