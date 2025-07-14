-- availability カラムが見つからない問題を修正
-- Supabase SQL Editor で実行してください

-- 1. rextrix_user_profiles テーブルに availability カラムを追加（存在しない場合のみ）
DO $$ 
BEGIN 
    -- availability カラムが存在しない場合は追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rextrix_user_profiles' 
        AND column_name = 'availability'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE rextrix_user_profiles 
        ADD COLUMN availability TEXT;
        
        RAISE NOTICE 'Added availability column to rextrix_user_profiles';
    ELSE
        RAISE NOTICE 'availability column already exists in rextrix_user_profiles';
    END IF;
    
    -- company カラムが存在しない場合は追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rextrix_user_profiles' 
        AND column_name = 'company'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE rextrix_user_profiles 
        ADD COLUMN company TEXT;
        
        RAISE NOTICE 'Added company column to rextrix_user_profiles';
    ELSE
        RAISE NOTICE 'company column already exists in rextrix_user_profiles';
    END IF;
    
    -- position カラムが存在しない場合は追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rextrix_user_profiles' 
        AND column_name = 'position'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE rextrix_user_profiles 
        ADD COLUMN position TEXT;
        
        RAISE NOTICE 'Added position column to rextrix_user_profiles';
    ELSE
        RAISE NOTICE 'position column already exists in rextrix_user_profiles';
    END IF;
    
    -- experience カラムが存在しない場合は追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rextrix_user_profiles' 
        AND column_name = 'experience'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE rextrix_user_profiles 
        ADD COLUMN experience INTEGER;
        
        RAISE NOTICE 'Added experience column to rextrix_user_profiles';
    ELSE
        RAISE NOTICE 'experience column already exists in rextrix_user_profiles';
    END IF;
END $$;

-- 2. rextrix_cfos テーブルに不足しているカラムを追加
DO $$ 
BEGIN 
    -- title カラムが存在しない場合は追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rextrix_cfos' 
        AND column_name = 'title'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE rextrix_cfos 
        ADD COLUMN title TEXT;
        
        RAISE NOTICE 'Added title column to rextrix_cfos';
    ELSE
        RAISE NOTICE 'title column already exists in rextrix_cfos';
    END IF;
    
    -- specialties カラムが存在しない場合は追加（JSONB）
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rextrix_cfos' 
        AND column_name = 'specialties'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE rextrix_cfos 
        ADD COLUMN specialties JSONB DEFAULT '[]'::jsonb;
        
        RAISE NOTICE 'Added specialties column to rextrix_cfos';
    ELSE
        RAISE NOTICE 'specialties column already exists in rextrix_cfos';
    END IF;
    
    -- hourly_rate カラムが存在しない場合は追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rextrix_cfos' 
        AND column_name = 'hourly_rate'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE rextrix_cfos 
        ADD COLUMN hourly_rate INTEGER;
        
        RAISE NOTICE 'Added hourly_rate column to rextrix_cfos';
    ELSE
        RAISE NOTICE 'hourly_rate column already exists in rextrix_cfos';
    END IF;
END $$;

-- 3. rextrix_companies テーブルに不足しているカラムを追加
DO $$ 
BEGIN 
    -- founded_year カラムが存在しない場合は追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rextrix_companies' 
        AND column_name = 'founded_year'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE rextrix_companies 
        ADD COLUMN founded_year INTEGER;
        
        RAISE NOTICE 'Added founded_year column to rextrix_companies';
    ELSE
        RAISE NOTICE 'founded_year column already exists in rextrix_companies';
    END IF;
    
    -- business_model カラムが存在しない場合は追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rextrix_companies' 
        AND column_name = 'business_model'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE rextrix_companies 
        ADD COLUMN business_model TEXT;
        
        RAISE NOTICE 'Added business_model column to rextrix_companies';
    ELSE
        RAISE NOTICE 'business_model column already exists in rextrix_companies';
    END IF;
    
    -- funding_stage カラムが存在しない場合は追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rextrix_companies' 
        AND column_name = 'funding_stage'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE rextrix_companies 
        ADD COLUMN funding_stage TEXT;
        
        RAISE NOTICE 'Added funding_stage column to rextrix_companies';
    ELSE
        RAISE NOTICE 'funding_stage column already exists in rextrix_companies';
    END IF;
    
    -- challenges カラムが存在しない場合は追加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rextrix_companies' 
        AND column_name = 'challenges'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE rextrix_companies 
        ADD COLUMN challenges TEXT;
        
        RAISE NOTICE 'Added challenges column to rextrix_companies';
    ELSE
        RAISE NOTICE 'challenges column already exists in rextrix_companies';
    END IF;
END $$;

-- 4. 確認クエリ：更新後のテーブル構造
SELECT 
    'rextrix_user_profiles' as table_name,
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'rextrix_user_profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 完了メッセージ
SELECT 'Missing columns have been added successfully!' as result;