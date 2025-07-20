-- CFOプロフィール選択式項目実装
-- 実行日: 2025-01-19
-- 実行者: Claude Code

-- =====================================================
-- 実行前の確認
-- =====================================================

-- 現在のテーブル構造を確認
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cfo_profiles' 
ORDER BY ordinal_position;

-- =====================================================
-- メインの構造化フィールド追加
-- =====================================================

\i sql/add-structured-profile-fields.sql

-- =====================================================
-- 実行後の確認
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
        'compensation_type', 'hourly_rate_min', 'monthly_fee_min',
        'weekly_days', 'daily_hours', 'work_styles',
        'supported_prefectures', 'cfo_experience_years', 'cfo_level',
        'industry_experience', 'company_size_experience', 'project_experience'
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

-- 制約の確認
SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'cfo_profiles'::regclass
    AND contype = 'c'  -- CHECK制約
ORDER BY conname;

-- =====================================================
-- テストデータの挿入（確認用）
-- =====================================================

-- テスト用データ挿入（既存CFOの構造化データ更新）
UPDATE cfo_profiles 
SET 
    compensation_type = 'monthly',
    monthly_fee_min = 100000,
    monthly_fee_max = 300000,
    weekly_days = 2,
    daily_hours = 4,
    work_styles = '["remote", "hybrid"]'::jsonb,
    supported_prefectures = '["tokyo", "kanagawa", "nationwide"]'::jsonb,
    cfo_level = 'fractional',
    cfo_experience_years = 10,
    industry_experience = '["IT", "healthcare"]'::jsonb,
    company_size_experience = '["startup", "sme"]'::jsonb,
    project_experience = '["ipo", "fundraising"]'::jsonb
WHERE cfo_user_id IN (
    SELECT cfo_user_id FROM cfo_profiles LIMIT 1
);

-- 構造化データが正しく保存されているかテスト
SELECT 
    cfo_name,
    compensation_type,
    monthly_fee_min,
    monthly_fee_max,
    weekly_days,
    work_styles,
    supported_prefectures,
    cfo_level,
    industry_experience,
    project_experience
FROM cfo_profiles 
WHERE compensation_type IS NOT NULL
LIMIT 3;

-- =====================================================
-- 検索機能テスト
-- =====================================================

-- テスト1: 報酬体系での検索
SELECT count(*) as monthly_compensation_cfos
FROM cfo_profiles 
WHERE compensation_type = 'monthly';

-- テスト2: 稼働条件での検索
SELECT count(*) as part_time_cfos
FROM cfo_profiles 
WHERE weekly_days <= 3;

-- テスト3: 勤務形態での検索（JSONB配列）
SELECT count(*) as remote_available_cfos
FROM cfo_profiles 
WHERE work_styles @> '["remote"]'::jsonb;

-- テスト4: 都道府県での検索（JSONB配列）
SELECT count(*) as tokyo_available_cfos
FROM cfo_profiles 
WHERE supported_prefectures @> '["tokyo"]'::jsonb
   OR supported_prefectures @> '["nationwide"]'::jsonb;

-- テスト5: 業界経験での検索（JSONB配列）
SELECT count(*) as it_experience_cfos
FROM cfo_profiles 
WHERE industry_experience @> '["IT"]'::jsonb;

-- テスト6: 複合検索テスト
SELECT 
    cfo_name,
    compensation_type,
    monthly_fee_min,
    weekly_days,
    work_styles,
    industry_experience
FROM cfo_profiles 
WHERE compensation_type = 'monthly'
  AND weekly_days <= 3
  AND work_styles @> '["remote"]'::jsonb
  AND industry_experience @> '["IT"]'::jsonb
LIMIT 5;

-- =====================================================
-- パフォーマンステスト
-- =====================================================

-- インデックス使用状況の確認
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM cfo_profiles 
WHERE compensation_type = 'monthly'
  AND monthly_fee_min <= 200000
  AND work_styles @> '["remote"]'::jsonb;

-- =====================================================
-- 完了メッセージ
-- =====================================================

SELECT 
    '✅ CFO選択式項目の実装が完了しました！' as status,
    now() as completion_time,
    (SELECT count(*) FROM cfo_profiles) as total_cfos,
    (SELECT count(*) FROM cfo_profiles WHERE compensation_type IS NOT NULL) as structured_cfos;