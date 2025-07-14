-- CFOプロフィール機能拡張 Phase 1
-- 実際のCFOプロフィール要件に対応するためのデータベース拡張
-- 奥田さんのプロフィール例に基づく設計

-- =============================================================================
-- Phase 1: 最優先実装項目
-- =============================================================================

-- 1. 職歴管理テーブル
CREATE TABLE IF NOT EXISTS rextrix_cfo_work_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cfo_id UUID NOT NULL REFERENCES rextrix_cfos(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    start_year INTEGER NOT NULL, -- 開始年（例：2006）
    start_month INTEGER, -- 開始月（1-12）
    end_year INTEGER, -- 終了年（NULL = 現職）
    end_month INTEGER, -- 終了月（1-12）
    description TEXT, -- 業務内容詳細
    industry VARCHAR(100),
    company_size VARCHAR(50), -- 企業規模
    is_current BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 制約
    CONSTRAINT valid_start_month CHECK (start_month IS NULL OR (start_month >= 1 AND start_month <= 12)),
    CONSTRAINT valid_end_month CHECK (end_month IS NULL OR (end_month >= 1 AND end_month <= 12)),
    CONSTRAINT valid_year_range CHECK (start_year >= 1980 AND start_year <= EXTRACT(YEAR FROM NOW()) + 1),
    CONSTRAINT valid_end_year CHECK (end_year IS NULL OR (end_year >= start_year AND end_year <= EXTRACT(YEAR FROM NOW()) + 1))
);

-- 2. 保有資格管理テーブル
CREATE TABLE IF NOT EXISTS rextrix_cfo_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cfo_id UUID NOT NULL REFERENCES rextrix_cfos(id) ON DELETE CASCADE,
    certification_name VARCHAR(200) NOT NULL,
    certification_level VARCHAR(50), -- 1級、2級、上級等
    issuing_organization VARCHAR(200),
    obtained_year INTEGER,
    obtained_month INTEGER,
    expiry_year INTEGER, -- NULL = 無期限
    expiry_month INTEGER,
    credential_id VARCHAR(100), -- 資格番号
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 制約
    CONSTRAINT valid_obtained_month CHECK (obtained_month IS NULL OR (obtained_month >= 1 AND obtained_month <= 12)),
    CONSTRAINT valid_expiry_month CHECK (expiry_month IS NULL OR (expiry_month >= 1 AND expiry_month <= 12)),
    CONSTRAINT valid_obtained_year CHECK (obtained_year IS NULL OR (obtained_year >= 1980 AND obtained_year <= EXTRACT(YEAR FROM NOW()) + 1))
);

-- 3. 詳細稼働条件テーブル
CREATE TABLE IF NOT EXISTS rextrix_cfo_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cfo_id UUID NOT NULL REFERENCES rextrix_cfos(id) ON DELETE CASCADE,
    days_per_week INTEGER, -- 週の稼働日数（例：2日）
    hours_per_day DECIMAL(3,1), -- 1日の稼働時間（例：8.0時間）
    start_time TIME, -- 稼働開始時間（例：10:00）
    end_time TIME, -- 稼働終了時間（例：18:00）
    total_hours_per_week DECIMAL(4,1), -- 週の総稼働時間
    remote_available BOOLEAN DEFAULT TRUE,
    onsite_available BOOLEAN DEFAULT FALSE,
    available_from DATE, -- 稼働開始可能日
    flexible_schedule BOOLEAN DEFAULT FALSE, -- スケジュール調整可能
    preferred_days VARCHAR(100), -- 希望曜日（月,火,水等）
    notes TEXT, -- 稼働条件の補足説明
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 制約
    CONSTRAINT valid_days_per_week CHECK (days_per_week IS NULL OR (days_per_week >= 1 AND days_per_week <= 7)),
    CONSTRAINT valid_hours_per_day CHECK (hours_per_day IS NULL OR (hours_per_day >= 0.5 AND hours_per_day <= 16.0)),
    CONSTRAINT valid_time_range CHECK (start_time IS NULL OR end_time IS NULL OR start_time < end_time)
);

-- 4. 対応エリア管理テーブル
CREATE TABLE IF NOT EXISTS rextrix_cfo_service_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cfo_id UUID NOT NULL REFERENCES rextrix_cfos(id) ON DELETE CASCADE,
    area_type VARCHAR(20) NOT NULL CHECK (area_type IN ('remote', 'onsite')),
    prefecture VARCHAR(50), -- 都道府県
    region_name VARCHAR(100), -- 地域名（関東、関西、大阪近郊等）
    area_description TEXT, -- エリア詳細説明
    travel_time_max INTEGER, -- 最大移動時間（分）
    additional_cost INTEGER, -- 追加コスト
    is_primary BOOLEAN DEFAULT FALSE, -- メイン対応エリア
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 複合報酬設定テーブル
CREATE TABLE IF NOT EXISTS rextrix_cfo_compensation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cfo_id UUID NOT NULL REFERENCES rextrix_cfos(id) ON DELETE CASCADE,
    compensation_type VARCHAR(20) NOT NULL CHECK (compensation_type IN ('hourly', 'monthly', 'project', 'performance', 'retainer')),
    amount_min INTEGER, -- 最低金額
    amount_max INTEGER, -- 最高金額
    currency VARCHAR(3) DEFAULT 'JPY',
    unit VARCHAR(20), -- 単位（/時間、/月、/案件等）
    is_negotiable BOOLEAN DEFAULT TRUE,
    performance_criteria TEXT, -- 成果報酬の条件
    payment_terms TEXT, -- 支払い条件
    notes TEXT, -- 報酬に関する補足
    is_primary BOOLEAN DEFAULT FALSE, -- メイン報酬設定
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 既存テーブルの拡張
-- =============================================================================

-- rextrix_cfosテーブルの拡張フィールド
ALTER TABLE rextrix_cfos ADD COLUMN IF NOT EXISTS specialization_summary TEXT; -- 専門性要約
ALTER TABLE rextrix_cfos ADD COLUMN IF NOT EXISTS achievement_summary TEXT; -- 実績要約
ALTER TABLE rextrix_cfos ADD COLUMN IF NOT EXISTS client_message TEXT; -- 顧客へのメッセージ
ALTER TABLE rextrix_cfos ADD COLUMN IF NOT EXISTS linkedin_url TEXT; -- LinkedIn URL
ALTER TABLE rextrix_cfos ADD COLUMN IF NOT EXISTS years_of_total_experience INTEGER; -- 総経験年数
ALTER TABLE rextrix_cfos ADD COLUMN IF NOT EXISTS preferred_project_size VARCHAR(50); -- 希望案件規模
ALTER TABLE rextrix_cfos ADD COLUMN IF NOT EXISTS consultation_approach TEXT; -- コンサルティングアプローチ

-- =============================================================================
-- インデックス作成
-- =============================================================================

-- パフォーマンス向上のためのインデックス
CREATE INDEX IF NOT EXISTS idx_cfo_work_experiences_cfo_id ON rextrix_cfo_work_experiences(cfo_id);
CREATE INDEX IF NOT EXISTS idx_cfo_work_experiences_order ON rextrix_cfo_work_experiences(cfo_id, display_order);
CREATE INDEX IF NOT EXISTS idx_cfo_work_experiences_current ON rextrix_cfo_work_experiences(cfo_id, is_current);

CREATE INDEX IF NOT EXISTS idx_cfo_certifications_cfo_id ON rextrix_cfo_certifications(cfo_id);
CREATE INDEX IF NOT EXISTS idx_cfo_certifications_active ON rextrix_cfo_certifications(cfo_id, is_active);
CREATE INDEX IF NOT EXISTS idx_cfo_certifications_order ON rextrix_cfo_certifications(cfo_id, display_order);

CREATE INDEX IF NOT EXISTS idx_cfo_availability_cfo_id ON rextrix_cfo_availability(cfo_id);
CREATE INDEX IF NOT EXISTS idx_cfo_service_areas_cfo_id ON rextrix_cfo_service_areas(cfo_id);
CREATE INDEX IF NOT EXISTS idx_cfo_service_areas_type ON rextrix_cfo_service_areas(cfo_id, area_type);

CREATE INDEX IF NOT EXISTS idx_cfo_compensation_cfo_id ON rextrix_cfo_compensation(cfo_id);
CREATE INDEX IF NOT EXISTS idx_cfo_compensation_type ON rextrix_cfo_compensation(cfo_id, compensation_type);
CREATE INDEX IF NOT EXISTS idx_cfo_compensation_primary ON rextrix_cfo_compensation(cfo_id, is_primary);

-- =============================================================================
-- サンプルデータ投入（奥田さんの例）
-- =============================================================================

-- 注意: 実際のCFOユーザーIDに置き換えて実行してください
-- 例：52c2c695-bd8f-4005-a5fa-fe8a0746ffcd

-- 職歴データの例
/*
INSERT INTO rextrix_cfo_work_experiences (cfo_id, company_name, position, start_year, start_month, end_year, end_month, description, display_order) VALUES
    ('CFO_USER_ID', '株式会社りそな銀行', '法人融資担当', 2006, 4, 2008, 3, '法人融資業務', 1),
    ('CFO_USER_ID', '日本発条株式会社', '経理部', 2008, 4, 2016, 3, '本社経理及び工場経理業務', 2),
    ('CFO_USER_ID', 'エスネットワークス株式会社', '経理部門長', 2016, 4, 2024, 3, '財務コンサル及び（管理部）経理部門長業務', 3);

-- 保有資格データの例
INSERT INTO rextrix_cfo_certifications (cfo_id, certification_name, certification_level, issuing_organization, display_order) VALUES
    ('CFO_USER_ID', '中小企業診断士', NULL, '一般社団法人中小企業診断協会', 1),
    ('CFO_USER_ID', '日商簿記検定', '1級', '日本商工会議所', 2);

-- 稼働条件データの例
INSERT INTO rextrix_cfo_availability (cfo_id, days_per_week, hours_per_day, start_time, end_time, total_hours_per_week, remote_available, onsite_available) VALUES
    ('CFO_USER_ID', 2, 8.0, '10:00', '18:00', 16.0, TRUE, TRUE);

-- 対応エリアデータの例
INSERT INTO rextrix_cfo_service_areas (cfo_id, area_type, region_name, area_description, is_primary) VALUES
    ('CFO_USER_ID', 'remote', '全国', '全国リモートOK', TRUE),
    ('CFO_USER_ID', 'onsite', '大阪近郊', '大阪近郊は対面可', FALSE);

-- 報酬設定データの例
INSERT INTO rextrix_cfo_compensation (cfo_id, compensation_type, amount_min, unit, is_negotiable, notes, is_primary, display_order) VALUES
    ('CFO_USER_ID', 'hourly', 5000, '/時間', TRUE, '5,000円/h以上', TRUE, 1),
    ('CFO_USER_ID', 'performance', NULL, '/案件', TRUE, '成果報酬応相談', FALSE, 2);
*/

-- =============================================================================
-- 確認クエリ
-- =============================================================================

-- テーブル作成確認
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%cfo%'
ORDER BY table_name;

-- カラム追加確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'rextrix_cfos' 
AND table_schema = 'public'
ORDER BY ordinal_position;