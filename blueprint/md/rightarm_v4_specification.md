# RIGHTARM v4 完全仕様書

## 📋 目次
1. [プロジェクト概要](#プロジェクト概要)
2. [サイトマップ](#サイトマップ)
3. [画面設計仕様](#画面設計仕様)
4. [コンポーネント仕様](#コンポーネント仕様)
5. [技術仕様](#技術仕様)
6. [モバイル最適化](#モバイル最適化)
7. [開発・運用ガイドライン](#開発運用ガイドライン)

---

## プロジェクト概要

### サービス名
**RIGHTARM** - 企業とCFOの完全セルフ型マッチングプラットフォーム

### ミッション
全国の企業に「右腕CFO」を届ける、効率的で信頼性の高いマッチングサービスを提供する

### ターゲットユーザー
- **企業側**: 財務課題を抱える中小企業・スタートアップ
- **CFO側**: 副業・複業で企業支援を行いたい財務専門家

### 技術スタック

#### **フロントエンド**
- **フレームワーク**: Next.js 15.3.4 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS + カスタムCSS変数
- **状態管理**: React Hooks + Context API (グローバル状態)
- **フォーム管理**: React Hook Form + Zod バリデーション
- **アニメーション**: Framer Motion
- **デザインシステム**: クラウドワークス準拠 + カスタムコンポーネント

#### **バックエンド・インフラ**
- **データベース**: PostgreSQL (Supabase)
- **認証**: Supabase Auth / NextAuth.js
- **ファイルストレージ**: Supabase Storage / AWS S3
- **リアルタイム**: Supabase Realtime / Socket.io
- **API**: Next.js API Routes + tRPC (型安全)
- **画像処理**: Next.js Image Optimization

#### **サードパーティ統合**
- **決済**: Stripe Connect (マルチパーティ決済)
- **メール**: SendGrid / Resend
- **カレンダー**: Google Calendar API + Outlook API
- **ビデオ会議**: Zoom API / Google Meet
- **SMS**: Twilio
- **地図**: Google Maps API

#### **分析・監視**
- **アナリティクス**: Google Analytics 4 + Mixpanel
- **エラー監視**: Sentry
- **パフォーマンス**: Vercel Analytics + Web Vitals
- **A/Bテスト**: PostHog
- **ログ管理**: LogRocket

#### **開発・運用**
- **ホスティング**: Vercel (フロントエンド) + Railway/Supabase (バックエンド)
- **CI/CD**: GitHub Actions
- **コード品質**: ESLint + Prettier + Husky
- **テスト**: Jest + Testing Library + Playwright
- **型チェック**: TypeScript strict mode
- **パッケージ管理**: pnpm

---

## サイトマップ

### 🌐 公開ページ（認証不要）
```
/ (ランディングページ)
├── /about (サービス紹介)
├── /pricing (料金プラン)
├── /how-it-works (使い方ガイド)
├── /success-stories (成功事例)
├── /auth/
│   ├── /login (ログイン)
│   ├── /register (会員登録)
│   │   ├── ?type=company (企業登録)
│   │   └── ?type=cfo (CFO登録)
│   ├── /forgot-password (パスワードリセット)
│   └── /verify-email (メール認証)
├── /legal/
│   ├── /privacy (プライバシーポリシー)
│   ├── /terms (利用規約)
│   ├── /security (セキュリティポリシー)
│   └── /gdpr (データ保護方針)
├── /support/
│   ├── /contact (お問い合わせ)
│   ├── /faq (よくある質問)
│   └── /status (サービス稼働状況)
└── /company/
    ├── /about-us (会社概要)
    ├── /team (チーム紹介)
    ├── /careers (採用情報)
    ├── /press (プレスリリース)
    └── /blog (ブログ)
```

### 🔐 認証済みページ（ログイン必須）
```
/home (メインダッシュボード)
├── /discover (発見・検索)
│   ├── /advanced-search (高度な検索)
│   ├── /saved-searches (保存済み検索)
│   └── /recommendations (おすすめ)
├── /scout (スカウト管理)
│   ├── /received (受信済み)
│   ├── /sent (送信済み)
│   ├── /templates (テンプレート管理)
│   └── /analytics (スカウト分析)
├── /applications (応募管理) ※CFO専用
│   ├── /active (進行中)
│   ├── /completed (完了)
│   └── /drafts (下書き)
├── /projects (プロジェクト管理) ※企業専用
│   ├── /active (進行中)
│   ├── /completed (完了)
│   ├── /planning (企画中)
│   └── /templates (募集テンプレート)
├── /messages (メッセージング)
│   ├── /conversations (会話一覧)
│   ├── /archived (アーカイブ)
│   ├── /group-chats (グループチャット)
│   └── /file-sharing (ファイル共有)
├── /meetings (面談・会議管理)
│   ├── /calendar (カレンダービュー)
│   ├── /upcoming (今後の予定)
│   ├── /history (履歴)
│   ├── /recurring (定期面談)
│   └── /rooms (会議室予約)
├── /contracts (契約管理)
│   ├── /active (進行中契約)
│   ├── /pending (承認待ち)
│   ├── /completed (完了)
│   ├── /templates (契約テンプレート)
│   └── /invoicing (請求管理)
├── /payments (決済管理)
│   ├── /overview (概要)
│   ├── /transactions (取引履歴)
│   ├── /invoices (請求書)
│   ├── /tax-documents (税務書類)
│   └── /payment-methods (支払い方法)
├── /profile (プロフィール管理)
│   ├── /basic-info (基本情報)
│   ├── /skills (スキル・経験)
│   ├── /portfolio (ポートフォリオ)
│   ├── /availability (稼働状況)
│   ├── /rates (料金設定)
│   └── /verification (本人確認)
├── /reviews (レビュー・評価)
│   ├── /received (受け取ったレビュー)
│   ├── /given (書いたレビュー)
│   └── /pending (評価待ち)
├── /notifications (通知管理)
│   ├── /all (全て)
│   ├── /unread (未読)
│   ├── /system (システム通知)
│   └── /preferences (通知設定)
├── /analytics (分析・レポート)
│   ├── /dashboard (ダッシュボード)
│   ├── /performance (パフォーマンス)
│   ├── /earnings (収益分析) ※CFO専用
│   ├── /hiring-success (採用成功率) ※企業専用
│   └── /market-insights (市場動向)
├── /settings (設定)
│   ├── /account (アカウント設定)
│   ├── /privacy (プライバシー設定)
│   ├── /security (セキュリティ設定)
│   ├── /notifications (通知設定)
│   ├── /billing (請求設定)
│   ├── /integrations (外部連携)
│   └── /preferences (表示設定)
├── /help (ヘルプ・サポート)
│   ├── /getting-started (はじめ方)
│   ├── /faq (よくある質問)
│   ├── /tutorials (チュートリアル)
│   ├── /contact-support (サポート連絡)
│   └── /feature-requests (機能要望)
├── /network (ネットワーク・コミュニティ)
│   ├── /connections (つながり)
│   ├── /groups (グループ)
│   ├── /events (イベント)
│   └── /industry-news (業界ニュース)
└── 動的ページ
    ├── /cfo/[id] (CFO詳細ページ)
    ├── /company/[id] (企業詳細ページ)
    ├── /project/[id] (プロジェクト詳細)
    ├── /contract/[id] (契約詳細)
    └── /meeting/[id] (面談詳細)
```

### 🛠️ 開発者ツール（開発環境のみ）
```
/debug/
├── /performance (パフォーマンス監視)
├── /components (コンポーネントライブラリ)
├── /sitemap (サイトマップ可視化)
├── /api (API テスト・ドキュメント)
├── /database (データベース管理)
├── /emails (メールテンプレート)
├── /analytics (イベント追跡テスト)
├── /feature-flags (機能フラグ管理)
└── /logs (ログ表示・検索)
```

### 🔧 管理者専用ページ（admin.rightarm.com）
```
/admin/
├── /dashboard (管理ダッシュボード)
├── /users (ユーザー管理)
│   ├── /companies (企業管理)
│   ├── /cfos (CFO管理)
│   ├── /verification (本人確認)
│   └── /suspension (アカウント停止)
├── /content (コンテンツ管理)
│   ├── /moderation (コンテンツ検閲)
│   ├── /reports (通報管理)
│   ├── /skills (スキル分類管理)
│   └── /templates (テンプレート管理)
├── /platform (プラットフォーム管理)
│   ├── /analytics (プラットフォーム分析)
│   ├── /feature-flags (機能フラグ)
│   ├── /announcements (お知らせ管理)
│   └── /maintenance (メンテナンス)
├── /support (サポート管理)
│   ├── /tickets (チケット管理)
│   ├── /live-chat (ライブチャット)
│   └── /knowledge-base (ナレッジベース)
├── /financial (財務管理)
│   ├── /transactions (取引管理)
│   ├── /payouts (支払い管理)
│   ├── /disputes (紛争管理)
│   └── /reporting (財務レポート)
└── /system (システム管理)
    ├── /monitoring (システム監視)
    ├── /backups (バックアップ管理)
    ├── /security (セキュリティ管理)
    └── /integrations (外部連携管理)
```

---

## データベース設計

### 🗄️ 主要テーブル構造

#### **Users テーブル（基本ユーザー情報）**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  user_type user_type_enum NOT NULL, -- 'company' | 'cfo'
  email_verified BOOLEAN DEFAULT FALSE,
  phone VARCHAR(20),
  phone_verified BOOLEAN DEFAULT FALSE,
  status account_status_enum DEFAULT 'active', -- 'active' | 'suspended' | 'deleted'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  profile_completion_rate INTEGER DEFAULT 0, -- 0-100
  subscription_tier subscription_tier_enum DEFAULT 'free' -- 'free' | 'premium' | 'enterprise'
);
```

#### **Company Profiles テーブル（企業情報）**
```sql
CREATE TABLE company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  company_description TEXT,
  industry VARCHAR(100),
  company_size company_size_enum, -- 'startup' | 'small' | 'medium' | 'large'
  revenue_range revenue_range_enum, -- '0-1M' | '1M-10M' | '10M-30M' | '30M-50M' | '50M+'
  location_prefecture VARCHAR(50),
  location_city VARCHAR(100),
  website_url VARCHAR(255),
  established_year INTEGER,
  employee_count INTEGER,
  financial_challenges TEXT[], -- Array of challenge types
  seeking_skills TEXT[], -- Array of required skills
  budget_range budget_range_enum,
  urgency urgency_enum DEFAULT 'medium', -- 'low' | 'medium' | 'high'
  remote_work_policy remote_policy_enum, -- 'onsite' | 'hybrid' | 'remote'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **CFO Profiles テーブル（CFO情報）**
```sql
CREATE TABLE cfo_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100),
  bio TEXT,
  avatar_url VARCHAR(255),
  location_prefecture VARCHAR(50),
  location_city VARCHAR(100),
  years_experience INTEGER,
  certifications TEXT[], -- Array of certifications
  specializations TEXT[], -- Array of skill categories
  work_preferences JSONB, -- Flexible work preference structure
  availability_status availability_enum DEFAULT 'available', -- 'available' | 'busy' | 'unavailable'
  hourly_rate_min INTEGER,
  hourly_rate_max INTEGER,
  monthly_rate_min INTEGER,
  monthly_rate_max INTEGER,
  languages TEXT[] DEFAULT ARRAY['Japanese'],
  remote_work_preference remote_preference_enum, -- 'onsite' | 'hybrid' | 'remote' | 'flexible'
  rating_average DECIMAL(3,2) DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.00, -- Success rate percentage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Projects テーブル（プロジェクト・案件管理）**
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES company_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  budget_min INTEGER,
  budget_max INTEGER,
  duration_months INTEGER,
  start_date DATE,
  deadline DATE,
  status project_status_enum DEFAULT 'draft', -- 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled'
  required_skills TEXT[],
  urgency urgency_enum DEFAULT 'medium',
  remote_work_allowed BOOLEAN DEFAULT TRUE,
  applications_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Applications テーブル（応募・スカウト管理）**
```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  cfo_id UUID REFERENCES cfo_profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES company_profiles(id) ON DELETE CASCADE,
  application_type application_type_enum NOT NULL, -- 'application' | 'scout'
  status application_status_enum DEFAULT 'pending', -- 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  cover_message TEXT,
  proposed_rate INTEGER,
  proposed_duration INTEGER,
  attachments TEXT[], -- Array of file URLs
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Messages テーブル（メッセージング）**
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  participant_2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  last_message_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(participant_1_id, participant_2_id, project_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  message_type message_type_enum DEFAULT 'text', -- 'text' | 'file' | 'image' | 'meeting_invite'
  attachments JSONB, -- File attachments metadata
  read_at TIMESTAMP WITH TIME ZONE,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Meetings テーブル（面談・会議管理）**
```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  meeting_type meeting_type_enum DEFAULT 'video', -- 'video' | 'phone' | 'in_person'
  meeting_url VARCHAR(255), -- Zoom/Google Meet URL
  location VARCHAR(255), -- For in-person meetings
  status meeting_status_enum DEFAULT 'scheduled', -- 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  agenda TEXT,
  notes TEXT,
  recording_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Reviews テーブル（評価・レビュー）**
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  skills_rating JSONB, -- Skill-specific ratings
  would_recommend BOOLEAN,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Notifications テーブル（通知管理）**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type notification_type_enum NOT NULL, -- 'message' | 'scout' | 'application' | 'meeting' | 'system'
  title VARCHAR(255) NOT NULL,
  content TEXT,
  related_entity_type entity_type_enum, -- 'project' | 'application' | 'message' | 'meeting'
  related_entity_id UUID,
  read_at TIMESTAMP WITH TIME ZONE,
  action_required BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 🔗 リレーションシップとインデックス

```sql
-- パフォーマンス最適化のためのインデックス
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_company_profiles_user_id ON company_profiles(user_id);
CREATE INDEX idx_cfo_profiles_user_id ON cfo_profiles(user_id);
CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_applications_project_id ON applications(project_id);
CREATE INDEX idx_applications_cfo_id ON applications(cfo_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_meetings_scheduled_at ON meetings(scheduled_at);
CREATE INDEX idx_notifications_user_id_read_at ON notifications(user_id, read_at);

-- 全文検索のためのインデックス
CREATE INDEX idx_company_profiles_search ON company_profiles USING gin(to_tsvector('japanese', company_name || ' ' || company_description));
CREATE INDEX idx_cfo_profiles_search ON cfo_profiles USING gin(to_tsvector('japanese', first_name || ' ' || last_name || ' ' || bio));
CREATE INDEX idx_projects_search ON projects USING gin(to_tsvector('japanese', title || ' ' || description));
```

---

## API エンドポイント設計

### 🔌 RESTful API 構造

#### **認証関連 API**
```typescript
// Authentication endpoints
POST   /api/auth/register          // ユーザー登録
POST   /api/auth/login             // ログイン
POST   /api/auth/logout            // ログアウト
POST   /api/auth/refresh           // トークン更新
POST   /api/auth/forgot-password   // パスワードリセット要求
POST   /api/auth/reset-password    // パスワードリセット実行
POST   /api/auth/verify-email      // メール認証
POST   /api/auth/resend-verification // 認証メール再送信
```

#### **ユーザー管理 API**
```typescript
// User management
GET    /api/users/me               // 現在のユーザー情報取得
PUT    /api/users/me               // ユーザー情報更新
DELETE /api/users/me               // アカウント削除
POST   /api/users/upload-avatar    // アバター画像アップロード
GET    /api/users/[id]             // 他ユーザーの公開情報取得
```

#### **プロフィール管理 API**
```typescript
// Company profiles
GET    /api/profiles/company       // 企業プロフィール取得
PUT    /api/profiles/company       // 企業プロフィール更新
POST   /api/profiles/company/verify // 企業認証申請

// CFO profiles
GET    /api/profiles/cfo           // CFOプロフィール取得
PUT    /api/profiles/cfo           // CFOプロフィール更新
POST   /api/profiles/cfo/verify    // CFO認証申請
GET    /api/profiles/cfo/portfolio // ポートフォリオ取得
POST   /api/profiles/cfo/portfolio // ポートフォリオ追加
```

#### **検索・発見 API**
```typescript
// Search and discovery
GET    /api/search/cfos            // CFO検索
GET    /api/search/companies       // 企業検索
GET    /api/search/projects        // プロジェクト検索
POST   /api/search/advanced        // 高度な検索
GET    /api/search/suggestions     // 検索候補取得
POST   /api/search/save            // 検索条件保存
GET    /api/search/saved           // 保存済み検索取得
```

#### **プロジェクト管理 API**
```typescript
// Project management
GET    /api/projects               // プロジェクト一覧取得
POST   /api/projects               // 新規プロジェクト作成
GET    /api/projects/[id]          // プロジェクト詳細取得
PUT    /api/projects/[id]          // プロジェクト更新
DELETE /api/projects/[id]          // プロジェクト削除
POST   /api/projects/[id]/apply    // プロジェクトに応募
GET    /api/projects/[id]/applications // 応募者一覧取得
```

#### **スカウト・応募 API**
```typescript
// Scout and applications
POST   /api/scout/send             // スカウト送信
GET    /api/scout/received         // 受信スカウト一覧
GET    /api/scout/sent             // 送信スカウト一覧
PUT    /api/scout/[id]/respond     // スカウトに返答
GET    /api/applications           // 応募一覧取得
POST   /api/applications           // 新規応募
PUT    /api/applications/[id]      // 応募ステータス更新
```

#### **メッセージング API**
```typescript
// Messaging
GET    /api/conversations          // 会話一覧取得
POST   /api/conversations          // 新規会話開始
GET    /api/conversations/[id]     // 会話詳細取得
GET    /api/conversations/[id]/messages // メッセージ一覧取得
POST   /api/conversations/[id]/messages // メッセージ送信
PUT    /api/messages/[id]/read     // メッセージ既読更新
POST   /api/messages/upload        // ファイル添付
```

#### **面談・会議 API**
```typescript
// Meetings
GET    /api/meetings               // 面談一覧取得
POST   /api/meetings               // 面談予約
GET    /api/meetings/[id]          // 面談詳細取得
PUT    /api/meetings/[id]          // 面談更新
DELETE /api/meetings/[id]          // 面談キャンセル
POST   /api/meetings/[id]/join     // 面談参加
GET    /api/meetings/calendar      // カレンダー形式で取得
```

#### **決済・契約 API**
```typescript
// Payments and contracts
GET    /api/contracts              // 契約一覧取得
POST   /api/contracts              // 契約作成
GET    /api/contracts/[id]         // 契約詳細取得
PUT    /api/contracts/[id]/sign    // 契約署名
GET    /api/payments/overview      // 決済概要取得
GET    /api/payments/transactions  // 取引履歴取得
POST   /api/payments/invoice       // 請求書作成
POST   /api/payments/payout        // 支払い実行
```

#### **通知 API**
```typescript
// Notifications
GET    /api/notifications          // 通知一覧取得
PUT    /api/notifications/[id]/read // 通知既読更新
PUT    /api/notifications/read-all // 全通知既読更新
DELETE /api/notifications/[id]     // 通知削除
GET    /api/notifications/preferences // 通知設定取得
PUT    /api/notifications/preferences // 通知設定更新
```

#### **分析・レポート API**
```typescript
// Analytics and reporting
GET    /api/analytics/dashboard    // ダッシュボード分析データ
GET    /api/analytics/performance  // パフォーマンス分析
GET    /api/analytics/earnings     // 収益分析（CFO用）
GET    /api/analytics/hiring       // 採用分析（企業用）
GET    /api/analytics/market       // 市場動向分析
```

### 🔄 リアルタイム通信（WebSocket）

```typescript
// WebSocket Events
interface SocketEvents {
  // メッセージング
  'message:new': (message: Message) => void;
  'message:read': (messageId: string) => void;
  'conversation:typing': (userId: string) => void;
  
  // 通知
  'notification:new': (notification: Notification) => void;
  'notification:read': (notificationId: string) => void;
  
  // ユーザーステータス
  'user:online': (userId: string) => void;
  'user:offline': (userId: string) => void;
  
  // 面談・会議
  'meeting:reminder': (meeting: Meeting) => void;
  'meeting:started': (meetingId: string) => void;
  'meeting:ended': (meetingId: string) => void;
  
  // スカウト・応募
  'scout:received': (scout: Application) => void;
  'application:status_changed': (application: Application) => void;
}
```

---

## 画面設計仕様

### 🌟 ランディングページ (`/`)

#### レイアウト構成
```
┌─────────────────────────────────────┐
│ ヘッダー (ナビ + ロゴ + ハンバーガー)     │
├─────────────────────────────────────┤
│ ヒーローセクション                      │
│ ┌─────────────────┬─────────────────┐ │
│ │ 企業の方           │ CFOの方          │ │
│ │ - 週1日から導入可能   │ - 財務知識で企業支援 │ │
│ │ - リモート対応      │ - 副業として活動可能 │ │
│ │ - CFOを低コスト導入 │ - 複業で仕事拡大   │ │
│ │ [企業として登録]     │ [CFOとして登録]   │ │
│ └─────────────────┴─────────────────┘ │
│ [既にアカウントをお持ちの方はこちら]        │
├─────────────────────────────────────┤
│ フッター (リンク集 + SNS + コピーライト)   │
└─────────────────────────────────────┘
```

#### デザイン仕様
- **カラー**: グラデーション背景 (gray-900 → gray-800)
- **タイポグラフィ**: 大型タイトル (text-6xl → text-8xl)
- **CTA**: 企業側=白背景、CFO側=透明ボーダー
- **レスポンシブ**: grid-cols-1 (mobile) → grid-cols-2 (desktop)

#### インタラクション
- **ホバー効果**: カードの背景透明度変更 + スケール
- **プリローディング**: 登録ページの事前読み込み
- **アニメーション**: fadeIn + slideUp

---

### ℹ️ サービス紹介ページ (`/about`)

#### セクション構成
1. **ミッションセクション**
   - アニメーション付きヒーロー
   - 価値提案の明確化

2. **サービス特徴 (4つの柱)**
   ```
   ┌─────────┬─────────┬─────────┬─────────┐
   │ 効率的な   │ 質の高い   │ 安心安全な │ 継続的な  │
   │ マッチング │ プロ人材   │ 取引環境   │ サポート  │
   └─────────┴─────────┴─────────┴─────────┘
   ```

3. **利用事例**
   - 企業側: 資金調達支援、IPO準備、財務DX
   - CFO側: 副業活用、スキル活用、ネットワーク拡大

4. **統計データ**
   - 1000+ 登録企業
   - 500+ 登録CFO
   - 95% マッチング満足度

#### レスポンシブ対応
- **Mobile**: 縦積みレイアウト
- **Desktop**: 3カラムグリッド
- **Tablet**: 2カラムグリッド

---

### 🔐 認証ページ

#### ログインページ (`/auth/login`)
```
┌─────────────────────────────────────┐
│              RIGHTARM               │
│              ログイン                │
├─────────────────────────────────────┤
│ メールアドレス                        │
│ [____________________________]      │
│                                   │
│ パスワード                          │
│ [____________________________]      │
│                                   │
│ □ ログイン状態を保持                  │
│                                   │
│ [        ログイン        ]          │
│                                   │
│ パスワードを忘れた方                  │
│                                   │
│ アカウントをお持ちでない方は 会員登録    │
│                                   │
│ ← ホームに戻る                      │
└─────────────────────────────────────┘
```

#### 会員登録ページ (`/auth/register`)
**URL パラメータ制御**
- `?type=company`: 企業登録フォーム
- `?type=cfo`: CFO登録フォーム

**企業登録フォーム**
```
必須項目:
├── 会社名/事業名 *
├── 所在地 *
├── 担当者名 *
├── メールアドレス *
├── 会社概要 *
├── 抱えている財務課題 * (チェックボックス)
│   ├── 資金手繰り
│   ├── IPO準備
│   ├── M&A準備
│   ├── 再生・事業継承
│   ├── 管理会計
│   └── 経営管理DX
├── 課題の背景や状況 *
├── CFOに求めたいこと *
├── 希望時期 * (ラジオボタン)
│   ├── 今すぐ
│   ├── 1ヶ月以内
│   ├── 検討中
│   └── その他
└── 推定年商 (新規追加)
    ├── 1億円未満
    ├── 1~10億円
    ├── 10~30億円
    ├── 30~50億円
    ├── 50億円以上
    └── 非公開
```

**CFO登録フォーム**
```
必須項目:
├── 氏名/ニックネーム *
├── メールアドレス *
├── 可能な業務/スキル * (階層構造)
│   ├── 📈 資金調達
│   │   ├── 銀行融資対応
│   │   ├── 補助金・助成金申請支援
│   │   ├── VC・エクイティ調達支援
│   │   ├── 投資家対応 (IR資料/ピッチデック)
│   │   ├── 資本政策設計
│   │   ├── 財務DD対応
│   │   ├── 資金繰り表作成・改善
│   │   └── キャッシュフロー改善施策
│   ├── 🏢 IPO・M&A関連
│   │   ├── IPO準備支援
│   │   ├── IPO内部統制構築
│   │   ├── M&Aアドバイザリー (売り手)
│   │   ├── M&Aアドバイザリー (買い手)
│   │   ├── バリュエーション・事業価値評価
│   │   └── PMI支援
│   ├── 📊 経営管理・管理会計関連
│   │   ├── 管理会計構築
│   │   ├── 月次決算早期化
│   │   ├── BIツール導入
│   │   └── 原価計算・粗利管理導入
│   ├── 💻 財務DX・システム導入関連
│   │   ├── クラウド会計ソフト導入
│   │   ├── ERP導入
│   │   ├── 会計データ可視化・レポーティング
│   │   └── ワークフロー・経費精算システム
│   ├── 🔄 事業再生・事業承継
│   │   ├── 資金繰り改善 (借換/リスケ)
│   │   ├── 事業再生計画立案
│   │   ├── 第三者承継 (M&A) 支援
│   │   └── 親族内承継支援
│   ├── 👥 組織・ガバナンス関連
│   │   ├── 経理部門内製化・組織構築
│   │   ├── CFO直下チーム設計
│   │   ├── 内部統制・監査対応
│   │   └── 会計方針統一・会計基準整備
│   └── 🔧 その他
│       ├── 週1〜対応可
│       ├── フルリモート対応可
│       ├── 成果報酬型対応可
│       ├── 地方案件対応可
│       ├── スタートアップ支援経験あり
│       ├── 上場企業勤務経験あり
│       └── 英語対応可
├── 実績・経歴
├── 保有資格
├── 稼働希望形態 (チェックボックス)
│   ├── 週1日
│   ├── 週2日以上
│   ├── スポット (単発案件ベース)
│   ├── 成果報酬型
│   ├── 初回アドバイスのみでも可
│   └── リモート対応希望
├── 希望報酬イメージ (ラジオボタン)
│   ├── 月額制希望
│   ├── 成果報酬型でもOK
│   ├── 応相談
│   └── その他/補足事項
└── 自己紹介/一言
```

**UI仕様**
- **スキル選択**: 大カテゴリクリックで詳細展開
- **プログレッシブ開示**: 情報の段階的表示
- **リアルタイムバリデーション**: 入力値即座チェック

---

### 🏠 メインダッシュボード (`/home`)

#### レイアウト構成
```
┌─────────────────────────────────────┐
│ AppHeader (ロゴ + ナビ + 通知 + ユーザー) │
├─────────────────────────────────────┤
│ ユーザータイプ切り替え (デモ用)             │
├─────────────────────────────────────┤
│ 検索・フィルターエリア                    │
│ ┌─────────────────┬─────────────────┐ │
│ │ フィルターパネル     │ 検索結果エリア      │ │
│ │ (モバイルでは折りたたみ)│                 │ │
│ │ - キーワード検索     │ ┌─────┬─────┬───┐ │
│ │ - 地域             │ │ カード│ カード│ カ │ │
│ │ - スキル            │ └─────┴─────┴───┘ │ │
│ │ - 稼働形態          │ ┌─────┬─────┬───┐ │ │
│ │ - 報酬             │ │ カード│ カード│ カ │ │
│ │                  │ └─────┴─────┴───┘ │ │
│ └─────────────────┴─────────────────┘ │
├─────────────────────────────────────┤
│ モバイルボトムナビ (🏠 🎯 💬 📅)           │
└─────────────────────────────────────┘
```

#### プロフィールカード仕様
**CFOカード**
```
┌─────────────────────────────────────┐
│ 👤 山田 太郎                 ⭐⭐⭐⭐⭐ │
│ 財務・経営企画 | 東京都              │
├─────────────────────────────────────┤
│ 【専門分野】                          │
│ #資金調達 #IPO準備 #財務DX #管理会計   │
├─────────────────────────────────────┤
│ 【稼働】週2日〜 | リモート可            │
│ 【報酬】月額50-100万円                │
├─────────────────────────────────────┤
│ 元大手商社CFO。IPO経験3社、          │
│ 資金調達総額50億円の実績。            │
├─────────────────────────────────────┤
│ [スカウト] [興味あり] [詳細を見る]      │
└─────────────────────────────────────┘
```

**企業カード**
```
┌─────────────────────────────────────┐
│ 🏢 株式会社サンプル               急募 │
│ SaaS・IT | 東京都 | 従業員50名       │
├─────────────────────────────────────┤
│ 【課題】IPO準備支援                  │
│ 【求める人材】IPO経験豊富なCFO        │
├─────────────────────────────────────┤
│ 【稼働】週2-3日 | 一部リモート可       │
│ 【報酬】月額80-120万円               │
├─────────────────────────────────────┤
│ 来年のIPOを目指しており、財務体制     │
│ の構築と投資家対応をお願いしたい。     │
├─────────────────────────────────────┤
│ [スカウト] [興味あり] [詳細を見る]      │
└─────────────────────────────────────┘
```

#### インタラクション
- **スカウトモーダル**: カード内アクションでモーダル表示
- **フィルター同期**: URL パラメータとの連動
- **無限スクロール**: ページネーション自動化

---

### 🎯 スカウト管理 (`/scout`)

#### タブ構成
```
┌─────────────────────────────────────┐
│ [ 受信済み ] [ 送信済み ]              │
├─────────────────────────────────────┤
│ スカウトカードリスト                    │
│ ┌─────────────────────────────────┐ │
│ │ 🟢 未読 | 株式会社テクノロジー       │ │
│ │ 緊急度: 高 | 2時間前               │ │
│ │ 「IPO準備のCFOを探しています」      │ │
│ │ [承認] [辞退] [詳細]              │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 🟡 対応中 | ABC株式会社            │ │
│ │ 緊急度: 中 | 1日前                │ │
│ │ 「財務DXの支援をお願いします」       │ │
│ │ [メッセージ] [詳細]               │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### ステータス管理
- **受信済み**: 未読 🟢 / 対応中 🟡 / 承認済み ✅ / 辞退済み ❌
- **送信済み**: 送信済み 📤 / 既読 👁️ / 承認済み ✅ / 辞退済み ❌
- **緊急度**: 高・中・低の3段階表示

---

### 💬 メッセージング (`/messages`)

#### レイアウト (デスクトップ)
```
┌─────────────────────────────────────┐
│ AppHeader                           │
├─────────────────┬───────────────────┤
│ チャットリスト     │ メッセージエリア      │
│ ┌─────────────┐ │ ┌─────────────────┐ │
│ │ 👤 田中CFO    │ │ │ 山田さん          │ │
│ │ IPOについて   │ │ │ オンライン 📶     │ │
│ │ 3分前 🔴    │ │ ├─────────────────┤ │
│ └─────────────┘ │ │ メッセージ履歴     │ │
│ ┌─────────────┐ │ │                 │ │
│ │ 🏢 B社       │ │ │ [ファイル添付対応] │ │
│ │ 条件について   │ │ │                 │ │
│ │ 1時間前      │ │ ├─────────────────┤ │
│ └─────────────┘ │ │ [入力エリア] [送信]│ │
│                 │ └─────────────────┘ │
└─────────────────┴───────────────────┘
```

#### モバイル対応
- **トグル表示**: チャットリスト ⇄ メッセージエリア
- **戻るボタン**: メッセージエリアからリストへ
- **フルスクリーン**: モバイルで全画面表示

#### メッセージ機能
- **リアルタイム**: 既読ステータス表示
- **ファイル添付**: 画像・PDF対応
- **リンクプレビュー**: URL自動展開
- **絵文字リアクション**: メッセージへのリアクション

---

### 📅 面談管理 (`/meetings`)

#### ビュー切り替え
```
┌─────────────────────────────────────┐
│ [ リストビュー ] [ カレンダービュー ]    │
├─────────────────────────────────────┤
│ 今日の面談 (2件)                      │
│ ┌─────────────────────────────────┐ │
│ │ 🟢 10:00-11:00 | 田中CFO          │ │
│ │ IPO準備の相談 | Zoom              │ │
│ │ [参加] [資料] [チャット]            │ │
│ └─────────────────────────────────┘ │
│                                   │
│ 今週の予定                           │
│ ┌─────────────────────────────────┐ │
│ │ 📅 12/25 14:00 | C社との面談      │ │
│ │ 財務戦略について | 対面 (東京)       │ │
│ │ [詳細] [変更] [キャンセル]          │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### カレンダービュー
```
┌─────────────────────────────────────┐
│      2024年12月     [<] [>]          │
├─────────────────────────────────────┤
│ 月 火 水 木 金 土 日                    │
│ 16 17 18 19 20 21 22                │
│ 23 24 25 26 27 28 29                │
│        🔵    🟢                      │
│ 30 31                               │
├─────────────────────────────────────┤
│ 🔵 12/25: C社面談 (14:00-15:00)       │
│ 🟢 12/27: 田中CFOフォローアップ         │
└─────────────────────────────────────┘
```

---

### 👤 プロフィール編集 (`/profile`)

#### セクション構成
```
┌─────────────────────────────────────┐
│ [ 基本情報 ] [ スキル・経験 ] [ 働き方 ] │
├─────────────────────────────────────┤
│ 編集モード: [ オフ | オン ]  [保存]      │
├─────────────────────────────────────┤
│ 基本情報セクション                      │
│ ┌─────────────────────────────────┐ │
│ │ プロフィール写真                    │ │
│ │ [写真を変更]                      │ │
│ │                                 │ │
│ │ 氏名: [田中 太郎_____________]       │ │
│ │ 居住地: [東京都渋谷区___________]     │ │
│ │ 自己紹介:                        │ │
│ │ [____________________________] │ │
│ │ [____________________________] │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### スキル管理UI
```
専門分野の選択:
├── 📈 資金調達
│   ☑️ 銀行融資対応
│   ☑️ VC・エクイティ調達支援  
│   ☐ 補助金・助成金申請支援
│   ☑️ 投資家対応 (IR/ピッチデック)
├── 🏢 IPO・M&A関連
│   ☑️ IPO準備支援
│   ☐ M&Aアドバイザリー
│   ☐ バリュエーション評価
└── 💻 財務DX・システム導入関連
    ☑️ クラウド会計ソフト導入
    ☑️ ERP導入
    ☐ BIツール導入
```

#### 働き方・条件設定
```
稼働希望:
├── 稼働形態: ☑️ 週1日 ☑️ 週2日以上 ☐ スポット
├── 勤務地: ☑️ リモート可 ☑️ 東京都内 ☐ 出張可
├── 報酬形態: ☑️ 月額制 ☑️ 成果報酬 ☐ 時給制
└── 希望報酬レンジ: [50万円] 〜 [100万円]
```

---

### ⚙️ 設定ページ (`/settings`)

#### 設定カテゴリ
```
┌─────────────────────────────────────┐
│ 🔔 通知設定                          │
│ ├── スカウト通知 [ON/OFF]             │
│ ├── メッセージ通知 [ON/OFF]            │
│ ├── 面談リマインダー [ON/OFF]          │
│ └── メール通知頻度 [即座/日次/週次]     │
├─────────────────────────────────────┤
│ 🔒 プライバシー設定                    │
│ ├── プロフィール公開範囲               │
│ ├── 検索結果への表示 [ON/OFF]          │
│ ├── 直接連絡の許可 [ON/OFF]            │
│ └── アクティビティの表示 [ON/OFF]       │
├─────────────────────────────────────┤
│ 🛡️ アカウントセキュリティ               │
│ ├── パスワード変更                    │
│ ├── 二段階認証 [ON/OFF]               │
│ ├── ログイン履歴                      │
│ └── デバイス管理                      │
├─────────────────────────────────────┤
│ 🔧 高度な設定                         │
│ ├── 自動応答メッセージ                 │
│ ├── データエクスポート                 │
│ ├── アカウント削除                    │
│ └── APIアクセス (開発者向け)            │
└─────────────────────────────────────┘
```

---

### 📊 アクティビティページ (`/activity`)

#### タブ・フィルター
```
┌─────────────────────────────────────┐
│ [すべて] [スカウト] [メッセージ] [面談]  │
├─────────────────────────────────────┤
│ 統計ダッシュボード                      │
│ ┌─────┬─────┬─────┬─────────────┐ │
│ │今月の │受信  │送信  │面談完了        │ │
│ │活動  │スカウト│スカウト│件数           │ │
│ │ 85件 │ 12件 │ 8件 │ 5件           │ │
│ └─────┴─────┴─────┴─────────────┘ │
├─────────────────────────────────────┤
│ アクティビティタイムライン                │
│ ┌─────────────────────────────────┐ │
│ │ 🎯 2時間前                        │ │
│ │ 株式会社テクノロジーからスカウト受信    │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 💬 5時間前                        │ │
│ │ ABC株式会社とのメッセージ交換        │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 📅 1日前                          │ │
│ │ 田中CFOとの面談完了                │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

### ❓ ヘルプセンター (`/help`)

#### カテゴリ構成
```
┌─────────────────────────────────────┐
│ 検索: [キーワードを入力____________]    │
├─────────────────────────────────────┤
│ よくある質問                          │
│ ┌─────────────────────────────────┐ │
│ │ 🏢 企業向け                       │ │
│ │ ├── 登録・プロフィール作成          │ │
│ │ ├── CFOの探し方・選び方            │ │
│ │ ├── スカウト・コンタクト方法        │ │
│ │ ├── 契約・料金について             │ │
│ │ └── トラブルシューティング          │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 👤 CFO向け                        │ │
│ │ ├── 登録・プロフィール設定          │ │
│ │ ├── 案件の探し方・応募方法          │ │
│ │ ├── クライアントとのやりとり        │ │
│ │ ├── 料金・支払いについて           │ │
│ │ └── キャリア・スキルアップ          │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ サポート連絡                          │
│ [メールサポート] [チャットサポート]     │
└─────────────────────────────────────┘
```

#### FAQ展開例
```
Q: CFOの選び方がわからない
A: 以下のポイントを参考にしてください：
   1. 専門分野が課題とマッチしているか
   2. 業界・規模の類似経験があるか
   3. 稼働条件が合致しているか
   4. コミュニケーションスタイルが合うか
   
   詳細な選び方ガイドは[こちら]をご確認ください。
```

---

### 📄 CFO詳細ページ (`/cfo/[id]`)

#### デスクトップレイアウト
```
┌─────────────────────────────────────┐
│ AppHeader                           │
├─────────────────────────────────────┤
│ プロフィールヘッダー                    │
│ ┌─────┐ 田中 太郎 (45歳)             │
│ │ 👤 │ ⭐⭐⭐⭐⭐ (4.8) 📍東京都      │
│ │写真 │ 元大手商社CFO • IPO経験3社    │
│ └─────┘ [スカウト] [興味あり] [保存]  │
├─────────────────┬───────────────────┤
│ タブナビゲーション   │ アクションサイドバー  │
│ [概要] [経験] [スキル]│ ┌─────────────────┐ │
│ [実績] [条件]       │ │ 基本情報           │ │
│                   │ │ 稼働: 週2-3日      │ │
│ タブコンテンツエリア  │ │ 形態: リモート可    │ │
│                   │ │ 報酬: 80-120万円   │ │
│                   │ │                  │ │
│                   │ │ 連絡先             │ │
│                   │ │ [メッセージ]        │ │
│                   │ │ [面談予約]         │ │
│                   │ └─────────────────┘ │
└─────────────────┴───────────────────┘
```

#### モバイルレイアウト
```
┌─────────────────────────────────────┐
│ AppHeader                           │
├─────────────────────────────────────┤
│ プロフィールヘッダー                    │
│ ┌─────┐ 田中 太郎                   │
│ │ 👤 │ ⭐⭐⭐⭐⭐ (4.8)             │ │
│ │写真 │ 元大手商社CFO               │
│ └─────┘                           │
├─────────────────────────────────────┤
│ ドロップダウンナビ                      │
│ [ 概要 ▼ ]                          │
│ ├── 経験・実績                       │
│ ├── スキル・専門分野                  │
│ ├── 実績・プロジェクト                 │
│ └── 働き方・条件                      │
├─────────────────────────────────────┤
│ 選択されたタブのコンテンツ               │
├─────────────────────────────────────┤
│ アクションボタン                       │
│ [スカウト送信] [興味あり] [保存]        │
└─────────────────────────────────────┘
```

---

## コンポーネント仕様

### 🧩 共通コンポーネント

#### AppHeader
```typescript
interface AppHeaderProps {
  userName?: string;
  userAvatar?: string;
  isLoggedIn?: boolean;
}

// 機能:
// - レスポンシブナビゲーション
// - 通知ドロップダウン
// - ユーザーメニュー統合
// - モバイルボトムナビ
```

#### 通知ドロップダウン
```typescript
interface NotificationProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
}

// レイアウト:
// - デスクトップ: 固定幅ドロップダウン (320px)
// - モバイル: フルスクリーンオーバーレイ
// - 機能: 未読管理、カテゴリフィルター
```

#### プロフィールカード
```typescript
interface ProfileCardProps {
  user: User;
  variant: 'cfo' | 'company';
  actions: ['scout', 'interested', 'details'];
  onAction: (action: string, userId: string) => void;
}

// バリエーション:
// - CFOカード: スキル重視、評価表示
// - 企業カード: 課題重視、緊急度表示
```

#### スカウトモーダル
```typescript
interface ScoutModalProps {
  isOpen: boolean;
  targetUser: User;
  onSend: (message: string) => void;
  onClose: () => void;
}

// 機能:
// - テンプレート選択
// - カスタムメッセージ
// - 添付ファイル対応
```

### 📱 モバイル専用コンポーネント

#### ボトムナビゲーション
```typescript
interface BottomNavProps {
  currentPath: string;
  isLoggedIn: boolean;
}

// 構成:
// 🏠 ホーム - /home
// 🎯 スカウト - /scout  
// 💬 メッセージ - /messages
// 📅 面談予定 - /meetings
```

#### モバイルフィルター
```typescript
interface MobileFilterProps {
  filters: FilterConfig;
  isOpen: boolean;
  onApply: (filters: FilterValues) => void;
  onToggle: () => void;
}

// 機能:
// - アコーディオン式展開
// - フィルター状態保持
// - 適用数バッジ表示
```

---

## 技術仕様

### 🏗️ アーキテクチャ

#### ディレクトリ構造
```
src/
├── app/                      # App Router Pages
│   ├── (auth)/              # 認証関連ページグループ
│   │   ├── login/
│   │   └── register/
│   ├── (main)/              # メインアプリページグループ  
│   │   ├── home/
│   │   ├── scout/
│   │   ├── messages/
│   │   ├── meetings/
│   │   ├── profile/
│   │   ├── settings/
│   │   ├── activity/
│   │   └── help/
│   ├── (public)/            # 公開ページグループ
│   │   ├── about/
│   │   └── contact/
│   ├── cfo/[id]/           # 動的ルート
│   └── debug/              # 開発者ツール
├── components/             # 共通コンポーネント
│   ├── ui/                # 基本UIコンポーネント
│   ├── layout/            # レイアウトコンポーネント
│   ├── forms/             # フォームコンポーネント
│   └── features/          # 機能別コンポーネント
├── lib/                   # ユーティリティ・設定
│   ├── api/              # API関連
│   ├── auth/             # 認証関連
│   ├── utils/            # ヘルパー関数
│   └── constants/        # 定数定義
├── hooks/                # カスタムフック
├── types/                # TypeScript型定義
└── styles/              # スタイルファイル
    ├── globals.css      # グローバルCSS
    └── components.css   # コンポーネント別CSS
```

#### 状態管理戦略
```typescript
// React Hooks ベース
// ページレベル: useState + useEffect
// グローバル状態: Context API (必要に応じて)
// フォーム状態: 制御コンポーネント + useCallback
// API状態: TanStack Query (将来的に検討)

interface AppState {
  user: User | null;
  notifications: Notification[];
  ui: UIState;
}
```

#### データフロー
```
API Layer
    ↓
Service Layer (lib/api/)
    ↓
Custom Hooks (hooks/)
    ↓
Components
    ↓
UI State Management
```

### 🎨 デザインシステム

#### カラーパレット
```css
:root {
  /* Primary Colors */
  --primary-50: #f9fafb;
  --primary-500: #6b7280;
  --primary-900: #111827;
  
  /* Semantic Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
  
  /* Neutral Scale */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
}
```

#### タイポグラフィスケール
```css
/* Font Sizes */
.text-xs { font-size: 0.75rem; }    /* 12px */
.text-sm { font-size: 0.875rem; }   /* 14px */
.text-base { font-size: 1rem; }     /* 16px */
.text-lg { font-size: 1.125rem; }   /* 18px */
.text-xl { font-size: 1.25rem; }    /* 20px */
.text-2xl { font-size: 1.5rem; }    /* 24px */
.text-3xl { font-size: 1.875rem; }  /* 30px */
.text-4xl { font-size: 2.25rem; }   /* 36px */

/* Font Weights */
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
```

#### 間隔システム
```css
/* Spacing Scale (4px base) */
.p-1 { padding: 0.25rem; }    /* 4px */
.p-2 { padding: 0.5rem; }     /* 8px */
.p-3 { padding: 0.75rem; }    /* 12px */
.p-4 { padding: 1rem; }       /* 16px */
.p-6 { padding: 1.5rem; }     /* 24px */
.p-8 { padding: 2rem; }       /* 32px */
.p-12 { padding: 3rem; }      /* 48px */
.p-16 { padding: 4rem; }      /* 64px */
```

#### アニメーション
```css
/* カスタムアニメーション */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

/* 適用クラス */
.animate-fadeIn { animation: fadeIn 0.3s ease-out; }
.animate-fadeInUp { animation: fadeInUp 0.5s ease-out; }
.animate-slideIn { animation: slideIn 0.3s ease-out; }
```

### 📊 パフォーマンス

#### メトリクス目標
```
Core Web Vitals:
├── LCP (Largest Contentful Paint): < 2.5s
├── FID (First Input Delay): < 100ms
├── CLS (Cumulative Layout Shift): < 0.1
└── FCP (First Contentful Paint): < 1.8s

その他:
├── Time to Interactive: < 3.5s
├── Speed Index: < 3.0s
└── Bundle Size: < 250KB (gzipped)
```

#### 最適化手法
```typescript
// 1. コード分割
const LazyComponent = lazy(() => import('./Component'));

// 2. プリフェッチング
const prefetchPage = (href: string) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
};

// 3. メモ化
const OptimizedComponent = memo(({ data }) => {
  const memoizedValue = useMemo(() => 
    expensiveCalculation(data), [data]
  );
  
  const handleClick = useCallback(() => {
    // handle click
  }, []);
  
  return <div>{memoizedValue}</div>;
});

// 4. 画像最適化
<Image
  src="/profile.jpg"
  alt="Profile"
  width={200}
  height={200}
  priority={false}
  loading="lazy"
/>
```

---

## モバイル最適化

### 📱 レスポンシブブレークポイント

```css
/* Tailwind CSS Breakpoints */
/* sm: 640px and up */
/* md: 768px and up */  
/* lg: 1024px and up */
/* xl: 1280px and up */
/* 2xl: 1536px and up */

/* カスタムブレークポイント */
@media (max-width: 480px) {
  /* Small mobile */
}

@media (min-width: 481px) and (max-width: 768px) {
  /* Large mobile / Small tablet */
}

@media (min-width: 769px) and (max-width: 1024px) {
  /* Tablet */
}

@media (min-width: 1025px) {
  /* Desktop */
}
```

### 🎯 タッチターゲット

```css
/* タッチターゲット最小サイズ: 44px x 44px */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ボタン間隔: 8px以上 */
.button-group {
  gap: 8px;
}

/* タップハイライト */
.tap-highlight {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
}
```

### 📐 レイアウトパターン

#### スタックレイアウト (モバイル)
```css
.mobile-stack {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mobile-stack > * {
  width: 100%;
}
```

#### グリッドレイアウト (デスクトップ)
```css
.desktop-grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 2rem;
}

@media (max-width: 768px) {
  .desktop-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
```

### 🗂️ モバイルナビゲーション

#### ボトムナビゲーション実装
```typescript
interface BottomNavItem {
  path: string;
  label: string;
  icon: string;
  badge?: number;
}

const navigationItems: BottomNavItem[] = [
  { path: '/home', label: 'ホーム', icon: '🏠' },
  { path: '/scout', label: 'スカウト', icon: '🎯', badge: 3 },
  { path: '/messages', label: 'メッセージ', icon: '💬', badge: 2 },
  { path: '/meetings', label: '面談予定', icon: '📅' }
];

// レイアウト
<div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe">
  <div className="grid grid-cols-4 h-16">
    {navigationItems.map((item) => (
      <Link
        key={item.path}
        href={item.path}
        className={`flex flex-col items-center justify-center space-y-1 transition-colors p-2 ${
          isCurrentPage(item.path)
            ? 'text-gray-900'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <div className="relative">
          <span className="text-lg">{item.icon}</span>
          {item.badge && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {item.badge}
            </span>
          )}
        </div>
        <span className="text-xs font-medium">{item.label}</span>
      </Link>
    ))}
  </div>
</div>
```

### 💬 モバイルチャット

```typescript
// モバイルチャット切り替え
const [showChatList, setShowChatList] = useState(true);

// レイアウト
<div className="flex h-screen-safe">
  {/* モバイル: 条件付き表示 */}
  <div className={`${showChatList ? 'block' : 'hidden'} md:block w-full md:w-1/3`}>
    <ChatList onSelectChat={() => setShowChatList(false)} />
  </div>
  
  <div className={`${!showChatList ? 'block' : 'hidden'} md:block w-full md:w-2/3`}>
    <MessageArea onBack={() => setShowChatList(true)} />
  </div>
</div>
```

---

## 開発・運用ガイドライン

### 🔧 開発環境セットアップ

#### 必要なツール
```bash
# Node.js (v18.0.0 以上)
node --version

# pnpm (推奨パッケージマネージャー)
npm install -g pnpm

# 環境構築
pnpm install
pnpm dev

# 型チェック
pnpm type-check

# リント
pnpm lint

# ビルド
pnpm build
```

#### VS Code 推奨拡張機能
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### 📝 コーディング規約

#### TypeScript
```typescript
// 1. 型定義は明示的に
interface UserProfile {
  id: string;
  name: string;
  email: string;
  skills: Skill[];
}

// 2. Props にはインターフェース使用
interface ComponentProps {
  user: UserProfile;
  onUpdate: (user: UserProfile) => void;
}

// 3. 関数型コンポーネント
const ProfileCard: React.FC<ComponentProps> = ({ user, onUpdate }) => {
  // 実装
};

// 4. カスタムフック
const useProfile = (userId: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  // ロジック
  return { profile, updateProfile };
};
```

#### CSS/Tailwind
```html
<!-- 1. レスポンシブファースト -->
<div class="w-full md:w-1/2 lg:w-1/3">

<!-- 2. 論理的グループ化 -->
<button class="
  px-4 py-2 
  bg-blue-500 hover:bg-blue-600 
  text-white font-medium 
  rounded-lg transition-colors
">

<!-- 3. コンポーネント別スタイル分離 -->
<div class="profile-card">
  <div class="profile-card__header">
    <div class="profile-card__avatar">
```

### 🧪 テスト戦略

#### 単体テスト (Jest + Testing Library)
```typescript
// components/__tests__/ProfileCard.test.tsx
import { render, screen } from '@testing-library/react';
import ProfileCard from '../ProfileCard';

describe('ProfileCard', () => {
  const mockUser = {
    id: '1',
    name: '田中太郎',
    email: 'tanaka@example.com',
    skills: []
  };

  it('ユーザー名が表示される', () => {
    render(<ProfileCard user={mockUser} onUpdate={jest.fn()} />);
    expect(screen.getByText('田中太郎')).toBeInTheDocument();
  });
});
```

#### E2Eテスト (Playwright)
```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('ログインフロー', async ({ page }) => {
  await page.goto('/auth/login');
  
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-button"]');
  
  await expect(page).toHaveURL('/home');
});
```

### 📊 監視・分析

#### パフォーマンス監視
```typescript
// lib/analytics.ts
export const trackPageView = (url: string) => {
  // Google Analytics
  gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

export const trackEvent = (action: string, category: string, label?: string) => {
  gtag('event', action, {
    event_category: category,
    event_label: label,
  });
};

// Core Web Vitals
export const reportWebVitals = (metric: any) => {
  switch (metric.name) {
    case 'FCP':
    case 'LCP':
    case 'CLS':
    case 'FID':
    case 'TTFB':
      console.log(metric);
      // 分析ツールに送信
      break;
  }
};
```

#### エラー監視 (Sentry)
```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// エラーハンドリング
export const captureException = (error: Error, context?: any) => {
  Sentry.captureException(error, {
    tags: context,
  });
};
```

### 🚀 デプロイ・CI/CD

#### GitHub Actions
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
      
      - name: Type check
        run: pnpm type-check
      
      - name: Lint
        run: pnpm lint
      
      - name: Build
        run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 📈 KPI・メトリクス

#### ビジネスメトリクス
```typescript
// 追跡すべきKPI
interface BusinessMetrics {
  // ユーザー関連
  monthlyActiveUsers: number;
  newRegistrations: number;
  userRetentionRate: number;
  
  // マッチング関連
  scoutsSent: number;
  scoutsAccepted: number;
  matchSuccessRate: number;
  
  // エンゲージメント
  messagesSent: number;
  meetingsScheduled: number;
  profileViews: number;
}
```

#### 技術メトリクス
```typescript
interface TechnicalMetrics {
  // パフォーマンス
  pageLoadTime: number;
  apiResponseTime: number;
  errorRate: number;
  
  // ユーザビリティ
  bounceRate: number;
  conversionRate: number;
  taskCompletionRate: number;
}
```

---

## 🔄 継続的改善

### フィードバックループ
1. **ユーザーフィードバック収集**: アプリ内フィードバック、サポート問い合わせ
2. **データ分析**: アクセス解析、ユーザー行動分析
3. **A/Bテスト**: 機能・UI改善の効果測定
4. **定期レビュー**: 月次・四半期での振り返り

### 今後の機能拡張予定
- 決済システム統合
- ビデオ面談機能
- AIマッチング最適化
- モバイルアプリ (React Native)
- 管理者ダッシュボード

---

**作成日**: 2024年12月22日  
**バージョン**: v4.0  
**最終更新**: 2024年12月22日  

*この仕様書は、RIGHTARMプラットフォームの完全な技術仕様書です。開発チーム全体での共有と継続的な更新を行ってください。*