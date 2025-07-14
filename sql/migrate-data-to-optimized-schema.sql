-- データ移行スクリプト：既存データを最適化スキーマに移行
-- 実行前に必ずデータベースのバックアップを取得してください
-- テスト環境で十分に検証してから本番実行してください

-- =============================================================================
-- Phase 1: 移行前の確認
-- =============================================================================

-- 既存データの件数確認
SELECT 'Migration Pre-Check' as phase;

SELECT 
    'rextrix_users' as table_name,
    COUNT(*) as record_count,
    COUNT(DISTINCT user_type) as user_types
FROM rextrix_users;

SELECT 
    'rextrix_user_profiles' as table_name,
    COUNT(*) as record_count
FROM rextrix_user_profiles;

SELECT 
    'rextrix_cfos' as table_name,
    COUNT(*) as record_count
FROM rextrix_cfos;

SELECT 
    'rextrix_companies' as table_name,
    COUNT(*) as record_count
FROM rextrix_companies;

-- =============================================================================
-- Phase 2: CFOプロフィールの移行
-- =============================================================================

-- CFOデータの統合移行
INSERT INTO rextrix_profiles_v2 (
    user_id,
    profile_type,
    display_name,
    email,
    phone_number,
    profile_image_url,
    description,
    experience_years,
    specialization,
    achievement_summary,
    linkedin_url,
    location_data,
    availability,
    compensation,
    is_active,
    is_available,
    work_preference,
    status,
    created_at,
    updated_at
)
SELECT 
    c.user_id,
    'cfo'::VARCHAR(20),
    
    -- 名前の統合（複数ソースから最適な値を選択）
    COALESCE(
        NULLIF(c.display_name, ''), 
        NULLIF(up.display_name, ''), 
        NULLIF(u.name, ''),
        'CFOユーザー'
    ),
    
    -- メールアドレス
    COALESCE(u.email, c.email),
    
    -- 電話番号の統合
    COALESCE(
        NULLIF(c.phone_number, ''),
        NULLIF(up.phone_number, ''),
        NULLIF(c.phone, '')
    ),
    
    -- プロフィール画像
    COALESCE(c.profile_image_url, up.profile_image_url),
    
    -- 説明文
    COALESCE(c.description, up.bio, c.bio),
    
    -- 経験年数
    COALESCE(c.experience_years, up.experience_years),
    
    -- 専門分野
    COALESCE(c.specialization, c.expertise, up.skills),
    
    -- 実績要約
    c.achievement_summary,
    
    -- LinkedIn URL
    c.linkedin_url,
    
    -- 地域情報をJSONBに統合
    jsonb_build_object(
        'address', COALESCE(c.address, up.address, c.location),
        'prefecture', COALESCE(c.prefecture, up.region, c.region),
        'region', COALESCE(c.region, up.region, c.location),
        'remote_available', COALESCE(c.remote_available, up.work_preference = 'remote', true),
        'onsite_available', COALESCE(c.onsite_available, up.work_preference = 'onsite', false),
        'service_areas', CASE 
            WHEN c.service_areas IS NOT NULL THEN string_to_array(c.service_areas, ',')
            ELSE ARRAY[COALESCE(c.region, up.region, '全国')]
        END
    ),
    
    -- 稼働条件をJSONBに統合
    jsonb_build_object(
        'days_per_week', c.available_days_per_week,
        'hours_per_day', c.available_hours_per_day,
        'start_time', c.preferred_start_time,
        'end_time', c.preferred_end_time,
        'total_hours_per_week', 
            CASE 
                WHEN c.available_days_per_week IS NOT NULL AND c.available_hours_per_day IS NOT NULL 
                THEN c.available_days_per_week * c.available_hours_per_day
                ELSE NULL
            END,
        'flexible_schedule', COALESCE(c.flexible_schedule, false),
        'preferred_days', CASE 
            WHEN c.preferred_working_days IS NOT NULL 
            THEN string_to_array(c.preferred_working_days, ',')
            ELSE NULL
        END,
        'available_from', c.available_from,
        'notes', c.availability_notes
    ),
    
    -- 報酬設定をJSONBに統合
    jsonb_build_object(
        'primary_type', CASE 
            WHEN c.hourly_rate IS NOT NULL THEN 'hourly'
            WHEN c.monthly_rate IS NOT NULL THEN 'monthly'
            WHEN c.project_rate IS NOT NULL THEN 'project'
            ELSE 'hourly'
        END,
        'hourly_rate', jsonb_build_object(
            'min', COALESCE(c.hourly_rate, c.min_hourly_rate),
            'max', COALESCE(c.max_hourly_rate, c.hourly_rate)
        ),
        'monthly_rate', jsonb_build_object(
            'min', COALESCE(c.monthly_rate, c.min_monthly_rate),
            'max', COALESCE(c.max_monthly_rate, c.monthly_rate)
        ),
        'project_rate', jsonb_build_object(
            'min', c.min_project_rate,
            'max', c.max_project_rate
        ),
        'performance_bonus_available', COALESCE(c.performance_bonus_available, false),
        'negotiable', COALESCE(c.rate_negotiable, true),
        'currency', 'JPY',
        'payment_terms', c.payment_terms,
        'notes', COALESCE(c.compensation_notes, up.compensation_range)
    ),
    
    -- ステータス情報
    COALESCE(c.is_active, true),
    COALESCE(c.is_available, true),
    COALESCE(
        up.work_preference,
        CASE 
            WHEN c.remote_available = true AND c.onsite_available = true THEN 'hybrid'
            WHEN c.remote_available = true THEN 'remote'
            WHEN c.onsite_available = true THEN 'onsite'
            ELSE 'hybrid'
        END
    ),
    COALESCE(c.status, u.status, 'active'),
    
    -- タイムスタンプ
    COALESCE(c.created_at, u.created_at, NOW()),
    COALESCE(c.updated_at, u.updated_at, NOW())

FROM rextrix_cfos c
JOIN rextrix_users u ON c.user_id = u.id
LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id

-- 重複を避けるため、既に移行済みのデータは除外
WHERE NOT EXISTS (
    SELECT 1 FROM rextrix_profiles_v2 p 
    WHERE p.user_id = c.user_id AND p.profile_type = 'cfo'
);

-- =============================================================================
-- Phase 3: 企業プロフィールの移行
-- =============================================================================

-- 企業データの統合移行
INSERT INTO rextrix_profiles_v2 (
    user_id,
    profile_type,
    display_name,
    email,
    phone_number,
    profile_image_url,
    description,
    company_name,
    industry,
    company_size,
    employee_count,
    annual_revenue,
    website_url,
    location_data,
    business_challenges,
    is_active,
    is_available,
    status,
    created_at,
    updated_at
)
SELECT 
    comp.user_id,
    'company'::VARCHAR(20),
    
    -- 担当者名
    COALESCE(
        NULLIF(comp.contact_name, ''),
        NULLIF(up.display_name, ''),
        NULLIF(u.name, ''),
        '担当者'
    ),
    
    -- メールアドレス
    COALESCE(u.email, comp.contact_email),
    
    -- 電話番号
    COALESCE(comp.contact_phone, up.phone_number),
    
    -- 企業ロゴ
    comp.company_logo_url,
    
    -- 会社説明
    COALESCE(comp.company_description, comp.description),
    
    -- 会社名
    COALESCE(comp.company_name, comp.name),
    
    -- 業界
    COALESCE(comp.industry, comp.business_type),
    
    -- 会社規模
    COALESCE(comp.company_size, comp.employee_range),
    
    -- 従業員数
    comp.employee_count,
    
    -- 年商
    comp.annual_revenue,
    
    -- ウェブサイト
    comp.website_url,
    
    -- 地域情報をJSONBに統合
    jsonb_build_object(
        'address', COALESCE(comp.address, comp.location),
        'prefecture', COALESCE(comp.prefecture, up.region),
        'region', COALESCE(comp.region, up.region),
        'remote_available', COALESCE(comp.remote_work_available, true),
        'onsite_available', true
    ),
    
    -- 課題・ニーズをJSONBに統合
    CASE 
        WHEN comp.business_challenges IS NOT NULL THEN
            jsonb_build_array(
                jsonb_build_object(
                    'category', '事業課題',
                    'description', comp.business_challenges,
                    'priority', 3,
                    'urgency', 'medium'
                )
            )
        ELSE '[]'::JSONB
    END,
    
    -- ステータス情報
    COALESCE(comp.is_active, true),
    COALESCE(comp.is_active, true),
    COALESCE(comp.status, u.status, 'active'),
    
    -- タイムスタンプ
    COALESCE(comp.created_at, u.created_at, NOW()),
    COALESCE(comp.updated_at, u.updated_at, NOW())

FROM rextrix_companies comp
JOIN rextrix_users u ON comp.user_id = u.id
LEFT JOIN rextrix_user_profiles up ON comp.user_id = up.user_id

-- 重複を避けるため、既に移行済みのデータは除外
WHERE NOT EXISTS (
    SELECT 1 FROM rextrix_profiles_v2 p 
    WHERE p.user_id = comp.user_id AND p.profile_type = 'company'
);

-- =============================================================================
-- Phase 4: 汎用プロフィールの移行（未分類ユーザー）
-- =============================================================================

-- user_profilesにあってcfos/companiesにないユーザーの移行
INSERT INTO rextrix_profiles_v2 (
    user_id,
    profile_type,
    display_name,
    email,
    phone_number,
    profile_image_url,
    description,
    location_data,
    is_active,
    work_preference,
    status,
    created_at,
    updated_at
)
SELECT 
    up.user_id,
    CASE 
        WHEN u.user_type = 'cfo' THEN 'cfo'
        WHEN u.user_type = 'company' THEN 'company'
        ELSE 'cfo' -- デフォルトはCFO
    END::VARCHAR(20),
    
    COALESCE(NULLIF(up.display_name, ''), NULLIF(u.name, ''), 'ユーザー'),
    u.email,
    up.phone_number,
    up.profile_image_url,
    COALESCE(up.bio, up.description),
    
    -- 地域情報
    jsonb_build_object(
        'address', up.address,
        'prefecture', up.region,
        'region', up.region,
        'remote_available', up.work_preference IN ('remote', 'hybrid'),
        'onsite_available', up.work_preference IN ('onsite', 'hybrid')
    ),
    
    COALESCE(up.is_active, true),
    COALESCE(up.work_preference, 'hybrid'),
    COALESCE(u.status, 'active'),
    COALESCE(up.created_at, u.created_at, NOW()),
    COALESCE(up.updated_at, u.updated_at, NOW())

FROM rextrix_user_profiles up
JOIN rextrix_users u ON up.user_id = u.id

-- CFOsやCompaniesに既にないユーザーのみ
WHERE NOT EXISTS (
    SELECT 1 FROM rextrix_cfos c WHERE c.user_id = up.user_id
)
AND NOT EXISTS (
    SELECT 1 FROM rextrix_companies comp WHERE comp.user_id = up.user_id
)
AND NOT EXISTS (
    SELECT 1 FROM rextrix_profiles_v2 p WHERE p.user_id = up.user_id
);

-- =============================================================================
-- Phase 5: スキル関連データの移行
-- =============================================================================

-- CFOスキルの移行（既存のrextrix_cfo_skillsがある場合）
INSERT INTO rextrix_profile_skills_v2 (
    profile_id,
    skill_tag_id,
    skill_category,
    proficiency_level,
    experience_years
)
SELECT 
    p.id as profile_id,
    cs.skill_tag_id,
    'skill'::VARCHAR(20),
    cs.proficiency_level,
    cs.experience_years
FROM rextrix_cfo_skills cs
JOIN rextrix_profiles_v2 p ON cs.cfo_id = p.user_id AND p.profile_type = 'cfo'
WHERE NOT EXISTS (
    SELECT 1 FROM rextrix_profile_skills_v2 ps2 
    WHERE ps2.profile_id = p.id AND ps2.skill_tag_id = cs.skill_tag_id
);

-- 企業課題の移行（既存のrextrix_company_challengesがある場合）
INSERT INTO rextrix_profile_skills_v2 (
    profile_id,
    skill_tag_id,
    skill_category
)
SELECT 
    p.id as profile_id,
    cc.challenge_tag_id as skill_tag_id,
    'challenge'::VARCHAR(20)
FROM rextrix_company_challenges cc
JOIN rextrix_profiles_v2 p ON cc.company_id = p.user_id AND p.profile_type = 'company'
WHERE NOT EXISTS (
    SELECT 1 FROM rextrix_profile_skills_v2 ps2 
    WHERE ps2.profile_id = p.id AND ps2.skill_tag_id = cc.challenge_tag_id
);

-- =============================================================================
-- Phase 6: 移行後の確認
-- =============================================================================

SELECT 'Migration Results' as phase;

-- 移行結果の確認
SELECT 
    'rextrix_profiles_v2' as table_name,
    profile_type,
    COUNT(*) as migrated_count
FROM rextrix_profiles_v2
GROUP BY profile_type
ORDER BY profile_type;

-- データの整合性確認
SELECT 
    'Data Integrity Check' as check_type,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN display_name IS NOT NULL AND display_name != '' THEN 1 END) as profiles_with_name,
    COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as profiles_with_email,
    COUNT(CASE WHEN location_data IS NOT NULL THEN 1 END) as profiles_with_location
FROM rextrix_profiles_v2;

-- スキル関連の移行確認
SELECT 
    'rextrix_profile_skills_v2' as table_name,
    skill_category,
    COUNT(*) as skill_count
FROM rextrix_profile_skills_v2
GROUP BY skill_category
ORDER BY skill_category;

-- JSONBデータの確認
SELECT 
    'JSONB Data Check' as check_type,
    AVG(jsonb_array_length(COALESCE(work_experiences, '[]'::jsonb))) as avg_work_exp,
    AVG(jsonb_array_length(COALESCE(certifications, '[]'::jsonb))) as avg_certifications,
    COUNT(CASE WHEN location_data->>'remote_available' = 'true' THEN 1 END) as remote_available_count
FROM rextrix_profiles_v2
WHERE profile_type = 'cfo';

SELECT 'データ移行完了' as status;

-- =============================================================================
-- Phase 7: 移行後のクリーンアップ（オプション）
-- =============================================================================

/*
-- 注意: 以下のコマンドは移行が完全に成功し、十分にテストした後に実行してください
-- バックアップを取得してから実行することを強く推奨します

-- 旧テーブルのバックアップ作成（オプション）
CREATE TABLE rextrix_cfos_backup AS SELECT * FROM rextrix_cfos;
CREATE TABLE rextrix_companies_backup AS SELECT * FROM rextrix_companies;
CREATE TABLE rextrix_user_profiles_backup AS SELECT * FROM rextrix_user_profiles;

-- 旧テーブルの削除（十分なテスト後に実行）
-- DROP TABLE IF EXISTS rextrix_cfo_work_experiences;
-- DROP TABLE IF EXISTS rextrix_cfo_certifications;
-- DROP TABLE IF EXISTS rextrix_cfo_availability;
-- DROP TABLE IF EXISTS rextrix_cfo_service_areas;
-- DROP TABLE IF EXISTS rextrix_cfo_compensation;
-- DROP TABLE IF EXISTS rextrix_cfo_skills;
-- DROP TABLE IF EXISTS rextrix_company_challenges;
*/