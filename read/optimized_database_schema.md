# 最適化後データベーステーブル一覧・カラム定義

## 概要
CFOマッチングプラットフォームの最適化設計による **5テーブル構成** の詳細なスキーマ定義です。

---

## 📋 テーブル一覧

| No. | テーブル名 | 役割 | レコード想定数 | 主要用途 |
|---|---|---|---|---|
| 1 | `rextrix_users` | 認証・基本情報 | 1,000+ | NextAuth.js認証 |
| 2 | `rextrix_cfo_profiles` | CFO統合プロフィール | 200+ | CFO情報管理 |
| 3 | `rextrix_company_profiles` | 企業統合プロフィール | 500+ | 企業情報管理 |
| 4 | `rextrix_projects` | プロジェクト・マッチング | 2,000+ | 案件・契約管理 |
| 5 | `rextrix_interactions` | コミュニケーション | 10,000+ | メッセージ・通知 |

---

## 1️⃣ `rextrix_users` - 認証・基本情報テーブル

### 📊 テーブル概要
- **役割**: NextAuth.js統一認証システムの基盤
- **関係**: 他の全プロフィールテーブルの親テーブル
- **特徴**: シンプルな認証専用構造

### 🗂️ カラム定義

```sql
CREATE TABLE rextrix_users (
    -- === 主キー ===
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- === 認証情報 ===
    email              VARCHAR(255) UNIQUE NOT NULL,
    password_hash      VARCHAR(255),                    -- NextAuth.js管理（OAuth時はNULL）
    
    -- === ユーザー分類 ===
    user_type          VARCHAR(50) NOT NULL 
                       CHECK (user_type IN ('cfo', 'company', 'admin')),
    
    -- === ステータス管理 ===
    email_verified     BOOLEAN DEFAULT false,           -- メール認証状況
    status             VARCHAR(50) DEFAULT 'active' 
                       CHECK (status IN ('active', 'inactive', 'suspended', 'banned')),
    
    -- === 活動履歴 ===
    last_login_at      TIMESTAMP WITH TIME ZONE,        -- 最終ログイン日時
    
    -- === メタデータ ===
    created_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at         TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 📈 インデックス

```sql
-- 基本検索用インデックス
CREATE INDEX idx_users_email ON rextrix_users (email);
CREATE INDEX idx_users_type_status ON rextrix_users (user_type, status);
CREATE INDEX idx_users_last_login ON rextrix_users (last_login_at DESC);
```

### 🔗 外部キー関係
- **子テーブル**: `rextrix_cfo_profiles`, `rextrix_company_profiles`, `rextrix_interactions`

---

## 2️⃣ `rextrix_cfo_profiles` - CFO統合プロフィールテーブル

### 📊 テーブル概要
- **役割**: CFO関連情報の完全統合管理
- **統合元**: `rextrix_cfos` + `rextrix_cfo_profiles` + `rextrix_user_profiles`
- **特徴**: JSONB活用による柔軟な構造化データ管理

### 🗂️ カラム定義

```sql
CREATE TABLE rextrix_cfo_profiles (
    -- === 主キー・外部キー ===
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                     UUID REFERENCES rextrix_users(id) ON DELETE CASCADE,
    
    -- === 基本識別情報 ===
    display_name                VARCHAR(255) NOT NULL,          -- 表示名（必須）
    nickname                    VARCHAR(100),                   -- ニックネーム
    email                       VARCHAR(255) NOT NULL,          -- 表示用メール（rextrix_usersから同期）
    
    -- === CFO基本情報 ===
    title                       VARCHAR(500),                   -- 肩書き・専門分野要約
    experience_years            INTEGER DEFAULT 0               -- 経験年数
                                CHECK (experience_years >= 0 AND experience_years <= 70),
    experience_summary          TEXT,                           -- 詳細経歴
    introduction                TEXT,                           -- 自己紹介文
    
    -- === ステータス・可用性 ===
    is_available                BOOLEAN DEFAULT true,           -- 対応可能状況
    availability_status         VARCHAR(50) DEFAULT 'available' -- available, busy, unavailable, on_vacation
                                CHECK (availability_status IN ('available', 'busy', 'unavailable', 'on_vacation')),
    
    -- === 評価・実績 ===
    rating                      DECIMAL(3,2) DEFAULT 0.0        -- 平均評価（0.0-5.0）
                                CHECK (rating >= 0 AND rating <= 5),
    review_count               INTEGER DEFAULT 0,               -- レビュー件数
    completed_projects         INTEGER DEFAULT 0,               -- 完了プロジェクト数
    total_contract_value       DECIMAL(15,2) DEFAULT 0,         -- 総契約金額
    
    -- === JSONB構造化データ ===
    location_data              JSONB DEFAULT '{}',              -- 居住地・対応エリア情報
    work_conditions            JSONB DEFAULT '{}',              -- 稼働条件・働き方
    compensation_data          JSONB DEFAULT '{}',              -- 報酬情報・料金体系
    specialties                JSONB DEFAULT '[]',              -- 専門分野配列
    certifications             JSONB DEFAULT '[]',              -- 資格・認定配列
    achievements               JSONB DEFAULT '[]',              -- 実績・成果配列
    work_history               JSONB DEFAULT '[]',              -- 職歴詳細配列
    skills                     JSONB DEFAULT '{}',              -- スキル・ツール習熟度
    languages                  JSONB DEFAULT '[]',              -- 対応言語
    contact_preferences        JSONB DEFAULT '{}',              -- 連絡方法・希望
    portfolio_data             JSONB DEFAULT '{}',              -- ポートフォリオ・実績詳細
    
    -- === 検索最適化 ===
    search_vector              tsvector,                        -- フルテキスト検索用
    tags_for_search            TEXT[],                          -- 検索タグ配列
    indexed_skills             TEXT[],                          -- スキル検索用配列
    indexed_locations          TEXT[],                          -- 地域検索用配列
    
    -- === プロフィール管理 ===
    profile_completion_score   INTEGER DEFAULT 0               -- プロフィール完成度（0-100）
                               CHECK (profile_completion_score >= 0 AND profile_completion_score <= 100),
    profile_visibility         VARCHAR(50) DEFAULT 'public'    -- public, private, limited
                               CHECK (profile_visibility IN ('public', 'private', 'limited')),
    featured                   BOOLEAN DEFAULT false,           -- 注目CFOフラグ
    
    -- === 活動履歴 ===
    last_activity_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_profile_update_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- === メタデータ ===
    metadata                   JSONB DEFAULT '{}',              -- その他のメタ情報
    created_at                 TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at                 TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- === 制約 ===
    UNIQUE(user_id),
    UNIQUE(email)
);
```

### 📈 インデックス

```sql
-- 基本検索インデックス
CREATE INDEX idx_cfo_user_id ON rextrix_cfo_profiles (user_id);
CREATE INDEX idx_cfo_email ON rextrix_cfo_profiles (email);
CREATE INDEX idx_cfo_availability ON rextrix_cfo_profiles (is_available, availability_status);
CREATE INDEX idx_cfo_rating ON rextrix_cfo_profiles (rating DESC, review_count DESC);
CREATE INDEX idx_cfo_experience ON rextrix_cfo_profiles (experience_years DESC);
CREATE INDEX idx_cfo_featured ON rextrix_cfo_profiles (featured, rating DESC) WHERE featured = true;

-- JSONB検索用GINインデックス
CREATE INDEX idx_cfo_specialties_gin ON rextrix_cfo_profiles USING GIN (specialties);
CREATE INDEX idx_cfo_location_gin ON rextrix_cfo_profiles USING GIN (location_data);
CREATE INDEX idx_cfo_work_conditions_gin ON rextrix_cfo_profiles USING GIN (work_conditions);
CREATE INDEX idx_cfo_compensation_gin ON rextrix_cfo_profiles USING GIN (compensation_data);
CREATE INDEX idx_cfo_skills_gin ON rextrix_cfo_profiles USING GIN (skills);
CREATE INDEX idx_cfo_certifications_gin ON rextrix_cfo_profiles USING GIN (certifications);
CREATE INDEX idx_cfo_achievements_gin ON rextrix_cfo_profiles USING GIN (achievements);

-- フルテキスト検索インデックス
CREATE INDEX idx_cfo_search_vector_gin ON rextrix_cfo_profiles USING GIN (search_vector);

-- 配列検索インデックス
CREATE INDEX idx_cfo_search_tags_gin ON rextrix_cfo_profiles USING GIN (tags_for_search);
CREATE INDEX idx_cfo_indexed_skills_gin ON rextrix_cfo_profiles USING GIN (indexed_skills);
CREATE INDEX idx_cfo_indexed_locations_gin ON rextrix_cfo_profiles USING GIN (indexed_locations);

-- 複合インデックス（よく使用される組み合わせ）
CREATE INDEX idx_cfo_location_availability ON rextrix_cfo_profiles 
    ((location_data->>'residence'->>'prefecture'), is_available);
CREATE INDEX idx_cfo_rating_availability ON rextrix_cfo_profiles 
    (rating DESC, is_available) WHERE is_available = true;
CREATE INDEX idx_cfo_completion_visibility ON rextrix_cfo_profiles 
    (profile_completion_score DESC, profile_visibility);
```

### 🔗 外部キー関係
- **親テーブル**: `rextrix_users` (user_id)
- **子テーブル**: `rextrix_projects` (cfo_id), `rextrix_interactions` (sender_id/recipient_id)

---

## 3️⃣ `rextrix_company_profiles` - 企業統合プロフィールテーブル

### 📊 テーブル概要
- **役割**: 企業情報の完全統合管理
- **統合元**: `rextrix_companies` + `rextrix_company_profiles` + `rextrix_user_profiles`
- **特徴**: CFO要求仕様の構造化管理

### 🗂️ カラム定義

```sql
CREATE TABLE rextrix_company_profiles (
    -- === 主キー・外部キー ===
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                     UUID REFERENCES rextrix_users(id) ON DELETE CASCADE,
    
    -- === 企業基本情報 ===
    company_name                VARCHAR(255) NOT NULL,          -- 企業名
    display_name                VARCHAR(255),                   -- 担当者名
    email                       VARCHAR(255) NOT NULL,          -- 表示用メール
    
    -- === 企業詳細 ===
    industry                    VARCHAR(255),                   -- 業界
    company_type                VARCHAR(100),                   -- 企業形態（株式会社、合同会社等）
    description                 TEXT,                           -- 企業説明
    website_url                 VARCHAR(500),                   -- ウェブサイト
    logo_url                    VARCHAR(500),                   -- ロゴ画像URL
    
    -- === ステータス管理 ===
    is_hiring                   BOOLEAN DEFAULT true,           -- CFO募集中
    hiring_status               VARCHAR(50) DEFAULT 'active'    -- active, paused, closed
                                CHECK (hiring_status IN ('active', 'paused', 'closed')),
    verification_status         VARCHAR(50) DEFAULT 'pending'   -- pending, verified, rejected, suspended
                                CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended')),
    
    -- === 評価・実績 ===
    rating                      DECIMAL(3,2) DEFAULT 0.0        -- 企業評価（CFOからの評価）
                                CHECK (rating >= 0 AND rating <= 5),
    review_count               INTEGER DEFAULT 0,               -- レビュー件数
    completed_projects         INTEGER DEFAULT 0,               -- 完了プロジェクト数
    active_projects            INTEGER DEFAULT 0,               -- アクティブプロジェクト数
    
    -- === JSONB構造化データ ===
    company_details            JSONB DEFAULT '{}',              -- 規模・売上・資金調達状況
    cfo_requirements           JSONB DEFAULT '{}',              -- CFO要求仕様・条件
    project_preferences        JSONB DEFAULT '{}',              -- プロジェクト希望条件
    contact_preferences        JSONB DEFAULT '{}',              -- 連絡方法・タイミング希望
    location_data              JSONB DEFAULT '{}',              -- 所在地・リモート対応
    compensation_budget        JSONB DEFAULT '{}',              -- 予算・報酬レンジ
    team_structure             JSONB DEFAULT '{}',              -- 組織構造・チーム情報
    financial_data             JSONB DEFAULT '{}',              -- 財務情報（機密レベル別）
    
    -- === 検索最適化 ===
    search_vector              tsvector,                        -- フルテキスト検索用
    tags_for_search            TEXT[],                          -- 検索タグ配列
    industry_tags              TEXT[],                          -- 業界タグ配列
    
    -- === プロフィール管理 ===
    profile_completion_score   INTEGER DEFAULT 0               -- プロフィール完成度（0-100）
                               CHECK (profile_completion_score >= 0 AND profile_completion_score <= 100),
    profile_visibility         VARCHAR(50) DEFAULT 'public'    -- public, private, limited
                               CHECK (profile_visibility IN ('public', 'private', 'limited')),
    priority_level             VARCHAR(50) DEFAULT 'normal'    -- low, normal, high, urgent
                               CHECK (priority_level IN ('low', 'normal', 'high', 'urgent')),
    
    -- === 活動履歴 ===
    last_activity_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_profile_update_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verification_requested_at  TIMESTAMP WITH TIME ZONE,        -- 認証申請日時
    verification_completed_at  TIMESTAMP WITH TIME ZONE,        -- 認証完了日時
    
    -- === メタデータ ===
    metadata                   JSONB DEFAULT '{}',              -- その他のメタ情報
    created_at                 TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at                 TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- === 制約 ===
    UNIQUE(user_id),
    UNIQUE(email)
);
```

### 📈 インデックス

```sql
-- 基本検索インデックス
CREATE INDEX idx_company_user_id ON rextrix_company_profiles (user_id);
CREATE INDEX idx_company_email ON rextrix_company_profiles (email);
CREATE INDEX idx_company_name ON rextrix_company_profiles (company_name);
CREATE INDEX idx_company_hiring ON rextrix_company_profiles (is_hiring, hiring_status);
CREATE INDEX idx_company_industry ON rextrix_company_profiles (industry);
CREATE INDEX idx_company_verification ON rextrix_company_profiles (verification_status);
CREATE INDEX idx_company_rating ON rextrix_company_profiles (rating DESC, review_count DESC);
CREATE INDEX idx_company_priority ON rextrix_company_profiles (priority_level, created_at DESC);

-- JSONB検索用インデックス
CREATE INDEX idx_company_details_gin ON rextrix_company_profiles USING GIN (company_details);
CREATE INDEX idx_company_requirements_gin ON rextrix_company_profiles USING GIN (cfo_requirements);
CREATE INDEX idx_company_preferences_gin ON rextrix_company_profiles USING GIN (project_preferences);
CREATE INDEX idx_company_location_gin ON rextrix_company_profiles USING GIN (location_data);
CREATE INDEX idx_company_budget_gin ON rextrix_company_profiles USING GIN (compensation_budget);

-- フルテキスト検索インデックス
CREATE INDEX idx_company_search_vector_gin ON rextrix_company_profiles USING GIN (search_vector);
CREATE INDEX idx_company_search_tags_gin ON rextrix_company_profiles USING GIN (tags_for_search);
CREATE INDEX idx_company_industry_tags_gin ON rextrix_company_profiles USING GIN (industry_tags);

-- 複合インデックス
CREATE INDEX idx_company_hiring_industry ON rextrix_company_profiles 
    (is_hiring, industry) WHERE is_hiring = true;
CREATE INDEX idx_company_verified_rating ON rextrix_company_profiles 
    (verification_status, rating DESC) WHERE verification_status = 'verified';
```

### 🔗 外部キー関係
- **親テーブル**: `rextrix_users` (user_id)
- **子テーブル**: `rextrix_projects` (company_id), `rextrix_interactions` (sender_id/recipient_id)

---

## 4️⃣ `rextrix_projects` - プロジェクト・マッチング統合テーブル

### 📊 テーブル概要
- **役割**: プロジェクト・マッチング・契約の統合管理
- **統合元**: `rextrix_projects` + `rextrix_matches` + `rextrix_contracts`
- **特徴**: プロジェクトライフサイクル全体の一元管理

### 🗂️ カラム定義

```sql
CREATE TABLE rextrix_projects (
    -- === 主キー・外部キー ===
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id                  UUID REFERENCES rextrix_company_profiles(id) ON DELETE CASCADE,
    cfo_id                      UUID REFERENCES rextrix_cfo_profiles(id) ON DELETE SET NULL,
    
    -- === プロジェクト基本情報 ===
    title                       VARCHAR(255) NOT NULL,          -- プロジェクトタイトル
    description                 TEXT,                           -- 詳細説明
    project_type                VARCHAR(100) DEFAULT 'consulting' -- consulting, interim, permanent, advisory
                                CHECK (project_type IN ('consulting', 'interim', 'permanent', 'advisory')),
    urgency_level              VARCHAR(50) DEFAULT 'medium'    -- low, medium, high, urgent
                                CHECK (urgency_level IN ('low', 'medium', 'high', 'urgent')),
    
    -- === ステータス管理 ===
    status                      VARCHAR(50) DEFAULT 'open'      -- open, matched, negotiating, in_progress, completed, cancelled, on_hold
                                CHECK (status IN ('open', 'matched', 'negotiating', 'in_progress', 'completed', 'cancelled', 'on_hold')),
    phase                       VARCHAR(50) DEFAULT 'requirement' -- requirement, matching, contract, execution, review, closed
                                CHECK (phase IN ('requirement', 'matching', 'contract', 'execution', 'review', 'closed')),
    
    -- === マッチング情報 ===
    match_score                DECIMAL(5,2),                   -- マッチング算出スコア（0.00-100.00）
    match_algorithm_version    VARCHAR(20),                    -- 使用したアルゴリズムバージョン
    match_type                 VARCHAR(50),                    -- auto, manual, direct
    match_approval_status      VARCHAR(50) DEFAULT 'pending'   -- pending, approved_by_company, approved_by_cfo, both_approved, rejected
                               CHECK (match_approval_status IN ('pending', 'approved_by_company', 'approved_by_cfo', 'both_approved', 'rejected')),
    
    -- === 予算・報酬 ===
    budget_range_min           INTEGER,                        -- 予算下限（円）
    budget_range_max           INTEGER,                        -- 予算上限（円）
    currency                   VARCHAR(10) DEFAULT 'JPY',     -- 通貨
    
    -- === JSONB構造化データ ===
    contract_data              JSONB DEFAULT '{}',             -- 契約条件・期間・報酬・成果物
    timeline_data              JSONB DEFAULT '{}',             -- スケジュール・マイルストーン
    deliverables               JSONB DEFAULT '[]',             -- 成果物・納期配列
    requirements               JSONB DEFAULT '{}',             -- 要求仕様・条件
    agreed_compensation        JSONB DEFAULT '{}',             -- 合意済み報酬条件
    performance_metrics        JSONB DEFAULT '{}',             -- 成果指標・KPI
    communication_settings     JSONB DEFAULT '{}',             -- コミュニケーション設定
    risk_factors               JSONB DEFAULT '[]',             -- リスク要因配列
    
    -- === 評価・フィードバック ===
    company_rating             DECIMAL(3,2)                   -- 企業からCFOへの評価
                               CHECK (company_rating IS NULL OR (company_rating >= 1 AND company_rating <= 5)),
    cfo_rating                 DECIMAL(3,2)                   -- CFOから企業への評価
                               CHECK (cfo_rating IS NULL OR (cfo_rating >= 1 AND cfo_rating <= 5)),
    mutual_feedback            JSONB DEFAULT '{}',             -- 相互フィードバック
    lessons_learned            JSONB DEFAULT '{}',             -- 学び・改善点
    
    -- === 進捗管理 ===
    progress_percentage        INTEGER DEFAULT 0               -- 進捗率（0-100）
                               CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    milestone_count           INTEGER DEFAULT 0,               -- マイルストーン総数
    completed_milestones      INTEGER DEFAULT 0,               -- 完了マイルストーン数
    
    -- === タイムライン ===
    requirement_finalized_at   TIMESTAMP WITH TIME ZONE,       -- 要件確定日
    matched_at                 TIMESTAMP WITH TIME ZONE,       -- マッチング成立日時
    contract_negotiation_started_at TIMESTAMP WITH TIME ZONE,  -- 契約交渉開始日
    contract_signed_at         TIMESTAMP WITH TIME ZONE,       -- 契約締結日
    work_started_at            TIMESTAMP WITH TIME ZONE,       -- 作業開始日
    work_completed_at          TIMESTAMP WITH TIME ZONE,       -- 作業完了日
    project_closed_at          TIMESTAMP WITH TIME ZONE,       -- プロジェクト終了日
    
    -- === 期限管理 ===
    expected_start_date        DATE,                           -- 予定開始日
    expected_end_date          DATE,                           -- 予定終了日
    actual_start_date          DATE,                           -- 実際の開始日
    actual_end_date            DATE,                           -- 実際の終了日
    
    -- === メタデータ ===
    metadata                   JSONB DEFAULT '{}',             -- その他のメタ情報
    internal_notes             TEXT,                           -- 内部メモ
    tags                       TEXT[],                         -- プロジェクトタグ
    created_at                 TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at                 TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 📈 インデックス

```sql
-- 基本検索インデックス
CREATE INDEX idx_projects_company_id ON rextrix_projects (company_id);
CREATE INDEX idx_projects_cfo_id ON rextrix_projects (cfo_id);
CREATE INDEX idx_projects_status ON rextrix_projects (status, phase);
CREATE INDEX idx_projects_type ON rextrix_projects (project_type);
CREATE INDEX idx_projects_urgency ON rextrix_projects (urgency_level, created_at DESC);
CREATE INDEX idx_projects_match_score ON rextrix_projects (match_score DESC) WHERE match_score IS NOT NULL;

-- 日付・タイムライン検索
CREATE INDEX idx_projects_timeline ON rextrix_projects (work_started_at, work_completed_at);
CREATE INDEX idx_projects_created ON rextrix_projects (created_at DESC);
CREATE INDEX idx_projects_expected_dates ON rextrix_projects (expected_start_date, expected_end_date);

-- ステータス別検索
CREATE INDEX idx_projects_active ON rextrix_projects (status, updated_at DESC) 
    WHERE status IN ('open', 'matched', 'negotiating', 'in_progress');
CREATE INDEX idx_projects_completed ON rextrix_projects (status, project_closed_at DESC) 
    WHERE status = 'completed';

-- 評価・レーティング
CREATE INDEX idx_projects_ratings ON rextrix_projects (company_rating, cfo_rating) 
    WHERE company_rating IS NOT NULL OR cfo_rating IS NOT NULL;

-- JSONB検索用インデックス
CREATE INDEX idx_projects_contract_gin ON rextrix_projects USING GIN (contract_data);
CREATE INDEX idx_projects_timeline_gin ON rextrix_projects USING GIN (timeline_data);
CREATE INDEX idx_projects_deliverables_gin ON rextrix_projects USING GIN (deliverables);
CREATE INDEX idx_projects_requirements_gin ON rextrix_projects USING GIN (requirements);
CREATE INDEX idx_projects_compensation_gin ON rextrix_projects USING GIN (agreed_compensation);

-- 配列検索インデックス
CREATE INDEX idx_projects_tags_gin ON rextrix_projects USING GIN (tags);

-- 複合インデックス（よく使用される組み合わせ）
CREATE INDEX idx_projects_company_status ON rextrix_projects (company_id, status);
CREATE INDEX idx_projects_cfo_status ON rextrix_projects (cfo_id, status) WHERE cfo_id IS NOT NULL;
CREATE INDEX idx_projects_type_status ON rextrix_projects (project_type, status);
CREATE INDEX idx_projects_budget_range ON rextrix_projects (budget_range_min, budget_range_max) 
    WHERE budget_range_min IS NOT NULL;
```

### 🔗 外部キー関係
- **親テーブル**: `rextrix_company_profiles` (company_id), `rextrix_cfo_profiles` (cfo_id)
- **子テーブル**: `rextrix_interactions` (project_id)

---

## 5️⃣ `rextrix_interactions` - 全コミュニケーション統合テーブル

### 📊 テーブル概要
- **役割**: メッセージ・レビュー・通知の統合管理
- **統合元**: `rextrix_messages` + `rextrix_reviews` + `rextrix_notifications`
- **特徴**: 全コミュニケーション履歴の一元化

### 🗂️ カラム定義

```sql
CREATE TABLE rextrix_interactions (
    -- === 主キー・外部キー ===
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id                  UUID REFERENCES rextrix_projects(id) ON DELETE CASCADE,
    sender_id                   UUID REFERENCES rextrix_users(id) ON DELETE CASCADE,
    recipient_id                UUID REFERENCES rextrix_users(id) ON DELETE CASCADE,
    
    -- === インタラクション分類 ===
    interaction_type            VARCHAR(50) NOT NULL           -- message, review, notification, status_update, system_alert, reminder
                                CHECK (interaction_type IN ('message', 'review', 'notification', 'status_update', 'system_alert', 'reminder')),
    interaction_subtype         VARCHAR(50),                   -- 詳細分類（direct_message, project_update, contract_notification等）
    
    -- === コンテンツ ===
    subject                     VARCHAR(255),                  -- 件名（通知・メッセージ用）
    content                     TEXT,                          -- メインコンテンツ
    content_format              VARCHAR(20) DEFAULT 'plain'    -- plain, markdown, html
                                CHECK (content_format IN ('plain', 'markdown', 'html')),
    
    -- === ステータス管理 ===
    status                      VARCHAR(50) DEFAULT 'active'   -- active, archived, deleted, draft
                                CHECK (status IN ('active', 'archived', 'deleted', 'draft')),
    priority                    VARCHAR(20) DEFAULT 'normal'   -- low, normal, high, urgent
                                CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- === 配信・既読管理 ===
    is_read                     BOOLEAN DEFAULT false,         -- 既読フラグ
    read_at                     TIMESTAMP WITH TIME ZONE,      -- 既読日時
    delivered_at                TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 配信日時
    delivery_status             VARCHAR(50) DEFAULT 'delivered' -- pending, delivered, failed, bounced
                                CHECK (delivery_status IN ('pending', 'delivered', 'failed', 'bounced')),
    
    -- === レビュー専用フィールド ===
    rating                      DECIMAL(3,2)                   -- レビュー評価（1.0-5.0）
                                CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
    is_public                   BOOLEAN DEFAULT false,         -- 公開レビューかどうか
    review_category             VARCHAR(50),                   -- communication, quality, timeliness, expertise
    
    -- === 通知専用フィールド ===
    notification_channel        VARCHAR(50),                   -- email, in_app, sms, push
    scheduled_at                TIMESTAMP WITH TIME ZONE,      -- 予約配信時刻
    auto_generated              BOOLEAN DEFAULT false,         -- 自動生成通知かどうか
    
    -- === JSONB構造化データ ===
    metadata                    JSONB DEFAULT '{}',            -- タイプ別の追加データ
    attachments                 JSONB DEFAULT '[]',            -- 添付ファイル情報配列
    action_buttons              JSONB DEFAULT '[]',            -- アクションボタン設定（通知用）
    tracking_data               JSONB DEFAULT '{}',            -- 配信・開封トラッキング情報
    
    -- === スレッド・返信管理 ===
    parent_interaction_id       UUID REFERENCES rextrix_interactions(id) ON DELETE SET NULL, -- 返信元
    thread_id                   UUID,                          -- スレッドID（同一話題のグルーピング）
    reply_count                 INTEGER DEFAULT 0,             -- 返信数
    
    -- === 有効期限・アーカイブ ===
    expires_at                  TIMESTAMP WITH TIME ZONE,      -- 有効期限（通知用）
    archived_at                 TIMESTAMP WITH TIME ZONE,      -- アーカイブ日時
    
    -- === メタデータ ===
    internal_tags               TEXT[],                        -- 内部管理用タグ
    created_at                  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at                  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 📈 インデックス

```sql
-- 基本検索インデックス
CREATE INDEX idx_interactions_project ON rextrix_interactions (project_id);
CREATE INDEX idx_interactions_sender ON rextrix_interactions (sender_id);
CREATE INDEX idx_interactions_recipient ON rextrix_interactions (recipient_id);
CREATE INDEX idx_interactions_type ON rextrix_interactions (interaction_type, interaction_subtype);

-- ステータス・既読管理
CREATE INDEX idx_interactions_unread ON rextrix_interactions (recipient_id, is_read, created_at DESC) 
    WHERE is_read = false AND status = 'active';
CREATE INDEX idx_interactions_status ON rextrix_interactions (status, created_at DESC);

-- タイムライン・日付検索
CREATE INDEX idx_interactions_timeline ON rextrix_interactions (created_at DESC);
CREATE INDEX idx_interactions_scheduled ON rextrix_interactions (scheduled_at) 
    WHERE scheduled_at IS NOT NULL;
CREATE INDEX idx_interactions_expires ON rextrix_interactions (expires_at) 
    WHERE expires_at IS NOT NULL;

-- レビュー専用検索
CREATE INDEX idx_interactions_reviews ON rextrix_interactions (interaction_type, rating, is_public, created_at DESC) 
    WHERE interaction_type = 'review';
CREATE INDEX idx_interactions_public_reviews ON rextrix_interactions (is_public, rating DESC, created_at DESC) 
    WHERE interaction_type = 'review' AND is_public = true;

-- 通知専用検索
CREATE INDEX idx_interactions_notifications ON rextrix_interactions (interaction_type, notification_channel, delivered_at DESC) 
    WHERE interaction_type IN ('notification', 'system_alert', 'reminder');

-- スレッド・返信管理
CREATE INDEX idx_interactions_parent ON rextrix_interactions (parent_interaction_id);
CREATE INDEX idx_interactions_thread ON rextrix_interactions (thread_id, created_at ASC) 
    WHERE thread_id IS NOT NULL;

-- JSONB検索用インデックス
CREATE INDEX idx_interactions_metadata_gin ON rextrix_interactions USING GIN (metadata);
CREATE INDEX idx_interactions_attachments_gin ON rextrix_interactions USING GIN (attachments);
CREATE INDEX idx_interactions_tracking_gin ON rextrix_interactions USING GIN (tracking_data);

-- 配列検索インデックス
CREATE INDEX idx_interactions_tags_gin ON rextrix_interactions USING GIN (internal_tags);

-- 複合インデックス（よく使用される組み合わせ）
CREATE INDEX idx_interactions_project_type ON rextrix_interactions (project_id, interaction_type, created_at DESC);
CREATE INDEX idx_interactions_user_timeline ON rextrix_interactions (sender_id, recipient_id, created_at DESC);
CREATE INDEX idx_interactions_user_unread ON rextrix_interactions (recipient_id, interaction_type, is_read);
CREATE INDEX idx_interactions_priority_unread ON rextrix_interactions (priority, is_read, created_at DESC) 
    WHERE priority IN ('high', 'urgent') AND is_read = false;
```

### 🔗 外部キー関係
- **親テーブル**: `rextrix_projects` (project_id), `rextrix_users` (sender_id, recipient_id), `rextrix_interactions` (parent_interaction_id)
- **子テーブル**: `rextrix_interactions` (parent_interaction_id) - 自己参照

---

## 🎯 テーブル間リレーション図

```
rextrix_users (認証・基本情報)
    ├── rextrix_cfo_profiles (1:1) - CFO統合プロフィール
    └── rextrix_company_profiles (1:1) - 企業統合プロフィール

プロジェクト・マッチング関係:
rextrix_cfo_profiles ──┐
                      ├── rextrix_projects (N:M) - プロジェクト・マッチング統合
rextrix_company_profiles ──┘
    │
    └── rextrix_interactions (1:N) - 全コミュニケーション統合

詳細関係:
- rextrix_users (1) ← (N) rextrix_interactions (sender_id/recipient_id)
- rextrix_projects (1) ← (N) rextrix_interactions (project_id)
- rextrix_interactions (1) ← (N) rextrix_interactions (parent_interaction_id) [自己参照]
```

---

## 📊 サイズ・パフォーマンス予測

### レコード数予測（1年後）
| テーブル | 予想レコード数 | 主要インデックス数 | 予想サイズ |
|---|---|---|---|
| `rextrix_users` | 1,000 | 3 | 1MB |
| `rextrix_cfo_profiles` | 200 | 15 | 50MB |
| `rextrix_company_profiles` | 500 | 12 | 30MB |
| `rextrix_projects` | 2,000 | 18 | 100MB |
| `rextrix_interactions` | 50,000 | 16 | 500MB |
| **合計** | **53,700** | **64** | **681MB** |

### パフォーマンス指標
- **CFO一覧取得**: < 50ms
- **CFO詳細取得**: < 30ms  
- **マッチング検索**: < 100ms
- **メッセージ履歴取得**: < 80ms

---

## 🔧 管理・運用

### バックアップ戦略
```sql
-- 日次バックアップ
pg_dump --table=rextrix_* dbname > backup_$(date +%Y%m%d).sql

-- 重要データのリアルタイムレプリケーション対象
-- - rextrix_users (認証情報)
-- - rextrix_cfo_profiles (CFOデータ)
-- - rextrix_company_profiles (企業データ)
```

### モニタリング対象
- 各テーブルのレコード増加率
- インデックス使用効率
- JSONB検索クエリのパフォーマンス
- ディスク使用量推移

この統合テーブル設計により、**シンプルで高性能なデータベース構造** を実現し、開発・運用効率を大幅に向上させることができます。

---

*この設計は2025年7月13日時点の最適化案です。実装前に十分な検証を実施してください。*