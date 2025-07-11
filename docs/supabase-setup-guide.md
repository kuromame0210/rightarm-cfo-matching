# Supabase セットアップガイド

## 1. Supabaseプロジェクト作成

### 1.1 Supabaseアカウント作成・ログイン
```bash
# Supabase公式サイトでアカウント作成
# https://supabase.com

# 新しいプロジェクトを作成
# プロジェクト名: rightarm-v3
# データベースパスワード: 強力なパスワードを設定
```

### 1.2 環境変数設定
```bash
# .env.local ファイルを作成
cat > .env.local << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth.js
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# その他
RESEND_API_KEY=your_resend_api_key
EOF
```

## 2. 必要なパッケージインストール

```bash
# Supabase関連
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# NextAuth.js認証
npm install next-auth @auth/supabase-adapter

# バリデーション
npm install zod

# その他ユーティリティ
npm install bcryptjs nanoid date-fns
npm install -D @types/bcryptjs
```

## 3. Supabaseクライアント設定

### 3.1 Supabaseクライアント作成
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// サーバーサイド用（管理者権限）
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
```

### 3.2 型定義生成
```bash
# Supabase CLI インストール
npm install -g supabase

# ログイン
supabase login

# 型定義生成
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.types.ts
```

## 4. データベーススキーマ作成

### 4.1 主要テーブル作成SQL
```sql
-- users テーブル
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    user_type TEXT CHECK (user_type IN ('company', 'cfo')) NOT NULL,
    status TEXT CHECK (status IN ('active', 'inactive', 'suspended', 'pending')) DEFAULT 'pending',
    email_verified BOOLEAN DEFAULT FALSE,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- user_profiles テーブル
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- companies テーブル
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    business_name VARCHAR(200),
    description TEXT,
    industry VARCHAR(100),
    region VARCHAR(50),
    employee_count VARCHAR(50),
    revenue_range TEXT CHECK (revenue_range IN ('under_100m', '100m_1b', '1b_10b', '10b_30b', 'over_50b', 'private')),
    website_url TEXT,
    is_recruiting BOOLEAN DEFAULT TRUE,
    recruitment_urgency TEXT CHECK (recruitment_urgency IN ('low', 'medium', 'high')) DEFAULT 'medium',
    expected_timeline VARCHAR(100),
    work_style VARCHAR(100),
    compensation_offer VARCHAR(100),
    challenge_background TEXT,
    cfo_requirements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- cfos テーブル
CREATE TABLE cfos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    experience_years INTEGER,
    experience_summary TEXT,
    achievements JSONB,
    certifications JSONB,
    is_available BOOLEAN DEFAULT TRUE,
    max_concurrent_projects INTEGER DEFAULT 3,
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- skill_tags テーブル
CREATE TABLE skill_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- cfo_skills テーブル
CREATE TABLE cfo_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cfo_id UUID NOT NULL REFERENCES cfos(id) ON DELETE CASCADE,
    skill_tag_id UUID NOT NULL REFERENCES skill_tags(id),
    proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'intermediate',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cfo_id, skill_tag_id)
);

-- challenge_tags テーブル
CREATE TABLE challenge_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- company_challenges テーブル
CREATE TABLE company_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    challenge_tag_id UUID NOT NULL REFERENCES challenge_tags(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, challenge_tag_id)
);

-- contracts テーブル（決済機能のため）
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    cfo_id UUID NOT NULL REFERENCES cfos(id),
    monthly_fee INTEGER NOT NULL,
    contract_period INTEGER DEFAULT 12,
    work_hours_per_month INTEGER,
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT CHECK (status IN ('draft', 'active', 'completed', 'terminated')) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- invoices テーブル（決済機能のため）
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id),
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

-- インデックス作成
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type_status ON users(user_type, status);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_recruiting ON companies(is_recruiting);
CREATE INDEX idx_cfos_user_id ON cfos(user_id);
CREATE INDEX idx_cfos_available ON cfos(is_available);
CREATE INDEX idx_cfo_skills_cfo ON cfo_skills(cfo_id);
CREATE INDEX idx_company_challenges_company ON company_challenges(company_id);
CREATE INDEX idx_contracts_company_cfo ON contracts(company_id, cfo_id);
CREATE INDEX idx_invoices_contract ON invoices(contract_id);
CREATE INDEX idx_invoices_status ON invoices(status);
```

### 4.2 初期データ投入
```sql
-- スキルタグ初期データ
INSERT INTO skill_tags (name, category) VALUES
-- 資金調達
('VC調達', '資金調達'),
('銀行融資', '資金調達'),
('補助金申請', '資金調達'),
('投資家対応', '資金調達'),
('クラウドファンディング', '資金調達'),
('社債発行', '資金調達'),

-- IPO・M&A関連
('IPO準備', 'IPO・M&A関連'),
('M&A戦略', 'IPO・M&A関連'),
('企業価値評価', 'IPO・M&A関連'),
('DD対応', 'IPO・M&A関連'),
('IR活動', 'IPO・M&A関連'),
('上場審査対応', 'IPO・M&A関連'),

-- 財務DX・システム導入
('ERP導入', '財務DX・システム導入'),
('管理会計システム', '財務DX・システム導入'),
('BI導入', '財務DX・システム導入'),
('API連携', '財務DX・システム導入'),
('RPA導入', '財務DX・システム導入'),
('SaaS選定', '財務DX・システム導入'),

-- 事業承継・再生
('事業承継計画', '事業承継・再生'),
('事業再生', '事業承継・再生'),
('リストラクチャリング', '事業承継・再生'),
('組織再編', '事業承継・再生'),
('後継者育成', '事業承継・再生'),
('株価算定', '事業承継・再生'),

-- 組織・ガバナンス
('内部統制', '組織・ガバナンス'),
('コンプライアンス', '組織・ガバナンス'),
('リスク管理', '組織・ガバナンス'),
('KPI設計', '組織・ガバナンス'),
('予算管理', '組織・ガバナンス'),
('取締役会運営', '組織・ガバナンス'),

-- その他
('国際税務', 'その他'),
('連結決算', 'その他'),
('IFRS', 'その他'),
('原価計算', 'その他'),
('管理会計', 'その他'),
('財務分析', 'その他');

-- 財務課題タグ初期データ
INSERT INTO challenge_tags (name) VALUES
('資金調達'),
('IPO準備'),
('財務DX・システム導入'),
('事業承継・再生'),
('組織・ガバナンス'),
('M&A関連'),
('管理会計強化'),
('補助金活用'),
('銀行融資'),
('投資家対応'),
('原価計算'),
('予実管理'),
('その他');
```

### 4.3 RLS（Row Level Security）設定
```sql
-- RLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cfos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- 基本的なRLSポリシー
-- ユーザーは自分のデータのみ読み書き可能
CREATE POLICY "Users can view own data" ON users
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view own profile" ON user_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own company" ON companies
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own cfo data" ON cfos
    FOR ALL USING (auth.uid() = user_id);

-- 契約・請求書は関係者のみ閲覧可能
CREATE POLICY "Contract parties can view contracts" ON contracts
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM companies WHERE id = company_id
            UNION
            SELECT user_id FROM cfos WHERE id = cfo_id
        )
    );

CREATE POLICY "Contract parties can view invoices" ON invoices
    FOR SELECT USING (
        auth.uid() IN (
            SELECT c.user_id FROM companies c
            JOIN contracts ct ON c.id = ct.company_id
            WHERE ct.id = contract_id
            UNION
            SELECT cf.user_id FROM cfos cf
            JOIN contracts ct ON cf.id = ct.cfo_id
            WHERE ct.id = contract_id
        )
    );
```

## 5. 次のステップ

1. Supabaseダッシュボードで上記SQLを実行
2. `.env.local`ファイルの設定
3. 型定義の生成
4. API Routes の実装に進む

これでSupabaseの基本セットアップが完了します。