-- ユーザーIDの不一致を調査するSQL
-- Supabase SQL Editor で実行してください

-- 1. 気になるリストのユーザーIDを確認
SELECT 
  id as interest_id,
  target_user_id,
  target_type,
  created_at
FROM rextrix_interests
ORDER BY created_at DESC;

-- 2. 実際に存在するユーザーIDを確認
SELECT 
  id as user_id,
  email,
  created_at
FROM rextrix_users
ORDER BY created_at;

-- 3. 気になるリストに存在しないユーザーIDを特定
SELECT 
  i.target_user_id,
  i.target_type,
  'NOT_FOUND' as status
FROM rextrix_interests i
LEFT JOIN rextrix_users u ON i.target_user_id = u.id
WHERE u.id IS NULL;

-- 4. 修正提案：存在しないエントリを削除
-- DELETE FROM rextrix_interests 
-- WHERE target_user_id NOT IN (SELECT id FROM rextrix_users);

SELECT 'Debug complete - check results above' as result;