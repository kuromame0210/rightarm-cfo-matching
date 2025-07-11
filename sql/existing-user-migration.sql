-- RightArm v3 既存ユーザー移行スクリプト
-- 注意: このスクリプトは既存ユーザーをSupabase Authに移行します
-- 実行前に必ずデータベースのバックアップを取ってください

-- ====================
-- 既存ユーザー移行処理
-- ====================

-- 移行処理関数
CREATE OR REPLACE FUNCTION migrate_existing_user(
  p_user_id UUID,
  p_temp_password TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_user RECORD;
  v_auth_user_id UUID;
  v_temp_password TEXT;
  v_result JSON;
BEGIN
  -- 既存ユーザー情報取得
  SELECT * INTO v_user 
  FROM rightarm_users 
  WHERE id = p_user_id AND supabase_auth_id IS NULL;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found or already migrated',
      'user_id', p_user_id
    );
  END IF;

  -- 一時パスワード生成（提供されない場合）
  v_temp_password := COALESCE(p_temp_password, 'TempPass' || extract(epoch from now())::text);

  -- Supabase Authにユーザー作成（管理者権限必要）
  -- 注意: この部分は実際にはSupabase Admin APIから実行する必要があります
  -- ここではプレースホルダーとして記録のみ
  
  INSERT INTO rightarm_user_migration_log (
    rightarm_user_id,
    email,
    user_type,
    temp_password,
    migration_status,
    created_at
  ) VALUES (
    v_user.id,
    v_user.email,
    v_user.user_type,
    v_temp_password,
    'pending_auth_creation',
    NOW()
  );

  RETURN json_build_object(
    'success', true,
    'message', 'User queued for migration',
    'user_id', v_user.id,
    'email', v_user.email,
    'temp_password', v_temp_password
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM,
    'user_id', p_user_id
  );
END;
$$ LANGUAGE plpgsql;

-- ====================
-- 移行ログテーブル
-- ====================

CREATE TABLE IF NOT EXISTS rightarm_user_migration_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rightarm_user_id UUID NOT NULL,
  email TEXT NOT NULL,
  user_type TEXT NOT NULL,
  temp_password TEXT,
  supabase_auth_id UUID,
  migration_status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ====================
-- 移行完了処理関数
-- ====================

CREATE OR REPLACE FUNCTION complete_user_migration(
  p_rightarm_user_id UUID,
  p_supabase_auth_id UUID
)
RETURNS JSON AS $$
BEGIN
  -- rightarm_users テーブルを更新
  UPDATE rightarm_users 
  SET 
    supabase_auth_id = p_supabase_auth_id,
    is_migrated = true,
    migrated_at = NOW(),
    auth_provider = 'supabase'
  WHERE id = p_rightarm_user_id;

  -- 移行ログを更新
  UPDATE rightarm_user_migration_log
  SET 
    supabase_auth_id = p_supabase_auth_id,
    migration_status = 'completed',
    completed_at = NOW()
  WHERE rightarm_user_id = p_rightarm_user_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Migration completed successfully',
    'rightarm_user_id', p_rightarm_user_id,
    'supabase_auth_id', p_supabase_auth_id
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql;

-- ====================
-- 一括移行処理
-- ====================

-- 移行対象ユーザーを一括処理する関数
CREATE OR REPLACE FUNCTION batch_migrate_users(p_limit INTEGER DEFAULT 10)
RETURNS JSON AS $$
DECLARE
  v_user RECORD;
  v_results JSON[] := '{}';
  v_result JSON;
  v_count INTEGER := 0;
BEGIN
  FOR v_user IN 
    SELECT id, email, user_type 
    FROM rightarm_users 
    WHERE supabase_auth_id IS NULL 
      AND status = 'active'
    ORDER BY created_at
    LIMIT p_limit
  LOOP
    -- 各ユーザーを移行キューに追加
    SELECT migrate_existing_user(v_user.id) INTO v_result;
    v_results := array_append(v_results, v_result);
    v_count := v_count + 1;
  END LOOP;

  RETURN json_build_object(
    'success', true,
    'processed_count', v_count,
    'results', v_results
  );
END;
$$ LANGUAGE plpgsql;

-- ====================
-- 移行状況レポート関数
-- ====================

CREATE OR REPLACE FUNCTION migration_report()
RETURNS TABLE (
  metric TEXT,
  value BIGINT,
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'total_users'::TEXT,
    COUNT(*)::BIGINT,
    'Total users in rightarm_users'::TEXT
  FROM rightarm_users;

  RETURN QUERY
  SELECT 
    'migrated_users'::TEXT,
    COUNT(*)::BIGINT,
    'Users successfully migrated to Supabase Auth'::TEXT
  FROM rightarm_users 
  WHERE is_migrated = true;

  RETURN QUERY
  SELECT 
    'pending_migration'::TEXT,
    COUNT(*)::BIGINT,
    'Users pending migration'::TEXT
  FROM rightarm_users 
  WHERE supabase_auth_id IS NULL AND status = 'active';

  RETURN QUERY
  SELECT 
    'migration_queue'::TEXT,
    COUNT(*)::BIGINT,
    'Users in migration queue'::TEXT
  FROM rightarm_user_migration_log 
  WHERE migration_status = 'pending_auth_creation';

  RETURN QUERY
  SELECT 
    'migration_errors'::TEXT,
    COUNT(*)::BIGINT,
    'Failed migrations'::TEXT
  FROM rightarm_user_migration_log 
  WHERE migration_status = 'error';
END;
$$ LANGUAGE plpgsql;

-- ====================
-- 移行検証関数
-- ====================

CREATE OR REPLACE FUNCTION validate_migration()
RETURNS TABLE (
  check_name TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  -- 孤立したプロフィールチェック
  RETURN QUERY
  SELECT 
    'orphaned_profiles'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'ERROR' END::TEXT,
    'Found ' || COUNT(*) || ' orphaned user profiles'::TEXT
  FROM rightarm_user_profiles up
  WHERE NOT EXISTS (
    SELECT 1 FROM rightarm_users u WHERE u.id = up.user_id
  );

  -- 重複メールアドレスチェック
  RETURN QUERY
  SELECT 
    'duplicate_emails'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'WARNING' END::TEXT,
    'Found ' || COUNT(*) || ' duplicate email addresses'::TEXT
  FROM (
    SELECT email, COUNT(*) as cnt
    FROM rightarm_users 
    GROUP BY email 
    HAVING COUNT(*) > 1
  ) duplicates;

  -- 移行済みユーザーの認証IDチェック
  RETURN QUERY
  SELECT 
    'migrated_auth_ids'::TEXT,
    CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'ERROR' END::TEXT,
    'Found ' || COUNT(*) || ' migrated users without auth IDs'::TEXT
  FROM rightarm_users 
  WHERE is_migrated = true AND supabase_auth_id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- ====================
-- 使用例とコメント
-- ====================

/*
=== 移行手順 ===

1. 移行前状況確認:
   SELECT * FROM rightarm_migration_status;

2. 移行対象ユーザー確認:
   SELECT * FROM rightarm_users_to_migrate LIMIT 5;

3. テスト移行（1ユーザー）:
   SELECT migrate_existing_user('user-uuid-here');

4. 一括移行（10ユーザーずつ）:
   SELECT batch_migrate_users(10);

5. 移行レポート確認:
   SELECT * FROM migration_report();

6. Supabase Admin APIで実際の認証ユーザー作成後:
   SELECT complete_user_migration('rightarm-user-id', 'supabase-auth-id');

7. 移行検証:
   SELECT * FROM validate_migration();

=== 注意事項 ===

- このスクリプトは移行の準備段階です
- 実際のSupabase Authユーザー作成は外部API経由で行う必要があります
- 移行前に必ずバックアップを取得してください
- 段階的に実行し、各段階で検証してください
*/

-- 実行完了メッセージ
DO $$
BEGIN
  RAISE NOTICE '=== 既存ユーザー移行スクリプト準備完了 ===';
  RAISE NOTICE '移行状況確認: SELECT * FROM migration_report();';
  RAISE NOTICE '移行開始: SELECT batch_migrate_users(5);';
END $$;