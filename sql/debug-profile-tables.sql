-- プロフィール保存問題のデバッグ用クエリ
-- Supabase SQL Editor で実行してください

-- 1. 存在するテーブルを確認
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%user%' 
  OR table_name LIKE '%profile%'
  OR table_name LIKE '%cfo%'
  OR table_name LIKE '%compan%'
ORDER BY table_name;

-- 2. rextrix_users テーブルの構造確認
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'rextrix_users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. rextrix_user_profiles テーブルの構造確認
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'rextrix_user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. rextrix_cfos テーブルの構造確認
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'rextrix_cfos' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. rextrix_companies テーブルの構造確認
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'rextrix_companies' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. 実際のデータを確認
SELECT 
    id, 
    email, 
    user_type, 
    status,
    created_at
FROM rextrix_users 
ORDER BY created_at DESC 
LIMIT 5;

-- 7. プロフィールデータの関連性を確認
SELECT 
    u.id as user_id,
    u.email,
    u.user_type,
    up.display_name,
    up.phone_number,
    up.region
FROM rextrix_users u
LEFT JOIN rextrix_user_profiles up ON u.id = up.user_id
ORDER BY u.created_at DESC
LIMIT 5;