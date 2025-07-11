-- Supabase SQL Editor 用の rextrix_interests テーブル作成
-- psql専用コマンドを除去したバージョン

-- 既存のテーブルを削除（存在する場合）
DROP TABLE IF EXISTS rextrix_interests;

-- シンプルなテーブル作成
CREATE TABLE rextrix_interests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    target_user_id UUID NOT NULL, 
    target_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 基本的なインデックス
CREATE INDEX ON rextrix_interests(user_id);
CREATE INDEX ON rextrix_interests(target_user_id);

-- 重複防止
CREATE UNIQUE INDEX ON rextrix_interests(user_id, target_user_id, target_type);

-- 確認クエリ（Supabase対応）
SELECT 'テーブル作成完了' as status;

-- テーブル構造確認（Supabase対応）
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'rextrix_interests'
ORDER BY ordinal_position;