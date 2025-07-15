-- ==========================
-- CFO×企業 マッチング PoC 新アーキテクチャ実装
-- ==========================

-- 1. ENUM型の作成
-- ユーザー種別（参照用）
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('cfo','biz');
    END IF;
END $$;

-- メッセージ種別（チャット／スカウト）
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'msg_type') THEN
        CREATE TYPE msg_type AS ENUM ('chat','scout');
    END IF;
END $$;

-- 2. テーブル作成

-- 【T1】cfo_profiles … CFO 固有プロフィール
CREATE TABLE IF NOT EXISTS cfo_profiles (
    cfo_user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    avatar_url text,
    cfo_name text,
    cfo_display_name text,
    cfo_location text,
    cfo_availability text,
    cfo_fee_min int,
    cfo_fee_max int,
    cfo_skills jsonb DEFAULT '[]' NOT NULL,
    cfo_raw_profile text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 【T2】biz_profiles … 企業固有プロフィール
CREATE TABLE IF NOT EXISTS biz_profiles (
    biz_user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    avatar_url text,
    biz_company_name text NOT NULL,
    biz_location text,
    biz_revenue_min bigint,
    biz_revenue_max bigint,
    biz_issues jsonb DEFAULT '[]' NOT NULL,
    biz_raw_profile text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 【T3】likes … 「気になる」ワンタップ
CREATE TABLE IF NOT EXISTS likes (
    liker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (liker_id, target_id)
);

-- 【T4】reviews … ★1–5＋コメント
CREATE TABLE IF NOT EXISTS reviews (
    review_id bigserial PRIMARY KEY,
    reviewer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    created_at timestamptz DEFAULT now(),
    UNIQUE (reviewer_id, target_id)
);

-- 【T5】messages … チャット & スカウト
CREATE TABLE IF NOT EXISTS messages (
    msg_id bigserial PRIMARY KEY,
    sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    msg_type msg_type DEFAULT 'chat' NOT NULL,
    body text NOT NULL,
    sent_at timestamptz DEFAULT now()
);

-- 【T6】attachments … メッセージ/プロフィール添付
CREATE TABLE IF NOT EXISTS attachments (
    file_id bigserial PRIMARY KEY,
    file_url text NOT NULL,
    file_name text,
    msg_id bigint REFERENCES messages(msg_id) ON DELETE CASCADE,
    cfo_user_id uuid REFERENCES cfo_profiles(cfo_user_id) ON DELETE CASCADE,
    biz_user_id uuid REFERENCES biz_profiles(biz_user_id) ON DELETE CASCADE,
    uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    CHECK (
        (msg_id IS NOT NULL)::int +
        (cfo_user_id IS NOT NULL)::int +
        (biz_user_id IS NOT NULL)::int = 1
    )
);

-- 3. GINインデックスの作成（JSONB検索高速化）
CREATE INDEX IF NOT EXISTS gin_cfo_skills ON cfo_profiles USING gin (cfo_skills jsonb_path_ops);
CREATE INDEX IF NOT EXISTS gin_biz_issues ON biz_profiles USING gin (biz_issues jsonb_path_ops);

-- 4. RLSポリシーの設定

-- cfo_profiles：誰でも閲覧・本人だけ書き込み
ALTER TABLE cfo_profiles ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cfo_profiles' AND policyname = 'cfo_read') THEN
        CREATE POLICY cfo_read ON cfo_profiles FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cfo_profiles' AND policyname = 'cfo_write') THEN
        CREATE POLICY cfo_write ON cfo_profiles FOR INSERT WITH CHECK (auth.uid() = cfo_user_id);
        CREATE POLICY cfo_update ON cfo_profiles FOR UPDATE WITH CHECK (auth.uid() = cfo_user_id);
    END IF;
END $$;

-- biz_profiles：誰でも閲覧・本人だけ書き込み
ALTER TABLE biz_profiles ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'biz_profiles' AND policyname = 'biz_read') THEN
        CREATE POLICY biz_read ON biz_profiles FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'biz_profiles' AND policyname = 'biz_write') THEN
        CREATE POLICY biz_write ON biz_profiles FOR INSERT WITH CHECK (auth.uid() = biz_user_id);
        CREATE POLICY biz_update ON biz_profiles FOR UPDATE WITH CHECK (auth.uid() = biz_user_id);
    END IF;
END $$;

-- likes
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'likes' AND policyname = 'likes_all') THEN
        CREATE POLICY likes_all ON likes FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'likes' AND policyname = 'likes_write') THEN
        CREATE POLICY likes_write ON likes FOR INSERT WITH CHECK (auth.uid() = liker_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'likes' AND policyname = 'likes_del') THEN
        CREATE POLICY likes_del ON likes FOR DELETE USING (auth.uid() = liker_id);
    END IF;
END $$;

-- reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'rev_read') THEN
        CREATE POLICY rev_read ON reviews FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reviews' AND policyname = 'rev_write') THEN
        CREATE POLICY rev_write ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
    END IF;
END $$;

-- messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'msg_read') THEN
        CREATE POLICY msg_read ON messages FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'msg_write') THEN
        CREATE POLICY msg_write ON messages FOR INSERT WITH CHECK (sender_id = auth.uid());
    END IF;
END $$;

-- attachments
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'attachments' AND policyname = 'att_read') THEN
        CREATE POLICY att_read ON attachments FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'attachments' AND policyname = 'att_write') THEN
        CREATE POLICY att_write ON attachments FOR INSERT WITH CHECK (uploaded_by = auth.uid());
    END IF;
END $$;

-- 5. トリガー関数（updated_atの自動更新）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの設定
DROP TRIGGER IF EXISTS update_cfo_profiles_updated_at ON cfo_profiles;
CREATE TRIGGER update_cfo_profiles_updated_at
    BEFORE UPDATE ON cfo_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_biz_profiles_updated_at ON biz_profiles;
CREATE TRIGGER update_biz_profiles_updated_at
    BEFORE UPDATE ON biz_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 完了確認
SELECT 'Database setup completed successfully!' as status;