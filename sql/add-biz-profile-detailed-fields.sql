-- 企業プロフィールテーブルに詳細フィールドを追加
-- 2025-07-15: 企業プロフィールAPIで使用されている項目に対応

-- 企業プロフィールの詳細項目を追加
-- 実行方法: Supabase Dashboard > SQL Editor で実行
ALTER TABLE biz_profiles 
ADD COLUMN IF NOT EXISTS biz_description TEXT,
ADD COLUMN IF NOT EXISTS biz_revenue_range TEXT,
ADD COLUMN IF NOT EXISTS biz_challenge_background TEXT;

-- コメント追加（管理用）
COMMENT ON COLUMN biz_profiles.biz_description IS '事業内容・企業概要（詳細テキスト）';
COMMENT ON COLUMN biz_profiles.biz_revenue_range IS '売上規模（テキスト形式）';
COMMENT ON COLUMN biz_profiles.biz_challenge_background IS '経営課題・背景（詳細テキスト）';

-- 全文検索用インデックス追加
CREATE INDEX IF NOT EXISTS idx_biz_profiles_description ON biz_profiles USING gin(to_tsvector('japanese', biz_description));
CREATE INDEX IF NOT EXISTS idx_biz_profiles_challenge ON biz_profiles USING gin(to_tsvector('japanese', biz_challenge_background));

-- 既存データの移行（biz_raw_profileから詳細項目を抽出）
-- 注意: 本番環境では慎重に実行してください
UPDATE biz_profiles 
SET 
    biz_description = CASE 
        WHEN biz_raw_profile IS NOT NULL AND biz_raw_profile != '' 
        THEN SUBSTRING(biz_raw_profile FROM 1 FOR 500) 
        ELSE NULL 
    END,
    biz_revenue_range = CASE 
        WHEN biz_revenue_min IS NOT NULL AND biz_revenue_max IS NOT NULL 
        THEN CONCAT(
            CASE 
                WHEN biz_revenue_min >= 1000000000 THEN CONCAT(biz_revenue_min / 1000000000, '億円')
                WHEN biz_revenue_min >= 100000000 THEN CONCAT(biz_revenue_min / 100000000, '千万円')
                WHEN biz_revenue_min >= 10000000 THEN CONCAT(biz_revenue_min / 10000000, '百万円')
                ELSE CONCAT(biz_revenue_min, '円')
            END,
            ' 〜 ',
            CASE 
                WHEN biz_revenue_max >= 1000000000 THEN CONCAT(biz_revenue_max / 1000000000, '億円')
                WHEN biz_revenue_max >= 100000000 THEN CONCAT(biz_revenue_max / 100000000, '千万円')
                WHEN biz_revenue_max >= 10000000 THEN CONCAT(biz_revenue_max / 10000000, '百万円')
                ELSE CONCAT(biz_revenue_max, '円')
            END
        )
        ELSE NULL 
    END,
    biz_challenge_background = CASE 
        WHEN biz_issues IS NOT NULL AND jsonb_array_length(biz_issues) > 0 
        THEN CONCAT('主要課題: ', array_to_string(ARRAY(SELECT jsonb_array_elements_text(biz_issues)), ', '))
        ELSE NULL 
    END
WHERE 
    biz_description IS NULL 
    OR biz_revenue_range IS NULL 
    OR biz_challenge_background IS NULL;

-- 確認用クエリ
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'biz_profiles' 
    AND column_name IN (
        'biz_description',
        'biz_revenue_range', 
        'biz_challenge_background'
    )
ORDER BY column_name;

-- 追加完了の確認
SELECT 
    COUNT(*) as total_records,
    COUNT(biz_description) as has_description,
    COUNT(biz_revenue_range) as has_revenue_range,
    COUNT(biz_challenge_background) as has_challenge_background
FROM biz_profiles;

-- サンプルデータ表示
SELECT 
    biz_company_name,
    biz_description,
    biz_revenue_range,
    biz_challenge_background
FROM biz_profiles 
LIMIT 3;