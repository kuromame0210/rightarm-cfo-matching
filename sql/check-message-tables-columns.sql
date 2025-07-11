-- 既存のメッセージテーブルの列構造を確認するSQL
-- Supabase SQL Editor で実行してください

-- 1. rextrix_conversations テーブルの列構造
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'rextrix_conversations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. rextrix_messages テーブルの列構造
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'rextrix_messages' 
AND table_schema = 'public'
ORDER BY ordinal_position;