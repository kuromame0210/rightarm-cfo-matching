-- Nuclear Option: Completely reset storage permissions
-- Run this in Supabase SQL Editor

-- 1. Drop ALL storage policies
DO $$ 
DECLARE 
    r RECORD;
BEGIN 
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage') 
    LOOP 
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON storage.objects';
    END LOOP; 
END $$;

-- 2. Create one simple "allow all authenticated users" policy
create policy "Allow all authenticated users full storage access"
on storage.objects
for all
to authenticated
using (true)
with check (true);

-- 3. Make sure buckets are public and allow all operations
update storage.buckets 
set 
  public = true,
  allowed_mime_types = null,
  file_size_limit = null
where id like 'rextrix-%';

-- 4. Test query
select 'Nuclear option applied' as status;