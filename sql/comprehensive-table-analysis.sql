-- 現在のデータベース構造の包括的分析
-- Supabase SQL Editorで実行してください

-- 1. 全rextrixテーブルの一覧
SELECT 
    'TABLE LIST' as section,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'rextrix_%'
ORDER BY table_name;

-- 2. rextrix_users テーブル詳細
SELECT 
    'REXTRIX_USERS' as section,
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'rextrix_users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. rextrix_user_profiles テーブル詳細
SELECT 
    'REXTRIX_USER_PROFILES' as section,
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'rextrix_user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. rextrix_cfos テーブル詳細
SELECT 
    'REXTRIX_CFOS' as section,
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'rextrix_cfos' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. rextrix_companies テーブル詳細
SELECT 
    'REXTRIX_COMPANIES' as section,
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'rextrix_companies' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. rextrix_skill_tags テーブル詳細
SELECT 
    'REXTRIX_SKILL_TAGS' as section,
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'rextrix_skill_tags' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. rextrix_cfo_skills テーブル詳細
SELECT 
    'REXTRIX_CFO_SKILLS' as section,
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable, 
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'rextrix_cfo_skills' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. サンプルデータの確認（rextrix_users）
SELECT 
    'SAMPLE_USERS' as section,
    id, 
    email, 
    user_type, 
    status,
    created_at
FROM rextrix_users 
ORDER BY created_at DESC 
LIMIT 3;

-- 9. サンプルデータの確認（rextrix_user_profiles）
SELECT 
    'SAMPLE_USER_PROFILES' as section,
    id,
    user_id,
    display_name,
    phone_number,
    region,
    work_preference,
    compensation_range
FROM rextrix_user_profiles 
ORDER BY created_at DESC 
LIMIT 3;

-- 10. サンプルデータの確認（rextrix_cfos）
SELECT 
    'SAMPLE_CFOS' as section,
    id,
    user_id,
    display_name,
    experience_years,
    hourly_rate,
    is_available,
    work_style
FROM rextrix_cfos 
ORDER BY created_at DESC 
LIMIT 3;

-- 11. 外部キー制約の確認
SELECT 
    'FOREIGN_KEYS' as section,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema='public'
  AND tc.table_name LIKE 'rextrix_%'
ORDER BY tc.table_name;

-- 12. インデックスの確認
SELECT 
    'INDEXES' as section,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
  AND tablename LIKE 'rextrix_%'
ORDER BY tablename, indexname;