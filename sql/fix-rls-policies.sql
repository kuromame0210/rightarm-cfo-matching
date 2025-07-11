-- Fix RLS policies for registration to work
-- Run this in Supabase SQL Editor

-- First, check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename LIKE 'rextrix_%' AND schemaname = 'public';

-- Option 1: Temporarily disable RLS on critical tables (for development)
ALTER TABLE rextrix_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE rextrix_user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE rextrix_cfos DISABLE ROW LEVEL SECURITY;
ALTER TABLE rextrix_companies DISABLE ROW LEVEL SECURITY;

-- Option 2: Create proper RLS policies (better for production)
-- Uncomment if you prefer to keep RLS enabled:

/*
-- Enable RLS on tables
ALTER TABLE rextrix_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rextrix_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rextrix_cfos ENABLE ROW LEVEL SECURITY;
ALTER TABLE rextrix_companies ENABLE ROW LEVEL SECURITY;

-- Policy for users table - allow insert during registration
CREATE POLICY "Allow insert during registration" ON rextrix_users
    FOR INSERT 
    WITH CHECK (true);

-- Policy for users table - allow users to read their own data
CREATE POLICY "Users can read own data" ON rextrix_users
    FOR SELECT 
    USING (auth.uid()::text = supabase_auth_id);

-- Policy for users table - allow users to update their own data
CREATE POLICY "Users can update own data" ON rextrix_users
    FOR UPDATE 
    USING (auth.uid()::text = supabase_auth_id);

-- Policy for user_profiles table - allow insert during registration
CREATE POLICY "Allow profile insert during registration" ON rextrix_user_profiles
    FOR INSERT 
    WITH CHECK (true);

-- Policy for user_profiles table - allow users to read their own profile
CREATE POLICY "Users can read own profile" ON rextrix_user_profiles
    FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM rextrix_users 
        WHERE rextrix_users.id = rextrix_user_profiles.user_id 
        AND rextrix_users.supabase_auth_id = auth.uid()::text
    ));

-- Policy for user_profiles table - allow users to update their own profile
CREATE POLICY "Users can update own profile" ON rextrix_user_profiles
    FOR UPDATE 
    USING (EXISTS (
        SELECT 1 FROM rextrix_users 
        WHERE rextrix_users.id = rextrix_user_profiles.user_id 
        AND rextrix_users.supabase_auth_id = auth.uid()::text
    ));

-- Policy for CFOs table - allow insert during registration
CREATE POLICY "Allow CFO insert during registration" ON rextrix_cfos
    FOR INSERT 
    WITH CHECK (true);

-- Policy for CFOs table - allow users to read their own CFO data
CREATE POLICY "Users can read own CFO data" ON rextrix_cfos
    FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM rextrix_users 
        WHERE rextrix_users.id = rextrix_cfos.user_id 
        AND rextrix_users.supabase_auth_id = auth.uid()::text
    ));

-- Policy for companies table - allow insert during registration
CREATE POLICY "Allow company insert during registration" ON rextrix_companies
    FOR INSERT 
    WITH CHECK (true);

-- Policy for companies table - allow users to read their own company data
CREATE POLICY "Users can read own company data" ON rextrix_companies
    FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM rextrix_users 
        WHERE rextrix_users.id = rextrix_companies.user_id 
        AND rextrix_users.supabase_auth_id = auth.uid()::text
    ));
*/

-- Verify the changes
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename LIKE 'rextrix_%' AND schemaname = 'public';