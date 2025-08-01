-- 🚨 SIMPLE SECURITY FIX - Remove dangerous policy immediately

-- STEP 1: Remove the dangerous policy that allows anonymous admin creation
DROP POLICY IF EXISTS "allow admin access creation" ON admin_access;

-- STEP 2: Create a basic secure policy - only authenticated users can insert
CREATE POLICY "no_anonymous_admin_creation" ON admin_access
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- STEP 3: Secure the SELECT policies too
DROP POLICY IF EXISTS "users can read admin access by user_id" ON admin_access;

CREATE POLICY "users_read_own_admin_only" ON admin_access
    FOR SELECT 
    USING (user_id = auth.uid());

-- STEP 4: Check what we've done
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'admin_access';