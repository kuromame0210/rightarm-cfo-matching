-- TEMPORARY: Disable RLS for testing (NOT for production!)
-- Run this in Supabase SQL Editor

-- Disable RLS on storage.objects temporarily
alter table storage.objects disable row level security;

-- Note: Run this to re-enable RLS after testing:
-- alter table storage.objects enable row level security;