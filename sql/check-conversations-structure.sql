-- conversations テーブル構造確認
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'rextrix_conversations'
AND table_schema = 'public'
ORDER BY ordinal_position;