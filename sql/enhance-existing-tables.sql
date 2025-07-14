-- 既存テーブル構造の拡張によるCFOプロフィール機能強化
-- 新規テーブル作成ではなく、既存rextrixテーブルの機能拡張

-- =============================================================================
-- Phase 1: rextrix_cfos テーブルの機能拡張
-- =============================================================================

-- CFOテーブルに新しいJSONBカラムを追加
ALTER TABLE rextrix_cfos 
ADD COLUMN IF NOT EXISTS work_experiences JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS detailed_certifications JSONB DEFAULT '[]', 
ADD COLUMN IF NOT EXISTS availability_conditions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS compensation_details JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS service_areas JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS linkedin_profile TEXT,
ADD COLUMN IF NOT EXISTS portfolio_urls JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS consultation_approach TEXT,
ADD COLUMN IF NOT EXISTS client_testimonials JSONB DEFAULT '[]';

-- 既存データの移行・統合
UPDATE rextrix_cfos SET 
  -- 既存の certifications を detailed_certifications に移行
  detailed_certifications = CASE 
    WHEN certifications IS NOT NULL AND certifications != '[]'::jsonb 
    THEN certifications 
    ELSE '[]'::jsonb 
  END,
  
  -- 既存の hourly_rate を compensation_details に統合
  compensation_details = CASE 
    WHEN hourly_rate IS NOT NULL 
    THEN jsonb_build_object(
      'primary_type', 'hourly',
      'hourly_rate', jsonb_build_object('preferred', hourly_rate),
      'negotiable', true,
      'currency', 'JPY'
    )
    ELSE '{}'::jsonb 
  END,
  
  -- デフォルトの稼働条件設定
  availability_conditions = jsonb_build_object(
    'flexible_schedule', true,
    'remote_work_available', true,
    'notice_period_days', 30
  )
WHERE work_experiences = '[]'::jsonb; -- 未更新のレコードのみ

-- =============================================================================
-- Phase 2: rextrix_user_profiles テーブルの機能拡張
-- =============================================================================

-- ユーザープロフィールテーブルに詳細情報カラムを追加
ALTER TABLE rextrix_user_profiles 
ADD COLUMN IF NOT EXISTS location_details JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS contact_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS profile_completion_rate INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_profile_update TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 既存の region データを location_details に移行
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
    END
  ),
  contact_preferences = jsonb_build_object(
    'preferred_method', 'email',
    'response_time_hours', 24
  )
WHERE location_details = '{}'::jsonb;

-- =============================================================================
-- Phase 3: rextrix_companies テーブルの機能拡張  
-- =============================================================================

-- 企業テーブルに詳細課題管理カラムを追加
ALTER TABLE rextrix_companies 
ADD COLUMN IF NOT EXISTS financial_challenges JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS project_requirements JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS selection_criteria JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS timeline_details JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS company_culture JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS budget_information JSONB DEFAULT '{}';

-- 既存の課題情報を structured format に移行
UPDATE rextrix_companies SET 
  project_requirements = jsonb_build_object(
    'engagement_type', CASE 
      WHEN work_style ILIKE '%part%time%' THEN 'part_time'
      WHEN work_style ILIKE '%full%time%' THEN 'full_time'
      ELSE 'flexible'
    END,
    'timeline', expected_timeline,
    'urgency', recruitment_urgency
  ),
  
  timeline_details = jsonb_build_object(
    'expected_start', CASE 
      WHEN expected_timeline IS NOT NULL 
      THEN (CURRENT_DATE + INTERVAL '1 month')::text
      ELSE null
    END,
    'urgency_level', recruitment_urgency
  )
WHERE financial_challenges = '[]'::jsonb;

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

CREATE INDEX IF NOT EXISTS idx_rextrix_cfos_certifications_gin 
ON rextrix_cfos USING GIN (detailed_certifications);

-- 特定フィールド検索用インデックス
CREATE INDEX IF NOT EXISTS idx_rextrix_cfos_remote_available 
ON rextrix_cfos USING GIN ((availability_conditions->'remote_work_available'));

CREATE INDEX IF NOT EXISTS idx_rextrix_cfos_hourly_rate 
ON rextrix_cfos USING GIN ((compensation_details->'hourly_rate'));

CREATE INDEX IF NOT EXISTS idx_rextrix_cfos_experience_industry 
ON rextrix_cfos USING GIN (work_experiences);

-- ユーザープロフィール用インデックス
CREATE INDEX IF NOT EXISTS idx_rextrix_user_profiles_location_gin 
ON rextrix_user_profiles USING GIN (location_details);

-- 企業テーブル用インデックス
CREATE INDEX IF NOT EXISTS idx_rextrix_companies_challenges_gin 
ON rextrix_companies USING GIN (financial_challenges);

CREATE INDEX IF NOT EXISTS idx_rextrix_companies_requirements_gin 
ON rextrix_companies USING GIN (project_requirements);

-- =============================================================================
-- Phase 5: サンプルデータ投入（奥田さんの例）
-- =============================================================================

-- CFOプロフィールのサンプルデータ更新
-- 注意: 実際のユーザーIDに置き換えて実行してください
DO $$
DECLARE
    sample_user_id UUID;
BEGIN
    -- テスト用ユーザーIDを取得（存在する場合）
    SELECT id INTO sample_user_id 
    FROM rextrix_users 
    WHERE email LIKE '%test%' OR email LIKE '%sample%' 
    LIMIT 1;
    
    IF sample_user_id IS NOT NULL THEN
        -- CFOプロフィールの詳細情報を更新
        UPDATE rextrix_cfos SET 
            work_experiences = '[
                {
                    "company_name": "株式会社りそな銀行",
                    "position": "法人融資担当",
                    "industry": "金融業",
                    "start_year": 2006,
                    "start_month": 4,
                    "end_year": 2008,
                    "end_month": 3,
                    "is_current": false,
                    "description": "法人融資業務、中小企業の財務分析",
                    "achievements": ["年間融資実行額50億円達成", "不良債権比率0.5%維持"],
                    "company_size": "大企業",
                    "display_order": 1
                },
                {
                    "company_name": "日本発条株式会社",
                    "position": "経理部",
                    "industry": "製造業",
                    "start_year": 2008,
                    "start_month": 4,
                    "end_year": 2016,
                    "end_month": 3,
                    "is_current": false,
                    "description": "本社経理及び工場経理業務、連結決算対応",
                    "achievements": ["月次決算早期化（15日→5日）", "コスト削減年間3億円"],
                    "company_size": "大企業",
                    "display_order": 2
                },
                {
                    "company_name": "エスネットワークス株式会社",
                    "position": "経理部門長",
                    "industry": "IT・通信",
                    "start_year": 2016,
                    "start_month": 4,
                    "end_year": 2024,
                    "end_month": 3,
                    "is_current": false,
                    "description": "財務コンサル及び管理部経理部門長業務",
                    "achievements": ["IPO準備支援", "資金調達5億円実行", "管理体制構築"],
                    "company_size": "中企業",
                    "display_order": 3
                }
            ]'::jsonb,
            
            detailed_certifications = '[
                {
                    "name": "中小企業診断士",
                    "organization": "一般社団法人中小企業診断協会",
                    "obtained_year": 2018,
                    "obtained_month": 3,
                    "level": null,
                    "is_active": true,
                    "renewal_date": "2025-03-31",
                    "credential_id": "MD-2018-12345",
                    "display_order": 1
                },
                {
                    "name": "日商簿記検定",
                    "organization": "日本商工会議所", 
                    "obtained_year": 2005,
                    "obtained_month": 11,
                    "level": "1級",
                    "is_active": true,
                    "renewal_date": null,
                    "credential_id": "1-2005-123456",
                    "display_order": 2
                }
            ]'::jsonb,
            
            availability_conditions = '{
                "days_per_week": 2,
                "hours_per_day": 8.0,
                "total_hours_per_week": 16.0,
                "flexible_schedule": true,
                "preferred_days": ["月", "水"],
                "start_time": "10:00",
                "end_time": "18:00",
                "remote_work_ratio": 80,
                "onsite_work_ratio": 20,
                "available_from": "2025-08-01",
                "notice_period_days": 30,
                "overtime_available": false,
                "weekend_available": false,
                "notes": "柔軟な働き方に対応可能、リモート中心で月数回の対面ミーティング"
            }'::jsonb,
            
            compensation_details = '{
                "primary_type": "hourly",
                "hourly_rate": {"min": 5000, "max": 8000, "preferred": 6500},
                "monthly_retainer": {"min": 200000, "max": 400000},
                "project_based": {"min": 1000000, "max": 3000000},
                "performance_bonus": true,
                "negotiable": true,
                "currency": "JPY",
                "payment_terms": "月末締め翌月末払い",
                "overtime_rate_multiplier": 1.25,
                "travel_expense_covered": true,
                "notes": "成果報酬も応相談、長期契約の場合は優遇料金適用"
            }'::jsonb,
            
            service_areas = '[
                {
                    "type": "remote",
                    "description": "全国リモート対応",
                    "coverage": "全国",
                    "is_primary": true
                },
                {
                    "type": "onsite", 
                    "description": "大阪近郊対面対応",
                    "coverage": "大阪・京都・神戸",
                    "max_travel_time": 60,
                    "additional_cost": 0,
                    "is_primary": false
                }
            ]'::jsonb,
            
            consultation_approach = 'データドリブンな財務戦略立案を重視し、企業の成長段階に応じた最適な財務体制構築を支援します。特に中小企業のIPO準備、資金調達、管理体制強化に豊富な実績があります。',
            
            client_testimonials = '[
                {
                    "client_company": "株式会社A（IT系スタートアップ）",
                    "testimonial": "奥田さんのおかげでシリーズA調達が成功しました。財務面での的確なアドバイスと投資家対応が素晴らしかったです。",
                    "rating": 5,
                    "project_type": "資金調達支援",
                    "date": "2024-01-15"
                }
            ]'::jsonb
            
        WHERE user_id = sample_user_id;
        
        RAISE NOTICE 'サンプルCFOデータが更新されました: %', sample_user_id;
    ELSE
        RAISE NOTICE 'テスト用ユーザーが見つかりませんでした';
    END IF;
END $$;

-- =============================================================================
-- Phase 6: 便利な検索関数とビューの作成
-- =============================================================================

-- CFO検索用ビューの作成
CREATE OR REPLACE VIEW v_enhanced_cfo_profiles AS
SELECT 
    c.id,
    c.user_id,
    up.display_name,
    up.phone_number,
    c.experience_years,
    c.experience_summary,
    c.specialties,
    c.rating,
    c.is_available,
    
    -- JSONB フィールドから主要情報を抽出
    c.availability_conditions->>'remote_work_ratio' as remote_work_ratio,
    c.compensation_details->'hourly_rate'->>'preferred' as preferred_hourly_rate,
    jsonb_array_length(COALESCE(c.work_experiences, '[]'::jsonb)) as work_experience_count,
    jsonb_array_length(COALESCE(c.detailed_certifications, '[]'::jsonb)) as certification_count,
    
    -- 地域情報
    up.location_details->>'region' as region,
    up.location_details->>'remote_work_available' as remote_available,
    
    -- 検索用配列フィールド
    ARRAY(
        SELECT jsonb_array_elements_text(
            jsonb_path_query_array(c.work_experiences, '$[*].industry')
        )
    ) as experience_industries,
    
    ARRAY(
        SELECT jsonb_array_elements_text(
            jsonb_path_query_array(c.detailed_certifications, '$[*].name')
        )
    ) as certification_names,
    
    c.created_at,
    c.updated_at
    
FROM rextrix_cfos c
LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id
WHERE c.is_available = true;

-- 高度なCFO検索関数
CREATE OR REPLACE FUNCTION search_cfos_advanced(
    p_industry TEXT DEFAULT NULL,
    p_min_experience INTEGER DEFAULT NULL,
    p_remote_required BOOLEAN DEFAULT NULL,
    p_max_hourly_rate INTEGER DEFAULT NULL,
    p_required_skills TEXT[] DEFAULT NULL,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
    cfo_id UUID,
    display_name TEXT,
    experience_years INTEGER,
    hourly_rate_preferred TEXT,
    match_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        up.display_name,
        c.experience_years,
        c.compensation_details->'hourly_rate'->>'preferred',
        -- マッチスコア計算（簡易版）
        (
            CASE WHEN p_industry IS NULL OR 
                c.work_experiences @> FORMAT('[{"industry": "%s"}]', p_industry)::jsonb 
                THEN 20 ELSE 0 END +
            CASE WHEN p_min_experience IS NULL OR 
                c.experience_years >= p_min_experience 
                THEN 15 ELSE 0 END +
            CASE WHEN p_remote_required IS NULL OR 
                (c.availability_conditions->>'remote_work_ratio')::int >= 50 
                THEN 10 ELSE 0 END
        ) as match_score
    FROM rextrix_cfos c
    LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id
    WHERE c.is_available = true
      AND (p_industry IS NULL OR c.work_experiences @> FORMAT('[{"industry": "%s"}]', p_industry)::jsonb)
      AND (p_min_experience IS NULL OR c.experience_years >= p_min_experience)
      AND (p_remote_required IS NULL OR (c.availability_conditions->>'remote_work_ratio')::int >= 50)
      AND (p_max_hourly_rate IS NULL OR (c.compensation_details->'hourly_rate'->>'preferred')::int <= p_max_hourly_rate)
    ORDER BY match_score DESC, c.rating DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Phase 7: データ整合性チェック関数
-- =============================================================================

-- プロフィール完成度計算関数
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    completion_score INTEGER := 0;
    cfo_record RECORD;
    profile_record RECORD;
BEGIN
    -- CFOプロフィール取得
    SELECT * INTO cfo_record FROM rextrix_cfos WHERE user_id = user_id_param;
    SELECT * INTO profile_record FROM rextrix_user_profiles WHERE user_id = user_id_param;
    
    IF cfo_record IS NOT NULL THEN
        -- 基本情報チェック（各10点）
        IF profile_record.display_name IS NOT NULL AND profile_record.display_name != '' THEN
            completion_score := completion_score + 10;
        END IF;
        
        IF profile_record.phone_number IS NOT NULL AND profile_record.phone_number != '' THEN
            completion_score := completion_score + 10;
        END IF;
        
        IF cfo_record.experience_summary IS NOT NULL AND cfo_record.experience_summary != '' THEN
            completion_score := completion_score + 15;
        END IF;
        
        -- JSONB データチェック（各15-20点）
        IF jsonb_array_length(COALESCE(cfo_record.work_experiences, '[]'::jsonb)) > 0 THEN
            completion_score := completion_score + 20;
        END IF;
        
        IF jsonb_array_length(COALESCE(cfo_record.detailed_certifications, '[]'::jsonb)) > 0 THEN
            completion_score := completion_score + 15;
        END IF;
        
        IF cfo_record.availability_conditions IS NOT NULL AND cfo_record.availability_conditions != '{}'::jsonb THEN
            completion_score := completion_score + 15;
        END IF;
        
        IF cfo_record.compensation_details IS NOT NULL AND cfo_record.compensation_details != '{}'::jsonb THEN
            completion_score := completion_score + 15;
        END IF;
    END IF;
    
    RETURN LEAST(completion_score, 100); -- 最大100%
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 確認クエリ
-- =============================================================================

-- テーブル拡張確認
SELECT 'テーブル拡張確認' as status;

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('rextrix_cfos', 'rextrix_user_profiles', 'rextrix_companies')
  AND column_name LIKE '%_details' 
   OR column_name LIKE '%_experiences'
   OR column_name LIKE '%_conditions'
   OR column_name LIKE '%_challenges'
ORDER BY table_name, column_name;

-- インデックス確認
SELECT 'インデックス確認' as status;
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename LIKE 'rextrix_%' 
  AND indexname LIKE '%_gin'
ORDER BY tablename, indexname;

-- 関数・ビュー確認
SELECT '作成された関数・ビュー確認' as status;
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND (routine_name LIKE '%cfo%' OR routine_name LIKE '%profile%')
ORDER BY routine_type, routine_name;

SELECT '既存テーブル構造拡張完了' as result;