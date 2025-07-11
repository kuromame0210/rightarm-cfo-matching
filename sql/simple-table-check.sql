-- 簡単なテーブル存在確認
SELECT 
  table_name,
  CASE 
    WHEN table_name = 'rextrix_conversations' THEN 'conversations'
    WHEN table_name = 'rextrix_messages' THEN 'messages' 
    WHEN table_name = 'rextrix_meetings' THEN 'meetings'
    WHEN table_name = 'rextrix_meeting_participants' THEN 'meeting_participants'
    WHEN table_name = 'rextrix_activities' THEN 'activities'
    WHEN table_name = 'rextrix_scouts' THEN 'scouts'
    WHEN table_name = 'rextrix_scout_responses' THEN 'scout_responses'
    ELSE table_name
  END as api_table,
  'EXISTS' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'rextrix_conversations',
  'rextrix_messages', 
  'rextrix_meetings',
  'rextrix_meeting_participants',
  'rextrix_activities',
  'rextrix_scouts',
  'rextrix_scout_responses'
)
ORDER BY table_name;