-- CFOプロフィール編集画面用の選択式項目を追加
-- 2025-01-19: 報酬・地域・稼働条件・経験年数の構造化

-- =====================================================
-- 1. 報酬関連の選択式フィールド
-- =====================================================

ALTER TABLE cfo_profiles 
-- 報酬体系タイプ（選択式）
ADD COLUMN IF NOT EXISTS compensation_type TEXT 
  CHECK (compensation_type IN ('hourly', 'monthly', 'project', 'performance', 'negotiable')),

-- 時給レンジ（選択式）
ADD COLUMN IF NOT EXISTS hourly_rate_min INTEGER,
ADD COLUMN IF NOT EXISTS hourly_rate_max INTEGER,

-- 月額レンジ（選択式）  
ADD COLUMN IF NOT EXISTS monthly_fee_min INTEGER,
ADD COLUMN IF NOT EXISTS monthly_fee_max INTEGER,

-- 応相談フラグ
ADD COLUMN IF NOT EXISTS compensation_negotiable BOOLEAN DEFAULT false;

-- =====================================================
-- 2. 稼働条件の選択式フィールド
-- =====================================================

ALTER TABLE cfo_profiles
-- 週稼働日数（選択式: 1-7日）
ADD COLUMN IF NOT EXISTS weekly_days INTEGER 
  CHECK (weekly_days BETWEEN 1 AND 7),

-- 週稼働日数の柔軟性
ADD COLUMN IF NOT EXISTS weekly_days_flexible BOOLEAN DEFAULT false,

-- 1日稼働時間（選択式: 1-12時間）
ADD COLUMN IF NOT EXISTS daily_hours INTEGER 
  CHECK (daily_hours BETWEEN 1 AND 12),

-- 1日稼働時間の柔軟性
ADD COLUMN IF NOT EXISTS daily_hours_flexible BOOLEAN DEFAULT false,

-- 稼働時間帯（複数選択可: JSONB配列）
ADD COLUMN IF NOT EXISTS preferred_time_slots JSONB DEFAULT '[]',
-- 例: ["morning", "afternoon", "evening", "flexible"]

-- 稼働形態（複数選択可: JSONB配列）
ADD COLUMN IF NOT EXISTS work_styles JSONB DEFAULT '[]';
-- 例: ["remote", "hybrid", "onsite"]

-- =====================================================
-- 3. 地域・対応エリアの選択式フィールド
-- =====================================================

ALTER TABLE cfo_profiles
-- 対応可能都道府県（複数選択可: JSONB配列）
ADD COLUMN IF NOT EXISTS supported_prefectures JSONB DEFAULT '[]',
-- 例: ["tokyo", "kanagawa", "osaka", "nationwide"]

-- 出張対応レベル
ADD COLUMN IF NOT EXISTS business_trip_level TEXT 
  CHECK (business_trip_level IN ('none', 'domestic', 'international')),

-- 完全リモート対応可能
ADD COLUMN IF NOT EXISTS full_remote_available BOOLEAN DEFAULT false;

-- =====================================================
-- 4. 経験年数・レベルの選択式フィールド
-- =====================================================

ALTER TABLE cfo_profiles
-- CFO経験年数（選択式: 年数）
ADD COLUMN IF NOT EXISTS cfo_experience_years INTEGER 
  CHECK (cfo_experience_years >= 0),

-- CFOレベル（選択式）
ADD COLUMN IF NOT EXISTS cfo_level TEXT 
  CHECK (cfo_level IN ('assistant', 'manager', 'director', 'cfo', 'fractional')),

-- 業界経験（複数選択可: JSONB配列）
ADD COLUMN IF NOT EXISTS industry_experience JSONB DEFAULT '[]',
-- 例: ["IT", "healthcare", "manufacturing", "finance", "consulting"]

-- 企業規模経験（複数選択可: JSONB配列）
ADD COLUMN IF NOT EXISTS company_size_experience JSONB DEFAULT '[]',
-- 例: ["startup", "sme", "midsize", "large", "multinational"]

-- プロジェクト経験（複数選択可: JSONB配列）
ADD COLUMN IF NOT EXISTS project_experience JSONB DEFAULT '[]';
-- 例: ["ipo", "ma", "fundraising", "restructuring", "internationalization"]

-- =====================================================
-- 5. 検索用インデックス作成
-- =====================================================

-- 報酬検索用
CREATE INDEX IF NOT EXISTS idx_compensation_type ON cfo_profiles(compensation_type);
CREATE INDEX IF NOT EXISTS idx_hourly_rate_range ON cfo_profiles(hourly_rate_min, hourly_rate_max) 
  WHERE compensation_type = 'hourly';
CREATE INDEX IF NOT EXISTS idx_monthly_fee_range ON cfo_profiles(monthly_fee_min, monthly_fee_max) 
  WHERE compensation_type = 'monthly';

-- 稼働条件検索用
CREATE INDEX IF NOT EXISTS idx_weekly_days ON cfo_profiles(weekly_days);
CREATE INDEX IF NOT EXISTS idx_daily_hours ON cfo_profiles(daily_hours);
CREATE INDEX IF NOT EXISTS idx_work_styles ON cfo_profiles USING gin(work_styles);
CREATE INDEX IF NOT EXISTS idx_time_slots ON cfo_profiles USING gin(preferred_time_slots);

-- 地域検索用
CREATE INDEX IF NOT EXISTS idx_prefectures ON cfo_profiles USING gin(supported_prefectures);
CREATE INDEX IF NOT EXISTS idx_business_trip ON cfo_profiles(business_trip_level);
CREATE INDEX IF NOT EXISTS idx_remote_available ON cfo_profiles(full_remote_available) 
  WHERE full_remote_available = true;

-- 経験検索用
CREATE INDEX IF NOT EXISTS idx_cfo_experience ON cfo_profiles(cfo_experience_years);
CREATE INDEX IF NOT EXISTS idx_cfo_level ON cfo_profiles(cfo_level);
CREATE INDEX IF NOT EXISTS idx_industry_exp ON cfo_profiles USING gin(industry_experience);
CREATE INDEX IF NOT EXISTS idx_company_size_exp ON cfo_profiles USING gin(company_size_experience);
CREATE INDEX IF NOT EXISTS idx_project_exp ON cfo_profiles USING gin(project_experience);

-- =====================================================
-- 6. 選択肢マスターデータ（定数として定義）
-- =====================================================

-- 選択肢データをコメントとして記録（フロントエンドで使用）

-- 報酬体系タイプの選択肢
COMMENT ON COLUMN cfo_profiles.compensation_type IS 
'報酬体系: hourly(時給制), monthly(月額制), project(プロジェクト単位), performance(成果報酬), negotiable(応相談)';

-- 時給レンジの選択肢（円）
COMMENT ON COLUMN cfo_profiles.hourly_rate_min IS 
'時給下限: 推奨値 [3000, 4000, 5000, 6000, 8000, 10000, 12000, 15000]';

-- 月額レンジの選択肢（円）
COMMENT ON COLUMN cfo_profiles.monthly_fee_min IS 
'月額下限: 推奨値 [50000, 100000, 150000, 200000, 300000, 400000, 500000]';

-- 週稼働日数の選択肢
COMMENT ON COLUMN cfo_profiles.weekly_days IS 
'週稼働日数: 1-7日 + flexible(応相談)フラグ';

-- 1日稼働時間の選択肢
COMMENT ON COLUMN cfo_profiles.daily_hours IS 
'1日稼働時間: 推奨値 [2, 4, 6, 8, 10] + flexible(応相談)フラグ';

-- 稼働時間帯の選択肢
COMMENT ON COLUMN cfo_profiles.preferred_time_slots IS 
'稼働時間帯: ["morning"(9-12), "afternoon"(12-18), "evening"(18-21), "flexible"(問わず)]';

-- 稼働形態の選択肢  
COMMENT ON COLUMN cfo_profiles.work_styles IS 
'稼働形態: ["remote"(リモート), "hybrid"(ハイブリッド), "onsite"(オンサイト)]';

-- 都道府県の選択肢
COMMENT ON COLUMN cfo_profiles.supported_prefectures IS 
'対応都道府県: ["tokyo", "kanagawa", "osaka", "kyoto", "aichi", "fukuoka", "nationwide"(全国)]';

-- CFOレベルの選択肢
COMMENT ON COLUMN cfo_profiles.cfo_level IS 
'CFOレベル: assistant(アシスタント), manager(マネージャー), director(ディレクター), cfo(CFO), fractional(フラクショナル)';

-- 業界経験の選択肢
COMMENT ON COLUMN cfo_profiles.industry_experience IS 
'業界経験: ["IT", "healthcare", "manufacturing", "finance", "consulting", "retail", "education"]';

-- 企業規模経験の選択肢
COMMENT ON COLUMN cfo_profiles.company_size_experience IS 
'企業規模: ["startup"(<50名), "sme"(50-300名), "midsize"(300-1000名), "large"(1000名+), "multinational"(多国籍)]';

-- プロジェクト経験の選択肢
COMMENT ON COLUMN cfo_profiles.project_experience IS 
'プロジェクト: ["ipo"(IPO・上場), "ma"(M&A), "fundraising"(資金調達), "restructuring"(リストラ), "internationalization"(国際化)]';

-- =====================================================
-- 7. データ検証・確認用クエリ
-- =====================================================

-- 新しいカラムの確認
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cfo_profiles' 
    AND column_name IN (
        'compensation_type', 'hourly_rate_min', 'monthly_fee_min',
        'weekly_days', 'daily_hours', 'work_styles',
        'supported_prefectures', 'cfo_experience_years', 'cfo_level',
        'industry_experience', 'company_size_experience', 'project_experience'
    )
ORDER BY column_name;

-- インデックスの確認
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'cfo_profiles'
    AND indexname LIKE 'idx_%'
ORDER BY indexname;

-- 制約の確認
SELECT 
    conname,
    contype,
    consrc
FROM pg_constraint 
WHERE conrelid = 'cfo_profiles'::regclass
    AND contype = 'c'  -- CHECK制約
ORDER BY conname;