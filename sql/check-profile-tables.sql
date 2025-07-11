-- プロフィール関連テーブルの構造を確認
-- Supabase SQL Editor で実行してください

-- 1. CFOプロフィールテーブルの構造
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'rextrix_cfos' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. 企業プロフィールテーブルの構造
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'rextrix_companies' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. ユーザープロフィールテーブルの構造
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'rextrix_user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;