-- CFOプロフィール詳細カラム追加
-- 2025-07-15: cfo_data.md対応のため詳細情報カラムを追加

-- カラム追加（PostgreSQLでは1つずつ追加）
ALTER TABLE cfo_profiles ADD COLUMN cfo_compensation text;
ALTER TABLE cfo_profiles ADD COLUMN cfo_possible_tasks text;
ALTER TABLE cfo_profiles ADD COLUMN cfo_certifications text;
ALTER TABLE cfo_profiles ADD COLUMN cfo_working_areas text;
ALTER TABLE cfo_profiles ADD COLUMN cfo_introduction text;

-- コメント追加（管理用）
COMMENT ON COLUMN cfo_profiles.cfo_compensation IS '想定報酬詳細（テキスト入力）';
COMMENT ON COLUMN cfo_profiles.cfo_possible_tasks IS '可能な業務（テキスト入力）';
COMMENT ON COLUMN cfo_profiles.cfo_certifications IS '保有資格（テキスト入力）';
COMMENT ON COLUMN cfo_profiles.cfo_working_areas IS '対応可能エリア（テキスト入力）';
COMMENT ON COLUMN cfo_profiles.cfo_introduction IS '紹介文（テキスト入力）';

-- 確認用クエリ
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cfo_profiles' 
    AND column_name IN (
        'cfo_compensation',
        'cfo_possible_tasks', 
        'cfo_certifications',
        'cfo_working_areas',
        'cfo_introduction'
    )
ORDER BY column_name;

-- 追加完了の確認
SELECT 'カラム追加完了' as status;