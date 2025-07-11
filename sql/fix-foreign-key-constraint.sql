-- 外部キー制約エラー修正スクリプト
-- Supabase SQL Editorで実行してください

-- 1. 既存の外部キー制約を確認・削除
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- rextrix_users テーブルの外部キー制約を検索
    FOR constraint_name IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'rextrix_users' 
          AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = 'supabase_auth_id'
    LOOP
        -- 制約を削除
        EXECUTE 'ALTER TABLE rextrix_users DROP CONSTRAINT IF EXISTS ' || constraint_name;
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    END LOOP;
END $$;

-- 2. supabase_auth_id カラムを正しく設定
ALTER TABLE rextrix_users ALTER COLUMN supabase_auth_id DROP NOT NULL;

-- 3. 正しい外部キー制約を追加（auth.users テーブルを参照）
ALTER TABLE rextrix_users 
ADD CONSTRAINT rextrix_users_supabase_auth_id_fkey 
FOREIGN KEY (supabase_auth_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- 4. インデックスを再作成
DROP INDEX IF EXISTS idx_rextrix_users_supabase_auth_id;
CREATE INDEX idx_rextrix_users_supabase_auth_id ON rextrix_users(supabase_auth_id);

-- 5. 制約確認
DO $$
BEGIN
    RAISE NOTICE '=== 制約修正完了 ===';
    RAISE NOTICE 'rextrix_users.supabase_auth_id が auth.users(id) を正しく参照するようになりました';
    RAISE NOTICE '会員登録APIが正常に動作するはずです';
END $$;