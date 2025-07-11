-- RightArm v3 Supabase Database Schema
-- 実行順序: このファイルをSupabaseのSQL Editorに貼り付けて実行してください
-- テーブル名: rightarm_ プレフィックス付き

-- ====================
-- 1. 基本テーブル作成
-- ====================

-- rightarm_users テーブル（ユーザー基本情報）
CREATE TABLE IF NOT EXISTS rightarm_users (
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

-- rightarm_user_profiles テーブル（ユーザープロフィール詳細）
CREATE TABLE IF NOT EXISTS rightarm_user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES rightarm_users(id) ON DELETE CASCADE,
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

-- rightarm_companies テーブル（企業情報）
CREATE TABLE IF NOT EXISTS rightarm_companies (
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

-- rightarm_cfos テーブル（CFO詳細情報）
CREATE TABLE IF NOT EXISTS rightarm_cfos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES rightarm_users(id) ON DELETE CASCADE,
    experience_years INTEGER,
    experience_summary TEXT,
    achievements JSONB DEFAULT '[]'::jsonb,
    certifications JSONB DEFAULT '[]'::jsonb,
    
    -- 対応可能性
    is_available BOOLEAN DEFAULT TRUE,
    max_concurrent_projects INTEGER DEFAULT 3,
    
    -- 評価情報
    rating DECIMAL(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================
-- 2. タグ管理テーブル
-- ====================

-- rightarm_skill_tags テーブル（スキルタグ）
CREATE TABLE IF NOT EXISTS rightarm_skill_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- rightarm_challenge_tags テーブル（財務課題タグ）
CREATE TABLE IF NOT EXISTS rightarm_challenge_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- rightarm_cfo_skills テーブル（CFOのスキル関連付け）
CREATE TABLE IF NOT EXISTS rightarm_cfo_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cfo_id UUID NOT NULL REFERENCES rightarm_cfos(id) ON DELETE CASCADE,
    skill_tag_id UUID NOT NULL REFERENCES rightarm_skill_tags(id),
    proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'intermediate',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cfo_id, skill_tag_id)
);

-- rightarm_company_challenges テーブル（企業の財務課題関連付け）
CREATE TABLE IF NOT EXISTS rightarm_company_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES rightarm_companies(id) ON DELETE CASCADE,
    challenge_tag_id UUID NOT NULL REFERENCES rightarm_challenge_tags(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, challenge_tag_id)
);

-- ====================
-- 3. マッチング・スカウト機能
-- ====================

-- rightarm_interests テーブル（気になる）
CREATE TABLE IF NOT EXISTS rightarm_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES rightarm_users(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES rightarm_users(id) ON DELETE CASCADE,
    target_type TEXT CHECK (target_type IN ('company', 'cfo')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_user_id)
);

-- rightarm_scouts テーブル（スカウト）
CREATE TABLE IF NOT EXISTS rightarm_scouts (
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

-- ====================
-- 4. 契約・決済機能
-- ====================

-- rightarm_contracts テーブル（契約）
CREATE TABLE IF NOT EXISTS rightarm_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES rightarm_companies(id),
    cfo_id UUID NOT NULL REFERENCES rightarm_cfos(id),
    
    -- 契約条件
    monthly_fee INTEGER NOT NULL,
    contract_period INTEGER DEFAULT 12,
    work_hours_per_month INTEGER,
    start_date DATE NOT NULL,
    end_date DATE,
    
    -- 契約ステータス
    status TEXT CHECK (status IN ('draft', 'active', 'completed', 'terminated')) DEFAULT 'draft',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- rightarm_invoices テーブル（請求書）
CREATE TABLE IF NOT EXISTS rightarm_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES rightarm_contracts(id),
    
    -- 請求情報
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- 金額計算
    consulting_fee INTEGER NOT NULL,
    platform_fee_rate DECIMAL(3,2) DEFAULT 0.05,
    platform_fee INTEGER NOT NULL,
    total_amount INTEGER NOT NULL,
    
    -- 支払い状況
    status TEXT CHECK (status IN ('pending', 'paid', 'verified', 'overdue')) DEFAULT 'pending',
    paid_at TIMESTAMP WITH TIME ZONE,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- 証憑管理
    payment_proof_urls JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================
-- 5. メッセージング機能
-- ====================

-- rightarm_conversations テーブル（会話スレッド）
CREATE TABLE IF NOT EXISTS rightarm_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant1_id UUID NOT NULL REFERENCES rightarm_users(id) ON DELETE CASCADE,
    participant2_id UUID NOT NULL REFERENCES rightarm_users(id) ON DELETE CASCADE,
    title VARCHAR(200),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(participant1_id, participant2_id)
);

-- rightarm_messages テーブル（メッセージ）
CREATE TABLE IF NOT EXISTS rightarm_messages (
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

-- ====================
-- 6. 通知システム
-- ====================

-- rightarm_notifications テーブル（通知）
CREATE TABLE IF NOT EXISTS rightarm_notifications (
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

-- ====================
-- 7. 管理者機能
-- ====================

-- rightarm_admin_users テーブル（管理者ユーザー）
CREATE TABLE IF NOT EXISTS rightarm_admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role TEXT CHECK (role IN ('super_admin', 'admin', 'moderator')) DEFAULT 'admin',
    permissions JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- rightarm_audit_logs テーブル（監査ログ）
CREATE TABLE IF NOT EXISTS rightarm_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES rightarm_users(id),
    admin_user_id UUID REFERENCES rightarm_admin_users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================
-- 8. インデックス作成
-- ====================

-- ユーザー関連インデックス
CREATE INDEX IF NOT EXISTS idx_rightarm_users_email ON rightarm_users(email);
CREATE INDEX IF NOT EXISTS idx_rightarm_users_type_status ON rightarm_users(user_type, status);
CREATE INDEX IF NOT EXISTS idx_rightarm_users_created_at ON rightarm_users(created_at);

-- プロフィール関連インデックス
CREATE INDEX IF NOT EXISTS idx_rightarm_user_profiles_user_id ON rightarm_user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_rightarm_user_profiles_region ON rightarm_user_profiles(region);

-- 企業関連インデックス
CREATE INDEX IF NOT EXISTS idx_rightarm_companies_user_id ON rightarm_companies(user_id);
CREATE INDEX IF NOT EXISTS idx_rightarm_companies_industry_region ON rightarm_companies(industry, region);
CREATE INDEX IF NOT EXISTS idx_rightarm_companies_recruiting ON rightarm_companies(is_recruiting);
CREATE INDEX IF NOT EXISTS idx_rightarm_companies_urgency ON rightarm_companies(recruitment_urgency);

-- CFO関連インデックス
CREATE INDEX IF NOT EXISTS idx_rightarm_cfos_user_id ON rightarm_cfos(user_id);
CREATE INDEX IF NOT EXISTS idx_rightarm_cfos_available ON rightarm_cfos(is_available);
CREATE INDEX IF NOT EXISTS idx_rightarm_cfos_rating ON rightarm_cfos(rating DESC);

-- スキル・課題関連インデックス
CREATE INDEX IF NOT EXISTS idx_rightarm_skill_tags_category ON rightarm_skill_tags(category);
CREATE INDEX IF NOT EXISTS idx_rightarm_skill_tags_usage ON rightarm_skill_tags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_rightarm_cfo_skills_cfo ON rightarm_cfo_skills(cfo_id);
CREATE INDEX IF NOT EXISTS idx_rightarm_cfo_skills_tag ON rightarm_cfo_skills(skill_tag_id);
CREATE INDEX IF NOT EXISTS idx_rightarm_company_challenges_company ON rightarm_company_challenges(company_id);
CREATE INDEX IF NOT EXISTS idx_rightarm_company_challenges_tag ON rightarm_company_challenges(challenge_tag_id);

-- マッチング関連インデックス
CREATE INDEX IF NOT EXISTS idx_rightarm_interests_user ON rightarm_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_rightarm_interests_target ON rightarm_interests(target_user_id, target_type);
CREATE INDEX IF NOT EXISTS idx_rightarm_scouts_sender ON rightarm_scouts(sender_id);
CREATE INDEX IF NOT EXISTS idx_rightarm_scouts_recipient ON rightarm_scouts(recipient_id);
CREATE INDEX IF NOT EXISTS idx_rightarm_scouts_status ON rightarm_scouts(status);

-- 契約・決済関連インデックス
CREATE INDEX IF NOT EXISTS idx_rightarm_contracts_company_cfo ON rightarm_contracts(company_id, cfo_id);
CREATE INDEX IF NOT EXISTS idx_rightarm_contracts_status ON rightarm_contracts(status);
CREATE INDEX IF NOT EXISTS idx_rightarm_invoices_contract ON rightarm_invoices(contract_id);
CREATE INDEX IF NOT EXISTS idx_rightarm_invoices_status ON rightarm_invoices(status);

-- メッセージング関連インデックス
CREATE INDEX IF NOT EXISTS idx_rightarm_conversations_participants ON rightarm_conversations(participant1_id, participant2_id);
CREATE INDEX IF NOT EXISTS idx_rightarm_conversations_last_message ON rightarm_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_rightarm_messages_conversation ON rightarm_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_rightarm_messages_sender ON rightarm_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_rightarm_messages_sent_at ON rightarm_messages(sent_at DESC);

-- 通知関連インデックス
CREATE INDEX IF NOT EXISTS idx_rightarm_notifications_user ON rightarm_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_rightarm_notifications_type ON rightarm_notifications(type);
CREATE INDEX IF NOT EXISTS idx_rightarm_notifications_unread ON rightarm_notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_rightarm_notifications_created ON rightarm_notifications(created_at DESC);

-- 管理者関連インデックス
CREATE INDEX IF NOT EXISTS idx_rightarm_admin_users_email ON rightarm_admin_users(email);
CREATE INDEX IF NOT EXISTS idx_rightarm_audit_logs_user ON rightarm_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_rightarm_audit_logs_created ON rightarm_audit_logs(created_at DESC);

-- ====================
-- 9. トリガー関数作成
-- ====================

-- updated_at自動更新トリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガー設定（テーブル作成後に実行）
DO $$
BEGIN
    -- rightarm_users テーブルにトリガーを追加
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rightarm_users') THEN
        DROP TRIGGER IF EXISTS update_rightarm_users_updated_at ON rightarm_users;
        CREATE TRIGGER update_rightarm_users_updated_at BEFORE UPDATE ON rightarm_users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- rightarm_user_profiles テーブルにトリガーを追加
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rightarm_user_profiles') THEN
        DROP TRIGGER IF EXISTS update_rightarm_user_profiles_updated_at ON rightarm_user_profiles;
        CREATE TRIGGER update_rightarm_user_profiles_updated_at BEFORE UPDATE ON rightarm_user_profiles
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- rightarm_companies テーブルにトリガーを追加
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rightarm_companies') THEN
        DROP TRIGGER IF EXISTS update_rightarm_companies_updated_at ON rightarm_companies;
        CREATE TRIGGER update_rightarm_companies_updated_at BEFORE UPDATE ON rightarm_companies
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- rightarm_cfos テーブルにトリガーを追加
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rightarm_cfos') THEN
        DROP TRIGGER IF EXISTS update_rightarm_cfos_updated_at ON rightarm_cfos;
        CREATE TRIGGER update_rightarm_cfos_updated_at BEFORE UPDATE ON rightarm_cfos
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    -- rightarm_contracts テーブルにトリガーを追加
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rightarm_contracts') THEN
        DROP TRIGGER IF EXISTS update_rightarm_contracts_updated_at ON rightarm_contracts;
        CREATE TRIGGER update_rightarm_contracts_updated_at BEFORE UPDATE ON rightarm_contracts
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ====================
-- 10. 初期データ投入
-- ====================

-- スキルタグ初期データ
INSERT INTO rightarm_skill_tags (name, category) VALUES
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
('財務分析', 'その他')
ON CONFLICT (name) DO NOTHING;

-- 財務課題タグ初期データ
INSERT INTO rightarm_challenge_tags (name) VALUES
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
('その他')
ON CONFLICT (name) DO NOTHING;

-- ====================
-- 11. RLS（Row Level Security）設定
-- ====================

-- RLS有効化
ALTER TABLE rightarm_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rightarm_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rightarm_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE rightarm_cfos ENABLE ROW LEVEL SECURITY;
ALTER TABLE rightarm_cfo_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE rightarm_company_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE rightarm_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rightarm_scouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rightarm_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rightarm_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE rightarm_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rightarm_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE rightarm_notifications ENABLE ROW LEVEL SECURITY;

-- 開発段階用のRLSポリシー（全アクセス許可）
-- 本番環境では適切なポリシーに変更してください

CREATE POLICY "Enable read access for all users" ON rightarm_users FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON rightarm_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON rightarm_users FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON rightarm_users FOR DELETE USING (true);

CREATE POLICY "Enable read access for all user_profiles" ON rightarm_user_profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all user_profiles" ON rightarm_user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all user_profiles" ON rightarm_user_profiles FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all user_profiles" ON rightarm_user_profiles FOR DELETE USING (true);

CREATE POLICY "Enable read access for all companies" ON rightarm_companies FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all companies" ON rightarm_companies FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all companies" ON rightarm_companies FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all companies" ON rightarm_companies FOR DELETE USING (true);

CREATE POLICY "Enable read access for all cfos" ON rightarm_cfos FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all cfos" ON rightarm_cfos FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all cfos" ON rightarm_cfos FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all cfos" ON rightarm_cfos FOR DELETE USING (true);

CREATE POLICY "Enable read access for all cfo_skills" ON rightarm_cfo_skills FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all cfo_skills" ON rightarm_cfo_skills FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all cfo_skills" ON rightarm_cfo_skills FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all cfo_skills" ON rightarm_cfo_skills FOR DELETE USING (true);

CREATE POLICY "Enable read access for all company_challenges" ON rightarm_company_challenges FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all company_challenges" ON rightarm_company_challenges FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all company_challenges" ON rightarm_company_challenges FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all company_challenges" ON rightarm_company_challenges FOR DELETE USING (true);

CREATE POLICY "Enable read access for all interests" ON rightarm_interests FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all interests" ON rightarm_interests FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all interests" ON rightarm_interests FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all interests" ON rightarm_interests FOR DELETE USING (true);

CREATE POLICY "Enable read access for all scouts" ON rightarm_scouts FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all scouts" ON rightarm_scouts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all scouts" ON rightarm_scouts FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all scouts" ON rightarm_scouts FOR DELETE USING (true);

CREATE POLICY "Enable read access for all contracts" ON rightarm_contracts FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all contracts" ON rightarm_contracts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all contracts" ON rightarm_contracts FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all contracts" ON rightarm_contracts FOR DELETE USING (true);

CREATE POLICY "Enable read access for all invoices" ON rightarm_invoices FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all invoices" ON rightarm_invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all invoices" ON rightarm_invoices FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all invoices" ON rightarm_invoices FOR DELETE USING (true);

CREATE POLICY "Enable read access for all conversations" ON rightarm_conversations FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all conversations" ON rightarm_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all conversations" ON rightarm_conversations FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all conversations" ON rightarm_conversations FOR DELETE USING (true);

CREATE POLICY "Enable read access for all messages" ON rightarm_messages FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all messages" ON rightarm_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all messages" ON rightarm_messages FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all messages" ON rightarm_messages FOR DELETE USING (true);

CREATE POLICY "Enable read access for all notifications" ON rightarm_notifications FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all notifications" ON rightarm_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all notifications" ON rightarm_notifications FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all notifications" ON rightarm_notifications FOR DELETE USING (true);

-- タグテーブルは全ユーザーが読み取り可能
CREATE POLICY "Enable read access for all skill_tags" ON rightarm_skill_tags FOR SELECT USING (true);
CREATE POLICY "Enable read access for all challenge_tags" ON rightarm_challenge_tags FOR SELECT USING (true);

-- ====================
-- 完了メッセージ
-- ====================

DO $$
BEGIN
    RAISE NOTICE 'RightArm v3 データベーススキーマの作成が完了しました！';
    RAISE NOTICE '作成されたテーブル数: %', (
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name LIKE 'rightarm_%'
    );
    RAISE NOTICE '次のステップ: .env.localファイルにSupabase接続情報を設定してください';
END $$;