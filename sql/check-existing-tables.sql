-- 既存のテーブル構造を確認するSQL
-- Supabase SQL Editor で実行してください

-- 1. rextrix_conversations テーブルの構造を確認
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'rextrix_conversations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. rextrix_messages テーブルの構造を確認
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'rextrix_messages' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. 存在するテーブル一覧を確認
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'rextrix_%'
ORDER BY table_name;

-- 4. 外部キー制約を確認
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('rextrix_conversations', 'rextrix_messages');

-- 5. 実行結果の確認
SELECT 'Table structure check completed' as result;