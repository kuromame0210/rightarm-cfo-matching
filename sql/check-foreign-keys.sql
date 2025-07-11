-- 外部キー制約の詳細確認
-- Supabase SQL Editor で実行してください

-- 1. scouts テーブルの構造確認
SELECT 
  'SCOUTS_TABLE_STRUCTURE' as info,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'rextrix_scouts'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. 外部キー制約の確認
SELECT 
  'FOREIGN_KEYS' as info,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('rextrix_scouts', 'rextrix_activities', 'rextrix_meetings')
ORDER BY tc.table_name;