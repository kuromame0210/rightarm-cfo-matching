-- 現在のデータベース構造の確認
-- Supabase SQL Editorで実行してください

-- 1. 存在するrextrixテーブルの一覧
SELECT 
    'TABLE_LIST' as section,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'rextrix_%'
ORDER BY table_name;

-- 2. rextrix_cfos テーブル構造の詳細確認
SELECT 
    'REXTRIX_CFOS_STRUCTURE' as section,
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

-- 3. rextrix_user_profiles テーブル構造の詳細確認
SELECT 
    'REXTRIX_USER_PROFILES_STRUCTURE' as section,
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

-- 4. rextrix_companies テーブル構造の詳細確認
SELECT 
    'REXTRIX_COMPANIES_STRUCTURE' as section,
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

-- 5. CFO機能強化で必要なカラムの現在の存在確認
WITH required_cfo_columns AS (
  SELECT unnest(ARRAY[
    'work_experiences',
    'detailed_certifications', 
    'availability_conditions',
    'compensation_details',
    'service_areas',
    'linkedin_profile',
    'portfolio_urls',
    'consultation_approach',
    'client_testimonials',
    'business_achievements',
    'industry_expertise'
  ]) as required_column
),
existing_cfo_columns AS (
  SELECT column_name 
  FROM information_schema.columns 
  WHERE table_name = 'rextrix_cfos' 
    AND table_schema = 'public'
)
SELECT 
    'CFO_MISSING_COLUMNS' as section,
    rc.required_column,
    CASE 
      WHEN ecc.column_name IS NOT NULL THEN '✅ EXISTS'
      ELSE '❌ MISSING'
    END as status
FROM required_cfo_columns rc
LEFT JOIN existing_cfo_columns ecc ON rc.required_column = ecc.column_name
ORDER BY rc.required_column;

-- 6. ユーザープロフィール機能強化で必要なカラムの現在の存在確認
WITH required_profile_columns AS (
  SELECT unnest(ARRAY[
    'location_details',
    'contact_preferences',
    'profile_completion_rate',
    'last_profile_update',
    'languages_spoken',
    'international_experience'
  ]) as required_column
),
existing_profile_columns AS (
  SELECT column_name 
  FROM information_schema.columns 
  WHERE table_name = 'rextrix_user_profiles' 
    AND table_schema = 'public'
)
SELECT 
    'PROFILE_MISSING_COLUMNS' as section,
    rpc.required_column,
    CASE 
      WHEN epc.column_name IS NOT NULL THEN '✅ EXISTS'
      ELSE '❌ MISSING'
    END as status
FROM required_profile_columns rpc
LEFT JOIN existing_profile_columns epc ON rpc.required_column = epc.column_name
ORDER BY rpc.required_column;

-- 7. 現在のデータサンプル確認
SELECT 
    'CURRENT_DATA_SAMPLE' as section,
    COUNT(*) as total_users
FROM rextrix_users;

SELECT 
    'CFO_DATA_SAMPLE' as section,
    COUNT(*) as total_cfos,
    COUNT(CASE WHEN is_available = true THEN 1 END) as available_cfos
FROM rextrix_cfos;

-- 8. 最新のCFOデータサンプル（3件）
SELECT 
    'LATEST_CFO_PROFILES' as section,
    c.id,
    up.display_name,
    c.experience_years,
    c.experience_summary,
    c.specialties,
    c.is_available,
    c.created_at
FROM rextrix_cfos c
LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id
ORDER BY c.created_at DESC
LIMIT 3;