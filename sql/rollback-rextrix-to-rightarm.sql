-- Rollback Migration: Rename all rextrix_ tables back to rightarm_
-- RightArm v3 Database Rollback Script
-- =====================================================
-- このスクリプトは rextrix_ プレフィックスを rightarm_ に戻します
-- 万一問題が発生した場合のロールバック用です

BEGIN;

-- 1. テーブル名のロールバック
-- ========================================

-- ユーザー関連テーブル
ALTER TABLE rextrix_users RENAME TO rightarm_users;
ALTER TABLE rextrix_user_profiles RENAME TO rightarm_user_profiles;

-- 企業関連テーブル
ALTER TABLE rextrix_companies RENAME TO rightarm_companies;
ALTER TABLE rextrix_company_challenges RENAME TO rightarm_company_challenges;

-- CFO関連テーブル
ALTER TABLE rextrix_cfos RENAME TO rightarm_cfos;
ALTER TABLE rextrix_cfo_skills RENAME TO rightarm_cfo_skills;

-- タグ管理テーブル
ALTER TABLE rextrix_skill_tags RENAME TO rightarm_skill_tags;
ALTER TABLE rextrix_challenge_tags RENAME TO rightarm_challenge_tags;

-- マッチング・スカウトテーブル
ALTER TABLE rextrix_interests RENAME TO rightarm_interests;
ALTER TABLE rextrix_scouts RENAME TO rightarm_scouts;

-- 契約・決済テーブル
ALTER TABLE rextrix_contracts RENAME TO rightarm_contracts;
ALTER TABLE rextrix_invoices RENAME TO rightarm_invoices;
ALTER TABLE rextrix_payments RENAME TO rightarm_payments;

-- メッセージングテーブル
ALTER TABLE rextrix_conversations RENAME TO rightarm_conversations;
ALTER TABLE rextrix_messages RENAME TO rightarm_messages;

-- 通知テーブル
ALTER TABLE rextrix_notifications RENAME TO rightarm_notifications;

-- 管理者テーブル
ALTER TABLE rextrix_admin_users RENAME TO rightarm_admin_users;
ALTER TABLE rextrix_audit_logs RENAME TO rightarm_audit_logs;

-- 2. インデックス名のロールバック
-- ========================================

-- ユーザー関連インデックス
ALTER INDEX IF EXISTS idx_rextrix_users_email RENAME TO idx_rightarm_users_email;
ALTER INDEX IF EXISTS idx_rextrix_users_supabase_auth_id RENAME TO idx_rightarm_users_supabase_auth_id;
ALTER INDEX IF EXISTS idx_rextrix_users_user_type RENAME TO idx_rightarm_users_user_type;
ALTER INDEX IF EXISTS idx_rextrix_user_profiles_user_id RENAME TO idx_rightarm_user_profiles_user_id;

-- 企業関連インデックス
ALTER INDEX IF EXISTS idx_rextrix_companies_user_id RENAME TO idx_rightarm_companies_user_id;
ALTER INDEX IF EXISTS idx_rextrix_companies_industry RENAME TO idx_rightarm_companies_industry;
ALTER INDEX IF EXISTS idx_rextrix_companies_region RENAME TO idx_rightarm_companies_region;
ALTER INDEX IF EXISTS idx_rextrix_companies_is_recruiting RENAME TO idx_rightarm_companies_is_recruiting;
ALTER INDEX IF EXISTS idx_rextrix_company_challenges_company_id RENAME TO idx_rightarm_company_challenges_company_id;
ALTER INDEX IF EXISTS idx_rextrix_company_challenges_tag_id RENAME TO idx_rightarm_company_challenges_tag_id;

-- CFO関連インデックス
ALTER INDEX IF EXISTS idx_rextrix_cfos_user_id RENAME TO idx_rightarm_cfos_user_id;
ALTER INDEX IF EXISTS idx_rextrix_cfos_is_available RENAME TO idx_rightarm_cfos_is_available;
ALTER INDEX IF EXISTS idx_rextrix_cfos_rating RENAME TO idx_rightarm_cfos_rating;
ALTER INDEX IF EXISTS idx_rextrix_cfo_skills_cfo_id RENAME TO idx_rightarm_cfo_skills_cfo_id;
ALTER INDEX IF EXISTS idx_rextrix_cfo_skills_tag_id RENAME TO idx_rightarm_cfo_skills_tag_id;

-- タグ関連インデックス
ALTER INDEX IF EXISTS idx_rextrix_skill_tags_category RENAME TO idx_rightarm_skill_tags_category;
ALTER INDEX IF EXISTS idx_rextrix_skill_tags_is_active RENAME TO idx_rightarm_skill_tags_is_active;
ALTER INDEX IF EXISTS idx_rextrix_challenge_tags_is_active RENAME TO idx_rightarm_challenge_tags_is_active;

-- マッチング関連インデックス
ALTER INDEX IF EXISTS idx_rextrix_interests_company_id RENAME TO idx_rightarm_interests_company_id;
ALTER INDEX IF EXISTS idx_rextrix_interests_cfo_id RENAME TO idx_rightarm_interests_cfo_id;
ALTER INDEX IF EXISTS idx_rextrix_interests_status RENAME TO idx_rightarm_interests_status;
ALTER INDEX IF EXISTS idx_rextrix_scouts_company_id RENAME TO idx_rightarm_scouts_company_id;
ALTER INDEX IF EXISTS idx_rextrix_scouts_cfo_id RENAME TO idx_rightarm_scouts_cfo_id;
ALTER INDEX IF EXISTS idx_rextrix_scouts_status RENAME TO idx_rightarm_scouts_status;

-- 契約関連インデックス
ALTER INDEX IF EXISTS idx_rextrix_contracts_company_id RENAME TO idx_rightarm_contracts_company_id;
ALTER INDEX IF EXISTS idx_rextrix_contracts_cfo_id RENAME TO idx_rightarm_contracts_cfo_id;
ALTER INDEX IF EXISTS idx_rextrix_contracts_status RENAME TO idx_rightarm_contracts_status;
ALTER INDEX IF EXISTS idx_rextrix_invoices_contract_id RENAME TO idx_rightarm_invoices_contract_id;
ALTER INDEX IF EXISTS idx_rextrix_invoices_status RENAME TO idx_rightarm_invoices_status;
ALTER INDEX IF EXISTS idx_rextrix_invoices_due_date RENAME TO idx_rightarm_invoices_due_date;
ALTER INDEX IF EXISTS idx_rextrix_payments_invoice_id RENAME TO idx_rightarm_payments_invoice_id;
ALTER INDEX IF EXISTS idx_rextrix_payments_status RENAME TO idx_rightarm_payments_status;

-- メッセージ関連インデックス
ALTER INDEX IF EXISTS idx_rextrix_conversations_company_id RENAME TO idx_rightarm_conversations_company_id;
ALTER INDEX IF EXISTS idx_rextrix_conversations_cfo_id RENAME TO idx_rightarm_conversations_cfo_id;
ALTER INDEX IF EXISTS idx_rextrix_messages_conversation_id RENAME TO idx_rightarm_messages_conversation_id;
ALTER INDEX IF EXISTS idx_rextrix_messages_sender_id RENAME TO idx_rightarm_messages_sender_id;

-- 通知関連インデックス
ALTER INDEX IF EXISTS idx_rextrix_notifications_user_id RENAME TO idx_rightarm_notifications_user_id;
ALTER INDEX IF EXISTS idx_rextrix_notifications_is_read RENAME TO idx_rightarm_notifications_is_read;

-- 管理者関連インデックス
ALTER INDEX IF EXISTS idx_rextrix_admin_users_user_id RENAME TO idx_rightarm_admin_users_user_id;
ALTER INDEX IF EXISTS idx_rextrix_audit_logs_user_id RENAME TO idx_rightarm_audit_logs_user_id;
ALTER INDEX IF EXISTS idx_rextrix_audit_logs_action RENAME TO idx_rightarm_audit_logs_action;

-- 3. 制約名のロールバック
-- ========================================

-- Primary Key制約
ALTER TABLE rightarm_users RENAME CONSTRAINT rextrix_users_pkey TO rightarm_users_pkey;
ALTER TABLE rightarm_user_profiles RENAME CONSTRAINT rextrix_user_profiles_pkey TO rightarm_user_profiles_pkey;
ALTER TABLE rightarm_companies RENAME CONSTRAINT rextrix_companies_pkey TO rightarm_companies_pkey;
ALTER TABLE rightarm_company_challenges RENAME CONSTRAINT rextrix_company_challenges_pkey TO rightarm_company_challenges_pkey;
ALTER TABLE rightarm_cfos RENAME CONSTRAINT rextrix_cfos_pkey TO rightarm_cfos_pkey;
ALTER TABLE rightarm_cfo_skills RENAME CONSTRAINT rextrix_cfo_skills_pkey TO rightarm_cfo_skills_pkey;
ALTER TABLE rightarm_skill_tags RENAME CONSTRAINT rextrix_skill_tags_pkey TO rightarm_skill_tags_pkey;
ALTER TABLE rightarm_challenge_tags RENAME CONSTRAINT rextrix_challenge_tags_pkey TO rightarm_challenge_tags_pkey;
ALTER TABLE rightarm_interests RENAME CONSTRAINT rextrix_interests_pkey TO rightarm_interests_pkey;
ALTER TABLE rightarm_scouts RENAME CONSTRAINT rextrix_scouts_pkey TO rightarm_scouts_pkey;
ALTER TABLE rightarm_contracts RENAME CONSTRAINT rextrix_contracts_pkey TO rightarm_contracts_pkey;
ALTER TABLE rightarm_invoices RENAME CONSTRAINT rextrix_invoices_pkey TO rightarm_invoices_pkey;
ALTER TABLE rightarm_payments RENAME CONSTRAINT rextrix_payments_pkey TO rightarm_payments_pkey;
ALTER TABLE rightarm_conversations RENAME CONSTRAINT rextrix_conversations_pkey TO rightarm_conversations_pkey;
ALTER TABLE rightarm_messages RENAME CONSTRAINT rextrix_messages_pkey TO rightarm_messages_pkey;
ALTER TABLE rightarm_notifications RENAME CONSTRAINT rextrix_notifications_pkey TO rightarm_notifications_pkey;
ALTER TABLE rightarm_admin_users RENAME CONSTRAINT rextrix_admin_users_pkey TO rightarm_admin_users_pkey;
ALTER TABLE rightarm_audit_logs RENAME CONSTRAINT rextrix_audit_logs_pkey TO rightarm_audit_logs_pkey;

-- Foreign Key制約
ALTER TABLE rightarm_user_profiles RENAME CONSTRAINT rextrix_user_profiles_user_id_fkey TO rightarm_user_profiles_user_id_fkey;
ALTER TABLE rightarm_companies RENAME CONSTRAINT rextrix_companies_user_id_fkey TO rightarm_companies_user_id_fkey;
ALTER TABLE rightarm_company_challenges RENAME CONSTRAINT rextrix_company_challenges_company_id_fkey TO rightarm_company_challenges_company_id_fkey;
ALTER TABLE rightarm_company_challenges RENAME CONSTRAINT rextrix_company_challenges_tag_id_fkey TO rightarm_company_challenges_tag_id_fkey;
ALTER TABLE rightarm_cfos RENAME CONSTRAINT rextrix_cfos_user_id_fkey TO rightarm_cfos_user_id_fkey;
ALTER TABLE rightarm_cfo_skills RENAME CONSTRAINT rextrix_cfo_skills_cfo_id_fkey TO rightarm_cfo_skills_cfo_id_fkey;
ALTER TABLE rightarm_cfo_skills RENAME CONSTRAINT rextrix_cfo_skills_tag_id_fkey TO rightarm_cfo_skills_tag_id_fkey;
ALTER TABLE rightarm_interests RENAME CONSTRAINT rextrix_interests_company_id_fkey TO rightarm_interests_company_id_fkey;
ALTER TABLE rightarm_interests RENAME CONSTRAINT rextrix_interests_cfo_id_fkey TO rightarm_interests_cfo_id_fkey;
ALTER TABLE rightarm_scouts RENAME CONSTRAINT rextrix_scouts_company_id_fkey TO rightarm_scouts_company_id_fkey;
ALTER TABLE rightarm_scouts RENAME CONSTRAINT rextrix_scouts_cfo_id_fkey TO rightarm_scouts_cfo_id_fkey;
ALTER TABLE rightarm_contracts RENAME CONSTRAINT rextrix_contracts_company_id_fkey TO rightarm_contracts_company_id_fkey;
ALTER TABLE rightarm_contracts RENAME CONSTRAINT rextrix_contracts_cfo_id_fkey TO rightarm_contracts_cfo_id_fkey;
ALTER TABLE rightarm_invoices RENAME CONSTRAINT rextrix_invoices_contract_id_fkey TO rightarm_invoices_contract_id_fkey;
ALTER TABLE rightarm_payments RENAME CONSTRAINT rextrix_payments_invoice_id_fkey TO rightarm_payments_invoice_id_fkey;
ALTER TABLE rightarm_conversations RENAME CONSTRAINT rextrix_conversations_company_id_fkey TO rightarm_conversations_company_id_fkey;
ALTER TABLE rightarm_conversations RENAME CONSTRAINT rextrix_conversations_cfo_id_fkey TO rightarm_conversations_cfo_id_fkey;
ALTER TABLE rightarm_messages RENAME CONSTRAINT rextrix_messages_conversation_id_fkey TO rightarm_messages_conversation_id_fkey;
ALTER TABLE rightarm_messages RENAME CONSTRAINT rextrix_messages_sender_id_fkey TO rightarm_messages_sender_id_fkey;
ALTER TABLE rightarm_notifications RENAME CONSTRAINT rextrix_notifications_user_id_fkey TO rightarm_notifications_user_id_fkey;
ALTER TABLE rightarm_admin_users RENAME CONSTRAINT rextrix_admin_users_user_id_fkey TO rightarm_admin_users_user_id_fkey;
ALTER TABLE rightarm_audit_logs RENAME CONSTRAINT rextrix_audit_logs_user_id_fkey TO rightarm_audit_logs_user_id_fkey;

-- Unique制約
ALTER TABLE rightarm_users RENAME CONSTRAINT rextrix_users_email_key TO rightarm_users_email_key;
ALTER TABLE rightarm_users RENAME CONSTRAINT rextrix_users_supabase_auth_id_key TO rightarm_users_supabase_auth_id_key;

-- 4. その他のオブジェクト名のロールバック
-- ========================================

-- シーケンス名のロールバック
DO $$
DECLARE
    seq_name text;
BEGIN
    FOR seq_name IN 
        SELECT schemaname||'.'||sequencename 
        FROM pg_sequences 
        WHERE sequencename LIKE 'rextrix_%'
    LOOP
        EXECUTE 'ALTER SEQUENCE ' || seq_name || ' RENAME TO ' || replace(seq_name, 'rextrix_', 'rightarm_');
    END LOOP;
END $$;

-- ビュー名のロールバック
DO $$
DECLARE
    view_name text;
BEGIN
    FOR view_name IN 
        SELECT schemaname||'.'||viewname 
        FROM pg_views 
        WHERE viewname LIKE 'rextrix_%'
    LOOP
        EXECUTE 'ALTER VIEW ' || view_name || ' RENAME TO ' || replace(view_name, 'rextrix_', 'rightarm_');
    END LOOP;
END $$;

-- 関数名のロールバック
DO $$
DECLARE
    func_name text;
BEGIN
    FOR func_name IN 
        SELECT n.nspname||'.'||p.proname||'('||pg_get_function_identity_arguments(p.oid)||')'
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE p.proname LIKE 'rextrix_%'
    LOOP
        EXECUTE 'ALTER FUNCTION ' || func_name || ' RENAME TO ' || replace(func_name, 'rextrix_', 'rightarm_');
    END LOOP;
END $$;

-- トリガー名のロールバック
DO $$
DECLARE
    trigger_info RECORD;
    new_trigger_name text;
BEGIN
    FOR trigger_info IN 
        SELECT t.tgname, c.relname 
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        WHERE t.tgname LIKE 'rextrix_%'
    LOOP
        new_trigger_name := replace(trigger_info.tgname, 'rextrix_', 'rightarm_');
        EXECUTE 'ALTER TRIGGER ' || trigger_info.tgname || ' ON ' || trigger_info.relname || ' RENAME TO ' || new_trigger_name;
    END LOOP;
END $$;

-- RLSポリシー名のロールバック
DO $$
DECLARE
    policy_info RECORD;
    new_policy_name text;
BEGIN
    FOR policy_info IN 
        SELECT pol.polname, c.relname
        FROM pg_policy pol
        JOIN pg_class c ON pol.polrelid = c.oid
        WHERE pol.polname LIKE 'rextrix_%'
    LOOP
        new_policy_name := replace(policy_info.polname, 'rextrix_', 'rightarm_');
        EXECUTE 'ALTER POLICY ' || policy_info.polname || ' ON ' || policy_info.relname || ' RENAME TO ' || new_policy_name;
    END LOOP;
END $$;

-- マテリアライズドビューのロールバック
DO $$
DECLARE
    mv_name text;
BEGIN
    FOR mv_name IN 
        SELECT schemaname||'.'||matviewname 
        FROM pg_matviews 
        WHERE matviewname LIKE 'rextrix_%'
    LOOP
        EXECUTE 'ALTER MATERIALIZED VIEW ' || mv_name || ' RENAME TO ' || replace(mv_name, 'rextrix_', 'rightarm_');
    END LOOP;
END $$;

-- 5. 完了メッセージ
-- ========================================

DO $$
BEGIN
    RAISE NOTICE 'Rollback completed successfully!';
    RAISE NOTICE 'All rextrix_ prefixes have been rolled back to rightarm_';
    RAISE NOTICE 'Database schema has been restored to the original state.';
END $$;

COMMIT;