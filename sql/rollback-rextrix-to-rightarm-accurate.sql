-- Rollback Migration: Rename all rextrix_ tables back to rightarm_ (Accurate Version)
-- RightArm v3 Database Rollback Script
-- =====================================================
-- 安全なロールバック: 存在するrextrix_オブジェクトのみを対象

BEGIN;

-- 1. 存在するテーブルのみをロールバック
-- ========================================

DO $$
BEGIN
    -- rextrix_users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rextrix_users') THEN
        ALTER TABLE rextrix_users RENAME TO rightarm_users;
        RAISE NOTICE 'Rolled back: rextrix_users -> rightarm_users';
    END IF;

    -- rextrix_user_profiles
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rextrix_user_profiles') THEN
        ALTER TABLE rextrix_user_profiles RENAME TO rightarm_user_profiles;
        RAISE NOTICE 'Rolled back: rextrix_user_profiles -> rightarm_user_profiles';
    END IF;

    -- rextrix_companies
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rextrix_companies') THEN
        ALTER TABLE rextrix_companies RENAME TO rightarm_companies;
        RAISE NOTICE 'Rolled back: rextrix_companies -> rightarm_companies';
    END IF;

    -- rextrix_cfos
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rextrix_cfos') THEN
        ALTER TABLE rextrix_cfos RENAME TO rightarm_cfos;
        RAISE NOTICE 'Rolled back: rextrix_cfos -> rightarm_cfos';
    END IF;

    -- rextrix_skill_tags
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rextrix_skill_tags') THEN
        ALTER TABLE rextrix_skill_tags RENAME TO rightarm_skill_tags;
        RAISE NOTICE 'Rolled back: rextrix_skill_tags -> rightarm_skill_tags';
    END IF;

    -- rextrix_challenge_tags
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rextrix_challenge_tags') THEN
        ALTER TABLE rextrix_challenge_tags RENAME TO rightarm_challenge_tags;
        RAISE NOTICE 'Rolled back: rextrix_challenge_tags -> rightarm_challenge_tags';
    END IF;

    -- rextrix_contracts
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rextrix_contracts') THEN
        ALTER TABLE rextrix_contracts RENAME TO rightarm_contracts;
        RAISE NOTICE 'Rolled back: rextrix_contracts -> rightarm_contracts';
    END IF;

    -- rextrix_invoices
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rextrix_invoices') THEN
        ALTER TABLE rextrix_invoices RENAME TO rightarm_invoices;
        RAISE NOTICE 'Rolled back: rextrix_invoices -> rightarm_invoices';
    END IF;

    -- rextrix_conversations
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rextrix_conversations') THEN
        ALTER TABLE rextrix_conversations RENAME TO rightarm_conversations;
        RAISE NOTICE 'Rolled back: rextrix_conversations -> rightarm_conversations';
    END IF;

    -- rextrix_messages
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rextrix_messages') THEN
        ALTER TABLE rextrix_messages RENAME TO rightarm_messages;
        RAISE NOTICE 'Rolled back: rextrix_messages -> rightarm_messages';
    END IF;

    -- rextrix_notifications
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rextrix_notifications') THEN
        ALTER TABLE rextrix_notifications RENAME TO rightarm_notifications;
        RAISE NOTICE 'Rolled back: rextrix_notifications -> rightarm_notifications';
    END IF;

    -- rextrix_admin_users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rextrix_admin_users') THEN
        ALTER TABLE rextrix_admin_users RENAME TO rightarm_admin_users;
        RAISE NOTICE 'Rolled back: rextrix_admin_users -> rightarm_admin_users';
    END IF;

    -- rextrix_audit_logs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rextrix_audit_logs') THEN
        ALTER TABLE rextrix_audit_logs RENAME TO rightarm_audit_logs;
        RAISE NOTICE 'Rolled back: rextrix_audit_logs -> rightarm_audit_logs';
    END IF;
END $$;

-- 2. インデックス名のロールバック
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
          AND indexname LIKE 'idx_rextrix_%'
    LOOP
        new_name := replace(index_name, 'rextrix_', 'rightarm_');
        EXECUTE 'ALTER INDEX ' || index_name || ' RENAME TO ' || new_name;
        RAISE NOTICE 'Rolled back index: % -> %', index_name, new_name;
    END LOOP;
END $$;

-- 3. 制約名のロールバック
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
          AND constraint_name LIKE '%rextrix_%'
    LOOP
        new_name := replace(constraint_rec.constraint_name, 'rextrix_', 'rightarm_');
        EXECUTE 'ALTER TABLE ' || constraint_rec.table_name || ' RENAME CONSTRAINT ' || constraint_rec.constraint_name || ' TO ' || new_name;
        RAISE NOTICE 'Rolled back constraint: % -> % (table: %)', constraint_rec.constraint_name, new_name, constraint_rec.table_name;
    END LOOP;
END $$;

-- 4. その他のオブジェクトのロールバック
-- ========================================

-- シーケンス名のロールバック
DO $$
DECLARE
    seq_name text;
    new_name text;
BEGIN
    FOR seq_name IN 
        SELECT sequencename 
        FROM pg_sequences 
        WHERE schemaname = 'public'
          AND sequencename LIKE '%rextrix_%'
    LOOP
        new_name := replace(seq_name, 'rextrix_', 'rightarm_');
        EXECUTE 'ALTER SEQUENCE ' || seq_name || ' RENAME TO ' || new_name;
        RAISE NOTICE 'Rolled back sequence: % -> %', seq_name, new_name;
    END LOOP;
END $$;

-- ビュー名のロールバック
DO $$
DECLARE
    view_name text;
    new_name text;
BEGIN
    FOR view_name IN 
        SELECT viewname 
        FROM pg_views 
        WHERE schemaname = 'public'
          AND viewname LIKE '%rextrix_%'
    LOOP
        new_name := replace(view_name, 'rextrix_', 'rightarm_');
        EXECUTE 'ALTER VIEW ' || view_name || ' RENAME TO ' || new_name;
        RAISE NOTICE 'Rolled back view: % -> %', view_name, new_name;
    END LOOP;
END $$;

-- 関数名のロールバック
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
          AND p.proname LIKE '%rextrix_%'
    LOOP
        new_name := replace(func_rec.proname, 'rextrix_', 'rightarm_');
        EXECUTE 'ALTER FUNCTION ' || func_rec.nspname || '.' || func_rec.proname || ' RENAME TO ' || new_name;
        RAISE NOTICE 'Rolled back function: % -> %', func_rec.proname, new_name;
    END LOOP;
END $$;

-- トリガー名のロールバック
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
          AND t.tgname LIKE '%rextrix_%'
          AND NOT t.tgisinternal
    LOOP
        new_name := replace(trigger_rec.tgname, 'rextrix_', 'rightarm_');
        EXECUTE 'ALTER TRIGGER ' || trigger_rec.tgname || ' ON ' || trigger_rec.relname || ' RENAME TO ' || new_name;
        RAISE NOTICE 'Rolled back trigger: % -> % (table: %)', trigger_rec.tgname, new_name, trigger_rec.relname;
    END LOOP;
END $$;

-- RLSポリシー名のロールバック
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
          AND pol.polname LIKE '%rextrix_%'
    LOOP
        new_name := replace(policy_rec.polname, 'rextrix_', 'rightarm_');
        EXECUTE 'ALTER POLICY ' || policy_rec.polname || ' ON ' || policy_rec.relname || ' RENAME TO ' || new_name;
        RAISE NOTICE 'Rolled back policy: % -> % (table: %)', policy_rec.polname, new_name, policy_rec.relname;
    END LOOP;
END $$;

-- 5. 完了メッセージ
-- ========================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Rollback completed successfully!';
    RAISE NOTICE 'All rextrix_ objects have been rolled back to rightarm_';
    RAISE NOTICE 'Database schema has been restored to the original state.';
    RAISE NOTICE '========================================';
END $$;

COMMIT;