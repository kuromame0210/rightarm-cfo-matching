-- RightArm v3 Supabase Auth ハイブリッド方式への移行SQL
-- 実行順序: Supabase SQL Editorで段階的に実行してください

-- ====================
-- Phase 1: テーブル構造の変更
-- ====================

-- 1.1 rightarm_users テーブルにSupabase Auth連携列を追加
ALTER TABLE rightarm_users 
ADD COLUMN IF NOT EXISTS supabase_auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'supabase',
ADD COLUMN IF NOT EXISTS is_migrated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS migrated_at TIMESTAMP WITH TIME ZONE;

-- 1.2 インデックス追加（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_rightarm_users_supabase_auth_id ON rightarm_users(supabase_auth_id);
CREATE INDEX IF NOT EXISTS idx_rightarm_users_migrated ON rightarm_users(is_migrated);

-- 1.3 password_hash 列をオプショナルに変更（Supabase Authが管理するため）
ALTER TABLE rightarm_users ALTER COLUMN password_hash DROP NOT NULL;

-- ====================
-- Phase 2: RLS Policy の更新
-- ====================

-- 2.1 既存のポリシーを削除
DROP POLICY IF EXISTS "Enable read access for all users" ON rightarm_users;
DROP POLICY IF EXISTS "Enable insert access for all users" ON rightarm_users;
DROP POLICY IF EXISTS "Enable update access for all users" ON rightarm_users;
DROP POLICY IF EXISTS "Enable delete access for all users" ON rightarm_users;

-- 2.2 Supabase Auth ベースの新しいポリシーを作成

-- rightarm_users テーブル
CREATE POLICY "Users can view own profile via auth" ON rightarm_users
FOR SELECT USING (
  auth.uid() = supabase_auth_id OR 
  auth.uid()::text = id OR  -- 旧システム互換性
  auth.uid() IS NULL        -- 開発時の互換性
);

CREATE POLICY "Users can update own profile via auth" ON rightarm_users
FOR UPDATE USING (
  auth.uid() = supabase_auth_id OR 
  auth.uid()::text = id
);

CREATE POLICY "Enable insert for authenticated users" ON rightarm_users
FOR INSERT WITH CHECK (
  auth.uid() = supabase_auth_id OR
  auth.uid() IS NOT NULL
);

-- rightarm_user_profiles テーブル
DROP POLICY IF EXISTS "Enable read access for all user_profiles" ON rightarm_user_profiles;
DROP POLICY IF EXISTS "Enable insert access for all user_profiles" ON rightarm_user_profiles;
DROP POLICY IF EXISTS "Enable update access for all user_profiles" ON rightarm_user_profiles;
DROP POLICY IF EXISTS "Enable delete access for all user_profiles" ON rightarm_user_profiles;

CREATE POLICY "Users can access own profile data" ON rightarm_user_profiles
FOR ALL USING (
  user_id IN (
    SELECT id FROM rightarm_users 
    WHERE supabase_auth_id = auth.uid() OR id = auth.uid()::text
  )
);

-- rightarm_companies テーブル  
DROP POLICY IF EXISTS "Enable read access for all companies" ON rightarm_companies;
DROP POLICY IF EXISTS "Enable insert access for all companies" ON rightarm_companies;
DROP POLICY IF EXISTS "Enable update access for all companies" ON rightarm_companies;
DROP POLICY IF EXISTS "Enable delete access for all companies" ON rightarm_companies;

CREATE POLICY "Users can access own company data" ON rightarm_companies
FOR ALL USING (
  user_id IN (
    SELECT id FROM rightarm_users 
    WHERE supabase_auth_id = auth.uid() OR id = auth.uid()::text
  )
);

-- rightarm_cfos テーブル
DROP POLICY IF EXISTS "Enable read access for all cfos" ON rightarm_cfos;
DROP POLICY IF EXISTS "Enable insert access for all cfos" ON rightarm_cfos;
DROP POLICY IF EXISTS "Enable update access for all cfos" ON rightarm_cfos;
DROP POLICY IF EXISTS "Enable delete access for all cfos" ON rightarm_cfos;

CREATE POLICY "Users can access own cfo data" ON rightarm_cfos
FOR ALL USING (
  user_id IN (
    SELECT id FROM rightarm_users 
    WHERE supabase_auth_id = auth.uid() OR id = auth.uid()::text
  )
);

-- 他のテーブルも同様のパターンで更新
CREATE POLICY "Auth users can access contracts" ON rightarm_contracts
FOR SELECT USING (
  company_id IN (
    SELECT c.id FROM rightarm_companies c
    JOIN rightarm_users u ON c.user_id = u.id
    WHERE u.supabase_auth_id = auth.uid()
  ) OR
  cfo_id IN (
    SELECT cf.id FROM rightarm_cfos cf
    JOIN rightarm_users u ON cf.user_id = u.id  
    WHERE u.supabase_auth_id = auth.uid()
  )
);

CREATE POLICY "Auth users can access invoices" ON rightarm_invoices
FOR SELECT USING (
  contract_id IN (
    SELECT con.id FROM rightarm_contracts con
    JOIN rightarm_companies c ON con.company_id = c.id
    JOIN rightarm_users u ON c.user_id = u.id
    WHERE u.supabase_auth_id = auth.uid()
    UNION
    SELECT con.id FROM rightarm_contracts con
    JOIN rightarm_cfos cf ON con.cfo_id = cf.id
    JOIN rightarm_users u ON cf.user_id = u.id
    WHERE u.supabase_auth_id = auth.uid()
  )
);

-- ====================
-- Phase 3: 認証システム移行用の関数
-- ====================

-- 3.1 Supabase Authユーザー作成後の自動プロフィール作成関数
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Supabase Authで新規ユーザー作成時に rightarm_users レコードを作成
  INSERT INTO rightarm_users (
    id,
    supabase_auth_id,
    email,
    user_type,
    status,
    email_verified,
    auth_provider,
    is_migrated,
    migrated_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'company'),
    'pending',
    NEW.email_confirmed_at IS NOT NULL,
    'supabase',
    TRUE,
    NOW(),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.2 トリガー作成
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ====================
-- Phase 4: 既存ユーザー移行準備
-- ====================

-- 4.1 移行状況確認用ビュー
CREATE OR REPLACE VIEW rightarm_migration_status AS
SELECT 
  COUNT(*) as total_users,
  COUNT(supabase_auth_id) as migrated_users,
  COUNT(*) - COUNT(supabase_auth_id) as pending_migration,
  ROUND(COUNT(supabase_auth_id)::numeric / COUNT(*)::numeric * 100, 2) as migration_percentage
FROM rightarm_users;

-- 4.2 移行対象ユーザー一覧ビュー  
CREATE OR REPLACE VIEW rightarm_users_to_migrate AS
SELECT 
  id,
  email,
  user_type,
  status,
  created_at
FROM rightarm_users 
WHERE supabase_auth_id IS NULL 
  AND status = 'active'
ORDER BY created_at DESC;

-- ====================
-- Phase 5: データ整合性チェック関数
-- ====================

-- 5.1 データ整合性チェック関数
CREATE OR REPLACE FUNCTION check_migration_integrity()
RETURNS TABLE (
  check_name TEXT,
  status TEXT,
  count_value BIGINT,
  message TEXT
) AS $$
BEGIN
  -- Supabase Authユーザー数
  RETURN QUERY
  SELECT 
    'auth_users_count'::TEXT,
    'info'::TEXT,
    COUNT(*)::BIGINT,
    'Total Supabase Auth users'::TEXT
  FROM auth.users;

  -- rightarm_users 総数
  RETURN QUERY  
  SELECT
    'rightarm_users_count'::TEXT,
    'info'::TEXT, 
    COUNT(*)::BIGINT,
    'Total rightarm users'::TEXT
  FROM rightarm_users;

  -- 移行済みユーザー数
  RETURN QUERY
  SELECT
    'migrated_users_count'::TEXT,
    'success'::TEXT,
    COUNT(*)::BIGINT,
    'Users linked to Supabase Auth'::TEXT
  FROM rightarm_users 
  WHERE supabase_auth_id IS NOT NULL;

  -- 移行未完了ユーザー数
  RETURN QUERY
  SELECT
    'pending_migration_count'::TEXT,
    CASE WHEN COUNT(*) > 0 THEN 'warning'::TEXT ELSE 'success'::TEXT END,
    COUNT(*)::BIGINT,
    'Users pending migration'::TEXT
  FROM rightarm_users 
  WHERE supabase_auth_id IS NULL;

  -- 孤立したプロフィール
  RETURN QUERY
  SELECT
    'orphaned_profiles_count'::TEXT,
    CASE WHEN COUNT(*) > 0 THEN 'error'::TEXT ELSE 'success'::TEXT END,
    COUNT(*)::BIGINT,
    'User profiles without valid user reference'::TEXT
  FROM rightarm_user_profiles up
  WHERE NOT EXISTS (
    SELECT 1 FROM rightarm_users u WHERE u.id = up.user_id
  );
END;
$$ LANGUAGE plpgsql;

-- ====================
-- Phase 6: 移行完了メッセージ
-- ====================

DO $$
BEGIN
  RAISE NOTICE '=== RightArm v3 Supabase Auth Migration SQL 実行完了 ===';
  RAISE NOTICE '';
  RAISE NOTICE '次のステップ:';
  RAISE NOTICE '1. 移行状況確認: SELECT * FROM rightarm_migration_status;';
  RAISE NOTICE '2. 整合性チェック: SELECT * FROM check_migration_integrity();';
  RAISE NOTICE '3. 新規ユーザー登録テスト';
  RAISE NOTICE '4. 既存ユーザー移行スクリプト実行';
  RAISE NOTICE '';
  RAISE NOTICE '重要: この変更後は認証システムをSupabase Authベースに変更してください';
END $$;