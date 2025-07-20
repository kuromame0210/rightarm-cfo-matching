-- CFOプロフィールテーブルにハイブリッド入力フィールドを追加
-- 2025-01-19: テキスト入力 + 構造化データの両方をサポート

-- =====================================================
-- 報酬関連のハイブリッドフィールド
-- =====================================================

-- 既存のテキストフィールドはそのまま維持
-- cfo_compensation TEXT (既存) - 自由記述
-- cfo_fee_min INTEGER (既存) - 最低金額
-- cfo_fee_max INTEGER (既存) - 最高金額

-- 新規追加: 構造化報酬データ
ALTER TABLE cfo_profiles 
ADD COLUMN IF NOT EXISTS compensation_type TEXT CHECK (compensation_type IN ('hourly', 'monthly', 'project', 'performance', 'negotiable')),
ADD COLUMN IF NOT EXISTS hourly_rate_min INTEGER,
ADD COLUMN IF NOT EXISTS hourly_rate_max INTEGER, 
ADD COLUMN IF NOT EXISTS monthly_fee_min INTEGER,
ADD COLUMN IF NOT EXISTS monthly_fee_max INTEGER,
ADD COLUMN IF NOT EXISTS project_fee_min INTEGER,
ADD COLUMN IF NOT EXISTS project_fee_max INTEGER,
ADD COLUMN IF NOT EXISTS compensation_negotiable BOOLEAN DEFAULT false;

-- =====================================================
-- 稼働条件のハイブリッドフィールド  
-- =====================================================

-- 既存のテキストフィールドはそのまま維持
-- cfo_availability TEXT (既存) - 自由記述

-- 新規追加: 構造化稼働条件
ALTER TABLE cfo_profiles
ADD COLUMN IF NOT EXISTS weekly_days INTEGER CHECK (weekly_days BETWEEN 1 AND 7),
ADD COLUMN IF NOT EXISTS weekly_days_flexible BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS daily_hours_min INTEGER CHECK (daily_hours_min > 0),
ADD COLUMN IF NOT EXISTS daily_hours_max INTEGER CHECK (daily_hours_max > 0),
ADD COLUMN IF NOT EXISTS daily_hours_flexible BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS preferred_time_slots JSONB DEFAULT '[]', -- ['morning', 'afternoon', 'evening']
ADD COLUMN IF NOT EXISTS time_completely_flexible BOOLEAN DEFAULT false;

-- =====================================================
-- 地域・勤務形態のハイブリッドフィールド
-- =====================================================

-- 既存のテキストフィールドはそのまま維持  
-- cfo_working_areas TEXT (既存) - 自由記述
-- cfo_location TEXT (既存) - 居住地

-- 新規追加: 構造化地域対応
ALTER TABLE cfo_profiles
ADD COLUMN IF NOT EXISTS work_styles JSONB DEFAULT '[]', -- ['remote', 'hybrid', 'onsite']
ADD COLUMN IF NOT EXISTS supported_prefectures JSONB DEFAULT '[]', -- ['tokyo', 'kanagawa', 'osaka'] 
ADD COLUMN IF NOT EXISTS business_trip_domestic BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS business_trip_international BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS nationwide_support BOOLEAN DEFAULT false;

-- =====================================================
-- 業界・企業規模経験のハイブリッドフィールド
-- =====================================================

-- 既存のテキストフィールドはそのまま維持
-- cfo_raw_profile TEXT (既存) - 職歴詳細
-- cfo_possible_tasks TEXT (既存) - 業務内容

-- 新規追加: 構造化経験データ
ALTER TABLE cfo_profiles
ADD COLUMN IF NOT EXISTS industry_experience JSONB DEFAULT '[]', -- ['IT', 'healthcare', 'manufacturing']
ADD COLUMN IF NOT EXISTS company_size_experience JSONB DEFAULT '[]', -- ['startup', 'sme', 'large']
ADD COLUMN IF NOT EXISTS project_types JSONB DEFAULT '[]', -- ['ipo', 'ma', 'fundraising']
ADD COLUMN IF NOT EXISTS years_of_experience INTEGER,
ADD COLUMN IF NOT EXISTS cfo_level TEXT CHECK (cfo_level IN ('assistant', 'manager', 'director', 'cfo', 'fractional'));

-- =====================================================
-- 検索用インデックス（構造化フィールド用）
-- =====================================================

-- 報酬検索用
CREATE INDEX IF NOT EXISTS idx_compensation_type ON cfo_profiles(compensation_type);
CREATE INDEX IF NOT EXISTS idx_hourly_rate ON cfo_profiles(hourly_rate_min, hourly_rate_max);
CREATE INDEX IF NOT EXISTS idx_monthly_fee ON cfo_profiles(monthly_fee_min, monthly_fee_max);

-- 稼働条件検索用
CREATE INDEX IF NOT EXISTS idx_weekly_days ON cfo_profiles(weekly_days);
CREATE INDEX IF NOT EXISTS idx_daily_hours ON cfo_profiles(daily_hours_min, daily_hours_max);
CREATE INDEX IF NOT EXISTS idx_time_slots ON cfo_profiles USING gin(preferred_time_slots);

-- 地域・勤務形態検索用
CREATE INDEX IF NOT EXISTS idx_work_styles ON cfo_profiles USING gin(work_styles);
CREATE INDEX IF NOT EXISTS idx_prefectures ON cfo_profiles USING gin(supported_prefectures);

-- 業界経験検索用
CREATE INDEX IF NOT EXISTS idx_industry_exp ON cfo_profiles USING gin(industry_experience);
CREATE INDEX IF NOT EXISTS idx_company_size ON cfo_profiles USING gin(company_size_experience);
CREATE INDEX IF NOT EXISTS idx_project_types ON cfo_profiles USING gin(project_types);
CREATE INDEX IF NOT EXISTS idx_years_exp ON cfo_profiles(years_of_experience);

-- =====================================================
-- データ整合性チェック用関数
-- =====================================================

-- 構造化データとテキストデータの整合性をチェック
CREATE OR REPLACE FUNCTION check_compensation_consistency()
RETURNS TRIGGER AS $$
BEGIN
  -- 構造化データが入力された場合、テキストも更新
  IF NEW.compensation_type IS NOT NULL THEN
    NEW.cfo_compensation = COALESCE(NEW.cfo_compensation, '') || 
      CASE 
        WHEN NEW.compensation_type = 'hourly' THEN 
          CONCAT('時給 ', NEW.hourly_rate_min, '〜', NEW.hourly_rate_max, '円')
        WHEN NEW.compensation_type = 'monthly' THEN
          CONCAT('月額 ', NEW.monthly_fee_min/10000, '〜', NEW.monthly_fee_max/10000, '万円')
        ELSE NEW.compensation_type
      END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー設定
DROP TRIGGER IF EXISTS compensation_consistency_trigger ON cfo_profiles;
CREATE TRIGGER compensation_consistency_trigger
  BEFORE INSERT OR UPDATE ON cfo_profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_compensation_consistency();

-- =====================================================
-- コメント追加（管理・理解用）
-- =====================================================

COMMENT ON COLUMN cfo_profiles.compensation_type IS '報酬体系タイプ（hourly/monthly/project/performance/negotiable）';
COMMENT ON COLUMN cfo_profiles.hourly_rate_min IS '時給下限（円）';
COMMENT ON COLUMN cfo_profiles.hourly_rate_max IS '時給上限（円）';
COMMENT ON COLUMN cfo_profiles.monthly_fee_min IS '月額報酬下限（円）';
COMMENT ON COLUMN cfo_profiles.monthly_fee_max IS '月額報酬上限（円）';

COMMENT ON COLUMN cfo_profiles.weekly_days IS '週稼働日数（1-7日）';
COMMENT ON COLUMN cfo_profiles.daily_hours_min IS '1日稼働時間下限（時間）';
COMMENT ON COLUMN cfo_profiles.daily_hours_max IS '1日稼働時間上限（時間）';
COMMENT ON COLUMN cfo_profiles.preferred_time_slots IS '希望時間帯（JSONB配列）';

COMMENT ON COLUMN cfo_profiles.work_styles IS '勤務形態（remote/hybrid/onsite）';
COMMENT ON COLUMN cfo_profiles.supported_prefectures IS '対応可能都道府県（JSONB配列）';
COMMENT ON COLUMN cfo_profiles.industry_experience IS '業界経験（JSONB配列）';
COMMENT ON COLUMN cfo_profiles.company_size_experience IS '企業規模経験（JSONB配列）';

-- =====================================================
-- 確認用クエリ
-- =====================================================

-- テーブル構造確認
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'cfo_profiles' 
    AND column_name LIKE '%compensation%'
    OR column_name LIKE '%weekly%'
    OR column_name LIKE '%daily%'
    OR column_name LIKE '%work_style%'
    OR column_name LIKE '%industry%'
ORDER BY column_name;

-- インデックス確認
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'cfo_profiles'
    AND indexname LIKE 'idx_%'
ORDER BY indexname;