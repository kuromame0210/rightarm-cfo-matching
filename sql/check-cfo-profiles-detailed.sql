-- CFOプロフィールデータの詳細確認
-- 佐藤大悟さんと奥田豊さんのデータ確認用クエリ

-- 1. 全CFOユーザーの一覧（名前で検索）
SELECT 
    u.id as user_id,
    u.email,
    u.user_type,
    u.status,
    up.display_name,
    up.introduction,
    up.phone_number,
    up.region,
    up.work_preference,
    up.compensation_range,
    c.experience_years,
    c.experience_summary,
    c.achievements,
    c.certifications,
    c.is_available
FROM rextrix_users u
LEFT JOIN rextrix_user_profiles up ON u.id = up.user_id
LEFT JOIN rextrix_cfos c ON u.id = c.user_id
WHERE u.user_type = 'cfo'
  AND (up.display_name LIKE '%佐藤%' OR up.display_name LIKE '%奥田%' 
       OR up.display_name LIKE '%大悟%' OR up.display_name LIKE '%豊%'
       OR u.email LIKE '%dai88%' OR u.email LIKE '%okuda%')
ORDER BY u.created_at DESC;

-- 2. すべてのCFOプロフィールデータ（詳細情報）
SELECT 
    u.id as user_id,
    u.email,
    up.display_name,
    up.nickname,
    up.introduction,
    up.phone_number,
    up.region,
    up.work_preference,
    up.compensation_range,
    c.experience_years,
    c.experience_summary,
    c.achievements,
    c.certifications,
    c.is_available,
    c.max_concurrent_projects,
    c.rating,
    c.review_count,
    u.created_at
FROM rextrix_users u
LEFT JOIN rextrix_user_profiles up ON u.id = up.user_id
LEFT JOIN rextrix_cfos c ON u.id = c.user_id
WHERE u.user_type = 'cfo'
ORDER BY u.created_at DESC
LIMIT 10;

-- 3. テーブル存在確認
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND (table_name LIKE '%cfo%' OR table_name LIKE '%user%' OR table_name LIKE '%profile%')
ORDER BY table_name;

-- 4. rextrix_user_profiles テーブルの全カラム確認
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'rextrix_user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. rextrix_cfos テーブルの全カラム確認
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'rextrix_cfos' 
  AND table_schema = 'public'
ORDER BY ordinal_position;