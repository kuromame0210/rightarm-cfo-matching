-- メッセージ機能用テーブル作成 SQL
-- Supabase SQL Editor で実行してください

-- 1. 会話テーブル (rextrix_conversations)
CREATE TABLE IF NOT EXISTS rextrix_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id UUID NOT NULL REFERENCES rextrix_users(id) ON DELETE CASCADE,
  participant2_id UUID NOT NULL REFERENCES rextrix_users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. メッセージテーブル (rextrix_messages)
CREATE TABLE IF NOT EXISTS rextrix_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES rextrix_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES rextrix_users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. インデックスの作成
CREATE INDEX IF NOT EXISTS idx_conversations_participant1 ON rextrix_conversations(participant1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant2 ON rextrix_conversations(participant2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON rextrix_conversations(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON rextrix_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON rextrix_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON rextrix_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON rextrix_messages(is_read) WHERE is_read = false;

-- 4. 会話の一意性制約（同じユーザー同士の重複会話を防ぐ）
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_unique ON rextrix_conversations(
  LEAST(participant1_id, participant2_id), 
  GREATEST(participant1_id, participant2_id)
);

-- 5. Row Level Security (RLS) の設定
ALTER TABLE rextrix_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rextrix_messages ENABLE ROW LEVEL SECURITY;

-- 6. RLS ポリシーの作成

-- 会話テーブルのポリシー
CREATE POLICY "Users can view their own conversations" ON rextrix_conversations
  FOR SELECT USING (
    auth.uid() = participant1_id OR auth.uid() = participant2_id
  );

CREATE POLICY "Users can create conversations" ON rextrix_conversations
  FOR INSERT WITH CHECK (
    auth.uid() = participant1_id OR auth.uid() = participant2_id
  );

CREATE POLICY "Users can update their own conversations" ON rextrix_conversations
  FOR UPDATE USING (
    auth.uid() = participant1_id OR auth.uid() = participant2_id
  );

-- メッセージテーブルのポリシー
CREATE POLICY "Users can view messages in their conversations" ON rextrix_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rextrix_conversations 
      WHERE id = conversation_id 
      AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages to their conversations" ON rextrix_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM rextrix_conversations 
      WHERE id = conversation_id 
      AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages" ON rextrix_messages
  FOR UPDATE USING (
    auth.uid() = sender_id OR
    EXISTS (
      SELECT 1 FROM rextrix_conversations 
      WHERE id = conversation_id 
      AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
  );

-- 7. 更新日時の自動更新用トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversations_updated_at 
  BEFORE UPDATE ON rextrix_conversations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at 
  BEFORE UPDATE ON rextrix_messages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. 実行結果の確認
SELECT 'Tables created successfully' as result;