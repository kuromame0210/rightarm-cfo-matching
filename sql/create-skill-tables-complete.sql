-- Complete Skill Tables Creation Script
-- =====================================================
-- スキル関連のテーブルとデータを作成します

-- 1. rextrix_skill_tags テーブル作成（マスターデータ）
CREATE TABLE IF NOT EXISTS rextrix_skill_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category TEXT NOT NULL DEFAULT 'その他',
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 999,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. rextrix_challenge_tags テーブル作成（企業の課題マスターデータ）
CREATE TABLE IF NOT EXISTS rextrix_challenge_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category TEXT NOT NULL DEFAULT 'その他',
    description TEXT,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 999,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. rextrix_cfo_skills テーブル作成（CFOとスキルの関連）
CREATE TABLE IF NOT EXISTS rextrix_cfo_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cfo_id UUID NOT NULL REFERENCES rextrix_cfos(id) ON DELETE CASCADE,
    skill_tag_id UUID NOT NULL REFERENCES rextrix_skill_tags(id) ON DELETE CASCADE,
    proficiency_level INTEGER DEFAULT 3 CHECK (proficiency_level BETWEEN 1 AND 5),
    experience_years INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 重複防止
    UNIQUE(cfo_id, skill_tag_id)
);

-- 4. rextrix_company_challenges テーブル作成（企業と課題の関連）
CREATE TABLE IF NOT EXISTS rextrix_company_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES rextrix_companies(id) ON DELETE CASCADE,
    challenge_tag_id UUID NOT NULL REFERENCES rextrix_challenge_tags(id) ON DELETE CASCADE,
    priority_level INTEGER DEFAULT 3 CHECK (priority_level BETWEEN 1 AND 5),
    urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'urgent')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 重複防止
    UNIQUE(company_id, challenge_tag_id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_rextrix_skill_tags_category ON rextrix_skill_tags(category);
CREATE INDEX IF NOT EXISTS idx_rextrix_skill_tags_active ON rextrix_skill_tags(is_active);
CREATE INDEX IF NOT EXISTS idx_rextrix_skill_tags_display_order ON rextrix_skill_tags(display_order);

CREATE INDEX IF NOT EXISTS idx_rextrix_challenge_tags_category ON rextrix_challenge_tags(category);
CREATE INDEX IF NOT EXISTS idx_rextrix_challenge_tags_active ON rextrix_challenge_tags(is_active);

CREATE INDEX IF NOT EXISTS idx_rextrix_cfo_skills_cfo_id ON rextrix_cfo_skills(cfo_id);
CREATE INDEX IF NOT EXISTS idx_rextrix_cfo_skills_skill_tag_id ON rextrix_cfo_skills(skill_tag_id);

CREATE INDEX IF NOT EXISTS idx_rextrix_company_challenges_company_id ON rextrix_company_challenges(company_id);
CREATE INDEX IF NOT EXISTS idx_rextrix_company_challenges_challenge_tag_id ON rextrix_company_challenges(challenge_tag_id);

-- RLS設定
ALTER TABLE rextrix_skill_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE rextrix_challenge_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE rextrix_cfo_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE rextrix_company_challenges ENABLE ROW LEVEL SECURITY;

-- スキルタグの初期データ挿入
INSERT INTO rextrix_skill_tags (name, category, description, display_order) 
VALUES 
    -- 資金調達関連
    ('資金調達', '資金調達・投資', 'エクイティ・デット調達全般', 10),
    ('IPO準備', '資金調達・投資', '株式公開準備業務', 20),
    ('M&A', '資金調達・投資', 'M&A戦略・実行支援', 30),
    ('VC・投資家対応', '資金調達・投資', 'ベンチャーキャピタル・投資家との関係構築', 40),
    ('銀行融資', '資金調達・投資', '銀行融資・金融機関対応', 50),
    
    -- 財務分析・企画
    ('財務分析', '財務分析・企画', '財務諸表分析・KPI設計', 110),
    ('予算策定', '財務分析・企画', '予算・計画策定', 120),
    ('事業計画', '財務分析・企画', '中長期事業計画策定', 130),
    ('投資評価', '財務分析・企画', '投資案件の評価・分析', 140),
    ('管理会計', '財務分析・企画', '管理会計制度設計・運用', 150),
    
    -- システム・DX
    ('ERP導入', 'システム・DX', 'ERP/会計システム導入', 210),
    ('財務DX', 'システム・DX', '財務業務のデジタル化', 220),
    ('データ分析', 'システム・DX', 'BIツール・データ分析', 230),
    ('システム企画', 'システム・DX', '財務・会計システム企画', 240),
    
    -- 組織・ガバナンス
    ('内部統制', '組織・ガバナンス', '内部統制制度構築・運用', 310),
    ('コンプライアンス', '組織・ガバナンス', 'コンプライアンス体制構築', 320),
    ('リスク管理', '組織・ガバナンス', 'リスク管理制度設計', 330),
    ('組織再編', '組織・ガバナンス', '組織再編・統合業務', 340),
    
    -- 特殊業務
    ('事業再生', '特殊業務', '事業再生・ターンアラウンド', 410),
    ('事業承継', '特殊業務', '事業承継・相続対策', 420),
    ('国際会計', '特殊業務', 'IFRS・国際会計基準', 430),
    ('税務戦略', '特殊業務', '税務戦略・タックスプランニング', 440)
ON CONFLICT (name) DO NOTHING;

-- 課題タグの初期データ挿入
INSERT INTO rextrix_challenge_tags (name, category, description, display_order)
VALUES 
    -- 資金・資本政策
    ('資金調達が必要', '資金・資本政策', '事業拡大・運転資金調達', 10),
    ('IPO準備支援', '資金・資本政策', '上場準備・体制整備', 20),
    ('M&A検討', '資金・資本政策', 'M&A戦略・買収支援', 30),
    ('資本政策見直し', '資金・資本政策', '資本構成・株主構成最適化', 40),
    
    -- 財務体制
    ('財務体制強化', '財務・経理体制', '財務機能・体制の強化', 110),
    ('経理業務効率化', '財務・経理体制', '経理業務プロセス改善', 120),
    ('予算管理改善', '財務・経理体制', '予算策定・管理制度改善', 130),
    ('財務報告高度化', '財務・経理体制', '財務報告・分析の高度化', 140),
    
    -- システム・DX
    ('会計システム導入', 'システム・DX', 'ERP・会計システム刷新', 210),
    ('財務DX推進', 'システム・DX', '財務業務のデジタル化', 220),
    ('データ活用', 'システム・DX', '財務データ分析・活用', 230),
    
    -- ガバナンス・コンプライアンス
    ('内部統制構築', 'ガバナンス・コンプライアンス', '内部統制制度整備', 310),
    ('コンプライアンス強化', 'ガバナンス・コンプライアンス', 'コンプライアンス体制強化', 320),
    ('リスク管理強化', 'ガバナンス・コンプライアンス', 'リスク管理制度構築', 330),
    
    -- 事業・戦略
    ('事業再生・改善', '事業・戦略', '業績改善・事業再生', 410),
    ('新規事業支援', '事業・戦略', '新規事業の財務支援', 420),
    ('海外展開支援', '事業・戦略', '海外進出・国際展開', 430),
    ('事業承継準備', '事業・戦略', '事業承継・世代交代', 440)
ON CONFLICT (name) DO NOTHING;

-- Row Level Security ポリシー
-- スキルタグは全ユーザー閲覧可能
CREATE POLICY "Everyone can view skill tags" ON rextrix_skill_tags
    FOR SELECT USING (true);

-- 課題タグも全ユーザー閲覧可能
CREATE POLICY "Everyone can view challenge tags" ON rextrix_challenge_tags
    FOR SELECT USING (true);

-- CFOスキルは本人のみ編集可能
CREATE POLICY "CFOs can manage their own skills" ON rextrix_cfo_skills
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM rextrix_cfos 
            WHERE id = cfo_id AND user_id::text = auth.uid()::text
        )
    );

-- 企業課題は本人のみ編集可能
CREATE POLICY "Companies can manage their own challenges" ON rextrix_company_challenges
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM rextrix_companies 
            WHERE id = company_id AND user_id::text = auth.uid()::text
        )
    );

-- 完了メッセージ
SELECT 'スキル関連テーブル作成完了: skill_tags, challenge_tags, cfo_skills, company_challenges' as result;