-- Check bucket and RLS status for Rextrix
-- Run this in Supabase SQL Editor to debug

-- 1. Check if buckets exist
select id, name, public, created_at 
from storage.buckets 
where id like 'rextrix%';

-- 2. Check current policies on storage.objects
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies 
where tablename = 'objects' and schemaname = 'storage';

-- 3. Check if RLS is enabled on storage.objects
select schemaname, tablename, rowsecurity 
from pg_tables 
where tablename = 'objects' and schemaname = 'storage';

-- 4. Check current user's authentication
select 
  auth.uid() as current_auth_uid,
  auth.email() as current_auth_email,
  auth.role() as current_auth_role;

-- 5. Check if user exists in rextrix_users table
select 
  id, 
  supabase_auth_id, 
  email, 
  user_type, 
  status
from rextrix_users 
where supabase_auth_id = auth.uid();

-- 6. Test storage access permissions
select 
  'Can access storage objects?' as test,
  case 
    when exists(select 1 from storage.objects limit 1) then 'YES'
    else 'NO'
  end as result;