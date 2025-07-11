-- Debug Storage RLS Policies for Rextrix
-- Run this in Supabase SQL Editor

-- Drop existing policies first
drop policy if exists "Profile images: Allow authenticated users to view" on storage.objects;
drop policy if exists "Profile images: Allow users to upload to own folder" on storage.objects;
drop policy if exists "Profile images: Allow users to update own files" on storage.objects;
drop policy if exists "Profile images: Allow users to delete own files" on storage.objects;

-- Create simple test policies (TEMPORARY - less secure)
create policy "Profile images: Allow all authenticated users to view"
on storage.objects for select
using (bucket_id = 'rextrix-profile-images' and auth.role() = 'authenticated');

create policy "Profile images: Allow all authenticated users to upload"
on storage.objects for insert
with check (bucket_id = 'rextrix-profile-images' and auth.role() = 'authenticated');

create policy "Profile images: Allow all authenticated users to update"
on storage.objects for update
using (bucket_id = 'rextrix-profile-images' and auth.role() = 'authenticated');

create policy "Profile images: Allow all authenticated users to delete"
on storage.objects for delete
using (bucket_id = 'rextrix-profile-images' and auth.role() = 'authenticated');

-- Debug query to check user data
-- Run this separately to see current user info:
-- select 
--   auth.uid() as auth_uid,
--   auth.email() as auth_email,
--   auth.role() as auth_role,
--   u.id as user_db_id,
--   u.supabase_auth_id as user_auth_id,
--   u.email as user_email
-- from rextrix_users u 
-- where u.supabase_auth_id = auth.uid();