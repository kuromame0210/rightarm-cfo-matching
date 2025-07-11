-- Fix Storage Permissions for Rextrix
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on storage.objects (if not already enabled)
alter table storage.objects enable row level security;

-- 2. Grant necessary permissions to authenticated users
grant usage on schema storage to authenticated;
grant all on storage.objects to authenticated;
grant all on storage.buckets to authenticated;

-- 3. Create basic access policy for authenticated users
drop policy if exists "Allow authenticated users basic storage access" on storage.objects;
create policy "Allow authenticated users basic storage access"
on storage.objects
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

-- 4. Specifically for rextrix-profile-images bucket
drop policy if exists "Rextrix Profile Images: Full access for authenticated users" on storage.objects;
create policy "Rextrix Profile Images: Full access for authenticated users"
on storage.objects
for all
using (bucket_id = 'rextrix-profile-images' and auth.role() = 'authenticated')
with check (bucket_id = 'rextrix-profile-images' and auth.role() = 'authenticated');

-- 5. Update bucket permissions (ensure public access where needed)
update storage.buckets 
set public = true 
where id = 'rextrix-profile-images';

-- 6. Check if everything is working
select 
  'Storage permissions check' as test,
  case 
    when exists(select 1 from storage.objects limit 1) then 'SUCCESS'
    else 'STILL_BLOCKED'
  end as result;