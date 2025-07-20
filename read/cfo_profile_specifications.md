# CFOプロフィール項目 仕様書

## 概要
CFOプロフィール機能における項目定義、表示・編集仕様、データ構造をまとめた技術仕様書です。
**設計方針**: 構造化データとTEXTデータのハイブリッド設計で、高精度検索と柔軟性を両立。

## データ構造概要

### 基本アーキテクチャ
- **メインテーブル**: `cfo_profiles`
- **認証**: Supabase auth.users（UUID主キー）
- **検索**: 構造化データ優先 + LIKE検索補完
- **データ形式**: 構造化フィールド + JSONB配列 + TEXTフィールドのハイブリッド

## プロフィール項目一覧

### cfo_profiles テーブル定義

#### 基本情報フィールド

| フィールド名 | データ型 | 制約 | 表示名 | 説明 | 例 |
|------------|---------|------|-------|------|---|
| `cfo_user_id` | UUID | ⭐ PK | ユーザーID | auth.users FK | "uuid-xxx-xxx" |
| `avatar_url` | TEXT | | プロフィール画像 | アイコン画像の公開URL | "/uploads/profile/xxx.jpg" |
| `cfo_name` | TEXT | | 名前 | CFOの氏名 | "佐藤大悟" |
| `cfo_display_name` | TEXT | | 表示名 | 公開用表示名 | "佐藤大悟" |
| `cfo_location` | TEXT | | 居住地 | 現在の居住地 | "千葉県千葉市" |
| `cfo_skills` | JSONB | ⭐ default '[]' | 専門スキル | スキル配列 | ["M&A支援", "IPO", "海外業務"] |
| `cfo_introduction` | TEXT | | 紹介文 | 自己紹介・アピール文 | "経験豊富なCFOとして..." |
| `cfo_raw_profile` | TEXT | ⭐ NOT NULL | 経歴 | 純粋な職歴・詳細経歴 | "2001,03 明治大学法学部法律学科卒業..." |

#### 🆕 構造化フィールド（報酬・稼働条件）

| フィールド名 | データ型 | 制約 | 表示名 | 説明 | 例 |
|------------|---------|------|-------|------|---|
| `compensation_type` | TEXT | ⭐ CHECK | 報酬体系 | 報酬の種類 | "monthly", "negotiable" |
| `monthly_fee_min` | INTEGER | | 月額報酬最小値 | 月額報酬の下限（円） | 500000 |
| `monthly_fee_max` | INTEGER | | 月額報酬最大値 | 月額報酬の上限（円） | 1000000 |
| `hourly_rate_min` | INTEGER | | 時給最小値 | 時給の下限（円） | 10000 |
| `hourly_rate_max` | INTEGER | | 時給最大値 | 時給の上限（円） | 20000 |
| `weekly_days` | INTEGER | CHECK(1-7) | 週稼働日数 | 週何日稼働可能か | 3 |
| `weekly_days_flexible` | BOOLEAN | default false | 週稼働日数柔軟性 | 日数調整可能かどうか | true |
| `daily_hours` | INTEGER | CHECK(1-12) | 日稼働時間 | 1日何時間稼働可能か | 8 |
| `daily_hours_flexible` | BOOLEAN | default false | 日稼働時間柔軟性 | 時間調整可能かどうか | true |

#### 🆕 構造化フィールド（地域・勤務形態）

| フィールド名 | データ型 | 制約 | 表示名 | 説明 | 例 |
|------------|---------|------|-------|------|---|
| `supported_prefectures` | JSONB | default '[]' | 対応エリア | 対応可能な地域（エリア単位） | ["kanto", "kansai"] |
| `full_remote_available` | BOOLEAN | default false | 完全リモート可 | 完全リモートワーク対応 | true |
| `work_styles` | JSONB | default '[]' | 勤務形態 | 勤務形態の選択肢 | ["remote", "hybrid"] |
| `preferred_time_slots` | JSONB | default '[]' | 希望時間帯 | 希望する作業時間帯 | ["morning", "afternoon"] |
| `business_trip_level` | TEXT | CHECK | 出張対応レベル | 出張対応の程度 | "domestic", "international" |

#### 🆕 構造化フィールド（経験・レベル）

| フィールド名 | データ型 | 制約 | 表示名 | 説明 | 例 |
|------------|---------|------|-------|------|---|
| `cfo_experience_years` | INTEGER | CHECK(>=0) | CFO経験年数 | CFOとしての経験年数 | 18 |
| `cfo_level` | TEXT | CHECK | CFOレベル | CFOの役職レベル | "cfo", "fractional" |
| `industry_experience` | JSONB | default '[]' | 業界経験 | 経験のある業界 | ["IT", "製造業", "不動産"] |
| `company_size_experience` | JSONB | default '[]' | 企業規模経験 | 経験のある企業規模 | ["中小企業", "上場企業"] |
| `project_experience` | JSONB | default '[]' | プロジェクト経験 | 経験のあるプロジェクト種別 | ["IPO", "M&A", "資金調達"] |

#### 詳細情報フィールド（TEXT中心）

| フィールド名 | データ型 | 制約 | 表示名 | 説明 | 例 |
|------------|---------|------|-------|------|---|
| `cfo_possible_tasks` | TEXT | | 可能な業務 | 詳細な業務内容説明 | "海外、英語を絡めた業務全般・USへの上場希望会社のサポート" |
| `cfo_certifications` | TEXT | | 保有資格 | 資格の詳細説明 | "中小企業診断士、日商簿記１級" |
| `cfo_working_areas` | TEXT | | 対応可能エリア詳細 | エリアに関する詳細説明 | "関東圏メイン、全国対応可能" |
| `cfo_compensation` | TEXT | | 想定報酬詳細 | 報酬に関する詳細説明 | "月額制、プロジェクトによって応相談" |
| `cfo_availability` | TEXT | | 稼働メモ | 稼働条件の詳細 | "応相談（臨機応変に対応）" |

#### システム管理項目

| フィールド名 | データ型 | 制約 | 表示名 | 説明 | 例 |
|------------|---------|------|-------|------|---|
| `created_at` | TIMESTAMPTZ | default now() | 作成日時 | レコード作成日時 | "2024-01-01 00:00:00" |
| `updated_at` | TIMESTAMPTZ | default now() | 更新日時 | 最終更新日時 | "2024-01-01 00:00:00" |

### 構造化データの選択肢定義

#### 報酬体系 (compensation_type)
- `monthly`: 月額制
- `hourly`: 時給制
- `project`: プロジェクト単位
- `performance`: 成果報酬
- `negotiable`: 応相談

#### 対応エリア (supported_prefectures)
- `kanto`: 関東エリア
- `kansai`: 関西エリア
- `chubu`: 中部エリア
- `tohoku`: 東北エリア
- `kyushu`: 九州エリア
- `nationwide`: 全国対応

#### CFOレベル (cfo_level)
- `assistant`: アシスタント
- `manager`: マネージャー
- `director`: ディレクター
- `cfo`: CFO
- `fractional`: フラクショナルCFO

#### 勤務形態 (work_styles)
- `remote`: リモートワーク
- `hybrid`: ハイブリッド
- `onsite`: オンサイト

#### 希望時間帯 (preferred_time_slots)
- `morning`: 午前
- `afternoon`: 午後
- `evening`: 夕方
- `flexible`: 柔軟対応

#### 出張対応レベル (business_trip_level)
- `none`: 出張なし
- `local`: 近隣地域のみ
- `domestic`: 国内出張可
- `international`: 海外出張可

### インデックス
```sql
-- 基本GINインデックス
CREATE INDEX gin_cfo_skills ON cfo_profiles
USING gin (cfo_skills jsonb_path_ops);

-- 構造化フィールド用GINインデックス
CREATE INDEX gin_supported_prefectures ON cfo_profiles
USING gin (supported_prefectures jsonb_path_ops);

CREATE INDEX gin_industry_experience ON cfo_profiles
USING gin (industry_experience jsonb_path_ops);

CREATE INDEX gin_project_experience ON cfo_profiles
USING gin (project_experience jsonb_path_ops);

-- 範囲検索用インデックス
CREATE INDEX idx_monthly_fee_range ON cfo_profiles (monthly_fee_min, monthly_fee_max);
CREATE INDEX idx_weekly_days ON cfo_profiles (weekly_days);
CREATE INDEX idx_cfo_level ON cfo_profiles (cfo_level);
```

## UI表示仕様

### CFO詳細画面表示項目（3タブ構成）

#### タブ1: 基本情報
1. **💼 稼働条件・報酬**（構造化データ優先表示）
   - 報酬体系（月額制/応相談）+ 金額範囲
   - 時給情報（設定されている場合）
   - 週稼働日数 + 柔軟性フラグ
   - 日稼働時間 + 柔軟性フラグ
   - 対応エリア（エリア名 + 完全リモート可否）
   - 居住地
   - **詳細条件・特記事項**（テキスト補完）

2. **🎯 専門スキル**
   - JSONB配列のスキル表示（タグ形式）
   - 重要度順表示（最初の3つを強調）

3. **👨‍💼 CFO経験・レベル**
   - CFO経験年数（構造化データ）
   - CFOレベル（アシスタント〜フラクショナルCFO）
   - 業界経験（タグ表示）
   - 企業規模経験（タグ表示）
   - プロジェクト経験（タグ表示）

4. **🏅 保有資格**
   - テキスト形式で表示

5. **📝 紹介文**
   - 改行対応のテキスト表示

#### タブ2: 経歴・業務
1. **詳細経歴** - `cfo_raw_profile`
2. **可能な業務** - `cfo_possible_tasks`
3. **対応可能エリア詳細** - `cfo_working_areas`

#### タブ3: 稼働条件
1. **⚙️ 詳細勤務条件**
   - 勤務形態（work_styles JSONB配列）
   - 希望時間帯（preferred_time_slots JSONB配列）
   - 出張対応レベル（business_trip_level）

2. **詳細条件・特記事項**
   - 報酬詳細（cfo_compensation）
   - 稼働詳細（cfo_availability）
   - エリア詳細（cfo_working_areas）

### プロフィール編集画面仕様

#### セクション1: 基本情報
- 名前・表示名（テキスト入力）
- 居住地（テキスト入力）
- プロフィール画像（ファイルアップロード）

#### セクション2: 🎯 基本設定（必須項目・構造化データ）
- **報酬設定**
  - 報酬体系選択（月額制/時給制/プロジェクト単位/成果報酬/応相談）
  - 月額報酬範囲（最小値・最大値）
  - 時給範囲（最小値・最大値）
- **稼働条件**
  - 週稼働日数 + 柔軟性チェックボックス
  - 日稼働時間 + 柔軟性チェックボックス
  - 勤務形態（複数選択）
  - 希望時間帯（複数選択）
- **対応エリア**
  - エリア選択（関東・関西・中部・東北・九州・全国）
  - 完全リモート可否
  - 出張対応レベル選択

#### セクション3: CFO経験・スキル
- **CFO経験**
  - CFO経験年数（数値入力）
  - CFOレベル選択
- **経験分野**
  - 業界経験（複数選択）
  - 企業規模経験（複数選択）
  - プロジェクト経験（複数選択）
- **専門スキル**（チェックボックス複数選択）

#### セクション4: 経歴・業務内容
- **詳細経歴**（必須・大きなテキストエリア）
- **可能な業務**（テキストエリア）
- **保有資格**（テキストエリア）
- **紹介文**（テキストエリア）

#### セクション5: 詳細情報（任意・テキスト補完）
- **想定報酬詳細**（テキスト）
- **稼働条件詳細**（テキスト）
- **対応可能エリア詳細**（テキスト）

## 検索・フィルタ仕様

### 高精度検索（構造化データ優先）

#### 報酬検索
```sql
-- 月額報酬範囲検索
WHERE compensation_type = 'monthly' 
  AND monthly_fee_min <= :max_budget 
  AND monthly_fee_max >= :min_budget

-- 時給検索
WHERE hourly_rate_min <= :max_hourly 
  AND hourly_rate_max >= :min_hourly
```

#### 稼働条件検索
```sql
-- 週稼働日数検索
WHERE weekly_days <= :max_days
  AND (weekly_days_flexible = true OR weekly_days >= :min_days)

-- エリア検索
WHERE supported_prefectures @> '["kanto"]'
   OR full_remote_available = true
```

#### スキル・経験検索
```sql
-- スキル検索（JSONB配列オーバーラップ）
WHERE cfo_skills ?| array['M&A支援', 'IPO']

-- 業界経験検索
WHERE industry_experience @> '["IT"]'

-- プロジェクト経験検索
WHERE project_experience @> '["IPO", "M&A"]'
```

#### CFOレベル検索
```sql
-- レベル検索
WHERE cfo_level IN ('cfo', 'fractional')
  AND cfo_experience_years >= :min_years
```

### 補完検索（LIKE検索）
```sql
-- キーワード検索（テキストフィールド）
WHERE cfo_name ILIKE '%佐藤%'
   OR cfo_possible_tasks ILIKE '%IPO%'
   OR cfo_certifications ILIKE '%診断士%'
   OR cfo_introduction ILIKE '%海外%'
```

### 複合検索例
```sql
-- 関東エリア、月額50万円以上、IPO経験ありのCFO
WHERE (supported_prefectures @> '["kanto"]' OR full_remote_available = true)
  AND compensation_type = 'monthly'
  AND monthly_fee_min >= 500000
  AND project_experience @> '["IPO"]'
  AND cfo_level IN ('cfo', 'fractional')
```

## データ移行・互換性

### 既存データとの互換性
- 構造化フィールドは既存データに追加（NULL許可）
- 既存のテキストフィールドは保持・活用
- 段階的な移行により既存ユーザーに影響なし

### データ投入実績
- `cfo_data.md`の佐藤大悟さん・奥田豊さんのデータ完全投入済み
- JSONB配列形式での専門分野管理（25項目、23項目）
- 構造化データとテキストデータの統合表示

## 技術的特徴

### 設計思想
- **ハイブリッド設計**: 構造化データ（高精度検索）+ テキストデータ（柔軟性）
- **段階的構造化**: 必要に応じて追加の構造化フィールドを拡張
- **検索最適化**: GINインデックスによる高速JSONB検索

### 検索パフォーマンス
- 構造化フィールドによる正確なマッチング
- GINインデックス対応JSONB検索
- 複合条件検索対応
- ページネーション対応

### UI/UX
- **データ表示優先度**: 構造化データ → テキストデータの階層表示
- **視覚的区分**: 構造化データはタグ・テーブル形式、テキストは補完情報として表示
- **完全レスポンシブ対応**: モバイル・PC両対応
- **タブ切り替え**: 情報を整理した3タブ構成

### セキュリティ
- Supabase auth.users統一認証
- RLSポリシー適用
- 入力値バリデーション（CHECK制約）
- 型安全性（TypeScript）

## 拡張予定

### 短期（1-2ヶ月）
- より詳細な業界・プロジェクト分類マスタ
- 高度な複合検索UI
- AI推奨機能のベース実装

### 中期（3-6ヶ月）
- 実績評価システムの統合
- より詳細な稼働条件設定
- 国際対応（多言語・通貨）

### 長期（6ヶ月以降）
- AIマッチング機能
- 動的な報酬交渉システム
- 詳細な実績分析機能

---

*最終更新: 2025-07-19*
*バージョン: 3.0（実装完全準拠版）*