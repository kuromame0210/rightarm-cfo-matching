-- 新規作成したテーブルの存在確認
-- Supabase SQL Editor で実行してください

-- 1. conversations テーブルの確認
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'rextrix_conversations'
) as conversations_exists;

-- 2. messages テーブルの確認
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'rextrix_messages'
) as messages_exists;

-- 3. meetings テーブルの確認
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'rextrix_meetings'
) as meetings_exists;

-- 4. meeting_participants テーブルの確認
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'rextrix_meeting_participants'
) as meeting_participants_exists;

-- 5. activities テーブルの確認
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'rextrix_activities'
) as activities_exists;

-- 6. scouts テーブルの確認
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'rextrix_scouts'
) as scouts_exists;

-- 7. scout_responses テーブルの確認
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'rextrix_scout_responses'
) as scout_responses_exists;

-- 8. 全テーブルの一覧表示
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'rextrix_%'
ORDER BY table_name;

-- 9. conversations テーブルの構造確認（存在する場合）
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'rextrix_conversations'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 10. messages テーブルの構造確認（存在する場合）
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'rextrix_messages'
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Table structure check completed' as result;