# CFOマッチングプラットフォーム - データベース設計・構造マッピング

## 目次
1. [概要](#1-概要)
2. [全テーブル一覧](#2-全テーブル一覧)
3. [テーブル詳細仕様](#3-テーブル詳細仕様)
4. [リレーション図](#4-リレーション図)
5. [使用状況マトリックス](#5-使用状況マトリックス)
6. [設計課題・改善提案](#6-設計課題改善提案)
7. [統合・最適化ロードマップ](#7-統合最適化ロードマップ)

---

## 1. 概要

### プロジェクト概要
- **名称**: Rextrix (旧RightArm) - CFO・企業マッチングプラットフォーム
- **技術スタック**: Next.js 15.3.4 + TypeScript + Supabase (PostgreSQL)
- **認証システム**: NextAuth.js統一済み
- **データベース**: PostgreSQL with RLS (Row Level Security)

### データベース設計の変遷
- **2025-01-10**: 基本テーブル設計・認証システム統合
- **2025-07-11**: 認証システムNextAuth.js統一・レガシーコード削除
- **2025-07-13**: CFO詳細プロフィール機能拡張・JSONB活用

### 現在の状況
- ✅ **認証統一完了**: NextAuth.js統一済み
- ✅ **基本機能実装**: ユーザー管理、CFO・企業プロフィール
- 🟡 **拡張機能**: マッチング・契約管理（部分実装）
- ❌ **未実装機能**: メッセージング・詳細検索

---

## 2. 全テーブル一覧

### 実装完了テーブル（14/24 - 58%）

| テーブル名 | 用途 | 実装状況 | データ存在 | API使用 |
|---|---|---|---|---|
| `rextrix_users` | ユーザー基本情報・認証 | ✅ 完了 | ✅ 有 | 🔥 高 |
| `rextrix_user_profiles` | 共通プロフィール | ✅ 完了 | ✅ 有 | 🔥 高 |
| `rextrix_cfos` | CFO基本情報 | ✅ 完了 | ✅ 有 | 🔥 高 |
| `rextrix_companies` | 企業基本情報 | ✅ 完了 | ✅ 有 | 🟡 中 |
| `rextrix_company_profiles` | 企業詳細プロフィール | ✅ 完了 | 🟡 少 | 🟡 中 |
| `rextrix_cfo_profiles` | CFO詳細プロフィール | 🟡 部分 | ❌ 無 | 🟠 低 |
| `rextrix_projects` | プロジェクト管理 | ✅ 完了 | 🟡 少 | 🟡 中 |
| `rextrix_matches` | マッチング結果 | ✅ 完了 | 🟡 少 | 🟡 中 |
| `rextrix_contracts` | 契約管理 | ✅ 完了 | ❌ 無 | 🟠 低 |
| `rextrix_messages` | メッセージ履歴 | ✅ 完了 | ❌ 無 | 🟠 低 |
| `rextrix_reviews` | レビュー・評価 | ✅ 完了 | ❌ 無 | 🟠 低 |
| `rextrix_notifications` | 通知管理 | ✅ 完了 | ❌ 無 | 🟠 低 |
| `rextrix_tags` | タグ管理 | ✅ 完了 | 🟡 少 | 🟠 低 |
| `rextrix_user_tags` | ユーザー・タグ関連 | ✅ 完了 | ❌ 無 | 🟠 低 |

### 設計済み・未実装テーブル（10/24 - 42%）

| テーブル名 | 用途 | 設計状況 | 実装予定 |
|---|---|---|---|
| `rextrix_cfo_services` | CFO提供サービス | 📋 設計完了 | Phase 2 |
| `rextrix_cfo_certifications` | CFO資格情報 | 📋 設計完了 | Phase 2 |
| `rextrix_cfo_work_history` | CFO職歴詳細 | 📋 設計完了 | Phase 2 |
| `rextrix_cfo_skills` | CFOスキル管理 | 📋 設計完了 | Phase 2 |
| `rextrix_cfo_availability` | CFO稼働条件 | 📋 設計完了 | Phase 2 |
| `rextrix_cfo_service_areas` | CFO対応エリア | 📋 設計完了 | Phase 2 |
| `rextrix_cfo_compensation` | CFO報酬設定 | 📋 設計完了 | Phase 2 |
| `rextrix_company_requirements` | 企業要求仕様 | 📋 設計完了 | Phase 3 |
| `rextrix_search_filters` | 検索フィルター | 📋 設計完了 | Phase 3 |
| `rextrix_analytics` | 分析・統計 | 📋 設計完了 | Phase 3 |

---

## 3. テーブル詳細仕様

### Core Tables（コアテーブル）

#### 3.1 `rextrix_users` - ユーザー基本情報
```sql
CREATE TABLE rextrix_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('cfo', 'company', 'admin')),
    email_verified BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- **使用頻度**: 🔥 極高 (全API共通)
- **データ件数**: 50+ レコード
- **主要用途**: NextAuth.js認証、ユーザー識別

#### 3.2 `rextrix_user_profiles` - 共通プロフィール
```sql
CREATE TABLE rextrix_user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES rextrix_users(id) ON DELETE CASCADE,
    display_name VARCHAR(255),
    nickname VARCHAR(100),
    introduction TEXT,
    phone_number VARCHAR(20),
    region VARCHAR(255),
    work_preference TEXT,
    compensation_range TEXT,
    bio TEXT,
    phone VARCHAR(20),
    company VARCHAR(255),
    position VARCHAR(255),
    availability TEXT,
    experience TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```
- **使用頻度**: 🔥 極高 (プロフィール表示全般)
- **データ件数**: 30+ レコード
- **主要用途**: CFO・企業共通のプロフィール情報

#### 3.3 `rextrix_cfos` - CFO基本情報
```sql
CREATE TABLE rextrix_cfos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES rextrix_users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    experience_years INTEGER,
    experience_summary TEXT,
    achievements JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    specialties JSONB DEFAULT '[]',
    is_available BOOLEAN DEFAULT true,
    max_concurrent_projects INTEGER DEFAULT 3,
    rating DECIMAL(3,2) DEFAULT 0.0,
    review_count INTEGER DEFAULT 0,
    hourly_rate DECIMAL(10,2),
    introduction TEXT,
    work_preference TEXT,
    compensation_range TEXT,
    -- 検索最適化用フィールド
    career_full_text TEXT,
    skills_full_text TEXT,
    qualifications_text TEXT,
    introduction_full_text TEXT,
    availability_text TEXT,
    compensation_text TEXT,
    service_area_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```
- **使用頻度**: 🔥 極高 (CFO関連API)
- **データ件数**: 8+ レコード
- **主要用途**: CFO専用情報、検索・マッチング
- **JSONB活用**: specialties, achievements, certifications

#### 3.4 `rextrix_companies` - 企業基本情報
```sql
CREATE TABLE rextrix_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES rextrix_users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    industry VARCHAR(255),
    company_size VARCHAR(100),
    revenue_range VARCHAR(100),
    funding_stage VARCHAR(100),
    description TEXT,
    website_url VARCHAR(500),
    is_hiring BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```
- **使用頻度**: 🟡 中 (企業プロフィール)
- **データ件数**: 5+ レコード
- **主要用途**: 企業基本情報管理

### Extended Tables（拡張テーブル）

#### 3.5 `rextrix_cfo_profiles` - CFO詳細プロフィール
```sql
CREATE TABLE rextrix_cfo_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cfo_id UUID REFERENCES rextrix_cfos(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    display_name VARCHAR(255),
    nickname VARCHAR(100),
    residence_prefecture VARCHAR(50),
    residence_city VARCHAR(100),
    residence_details TEXT,
    weekly_available_hours INTEGER,
    work_style_preference TEXT,
    remote_work_available BOOLEAN DEFAULT true,
    travel_available BOOLEAN DEFAULT false,
    minimum_monthly_fee INTEGER,
    maximum_monthly_fee INTEGER,
    fee_structure TEXT,
    performance_bonus_available BOOLEAN DEFAULT false,
    available_areas JSONB DEFAULT '[]',
    international_available BOOLEAN DEFAULT false,
    introduction TEXT,
    achievements JSONB DEFAULT '[]',
    strengths JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cfo_id)
);
```
- **使用頻度**: 🟠 低 (詳細プロフィール表示)
- **データ件数**: 1 レコード（ほぼ未使用）
- **問題点**: `rextrix_cfos`との重複、実装不完全

#### 3.6 `rextrix_projects` - プロジェクト管理
```sql
CREATE TABLE rextrix_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES rextrix_companies(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    budget_range VARCHAR(100),
    duration_months INTEGER,
    required_skills JSONB DEFAULT '[]',
    urgency_level VARCHAR(50) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'open',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- **使用頻度**: 🟡 中 (プロジェクト管理)
- **データ件数**: 少数
- **主要用途**: 企業側のプロジェクト要求管理

#### 3.7 `rextrix_matches` - マッチング結果
```sql
CREATE TABLE rextrix_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cfo_id UUID REFERENCES rextrix_cfos(id) ON DELETE CASCADE,
    company_id UUID REFERENCES rextrix_companies(id) ON DELETE CASCADE,
    project_id UUID REFERENCES rextrix_projects(id) ON DELETE SET NULL,
    match_score DECIMAL(5,2),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- **使用頻度**: 🟡 中 (マッチング機能)
- **データ件数**: 少数
- **主要用途**: CFO・企業のマッチング結果管理

### Support Tables（サポートテーブル）

#### 3.8 `rextrix_messages` - メッセージ履歴
```sql
CREATE TABLE rextrix_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES rextrix_users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES rextrix_users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES rextrix_projects(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
- **使用頻度**: 🟠 低 (メッセージング機能)
- **データ件数**: 0 レコード（未使用）
- **実装状況**: 基本構造のみ、UI未実装

#### 3.9 その他のサポートテーブル
- `rextrix_contracts` - 契約管理（未使用）
- `rextrix_reviews` - レビュー・評価（未使用）
- `rextrix_notifications` - 通知管理（未使用）
- `rextrix_tags` - タグ管理（部分使用）
- `rextrix_user_tags` - ユーザー・タグ関連（未使用）

---

## 4. リレーション図

### 4.1 コアエンティティ関係図
```
rextrix_users (認証・基本情報)
    ├── rextrix_user_profiles (1:1) - 共通プロフィール
    ├── rextrix_cfos (1:1) - CFO情報
    │   └── rextrix_cfo_profiles (1:1) - CFO詳細（未使用）
    └── rextrix_companies (1:1) - 企業情報
        └── rextrix_company_profiles (1:1) - 企業詳細

CFO-企業マッチング関係
rextrix_cfos ──┐
               ├── rextrix_matches (N:M)
rextrix_companies ──┘
    │
    └── rextrix_projects (1:N)
```

### 4.2 認証・プロフィール連携図
```
NextAuth.js Session
    ↓
rextrix_users (email, user_type)
    ↓
┌─ user_type = 'cfo' ──→ rextrix_cfos + rextrix_user_profiles
└─ user_type = 'company' ──→ rextrix_companies + rextrix_user_profiles
```

### 4.3 API データフロー
```
フロントエンド
    ↓ API Call
API Route (/api/cfos)
    ↓ Supabase Query
データベース JOINクエリ:
    rextrix_cfos
    LEFT JOIN rextrix_cfo_profiles (名前優先取得)
    LEFT JOIN rextrix_user_profiles (フォールバック)
    ↓
レスポンス統合・返却
```

---

## 5. 使用状況マトリックス

### 5.1 API使用頻度マトリックス

| テーブル | GET | POST | PUT | DELETE | 使用API | 頻度 |
|---|---|---|---|---|---|---|
| `rextrix_users` | ✅ | ✅ | ✅ | ❌ | auth, profile | 🔥 |
| `rextrix_user_profiles` | ✅ | ✅ | ✅ | ❌ | profile, cfos | 🔥 |
| `rextrix_cfos` | ✅ | ✅ | ✅ | ❌ | cfos, search | 🔥 |
| `rextrix_companies` | ✅ | ✅ | ✅ | ❌ | companies | 🟡 |
| `rextrix_cfo_profiles` | ✅ | ❌ | ❌ | ❌ | cfos (fallback) | 🟠 |
| `rextrix_projects` | ✅ | ✅ | ✅ | ✅ | projects | 🟡 |
| `rextrix_matches` | ✅ | ✅ | ✅ | ❌ | matching | 🟡 |
| `rextrix_messages` | ❌ | ❌ | ❌ | ❌ | - | ❌ |

### 5.2 機能別テーブル使用状況

#### 認証・ユーザー管理 (実装完了度: 95%)
- **必須**: `rextrix_users`, `rextrix_user_profiles`
- **状況**: NextAuth.js統一完了、正常稼働

#### CFOプロフィール管理 (実装完了度: 70%)
- **主要**: `rextrix_cfos`, `rextrix_user_profiles`
- **拡張**: `rextrix_cfo_profiles` (実装不完全)
- **課題**: プロフィール情報の分散、JSONB活用不十分

#### 企業管理 (実装完了度: 60%)
- **主要**: `rextrix_companies`, `rextrix_user_profiles`
- **拡張**: `rextrix_company_profiles`
- **状況**: 基本機能のみ、詳細機能は部分実装

#### マッチング機能 (実装完了度: 40%)
- **主要**: `rextrix_matches`, `rextrix_projects`
- **状況**: 基本構造あり、UI・ロジック未完成

#### メッセージング (実装完了度: 10%)
- **主要**: `rextrix_messages`
- **状況**: テーブル存在のみ、機能未実装

### 5.3 データ存在状況

| カテゴリ | テーブル数 | データ有 | データ無 | 実装率 |
|---|---|---|---|---|
| 認証・基本 | 2 | 2 | 0 | 100% |
| CFO関連 | 4 | 2 | 2 | 50% |
| 企業関連 | 3 | 2 | 1 | 67% |
| マッチング | 3 | 1 | 2 | 33% |
| サポート | 5 | 1 | 4 | 20% |

---

## 6. 設計課題・改善提案

### 6.1 現在の設計課題

#### 🔴 重大課題

1. **過度な正規化・テーブル分散**
   - CFO情報が `rextrix_cfos` + `rextrix_cfo_profiles` + `rextrix_user_profiles` に分散
   - API取得時に複数JOIN必要、パフォーマンス劣化
   - データ整合性の管理複雑化

2. **実装と設計の乖離**
   - 設計済み24テーブル中、10テーブルが未実装
   - `rextrix_cfo_profiles` は存在するがほぼ未使用
   - フォールバック処理による複雑性増大

3. **データ重複・不整合**
   - CFO名前情報の優先順位ロジック複雑化
   - プロフィール情報の重複格納
   - JSONB活用不十分（`specialties`, `achievements`等）

#### 🟡 中程度課題

4. **検索性能の問題**
   - フルテキスト検索の未最適化
   - GINインデックス活用不十分
   - 複数テーブルJOINによる検索性能劣化

5. **拡張性の制限**
   - 新機能追加時のテーブル追加負担
   - 関連テーブル間の整合性維持困難
   - メンテナンス性の低下

### 6.2 統合・最適化提案

#### Option 1: JSONB活用による段階的統合

**Phase 1: `rextrix_cfos` テーブル拡張**
```sql
-- rextrix_cfos テーブルに集約フィールド追加
ALTER TABLE rextrix_cfos ADD COLUMN
    display_name VARCHAR(255),
    nickname VARCHAR(100),
    location_data JSONB DEFAULT '{}',
    work_conditions JSONB DEFAULT '{}',
    compensation_details JSONB DEFAULT '{}',
    contact_preferences JSONB DEFAULT '{}';

-- 対応する検索インデックス
CREATE INDEX idx_rextrix_cfos_location_gin ON rextrix_cfos USING GIN (location_data);
CREATE INDEX idx_rextrix_cfos_specialties_gin ON rextrix_cfos USING GIN (specialties);
```

**データ構造例:**
```json
{
  "location_data": {
    "prefecture": "千葉県",
    "city": "千葉市",
    "remote_available": true,
    "travel_available": false
  },
  "work_conditions": {
    "weekly_hours": "応相談",
    "work_style": "リモート主体",
    "max_projects": 3
  },
  "compensation_details": {
    "monthly_range": "月10万円〜",
    "hourly_rate": null,
    "performance_bonus": true
  }
}
```

**メリット:**
- 11テーブル → 5テーブルに削減（54%削減）
- JOIN処理の大幅削減
- JSON検索による高性能検索

#### Option 2: 完全リアーキテクチャ

**統合プロフィールテーブル設計**
```sql
CREATE TABLE rextrix_unified_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES rextrix_users(id) ON DELETE CASCADE,
    profile_type VARCHAR(20) NOT NULL CHECK (profile_type IN ('cfo', 'company')),
    
    -- 基本情報
    display_name VARCHAR(255) NOT NULL,
    nickname VARCHAR(100),
    
    -- CFO専用情報（profile_type='cfo'時のみ使用）
    cfo_data JSONB DEFAULT '{}',
    
    -- 企業専用情報（profile_type='company'時のみ使用）
    company_data JSONB DEFAULT '{}',
    
    -- 共通情報
    location_data JSONB DEFAULT '{}',
    contact_data JSONB DEFAULT '{}',
    work_preferences JSONB DEFAULT '{}',
    compensation_data JSONB DEFAULT '{}',
    
    -- 検索最適化
    search_vector tsvector,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);
```

### 6.3 パフォーマンス最適化案

1. **インデックス戦略**
   ```sql
   -- JSONB検索用GINインデックス
   CREATE INDEX idx_unified_cfo_specialties ON rextrix_unified_profiles 
   USING GIN ((cfo_data->'specialties'));
   
   -- フルテキスト検索用
   CREATE INDEX idx_unified_search_vector ON rextrix_unified_profiles 
   USING GIN (search_vector);
   
   -- 複合インデックス
   CREATE INDEX idx_unified_type_location ON rextrix_unified_profiles 
   (profile_type, (location_data->>'prefecture'));
   ```

2. **クエリ最適化**
   ```sql
   -- 現在（3テーブルJOIN）
   SELECT * FROM rextrix_cfos c
   LEFT JOIN rextrix_cfo_profiles cp ON c.id = cp.cfo_id
   LEFT JOIN rextrix_user_profiles up ON c.user_id = up.user_id;
   
   -- 最適化後（1テーブル）
   SELECT * FROM rextrix_unified_profiles 
   WHERE profile_type = 'cfo' 
   AND cfo_data->'specialties' ? 'M&A支援';
   ```

---

## 7. 統合・最適化ロードマップ

### Phase 1: 準備・検証段階（1-2ヶ月）

#### Week 1-2: 現状分析・リスク評価
- [ ] 全テーブルのデータ量・使用状況詳細調査
- [ ] パフォーマンステスト（現在のJOINクエリ性能測定）
- [ ] データ移行リスク評価
- [ ] バックアップ戦略策定

#### Week 3-4: 統合設計詳細化
- [ ] JSONB構造詳細設計
- [ ] マイグレーションスクリプト作成
- [ ] テストケース設計
- [ ] ロールバック手順策定

#### Week 5-8: 開発環境での検証
- [ ] 統合テーブル作成・テストデータ投入
- [ ] API修正・テスト
- [ ] パフォーマンス比較テスト
- [ ] フロントエンド互換性確認

### Phase 2: 段階的移行（2-3ヶ月）

#### Month 1: Core Tables 統合
- [ ] `rextrix_cfos` テーブル拡張
- [ ] データ移行スクリプト実行
- [ ] API エンドポイント更新
- [ ] 基本機能テスト

#### Month 2: Extended Tables 統合
- [ ] `rextrix_cfo_profiles` データ統合
- [ ] 詳細プロフィール機能更新
- [ ] 検索機能強化
- [ ] パフォーマンス最適化

#### Month 3: クリーンアップ
- [ ] 未使用テーブル削除
- [ ] インデックス最適化
- [ ] API性能最終調整
- [ ] ドキュメント更新

### Phase 3: 最適化・完了（1ヶ月）

#### Week 1-2: 最終最適化
- [ ] 本番環境パフォーマンステスト
- [ ] 残存課題対応
- [ ] モニタリング設定

#### Week 3-4: 運用移行
- [ ] 本番環境デプロイ
- [ ] モニタリング・アラート設定
- [ ] 運用ドキュメント整備
- [ ] チーム教育・引き継ぎ

### 期待効果

#### 定量的効果
- **テーブル数削減**: 24テーブル → 15テーブル（37%削減）
- **JOIN回数削減**: 平均3-4回 → 1-2回（50-60%削減）
- **API応答速度改善**: 予想20-30%向上
- **開発効率向上**: 新機能開発時間30-40%短縮

#### 定性的効果
- データ整合性の向上
- メンテナンス性の大幅改善
- 新機能追加の容易性向上
- 開発者の学習コスト削減

---

## 付録

### A. SQLファイル一覧
- `sql/` フォルダに66個のSQLファイルが存在
- 主要カテゴリ: テーブル作成、データ投入、最適化提案、検証用

### B. 関連ドキュメント
- `CLAUDE.md` - プロジェクト変更履歴
- `read/cfo_data.md` - CFOプロフィールサンプルデータ
- `read/cfo.md` - CFO候補者情報

### C. 設定ファイル
- `src/lib/supabase.ts` - Supabase設定
- `src/lib/constants.ts` - テーブル名定数
- `.env.local` - 環境変数設定

---

*この文書は2025年7月13日時点でのデータベース構造を反映しています。最新情報については開発チームにお問い合わせください。*