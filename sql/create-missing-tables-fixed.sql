-- Rextrix Missing Tables Creation Script (Fixed)
-- =====================================================
-- 気になる機能とその他の欠けているテーブルを作成します

-- 1. 既存テーブルの確認とカラム追加
-- rextrix_users テーブルに created_at がない場合は追加
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rextrix_users' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE rextrix_users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rextrix_users' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE rextrix_users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. rextrix_interests テーブル作成（シンプル版）
DROP TABLE IF EXISTS rextrix_interests CASCADE;

CREATE TABLE rextrix_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    target_user_id UUID NOT NULL,
    target_type TEXT NOT NULL CHECK (target_type IN ('cfo', 'company')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 外部キー制約を後で追加（テーブルが存在する場合のみ）
DO $$ 
BEGIN 
    -- rextrix_users テーブルが存在する場合のみ外部キー制約を追加
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rextrix_users') THEN
        ALTER TABLE rextrix_interests 
        ADD CONSTRAINT fk_interests_user_id 
        FOREIGN KEY (user_id) REFERENCES rextrix_users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 重複防止のユニーク制約
ALTER TABLE rextrix_interests 
ADD CONSTRAINT unique_user_target_type 
UNIQUE(user_id, target_user_id, target_type);

-- 基本的なインデックス作成
CREATE INDEX idx_interests_user_id ON rextrix_interests(user_id);
CREATE INDEX idx_interests_target_user_id ON rextrix_interests(target_user_id);
CREATE INDEX idx_interests_target_type ON rextrix_interests(target_type);
CREATE INDEX idx_interests_created_at ON rextrix_interests(created_at);

-- 3. テーブル作成確認
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'rextrix_interests'
ORDER BY ordinal_position;

-- 4. テストデータの挿入（デバッグ用）
-- 注意: これは実際のユーザーIDが必要です
-- INSERT INTO rextrix_interests (user_id, target_user_id, target_type) 
-- VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'cfo');

-- 完了メッセージ
SELECT 'rextrix_interests テーブル作成完了！' as result;