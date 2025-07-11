-- データベースの状況を詳細チェック
-- Supabase SQL Editor で実行してください

-- 1. 新規APIで必要なテーブルの存在確認
SELECT 
  'conversations' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'rextrix_conversations'
  ) as exists
UNION ALL
SELECT 
  'messages' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'rextrix_messages'
  ) as exists
UNION ALL
SELECT 
  'meetings' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'rextrix_meetings'
  ) as exists
UNION ALL
SELECT 
  'meeting_participants' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'rextrix_meeting_participants'
  ) as exists
UNION ALL
SELECT 
  'activities' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'rextrix_activities'
  ) as exists
UNION ALL
SELECT 
  'scouts' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'rextrix_scouts'
  ) as exists
UNION ALL
SELECT 
  'scout_responses' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'rextrix_scout_responses'
  ) as exists;

-- 2. conversations テーブルの構造確認（存在する場合）
SELECT 
  'CONVERSATIONS_TABLE_STRUCTURE' as info,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'rextrix_conversations'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. messages テーブルの構造確認（存在する場合）
SELECT 
  'MESSAGES_TABLE_STRUCTURE' as info,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'rextrix_messages'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. meetings テーブルの構造確認（存在する場合）
SELECT 
  'MEETINGS_TABLE_STRUCTURE' as info,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'rextrix_meetings'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. activities テーブルの構造確認（存在する場合）
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

-- 6. scouts テーブルの構造確認（存在する場合）
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

-- 7. 全テーブル一覧表示
SELECT 
  'ALL_REXTRIX_TABLES' as info,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'rextrix_%'
ORDER BY table_name;

-- 8. 既存データの確認
SELECT 'DATA_COUNT_CONVERSATIONS' as info, COUNT(*) as count FROM rextrix_conversations;
SELECT 'DATA_COUNT_MESSAGES' as info, COUNT(*) as count FROM rextrix_messages;
SELECT 'DATA_COUNT_USERS' as info, COUNT(*) as count FROM rextrix_users;

-- 9. 外部キー制約の確認
SELECT 
  'FOREIGN_KEY_CONSTRAINTS' as info,
  tc.table_name,
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
AND tc.table_name LIKE 'rextrix_%'
ORDER BY tc.table_name, kcu.column_name;

SELECT 'Database status check completed' as result;