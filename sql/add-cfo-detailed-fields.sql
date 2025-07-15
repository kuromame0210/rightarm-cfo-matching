-- CFOプロフィールテーブルに詳細フィールドを追加
-- 2025-07-15: CFO登録画面の新しい項目に対応

ALTER TABLE cfo_profiles 
ADD COLUMN IF NOT EXISTS cfo_working_hours TEXT,
ADD COLUMN IF NOT EXISTS cfo_possible_tasks TEXT,
ADD COLUMN IF NOT EXISTS cfo_monthly_compensation TEXT,
ADD COLUMN IF NOT EXISTS cfo_working_area TEXT,
ADD COLUMN IF NOT EXISTS cfo_introduction TEXT;

-- コメント追加
COMMENT ON COLUMN cfo_profiles.cfo_working_hours IS '週の稼働可能時間（テキスト形式）';
COMMENT ON COLUMN cfo_profiles.cfo_possible_tasks IS '可能な業務内容';
COMMENT ON COLUMN cfo_profiles.cfo_monthly_compensation IS '想定月額報酬（詳細テキスト）';
COMMENT ON COLUMN cfo_profiles.cfo_working_area IS '対応可能エリア';
COMMENT ON COLUMN cfo_profiles.cfo_introduction IS '自己紹介・紹介文';

-- インデックス追加（検索用）
CREATE INDEX IF NOT EXISTS idx_cfo_profiles_working_area ON cfo_profiles USING gin(to_tsvector('japanese', cfo_working_area));
CREATE INDEX IF NOT EXISTS idx_cfo_profiles_possible_tasks ON cfo_profiles USING gin(to_tsvector('japanese', cfo_possible_tasks));

-- 確認用クエリ
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cfo_profiles' 
    AND column_name IN (
        'cfo_working_hours',
        'cfo_possible_tasks', 
        'cfo_monthly_compensation',
        'cfo_working_area',
        'cfo_introduction'
    )
ORDER BY column_name;