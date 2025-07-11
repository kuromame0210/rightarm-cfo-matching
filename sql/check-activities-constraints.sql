-- Check activities table constraints
-- Run in Supabase SQL Editor

-- 1. Check table structure
SELECT 
  'ACTIVITIES_TABLE_STRUCTURE' as info,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'rextrix_activities'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check constraints (especially check constraints)
SELECT 
  'CHECK_CONSTRAINTS' as info,
  constraint_name,
  check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%activities%';

-- 3. Get current activities data to see existing activity types
SELECT 
  'EXISTING_ACTIVITY_TYPES' as info,
  activity_type,
  COUNT(*) as count
FROM rextrix_activities
GROUP BY activity_type
ORDER BY count DESC;