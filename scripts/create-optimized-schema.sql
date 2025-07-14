-- 5テーブル最適化設計 スキーマ作成SQL
-- 作成日: 2025-07-13
-- 既存データのバックアップ完了後に実行

-- === 1. 既存データのバックアップ確認 ===
-- backup_2025-07-13T16-47-09/ ディレクトリにバックアップ済み

-- === 2. 新しい最適化テーブル作成 ===

-- 1️⃣ rextrix_users (認証・基本情報) - 既存テーブル利用
-- 既存のrextrix_usersテーブルをそのまま使用

-- 2️⃣ rextrix_cfo_profiles (CFO統合プロフィール) - 新規作成
CREATE TABLE rextrix_cfo_profiles_new (
    -- === 主キー・外部キー ===
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                     UUID REFERENCES rextrix_users(id) ON DELETE CASCADE,
    
    -- === 基本識別情報 ===
    display_name                VARCHAR(255) NOT NULL,
    nickname                    VARCHAR(100),
    email                       VARCHAR(255) NOT NULL,
    
    -- === CFO基本情報 ===
    title                       VARCHAR(500),
    experience_years            INTEGER DEFAULT 0 
                                CHECK (experience_years >= 0 AND experience_years <= 70),
    experience_summary          TEXT,
    introduction                TEXT,
    
    -- === ステータス・可用性 ===
    is_available                BOOLEAN DEFAULT true,
    availability_status         VARCHAR(50) DEFAULT 'available' 
                                CHECK (availability_status IN ('available', 'busy', 'unavailable', 'on_vacation')),
    
    -- === 評価・実績 ===
    rating                      DECIMAL(3,2) DEFAULT 0.0 
                                CHECK (rating >= 0 AND rating <= 5),
    review_count               INTEGER DEFAULT 0,
    completed_projects         INTEGER DEFAULT 0,
    total_contract_value       DECIMAL(15,2) DEFAULT 0,
    
    -- === JSONB構造化データ ===
    location_data              JSONB DEFAULT '{}',
    work_conditions            JSONB DEFAULT '{}',
    compensation_data          JSONB DEFAULT '{}',
    specialties                JSONB DEFAULT '[]',
    certifications             JSONB DEFAULT '[]',
    achievements               JSONB DEFAULT '[]',
    work_history               JSONB DEFAULT '[]',
    skills                     JSONB DEFAULT '{}',
    languages                  JSONB DEFAULT '[]',
    contact_preferences        JSONB DEFAULT '{}',
    portfolio_data             JSONB DEFAULT '{}',
    
    -- === 検索最適化 ===
    search_vector              tsvector,
    tags_for_search            TEXT[],
    indexed_skills             TEXT[],
    indexed_locations          TEXT[],
    
    -- === プロフィール管理 ===
    profile_completion_score   INTEGER DEFAULT 0 
                               CHECK (profile_completion_score >= 0 AND profile_completion_score <= 100),
    profile_visibility         VARCHAR(50) DEFAULT 'public' 
                               CHECK (profile_visibility IN ('public', 'private', 'limited')),
    featured                   BOOLEAN DEFAULT false,
    
    -- === 活動履歴 ===
    last_activity_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_profile_update_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- === メタデータ ===
    metadata                   JSONB DEFAULT '{}',
    created_at                 TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at                 TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- === 制約 ===
    UNIQUE(user_id),
    UNIQUE(email)
);

-- 3️⃣ rextrix_company_profiles (企業統合プロフィール) - 新規作成  
CREATE TABLE rextrix_company_profiles_new (
    -- === 主キー・外部キー ===
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                     UUID REFERENCES rextrix_users(id) ON DELETE CASCADE,
    
    -- === 企業基本情報 ===
    company_name                VARCHAR(255) NOT NULL,
    display_name                VARCHAR(255),
    email                       VARCHAR(255) NOT NULL,
    
    -- === 企業詳細 ===
    industry                    VARCHAR(255),
    company_type                VARCHAR(100),
    description                 TEXT,
    website_url                 VARCHAR(500),
    logo_url                    VARCHAR(500),
    
    -- === ステータス管理 ===
    is_hiring                   BOOLEAN DEFAULT true,
    hiring_status               VARCHAR(50) DEFAULT 'active' 
                                CHECK (hiring_status IN ('active', 'paused', 'closed')),
    verification_status         VARCHAR(50) DEFAULT 'pending' 
                                CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
    
    -- === 評価・実績 ===
    rating                      DECIMAL(3,2) DEFAULT 0.0 
                                CHECK (rating >= 0 AND rating <= 5),
    review_count               INTEGER DEFAULT 0,
    completed_projects         INTEGER DEFAULT 0,
    active_projects            INTEGER DEFAULT 0,
    
    -- === JSONB構造化データ ===
    company_details            JSONB DEFAULT '{}',
    cfo_requirements           JSONB DEFAULT '{}',
    project_preferences        JSONB DEFAULT '{}',
    contact_preferences        JSONB DEFAULT '{}',
    location_data              JSONB DEFAULT '{}',
    compensation_budget        JSONB DEFAULT '{}',
    team_structure             JSONB DEFAULT '{}',
    financial_data             JSONB DEFAULT '{}',
    
    -- === 検索最適化 ===
    search_vector              tsvector,
    tags_for_search            TEXT[],
    industry_tags              TEXT[],
    
    -- === プロフィール管理 ===
    profile_completion_score   INTEGER DEFAULT 0 
                               CHECK (profile_completion_score >= 0 AND profile_completion_score <= 100),
    profile_visibility         VARCHAR(50) DEFAULT 'public' 
                               CHECK (profile_visibility IN ('public', 'private', 'limited')),
    priority_level             VARCHAR(50) DEFAULT 'normal' 
                               CHECK (priority_level IN ('low', 'normal', 'high', 'urgent')),
    
    -- === 活動履歴 ===
    last_activity_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_profile_update_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verification_requested_at  TIMESTAMP WITH TIME ZONE,
    verification_completed_at  TIMESTAMP WITH TIME ZONE,
    
    -- === メタデータ ===
    metadata                   JSONB DEFAULT '{}',
    created_at                 TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at                 TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- === 制約 ===
    UNIQUE(user_id),
    UNIQUE(email)
);

-- 4️⃣ rextrix_projects (プロジェクト・マッチング統合) - 新規作成
CREATE TABLE rextrix_projects_new (
    -- === 主キー・外部キー ===
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id                  UUID REFERENCES rextrix_company_profiles_new(id) ON DELETE CASCADE,
    cfo_id                      UUID REFERENCES rextrix_cfo_profiles_new(id) ON DELETE SET NULL,
    
    -- === プロジェクト基本情報 ===
    title                       VARCHAR(255) NOT NULL,
    description                 TEXT,
    project_type                VARCHAR(100) DEFAULT 'consulting' 
                                CHECK (project_type IN ('consulting', 'interim', 'permanent', 'advisory')),
    urgency_level              VARCHAR(50) DEFAULT 'medium' 
                                CHECK (urgency_level IN ('low', 'medium', 'high', 'urgent')),
    
    -- === ステータス管理 ===
    status                      VARCHAR(50) DEFAULT 'open' 
                                CHECK (status IN ('open', 'matched', 'negotiating', 'in_progress', 'completed', 'cancelled', 'on_hold')),
    phase                       VARCHAR(50) DEFAULT 'requirement' 
                                CHECK (phase IN ('requirement', 'matching', 'contract', 'execution', 'review', 'closed')),
    
    -- === マッチング情報 ===
    match_score                DECIMAL(5,2),
    match_algorithm_version    VARCHAR(20),
    match_type                 VARCHAR(50),
    match_approval_status      VARCHAR(50) DEFAULT 'pending' 
                               CHECK (match_approval_status IN ('pending', 'approved_by_company', 'approved_by_cfo', 'both_approved', 'rejected')),
    
    -- === 予算・報酬 ===
    budget_range_min           INTEGER,
    budget_range_max           INTEGER,
    currency                   VARCHAR(10) DEFAULT 'JPY',
    
    -- === JSONB構造化データ ===
    contract_data              JSONB DEFAULT '{}',
    timeline_data              JSONB DEFAULT '{}',
    deliverables               JSONB DEFAULT '[]',
    requirements               JSONB DEFAULT '{}',
    agreed_compensation        JSONB DEFAULT '{}',
    performance_metrics        JSONB DEFAULT '{}',
    communication_settings     JSONB DEFAULT '{}',
    risk_factors               JSONB DEFAULT '[]',
    
    -- === 評価・フィードバック ===
    company_rating             DECIMAL(3,2) 
                               CHECK (company_rating IS NULL OR (company_rating >= 1 AND company_rating <= 5)),
    cfo_rating                 DECIMAL(3,2) 
                               CHECK (cfo_rating IS NULL OR (cfo_rating >= 1 AND cfo_rating <= 5)),
    mutual_feedback            JSONB DEFAULT '{}',
    lessons_learned            JSONB DEFAULT '{}',
    
    -- === 進捗管理 ===
    progress_percentage        INTEGER DEFAULT 0 
                               CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    milestone_count           INTEGER DEFAULT 0,
    completed_milestones      INTEGER DEFAULT 0,
    
    -- === タイムライン ===
    requirement_finalized_at   TIMESTAMP WITH TIME ZONE,
    matched_at                 TIMESTAMP WITH TIME ZONE,
    contract_negotiation_started_at TIMESTAMP WITH TIME ZONE,
    contract_signed_at         TIMESTAMP WITH TIME ZONE,
    work_started_at            TIMESTAMP WITH TIME ZONE,
    work_completed_at          TIMESTAMP WITH TIME ZONE,
    project_closed_at          TIMESTAMP WITH TIME ZONE,
    
    -- === 期限管理 ===
    expected_start_date        DATE,
    expected_end_date          DATE,
    actual_start_date          DATE,
    actual_end_date            DATE,
    
    -- === メタデータ ===
    metadata                   JSONB DEFAULT '{}',
    internal_notes             TEXT,
    tags                       TEXT[],
    created_at                 TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at                 TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5️⃣ rextrix_interactions (全コミュニケーション統合) - 新規作成
CREATE TABLE rextrix_interactions_new (
    -- === 主キー・外部キー ===
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id                  UUID REFERENCES rextrix_projects_new(id) ON DELETE CASCADE,
    sender_id                   UUID REFERENCES rextrix_users(id) ON DELETE CASCADE,
    recipient_id                UUID REFERENCES rextrix_users(id) ON DELETE CASCADE,
    
    -- === インタラクション分類 ===
    interaction_type            VARCHAR(50) NOT NULL 
                                CHECK (interaction_type IN ('message', 'review', 'notification', 'status_update', 'system_alert', 'reminder')),
    interaction_subtype         VARCHAR(50),
    
    -- === コンテンツ ===
    subject                     VARCHAR(255),
    content                     TEXT,
    content_format              VARCHAR(20) DEFAULT 'plain' 
                                CHECK (content_format IN ('plain', 'markdown', 'html')),
    
    -- === ステータス管理 ===
    status                      VARCHAR(50) DEFAULT 'active' 
                                CHECK (status IN ('active', 'archived', 'deleted', 'draft')),
    priority                    VARCHAR(20) DEFAULT 'normal' 
                                CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- === 配信・既読管理 ===
    is_read                     BOOLEAN DEFAULT false,
    read_at                     TIMESTAMP WITH TIME ZONE,
    delivered_at                TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivery_status             VARCHAR(50) DEFAULT 'delivered' 
                                CHECK (delivery_status IN ('pending', 'delivered', 'failed', 'bounced')),
    
    -- === レビュー専用フィールド ===
    rating                      DECIMAL(3,2) 
                                CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
    is_public                   BOOLEAN DEFAULT false,
    review_category             VARCHAR(50),
    
    -- === 通知専用フィールド ===
    notification_channel        VARCHAR(50),
    scheduled_at                TIMESTAMP WITH TIME ZONE,
    auto_generated              BOOLEAN DEFAULT false,
    
    -- === JSONB構造化データ ===
    metadata                    JSONB DEFAULT '{}',
    attachments                 JSONB DEFAULT '[]',
    action_buttons              JSONB DEFAULT '[]',
    tracking_data               JSONB DEFAULT '{}',
    
    -- === スレッド・返信管理 ===
    parent_interaction_id       UUID REFERENCES rextrix_interactions_new(id) ON DELETE SET NULL,
    thread_id                   UUID,
    reply_count                 INTEGER DEFAULT 0,
    
    -- === 有効期限・アーカイブ ===
    expires_at                  TIMESTAMP WITH TIME ZONE,
    archived_at                 TIMESTAMP WITH TIME ZONE,
    
    -- === メタデータ ===
    internal_tags               TEXT[],
    created_at                  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at                  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- === 3. インデックス作成 ===

-- rextrix_cfo_profiles_new インデックス
CREATE INDEX idx_cfo_new_user_id ON rextrix_cfo_profiles_new (user_id);
CREATE INDEX idx_cfo_new_email ON rextrix_cfo_profiles_new (email);
CREATE INDEX idx_cfo_new_availability ON rextrix_cfo_profiles_new (is_available, availability_status);
CREATE INDEX idx_cfo_new_rating ON rextrix_cfo_profiles_new (rating DESC, review_count DESC);
CREATE INDEX idx_cfo_new_experience ON rextrix_cfo_profiles_new (experience_years DESC);
CREATE INDEX idx_cfo_new_featured ON rextrix_cfo_profiles_new (featured, rating DESC) WHERE featured = true;

-- JSONB検索用GINインデックス
CREATE INDEX idx_cfo_new_specialties_gin ON rextrix_cfo_profiles_new USING GIN (specialties);
CREATE INDEX idx_cfo_new_location_gin ON rextrix_cfo_profiles_new USING GIN (location_data);
CREATE INDEX idx_cfo_new_work_conditions_gin ON rextrix_cfo_profiles_new USING GIN (work_conditions);
CREATE INDEX idx_cfo_new_compensation_gin ON rextrix_cfo_profiles_new USING GIN (compensation_data);
CREATE INDEX idx_cfo_new_skills_gin ON rextrix_cfo_profiles_new USING GIN (skills);

-- 配列検索インデックス
CREATE INDEX idx_cfo_new_search_tags_gin ON rextrix_cfo_profiles_new USING GIN (tags_for_search);
CREATE INDEX idx_cfo_new_indexed_skills_gin ON rextrix_cfo_profiles_new USING GIN (indexed_skills);
CREATE INDEX idx_cfo_new_indexed_locations_gin ON rextrix_cfo_profiles_new USING GIN (indexed_locations);

-- rextrix_company_profiles_new インデックス
CREATE INDEX idx_company_new_user_id ON rextrix_company_profiles_new (user_id);
CREATE INDEX idx_company_new_email ON rextrix_company_profiles_new (email);
CREATE INDEX idx_company_new_name ON rextrix_company_profiles_new (company_name);
CREATE INDEX idx_company_new_hiring ON rextrix_company_profiles_new (is_hiring, hiring_status);
CREATE INDEX idx_company_new_industry ON rextrix_company_profiles_new (industry);
CREATE INDEX idx_company_new_verification ON rextrix_company_profiles_new (verification_status);
CREATE INDEX idx_company_new_rating ON rextrix_company_profiles_new (rating DESC, review_count DESC);

-- JSONB検索用インデックス
CREATE INDEX idx_company_new_details_gin ON rextrix_company_profiles_new USING GIN (company_details);
CREATE INDEX idx_company_new_requirements_gin ON rextrix_company_profiles_new USING GIN (cfo_requirements);
CREATE INDEX idx_company_new_location_gin ON rextrix_company_profiles_new USING GIN (location_data);

-- rextrix_projects_new インデックス
CREATE INDEX idx_projects_new_company_id ON rextrix_projects_new (company_id);
CREATE INDEX idx_projects_new_cfo_id ON rextrix_projects_new (cfo_id);
CREATE INDEX idx_projects_new_status ON rextrix_projects_new (status, phase);
CREATE INDEX idx_projects_new_type ON rextrix_projects_new (project_type);
CREATE INDEX idx_projects_new_urgency ON rextrix_projects_new (urgency_level, created_at DESC);
CREATE INDEX idx_projects_new_match_score ON rextrix_projects_new (match_score DESC) WHERE match_score IS NOT NULL;

-- JSONB検索用インデックス
CREATE INDEX idx_projects_new_contract_gin ON rextrix_projects_new USING GIN (contract_data);
CREATE INDEX idx_projects_new_timeline_gin ON rextrix_projects_new USING GIN (timeline_data);
CREATE INDEX idx_projects_new_deliverables_gin ON rextrix_projects_new USING GIN (deliverables);

-- rextrix_interactions_new インデックス
CREATE INDEX idx_interactions_new_project ON rextrix_interactions_new (project_id);
CREATE INDEX idx_interactions_new_sender ON rextrix_interactions_new (sender_id);
CREATE INDEX idx_interactions_new_recipient ON rextrix_interactions_new (recipient_id);
CREATE INDEX idx_interactions_new_type ON rextrix_interactions_new (interaction_type, interaction_subtype);
CREATE INDEX idx_interactions_new_unread ON rextrix_interactions_new (recipient_id, is_read, created_at DESC) 
    WHERE is_read = false AND status = 'active';
CREATE INDEX idx_interactions_new_timeline ON rextrix_interactions_new (created_at DESC);

-- JSONB検索用インデックス
CREATE INDEX idx_interactions_new_metadata_gin ON rextrix_interactions_new USING GIN (metadata);
CREATE INDEX idx_interactions_new_attachments_gin ON rextrix_interactions_new USING GIN (attachments);

-- === 4. 制約修正とシステムユーザー作成 ===
-- user_type制約を更新してadminを追加
ALTER TABLE rextrix_users 
DROP CONSTRAINT IF EXISTS rextrix_users_user_type_check;

ALTER TABLE rextrix_users 
ADD CONSTRAINT rextrix_users_user_type_check 
CHECK (user_type IN ('cfo', 'company', 'admin'));

-- システムユーザー挿入
INSERT INTO rextrix_users (id, email, user_type, status) 
VALUES (gen_random_uuid(), 'system@rextrix.com', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;

-- 作成完了コメント
COMMENT ON TABLE rextrix_cfo_profiles_new IS '5テーブル最適化設計: CFO統合プロフィール（2025-07-13作成）';
COMMENT ON TABLE rextrix_company_profiles_new IS '5テーブル最適化設計: 企業統合プロフィール（2025-07-13作成）';
COMMENT ON TABLE rextrix_projects_new IS '5テーブル最適化設計: プロジェクト・マッチング統合（2025-07-13作成）';
COMMENT ON TABLE rextrix_interactions_new IS '5テーブル最適化設計: コミュニケーション統合（2025-07-13作成）';

-- === SQL完了 ===
-- 次のステップ: データ移行スクリプト実行
-- scripts/migrate-to-optimized-schema.js