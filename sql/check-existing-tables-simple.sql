-- 既存のテーブル構造を確認するSQL（簡易版）
-- Supabase SQL Editor で実行してください

-- 1. rextrix_conversations テーブルが存在するかチェック
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'rextrix_conversations'
) AS conversations_table_exists;

-- 2. rextrix_messages テーブルが存在するかチェック
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'rextrix_messages'
) AS messages_table_exists;

-- 3. 存在するrextrixテーブルの一覧
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'rextrix_%'
ORDER BY table_name;