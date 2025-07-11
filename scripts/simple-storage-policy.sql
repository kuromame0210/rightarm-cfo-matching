-- Simple Storage Policy for Rextrix (no admin commands)
-- Run this in Supabase SQL Editor

-- Drop all existing policies first
drop policy if exists "Allow authenticated users basic storage access" on storage.objects;
drop policy if exists "Rextrix Profile Images: Full access for authenticated users" on storage.objects;
drop policy if exists "Profile images: Allow all authenticated users to view" on storage.objects;
drop policy if exists "Profile images: Allow all authenticated users to upload" on storage.objects;
drop policy if exists "Profile images: Allow all authenticated users to update" on storage.objects;
drop policy if exists "Profile images: Allow all authenticated users to delete" on storage.objects;

-- Create very simple policies for rextrix-profile-images
create policy "Public read access for profile images"
on storage.objects for select
using (bucket_id = 'rextrix-profile-images');

create policy "Authenticated upload for profile images"
on storage.objects for insert
with check (
  bucket_id = 'rextrix-profile-images' 
  and auth.role() = 'authenticated'
);

create policy "Authenticated update for profile images"
on storage.objects for update
using (
  bucket_id = 'rextrix-profile-images' 
  and auth.role() = 'authenticated'
);

create policy "Authenticated delete for profile images"
on storage.objects for delete
using (
  bucket_id = 'rextrix-profile-images' 
  and auth.role() = 'authenticated'
);

-- Make sure bucket is public
update storage.buckets 
set public = true 
where id = 'rextrix-profile-images';