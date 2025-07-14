-- rextrix_user_profiles テーブルの重複問題を根本的に解決
-- Supabase SQL Editor で実行してください

-- 1. 現在の重複データを確認
SELECT 
    user_id, 
    COUNT(*) as record_count,
    array_agg(id ORDER BY updated_at DESC) as profile_ids
FROM rextrix_user_profiles 
GROUP BY user_id 
HAVING COUNT(*) > 1
ORDER BY record_count DESC;

-- 2. 重複レコードの詳細確認
SELECT 
    id,
    user_id,
    display_name,
    created_at,
    updated_at
FROM rextrix_user_profiles 
WHERE user_id IN (
    SELECT user_id 
    FROM rextrix_user_profiles 
    GROUP BY user_id 
    HAVING COUNT(*) > 1
)
ORDER BY user_id, updated_at DESC;

-- 3. 重複データのクリーンアップ（最新のものを残して古いものを削除）
DO $$ 
DECLARE
    duplicate_record RECORD;
    ids_to_delete UUID[];
BEGIN
    FOR duplicate_record IN 
        SELECT 
            user_id,
            array_agg(id ORDER BY updated_at ASC) as sorted_ids
        FROM rextrix_user_profiles 
        GROUP BY user_id 
        HAVING COUNT(*) > 1
    LOOP
        -- 最新のもの以外を削除対象にする（配列の最後の要素を除く）
        ids_to_delete := duplicate_record.sorted_ids[1:array_length(duplicate_record.sorted_ids, 1)-1];
        
        -- 古いレコードを削除
        DELETE FROM rextrix_user_profiles 
        WHERE id = ANY(ids_to_delete);
        
        RAISE NOTICE 'Deleted % duplicate records for user_id: %', 
                     array_length(ids_to_delete, 1), 
                     duplicate_record.user_id;
    END LOOP;
END $$;

-- 4. user_id にユニーク制約を追加（重複防止）
DO $$ 
BEGIN
    -- 既存のユニーク制約がないか確認
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'rextrix_user_profiles' 
        AND constraint_type = 'UNIQUE' 
        AND constraint_name LIKE '%user_id%'
    ) THEN
        ALTER TABLE rextrix_user_profiles 
        ADD CONSTRAINT rextrix_user_profiles_user_id_unique UNIQUE (user_id);
        
        RAISE NOTICE 'Added UNIQUE constraint on user_id';
    ELSE
        RAISE NOTICE 'UNIQUE constraint on user_id already exists';
    END IF;
END $$;

-- 5. 確認クエリ：制約が正しく追加されたか
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'rextrix_user_profiles' 
AND constraint_type = 'UNIQUE';

-- 6. 最終確認：重複がないことを確認
SELECT 
    'Duplicate check completed' as status,
    COUNT(*) as total_profiles,
    COUNT(DISTINCT user_id) as unique_users,
    CASE 
        WHEN COUNT(*) = COUNT(DISTINCT user_id) THEN 'No duplicates found ✓'
        ELSE 'Duplicates still exist ⚠️'
    END as result
FROM rextrix_user_profiles;