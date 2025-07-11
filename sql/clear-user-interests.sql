-- 特定ユーザーの気になるリストをクリアするSQL
-- Supabase SQL Editor で実行してください

-- 1. 現在ログインしているユーザーIDを確認（demo-tokenで使用されているユーザー）
SELECT id, email FROM rextrix_users LIMIT 1;

-- 2. そのユーザーの気になるリストのみをクリア（最初のユーザーのIDを使用）
DELETE FROM rextrix_interests 
WHERE user_id = (SELECT id FROM rextrix_users LIMIT 1);

-- 3. クリア後の確認
SELECT COUNT(*) as remaining_interests FROM rextrix_interests;

-- 実行結果
SELECT 'User interests cleared successfully' as result;