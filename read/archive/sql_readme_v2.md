# CFOマッチングプラットフォーム - 最適化データベース設計 v2.0

## 目次
1. [最適化設計の概要](#1-最適化設計の概要)
2. [設計原則・方針](#2-設計原則方針)
3. [最適化テーブル設計](#3-最適化テーブル設計)
4. [JSONB構造設計](#4-jsonb構造設計)
5. [パフォーマンス最適化](#5-パフォーマンス最適化)
6. [移行戦略](#6-移行戦略)
7. [実装例・コードサンプル](#7-実装例コードサンプル)
8. [期待効果・評価指標](#8-期待効果評価指標)

---

## 1. 最適化設計の概要

### 🎯 設計目標
現在の24テーブル構成から **5テーブルの最適化設計** へ移行し、シンプルで高性能なデータベース構造を実現する。

### 🔄 変更の概要
| 項目 | 現在 | 最適化後 | 改善率 |
|---|---|---|---|
| **テーブル数** | 24テーブル | 5テーブル | **79%削減** |
| **CFO関連テーブル** | 4テーブル分散 | 1テーブル統合 | **75%削減** |
| **JOIN処理** | 3-4回/クエリ | 0-1回/クエリ | **80%削減** |
| **API複雑度** | 高（フォールバック処理） | 低（単一テーブル） | **大幅簡素化** |

### 📊 削除対象テーブル
**19テーブルを削除・統合:**
- `rextrix_user_profiles` → `rextrix_cfo_profiles`に統合
- `rextrix_cfos` → `rextrix_cfo_profiles`に統合  
- `rextrix_cfo_profiles` → 新設計で再構築
- `rextrix_companies` → `rextrix_company_profiles`に統合
- `rextrix_company_profiles` → 新設計で再構築
- `rextrix_matches` → `rextrix_projects`に統合
- `rextrix_contracts` → `rextrix_projects`に統合
- `rextrix_messages` → `rextrix_interactions`に統合
- `rextrix_reviews` → `rextrix_interactions`に統合
- `rextrix_notifications` → `rextrix_interactions`に統合
- その他9テーブル → 削除（未実装のため）

---

## 2. 設計原則・方針

### 🏗️ アーキテクチャ原則

#### **1. Single Source of Truth (単一の真実の源)**
- 各エンティティの情報を1つのテーブルに統合
- データ重複の完全排除
- 整合性の保証

#### **2. JSONB First (JSONB優先戦略)**
- 構造化データはJSONBで効率的に格納
- PostgreSQLのJSONB機能をフル活用
- 柔軟性と性能の両立

#### **3. Performance by Design (設計による性能)**
- JOIN処理の最小化
- GINインデックスによる高速検索
- 単一クエリでの完結

#### **4. Simplicity & Maintainability (シンプル性・保守性)**
- 開発者が理解しやすい構造
- 新機能追加の容易性
- バグ発生源の削減

### 🎯 設計方針

#### **実用性重視**
- 実際に使用される機能に特化
- オーバーエンジニアリングの排除
- プロトタイプから本格運用への移行

#### **拡張性考慮**
- 将来的な機能追加に対応
- JSONB構造による柔軟性
- スキーマ変更の最小化

#### **開発効率最大化**
- API実装の簡素化
- テスト作成の効率化
- 新メンバーの学習コスト削減

---

## 3. 最適化テーブル設計

### 3.1 🔐 `rextrix_users` - 認証・基本情報テーブル

```sql
-- NextAuth.js統一済み、現状維持
CREATE TABLE rextrix_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NextAuth.js管理
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('cfo', 'company', 'admin')),
    email_verified BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'banned')),
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_users_email ON rextrix_users (email);
CREATE INDEX idx_users_type_status ON rextrix_users (user_type, status);
```

**設計ポイント:**
- ✅ 既存設計を維持（NextAuth.js統一済み）
- ✅ 認証専用テーブルとして単純化
- ✅ user_typeによる利用者種別管理

---

### 3.2 👨‍💼 `rextrix_cfo_profiles` - CFO統合プロフィールテーブル

```sql
-- 4テーブル統合: rextrix_cfos + rextrix_cfo_profiles + rextrix_user_profiles + 関連テーブル
CREATE TABLE rextrix_cfo_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES rextrix_users(id) ON DELETE CASCADE,
    
    -- === 基本識別情報 ===
    display_name VARCHAR(255) NOT NULL, -- 表示名（必須）
    nickname VARCHAR(100), -- ニックネーム
    email VARCHAR(255) NOT NULL, -- 表示用メール（rextrix_usersから同期）
    
    -- === CFO基本情報 ===
    title VARCHAR(500), -- 肩書き・専門分野要約
    experience_years INTEGER DEFAULT 0, -- 経験年数
    experience_summary TEXT, -- 詳細経歴
    introduction TEXT, -- 自己紹介文
    
    -- === ステータス・評価 ===
    is_available BOOLEAN DEFAULT true, -- 対応可能状況
    availability_status VARCHAR(50) DEFAULT 'available', -- available, busy, unavailable
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5), -- 平均評価
    review_count INTEGER DEFAULT 0, -- レビュー件数
    completed_projects INTEGER DEFAULT 0, -- 完了プロジェクト数
    
    -- === JSONB構造化データ ===
    location_data JSONB DEFAULT '{}', -- 居住地・対応エリア情報
    work_conditions JSONB DEFAULT '{}', -- 稼働条件・働き方
    compensation_data JSONB DEFAULT '{}', -- 報酬情報・料金体系
    specialties JSONB DEFAULT '[]', -- 専門分野配列
    certifications JSONB DEFAULT '[]', -- 資格・認定配列
    achievements JSONB DEFAULT '[]', -- 実績・成果配列
    work_history JSONB DEFAULT '[]', -- 職歴詳細配列
    skills JSONB DEFAULT '{}', -- スキル・ツール習熟度
    languages JSONB DEFAULT '[]', -- 対応言語
    contact_preferences JSONB DEFAULT '{}', -- 連絡方法・希望
    
    -- === 検索最適化 ===
    search_vector tsvector, -- フルテキスト検索用
    tags_for_search TEXT[], -- 検索タグ配列
    indexed_skills TEXT[], -- スキル検索用配列
    
    -- === メタデータ ===
    profile_completion_score INTEGER DEFAULT 0 CHECK (profile_completion_score >= 0 AND profile_completion_score <= 100), -- プロフィール完成度
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- 最終活動日時
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- === 制約 ===
    UNIQUE(user_id),
    UNIQUE(email)
);

-- インデックス最適化
CREATE INDEX idx_cfo_user_id ON rextrix_cfo_profiles (user_id);
CREATE INDEX idx_cfo_availability ON rextrix_cfo_profiles (is_available, availability_status);
CREATE INDEX idx_cfo_rating ON rextrix_cfo_profiles (rating DESC, review_count DESC);

-- JSONB検索用GINインデックス
CREATE INDEX idx_cfo_specialties_gin ON rextrix_cfo_profiles USING GIN (specialties);
CREATE INDEX idx_cfo_location_gin ON rextrix_cfo_profiles USING GIN (location_data);
CREATE INDEX idx_cfo_skills_gin ON rextrix_cfo_profiles USING GIN (skills);
CREATE INDEX idx_cfo_certifications_gin ON rextrix_cfo_profiles USING GIN (certifications);

-- フルテキスト検索インデックス
CREATE INDEX idx_cfo_search_vector_gin ON rextrix_cfo_profiles USING GIN (search_vector);

-- 配列検索インデックス
CREATE INDEX idx_cfo_search_tags_gin ON rextrix_cfo_profiles USING GIN (tags_for_search);
CREATE INDEX idx_cfo_indexed_skills_gin ON rextrix_cfo_profiles USING GIN (indexed_skills);

-- 複合インデックス
CREATE INDEX idx_cfo_location_availability ON rextrix_cfo_profiles 
    ((location_data->>'prefecture'), is_available);
```

**設計ポイント:**
- 🔄 **4テーブル統合**: CFO関連の全情報を統合
- 📊 **JSONB活用**: 構造化データを効率的に格納
- 🔍 **検索最適化**: GINインデックスによる高速検索
- 📈 **評価システム**: rating, review_count統合管理
- 🎯 **プロフィール完成度**: 自動計算による品質管理

---

### 3.3 🏢 `rextrix_company_profiles` - 企業統合プロフィールテーブル

```sql
-- 3テーブル統合: rextrix_companies + rextrix_company_profiles + rextrix_user_profiles
CREATE TABLE rextrix_company_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES rextrix_users(id) ON DELETE CASCADE,
    
    -- === 企業基本情報 ===
    company_name VARCHAR(255) NOT NULL, -- 企業名
    display_name VARCHAR(255), -- 担当者名
    email VARCHAR(255) NOT NULL, -- 表示用メール
    
    -- === 企業詳細 ===
    industry VARCHAR(255), -- 業界
    description TEXT, -- 企業説明
    website_url VARCHAR(500), -- ウェブサイト
    logo_url VARCHAR(500), -- ロゴ画像URL
    
    -- === ステータス ===
    is_hiring BOOLEAN DEFAULT true, -- CFO募集中
    hiring_status VARCHAR(50) DEFAULT 'active', -- active, paused, closed
    verification_status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected
    
    -- === JSONB構造化データ ===
    company_details JSONB DEFAULT '{}', -- 規模・売上・資金調達状況
    cfo_requirements JSONB DEFAULT '{}', -- CFO要求仕様・条件
    project_preferences JSONB DEFAULT '{}', -- プロジェクト希望条件
    contact_preferences JSONB DEFAULT '{}', -- 連絡方法・タイミング希望
    location_data JSONB DEFAULT '{}', -- 所在地・リモート対応
    compensation_budget JSONB DEFAULT '{}', -- 予算・報酬レンジ
    
    -- === 検索最適化 ===
    search_vector tsvector, -- フルテキスト検索用
    tags_for_search TEXT[], -- 検索タグ配列
    
    -- === メタデータ ===
    profile_completion_score INTEGER DEFAULT 0 CHECK (profile_completion_score >= 0 AND profile_completion_score <= 100),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- === 制約 ===
    UNIQUE(user_id),
    UNIQUE(email)
);

-- インデックス
CREATE INDEX idx_company_user_id ON rextrix_company_profiles (user_id);
CREATE INDEX idx_company_hiring ON rextrix_company_profiles (is_hiring, hiring_status);
CREATE INDEX idx_company_industry ON rextrix_company_profiles (industry);
CREATE INDEX idx_company_verification ON rextrix_company_profiles (verification_status);

-- JSONB検索用インデックス
CREATE INDEX idx_company_details_gin ON rextrix_company_profiles USING GIN (company_details);
CREATE INDEX idx_company_requirements_gin ON rextrix_company_profiles USING GIN (cfo_requirements);
CREATE INDEX idx_company_location_gin ON rextrix_company_profiles USING GIN (location_data);

-- フルテキスト検索インデックス
CREATE INDEX idx_company_search_vector_gin ON rextrix_company_profiles USING GIN (search_vector);
CREATE INDEX idx_company_search_tags_gin ON rextrix_company_profiles USING GIN (tags_for_search);
```

**設計ポイント:**
- 🏢 **企業情報統合**: 基本情報から詳細要件まで一元管理
- 🎯 **CFO要求仕様**: 求めるCFOの条件をJSONBで柔軟に管理
- ✅ **検証ステータス**: 企業の信頼性検証プロセス
- 💰 **予算管理**: CFO報酬予算の構造化管理

---

### 3.4 📋 `rextrix_projects` - プロジェクト・マッチング統合テーブル

```sql
-- 4テーブル統合: rextrix_projects + rextrix_matches + rextrix_contracts + 関連テーブル
CREATE TABLE rextrix_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES rextrix_company_profiles(id) ON DELETE CASCADE,
    cfo_id UUID REFERENCES rextrix_cfo_profiles(id) ON DELETE SET NULL,
    
    -- === プロジェクト基本情報 ===
    title VARCHAR(255) NOT NULL, -- プロジェクトタイトル
    description TEXT, -- 詳細説明
    project_type VARCHAR(100) DEFAULT 'consulting', -- consulting, interim, permanent
    urgency_level VARCHAR(50) DEFAULT 'medium', -- low, medium, high, urgent
    
    -- === ステータス管理 ===
    status VARCHAR(50) DEFAULT 'open', -- open, matched, negotiating, in_progress, completed, cancelled, on_hold
    phase VARCHAR(50) DEFAULT 'requirement', -- requirement, matching, contract, execution, review
    
    -- === マッチング情報 ===
    match_score DECIMAL(5,2), -- マッチング算出スコア
    match_algorithm_version VARCHAR(20), -- 使用したアルゴリズムバージョン
    matched_at TIMESTAMP WITH TIME ZONE, -- マッチング成立日時
    match_approval_status VARCHAR(50), -- pending, approved_by_company, approved_by_cfo, both_approved, rejected
    
    -- === 契約・実行情報 ===
    contract_data JSONB DEFAULT '{}', -- 契約条件・期間・報酬・成果物
    timeline_data JSONB DEFAULT '{}', -- スケジュール・マイルストーン
    deliverables JSONB DEFAULT '[]', -- 成果物・納期
    
    -- === 予算・報酬 ===
    budget_range_min INTEGER, -- 予算下限
    budget_range_max INTEGER, -- 予算上限
    agreed_compensation JSONB DEFAULT '{}', -- 合意済み報酬条件
    
    -- === 評価・フィードバック ===
    company_rating DECIMAL(3,2), -- 企業からCFOへの評価
    cfo_rating DECIMAL(3,2), -- CFOから企業への評価
    mutual_feedback JSONB DEFAULT '{}', -- 相互フィードバック
    
    -- === タイムライン ===
    requirement_finalized_at TIMESTAMP WITH TIME ZONE, -- 要件確定日
    contract_signed_at TIMESTAMP WITH TIME ZONE, -- 契約締結日
    work_started_at TIMESTAMP WITH TIME ZONE, -- 作業開始日
    work_completed_at TIMESTAMP WITH TIME ZONE, -- 作業完了日
    project_closed_at TIMESTAMP WITH TIME ZONE, -- プロジェクト終了日
    
    -- === メタデータ ===
    metadata JSONB DEFAULT '{}', -- その他のメタ情報
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_projects_company_id ON rextrix_projects (company_id);
CREATE INDEX idx_projects_cfo_id ON rextrix_projects (cfo_id);
CREATE INDEX idx_projects_status ON rextrix_projects (status, phase);
CREATE INDEX idx_projects_match_score ON rextrix_projects (match_score DESC) WHERE match_score IS NOT NULL;
CREATE INDEX idx_projects_timeline ON rextrix_projects (work_started_at, work_completed_at);

-- JSONB検索用インデックス
CREATE INDEX idx_projects_contract_gin ON rextrix_projects USING GIN (contract_data);
CREATE INDEX idx_projects_timeline_gin ON rextrix_projects USING GIN (timeline_data);
CREATE INDEX idx_projects_deliverables_gin ON rextrix_projects USING GIN (deliverables);

-- 複合インデックス（よく使用される組み合わせ）
CREATE INDEX idx_projects_company_status ON rextrix_projects (company_id, status);
CREATE INDEX idx_projects_cfo_status ON rextrix_projects (cfo_id, status) WHERE cfo_id IS NOT NULL;
```

**設計ポイント:**
- 📋 **統合管理**: プロジェクト・マッチング・契約を統一管理
- 🔄 **ステータス管理**: 詳細なプロジェクト進行状況管理
- 📊 **マッチング**: スコア・アルゴリズム管理
- 💼 **契約管理**: 契約条件・報酬をJSONBで柔軟に管理
- ⭐ **評価システム**: 相互評価・フィードバック統合

---

### 3.5 💬 `rextrix_interactions` - 全コミュニケーション統合テーブル

```sql
-- 4テーブル統合: rextrix_messages + rextrix_reviews + rextrix_notifications + 関連テーブル
CREATE TABLE rextrix_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- === 関連エンティティ ===
    project_id UUID REFERENCES rextrix_projects(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES rextrix_users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES rextrix_users(id) ON DELETE CASCADE,
    
    -- === インタラクション分類 ===
    interaction_type VARCHAR(50) NOT NULL, -- message, review, notification, status_update, system_alert
    interaction_subtype VARCHAR(50), -- 詳細分類 (direct_message, project_update, contract_notification等)
    
    -- === コンテンツ ===
    subject VARCHAR(255), -- 件名（通知・メッセージ用）
    content TEXT, -- メインコンテンツ
    content_format VARCHAR(20) DEFAULT 'plain', -- plain, markdown, html
    
    -- === 構造化データ ===
    metadata JSONB DEFAULT '{}', -- タイプ別の追加データ
    attachments JSONB DEFAULT '[]', -- 添付ファイル情報
    
    -- === ステータス管理 ===
    status VARCHAR(50) DEFAULT 'active', -- active, archived, deleted
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    
    -- === 配信・既読管理 ===
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- === レビュー専用フィールド ===
    rating DECIMAL(3,2) CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)), -- レビュー評価
    is_public BOOLEAN DEFAULT false, -- 公開レビューかどうか
    
    -- === 通知専用フィールド ===
    notification_channel VARCHAR(50), -- email, in_app, sms
    scheduled_at TIMESTAMP WITH TIME ZONE, -- 予約配信時刻
    
    -- === メタデータ ===
    expires_at TIMESTAMP WITH TIME ZONE, -- 有効期限（通知用）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_interactions_project ON rextrix_interactions (project_id);
CREATE INDEX idx_interactions_sender ON rextrix_interactions (sender_id);
CREATE INDEX idx_interactions_recipient ON rextrix_interactions (recipient_id);
CREATE INDEX idx_interactions_type ON rextrix_interactions (interaction_type, interaction_subtype);
CREATE INDEX idx_interactions_unread ON rextrix_interactions (recipient_id, is_read) WHERE is_read = false;
CREATE INDEX idx_interactions_timeline ON rextrix_interactions (created_at DESC);

-- JSONB検索用インデックス
CREATE INDEX idx_interactions_metadata_gin ON rextrix_interactions USING GIN (metadata);
CREATE INDEX idx_interactions_attachments_gin ON rextrix_interactions USING GIN (attachments);

-- レビュー検索用インデックス
CREATE INDEX idx_interactions_reviews ON rextrix_interactions (interaction_type, rating, is_public) 
    WHERE interaction_type = 'review';

-- 複合インデックス
CREATE INDEX idx_interactions_project_type ON rextrix_interactions (project_id, interaction_type);
CREATE INDEX idx_interactions_user_timeline ON rextrix_interactions (sender_id, recipient_id, created_at DESC);
```

**設計ポイント:**
- 💬 **統合コミュニケーション**: メッセージ・レビュー・通知を統一管理
- 📱 **チャネル管理**: 複数配信チャネル対応
- ⭐ **レビューシステム**: 評価・公開設定管理
- 🔔 **通知システム**: 予約配信・有効期限管理
- 📎 **添付ファイル**: JSONB配列による柔軟な添付管理

---

## 4. JSONB構造設計

### 4.1 CFOプロフィール JSONB 構造

#### `location_data` - 居住地・対応エリア情報
```json
{
  "residence": {
    "country": "日本",
    "prefecture": "千葉県", 
    "city": "千葉市",
    "details": "海浜幕張エリア"
  },
  "service_areas": {
    "primary": ["東京都", "千葉県"],
    "secondary": ["神奈川県", "埼玉県"],
    "remote_only": ["全国"],
    "international": ["アメリカ", "フィリピン"]
  },
  "preferences": {
    "remote_work": true,
    "on_site_work": true,
    "travel_domestic": true,
    "travel_international": true,
    "max_travel_days_per_month": 5
  },
  "time_zones": ["JST", "PST"] // 対応可能タイムゾーン
}
```

#### `work_conditions` - 稼働条件・働き方
```json
{
  "availability": {
    "weekly_hours_min": 10,
    "weekly_hours_max": 40,
    "flexible_schedule": true,
    "urgent_response": true
  },
  "work_style": {
    "primary": "リモート主体",
    "meeting_frequency": "週1-2回",
    "communication_tools": ["Zoom", "Slack", "Teams"],
    "working_hours": "9:00-18:00 JST",
    "timezone_flexibility": true
  },
  "project_preferences": {
    "max_concurrent_projects": 3,
    "preferred_project_duration": "3-6ヶ月",
    "minimum_engagement": "1ヶ月",
    "project_types": ["interim", "consulting", "advisory"]
  },
  "exclusions": {
    "industries": ["ギャンブル", "アダルト"],
    "company_sizes": [],
    "locations": []
  }
}
```

#### `compensation_data` - 報酬情報・料金体系
```json
{
  "base_rates": {
    "monthly_retainer_min": 100000,
    "monthly_retainer_max": 500000,
    "hourly_rate": null,
    "daily_rate": 50000,
    "currency": "JPY"
  },
  "performance_based": {
    "success_fee_percentage": 4,
    "equity_consideration": true,
    "revenue_sharing": false
  },
  "payment_terms": {
    "invoice_cycle": "monthly",
    "payment_terms_days": 30,
    "advance_payment": false,
    "expenses_separate": true
  },
  "negotiation": {
    "flexible_pricing": true,
    "volume_discount": true,
    "long_term_discount": true,
    "startup_friendly": true
  }
}
```

#### `specialties` - 専門分野配列
```json
[
  {
    "category": "M&A",
    "skills": ["クロスボーダーM&A", "M&A戦略", "DD", "PMI", "企業価値評価"],
    "experience_years": 10,
    "proficiency_level": "expert"
  },
  {
    "category": "資金調達",
    "skills": ["VC調達", "銀行融資", "IPO準備", "事業計画策定"],
    "experience_years": 8,
    "proficiency_level": "advanced"
  },
  {
    "category": "海外事業",
    "skills": ["US上場サポート", "海外進出", "現地法人設立", "為替管理"],
    "experience_years": 15,
    "proficiency_level": "expert"
  }
]
```

#### `work_history` - 職歴詳細配列
```json
[
  {
    "period": {
      "start_date": "2001-04",
      "end_date": "2001-10",
      "is_current": false
    },
    "company": {
      "name": "全国共済農業協同組合会",
      "department": "全国本部 事務企画部",
      "industry": "金融・保険"
    },
    "position": {
      "title": "事務企画担当",
      "level": "staff",
      "responsibilities": ["JA共済の全国本部にて事務企画業務"]
    },
    "achievements": [
      "全国規模での事務プロセス改善",
      "企画業務の効率化"
    ],
    "skills_gained": ["事務企画", "組織運営", "プロセス改善"]
  },
  {
    "period": {
      "start_date": "2010-01",
      "end_date": "2016-12",
      "is_current": false
    },
    "company": {
      "name": "株式会社ファーストウェルネス",
      "department": null,
      "industry": "教育・サービス"
    },
    "position": {
      "title": "代表取締役",
      "level": "executive",
      "responsibilities": [
        "テニススクール事業の経営",
        "3エリア展開の統括管理",
        "フィリピン・セブ島での語学学校運営"
      ]
    },
    "achievements": [
      "北柏、用賀、高津の3エリアでテニススクール展開",
      "フィリピン・セブ島に英語留学学校2校設立",
      "M&Aによる売却成功"
    ],
    "skills_gained": ["事業経営", "多拠点管理", "海外事業展開", "M&A"]
  }
]
```

### 4.2 企業プロフィール JSONB 構造

#### `company_details` - 企業詳細情報
```json
{
  "basic_info": {
    "founded_year": 2020,
    "employee_count": 50,
    "annual_revenue": 500000000,
    "headquarters": "東京都渋谷区",
    "business_model": "SaaS"
  },
  "financial_status": {
    "funding_stage": "Series A",
    "total_funding": 300000000,
    "last_funding_date": "2024-06-01",
    "profitability": "break_even",
    "growth_rate": 150
  },
  "organization": {
    "departments": ["Engineering", "Sales", "Marketing", "Finance"],
    "management_team_size": 5,
    "board_members": 3,
    "advisors": 2
  }
}
```

#### `cfo_requirements` - CFO要求仕様
```json
{
  "role_type": "interim", // interim, permanent, consulting
  "urgency": "high",
  "start_date": "2024-09-01",
  "engagement_duration": "6-12ヶ月",
  "required_experience": {
    "minimum_years": 10,
    "industry_experience": ["SaaS", "IT"],
    "company_stage": ["startup", "growth"],
    "must_have_skills": ["資金調達", "IPO準備", "管理会計"],
    "nice_to_have_skills": ["M&A", "海外事業"]
  },
  "working_conditions": {
    "location_requirement": "ハイブリッド",
    "meeting_frequency": "週2-3回",
    "reporting_to": "CEO",
    "team_size": 3
  },
  "compensation_budget": {
    "monthly_budget_min": 800000,
    "monthly_budget_max": 1500000,
    "equity_offering": true,
    "benefits": ["交通費", "リモート手当"]
  }
}
```

### 4.3 プロジェクト JSONB 構造

#### `contract_data` - 契約条件・期間・報酬
```json
{
  "contract_terms": {
    "type": "consulting", // consulting, interim, permanent
    "duration_months": 6,
    "start_date": "2024-08-01",
    "end_date": "2025-02-01",
    "extension_option": true,
    "termination_notice_days": 30
  },
  "compensation": {
    "base_monthly": 1200000,
    "performance_bonus": 200000,
    "success_fee": 0.02,
    "equity_percentage": 0.5,
    "payment_schedule": "monthly",
    "expense_policy": "separate_billing"
  },
  "scope_of_work": {
    "primary_responsibilities": [
      "財務戦略策定",
      "資金調達支援",
      "IPO準備"
    ],
    "deliverables": [
      "月次財務報告書",
      "資金調達計画書",
      "IPO準備ロードマップ"
    ],
    "exclusions": ["日常経理業務", "税務申告"]
  },
  "working_arrangement": {
    "work_location": "ハイブリッド",
    "office_days_per_week": 2,
    "core_hours": "10:00-16:00",
    "meeting_schedule": "週2回定例会議"
  }
}
```

#### `timeline_data` - スケジュール・マイルストーン
```json
{
  "phases": [
    {
      "phase_name": "Assessment & Planning",
      "start_date": "2024-08-01",
      "end_date": "2024-08-31",
      "milestones": [
        {
          "name": "現状分析完了",
          "due_date": "2024-08-15",
          "status": "completed",
          "deliverable": "財務現状分析レポート"
        },
        {
          "name": "戦略計画策定",
          "due_date": "2024-08-31",
          "status": "in_progress",
          "deliverable": "財務戦略計画書"
        }
      ]
    },
    {
      "phase_name": "Implementation",
      "start_date": "2024-09-01",
      "end_date": "2024-12-31",
      "milestones": [
        {
          "name": "資金調達ラウンド完了",
          "due_date": "2024-10-31",
          "status": "pending",
          "deliverable": "調達完了報告書"
        }
      ]
    }
  ],
  "critical_dates": [
    {
      "date": "2024-09-30",
      "event": "Q3決算",
      "importance": "high"
    },
    {
      "date": "2024-11-15",
      "event": "投資家プレゼン",
      "importance": "critical"
    }
  ]
}
```

---

## 5. パフォーマンス最適化

### 5.1 インデックス戦略

#### **GINインデックス（JSONB検索）**
```sql
-- CFOプロフィールのJSONB検索最適化
CREATE INDEX idx_cfo_specialties_gin ON rextrix_cfo_profiles USING GIN (specialties);
CREATE INDEX idx_cfo_location_gin ON rextrix_cfo_profiles USING GIN (location_data);
CREATE INDEX idx_cfo_work_conditions_gin ON rextrix_cfo_profiles USING GIN (work_conditions);
CREATE INDEX idx_cfo_compensation_gin ON rextrix_cfo_profiles USING GIN (compensation_data);

-- 企業プロフィールのJSONB検索最適化
CREATE INDEX idx_company_details_gin ON rextrix_company_profiles USING GIN (company_details);
CREATE INDEX idx_company_requirements_gin ON rextrix_company_profiles USING GIN (cfo_requirements);

-- プロジェクトのJSONB検索最適化
CREATE INDEX idx_projects_contract_gin ON rextrix_projects USING GIN (contract_data);
CREATE INDEX idx_projects_timeline_gin ON rextrix_projects USING GIN (timeline_data);
```

#### **複合インデックス（頻繁な検索パターン）**
```sql
-- CFOの可用性 × 地域検索
CREATE INDEX idx_cfo_availability_location ON rextrix_cfo_profiles 
    (is_available, (location_data->>'prefecture'));

-- CFOの評価 × 専門分野検索
CREATE INDEX idx_cfo_rating_specialties ON rextrix_cfo_profiles 
    (rating DESC, (specialties->0->>'category'));

-- 企業の募集状況 × 業界検索
CREATE INDEX idx_company_hiring_industry ON rextrix_company_profiles 
    (is_hiring, industry);

-- プロジェクトのステータス × 進行段階
CREATE INDEX idx_projects_status_phase ON rextrix_projects 
    (status, phase);
```

#### **フルテキスト検索最適化**
```sql
-- 検索ベクトル自動更新トリガー
CREATE OR REPLACE FUNCTION update_cfo_search_vector() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('japanese', COALESCE(NEW.display_name, '')), 'A') ||
        setweight(to_tsvector('japanese', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('japanese', COALESCE(NEW.introduction, '')), 'B') ||
        setweight(to_tsvector('japanese', COALESCE(NEW.experience_summary, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cfo_search_vector
    BEFORE INSERT OR UPDATE ON rextrix_cfo_profiles
    FOR EACH ROW EXECUTE FUNCTION update_cfo_search_vector();
```

### 5.2 クエリ最適化例

#### **高速CFO検索クエリ**
```sql
-- 専門分野 × 地域 × 可用性での検索
SELECT 
    id, display_name, title, rating, 
    specialties, location_data->>'prefecture' as prefecture
FROM rextrix_cfo_profiles 
WHERE 
    specialties @> '[{"category": "M&A"}]'  -- JSONB包含検索
    AND location_data->>'prefecture' = '東京都'  -- JSONB属性検索
    AND is_available = true
    AND rating >= 4.0
ORDER BY rating DESC, review_count DESC
LIMIT 20;

-- 実行計画: GINインデックス使用、高速実行
```

#### **複合条件でのマッチング検索**
```sql
-- CFO要求条件に基づく候補検索
WITH company_requirements AS (
    SELECT cfo_requirements 
    FROM rextrix_company_profiles 
    WHERE id = $1
)
SELECT 
    c.id, c.display_name, c.title,
    -- マッチングスコア計算
    CASE 
        WHEN c.specialties @> (cr.cfo_requirements->'required_experience'->'must_have_skills') 
        THEN 100 
        ELSE 50 
    END as match_score
FROM rextrix_cfo_profiles c, company_requirements cr
WHERE 
    c.is_available = true
    AND c.experience_years >= (cr.cfo_requirements->'required_experience'->>'minimum_years')::int
    AND c.location_data->>'prefecture' = ANY(
        SELECT jsonb_array_elements_text(cr.cfo_requirements->'working_conditions'->'preferred_locations')
    )
ORDER BY match_score DESC, c.rating DESC;
```

### 5.3 パーティショニング戦略

#### **インタラクションテーブルのパーティショニング**
```sql
-- 月別パーティショニングでパフォーマンス向上
CREATE TABLE rextrix_interactions_202407 PARTITION OF rextrix_interactions
    FOR VALUES FROM ('2024-07-01') TO ('2024-08-01');

CREATE TABLE rextrix_interactions_202408 PARTITION OF rextrix_interactions
    FOR VALUES FROM ('2024-08-01') TO ('2024-09-01');

-- 自動パーティション作成関数
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS void AS $$
DECLARE
    start_date date;
    end_date date;
    partition_name text;
BEGIN
    start_date := date_trunc('month', CURRENT_DATE);
    end_date := start_date + interval '1 month';
    partition_name := 'rextrix_interactions_' || to_char(start_date, 'YYYYMM');
    
    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF rextrix_interactions
                   FOR VALUES FROM (%L) TO (%L)',
                   partition_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;
```

---

## 6. 移行戦略

### 6.1 段階的移行計画

#### **Phase 1: 準備段階（2週間）**

**Week 1: データ分析・移行設計**
```sql
-- 既存データ量・品質分析
SELECT 
    'rextrix_cfos' as table_name,
    COUNT(*) as record_count,
    COUNT(CASE WHEN title IS NOT NULL THEN 1 END) as title_filled,
    COUNT(CASE WHEN specialties != '[]' THEN 1 END) as specialties_filled
FROM rextrix_cfos
UNION ALL
SELECT 
    'rextrix_user_profiles',
    COUNT(*),
    COUNT(CASE WHEN display_name IS NOT NULL THEN 1 END),
    COUNT(CASE WHEN region IS NOT NULL THEN 1 END)
FROM rextrix_user_profiles;

-- データ品質レポート生成
WITH data_quality AS (
    SELECT 
        c.id,
        c.user_id,
        CASE WHEN c.title IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN c.experience_summary IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN c.specialties != '[]' THEN 1 ELSE 0 END +
        CASE WHEN up.display_name IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN up.region IS NOT NULL THEN 1 ELSE 0 END as quality_score
    FROM rextrix_cfos c
    LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id
)
SELECT 
    quality_score,
    COUNT(*) as cfo_count,
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) as percentage
FROM data_quality 
GROUP BY quality_score 
ORDER BY quality_score DESC;
```

**Week 2: 移行スクリプト作成・テスト**

#### **Phase 2: テストDBでの移行実行（1週間）**

**新テーブル作成・データ移行**
```sql
-- Step 1: 新テーブル作成
\i create_optimized_tables.sql

-- Step 2: CFOプロフィール統合移行
INSERT INTO rextrix_cfo_profiles (
    user_id, display_name, nickname, email, title, experience_years,
    experience_summary, introduction, is_available, rating, review_count,
    specialties, certifications, achievements,
    location_data, work_conditions, compensation_data,
    profile_completion_score, created_at, updated_at
)
SELECT 
    c.user_id,
    COALESCE(up.display_name, u.email) as display_name,
    up.nickname,
    u.email,
    c.title,
    c.experience_years,
    c.experience_summary,
    COALESCE(up.introduction, '自己紹介未設定') as introduction,
    c.is_available,
    c.rating,
    c.review_count,
    c.specialties,
    c.certifications,
    c.achievements,
    -- location_data構築
    jsonb_build_object(
        'residence', jsonb_build_object(
            'prefecture', COALESCE(up.region, '未設定'),
            'country', '日本'
        ),
        'service_areas', jsonb_build_object(
            'primary', ARRAY[COALESCE(up.region, '全国')],
            'remote_only', ARRAY['全国']
        ),
        'preferences', jsonb_build_object(
            'remote_work', true,
            'on_site_work', true
        )
    ) as location_data,
    -- work_conditions構築
    jsonb_build_object(
        'availability', jsonb_build_object(
            'weekly_hours_min', 10,
            'weekly_hours_max', 40,
            'flexible_schedule', true
        ),
        'work_style', jsonb_build_object(
            'primary', COALESCE(up.work_preference, 'リモート可'),
            'timezone_flexibility', true
        ),
        'project_preferences', jsonb_build_object(
            'max_concurrent_projects', COALESCE(c.max_concurrent_projects, 3)
        )
    ) as work_conditions,
    -- compensation_data構築
    jsonb_build_object(
        'base_rates', jsonb_build_object(
            'description', COALESCE(up.compensation_range, '応相談'),
            'currency', 'JPY'
        ),
        'negotiation', jsonb_build_object(
            'flexible_pricing', true
        )
    ) as compensation_data,
    -- プロフィール完成度計算
    (
        CASE WHEN up.display_name IS NOT NULL THEN 15 ELSE 0 END +
        CASE WHEN c.title IS NOT NULL THEN 15 ELSE 0 END +
        CASE WHEN c.experience_summary IS NOT NULL THEN 20 ELSE 0 END +
        CASE WHEN c.specialties != '[]' THEN 20 ELSE 0 END +
        CASE WHEN up.introduction IS NOT NULL THEN 15 ELSE 0 END +
        CASE WHEN up.region IS NOT NULL THEN 10 ELSE 0 END +
        CASE WHEN up.work_preference IS NOT NULL THEN 5 ELSE 0 END
    ) as profile_completion_score,
    c.created_at,
    c.updated_at
FROM rextrix_cfos c
INNER JOIN rextrix_users u ON c.user_id = u.id
LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id
WHERE u.user_type = 'cfo';

-- データ移行検証
SELECT 
    'CFO移行結果' as check_type,
    COUNT(*) as migrated_count,
    AVG(profile_completion_score) as avg_completion,
    COUNT(CASE WHEN specialties != '[]' THEN 1 END) as specialties_count
FROM rextrix_cfo_profiles;
```

#### **Phase 3: 本番移行実行（1週間）**

**API切り替え・動作確認**
```typescript
// 旧API（複数JOIN）
const cfos = await supabase
  .from('rextrix_cfos')
  .select(`
    *,
    rextrix_user_profiles(*),
    rextrix_cfo_profiles(*)
  `);

// 新API（単一テーブル）
const cfos = await supabase
  .from('rextrix_cfo_profiles')
  .select('*')
  .eq('is_available', true);
```

### 6.2 ロールバック戦略

#### **段階的ロールバック計画**
```sql
-- バックアップテーブル作成
CREATE TABLE backup_rextrix_cfos AS SELECT * FROM rextrix_cfos;
CREATE TABLE backup_rextrix_user_profiles AS SELECT * FROM rextrix_user_profiles;

-- ロールバック実行
DROP TABLE IF EXISTS rextrix_cfo_profiles;
RENAME TABLE backup_rextrix_cfos TO rextrix_cfos;
RENAME TABLE backup_rextrix_user_profiles TO rextrix_user_profiles;
```

### 6.3 リスク軽減策

#### **データ整合性保証**
```sql
-- 移行後整合性チェック関数
CREATE OR REPLACE FUNCTION validate_migration()
RETURNS TABLE(check_name text, status text, details text) AS $$
BEGIN
    -- CFO数の一致確認
    RETURN QUERY
    SELECT 
        'CFO_COUNT_MATCH'::text,
        CASE 
            WHEN old_count = new_count THEN 'PASS'::text 
            ELSE 'FAIL'::text 
        END,
        format('旧:%s 新:%s', old_count, new_count)::text
    FROM (
        SELECT 
            (SELECT COUNT(*) FROM rextrix_cfos) as old_count,
            (SELECT COUNT(*) FROM rextrix_cfo_profiles) as new_count
    ) counts;
    
    -- データ品質スコア確認
    RETURN QUERY
    SELECT 
        'QUALITY_IMPROVEMENT'::text,
        CASE 
            WHEN avg_score >= 60 THEN 'PASS'::text 
            ELSE 'WARN'::text 
        END,
        format('平均完成度:%s%%', ROUND(avg_score, 1))::text
    FROM (
        SELECT AVG(profile_completion_score) as avg_score 
        FROM rextrix_cfo_profiles
    ) scores;
END;
$$ LANGUAGE plpgsql;

-- 実行: SELECT * FROM validate_migration();
```

---

## 7. 実装例・コードサンプル

### 7.1 API実装例

#### **CFO一覧取得API（最適化後）**
```typescript
// app/api/cfos/route.ts - 新しい最適化版
import { createClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const specialties = searchParams.get('specialties')?.split(',') || [];
  const prefecture = searchParams.get('prefecture');
  const minRating = parseFloat(searchParams.get('min_rating') || '0');
  
  const supabase = createClient();
  
  try {
    let query = supabase
      .from('rextrix_cfo_profiles')
      .select(`
        id,
        display_name,
        title,
        experience_years,
        rating,
        review_count,
        specialties,
        location_data,
        work_conditions,
        compensation_data,
        is_available,
        profile_completion_score
      `)
      .eq('is_available', true)
      .gte('rating', minRating)
      .range((page - 1) * limit, page * limit - 1)
      .order('rating', { ascending: false })
      .order('review_count', { ascending: false });

    // 専門分野フィルター（JSONB検索）
    if (specialties.length > 0) {
      const specialtyFilter = specialties.map(s => `{"category": "${s}"}`).join(',');
      query = query.or(`specialties.cs.[${specialtyFilter}]`);
    }

    // 地域フィルター（JSONB属性検索）
    if (prefecture) {
      query = query.eq('location_data->residence->>prefecture', prefecture);
    }

    const { data: cfos, error, count } = await query;

    if (error) {
      console.error('CFO取得エラー:', error);
      return NextResponse.json(
        { error: 'CFO情報の取得に失敗しました' },
        { status: 500 }
      );
    }

    // レスポンス形式整理
    const formattedCfos = cfos?.map(cfo => ({
      id: cfo.id,
      name: cfo.display_name,
      title: cfo.title,
      experience_years: cfo.experience_years,
      rating: cfo.rating,
      review_count: cfo.review_count,
      location: cfo.location_data?.residence?.prefecture || '未設定',
      remote_available: cfo.work_conditions?.preferences?.remote_work || false,
      specialties: cfo.specialties?.map((s: any) => s.category) || [],
      compensation_range: cfo.compensation_data?.base_rates?.description || '応相談',
      profile_completion: cfo.profile_completion_score,
      available: cfo.is_available
    })) || [];

    return NextResponse.json({
      cfos: formattedCfos,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('予期しないエラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
```

#### **CFO詳細取得API**
```typescript
// app/api/cfos/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  
  try {
    const { data: cfo, error } = await supabase
      .from('rextrix_cfo_profiles')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !cfo) {
      return NextResponse.json(
        { error: 'CFOが見つかりません' },
        { status: 404 }
      );
    }

    // 詳細情報フォーマット
    const detailedCfo = {
      basic_info: {
        id: cfo.id,
        name: cfo.display_name,
        nickname: cfo.nickname,
        title: cfo.title,
        experience_years: cfo.experience_years,
        introduction: cfo.introduction
      },
      professional: {
        specialties: cfo.specialties,
        certifications: cfo.certifications,
        achievements: cfo.achievements,
        work_history: cfo.work_history
      },
      availability: {
        is_available: cfo.is_available,
        status: cfo.availability_status,
        work_conditions: cfo.work_conditions
      },
      location: cfo.location_data,
      compensation: cfo.compensation_data,
      metrics: {
        rating: cfo.rating,
        review_count: cfo.review_count,
        completed_projects: cfo.completed_projects,
        profile_completion: cfo.profile_completion_score
      }
    };

    return NextResponse.json({ cfo: detailedCfo });

  } catch (error) {
    console.error('CFO詳細取得エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
```

### 7.2 フロントエンド実装例

#### **CFO検索コンポーネント**
```tsx
// components/CFOSearch.tsx
'use client';

import { useState, useEffect } from 'react';
import { CFOProfile } from '@/types/database';

interface SearchFilters {
  specialties: string[];
  prefecture: string;
  minRating: number;
  availability: boolean;
}

export default function CFOSearch() {
  const [cfos, setCfos] = useState<CFOProfile[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    specialties: [],
    prefecture: '',
    minRating: 0,
    availability: true
  });
  const [loading, setLoading] = useState(false);

  const searchCFOs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.specialties.length > 0) {
        params.set('specialties', filters.specialties.join(','));
      }
      if (filters.prefecture) {
        params.set('prefecture', filters.prefecture);
      }
      if (filters.minRating > 0) {
        params.set('min_rating', filters.minRating.toString());
      }

      const response = await fetch(`/api/cfos?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        setCfos(data.cfos);
      } else {
        console.error('検索エラー:', data.error);
      }
    } catch (error) {
      console.error('検索失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchCFOs();
  }, [filters]);

  return (
    <div className="cfo-search">
      {/* 検索フィルター */}
      <div className="search-filters">
        <div className="filter-group">
          <label>専門分野</label>
          <select
            multiple
            value={filters.specialties}
            onChange={(e) => setFilters({
              ...filters,
              specialties: Array.from(e.target.selectedOptions, option => option.value)
            })}
          >
            <option value="M&A">M&A</option>
            <option value="資金調達">資金調達</option>
            <option value="IPO">IPO</option>
            <option value="海外事業">海外事業</option>
          </select>
        </div>

        <div className="filter-group">
          <label>地域</label>
          <select
            value={filters.prefecture}
            onChange={(e) => setFilters({ ...filters, prefecture: e.target.value })}
          >
            <option value="">全国</option>
            <option value="東京都">東京都</option>
            <option value="大阪府">大阪府</option>
            <option value="愛知県">愛知県</option>
          </select>
        </div>

        <div className="filter-group">
          <label>最低評価</label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.5"
            value={filters.minRating}
            onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
          />
          <span>{filters.minRating}以上</span>
        </div>
      </div>

      {/* 検索結果 */}
      <div className="search-results">
        {loading ? (
          <div className="loading">検索中...</div>
        ) : (
          <div className="cfo-grid">
            {cfos.map(cfo => (
              <CFOCard key={cfo.id} cfo={cfo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// CFOカードコンポーネント
function CFOCard({ cfo }: { cfo: CFOProfile }) {
  return (
    <div className="cfo-card">
      <div className="cfo-header">
        <h3>{cfo.name}</h3>
        <div className="rating">
          ⭐ {cfo.rating} ({cfo.review_count}件)
        </div>
      </div>
      
      <div className="cfo-info">
        <p className="title">{cfo.title}</p>
        <p className="experience">{cfo.experience_years}年の経験</p>
        <p className="location">📍 {cfo.location}</p>
        
        <div className="specialties">
          {cfo.specialties.map(specialty => (
            <span key={specialty} className="specialty-tag">
              {specialty}
            </span>
          ))}
        </div>
        
        <div className="compensation">
          💰 {cfo.compensation_range}
        </div>
      </div>

      <div className="cfo-actions">
        <button className="contact-btn">連絡する</button>
        <button className="profile-btn">詳細を見る</button>
      </div>
    </div>
  );
}
```

### 7.3 データベース関数・トリガー

#### **プロフィール完成度自動計算**
```sql
-- プロフィール完成度計算関数
CREATE OR REPLACE FUNCTION calculate_profile_completion_score(
    p_display_name TEXT,
    p_title TEXT,
    p_experience_summary TEXT,
    p_introduction TEXT,
    p_specialties JSONB,
    p_certifications JSONB,
    p_location_data JSONB,
    p_work_conditions JSONB,
    p_compensation_data JSONB
) RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
BEGIN
    -- 基本情報（40点）
    IF p_display_name IS NOT NULL AND LENGTH(p_display_name) > 0 THEN
        score := score + 10;
    END IF;
    
    IF p_title IS NOT NULL AND LENGTH(p_title) > 0 THEN
        score := score + 10;
    END IF;
    
    IF p_introduction IS NOT NULL AND LENGTH(p_introduction) >= 50 THEN
        score := score + 20;
    END IF;
    
    -- 専門情報（30点）
    IF p_experience_summary IS NOT NULL AND LENGTH(p_experience_summary) >= 100 THEN
        score := score + 15;
    END IF;
    
    IF p_specialties IS NOT NULL AND jsonb_array_length(p_specialties) > 0 THEN
        score := score + 15;
    END IF;
    
    -- 詳細情報（30点）
    IF p_certifications IS NOT NULL AND jsonb_array_length(p_certifications) > 0 THEN
        score := score + 10;
    END IF;
    
    IF p_location_data IS NOT NULL AND p_location_data != '{}' THEN
        score := score + 10;
    END IF;
    
    IF p_work_conditions IS NOT NULL AND p_work_conditions != '{}' THEN
        score := score + 5;
    END IF;
    
    IF p_compensation_data IS NOT NULL AND p_compensation_data != '{}' THEN
        score := score + 5;
    END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- 自動更新トリガー
CREATE OR REPLACE FUNCTION update_cfo_profile_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- プロフィール完成度更新
    NEW.profile_completion_score := calculate_profile_completion_score(
        NEW.display_name,
        NEW.title,
        NEW.experience_summary,
        NEW.introduction,
        NEW.specialties,
        NEW.certifications,
        NEW.location_data,
        NEW.work_conditions,
        NEW.compensation_data
    );
    
    -- 検索用タグ配列更新
    NEW.tags_for_search := ARRAY(
        SELECT DISTINCT unnest(ARRAY[
            NEW.display_name,
            NEW.title,
            NEW.location_data->>'residence'->>'prefecture'
        ] || 
        ARRAY(SELECT jsonb_array_elements_text(NEW.specialties->'category')) ||
        ARRAY(SELECT jsonb_array_elements_text(NEW.certifications))
        )
        WHERE unnest IS NOT NULL AND LENGTH(unnest) > 0
    );
    
    -- 最終活動日時更新
    NEW.last_activity_at := NOW();
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cfo_profile_metrics
    BEFORE INSERT OR UPDATE ON rextrix_cfo_profiles
    FOR EACH ROW EXECUTE FUNCTION update_cfo_profile_metrics();
```

#### **マッチングスコア計算関数**
```sql
-- CFO-企業マッチングスコア計算
CREATE OR REPLACE FUNCTION calculate_matching_score(
    cfo_profile_id UUID,
    company_profile_id UUID
) RETURNS DECIMAL(5,2) AS $$
DECLARE
    cfo_rec RECORD;
    company_rec RECORD;
    score DECIMAL(5,2) := 0;
    max_score DECIMAL(5,2) := 100;
BEGIN
    -- CFOプロフィール取得
    SELECT * INTO cfo_rec 
    FROM rextrix_cfo_profiles 
    WHERE id = cfo_profile_id;
    
    -- 企業プロフィール取得
    SELECT * INTO company_rec 
    FROM rextrix_company_profiles 
    WHERE id = company_profile_id;
    
    -- 専門分野マッチング（40点）
    IF cfo_rec.specialties @> (company_rec.cfo_requirements->'required_experience'->'must_have_skills') THEN
        score := score + 40;
    ELSIF cfo_rec.specialties && (company_rec.cfo_requirements->'required_experience'->'must_have_skills') THEN
        score := score + 20;
    END IF;
    
    -- 経験年数マッチング（20点）
    IF cfo_rec.experience_years >= (company_rec.cfo_requirements->'required_experience'->>'minimum_years')::INTEGER THEN
        score := score + 20;
    ELSIF cfo_rec.experience_years >= (company_rec.cfo_requirements->'required_experience'->>'minimum_years')::INTEGER - 2 THEN
        score := score + 10;
    END IF;
    
    -- 地域マッチング（20点）
    IF cfo_rec.location_data->'service_areas'->'primary' @> 
       jsonb_build_array(company_rec.location_data->>'prefecture') THEN
        score := score + 20;
    ELSIF cfo_rec.work_conditions->'preferences'->>'remote_work' = 'true' THEN
        score := score + 15;
    END IF;
    
    -- 評価・実績マッチング（20点）
    IF cfo_rec.rating >= 4.5 THEN
        score := score + 20;
    ELSIF cfo_rec.rating >= 4.0 THEN
        score := score + 15;
    ELSIF cfo_rec.rating >= 3.5 THEN
        score := score + 10;
    END IF;
    
    RETURN LEAST(score, max_score);
END;
$$ LANGUAGE plpgsql;
```

---

## 8. 期待効果・評価指標

### 8.1 技術的効果

#### **パフォーマンス改善**
| 指標 | 現在 | 最適化後 | 改善率 |
|---|---|---|---|
| **CFO一覧API応答時間** | 300-500ms | 50-100ms | **70-80%短縮** |
| **CFO詳細API応答時間** | 200-400ms | 30-80ms | **75-85%短縮** |
| **データベースクエリ数** | 3-4クエリ/リクエスト | 1クエリ/リクエスト | **75%削減** |
| **JOIN処理回数** | 平均3回 | 0-1回 | **90%削減** |

#### **開発効率改善**
| 項目 | 現在 | 最適化後 | 改善効果 |
|---|---|---|---|
| **新機能開発時間** | 3-5日 | 1-2日 | **50-60%短縮** |
| **API実装複雑度** | 高（フォールバック処理） | 低（単純クエリ） | **大幅簡素化** |
| **テスト作成時間** | 2-3日 | 0.5-1日 | **60-70%短縮** |
| **バグ修正時間** | 1-2日 | 0.5日 | **50-75%短縮** |

### 8.2 ビジネス効果

#### **ユーザー体験改善**
- ✅ **検索レスポンス**: 3-5倍高速化
- ✅ **プロフィール完成度**: 自動計算による品質向上
- ✅ **マッチング精度**: 構造化データによる改善
- ✅ **データ整合性**: 単一テーブルによる完全保証

#### **運用コスト削減**
- ✅ **保守工数**: 50-70%削減
- ✅ **新人教育**: 学習コストの大幅削減
- ✅ **インフラコスト**: 効率的なクエリによる負荷削減
- ✅ **バグ対応**: データ不整合の根絶

### 8.3 KPI・評価指標

#### **技術KPI**
```sql
-- パフォーマンス監視クエリ
WITH performance_metrics AS (
    SELECT 
        'api_response_time' as metric,
        AVG(response_time_ms) as value,
        'CFO一覧API平均応答時間' as description
    FROM api_performance_logs 
    WHERE endpoint = '/api/cfos' 
      AND created_at >= NOW() - INTERVAL '24 hours'
    
    UNION ALL
    
    SELECT 
        'query_efficiency',
        AVG(query_count_per_request),
        'リクエストあたり平均クエリ数'
    FROM api_performance_logs 
    WHERE created_at >= NOW() - INTERVAL '24 hours'
),
quality_metrics AS (
    SELECT 
        'profile_completion' as metric,
        AVG(profile_completion_score) as value,
        'CFOプロフィール平均完成度' as description
    FROM rextrix_cfo_profiles
    
    UNION ALL
    
    SELECT 
        'data_consistency',
        COUNT(CASE WHEN display_name IS NOT NULL THEN 1 END) * 100.0 / COUNT(*),
        '基本データ完成率'
    FROM rextrix_cfo_profiles
)
SELECT * FROM performance_metrics
UNION ALL
SELECT * FROM quality_metrics;
```

#### **ビジネスKPI**
```sql
-- ビジネス効果測定
SELECT 
    'monthly_active_cfos' as kpi,
    COUNT(DISTINCT cfo_id) as value,
    '月間アクティブCFO数' as description
FROM rextrix_interactions 
WHERE created_at >= date_trunc('month', CURRENT_DATE)
  AND interaction_type = 'message'

UNION ALL

SELECT 
    'successful_matches',
    COUNT(*),
    '今月のマッチング成功数'
FROM rextrix_projects 
WHERE status = 'in_progress'
  AND matched_at >= date_trunc('month', CURRENT_DATE)

UNION ALL

SELECT 
    'avg_match_score',
    AVG(match_score),
    '平均マッチングスコア'
FROM rextrix_projects 
WHERE match_score IS NOT NULL
  AND created_at >= NOW() - INTERVAL '30 days';
```

### 8.4 成功基準

#### **Phase 1成功基準（移行完了）**
- ✅ データ移行完了率: 100%
- ✅ データ整合性: エラー0件
- ✅ API動作確認: 全エンドポイント正常
- ✅ パフォーマンステスト: 応答時間50%改善

#### **Phase 2成功基準（安定稼働）**
- ✅ システム稼働率: 99.9%以上
- ✅ API応答時間: 100ms以下維持
- ✅ データ品質: プロフィール完成度70%以上
- ✅ 開発効率: 新機能開発時間50%短縮

#### **Phase 3成功基準（最適化完了）**
- ✅ ユーザー満足度: 検索・マッチング機能評価向上
- ✅ ビジネス成果: マッチング成功率向上
- ✅ 運用効率: 保守工数50%削減
- ✅ 技術負債: 複雑性の大幅解消

---

## まとめ

この最適化設計により、CFOマッチングプラットフォームのデータベース構造を **24テーブルから5テーブルに79%削減** し、シンプルで高性能なシステムへと進化させることができます。

### 🎯 主要な改善点
1. **単一責任原則**: 各テーブルが明確な役割を持つ
2. **JSONB活用**: 柔軟性と性能を両立
3. **JOIN削減**: 複雑な関連処理の排除
4. **検索最適化**: GINインデックスによる高速検索
5. **保守性向上**: シンプルな構造による管理容易性

### 🚀 期待される成果
- **開発効率**: 50-70%向上
- **API性能**: 3-5倍高速化
- **保守コスト**: 50-70%削減
- **データ品質**: 大幅改善

この設計は、現在の複雑な構造を解決し、将来的な拡張性も考慮した最適解となっています。

---

*このドキュメントは2025年7月13日時点の最適化設計案です。実装前に十分な検証・テストを実施してください。*