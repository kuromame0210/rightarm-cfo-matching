-- Rextrix データベース状況確認スクリプト
-- Supabase SQL Editorで実行してください

-- =====================================================
-- 1. テーブル存在確認
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== Rextrix データベース状況確認 ===';
    RAISE NOTICE '';
END $$;

-- 1.1 Rextrixテーブル一覧
SELECT 
    '📊 Rextrix Tables' as check_type,
    table_name,
    CASE 
        WHEN table_name LIKE 'rextrix_%' THEN '✅'
        ELSE '❌'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND (table_name LIKE 'rextrix_%' OR table_name LIKE 'rightarm_%')
ORDER BY table_name;

-- 1.2 各テーブルのレコード数
SELECT 
    '📈 Record Counts' as check_type,
    'rextrix_users' as table_name,
    COUNT(*) as record_count
FROM rextrix_users
UNION ALL
SELECT 
    '📈 Record Counts',
    'rextrix_user_profiles',
    COUNT(*)
FROM rextrix_user_profiles
UNION ALL
SELECT 
    '📈 Record Counts',
    'rextrix_companies',
    COUNT(*)
FROM rextrix_companies
UNION ALL
SELECT 
    '📈 Record Counts',
    'rextrix_cfos',
    COUNT(*)
FROM rextrix_cfos
UNION ALL
SELECT 
    '📈 Record Counts',
    'rextrix_skill_tags',
    COUNT(*)
FROM rextrix_skill_tags
UNION ALL
SELECT 
    '📈 Record Counts',
    'rextrix_challenge_tags',
    COUNT(*)
FROM rextrix_challenge_tags;

-- =====================================================
-- 2. 外部キー制約確認
-- =====================================================

SELECT 
    '🔗 Foreign Keys' as check_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name,
    CASE 
        WHEN ccu.table_name = 'users' AND tc.table_name = 'rextrix_users' THEN '❌ 間違った参照'
        WHEN ccu.table_name = 'users' THEN '⚠️  要確認'
        ELSE '✅ 正常'
    END as status
FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name LIKE 'rextrix_%'
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- 3. Auth関連確認
-- =====================================================

-- 3.1 Supabase Auth ユーザー数
SELECT 
    '👤 Auth Users' as check_type,
    'auth.users' as table_name,
    COUNT(*) as user_count
FROM auth.users;

-- 3.2 rextrix_users の Supabase Auth 連携状況
SELECT 
    '🔄 Auth Integration' as check_type,
    COUNT(*) as total_users,
    COUNT(supabase_auth_id) as linked_to_auth,
    COUNT(*) - COUNT(supabase_auth_id) as not_linked,
    ROUND(COUNT(supabase_auth_id)::numeric / COUNT(*)::numeric * 100, 2) as link_percentage
FROM rextrix_users;

-- 3.3 Auth連携の詳細
SELECT 
    '👥 User Details' as check_type,
    id,
    email,
    user_type,
    status,
    CASE 
        WHEN supabase_auth_id IS NOT NULL THEN '✅ 連携済み'
        ELSE '❌ 未連携'
    END as auth_status,
    auth_provider,
    email_verified,
    created_at
FROM rextrix_users
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- 4. Trigger関数確認
-- =====================================================

-- 4.1 handle_new_user関数の存在確認
SELECT 
    '⚙️  Functions' as check_type,
    proname as function_name,
    CASE 
        WHEN proname = 'handle_new_user' THEN '✅ 存在'
        ELSE '✅ 存在'
    END as status
FROM pg_proc 
WHERE proname IN ('handle_new_user', 'update_updated_at_column')
ORDER BY proname;

-- 4.2 Triggerの存在確認
SELECT 
    '🔧 Triggers' as check_type,
    t.tgname as trigger_name,
    c.relname as table_name,
    CASE 
        WHEN t.tgname = 'on_auth_user_created' THEN '✅ Auth Trigger'
        WHEN t.tgname LIKE '%updated_at%' THEN '✅ Update Trigger'
        ELSE '✅ 存在'
    END as status
FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
WHERE t.tgname NOT LIKE 'RI_%' -- システムトリガーを除外
ORDER BY c.relname, t.tgname;

-- =====================================================
-- 5. RLS (Row Level Security) 確認
-- =====================================================

SELECT 
    '🔒 RLS Status' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ 有効'
        ELSE '❌ 無効'
    END as status
FROM pg_tables 
WHERE tablename LIKE 'rextrix_%'
ORDER BY tablename;

-- =====================================================
-- 6. インデックス確認
-- =====================================================

SELECT 
    '📇 Indexes' as check_type,
    schemaname,
    tablename,
    indexname,
    CASE 
        WHEN indexname LIKE 'idx_rextrix_%' THEN '✅ Rextrix Index'
        WHEN indexname LIKE '%pkey' THEN '✅ Primary Key'
        ELSE '✅ 存在'
    END as status
FROM pg_indexes 
WHERE tablename LIKE 'rextrix_%'
    AND indexname NOT LIKE '%pkey'
ORDER BY tablename, indexname;

-- =====================================================
-- 7. 問題診断とレコメンデーション
-- =====================================================

DO $$
DECLARE
    auth_users_count INTEGER;
    rextrix_users_count INTEGER;
    linked_users_count INTEGER;
    fk_constraint_issues INTEGER;
    trigger_exists BOOLEAN;
BEGIN
    -- データ取得
    SELECT COUNT(*) INTO auth_users_count FROM auth.users;
    SELECT COUNT(*) INTO rextrix_users_count FROM rextrix_users;
    SELECT COUNT(supabase_auth_id) INTO linked_users_count FROM rextrix_users WHERE supabase_auth_id IS NOT NULL;
    
    -- 外部キー制約問題確認
    SELECT COUNT(*) INTO fk_constraint_issues
    FROM information_schema.table_constraints AS tc 
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'rextrix_users'
        AND ccu.table_name = 'users';
    
    -- Trigger存在確認
    SELECT EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') INTO trigger_exists;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== 🔍 診断結果 ===';
    RAISE NOTICE '';
    
    -- Auth統計
    RAISE NOTICE '📊 統計:';
    RAISE NOTICE '  - Supabase Auth Users: %', auth_users_count;
    RAISE NOTICE '  - Rextrix Users: %', rextrix_users_count;
    RAISE NOTICE '  - Auth連携済み: %', linked_users_count;
    RAISE NOTICE '';
    
    -- 問題診断
    RAISE NOTICE '🚨 問題診断:';
    
    IF fk_constraint_issues > 0 THEN
        RAISE NOTICE '  ❌ 外部キー制約エラー: rextrix_users.supabase_auth_id が間違ったテーブルを参照';
        RAISE NOTICE '     → fix-foreign-key-constraint.sql を実行してください';
    ELSE
        RAISE NOTICE '  ✅ 外部キー制約: 正常';
    END IF;
    
    IF NOT trigger_exists THEN
        RAISE NOTICE '  ❌ handle_new_user関数が存在しません';
        RAISE NOTICE '     → fix-trigger-function.sql を実行してください';
    ELSE
        RAISE NOTICE '  ✅ handle_new_user関数: 存在';
    END IF;
    
    IF auth_users_count > linked_users_count THEN
        RAISE NOTICE '  ⚠️  Auth連携されていないユーザーが存在: % 人', auth_users_count - linked_users_count;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '💡 推奨アクション:';
    
    IF fk_constraint_issues > 0 THEN
        RAISE NOTICE '  1. fix-foreign-key-constraint.sql を実行';
    END IF;
    
    IF NOT trigger_exists THEN
        RAISE NOTICE '  2. fix-trigger-function.sql を実行';
    END IF;
    
    RAISE NOTICE '  3. Supabase Authentication設定でEmail確認を無効化';
    RAISE NOTICE '  4. 会員登録をテスト';
    
    RAISE NOTICE '';
    RAISE NOTICE '=== 診断完了 ===';
END $$;

[
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_admin_users",
    "indexname": "idx_rextrix_admin_users_email",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_admin_users",
    "indexname": "rextrix_admin_users_email_key",
    "status": "✅ 存在"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_audit_logs",
    "indexname": "idx_rextrix_audit_logs_created",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_audit_logs",
    "indexname": "idx_rextrix_audit_logs_user",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_cfos",
    "indexname": "idx_rextrix_cfos_available",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_cfos",
    "indexname": "idx_rextrix_cfos_rating",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_cfos",
    "indexname": "idx_rextrix_cfos_user_id",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_challenge_tags",
    "indexname": "rextrix_challenge_tags_name_key",
    "status": "✅ 存在"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_companies",
    "indexname": "idx_rextrix_companies_industry_region",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_companies",
    "indexname": "idx_rextrix_companies_recruiting",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_companies",
    "indexname": "idx_rextrix_companies_urgency",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_companies",
    "indexname": "idx_rextrix_companies_user_id",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_contracts",
    "indexname": "idx_rextrix_contracts_company_cfo",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_contracts",
    "indexname": "idx_rextrix_contracts_status",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_conversations",
    "indexname": "idx_rextrix_conversations_last_message",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_conversations",
    "indexname": "idx_rextrix_conversations_participants",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_conversations",
    "indexname": "rextrix_conversations_participant1_id_participant2_id_key",
    "status": "✅ 存在"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_invoices",
    "indexname": "idx_rextrix_invoices_contract",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_invoices",
    "indexname": "idx_rextrix_invoices_status",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_messages",
    "indexname": "idx_rextrix_messages_conversation",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_messages",
    "indexname": "idx_rextrix_messages_sender",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_messages",
    "indexname": "idx_rextrix_messages_sent_at",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_notifications",
    "indexname": "idx_rextrix_notifications_created",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_notifications",
    "indexname": "idx_rextrix_notifications_type",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_notifications",
    "indexname": "idx_rextrix_notifications_unread",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_notifications",
    "indexname": "idx_rextrix_notifications_user",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_skill_tags",
    "indexname": "idx_rextrix_skill_tags_category",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_skill_tags",
    "indexname": "idx_rextrix_skill_tags_usage",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_skill_tags",
    "indexname": "rextrix_skill_tags_name_key",
    "status": "✅ 存在"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_user_profiles",
    "indexname": "idx_rextrix_user_profiles_region",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_user_profiles",
    "indexname": "idx_rextrix_user_profiles_user_id",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_users",
    "indexname": "idx_rextrix_users_created_at",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_users",
    "indexname": "idx_rextrix_users_email",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_users",
    "indexname": "idx_rextrix_users_migrated",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_users",
    "indexname": "idx_rextrix_users_supabase_auth_id",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_users",
    "indexname": "idx_rextrix_users_type_status",
    "status": "✅ Rextrix Index"
  },
  {
    "check_type": "📇 Indexes",
    "schemaname": "public",
    "tablename": "rextrix_users",
    "indexname": "rextrix_users_email_key",
    "status": "✅ 存在"
  }
]