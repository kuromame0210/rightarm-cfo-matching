-- CFOプロフィール機能強化実装スクリプト
-- 既存テーブル構造の拡張によるCFO.mdレベルの詳細情報対応
-- 実行前に必ずデータベースのバックアップを取得してください

-- =============================================================================
-- Phase 1: 既存テーブルへのカラム追加
-- =============================================================================

-- CFOテーブルの機能拡張
ALTER TABLE rextrix_cfos 
ADD COLUMN IF NOT EXISTS work_experiences JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS detailed_certifications JSONB DEFAULT '[]', 
ADD COLUMN IF NOT EXISTS availability_conditions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS compensation_details JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS service_areas JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS linkedin_profile TEXT,
ADD COLUMN IF NOT EXISTS portfolio_urls JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS consultation_approach TEXT,
ADD COLUMN IF NOT EXISTS client_testimonials JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS business_achievements JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS industry_expertise JSONB DEFAULT '[]';

-- ユーザープロフィールテーブルの機能拡張
ALTER TABLE rextrix_user_profiles 
ADD COLUMN IF NOT EXISTS location_details JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS contact_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS profile_completion_rate INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_profile_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS languages_spoken JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS international_experience JSONB DEFAULT '{}';

-- 企業テーブルの機能拡張
ALTER TABLE rextrix_companies
ADD COLUMN IF NOT EXISTS financial_challenges JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS project_requirements JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS selection_criteria JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS timeline_details JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS company_culture JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS budget_information JSONB DEFAULT '{}';

-- =============================================================================
-- Phase 2: 既存データの移行・統合
-- =============================================================================

-- 既存のCFOデータを新しい構造に移行
UPDATE rextrix_cfos SET 
  -- 既存の certifications を detailed_certifications に移行
  detailed_certifications = CASE 
    WHEN certifications IS NOT NULL AND certifications != '[]'::jsonb 
    THEN (
      SELECT jsonb_agg(
        jsonb_build_object(
          'name', cert->>'name',
          'organization', COALESCE(cert->>'organization', '未記載'),
          'level', cert->>'level',
          'obtained_year', cert->>'year',
          'is_active', true,
          'display_order', cert_index
        )
      )
      FROM jsonb_array_elements(certifications) WITH ORDINALITY AS cert_data(cert, cert_index)
    )
    ELSE '[]'::jsonb 
  END,
  
  -- 既存の hourly_rate を compensation_details に統合
  compensation_details = CASE 
    WHEN hourly_rate IS NOT NULL 
    THEN jsonb_build_object(
      'primary_type', 'hourly',
      'hourly_rate', jsonb_build_object('preferred', hourly_rate),
      'negotiable', true,
      'currency', 'JPY',
      'notes', 'システムから移行されたデータ'
    )
    ELSE jsonb_build_object(
      'primary_type', 'negotiable',
      'negotiable', true,
      'currency', 'JPY'
    )
  END,
  
  -- デフォルトの稼働条件設定
  availability_conditions = jsonb_build_object(
    'flexible_schedule', true,
    'remote_work_available', true,
    'notice_period_days', 30,
    'updated_from_system', true
  ),
  
  -- specialties から industry_expertise を生成
  industry_expertise = CASE 
    WHEN specialties IS NOT NULL AND specialties != '[]'::jsonb
    THEN specialties
    ELSE '[]'::jsonb
  END
  
WHERE work_experiences = '[]'::jsonb; -- 未更新のレコードのみ

-- 既存のユーザープロフィールデータを新しい構造に移行
UPDATE rextrix_user_profiles SET 
  location_details = jsonb_build_object(
    'region', region,
    'remote_work_available', CASE 
      WHEN work_preference IN ('remote', 'hybrid') THEN true 
      ELSE false 
    END,
    'onsite_available', CASE 
      WHEN work_preference IN ('onsite', 'hybrid') THEN true 
      ELSE false 
    END,
    'updated_from_system', true
  ),
  
  contact_preferences = jsonb_build_object(
    'preferred_method', 'email',
    'response_time_hours', 24,
    'business_hours_only', true
  ),
  
  last_profile_update = updated_at
  
WHERE location_details = '{}'::jsonb;

-- =============================================================================
-- Phase 3: CFO.mdサンプルデータの投入
-- =============================================================================

DO $$
DECLARE
    dai88_user_id UUID;
    tomo_user_id UUID;
BEGIN
    -- 1. Dai88さん（佐藤大悟）のサンプルデータ
    INSERT INTO rextrix_users (email, user_type, status) 
    VALUES ('dai88@example.com', 'cfo', 'active')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO dai88_user_id;
    
    -- emailが既に存在する場合、既存のidを取得
    IF dai88_user_id IS NULL THEN
        SELECT id INTO dai88_user_id FROM rextrix_users WHERE email = 'dai88@example.com';
    END IF;

    INSERT INTO rextrix_user_profiles (
      user_id, display_name, region, introduction, work_preference, compensation_range,
      location_details, contact_preferences, international_experience
    ) VALUES (
      dai88_user_id,
      '佐藤大悟',
      '千葉県千葉市',
      'M&Aを自身でクロスボーダーを含む2社売却経験。他、2社で資金調達支援を経験。海外を絡ませた案件も得意。特にUSでのIPOサポートはNYの投資銀行と一緒に可能。',
      'hybrid',
      '月10万円〜、成果報酬応相談',
      
      '{
        "prefecture": "千葉県",
        "city": "千葉市",
        "remote_work_available": true,
        "onsite_available": true,
        "international_travel": true,
        "overseas_experience": ["フィリピン", "アメリカ"]
      }'::jsonb,
      
      '{
        "preferred_method": "email",
        "availability": "応相談（臨機応変に対応致します）",
        "international_timezone": true,
        "business_trip_available": true
      }'::jsonb,
      
      '{
        "countries": ["フィリピン", "アメリカ"],
        "business_languages": ["日本語", "英語"],
        "overseas_living": false,
        "cross_border_experience": true
      }'::jsonb
    ) ON CONFLICT (user_id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      introduction = EXCLUDED.introduction;

    INSERT INTO rextrix_cfos (
      user_id, experience_years, experience_summary, specialties, is_available,
      work_experiences, detailed_certifications, availability_conditions,
      compensation_details, service_areas, consultation_approach, business_achievements
    ) VALUES (
      dai88_user_id,
  23,
  'M&Aを自身でクロスボーダーを含む2社売却経験。他、2社で資金調達支援を経験。海外を絡ませた案件も得意。',
  '["海外事業", "M&A", "US上場サポート", "不動産開発", "クロスボーダー投資", "資金調達"]'::jsonb,
  true,
  
  -- 詳細職歴
  '[
    {
      "company_name": "全国共済農業協同組合会",
      "position": "事務企画部",
      "start_year": 2001,
      "start_month": 4,
      "end_year": 2001,
      "end_month": 10,
      "description": "JA共済の全国本部にて事務企画",
      "industry": "金融・保険",
      "is_current": false,
      "display_order": 1
    },
    {
      "company_name": "株式会社テーオーダブリュー",
      "position": "イベント企画部",
      "start_year": 2001,
      "start_month": 10,
      "end_year": 2002,
      "end_month": 4,
      "description": "全国での多くのイベント企画",
      "industry": "イベント・企画",
      "is_current": false,
      "display_order": 2
    },
    {
      "company_name": "ファーストウェルネス（個人事業）",
      "position": "代表",
      "start_year": 2006,
      "start_month": 3,
      "end_year": 2010,
      "end_month": 1,
      "description": "テニススクール事業を開始",
      "industry": "教育・スポーツ",
      "company_type": "個人事業",
      "is_current": false,
      "display_order": 3
    },
    {
      "company_name": "株式会社ファーストウェルネス",
      "position": "代表取締役",
      "start_year": 2010,
      "start_month": 1,
      "end_year": 2016,
      "end_month": 12,
      "description": "北柏、用賀、高津の3エリアでテニススクールを展開",
      "industry": "教育・スポーツ",
      "achievements": ["3エリア展開", "法人化成功"],
      "is_current": false,
      "display_order": 4
    },
    {
      "company_name": "Firstwellness English Academy Inc",
      "position": "代表",
      "start_year": 2011,
      "start_month": 11,
      "end_year": 2016,
      "end_month": 12,
      "description": "フィリピン・セブ島にて日本からの英語留学の語学学校をスタート。2校を展開",
      "industry": "教育・語学",
      "location": "フィリピン・セブ島",
      "achievements": ["2校展開", "M&Aで売却"],
      "exit_type": "M&A売却",
      "is_current": false,
      "display_order": 5
    },
    {
      "company_name": "株式会社高麗人参ウェルネス",
      "position": "代表取締役",
      "start_year": 2017,
      "start_month": 5,
      "end_year": 2022,
      "end_month": 5,
      "description": "韓国から高麗人参を仕入れてEC中心で日本にて販売業務",
      "industry": "EC・健康食品",
      "achievements": ["M&Aで売却"],
      "exit_type": "M&A売却",
      "is_current": false,
      "display_order": 6
    },
    {
      "company_name": "株式会社Samurai hospitality",
      "position": "代表取締役",
      "start_year": 2022,
      "start_month": 6,
      "end_year": null,
      "description": "USでのIPOサポート、海外顧客への不動産コンサルティング等の業務",
      "industry": "コンサルティング・投資銀行",
      "is_current": true,
      "display_order": 7
    }
  ]'::jsonb,
  
  -- 資格情報
  '[
    {
      "name": "実務経験重視",
      "note": "特定の資格より実務経験とネットワークを重視",
      "is_active": true,
      "display_order": 1
    }
  ]'::jsonb,
  
  -- 稼働条件
  '{
    "flexible_schedule": true,
    "availability_note": "応相談（臨機応変に対応致します）",
    "international_available": true,
    "business_trip_available": true,
    "overseas_travel": true,
    "timezone_flexible": true,
    "urgent_support": true
  }'::jsonb,
  
  -- 報酬設定
  '{
    "primary_type": "monthly",
    "monthly_rate": {"min": 100000, "preferred": 200000},
    "performance_bonus": true,
    "success_fee_available": true,
    "equity_consideration": true,
    "negotiable": true,
    "currency": "JPY",
    "notes": "成果報酬応相談、案件規模により調整"
  }'::jsonb,
  
  -- 対応エリア
  '[
    {
      "type": "remote",
      "description": "全国リモートOK",
      "coverage": "全国",
      "is_primary": true
    },
    {
      "type": "onsite", 
      "description": "東京近郊は対面可",
      "coverage": "関東",
      "is_primary": false
    },
    {
      "type": "international",
      "description": "案件次第では日本国内、海外への出張可",
      "coverage": "グローバル",
      "business_trip": true,
      "countries": ["フィリピン", "アメリカ", "韓国"],
      "is_primary": false
    }
  ]'::jsonb,
  
  'M&Aを自身でクロスボーダーを含む2社売却経験。海外を絡ませた案件も得意。特にUSでのIPOサポートはNYの投資銀行と一緒に可能。実務重視のアプローチで企業の成長段階に応じた最適なソリューションを提供します。',
  
  -- ビジネス実績
  '[
    {
      "type": "M&A売却",
      "description": "Firstwellness English Academy Inc売却",
      "year": 2016,
      "industry": "教育・語学",
      "location": "フィリピン"
    },
    {
      "type": "M&A売却", 
      "description": "株式会社高麗人参ウェルネス売却",
      "year": 2022,
      "industry": "EC・健康食品"
    },
    {
      "type": "資金調達支援",
      "description": "2社で資金調達支援",
      "count": 2
    },
    {
      "type": "海外事業展開",
      "description": "フィリピン・セブ島で複数事業展開",
      "industries": ["教育", "不動産開発"]
    }
  ]'::jsonb
    );

    -- 2. tomoさん（佐藤智彦）のサンプルデータ
    INSERT INTO rextrix_users (email, user_type, status) 
    VALUES ('tomo@example.com', 'cfo', 'active')
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO tomo_user_id;
    
    -- emailが既に存在する場合、既存のidを取得
    IF tomo_user_id IS NULL THEN
        SELECT id INTO tomo_user_id FROM rextrix_users WHERE email = 'tomo@example.com';
    END IF;

    INSERT INTO rextrix_user_profiles (
      user_id, display_name, region, introduction, work_preference, compensation_range,
      location_details, contact_preferences
    ) VALUES (
      tomo_user_id,
  '佐藤智彦',
  '東京都新宿区',
  '現在副業で資金調達支援を行っており、直近で創業融資の調達に成功。実務に強くスピード感を持って対応できます。また補助金助成金に関するリサーチや相談も行っております。',
  'hybrid',
  '月5万円〜、単発での資金調達等について成果報酬応相談',
  
  '{
    "prefecture": "東京都",
    "city": "新宿区",
    "remote_work_available": true,
    "onsite_available": true,
    "primary_region": "東京近郊"
  }'::jsonb,
  
  '{
    "preferred_method": "email",
    "response_time_hours": 24,
    "business_hours": "平日夜間・土日対応可"
  }'::jsonb
    ) ON CONFLICT (user_id) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      introduction = EXCLUDED.introduction;

    INSERT INTO rextrix_cfos (
      user_id, experience_years, experience_summary, specialties, is_available,
      work_experiences, detailed_certifications, availability_conditions,
      compensation_details, service_areas
    ) VALUES (
      tomo_user_id,
  17,
  '都内の地方銀行で法人への融資業務、個人への資産運用提案業務を14年間担当。現在副業で資金調達支援を行っており、直近で創業融資の調達に成功。',
  '["資金調達", "補助金助成金", "個人資産運用", "融資業務", "銀行対応"]'::jsonb,
  true,
  
  '[
    {
      "company_name": "都内の地方銀行",
      "position": "法人融資・個人資産運用担当",
      "start_year": 2007,
      "end_year": 2021,
      "description": "法人への融資業務、個人への資産運用提案業務",
      "industry": "銀行・金融",
      "experience_years": 14,
      "achievements": ["法人融資実績多数", "個人資産運用提案"],
      "is_current": false,
      "display_order": 1
    },
    {
      "company_name": "ゴルフ場の運営会社",
      "position": "経理総務労務担当",
      "start_year": 2021,
      "end_year": null,
      "description": "経理総務労務業務",
      "industry": "レジャー・サービス",
      "is_current": true,
      "display_order": 2
    }
  ]'::jsonb,
  
  '[
    {
      "name": "FP2級",
      "organization": "日本FP協会",
      "is_active": true,
      "display_order": 1
    },
    {
      "name": "銀行業務検定財務2級",
      "organization": "銀行業務検定協会",
      "is_active": true,
      "display_order": 2
    },
    {
      "name": "証券外務員一種",
      "organization": "日本証券業協会",
      "is_active": true,
      "display_order": 3
    }
  ]'::jsonb,
  
  '{
    "hours_per_week": {"min": 5, "max": 10},
    "days_negotiable": true,
    "flexible_schedule": true,
    "availability_note": "週5〜10時間、日数は応相談",
    "evening_weekend": true
  }'::jsonb,
  
  '{
    "primary_type": "monthly",
    "monthly_rate": {"min": 50000},
    "success_fee_available": true,
    "success_fee_rate": 0.04,
    "success_fee_cap": "調達額4%上限",
    "project_based": true,
    "negotiable": true,
    "currency": "JPY",
    "notes": "単発での資金調達等について成果報酬応相談"
  }'::jsonb,
  
  '[
    {
      "type": "remote",
      "description": "全国リモートOK",
      "coverage": "全国",
      "is_primary": true
    },
    {
      "type": "onsite",
      "description": "東京近郊は対面可",
      "coverage": "東京近郊",
      "is_primary": false
    }
  ]'::jsonb
    );

END $$;

-- =============================================================================
-- Phase 4: 検索性能向上のためのインデックス作成
-- =============================================================================

-- CFOテーブル用JSONB検索インデックス
CREATE INDEX IF NOT EXISTS idx_rextrix_cfos_work_experiences_gin 
ON rextrix_cfos USING GIN (work_experiences);

CREATE INDEX IF NOT EXISTS idx_rextrix_cfos_availability_gin 
ON rextrix_cfos USING GIN (availability_conditions);

CREATE INDEX IF NOT EXISTS idx_rextrix_cfos_compensation_gin 
ON rextrix_cfos USING GIN (compensation_details);

CREATE INDEX IF NOT EXISTS idx_rextrix_cfos_detailed_certifications_gin 
ON rextrix_cfos USING GIN (detailed_certifications);

CREATE INDEX IF NOT EXISTS idx_rextrix_cfos_service_areas_gin 
ON rextrix_cfos USING GIN (service_areas);

CREATE INDEX IF NOT EXISTS idx_rextrix_cfos_industry_expertise_gin 
ON rextrix_cfos USING GIN (industry_expertise);

-- 特定フィールド検索用インデックス
CREATE INDEX IF NOT EXISTS idx_rextrix_cfos_remote_available 
ON rextrix_cfos USING GIN ((availability_conditions->'remote_work_available'));

CREATE INDEX IF NOT EXISTS idx_rextrix_cfos_hourly_rate_preferred 
ON rextrix_cfos USING GIN ((compensation_details->'hourly_rate'->'preferred'));

CREATE INDEX IF NOT EXISTS idx_rextrix_cfos_monthly_rate_min 
ON rextrix_cfos USING GIN ((compensation_details->'monthly_rate'->'min'));

CREATE INDEX IF NOT EXISTS idx_rextrix_cfos_specialties_gin 
ON rextrix_cfos USING GIN (specialties);

-- ユーザープロフィール用インデックス
CREATE INDEX IF NOT EXISTS idx_rextrix_user_profiles_location_gin 
ON rextrix_user_profiles USING GIN (location_details);

CREATE INDEX IF NOT EXISTS idx_rextrix_user_profiles_international_gin 
ON rextrix_user_profiles USING GIN (international_experience);

-- 企業テーブル用インデックス
CREATE INDEX IF NOT EXISTS idx_rextrix_companies_challenges_gin 
ON rextrix_companies USING GIN (financial_challenges);

CREATE INDEX IF NOT EXISTS idx_rextrix_companies_requirements_gin 
ON rextrix_companies USING GIN (project_requirements);

-- =============================================================================
-- Phase 5: 検索・分析用ビューの作成
-- =============================================================================

-- 強化されたCFO検索用ビュー
CREATE OR REPLACE VIEW v_enhanced_cfo_search AS
SELECT 
    c.id as cfo_id,
    c.user_id,
    up.display_name,
    up.region,
    up.phone_number,
    c.experience_years,
    c.experience_summary,
    c.specialties,
    c.rating,
    c.is_available,
    
    -- JSONB フィールドから主要情報を抽出
    c.availability_conditions->>'flexible_schedule' as flexible_schedule,
    c.availability_conditions->'hours_per_week'->>'min' as min_hours_per_week,
    c.availability_conditions->'hours_per_week'->>'max' as max_hours_per_week,
    
    c.compensation_details->>'primary_type' as compensation_type,
    c.compensation_details->'hourly_rate'->>'preferred' as hourly_rate_preferred,
    c.compensation_details->'monthly_rate'->>'min' as monthly_rate_min,
    c.compensation_details->>'success_fee_available' as success_fee_available,
    
    -- 地域情報
    up.location_details->>'prefecture' as prefecture,
    up.location_details->>'remote_work_available' as remote_available,
    up.location_details->>'international_travel' as international_travel,
    
    -- 配列系情報の集計
    jsonb_array_length(COALESCE(c.work_experiences, '[]'::jsonb)) as work_experience_count,
    jsonb_array_length(COALESCE(c.detailed_certifications, '[]'::jsonb)) as certification_count,
    jsonb_array_length(COALESCE(c.service_areas, '[]'::jsonb)) as service_area_count,
    
    -- 検索用配列フィールド（業界経験）
    ARRAY(
        SELECT DISTINCT jsonb_array_elements_text(
            jsonb_path_query_array(c.work_experiences, '$[*].industry')
        )
    ) as experience_industries,
    
    -- 検索用配列フィールド（資格名）
    ARRAY(
        SELECT jsonb_array_elements_text(
            jsonb_path_query_array(c.detailed_certifications, '$[*].name')
        )
    ) as certification_names,
    
    -- 海外経験
    up.international_experience->>'cross_border_experience' as cross_border_experience,
    
    c.created_at,
    c.updated_at
    
FROM rextrix_cfos c
LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id
WHERE c.is_available = true;

-- CFO詳細情報取得用ビュー
CREATE OR REPLACE VIEW v_cfo_full_profile AS
SELECT 
    c.*,
    up.display_name,
    up.region,
    up.phone_number,
    up.introduction,
    up.location_details,
    up.contact_preferences,
    up.international_experience
FROM rextrix_cfos c
LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id;

-- =============================================================================
-- Phase 6: 便利な検索関数の作成
-- =============================================================================

-- 高度なCFO検索関数
CREATE OR REPLACE FUNCTION search_cfos_advanced(
    p_specialties TEXT[] DEFAULT NULL,
    p_min_experience INTEGER DEFAULT NULL,
    p_industries TEXT[] DEFAULT NULL,
    p_remote_required BOOLEAN DEFAULT NULL,
    p_max_monthly_budget INTEGER DEFAULT NULL,
    p_max_hourly_rate INTEGER DEFAULT NULL,
    p_international_needed BOOLEAN DEFAULT NULL,
    p_success_fee_ok BOOLEAN DEFAULT NULL,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    cfo_id UUID,
    display_name TEXT,
    experience_years INTEGER,
    specialties JSONB,
    monthly_rate_min TEXT,
    hourly_rate_preferred TEXT,
    remote_available TEXT,
    international_experience BOOLEAN,
    match_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        up.display_name,
        c.experience_years,
        c.specialties,
        c.compensation_details->'monthly_rate'->>'min',
        c.compensation_details->'hourly_rate'->>'preferred',
        up.location_details->>'remote_work_available',
        (up.international_experience->>'cross_border_experience')::boolean,
        -- マッチスコア計算
        (
            -- 専門分野マッチ
            CASE WHEN p_specialties IS NULL THEN 0
                 WHEN c.specialties ?| p_specialties THEN 25
                 ELSE 0 END +
            -- 経験年数マッチ
            CASE WHEN p_min_experience IS NULL THEN 0
                 WHEN c.experience_years >= p_min_experience THEN 20
                 ELSE 0 END +
            -- 業界経験マッチ
            CASE WHEN p_industries IS NULL THEN 0
                 WHEN c.work_experiences @> ANY(
                     SELECT jsonb_build_array(jsonb_build_object('industry', industry))
                     FROM unnest(p_industries) as industry
                 ) THEN 15
                 ELSE 0 END +
            -- リモート対応マッチ
            CASE WHEN p_remote_required IS NULL THEN 0
                 WHEN (up.location_details->>'remote_work_available')::boolean = p_remote_required THEN 10
                 ELSE 0 END +
            -- 予算マッチ
            CASE WHEN p_max_monthly_budget IS NULL THEN 0
                 WHEN (c.compensation_details->'monthly_rate'->>'min')::int <= p_max_monthly_budget THEN 15
                 ELSE 0 END +
            -- 国際経験マッチ
            CASE WHEN p_international_needed IS NULL THEN 0
                 WHEN (up.international_experience->>'cross_border_experience')::boolean = p_international_needed THEN 15
                 ELSE 0 END
        ) as match_score
    FROM rextrix_cfos c
    LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id
    WHERE c.is_available = true
      AND (p_specialties IS NULL OR c.specialties ?| p_specialties)
      AND (p_min_experience IS NULL OR c.experience_years >= p_min_experience)
      AND (p_remote_required IS NULL OR (up.location_details->>'remote_work_available')::boolean = p_remote_required)
      AND (p_max_monthly_budget IS NULL OR (c.compensation_details->'monthly_rate'->>'min')::int <= p_max_monthly_budget)
      AND (p_max_hourly_rate IS NULL OR (c.compensation_details->'hourly_rate'->>'preferred')::int <= p_max_hourly_rate)
      AND (p_international_needed IS NULL OR (up.international_experience->>'cross_border_experience')::boolean = p_international_needed)
      AND (p_success_fee_ok IS NULL OR (c.compensation_details->>'success_fee_available')::boolean = p_success_fee_ok)
    ORDER BY match_score DESC, c.rating DESC NULLS LAST, c.updated_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- プロフィール完成度計算関数
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    completion_score INTEGER := 0;
    cfo_record RECORD;
    profile_record RECORD;
BEGIN
    SELECT * INTO cfo_record FROM rextrix_cfos WHERE user_id = user_id_param;
    SELECT * INTO profile_record FROM rextrix_user_profiles WHERE user_id = user_id_param;
    
    IF cfo_record IS NOT NULL AND profile_record IS NOT NULL THEN
        -- 基本情報チェック（各5点）
        IF profile_record.display_name IS NOT NULL AND profile_record.display_name != '' THEN
            completion_score := completion_score + 5;
        END IF;
        
        IF profile_record.phone_number IS NOT NULL AND profile_record.phone_number != '' THEN
            completion_score := completion_score + 5;
        END IF;
        
        IF profile_record.introduction IS NOT NULL AND profile_record.introduction != '' THEN
            completion_score := completion_score + 10;
        END IF;
        
        IF cfo_record.experience_summary IS NOT NULL AND cfo_record.experience_summary != '' THEN
            completion_score := completion_score + 10;
        END IF;
        
        -- JSONB データチェック（各10-20点）
        IF jsonb_array_length(COALESCE(cfo_record.work_experiences, '[]'::jsonb)) > 0 THEN
            completion_score := completion_score + 20;
        END IF;
        
        IF jsonb_array_length(COALESCE(cfo_record.detailed_certifications, '[]'::jsonb)) > 0 THEN
            completion_score := completion_score + 10;
        END IF;
        
        IF cfo_record.availability_conditions IS NOT NULL AND 
           cfo_record.availability_conditions != '{}'::jsonb AND
           cfo_record.availability_conditions ? 'availability_note' THEN
            completion_score := completion_score + 15;
        END IF;
        
        IF cfo_record.compensation_details IS NOT NULL AND 
           cfo_record.compensation_details != '{}'::jsonb AND
           cfo_record.compensation_details ? 'primary_type' THEN
            completion_score := completion_score + 15;
        END IF;
        
        IF jsonb_array_length(COALESCE(cfo_record.service_areas, '[]'::jsonb)) > 0 THEN
            completion_score := completion_score + 10;
        END IF;
    END IF;
    
    -- プロフィール完成度をテーブルに更新
    UPDATE rextrix_user_profiles 
    SET profile_completion_rate = LEAST(completion_score, 100)
    WHERE user_id = user_id_param;
    
    RETURN LEAST(completion_score, 100);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Phase 7: データ整合性チェックとトリガー
-- =============================================================================

-- プロフィール更新時の完成度自動計算トリガー
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculate_profile_completion(NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの設定
DROP TRIGGER IF EXISTS trigger_update_cfo_completion ON rextrix_cfos;
CREATE TRIGGER trigger_update_cfo_completion
    AFTER INSERT OR UPDATE ON rextrix_cfos
    FOR EACH ROW EXECUTE FUNCTION update_profile_completion();

DROP TRIGGER IF EXISTS trigger_update_profile_completion ON rextrix_user_profiles;
CREATE TRIGGER trigger_update_profile_completion
    AFTER INSERT OR UPDATE ON rextrix_user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_profile_completion();

-- =============================================================================
-- Phase 8: 確認・検証クエリ
-- =============================================================================

-- テーブル拡張確認
SELECT 
    'テーブル拡張確認' as status,
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name IN ('rextrix_cfos', 'rextrix_user_profiles', 'rextrix_companies')
  AND (column_name LIKE '%_experiences' 
    OR column_name LIKE '%_details' 
    OR column_name LIKE '%_conditions'
    OR column_name LIKE '%_certifications'
    OR column_name LIKE '%_areas'
    OR column_name LIKE '%_achievements')
ORDER BY table_name, column_name;

-- インデックス確認
SELECT 
    'インデックス確認' as status,
    indexname, 
    tablename
FROM pg_indexes 
WHERE tablename LIKE 'rextrix_%' 
  AND indexname LIKE '%_gin'
ORDER BY tablename, indexname;

-- サンプルデータ確認
SELECT 
    'サンプルデータ確認' as status,
    up.display_name,
    up.region,
    jsonb_array_length(c.work_experiences) as 職歴数,
    jsonb_array_length(c.detailed_certifications) as 資格数,
    c.availability_conditions->>'availability_note' as 稼働条件,
    c.compensation_details->>'primary_type' as 報酬タイプ,
    up.profile_completion_rate as 完成度
FROM rextrix_cfos c
JOIN rextrix_user_profiles up ON c.user_id = up.user_id
WHERE up.display_name IN ('佐藤大悟', '佐藤智彦')
ORDER BY up.display_name;

-- 検索関数テスト
SELECT 
    'M&A専門CFO検索テスト' as test_name,
    display_name,
    specialties,
    match_score
FROM search_cfos_advanced(
    p_specialties := ARRAY['M&A'],
    p_international_needed := true,
    p_limit := 5
);

-- ビュー動作確認
SELECT 
    'ビュー動作確認' as status,
    display_name,
    experience_industries,
    certification_names,
    remote_available,
    cross_border_experience
FROM v_enhanced_cfo_search
WHERE display_name IS NOT NULL
LIMIT 3;

SELECT 'CFOプロフィール機能強化実装完了' as result;