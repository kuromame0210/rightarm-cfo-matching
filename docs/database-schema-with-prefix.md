# Rextrix データベーススキーマ（接頭語付き）

## 🎯 概要
サービス名「Rextrix」の接頭語 `rextrix_` をすべてのテーブル名に追加したデータベース設計です。
これにより、他のサービスとの統合時やマルチテナント環境での運用が容易になります。

## 📋 テーブル名変更マッピング

| 旧テーブル名 | 新テーブル名 | 説明 |
|-------------|-------------|------|
| `users` | `rextrix_users` | ユーザー基本情報 |
| `user_profiles` | `rextrix_user_profiles` | ユーザープロフィール詳細 |
| `companies` | `rextrix_companies` | 企業情報 |
| `cfos` | `rextrix_cfos` | CFO詳細情報 |
| `skill_tags` | `rextrix_skill_tags` | スキルタグマスタ |
| `challenge_tags` | `rextrix_challenge_tags` | 財務課題タグマスタ |
| `cfo_skills` | `rextrix_cfo_skills` | CFOスキル関連 |
| `company_challenges` | `rextrix_company_challenges` | 企業課題関連 |
| `contracts` | `rextrix_contracts` | 契約情報 |
| `invoices` | `rextrix_invoices` | 請求書情報 |
| `interests` | `rextrix_interests` | 気になる機能 |
| `scouts` | `rextrix_scouts` | スカウト機能 |
| `matches` | `rextrix_matches` | マッチング情報 |
| `conversations` | `rextrix_conversations` | 会話スレッド |
| `messages` | `rextrix_messages` | メッセージ |
| `meetings` | `rextrix_meetings` | 面談予定 |
| `reviews` | `rextrix_reviews` | レビュー・評価 |
| `notifications` | `rextrix_notifications` | 通知 |
| `admin_users` | `rextrix_admin_users` | 管理者ユーザー |
| `audit_logs` | `rextrix_audit_logs` | 監査ログ |
| `subscriptions` | `rextrix_subscriptions` | サブスクリプション |
| `payments` | `rextrix_payments` | 決済履歴 |
| `images` | `rextrix_images` | 画像ファイル管理 |
| `image_variants` | `rextrix_image_variants` | 画像バリアント |

---

## 🗄️ 接頭語付きデータベーススキーマ

### 1. ユーザー関連

#### rextrix_users (ユーザー基本情報)
```sql
CREATE TABLE rextrix_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    user_type TEXT CHECK (user_type IN ('company', 'cfo')) NOT NULL,
    status TEXT CHECK (status IN ('active', 'inactive', 'suspended', 'pending')) DEFAULT 'pending',
    email_verified BOOLEAN DEFAULT FALSE,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- インデックス
CREATE INDEX idx_rextrix_users_email ON rextrix_users(email);
CREATE INDEX idx_rextrix_users_type_status ON rextrix_users(user_type, status);
CREATE INDEX idx_rextrix_users_created_at ON rextrix_users(created_at);
```

#### rextrix_user_profiles (ユーザープロフィール詳細)
```sql
CREATE TABLE rextrix_user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES rextrix_users(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    nickname VARCHAR(50),
    introduction TEXT,
    phone_number VARCHAR(20),
    region VARCHAR(50),
    work_preference TEXT,
    compensation_range VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_rextrix_user_profiles_user_id ON rextrix_user_profiles(user_id);
CREATE INDEX idx_rextrix_user_profiles_region ON rextrix_user_profiles(region);
```

### 2. 企業関連

#### rightarm_companies (企業情報)
```sql
CREATE TABLE rightarm_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES rightarm_users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    business_name VARCHAR(200),
    description TEXT,
    industry VARCHAR(100),
    region VARCHAR(50),
    employee_count VARCHAR(50),
    revenue_range TEXT CHECK (revenue_range IN ('under_100m', '100m_1b', '1b_10b', '10b_30b', 'over_50b', 'private')),
    website_url TEXT,
    established_year INTEGER,
    
    -- 募集情報
    is_recruiting BOOLEAN DEFAULT TRUE,
    recruitment_urgency TEXT CHECK (recruitment_urgency IN ('low', 'medium', 'high')) DEFAULT 'medium',
    expected_timeline VARCHAR(100),
    work_style VARCHAR(100),
    compensation_offer VARCHAR(100),
    
    -- 課題・要求情報
    challenge_background TEXT,
    cfo_requirements TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_rightarm_companies_user_id ON rightarm_companies(user_id);
CREATE INDEX idx_rightarm_companies_industry_region ON rightarm_companies(industry, region);
CREATE INDEX idx_rightarm_companies_recruiting ON rightarm_companies(is_recruiting);
CREATE INDEX idx_rightarm_companies_urgency ON rightarm_companies(recruitment_urgency);
```

#### rightarm_challenge_tags (財務課題タグ)
```sql
CREATE TABLE rightarm_challenge_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_rightarm_challenge_tags_usage ON rightarm_challenge_tags(usage_count DESC);
CREATE INDEX idx_rightarm_challenge_tags_active ON rightarm_challenge_tags(is_active);
```

#### rightarm_company_challenges (企業の財務課題タグ関連)
```sql
CREATE TABLE rightarm_company_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES rightarm_companies(id) ON DELETE CASCADE,
    challenge_tag_id UUID NOT NULL REFERENCES rightarm_challenge_tags(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 複合ユニーク制約
    UNIQUE(company_id, challenge_tag_id)
);

-- インデックス
CREATE INDEX idx_rightarm_company_challenges_company ON rightarm_company_challenges(company_id);
CREATE INDEX idx_rightarm_company_challenges_tag ON rightarm_company_challenges(challenge_tag_id);
```

### 3. CFO関連

#### rightarm_cfos (CFO詳細情報)
```sql
CREATE TABLE rightarm_cfos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES rightarm_users(id) ON DELETE CASCADE,
    experience_years INTEGER,
    experience_summary TEXT,
    achievements JSONB,
    certifications JSONB,
    
    -- 対応可能性
    is_available BOOLEAN DEFAULT TRUE,
    max_concurrent_projects INTEGER DEFAULT 3,
    
    -- 評価情報
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_rightarm_cfos_user_id ON rightarm_cfos(user_id);
CREATE INDEX idx_rightarm_cfos_available ON rightarm_cfos(is_available);
CREATE INDEX idx_rightarm_cfos_rating ON rightarm_cfos(rating DESC);
```

#### rightarm_skill_tags (スキルタグ大分類)
```sql
CREATE TABLE rightarm_skill_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_rightarm_skill_tags_category ON rightarm_skill_tags(category);
CREATE INDEX idx_rightarm_skill_tags_usage ON rightarm_skill_tags(usage_count DESC);
CREATE INDEX idx_rightarm_skill_tags_active ON rightarm_skill_tags(is_active);
```

#### rightarm_cfo_skills (CFOのスキル関連)
```sql
CREATE TABLE rightarm_cfo_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cfo_id UUID NOT NULL REFERENCES rightarm_cfos(id) ON DELETE CASCADE,
    skill_tag_id UUID NOT NULL REFERENCES rightarm_skill_tags(id),
    proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'intermediate',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 複合ユニーク制約
    UNIQUE(cfo_id, skill_tag_id)
);

-- インデックス
CREATE INDEX idx_rightarm_cfo_skills_cfo ON rightarm_cfo_skills(cfo_id);
CREATE INDEX idx_rightarm_cfo_skills_tag ON rightarm_cfo_skills(skill_tag_id);
```

### 4. マッチング関連

#### rightarm_interests (気になる機能)
```sql
CREATE TABLE rightarm_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES rightarm_users(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES rightarm_users(id) ON DELETE CASCADE,
    target_type TEXT CHECK (target_type IN ('company', 'cfo')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 複合ユニーク制約
    UNIQUE(user_id, target_user_id)
);

-- インデックス
CREATE INDEX idx_rightarm_interests_user ON rightarm_interests(user_id);
CREATE INDEX idx_rightarm_interests_target ON rightarm_interests(target_user_id, target_type);
CREATE INDEX idx_rightarm_interests_created ON rightarm_interests(created_at DESC);
```

#### rightarm_scouts (スカウト機能)
```sql
CREATE TABLE rightarm_scouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES rightarm_users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES rightarm_users(id) ON DELETE CASCADE,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    status TEXT CHECK (status IN ('sent', 'read', 'replied', 'accepted', 'declined')) DEFAULT 'sent',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    replied_at TIMESTAMP WITH TIME ZONE
);

-- インデックス
CREATE INDEX idx_rightarm_scouts_sender ON rightarm_scouts(sender_id);
CREATE INDEX idx_rightarm_scouts_recipient ON rightarm_scouts(recipient_id);
CREATE INDEX idx_rightarm_scouts_status ON rightarm_scouts(status);
CREATE INDEX idx_rightarm_scouts_sent_at ON rightarm_scouts(sent_at DESC);
```

#### rightarm_matches (マッチング成立)
```sql
CREATE TABLE rightarm_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES rightarm_companies(id) ON DELETE CASCADE,
    cfo_id UUID NOT NULL REFERENCES rightarm_cfos(id) ON DELETE CASCADE,
    scout_id UUID REFERENCES rightarm_scouts(id),
    status TEXT CHECK (status IN ('matched', 'in_negotiation', 'contracted', 'completed', 'cancelled')) DEFAULT 'matched',
    matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    contract_start_date DATE,
    contract_end_date DATE,
    
    -- 複合ユニーク制約
    UNIQUE(company_id, cfo_id)
);

-- インデックス
CREATE INDEX idx_rightarm_matches_company ON rightarm_matches(company_id);
CREATE INDEX idx_rightarm_matches_cfo ON rightarm_matches(cfo_id);
CREATE INDEX idx_rightarm_matches_status ON rightarm_matches(status);
CREATE INDEX idx_rightarm_matches_matched_at ON rightarm_matches(matched_at DESC);
```

### 5. 契約・決済関連

#### rightarm_contracts (契約情報)
```sql
CREATE TABLE rightarm_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES rightarm_companies(id),
    cfo_id UUID NOT NULL REFERENCES rightarm_cfos(id),
    monthly_fee INTEGER NOT NULL,
    contract_period INTEGER DEFAULT 12,
    work_hours_per_month INTEGER,
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT CHECK (status IN ('draft', 'active', 'completed', 'terminated')) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_rightarm_contracts_company_cfo ON rightarm_contracts(company_id, cfo_id);
CREATE INDEX idx_rightarm_contracts_status ON rightarm_contracts(status);
```

#### rightarm_invoices (請求書情報)
```sql
CREATE TABLE rightarm_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES rightarm_contracts(id),
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    consulting_fee INTEGER NOT NULL,
    platform_fee_rate DECIMAL(3,2) DEFAULT 0.05,
    platform_fee INTEGER NOT NULL,
    total_amount INTEGER NOT NULL,
    status TEXT CHECK (status IN ('pending', 'paid', 'verified', 'overdue')) DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE,
    payment_proof_urls JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_rightarm_invoices_contract ON rightarm_invoices(contract_id);
CREATE INDEX idx_rightarm_invoices_status ON rightarm_invoices(status);
```

### 6. コミュニケーション関連

#### rightarm_conversations (会話スレッド)
```sql
CREATE TABLE rightarm_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID REFERENCES rightarm_matches(id) ON DELETE CASCADE,
    participant1_id UUID NOT NULL REFERENCES rightarm_users(id) ON DELETE CASCADE,
    participant2_id UUID NOT NULL REFERENCES rightarm_users(id) ON DELETE CASCADE,
    title VARCHAR(200),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_rightarm_conversations_match ON rightarm_conversations(match_id);
CREATE INDEX idx_rightarm_conversations_participants ON rightarm_conversations(participant1_id, participant2_id);
CREATE INDEX idx_rightarm_conversations_last_message ON rightarm_conversations(last_message_at DESC);
```

#### rightarm_messages (メッセージ)
```sql
CREATE TABLE rightarm_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES rightarm_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES rightarm_users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('text', 'file', 'system')) DEFAULT 'text',
    file_url TEXT,
    file_name VARCHAR(255),
    file_size INTEGER,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- インデックス
CREATE INDEX idx_rightarm_messages_conversation ON rightarm_messages(conversation_id);
CREATE INDEX idx_rightarm_messages_sender ON rightarm_messages(sender_id);
CREATE INDEX idx_rightarm_messages_sent_at ON rightarm_messages(sent_at DESC);
```

#### rightarm_meetings (面談予定)
```sql
CREATE TABLE rightarm_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES rightarm_matches(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    meeting_type TEXT CHECK (meeting_type IN ('initial', 'follow_up', 'contract_discussion', 'other')) DEFAULT 'initial',
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    meeting_url TEXT,
    location VARCHAR(200),
    status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')) DEFAULT 'scheduled',
    company_user_id UUID NOT NULL REFERENCES rightarm_users(id),
    cfo_user_id UUID NOT NULL REFERENCES rightarm_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_rightarm_meetings_match ON rightarm_meetings(match_id);
CREATE INDEX idx_rightarm_meetings_scheduled ON rightarm_meetings(scheduled_at);
CREATE INDEX idx_rightarm_meetings_status ON rightarm_meetings(status);
CREATE INDEX idx_rightarm_meetings_participants ON rightarm_meetings(company_user_id, cfo_user_id);
```

### 7. レビュー・評価

#### rightarm_reviews (レビュー)
```sql
CREATE TABLE rightarm_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES rightarm_matches(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES rightarm_users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES rightarm_users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    content TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 複合ユニーク制約
    UNIQUE(match_id, reviewer_id)
);

-- インデックス
CREATE INDEX idx_rightarm_reviews_match ON rightarm_reviews(match_id);
CREATE INDEX idx_rightarm_reviews_reviewee ON rightarm_reviews(reviewee_id);
CREATE INDEX idx_rightarm_reviews_rating ON rightarm_reviews(rating DESC);
CREATE INDEX idx_rightarm_reviews_created ON rightarm_reviews(created_at DESC);
```

### 8. 通知システム

#### rightarm_notifications (通知)
```sql
CREATE TABLE rightarm_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES rightarm_users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('scout_received', 'scout_replied', 'match_created', 'message_received', 'meeting_scheduled', 'review_received', 'system')) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT,
    related_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- インデックス
CREATE INDEX idx_rightarm_notifications_user ON rightarm_notifications(user_id);
CREATE INDEX idx_rightarm_notifications_type ON rightarm_notifications(type);
CREATE INDEX idx_rightarm_notifications_unread ON rightarm_notifications(user_id, is_read);
CREATE INDEX idx_rightarm_notifications_created ON rightarm_notifications(created_at DESC);
```

### 9. 管理機能

#### rightarm_admin_users (管理者ユーザー)
```sql
CREATE TABLE rightarm_admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role TEXT CHECK (role IN ('super_admin', 'admin', 'moderator')) DEFAULT 'admin',
    permissions JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_rightarm_admin_users_email ON rightarm_admin_users(email);
CREATE INDEX idx_rightarm_admin_users_role ON rightarm_admin_users(role);
```

#### rightarm_audit_logs (監査ログ)
```sql
CREATE TABLE rightarm_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES rightarm_users(id),
    admin_user_id UUID REFERENCES rightarm_admin_users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_rightarm_audit_logs_user ON rightarm_audit_logs(user_id);
CREATE INDEX idx_rightarm_audit_logs_admin ON rightarm_audit_logs(admin_user_id);
CREATE INDEX idx_rightarm_audit_logs_action ON rightarm_audit_logs(action);
CREATE INDEX idx_rightarm_audit_logs_created ON rightarm_audit_logs(created_at DESC);
```

### 10. 画像管理

#### rightarm_images (画像ファイル管理)
```sql
CREATE TABLE rightarm_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_filename VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL UNIQUE,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    width INTEGER,
    height INTEGER,
    aspect_ratio DECIMAL(5,4),
    uploaded_by UUID REFERENCES rightarm_users(id) ON DELETE SET NULL,
    usage_type TEXT CHECK (usage_type IN ('profile', 'company_logo', 'message_attachment', 'system')) NOT NULL,
    related_id UUID,
    status TEXT CHECK (status IN ('uploading', 'processing', 'ready', 'failed', 'deleted')) DEFAULT 'uploading',
    is_public BOOLEAN DEFAULT FALSE,
    hash_md5 VARCHAR(32),
    hash_sha256 VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- インデックス
CREATE INDEX idx_rightarm_images_uploaded_by ON rightarm_images(uploaded_by);
CREATE INDEX idx_rightarm_images_usage_related ON rightarm_images(usage_type, related_id);
CREATE INDEX idx_rightarm_images_status ON rightarm_images(status);
CREATE INDEX idx_rightarm_images_hash_md5 ON rightarm_images(hash_md5);
CREATE INDEX idx_rightarm_images_created_at ON rightarm_images(created_at DESC);
```

---

## 🔄 API・コード修正指針

### 1. Supabaseクライアント設定
```typescript
// lib/supabase.ts（修正版）
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// サーバーサイド用
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// 接頭語付きテーブル名のヘルパー関数
export const TABLES = {
  USERS: 'rightarm_users',
  USER_PROFILES: 'rightarm_user_profiles',
  COMPANIES: 'rightarm_companies',
  CFOS: 'rightarm_cfos',
  SKILL_TAGS: 'rightarm_skill_tags',
  CHALLENGE_TAGS: 'rightarm_challenge_tags',
  CFO_SKILLS: 'rightarm_cfo_skills',
  COMPANY_CHALLENGES: 'rightarm_company_challenges',
  CONTRACTS: 'rightarm_contracts',
  INVOICES: 'rightarm_invoices',
  INTERESTS: 'rightarm_interests',
  SCOUTS: 'rightarm_scouts',
  MATCHES: 'rightarm_matches',
  CONVERSATIONS: 'rightarm_conversations',
  MESSAGES: 'rightarm_messages',
  MEETINGS: 'rightarm_meetings',
  REVIEWS: 'rightarm_reviews',
  NOTIFICATIONS: 'rightarm_notifications',
  ADMIN_USERS: 'rightarm_admin_users',
  AUDIT_LOGS: 'rightarm_audit_logs',
  IMAGES: 'rightarm_images'
} as const;
```

### 2. API修正例
```typescript
// 修正前
const { data: user } = await supabaseAdmin
  .from('users')
  .select('*')
  .eq('id', userId);

// 修正後
const { data: user } = await supabaseAdmin
  .from(TABLES.USERS)
  .select('*')
  .eq('id', userId);
```

### 3. 型定義の更新
```typescript
// types/database.types.ts
export interface Database {
  public: {
    Tables: {
      rightarm_users: {
        Row: {
          id: string;
          email: string;
          user_type: 'company' | 'cfo';
          // ...
        };
        Insert: {
          email: string;
          user_type: 'company' | 'cfo';
          // ...
        };
        Update: {
          email?: string;
          // ...
        };
      };
      rightarm_companies: {
        // ...
      };
      // ... 他のテーブル
    };
  };
}
```

---

## 🚀 マイグレーション手順

### 1. 既存データのバックアップ
```sql
-- 全テーブルのバックアップ
pg_dump -h your-host -U your-user -d your-db > rightarm_backup.sql
```

### 2. テーブル名変更
```sql
-- 例：usersテーブルの変更
ALTER TABLE users RENAME TO rightarm_users;
ALTER TABLE user_profiles RENAME TO rightarm_user_profiles;
-- ... 他のテーブルも同様
```

### 3. 外部キー制約の再作成
```sql
-- 外部キー制約を一度削除して再作成
ALTER TABLE rightarm_user_profiles 
  DROP CONSTRAINT user_profiles_user_id_fkey,
  ADD CONSTRAINT rightarm_user_profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES rightarm_users(id) ON DELETE CASCADE;
```

### 4. インデックスの再作成
```sql
-- 新しい命名規則でインデックスを再作成
DROP INDEX IF EXISTS idx_users_email;
CREATE INDEX idx_rightarm_users_email ON rightarm_users(email);
```

---

## ✅ 利点

1. **名前空間の分離**: 他のサービスとの統合時に競合しない
2. **運用の明確化**: テーブル名からサービスが特定できる
3. **スケーラビリティ**: マルチテナント対応が容易
4. **保守性**: システム間の依存関係が明確
5. **セキュリティ**: データベースレベルでのアクセス制御が容易

この接頭語付きスキーマにより、RightArmのデータベースが他のシステムと統合される際も安全に運用できます。