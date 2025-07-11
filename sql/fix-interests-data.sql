-- 気になるリストを正しいユーザーIDで修正するSQL
-- Supabase SQL Editor で実行してください

-- 1. 既存の不正なデータを削除
DELETE FROM rextrix_interests 
WHERE target_user_id NOT IN (SELECT id FROM rextrix_users);

-- 2. 正しいユーザーIDで気になるリストを再作成
DO $$
DECLARE
  current_user_id UUID;
  target_user_id UUID;
  second_user_id UUID;
BEGIN
  -- 現在のユーザー（最初のユーザー）を取得
  SELECT id INTO current_user_id FROM rextrix_users ORDER BY created_at LIMIT 1;
  
  -- ターゲットユーザー（2番目と3番目のユーザー）を取得
  SELECT id INTO target_user_id FROM rextrix_users ORDER BY created_at LIMIT 1 OFFSET 1;
  SELECT id INTO second_user_id FROM rextrix_users ORDER BY created_at LIMIT 1 OFFSET 2;
  
  -- 気になるリストに追加
  IF current_user_id IS NOT NULL AND target_user_id IS NOT NULL THEN
    INSERT INTO rextrix_interests (user_id, target_user_id, target_type)
    VALUES (current_user_id, target_user_id, 'cfo')
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF current_user_id IS NOT NULL AND second_user_id IS NOT NULL THEN
    INSERT INTO rextrix_interests (user_id, target_user_id, target_type)
    VALUES (current_user_id, second_user_id, 'cfo')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 3. 修正後の確認
SELECT 
  i.id,
  i.target_user_id,
  u.email as target_email,
  i.target_type,
  i.created_at
FROM rextrix_interests i
JOIN rextrix_users u ON i.target_user_id = u.id
ORDER BY i.created_at DESC;

SELECT 'Interests data fixed successfully' as result;