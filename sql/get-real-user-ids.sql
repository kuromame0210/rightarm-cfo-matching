-- 実際のユーザーIDを取得してテストに使用
SELECT 
  id as user_id,
  email,
  user_type,
  created_at
FROM rextrix_users 
ORDER BY created_at 
LIMIT 5;