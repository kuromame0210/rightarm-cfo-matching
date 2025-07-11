-- Migration: Rename all rightarm_ tables to rextrix_
-- Rextrix v3 Database Migration Script
-- =====================================================
-- このスクリプトは rightarm_ プレフィックスを rextrix_ に変更します
-- 実行前に必ずデータベースのバックアップを取ってください

BEGIN;

-- 1. テーブル名の変更
-- ========================================

-- ユーザー関連テーブル
ALTER TABLE rightarm_users RENAME TO rextrix_users;
ALTER TABLE rightarm_user_profiles RENAME TO rextrix_user_profiles;

-- 企業関連テーブル
ALTER TABLE rightarm_companies RENAME TO rextrix_companies;
ALTER TABLE rightarm_company_challenges RENAME TO rextrix_company_challenges;

-- CFO関連テーブル
ALTER TABLE rightarm_cfos RENAME TO rextrix_cfos;
ALTER TABLE rightarm_cfo_skills RENAME TO rextrix_cfo_skills;

-- タグ管理テーブル
ALTER TABLE rightarm_skill_tags RENAME TO rextrix_skill_tags;
ALTER TABLE rightarm_challenge_tags RENAME TO rextrix_challenge_tags;

-- マッチング・スカウトテーブル
ALTER TABLE rightarm_interests RENAME TO rextrix_interests;
ALTER TABLE rightarm_scouts RENAME TO rextrix_scouts;

-- 契約・決済テーブル
ALTER TABLE rightarm_contracts RENAME TO rextrix_contracts;
ALTER TABLE rightarm_invoices RENAME TO rextrix_invoices;
ALTER TABLE rightarm_payments RENAME TO rextrix_payments;

-- メッセージングテーブル
ALTER TABLE rightarm_conversations RENAME TO rextrix_conversations;
ALTER TABLE rightarm_messages RENAME TO rextrix_messages;

-- 通知テーブル
ALTER TABLE rightarm_notifications RENAME TO rextrix_notifications;

-- 管理者テーブル
ALTER TABLE rightarm_admin_users RENAME TO rextrix_admin_users;
ALTER TABLE rightarm_audit_logs RENAME TO rextrix_audit_logs;

-- 2. インデックス名の変更
-- ========================================

-- ユーザー関連インデックス
ALTER INDEX IF EXISTS idx_rightarm_users_email RENAME TO idx_rextrix_users_email;
ALTER INDEX IF EXISTS idx_rightarm_users_supabase_auth_id RENAME TO idx_rextrix_users_supabase_auth_id;
ALTER INDEX IF EXISTS idx_rightarm_users_user_type RENAME TO idx_rextrix_users_user_type;
ALTER INDEX IF EXISTS idx_rightarm_user_profiles_user_id RENAME TO idx_rextrix_user_profiles_user_id;

-- 企業関連インデックス
ALTER INDEX IF EXISTS idx_rightarm_companies_user_id RENAME TO idx_rextrix_companies_user_id;
ALTER INDEX IF EXISTS idx_rightarm_companies_industry RENAME TO idx_rextrix_companies_industry;
ALTER INDEX IF EXISTS idx_rightarm_companies_region RENAME TO idx_rextrix_companies_region;
ALTER INDEX IF EXISTS idx_rightarm_companies_is_recruiting RENAME TO idx_rextrix_companies_is_recruiting;
ALTER INDEX IF EXISTS idx_rightarm_company_challenges_company_id RENAME TO idx_rextrix_company_challenges_company_id;
ALTER INDEX IF EXISTS idx_rightarm_company_challenges_tag_id RENAME TO idx_rextrix_company_challenges_tag_id;

-- CFO関連インデックス
ALTER INDEX IF EXISTS idx_rightarm_cfos_user_id RENAME TO idx_rextrix_cfos_user_id;
ALTER INDEX IF EXISTS idx_rightarm_cfos_is_available RENAME TO idx_rextrix_cfos_is_available;
ALTER INDEX IF EXISTS idx_rightarm_cfos_rating RENAME TO idx_rextrix_cfos_rating;
ALTER INDEX IF EXISTS idx_rightarm_cfo_skills_cfo_id RENAME TO idx_rextrix_cfo_skills_cfo_id;
ALTER INDEX IF EXISTS idx_rightarm_cfo_skills_tag_id RENAME TO idx_rextrix_cfo_skills_tag_id;

-- タグ関連インデックス
ALTER INDEX IF EXISTS idx_rightarm_skill_tags_category RENAME TO idx_rextrix_skill_tags_category;
ALTER INDEX IF EXISTS idx_rightarm_skill_tags_is_active RENAME TO idx_rextrix_skill_tags_is_active;
ALTER INDEX IF EXISTS idx_rightarm_challenge_tags_is_active RENAME TO idx_rextrix_challenge_tags_is_active;

-- マッチング関連インデックス
ALTER INDEX IF EXISTS idx_rightarm_interests_company_id RENAME TO idx_rextrix_interests_company_id;
ALTER INDEX IF EXISTS idx_rightarm_interests_cfo_id RENAME TO idx_rextrix_interests_cfo_id;
ALTER INDEX IF EXISTS idx_rightarm_interests_status RENAME TO idx_rextrix_interests_status;
ALTER INDEX IF EXISTS idx_rightarm_scouts_company_id RENAME TO idx_rextrix_scouts_company_id;
ALTER INDEX IF EXISTS idx_rightarm_scouts_cfo_id RENAME TO idx_rextrix_scouts_cfo_id;
ALTER INDEX IF EXISTS idx_rightarm_scouts_status RENAME TO idx_rextrix_scouts_status;

-- 契約関連インデックス
ALTER INDEX IF EXISTS idx_rightarm_contracts_company_id RENAME TO idx_rextrix_contracts_company_id;
ALTER INDEX IF EXISTS idx_rightarm_contracts_cfo_id RENAME TO idx_rextrix_contracts_cfo_id;
ALTER INDEX IF EXISTS idx_rightarm_contracts_status RENAME TO idx_rextrix_contracts_status;
ALTER INDEX IF EXISTS idx_rightarm_invoices_contract_id RENAME TO idx_rextrix_invoices_contract_id;
ALTER INDEX IF EXISTS idx_rightarm_invoices_status RENAME TO idx_rextrix_invoices_status;
ALTER INDEX IF EXISTS idx_rightarm_invoices_due_date RENAME TO idx_rextrix_invoices_due_date;
ALTER INDEX IF EXISTS idx_rightarm_payments_invoice_id RENAME TO idx_rextrix_payments_invoice_id;
ALTER INDEX IF EXISTS idx_rightarm_payments_status RENAME TO idx_rextrix_payments_status;

-- メッセージ関連インデックス
ALTER INDEX IF EXISTS idx_rightarm_conversations_company_id RENAME TO idx_rextrix_conversations_company_id;
ALTER INDEX IF EXISTS idx_rightarm_conversations_cfo_id RENAME TO idx_rextrix_conversations_cfo_id;
ALTER INDEX IF EXISTS idx_rightarm_messages_conversation_id RENAME TO idx_rextrix_messages_conversation_id;
ALTER INDEX IF EXISTS idx_rightarm_messages_sender_id RENAME TO idx_rextrix_messages_sender_id;

-- 通知関連インデックス
ALTER INDEX IF EXISTS idx_rightarm_notifications_user_id RENAME TO idx_rextrix_notifications_user_id;
ALTER INDEX IF EXISTS idx_rightarm_notifications_is_read RENAME TO idx_rextrix_notifications_is_read;

-- 管理者関連インデックス
ALTER INDEX IF EXISTS idx_rightarm_admin_users_user_id RENAME TO idx_rextrix_admin_users_user_id;
ALTER INDEX IF EXISTS idx_rightarm_audit_logs_user_id RENAME TO idx_rextrix_audit_logs_user_id;
ALTER INDEX IF EXISTS idx_rightarm_audit_logs_action RENAME TO idx_rextrix_audit_logs_action;

-- 3. 制約名の変更
-- ========================================

-- Primary Key制約
ALTER TABLE rextrix_users RENAME CONSTRAINT rightarm_users_pkey TO rextrix_users_pkey;
ALTER TABLE rextrix_user_profiles RENAME CONSTRAINT rightarm_user_profiles_pkey TO rextrix_user_profiles_pkey;
ALTER TABLE rextrix_companies RENAME CONSTRAINT rightarm_companies_pkey TO rextrix_companies_pkey;
ALTER TABLE rextrix_company_challenges RENAME CONSTRAINT rightarm_company_challenges_pkey TO rextrix_company_challenges_pkey;
ALTER TABLE rextrix_cfos RENAME CONSTRAINT rightarm_cfos_pkey TO rextrix_cfos_pkey;
ALTER TABLE rextrix_cfo_skills RENAME CONSTRAINT rightarm_cfo_skills_pkey TO rextrix_cfo_skills_pkey;
ALTER TABLE rextrix_skill_tags RENAME CONSTRAINT rightarm_skill_tags_pkey TO rextrix_skill_tags_pkey;
ALTER TABLE rextrix_challenge_tags RENAME CONSTRAINT rightarm_challenge_tags_pkey TO rextrix_challenge_tags_pkey;
ALTER TABLE rextrix_interests RENAME CONSTRAINT rightarm_interests_pkey TO rextrix_interests_pkey;
ALTER TABLE rextrix_scouts RENAME CONSTRAINT rightarm_scouts_pkey TO rextrix_scouts_pkey;
ALTER TABLE rextrix_contracts RENAME CONSTRAINT rightarm_contracts_pkey TO rextrix_contracts_pkey;
ALTER TABLE rextrix_invoices RENAME CONSTRAINT rightarm_invoices_pkey TO rextrix_invoices_pkey;
ALTER TABLE rextrix_payments RENAME CONSTRAINT rightarm_payments_pkey TO rextrix_payments_pkey;
ALTER TABLE rextrix_conversations RENAME CONSTRAINT rightarm_conversations_pkey TO rextrix_conversations_pkey;
ALTER TABLE rextrix_messages RENAME CONSTRAINT rightarm_messages_pkey TO rextrix_messages_pkey;
ALTER TABLE rextrix_notifications RENAME CONSTRAINT rightarm_notifications_pkey TO rextrix_notifications_pkey;
ALTER TABLE rextrix_admin_users RENAME CONSTRAINT rightarm_admin_users_pkey TO rextrix_admin_users_pkey;
ALTER TABLE rextrix_audit_logs RENAME CONSTRAINT rightarm_audit_logs_pkey TO rextrix_audit_logs_pkey;

-- Foreign Key制約
ALTER TABLE rextrix_user_profiles RENAME CONSTRAINT rightarm_user_profiles_user_id_fkey TO rextrix_user_profiles_user_id_fkey;
ALTER TABLE rextrix_companies RENAME CONSTRAINT rightarm_companies_user_id_fkey TO rextrix_companies_user_id_fkey;
ALTER TABLE rextrix_company_challenges RENAME CONSTRAINT rightarm_company_challenges_company_id_fkey TO rextrix_company_challenges_company_id_fkey;
ALTER TABLE rextrix_company_challenges RENAME CONSTRAINT rightarm_company_challenges_tag_id_fkey TO rextrix_company_challenges_tag_id_fkey;
ALTER TABLE rextrix_cfos RENAME CONSTRAINT rightarm_cfos_user_id_fkey TO rextrix_cfos_user_id_fkey;
ALTER TABLE rextrix_cfo_skills RENAME CONSTRAINT rightarm_cfo_skills_cfo_id_fkey TO rextrix_cfo_skills_cfo_id_fkey;
ALTER TABLE rextrix_cfo_skills RENAME CONSTRAINT rightarm_cfo_skills_tag_id_fkey TO rextrix_cfo_skills_tag_id_fkey;
ALTER TABLE rextrix_interests RENAME CONSTRAINT rightarm_interests_company_id_fkey TO rextrix_interests_company_id_fkey;
ALTER TABLE rextrix_interests RENAME CONSTRAINT rightarm_interests_cfo_id_fkey TO rextrix_interests_cfo_id_fkey;
ALTER TABLE rextrix_scouts RENAME CONSTRAINT rightarm_scouts_company_id_fkey TO rextrix_scouts_company_id_fkey;
ALTER TABLE rextrix_scouts RENAME CONSTRAINT rightarm_scouts_cfo_id_fkey TO rextrix_scouts_cfo_id_fkey;
ALTER TABLE rextrix_contracts RENAME CONSTRAINT rightarm_contracts_company_id_fkey TO rextrix_contracts_company_id_fkey;
ALTER TABLE rextrix_contracts RENAME CONSTRAINT rightarm_contracts_cfo_id_fkey TO rextrix_contracts_cfo_id_fkey;
ALTER TABLE rextrix_invoices RENAME CONSTRAINT rightarm_invoices_contract_id_fkey TO rextrix_invoices_contract_id_fkey;
ALTER TABLE rextrix_payments RENAME CONSTRAINT rightarm_payments_invoice_id_fkey TO rextrix_payments_invoice_id_fkey;
ALTER TABLE rextrix_conversations RENAME CONSTRAINT rightarm_conversations_company_id_fkey TO rextrix_conversations_company_id_fkey;
ALTER TABLE rextrix_conversations RENAME CONSTRAINT rightarm_conversations_cfo_id_fkey TO rextrix_conversations_cfo_id_fkey;
ALTER TABLE rextrix_messages RENAME CONSTRAINT rightarm_messages_conversation_id_fkey TO rextrix_messages_conversation_id_fkey;
ALTER TABLE rextrix_messages RENAME CONSTRAINT rightarm_messages_sender_id_fkey TO rextrix_messages_sender_id_fkey;
ALTER TABLE rextrix_notifications RENAME CONSTRAINT rightarm_notifications_user_id_fkey TO rextrix_notifications_user_id_fkey;
ALTER TABLE rextrix_admin_users RENAME CONSTRAINT rightarm_admin_users_user_id_fkey TO rextrix_admin_users_user_id_fkey;
ALTER TABLE rextrix_audit_logs RENAME CONSTRAINT rightarm_audit_logs_user_id_fkey TO rextrix_audit_logs_user_id_fkey;

-- Unique制約
ALTER TABLE rextrix_users RENAME CONSTRAINT rightarm_users_email_key TO rextrix_users_email_key;
ALTER TABLE rextrix_users RENAME CONSTRAINT rightarm_users_supabase_auth_id_key TO rextrix_users_supabase_auth_id_key;

-- 4. シーケンス名の変更（もし存在する場合）
-- ========================================

-- 主キーシーケンス（UUIDの場合は不要だが、万一のため）
DO $$
DECLARE
    seq_name text;
BEGIN
    FOR seq_name IN 
        SELECT schemaname||'.'||sequencename 
        FROM pg_sequences 
        WHERE sequencename LIKE 'rightarm_%'
    LOOP
        EXECUTE 'ALTER SEQUENCE ' || seq_name || ' RENAME TO ' || replace(seq_name, 'rightarm_', 'rextrix_');
    END LOOP;
END $$;

-- 5. ビュー名の変更（もし存在する場合）
-- ========================================

DO $$
DECLARE
    view_name text;
BEGIN
    FOR view_name IN 
        SELECT schemaname||'.'||viewname 
        FROM pg_views 
        WHERE viewname LIKE 'rightarm_%'
    LOOP
        EXECUTE 'ALTER VIEW ' || view_name || ' RENAME TO ' || replace(view_name, 'rightarm_', 'rextrix_');
    END LOOP;
END $$;

-- 6. 関数名の変更（もし存在する場合）
-- ========================================

DO $$
DECLARE
    func_name text;
BEGIN
    FOR func_name IN 
        SELECT n.nspname||'.'||p.proname||'('||pg_get_function_identity_arguments(p.oid)||')'
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname LIKE 'rightarm_%'
    LOOP
        EXECUTE 'ALTER FUNCTION ' || func_name || ' RENAME TO ' || replace(func_name, 'rightarm_', 'rextrix_');
    END LOOP;
END $$;

-- 7. トリガー名の変更
-- ========================================

DO $$
DECLARE
    trigger_info RECORD;
    new_trigger_name text;
BEGIN
    FOR trigger_info IN 
        SELECT t.tgname, c.relname 
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE t.tgname LIKE 'rightarm_%'
    LOOP
        new_trigger_name := replace(trigger_info.tgname, 'rightarm_', 'rextrix_');
        EXECUTE 'ALTER TRIGGER ' || trigger_info.tgname || ' ON ' || trigger_info.relname || ' RENAME TO ' || new_trigger_name;
    END LOOP;
END $$;

-- 8. RLSポリシー名の変更
-- ========================================

DO $$
DECLARE
    policy_info RECORD;
    new_policy_name text;
BEGIN
    FOR policy_info IN 
        SELECT pol.polname, c.relname
        FROM pg_policy pol
        JOIN pg_class c ON pol.polrelid = c.oid
        WHERE pol.polname LIKE 'rightarm_%'
    LOOP
        new_policy_name := replace(policy_info.polname, 'rightarm_', 'rextrix_');
        EXECUTE 'ALTER POLICY ' || policy_info.polname || ' ON ' || policy_info.relname || ' RENAME TO ' || new_policy_name;
    END LOOP;
END $$;

-- 9. マテリアライズドビューの変更（もし存在する場合）
-- ========================================

DO $$
DECLARE
    mv_name text;
BEGIN
    FOR mv_name IN 
        SELECT schemaname||'.'||matviewname 
        FROM pg_matviews 
        WHERE matviewname LIKE 'rightarm_%'
    LOOP
        EXECUTE 'ALTER MATERIALIZED VIEW ' || mv_name || ' RENAME TO ' || replace(mv_name, 'rightarm_', 'rextrix_');
    END LOOP;
END $$;

-- 10. 完了メッセージ
-- ========================================

DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'All rightarm_ prefixes have been changed to rextrix_';
    RAISE NOTICE 'Please update your application code to use the new table names.';
END $$;

COMMIT;

-- =====================================================
-- 実行後の確認クエリ
-- =====================================================

-- テーブル一覧の確認
-- SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'rextrix_%' ORDER BY table_name;

-- インデックス一覧の確認  
-- SELECT indexname FROM pg_indexes WHERE indexname LIKE 'idx_rextrix_%' ORDER BY indexname;

-- 制約一覧の確認
-- SELECT constraint_name FROM information_schema.table_constraints WHERE constraint_name LIKE 'rextrix_%' ORDER BY constraint_name;