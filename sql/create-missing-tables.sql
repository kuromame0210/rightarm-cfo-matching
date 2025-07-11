-- Rextrix Missing Tables Creation Script
-- =====================================================
-- 気になる機能とその他の欠けているテーブルを作成します

-- 1. rextrix_interests テーブル作成
CREATE TABLE IF NOT EXISTS rextrix_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES rextrix_users(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL, -- 気になる対象のユーザー
    target_type TEXT NOT NULL CHECK (target_type IN ('cfo', 'company')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 重複防止のユニーク制約
    UNIQUE(user_id, target_user_id, target_type)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_rextrix_interests_user_id ON rextrix_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_rextrix_interests_target_user_id ON rextrix_interests(target_user_id);
CREATE INDEX IF NOT EXISTS idx_rextrix_interests_target_type ON rextrix_interests(target_type);
CREATE INDEX IF NOT EXISTS idx_rextrix_interests_created_at ON rextrix_interests(created_at);

-- 2. rextrix_scouts テーブル作成（スカウト機能用）
CREATE TABLE IF NOT EXISTS rextrix_scouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES rextrix_users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES rextrix_users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'withdrawn')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE
);

-- スカウトテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_rextrix_scouts_from_user_id ON rextrix_scouts(from_user_id);
CREATE INDEX IF NOT EXISTS idx_rextrix_scouts_to_user_id ON rextrix_scouts(to_user_id);
CREATE INDEX IF NOT EXISTS idx_rextrix_scouts_status ON rextrix_scouts(status);

-- 3. rextrix_conversations テーブル作成（メッセージ機能用）
CREATE TABLE IF NOT EXISTS rextrix_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES rextrix_users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES rextrix_users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 重複防止
    UNIQUE(user1_id, user2_id)
);

-- 4. rextrix_messages テーブル作成
CREATE TABLE IF NOT EXISTS rextrix_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES rextrix_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES rextrix_users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- メッセージテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_rextrix_messages_conversation_id ON rextrix_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_rextrix_messages_sender_id ON rextrix_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_rextrix_messages_created_at ON rextrix_messages(created_at);

-- 5. Row Level Security (RLS) の設定
ALTER TABLE rextrix_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rextrix_scouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rextrix_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rextrix_messages ENABLE ROW LEVEL SECURITY;

-- 6. RLS ポリシーの作成（基本的なアクセス制御）
-- interests テーブル用
CREATE POLICY "Users can view their own interests" ON rextrix_interests
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own interests" ON rextrix_interests
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own interests" ON rextrix_interests
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- scouts テーブル用
CREATE POLICY "Users can view scouts they sent or received" ON rextrix_scouts
    FOR SELECT USING (auth.uid()::text = from_user_id::text OR auth.uid()::text = to_user_id::text);

CREATE POLICY "Users can insert scouts they send" ON rextrix_scouts
    FOR INSERT WITH CHECK (auth.uid()::text = from_user_id::text);

CREATE POLICY "Users can update scouts they received" ON rextrix_scouts
    FOR UPDATE USING (auth.uid()::text = to_user_id::text);

-- conversations テーブル用
CREATE POLICY "Users can view their conversations" ON rextrix_conversations
    FOR SELECT USING (auth.uid()::text = user1_id::text OR auth.uid()::text = user2_id::text);

CREATE POLICY "Users can create conversations" ON rextrix_conversations
    FOR INSERT WITH CHECK (auth.uid()::text = user1_id::text OR auth.uid()::text = user2_id::text);

-- messages テーブル用
CREATE POLICY "Users can view messages in their conversations" ON rextrix_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM rextrix_conversations 
            WHERE id = conversation_id 
            AND (user1_id::text = auth.uid()::text OR user2_id::text = auth.uid()::text)
        )
    );

CREATE POLICY "Users can send messages in their conversations" ON rextrix_messages
    FOR INSERT WITH CHECK (
        auth.uid()::text = sender_id::text AND
        EXISTS (
            SELECT 1 FROM rextrix_conversations 
            WHERE id = conversation_id 
            AND (user1_id::text = auth.uid()::text OR user2_id::text = auth.uid()::text)
        )
    );

-- 完了メッセージ
SELECT 'テーブル作成完了: rextrix_interests, rextrix_scouts, rextrix_conversations, rextrix_messages' as result;