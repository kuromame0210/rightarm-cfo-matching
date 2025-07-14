-- データベース最適化実装スクリプト
-- 統合テーブル + JSONB活用による構造最適化
-- 実行前に必ずバックアップを取得してください

-- =============================================================================
-- Phase 1: 最適化された統合プロフィールテーブル作成
-- =============================================================================

-- 1. 統合プロフィールテーブル（CFO・企業共通）
CREATE TABLE IF NOT EXISTS rextrix_profiles_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES rextrix_users(id) ON DELETE CASCADE,
    profile_type VARCHAR(20) NOT NULL CHECK (profile_type IN ('cfo', 'company')),
    
    -- 基本情報（共通フィールド）
    display_name VARCHAR(200) NOT NULL,
    email VARCHAR(255),
    phone_number VARCHAR(50),
    profile_image_url TEXT,
    description TEXT,
    
    -- CFO専用フィールド
    experience_years INTEGER,
    specialization TEXT,
    achievement_summary TEXT,
    linkedin_url TEXT,
    client_message TEXT,
    years_of_total_experience INTEGER,
    consultation_approach TEXT,
    
    -- 企業専用フィールド
    company_name VARCHAR(200),
    company_size VARCHAR(50),
    industry VARCHAR(100),
    website_url TEXT,
    employee_count INTEGER,
    annual_revenue BIGINT,
    
    -- 地域・エリア情報（JSONB）
    location_data JSONB DEFAULT '{
        "address": null,
        "prefecture": null,
        "region": null,
        "remote_available": true,
        "onsite_available": false,
        "service_areas": [],
        "travel_time_max": null,
        "additional_cost": null
    }',
    
    -- 職歴・経歴（JSONB配列）
    work_experiences JSONB DEFAULT '[]',
    -- 構造例: [{"company_name": "株式会社A", "position": "CFO", "start_year": 2020, "end_year": null, "description": "...", "is_current": true}]
    
    -- 保有資格（JSONB配列）
    certifications JSONB DEFAULT '[]',
    -- 構造例: [{"name": "中小企業診断士", "level": null, "organization": "...", "obtained_year": 2020, "is_active": true}]
    
    -- 稼働条件・希望条件（JSONB）
    availability JSONB DEFAULT '{
        "days_per_week": null,
        "hours_per_day": null,
        "start_time": null,
        "end_time": null,
        "total_hours_per_week": null,
        "flexible_schedule": false,
        "preferred_days": [],
        "available_from": null,
        "notes": null
    }',
    
    -- 報酬設定（JSONB）
    compensation JSONB DEFAULT '{
        "primary_type": "hourly",
        "hourly_rate": {"min": null, "max": null},
        "monthly_rate": {"min": null, "max": null},
        "project_rate": {"min": null, "max": null},
        "performance_bonus_available": false,
        "negotiable": true,
        "currency": "JPY",
        "payment_terms": null,
        "notes": null
    }',
    
    -- 企業の課題・ニーズ（JSONB）- 企業専用
    business_challenges JSONB DEFAULT '[]',
    -- 構造例: [{"category": "資金調達", "priority": 5, "urgency": "high", "description": "..."}]
    
    -- ステータス情報
    is_active BOOLEAN DEFAULT TRUE,
    is_available BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    work_preference VARCHAR(50) DEFAULT 'hybrid' CHECK (work_preference IN ('remote', 'onsite', 'hybrid')),
    
    -- メタデータ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 制約
    UNIQUE(user_id, profile_type)
);

-- 2. プロフィール-スキル関連テーブル（簡素化）
CREATE TABLE IF NOT EXISTS rextrix_profile_skills_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES rextrix_profiles_v2(id) ON DELETE CASCADE,
    skill_tag_id UUID NOT NULL REFERENCES rextrix_skill_tags(id) ON DELETE CASCADE,
    skill_category VARCHAR(20) NOT NULL DEFAULT 'skill' CHECK (skill_category IN ('skill', 'challenge')),
    proficiency_level INTEGER DEFAULT 3 CHECK (proficiency_level BETWEEN 1 AND 5),
    experience_years INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(profile_id, skill_tag_id, skill_category)
);

-- =============================================================================
-- Phase 2: インデックス作成（パフォーマンス最適化）
-- =============================================================================

-- 基本インデックス
CREATE INDEX IF NOT EXISTS idx_profiles_v2_user_id ON rextrix_profiles_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_v2_type ON rextrix_profiles_v2(profile_type);
CREATE INDEX IF NOT EXISTS idx_profiles_v2_active ON rextrix_profiles_v2(is_active, is_available);
CREATE INDEX IF NOT EXISTS idx_profiles_v2_status ON rextrix_profiles_v2(status);

-- JSONB用GINインデックス（高速検索）
CREATE INDEX IF NOT EXISTS idx_profiles_v2_location_gin ON rextrix_profiles_v2 USING GIN (location_data);
CREATE INDEX IF NOT EXISTS idx_profiles_v2_availability_gin ON rextrix_profiles_v2 USING GIN (availability);
CREATE INDEX IF NOT EXISTS idx_profiles_v2_compensation_gin ON rextrix_profiles_v2 USING GIN (compensation);
CREATE INDEX IF NOT EXISTS idx_profiles_v2_work_exp_gin ON rextrix_profiles_v2 USING GIN (work_experiences);
CREATE INDEX IF NOT EXISTS idx_profiles_v2_certifications_gin ON rextrix_profiles_v2 USING GIN (certifications);

-- 個別検索用インデックス（よく使われる条件）
CREATE INDEX IF NOT EXISTS idx_profiles_v2_remote ON rextrix_profiles_v2 USING GIN ((location_data->'remote_available'));
CREATE INDEX IF NOT EXISTS idx_profiles_v2_hourly_rate ON rextrix_profiles_v2 USING GIN ((compensation->'hourly_rate'));
CREATE INDEX IF NOT EXISTS idx_profiles_v2_prefecture ON rextrix_profiles_v2 USING GIN ((location_data->'prefecture'));

-- スキル関連インデックス
CREATE INDEX IF NOT EXISTS idx_profile_skills_v2_profile_id ON rextrix_profile_skills_v2(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_skills_v2_skill_tag_id ON rextrix_profile_skills_v2(skill_tag_id);
CREATE INDEX IF NOT EXISTS idx_profile_skills_v2_category ON rextrix_profile_skills_v2(skill_category);

-- =============================================================================
-- Phase 3: RLS（Row Level Security）設定
-- =============================================================================

-- RLS有効化
ALTER TABLE rextrix_profiles_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE rextrix_profile_skills_v2 ENABLE ROW LEVEL SECURITY;

-- プロフィールのRLSポリシー
CREATE POLICY "Users can view all profiles" ON rextrix_profiles_v2
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own profiles" ON rextrix_profiles_v2
    FOR ALL USING (user_id::text = auth.uid()::text);

-- スキルのRLSポリシー
CREATE POLICY "Users can view all profile skills" ON rextrix_profile_skills_v2
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own profile skills" ON rextrix_profile_skills_v2
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM rextrix_profiles_v2 
            WHERE id = profile_id AND user_id::text = auth.uid()::text
        )
    );

-- =============================================================================
-- Phase 4: トリガー関数（更新日時自動設定）
-- =============================================================================

-- 更新日時自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガー設定
CREATE TRIGGER update_rextrix_profiles_v2_updated_at 
    BEFORE UPDATE ON rextrix_profiles_v2 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Phase 5: サンプルデータ投入（テスト用）
-- =============================================================================

-- CFOプロフィールのサンプル
INSERT INTO rextrix_profiles_v2 (
    user_id, 
    profile_type, 
    display_name, 
    email, 
    phone_number,
    experience_years,
    specialization,
    location_data,
    work_experiences,
    certifications,
    availability,
    compensation
) VALUES (
    (SELECT id FROM rextrix_users WHERE email = 'test@example.com' LIMIT 1),
    'cfo',
    '奥田 太郎（サンプル）',
    'okuda@example.com',
    '090-1234-5678',
    18,
    '財務戦略・資金調達・IPO準備',
    '{
        "address": "大阪府大阪市",
        "prefecture": "大阪府",
        "region": "関西",
        "remote_available": true,
        "onsite_available": true,
        "service_areas": ["大阪", "京都", "神戸", "全国リモート"],
        "travel_time_max": 60
    }',
    '[
        {
            "company_name": "株式会社りそな銀行",
            "position": "法人融資担当",
            "start_year": 2006,
            "start_month": 4,
            "end_year": 2008,
            "end_month": 3,
            "description": "法人融資業務全般",
            "industry": "金融業",
            "is_current": false,
            "display_order": 1
        },
        {
            "company_name": "日本発条株式会社",
            "position": "経理部",
            "start_year": 2008,
            "start_month": 4,
            "end_year": 2016,
            "end_month": 3,
            "description": "本社経理及び工場経理業務",
            "industry": "製造業",
            "is_current": false,
            "display_order": 2
        },
        {
            "company_name": "エスネットワークス株式会社",
            "position": "経理部門長",
            "start_year": 2016,
            "start_month": 4,
            "end_year": 2024,
            "end_month": 3,
            "description": "財務コンサル及び管理部経理部門長業務",
            "industry": "IT・通信",
            "is_current": false,
            "display_order": 3
        }
    ]',
    '[
        {
            "name": "中小企業診断士",
            "level": null,
            "organization": "一般社団法人中小企業診断協会",
            "obtained_year": 2018,
            "is_active": true,
            "display_order": 1
        },
        {
            "name": "日商簿記検定",
            "level": "1級",
            "organization": "日本商工会議所",
            "obtained_year": 2005,
            "is_active": true,
            "display_order": 2
        }
    ]',
    '{
        "days_per_week": 2,
        "hours_per_day": 8.0,
        "start_time": "10:00",
        "end_time": "18:00",
        "total_hours_per_week": 16.0,
        "flexible_schedule": true,
        "preferred_days": ["月", "水"],
        "available_from": "2025-08-01",
        "notes": "柔軟な働き方に対応可能"
    }',
    '{
        "primary_type": "hourly",
        "hourly_rate": {"min": 5000, "max": 8000},
        "monthly_rate": {"min": null, "max": null},
        "project_rate": {"min": null, "max": null},
        "performance_bonus_available": true,
        "negotiable": true,
        "currency": "JPY",
        "payment_terms": "月末締め翌月末払い",
        "notes": "成果報酬も応相談"
    }'
) ON CONFLICT (user_id, profile_type) DO NOTHING;

-- =============================================================================
-- Phase 6: 便利なビュー作成
-- =============================================================================

-- CFOプロフィール検索用ビュー
CREATE OR REPLACE VIEW v_cfo_profiles AS
SELECT 
    p.id,
    p.user_id,
    p.display_name,
    p.email,
    p.phone_number,
    p.experience_years,
    p.specialization,
    p.location_data->>'prefecture' as prefecture,
    p.location_data->>'remote_available' as remote_available,
    p.availability->>'days_per_week' as days_per_week,
    p.compensation->>'primary_type' as compensation_type,
    p.compensation->'hourly_rate'->>'min' as hourly_rate_min,
    p.compensation->'hourly_rate'->>'max' as hourly_rate_max,
    p.is_active,
    p.is_available,
    p.created_at,
    array_agg(st.name) as skills
FROM rextrix_profiles_v2 p
LEFT JOIN rextrix_profile_skills_v2 ps ON p.id = ps.profile_id AND ps.skill_category = 'skill'
LEFT JOIN rextrix_skill_tags st ON ps.skill_tag_id = st.id
WHERE p.profile_type = 'cfo'
GROUP BY p.id, p.user_id, p.display_name, p.email, p.phone_number, p.experience_years, p.specialization, p.location_data, p.availability, p.compensation, p.is_active, p.is_available, p.created_at;

-- 企業プロフィール検索用ビュー
CREATE OR REPLACE VIEW v_company_profiles AS
SELECT 
    p.id,
    p.user_id,
    p.display_name as contact_name,
    p.company_name,
    p.email,
    p.phone_number,
    p.industry,
    p.company_size,
    p.employee_count,
    p.location_data->>'prefecture' as prefecture,
    p.is_active,
    p.created_at,
    array_agg(ct.name) as challenges
FROM rextrix_profiles_v2 p
LEFT JOIN rextrix_profile_skills_v2 ps ON p.id = ps.profile_id AND ps.skill_category = 'challenge'
LEFT JOIN rextrix_challenge_tags ct ON ps.skill_tag_id = ct.id
WHERE p.profile_type = 'company'
GROUP BY p.id, p.user_id, p.display_name, p.company_name, p.email, p.phone_number, p.industry, p.company_size, p.employee_count, p.location_data, p.is_active, p.created_at;

-- =============================================================================
-- 確認クエリ
-- =============================================================================

-- テーブル作成確認
SELECT 'テーブル作成確認' as status;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('rextrix_profiles_v2', 'rextrix_profile_skills_v2')
ORDER BY table_name;

-- インデックス確認
SELECT 'インデックス確認' as status;
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('rextrix_profiles_v2', 'rextrix_profile_skills_v2')
ORDER BY tablename, indexname;

-- サンプルデータ確認
SELECT 'サンプルデータ確認' as status;
SELECT 
    id,
    display_name,
    profile_type,
    location_data->>'prefecture' as prefecture,
    jsonb_array_length(work_experiences) as work_exp_count,
    jsonb_array_length(certifications) as cert_count
FROM rextrix_profiles_v2 
LIMIT 3;

SELECT '最適化スキーマ実装完了' as result;