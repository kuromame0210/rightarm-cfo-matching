-- Supabaseで実行するSQLスキーマ
-- Supabaseダッシュボード > SQL Editor にコピーして実行してください

-- プロフィールテーブルの作成
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY, -- Firebase UIDを保存
  email TEXT NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  user_type TEXT CHECK (user_type IN ('company', 'cfo')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);

-- Row Level Security (RLS) の有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLSポリシーの作成（ユーザーは自分のプロフィールのみアクセス可能）
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (true); -- 開発初期は全件閲覧可能に設定

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (true); -- 開発初期は全件更新可能に設定

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (true); -- 開発初期は全件挿入可能に設定

CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (true); -- 開発初期は全件削除可能に設定

-- 更新日時を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- プロフィールテーブルの更新日時トリガー
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 企業プロフィール拡張テーブル
CREATE TABLE IF NOT EXISTS company_profiles (
  id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT,
  company_size TEXT CHECK (company_size IN ('startup', 'small', 'medium', 'large')),
  funding_stage TEXT CHECK (funding_stage IN ('seed', 'series_a', 'series_b', 'series_c_later', 'ipo')),
  location TEXT,
  description TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CFOプロフィール拡張テーブル
CREATE TABLE IF NOT EXISTS cfo_profiles (
  id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  expertise JSONB, -- 専門領域をJSON配列で保存
  experience_years INTEGER,
  industries JSONB, -- 業界経験をJSON配列で保存
  work_style JSONB, -- 稼働条件をJSONで保存 (days_per_week, remote_ok, contract_type)
  hourly_rate INTEGER,
  bio TEXT,
  linkedin_url TEXT,
  certifications JSONB, -- 資格をJSON配列で保存
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 企業プロフィールテーブルにもトリガーを設定
CREATE TRIGGER update_company_profiles_updated_at BEFORE UPDATE ON company_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CFOプロフィールテーブルにもトリガーを設定
CREATE TRIGGER update_cfo_profiles_updated_at BEFORE UPDATE ON cfo_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータの挿入（開発用）
-- 注意: 実際の本番環境では削除してください
INSERT INTO profiles (id, email, display_name, user_type) VALUES
('sample_company_1', 'company@example.com', 'サンプル企業', 'company'),
('sample_cfo_1', 'cfo@example.com', 'サンプルCFO', 'cfo')
ON CONFLICT (id) DO NOTHING;

INSERT INTO company_profiles (id, company_name, industry, company_size, funding_stage, location, description) VALUES
('sample_company_1', 'サンプル株式会社', 'IT', 'startup', 'series_a', '東京都', 'サンプル企業の説明文です。')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cfo_profiles (id, first_name, last_name, expertise, experience_years, industries, work_style, bio) VALUES
('sample_cfo_1', '太郎', '山田', '["資金調達", "内部統制"]', 10, '["IT", "製造業"]', '{"days_per_week": 2, "remote_ok": true, "contract_type": "part_time"}', 'CFOとして10年の経験があります。')
ON CONFLICT (id) DO NOTHING;