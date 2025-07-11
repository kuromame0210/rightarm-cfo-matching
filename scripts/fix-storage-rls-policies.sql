-- Fix Storage RLS Policies for Rextrix
-- Run this in Supabase SQL Editor

-- Drop existing policies first
drop policy if exists "Users can view profile images" on storage.objects;
drop policy if exists "Users can upload their own profile images" on storage.objects;
drop policy if exists "Users can update their own profile images" on storage.objects;
drop policy if exists "Users can delete their own profile images" on storage.objects;

drop policy if exists "Users can view company logos" on storage.objects;
drop policy if exists "Users can upload their own company logos" on storage.objects;
drop policy if exists "Users can update their own company logos" on storage.objects;
drop policy if exists "Users can delete their own company logos" on storage.objects;

-- Create new RLS policies for rextrix-profile-images bucket
-- Allow authenticated users to upload to their own folder based on auth.uid()
create policy "Profile images: Allow authenticated users to view"
on storage.objects for select
using (bucket_id = 'rextrix-profile-images');

create policy "Profile images: Allow users to upload to own folder"
on storage.objects for insert
with check (
  bucket_id = 'rextrix-profile-images' 
  and (storage.foldername(name))[1] = 'profiles'
  and (
    -- Allow if folder name matches auth.uid()
    auth.uid()::text = (storage.foldername(name))[2]
    or
    -- Allow if folder name matches user's database ID (fallback)
    exists (
      select 1 from rextrix_users 
      where supabase_auth_id = auth.uid() 
      and id::text = (storage.foldername(name))[2]
    )
  )
);

create policy "Profile images: Allow users to update own files"
on storage.objects for update
using (
  bucket_id = 'rextrix-profile-images'
  and (storage.foldername(name))[1] = 'profiles'
  and (
    -- Allow if folder name matches auth.uid()
    auth.uid()::text = (storage.foldername(name))[2]
    or
    -- Allow if folder name matches user's database ID (fallback)
    exists (
      select 1 from rextrix_users 
      where supabase_auth_id = auth.uid() 
      and id::text = (storage.foldername(name))[2]
    )
  )
);

create policy "Profile images: Allow users to delete own files"
on storage.objects for delete
using (
  bucket_id = 'rextrix-profile-images'
  and (storage.foldername(name))[1] = 'profiles'
  and (
    -- Allow if folder name matches auth.uid()
    auth.uid()::text = (storage.foldername(name))[2]
    or
    -- Allow if folder name matches user's database ID (fallback)
    exists (
      select 1 from rextrix_users 
      where supabase_auth_id = auth.uid() 
      and id::text = (storage.foldername(name))[2]
    )
  )
);

-- Create new RLS policies for rextrix-company-logos bucket
create policy "Company logos: Allow authenticated users to view"
on storage.objects for select
using (bucket_id = 'rextrix-company-logos');

create policy "Company logos: Allow users to upload to own folder"
on storage.objects for insert
with check (
  bucket_id = 'rextrix-company-logos'
  and (storage.foldername(name))[1] = 'companies'
  and (
    -- Allow if folder name matches auth.uid()
    auth.uid()::text = (storage.foldername(name))[2]
    or
    -- Allow if folder name matches user's database ID (fallback)
    exists (
      select 1 from rextrix_users 
      where supabase_auth_id = auth.uid() 
      and id::text = (storage.foldername(name))[2]
    )
  )
);

create policy "Company logos: Allow users to update own files"
on storage.objects for update
using (
  bucket_id = 'rextrix-company-logos'
  and (storage.foldername(name))[1] = 'companies'
  and (
    -- Allow if folder name matches auth.uid()
    auth.uid()::text = (storage.foldername(name))[2]
    or
    -- Allow if folder name matches user's database ID (fallback)
    exists (
      select 1 from rextrix_users 
      where supabase_auth_id = auth.uid() 
      and id::text = (storage.foldername(name))[2]
    )
  )
);

create policy "Company logos: Allow users to delete own files"
on storage.objects for delete
using (
  bucket_id = 'rextrix-company-logos'
  and (storage.foldername(name))[1] = 'companies'
  and (
    -- Allow if folder name matches auth.uid()
    auth.uid()::text = (storage.foldername(name))[2]
    or
    -- Allow if folder name matches user's database ID (fallback)
    exists (
      select 1 from rextrix_users 
      where supabase_auth_id = auth.uid() 
      and id::text = (storage.foldername(name))[2]
    )
  )
);