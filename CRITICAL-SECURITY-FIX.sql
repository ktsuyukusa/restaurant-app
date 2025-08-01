-- 🚨 CRITICAL SECURITY FIX - Run Immediately in Supabase SQL Editor
-- This fixes the dangerous "allow admin access creation" policy

-- 1. DROP the dangerous policy that allows anonymous admin creation
DROP POLICY IF EXISTS "allow admin access creation" ON admin_access;

-- 2. CREATE a secure policy that ONLY allows authenticated admins to create admin accounts
CREATE POLICY "only_existing_admins_can_create_admins" ON admin_access
    FOR INSERT 
    WITH CHECK (
        -- Only allow if the current user is already an admin
        EXISTS (
            SELECT 1 FROM admin_access 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'admin')
        )
        -- OR if this is the very first admin (bootstrap case)
        OR (
            SELECT COUNT(*) FROM admin_access WHERE role IN ('super_admin', 'admin')
        ) = 0
    );

-- 3. Also restrict SELECT access to admin_access table
DROP POLICY IF EXISTS "users can read admin access by user_id" ON admin_access;

CREATE POLICY "only_admins_can_read_admin_access" ON admin_access
    FOR SELECT 
    USING (
        -- Only allow admins to read admin access records
        EXISTS (
            SELECT 1 FROM admin_access 
            WHERE user_id = auth.uid() 
            AND role IN ('super_admin', 'admin')
        )
        -- OR allow users to read their own record only
        OR user_id = auth.uid()
    );

-- 4. Secure the authenticated role policy as well
DROP POLICY IF EXISTS "users can read own admin access" ON admin_access;

CREATE POLICY "users_can_read_own_admin_record_only" ON admin_access
    FOR SELECT 
    USING (user_id = auth.uid());

-- 5. Add audit logging for admin creation attempts
CREATE OR REPLACE FUNCTION log_admin_creation_attempt()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO security_audit_log (
        user_id, 
        event_type, 
        event_details, 
        ip_address,
        created_at
    ) VALUES (
        auth.uid(),
        'admin_creation_attempt',
        jsonb_build_object(
            'target_user_id', NEW.user_id,
            'role', NEW.role,
            'created_by', auth.uid()
        ),
        inet_client_addr(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create trigger for audit logging
DROP TRIGGER IF EXISTS audit_admin_creation ON admin_access;
CREATE TRIGGER audit_admin_creation
    AFTER INSERT ON admin_access
    FOR EACH ROW
    EXECUTE FUNCTION log_admin_creation_attempt();

-- 7. Verify the fix by checking current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'admin_access'
ORDER BY policyname;