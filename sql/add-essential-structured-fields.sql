-- CFOプロフィール必要最小限の選択式項目
-- 2025-01-19: システムに必要な基本検索機能のみ

-- =====================================================
-- 1. 報酬関連（月額制のみ）
-- =====================================================

ALTER TABLE cfo_profiles 
-- 報酬体系（シンプル）
ADD COLUMN IF NOT EXISTS compensation_type TEXT 
  CHECK (compensation_type IN ('monthly', 'negotiable')),

-- 月額レンジ（最重要）
ADD COLUMN IF NOT EXISTS monthly_fee_min INTEGER,
ADD COLUMN IF NOT EXISTS monthly_fee_max INTEGER;

-- =====================================================
-- 2. 稼働条件（週稼働日数のみ）
-- =====================================================

ALTER TABLE cfo_profiles
-- 週稼働日数（最重要）
ADD COLUMN IF NOT EXISTS weekly_days INTEGER 
  CHECK (weekly_days BETWEEN 1 AND 7),

-- 週稼働日数の柔軟性
ADD COLUMN IF NOT EXISTS weekly_days_flexible BOOLEAN DEFAULT false;

-- =====================================================
-- 3. 地域対応（都道府県選択のみ）
-- =====================================================

ALTER TABLE cfo_profiles
-- 対応可能都道府県（JSONB配列）
ADD COLUMN IF NOT EXISTS supported_prefectures JSONB DEFAULT '[]',

-- 完全リモート対応
ADD COLUMN IF NOT EXISTS full_remote_available BOOLEAN DEFAULT false;

-- =====================================================
-- 4. 必要最小限のインデックス
-- =====================================================

-- 報酬検索用
CREATE INDEX IF NOT EXISTS idx_compensation_type ON cfo_profiles(compensation_type);
CREATE INDEX IF NOT EXISTS idx_monthly_fee_range ON cfo_profiles(monthly_fee_min, monthly_fee_max) 
  WHERE compensation_type = 'monthly';

-- 稼働条件検索用
CREATE INDEX IF NOT EXISTS idx_weekly_days ON cfo_profiles(weekly_days);

-- 地域検索用
CREATE INDEX IF NOT EXISTS idx_prefectures ON cfo_profiles USING gin(supported_prefectures);
CREATE INDEX IF NOT EXISTS idx_remote_available ON cfo_profiles(full_remote_available) 
  WHERE full_remote_available = true;

-- =====================================================
-- 5. コメント（管理用）
-- =====================================================

COMMENT ON COLUMN cfo_profiles.compensation_type IS '報酬体系: monthly(月額制), negotiable(応相談)';
COMMENT ON COLUMN cfo_profiles.monthly_fee_min IS '月額報酬下限（円）';
COMMENT ON COLUMN cfo_profiles.monthly_fee_max IS '月額報酬上限（円）';
COMMENT ON COLUMN cfo_profiles.weekly_days IS '週稼働日数（1-7日）';
COMMENT ON COLUMN cfo_profiles.weekly_days_flexible IS '週稼働日数の柔軟性';
COMMENT ON COLUMN cfo_profiles.supported_prefectures IS '対応エリア: ["kanto", "kansai", "chubu", "tohoku", "kyushu", "nationwide"]';
COMMENT ON COLUMN cfo_profiles.full_remote_available IS '完全リモート対応可能';

-- =====================================================
-- 6. 確認用クエリ
-- =====================================================

-- 追加されたカラムの確認
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cfo_profiles' 
    AND column_name IN (
        'compensation_type', 'monthly_fee_min', 'monthly_fee_max',
        'weekly_days', 'weekly_days_flexible',
        'supported_prefectures', 'full_remote_available'
    )
ORDER BY column_name;

-- インデックスの確認
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'cfo_profiles'
    AND indexname LIKE 'idx_%'
ORDER BY indexname;