-- 🚨 EMERGENCY SECURITY FIX - First check table structure, then fix

-- 1. FIRST: Check what columns exist in admin_access table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_access' 
AND table_schema = 'public';

-- 2. CRITICAL: Remove the dangerous policy immediately (regardless of table structure)
DROP POLICY IF EXISTS "allow admin access creation" ON admin_access;

-- 3. Check current policies to see what we're working with
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'admin_access'
ORDER BY policyname;

-- 4. Simple secure policy - only allow authenticated users to insert
-- (We'll refine this once we know the table structure)
CREATE POLICY "authenticated_users_only_admin_access" ON admin_access
    FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Restrict SELECT to authenticated users only
DROP POLICY IF EXISTS "users can read admin access by user_id" ON admin_access;

CREATE POLICY "authenticated_users_read_own_admin_access" ON admin_access
    FOR SELECT 
    USING (user_id = auth.uid());

-- 6. Show the table structure so we can create a better policy
\d admin_access;