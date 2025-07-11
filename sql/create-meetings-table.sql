-- 面談スケジュール管理用テーブル作成 SQL
-- Supabase SQL Editor で実行してください

-- 1. 面談テーブル (rextrix_meetings)
CREATE TABLE IF NOT EXISTS rextrix_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID NOT NULL REFERENCES rextrix_users(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES rextrix_users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  meeting_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  meeting_type VARCHAR(20) DEFAULT 'online' CHECK (meeting_type IN ('online', 'offline', 'phone')),
  meeting_url TEXT,
  location_address TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  is_urgent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 面談参加者テーブル (複数参加者対応用)
CREATE TABLE IF NOT EXISTS rextrix_meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES rextrix_meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES rextrix_users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'participant' CHECK (role IN ('organizer', 'participant', 'observer')),
  response_status VARCHAR(20) DEFAULT 'pending' CHECK (response_status IN ('pending', 'accepted', 'declined', 'tentative')),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. インデックスの作成
CREATE INDEX IF NOT EXISTS idx_meetings_organizer ON rextrix_meetings(organizer_id);
CREATE INDEX IF NOT EXISTS idx_meetings_participant ON rextrix_meetings(participant_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON rextrix_meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON rextrix_meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_datetime ON rextrix_meetings(meeting_date, start_time);

CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting ON rextrix_meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_user ON rextrix_meeting_participants(user_id);

-- 4. Row Level Security (RLS) の設定
ALTER TABLE rextrix_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rextrix_meeting_participants ENABLE ROW LEVEL SECURITY;

-- 5. RLS ポリシーの作成

-- 面談テーブルのポリシー
CREATE POLICY "Users can view their own meetings" ON rextrix_meetings
  FOR SELECT USING (
    auth.uid() = organizer_id OR auth.uid() = participant_id
  );

CREATE POLICY "Users can create meetings" ON rextrix_meetings
  FOR INSERT WITH CHECK (
    auth.uid() = organizer_id
  );

CREATE POLICY "Users can update their own meetings" ON rextrix_meetings
  FOR UPDATE USING (
    auth.uid() = organizer_id OR auth.uid() = participant_id
  );

CREATE POLICY "Users can delete their own meetings" ON rextrix_meetings
  FOR DELETE USING (
    auth.uid() = organizer_id
  );

-- 面談参加者テーブルのポリシー
CREATE POLICY "Users can view meeting participants" ON rextrix_meeting_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rextrix_meetings m 
      WHERE m.id = meeting_id 
      AND (m.organizer_id = auth.uid() OR m.participant_id = auth.uid())
    ) OR auth.uid() = user_id
  );

CREATE POLICY "Meeting organizers can manage participants" ON rextrix_meeting_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM rextrix_meetings m 
      WHERE m.id = meeting_id 
      AND m.organizer_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own participation status" ON rextrix_meeting_participants
  FOR UPDATE USING (
    auth.uid() = user_id
  );

-- 6. 更新日時の自動更新用トリガー
CREATE TRIGGER update_meetings_updated_at 
  BEFORE UPDATE ON rextrix_meetings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. 実行結果の確認
SELECT 'Meeting tables created successfully' as result;