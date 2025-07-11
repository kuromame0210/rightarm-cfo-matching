-- 活動履歴管理用テーブル作成 SQL
-- Supabase SQL Editor で実行してください

-- 1. 活動履歴テーブル (rextrix_activities)
CREATE TABLE IF NOT EXISTS rextrix_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES rextrix_users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
    'scout_received', 'scout_sent', 'interest_added', 'interest_received',
    'meeting_scheduled', 'meeting_completed', 'meeting_cancelled',
    'message_sent', 'message_received', 'profile_updated',
    'contract_created', 'contract_signed', 'payment_completed'
  )),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  related_user_id UUID REFERENCES rextrix_users(id) ON DELETE SET NULL,
  related_entity_type VARCHAR(50), -- 'meeting', 'contract', 'message', etc.
  related_entity_id UUID,
  metadata JSONB, -- 追加情報を格納
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. インデックスの作成
CREATE INDEX IF NOT EXISTS idx_activities_user ON rextrix_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON rextrix_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON rextrix_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_unread ON rextrix_activities(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_activities_related_user ON rextrix_activities(related_user_id);

-- 3. Row Level Security (RLS) の設定
ALTER TABLE rextrix_activities ENABLE ROW LEVEL SECURITY;

-- 4. RLS ポリシーの作成
CREATE POLICY "Users can view their own activities" ON rextrix_activities
  FOR SELECT USING (
    auth.uid() = user_id
  );

CREATE POLICY "Users can create their own activities" ON rextrix_activities
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can update their own activities" ON rextrix_activities
  FOR UPDATE USING (
    auth.uid() = user_id
  );

-- 5. 更新日時の自動更新用トリガー
CREATE TRIGGER update_activities_updated_at 
  BEFORE UPDATE ON rextrix_activities 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. 活動履歴自動生成用の関数
CREATE OR REPLACE FUNCTION create_activity(
  p_user_id UUID,
  p_activity_type VARCHAR,
  p_title VARCHAR,
  p_description TEXT DEFAULT NULL,
  p_related_user_id UUID DEFAULT NULL,
  p_related_entity_type VARCHAR DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO rextrix_activities (
    user_id, activity_type, title, description, 
    related_user_id, related_entity_type, related_entity_id, metadata
  ) VALUES (
    p_user_id, p_activity_type, p_title, p_description,
    p_related_user_id, p_related_entity_type, p_related_entity_id, p_metadata
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

-- 7. サンプルデータの挿入（テスト用）
DO $$
DECLARE
  first_user_id UUID;
  second_user_id UUID;
BEGIN
  -- 最初の2人のユーザーIDを取得
  SELECT id INTO first_user_id FROM rextrix_users ORDER BY created_at LIMIT 1;
  SELECT id INTO second_user_id FROM rextrix_users ORDER BY created_at LIMIT 1 OFFSET 1;
  
  IF first_user_id IS NOT NULL THEN
    -- サンプル活動履歴を作成
    PERFORM create_activity(
      first_user_id,
      'scout_received',
      '新しいスカウトを受信',
      '株式会社テックスタートからIPO準備CFOのスカウトが届きました',
      second_user_id,
      'scout',
      NULL,
      '{"company_name": "株式会社テックスタート", "position": "IPO準備CFO", "urgency": "high"}'::jsonb
    );
    
    PERFORM create_activity(
      first_user_id,
      'interest_added',
      '気になるリストに追加',
      '新しいCFOを気になるリストに追加しました',
      second_user_id,
      'interest',
      NULL,
      '{"target_type": "cfo"}'::jsonb
    );
    
    PERFORM create_activity(
      first_user_id,
      'meeting_scheduled',
      '面談が予定されました',
      'IPO準備の初回面談が予定されました',
      second_user_id,
      'meeting',
      NULL,
      '{"meeting_date": "2024-01-20", "meeting_time": "14:00-15:00"}'::jsonb
    );
  END IF;
END $$;

-- 8. 実行結果の確認
SELECT 'Activities table created successfully' as result;