-- データベース構造最適化分析
-- 現在のrextrixテーブル構造を分析し、最適化案を提示

-- =============================================================================
-- 問題分析: 現在のテーブル設計の課題
-- =============================================================================

/*
現在の問題点：
1. プロフィール関連テーブルの過剰な分散
   - rextrix_users（ユーザー基本情報）
   - rextrix_user_profiles（汎用プロフィール）  
   - rextrix_cfos（CFO専用プロフィール）
   - rextrix_companies（企業プロフィール）

2. 新規提案テーブルによる更なる複雑化
   - rextrix_cfo_work_experiences（職歴）
   - rextrix_cfo_certifications（資格）
   - rextrix_cfo_availability（稼働条件）
   - rextrix_cfo_service_areas（対応エリア）
   - rextrix_cfo_compensation（報酬設定）

3. データ重複とメンテナンス性の低下
   - 同じような項目が複数テーブルに散在
   - 外部キー管理の複雑化
   - データ整合性保証の困難

結果：11個以上のテーブルによる過度な正規化
*/

-- =============================================================================
-- 最適化戦略: 統合テーブル + JSONB活用
-- =============================================================================

/*
最適化方針：
1. プロフィールテーブルの統合（4テーブル → 2テーブル）
2. 複雑な構造化データにJSONBを活用
3. 外部キー関係の簡素化
4. 検索性能とメンテナンス性の両立

最終構成：
- rextrix_users（ユーザー基本情報）
- rextrix_profiles（統合プロフィール）※CFO・企業共通
- rextrix_skill_tags（スキルマスター）
- rextrix_challenge_tags（課題マスター）
- rextrix_profile_skills（プロフィール-スキル関連）
*/

-- =============================================================================
-- 最適化実装案
-- =============================================================================

-- 1. 統合プロフィールテーブル設計
CREATE TABLE IF NOT EXISTS rextrix_profiles_optimized (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES rextrix_users(id) ON DELETE CASCADE,
    profile_type VARCHAR(20) NOT NULL CHECK (profile_type IN ('cfo', 'company')),
    
    -- 基本情報（共通）
    display_name VARCHAR(200) NOT NULL,
    email VARCHAR(255),
    phone_number VARCHAR(50),
    profile_image_url TEXT,
    
    -- 地域・エリア情報（JSONB）
    location_data JSONB DEFAULT '{}', -- 住所、対応エリア、リモート可否など
    
    -- CFO専用フィールド
    experience_years INTEGER,
    specialization TEXT,
    achievement_summary TEXT,
    linkedin_url TEXT,
    
    -- 企業専用フィールド
    company_name VARCHAR(200),
    company_size VARCHAR(50),
    industry VARCHAR(100),
    website_url TEXT,
    
    -- 職歴・経歴（JSONB配列）
    work_experiences JSONB DEFAULT '[]', -- [{ company, position, period, description }]
    
    -- 保有資格（JSONB配列）
    certifications JSONB DEFAULT '[]', -- [{ name, level, organization, date }]
    
    -- 稼働条件・希望条件（JSONB）
    availability JSONB DEFAULT '{}', -- { days_per_week, hours, schedule, remote }
    
    -- 報酬設定（JSONB）
    compensation JSONB DEFAULT '{}', -- { type, range, negotiable, terms }
    
    -- ステータス情報
    is_active BOOLEAN DEFAULT TRUE,
    is_available BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'active',
    
    -- メタデータ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 制約
    UNIQUE(user_id, profile_type)
);

-- 2. JSONB構造の例
/*
location_data: {
  "address": "東京都渋谷区",
  "prefecture": "東京都",
  "remote_available": true,
  "onsite_areas": ["東京", "神奈川", "千葉"],
  "travel_time_max": 60
}

work_experiences: [
  {
    "company_name": "株式会社りそな銀行",
    "position": "法人融資担当",
    "start_year": 2006,
    "start_month": 4,
    "end_year": 2008,
    "end_month": 3,
    "description": "法人融資業務",
    "industry": "金融業",
    "is_current": false
  }
]

certifications: [
  {
    "name": "中小企業診断士",
    "level": null,
    "organization": "一般社団法人中小企業診断協会",
    "obtained_year": 2020,
    "is_active": true
  }
]

availability: {
  "days_per_week": 2,
  "hours_per_day": 8.0,
  "start_time": "10:00",
  "end_time": "18:00",
  "total_hours_per_week": 16.0,
  "flexible_schedule": true,
  "preferred_days": ["月", "水"],
  "available_from": "2025-08-01"
}

compensation: {
  "primary_type": "hourly",
  "hourly_rate": { "min": 5000, "max": 8000 },
  "monthly_rate": null,
  "project_rate": null,
  "performance_bonus": true,
  "negotiable": true,
  "currency": "JPY",
  "payment_terms": "月末締め翌月末払い"
}
*/

-- 3. プロフィール-スキル関連テーブル（簡素化）
CREATE TABLE IF NOT EXISTS rextrix_profile_skills_optimized (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES rextrix_profiles_optimized(id) ON DELETE CASCADE,
    skill_tag_id UUID NOT NULL REFERENCES rextrix_skill_tags(id) ON DELETE CASCADE,
    skill_type VARCHAR(20) NOT NULL CHECK (skill_type IN ('skill', 'challenge')),
    proficiency_level INTEGER DEFAULT 3 CHECK (proficiency_level BETWEEN 1 AND 5),
    experience_years INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(profile_id, skill_tag_id, skill_type)
);

-- 4. インデックス設計（JSONB対応）
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON rextrix_profiles_optimized(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_type ON rextrix_profiles_optimized(profile_type);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON rextrix_profiles_optimized(is_active, is_available);

-- JSONB用インデックス
CREATE INDEX IF NOT EXISTS idx_profiles_location_gin ON rextrix_profiles_optimized USING GIN (location_data);
CREATE INDEX IF NOT EXISTS idx_profiles_availability_gin ON rextrix_profiles_optimized USING GIN (availability);
CREATE INDEX IF NOT EXISTS idx_profiles_compensation_gin ON rextrix_profiles_optimized USING GIN (compensation);

-- 個別検索用インデックス
CREATE INDEX IF NOT EXISTS idx_profiles_remote ON rextrix_profiles_optimized USING GIN ((location_data->'remote_available'));
CREATE INDEX IF NOT EXISTS idx_profiles_hourly_rate ON rextrix_profiles_optimized USING GIN ((compensation->'hourly_rate'));

-- =============================================================================
-- 移行戦略
-- =============================================================================

/*
段階的移行計画：

Phase 1: 新テーブル作成とテスト
1. rextrix_profiles_optimized テーブル作成
2. rextrix_profile_skills_optimized テーブル作成
3. サンプルデータでのテスト

Phase 2: データ移行
1. 既存データの新テーブルへの移行スクリプト作成
2. データ整合性確認
3. アプリケーション側の調整

Phase 3: 本格移行
1. 新テーブルでの運用開始
2. 旧テーブルの段階的廃止
3. パフォーマンス監視

利点：
- テーブル数: 11個 → 5個（54%削減）
- 外部キー関係の簡素化
- 複雑データのJSONB管理による柔軟性
- 検索性能の向上（適切なGINインデックス）
- メンテナンス性の大幅改善
*/