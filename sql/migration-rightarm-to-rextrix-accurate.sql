-- Migration: Rename existing rightarm_ tables to rextrix_ (Accurate Version)
-- Rextrix v3 Database Migration Script
-- =====================================================
-- 実際に存在するテーブルのみを対象とした正確なマイグレーション
-- 実行前に必ずデータベースのバックアップを取ってください

BEGIN;

-- 実在確認のための動的マイグレーション
-- ========================================

-- 1. 存在するテーブルのみをリネーム
-- ========================================

-- 基本テーブル（確実に存在する）
DO $$
BEGIN
    -- rightarm_users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rightarm_users') THEN
        ALTER TABLE rightarm_users RENAME TO rextrix_users;
        RAISE NOTICE 'Renamed: rightarm_users -> rextrix_users';
    END IF;

    -- rightarm_user_profiles
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rightarm_user_profiles') THEN
        ALTER TABLE rightarm_user_profiles RENAME TO rextrix_user_profiles;
        RAISE NOTICE 'Renamed: rightarm_user_profiles -> rextrix_user_profiles';
    END IF;

    -- rightarm_companies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rightarm_companies') THEN
        ALTER TABLE rightarm_companies RENAME TO rextrix_companies;
        RAISE NOTICE 'Renamed: rightarm_companies -> rextrix_companies';
    END IF;

    -- rightarm_cfos
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rightarm_cfos') THEN
        ALTER TABLE rightarm_cfos RENAME TO rextrix_cfos;
        RAISE NOTICE 'Renamed: rightarm_cfos -> rextrix_cfos';
    END IF;

    -- rightarm_skill_tags
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rightarm_skill_tags') THEN
        ALTER TABLE rightarm_skill_tags RENAME TO rextrix_skill_tags;
        RAISE NOTICE 'Renamed: rightarm_skill_tags -> rextrix_skill_tags';
    END IF;

    -- rightarm_challenge_tags
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rightarm_challenge_tags') THEN
        ALTER TABLE rightarm_challenge_tags RENAME TO rextrix_challenge_tags;
        RAISE NOTICE 'Renamed: rightarm_challenge_tags -> rextrix_challenge_tags';
    END IF;

    -- rightarm_contracts
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rightarm_contracts') THEN
        ALTER TABLE rightarm_contracts RENAME TO rextrix_contracts;
        RAISE NOTICE 'Renamed: rightarm_contracts -> rextrix_contracts';
    END IF;

    -- rightarm_invoices
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rightarm_invoices') THEN
        ALTER TABLE rightarm_invoices RENAME TO rextrix_invoices;
        RAISE NOTICE 'Renamed: rightarm_invoices -> rextrix_invoices';
    END IF;

    -- rightarm_conversations
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rightarm_conversations') THEN
        ALTER TABLE rightarm_conversations RENAME TO rextrix_conversations;
        RAISE NOTICE 'Renamed: rightarm_conversations -> rextrix_conversations';
    END IF;

    -- rightarm_messages
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rightarm_messages') THEN
        ALTER TABLE rightarm_messages RENAME TO rextrix_messages;
        RAISE NOTICE 'Renamed: rightarm_messages -> rextrix_messages';
    END IF;

    -- rightarm_notifications
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rightarm_notifications') THEN
        ALTER TABLE rightarm_notifications RENAME TO rextrix_notifications;
        RAISE NOTICE 'Renamed: rightarm_notifications -> rextrix_notifications';
    END IF;

    -- rightarm_admin_users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rightarm_admin_users') THEN
        ALTER TABLE rightarm_admin_users RENAME TO rextrix_admin_users;
        RAISE NOTICE 'Renamed: rightarm_admin_users -> rextrix_admin_users';
    END IF;

    -- rightarm_audit_logs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rightarm_audit_logs') THEN
        ALTER TABLE rightarm_audit_logs RENAME TO rextrix_audit_logs;
        RAISE NOTICE 'Renamed: rightarm_audit_logs -> rextrix_audit_logs';
    END IF;

    -- 存在しないテーブルのスキップメッセージ
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rightarm_payments') THEN
        RAISE NOTICE 'Skipped: rightarm_payments (table does not exist)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rightarm_company_challenges') THEN
        RAISE NOTICE 'Skipped: rightarm_company_challenges (table does not exist)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rightarm_cfo_skills') THEN
        RAISE NOTICE 'Skipped: rightarm_cfo_skills (table does not exist)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rightarm_interests') THEN
        RAISE NOTICE 'Skipped: rightarm_interests (table does not exist)';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rightarm_scouts') THEN
        RAISE NOTICE 'Skipped: rightarm_scouts (table does not exist)';
    END IF;
END $$;

-- 2. インデックス名の変更（存在するもののみ）
-- ========================================

DO $$
DECLARE
    index_name text;
    new_name text;
BEGIN
    FOR index_name IN 
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
          AND indexname LIKE 'idx_rightarm_%'
    LOOP
        new_name := replace(index_name, 'rightarm_', 'rextrix_');
        EXECUTE 'ALTER INDEX ' || index_name || ' RENAME TO ' || new_name;
        RAISE NOTICE 'Renamed index: % -> %', index_name, new_name;
    END LOOP;
END $$;

-- 3. 制約名の変更（存在するもののみ）
-- ========================================

DO $$
DECLARE
    constraint_rec RECORD;
    new_name text;
BEGIN
    FOR constraint_rec IN 
        SELECT constraint_name, table_name 
        FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
          AND constraint_name LIKE '%rightarm_%'
    LOOP
        new_name := replace(constraint_rec.constraint_name, 'rightarm_', 'rextrix_');
        EXECUTE 'ALTER TABLE ' || constraint_rec.table_name || ' RENAME CONSTRAINT ' || constraint_rec.constraint_name || ' TO ' || new_name;
        RAISE NOTICE 'Renamed constraint: % -> % (table: %)', constraint_rec.constraint_name, new_name, constraint_rec.table_name;
    END LOOP;
END $$;

-- 4. その他のデータベースオブジェクト名の変更
-- ========================================

-- シーケンス名の変更
DO $$
DECLARE
    seq_name text;
    new_name text;
BEGIN
    FOR seq_name IN 
        SELECT schemaname||'.'||sequencename as full_name
        FROM pg_sequences 
        WHERE sequencename LIKE '%rightarm_%'
    LOOP
        new_name := replace(seq_name, 'rightarm_', 'rextrix_');
        EXECUTE 'ALTER SEQUENCE ' || seq_name || ' RENAME TO ' || replace(seq_name, schemaname||'.', '') || '_new';
        EXECUTE 'ALTER SEQUENCE ' || replace(seq_name, schemaname||'.', '') || '_new RENAME TO ' || replace(replace(seq_name, schemaname||'.', ''), 'rightarm_', 'rextrix_');
        RAISE NOTICE 'Renamed sequence: % -> %', seq_name, new_name;
    END LOOP;
END $$;

-- ビュー名の変更
DO $$
DECLARE
    view_name text;
    new_name text;
BEGIN
    FOR view_name IN 
        SELECT viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
          AND viewname LIKE '%rightarm_%'
    LOOP
        new_name := replace(view_name, 'rightarm_', 'rextrix_');
        EXECUTE 'ALTER VIEW ' || view_name || ' RENAME TO ' || new_name;
        RAISE NOTICE 'Renamed view: % -> %', view_name, new_name;
    END LOOP;
END $$;

-- 関数名の変更
DO $$
DECLARE
    func_rec RECORD;
    new_name text;
BEGIN
    FOR func_rec IN 
        SELECT p.proname, n.nspname
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
          AND p.proname LIKE '%rightarm_%'
    LOOP
        new_name := replace(func_rec.proname, 'rightarm_', 'rextrix_');
        EXECUTE 'ALTER FUNCTION ' || func_rec.nspname || '.' || func_rec.proname || ' RENAME TO ' || new_name;
        RAISE NOTICE 'Renamed function: % -> %', func_rec.proname, new_name;
    END LOOP;
END $$;

-- トリガー名の変更
DO $$
DECLARE
    trigger_rec RECORD;
    new_name text;
BEGIN
    FOR trigger_rec IN 
        SELECT t.tgname, c.relname 
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public'
          AND t.tgname LIKE '%rightarm_%'
          AND NOT t.tgisinternal
    LOOP
        new_name := replace(trigger_rec.tgname, 'rightarm_', 'rextrix_');
        EXECUTE 'ALTER TRIGGER ' || trigger_rec.tgname || ' ON ' || trigger_rec.relname || ' RENAME TO ' || new_name;
        RAISE NOTICE 'Renamed trigger: % -> % (table: %)', trigger_rec.tgname, new_name, trigger_rec.relname;
    END LOOP;
END $$;

-- RLSポリシー名の変更
DO $$
DECLARE
    policy_rec RECORD;
    new_name text;
BEGIN
    FOR policy_rec IN 
        SELECT pol.polname, c.relname
        FROM pg_policy pol
        JOIN pg_class c ON pol.polrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public'
          AND pol.polname LIKE '%rightarm_%'
    LOOP
        new_name := replace(policy_rec.polname, 'rightarm_', 'rextrix_');
        EXECUTE 'ALTER POLICY ' || policy_rec.polname || ' ON ' || policy_rec.relname || ' RENAME TO ' || new_name;
        RAISE NOTICE 'Renamed policy: % -> % (table: %)', policy_rec.polname, new_name, policy_rec.relname;
    END LOOP;
END $$;

-- 5. 完了メッセージ
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'All existing rightarm_ objects have been renamed to rextrix_';
    RAISE NOTICE 'Non-existent tables were skipped safely.';
    RAISE NOTICE 'Please update your application code to use the new names.';
    RAISE NOTICE '========================================';
END $$;

COMMIT;

-- =====================================================
-- 実行後の確認クエリ
-- =====================================================

-- 実行後に以下のクエリで確認してください:

-- 変更されたテーブル一覧
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'rextrix_%' ORDER BY table_name;

-- 残っているrightarmテーブル（あれば警告）
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'rightarm_%' ORDER BY table_name;

-- 変更されたインデックス一覧
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_rextrix_%' ORDER BY indexname;

-- 変更された制約一覧
-- SELECT constraint_name, table_name FROM information_schema.table_constraints WHERE table_schema = 'public' AND constraint_name LIKE '%rextrix_%' ORDER BY table_name, constraint_name;