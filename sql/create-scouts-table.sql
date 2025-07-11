-- スカウト管理用テーブル作成 SQL
-- Supabase SQL Editor で実行してください

-- 1. スカウトテーブル (rextrix_scouts)
CREATE TABLE IF NOT EXISTS rextrix_scouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES rextrix_users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES rextrix_users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('cfo', 'company')),
  recipient_type VARCHAR(20) NOT NULL CHECK (recipient_type IN ('cfo', 'company')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  urgency VARCHAR(20) DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
  compensation VARCHAR(100),
  work_style VARCHAR(100),
  project_duration VARCHAR(100),
  required_skills TEXT[],
  preferred_experience TEXT[],
  meeting_preference VARCHAR(50),
  start_date DATE,
  deadline DATE,
  metadata JSONB, -- 追加情報を格納
  is_read BOOLEAN DEFAULT false,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. スカウト返信テーブル (rextrix_scout_responses)
CREATE TABLE IF NOT EXISTS rextrix_scout_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scout_id UUID NOT NULL REFERENCES rextrix_scouts(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES rextrix_users(id) ON DELETE CASCADE,
  response_type VARCHAR(20) NOT NULL CHECK (response_type IN ('accept', 'decline', 'counter')),
  message TEXT,
  counter_conditions JSONB, -- カウンター条件
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. インデックスの作成
CREATE INDEX IF NOT EXISTS idx_scouts_sender ON rextrix_scouts(sender_id);
CREATE INDEX IF NOT EXISTS idx_scouts_recipient ON rextrix_scouts(recipient_id);
CREATE INDEX IF NOT EXISTS idx_scouts_status ON rextrix_scouts(status);
CREATE INDEX IF NOT EXISTS idx_scouts_urgency ON rextrix_scouts(urgency);
CREATE INDEX IF NOT EXISTS idx_scouts_created_at ON rextrix_scouts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scouts_unread ON rextrix_scouts(recipient_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_scouts_deadline ON rextrix_scouts(deadline) WHERE deadline IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_scout_responses_scout ON rextrix_scout_responses(scout_id);
CREATE INDEX IF NOT EXISTS idx_scout_responses_responder ON rextrix_scout_responses(responder_id);

-- 4. Row Level Security (RLS) の設定
ALTER TABLE rextrix_scouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rextrix_scout_responses ENABLE ROW LEVEL SECURITY;

-- 5. RLS ポリシーの作成

-- スカウトテーブルのポリシー
CREATE POLICY "Users can view their own scouts" ON rextrix_scouts
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

CREATE POLICY "Users can create scouts" ON rextrix_scouts
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
  );

CREATE POLICY "Users can update their own scouts" ON rextrix_scouts
  FOR UPDATE USING (
    auth.uid() = sender_id OR auth.uid() = recipient_id
  );

-- スカウト返信テーブルのポリシー
CREATE POLICY "Users can view scout responses" ON rextrix_scout_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rextrix_scouts s 
      WHERE s.id = scout_id 
      AND (s.sender_id = auth.uid() OR s.recipient_id = auth.uid())
    ) OR auth.uid() = responder_id
  );

CREATE POLICY "Recipients can respond to scouts" ON rextrix_scout_responses
  FOR INSERT WITH CHECK (
    auth.uid() = responder_id AND
    EXISTS (
      SELECT 1 FROM rextrix_scouts s 
      WHERE s.id = scout_id 
      AND s.recipient_id = auth.uid()
    )
  );

-- 6. 更新日時の自動更新用トリガー
CREATE TRIGGER update_scouts_updated_at 
  BEFORE UPDATE ON rextrix_scouts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. スカウト自動期限切れ用の関数
CREATE OR REPLACE FUNCTION expire_old_scouts()
RETURNS void AS $$
BEGIN
  UPDATE rextrix_scouts 
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending' 
    AND deadline IS NOT NULL 
    AND deadline < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 8. サンプルデータの挿入（テスト用）
DO $$
DECLARE
  first_user_id UUID;
  second_user_id UUID;
  third_user_id UUID;
  scout_id UUID;
BEGIN
  -- 最初の3人のユーザーIDを取得
  SELECT id INTO first_user_id FROM rextrix_users ORDER BY created_at LIMIT 1;
  SELECT id INTO second_user_id FROM rextrix_users ORDER BY created_at LIMIT 1 OFFSET 1;
  SELECT id INTO third_user_id FROM rextrix_users ORDER BY created_at LIMIT 1 OFFSET 2;
  
  IF first_user_id IS NOT NULL AND second_user_id IS NOT NULL THEN
    -- 受信スカウトのサンプル
    INSERT INTO rextrix_scouts (
      sender_id, recipient_id, title, message, sender_type, recipient_type,
      status, urgency, compensation, work_style, required_skills,
      deadline, metadata
    ) VALUES (
      second_user_id, first_user_id,
      'IPO準備CFOを募集しています',
      'あなたの豊富な上場経験に注目し、ぜひお力をお借りしたいと思います。シリーズBラウンドの資金調達完了後、来年のIPOに向けた財務体制の構築をお願いしたいです。',
      'company', 'cfo',
      'pending', 'high',
      '月80万円〜', '週2-3日',
      ARRAY['IPO準備', '資金調達', '財務戦略'],
      CURRENT_DATE + INTERVAL '14 days',
      '{"company_name": "株式会社テックスタート", "industry": "SaaS", "stage": "シリーズB"}'::jsonb
    ) RETURNING id INTO scout_id;
    
    -- 送信スカウトのサンプル
    IF third_user_id IS NOT NULL THEN
      INSERT INTO rextrix_scouts (
        sender_id, recipient_id, title, message, sender_type, recipient_type,
        status, urgency, compensation, work_style,
        metadata
      ) VALUES (
        first_user_id, third_user_id,
        '財務体制構築のご提案',
        '貴社の成長段階において、財務体制の構築をサポートさせていただきたいと思います。特に資金調達と管理会計の強化についてお手伝いできます。',
        'cfo', 'company',
        'pending', 'normal',
        '応相談', '月1-2回面談',
        '{"target_company": "株式会社スタートアップA", "proposal_type": "financial_consulting"}'::jsonb
      );
    END IF;
    
    -- 活動履歴にも記録
    INSERT INTO rextrix_activities (
      user_id, activity_type, title, description, related_user_id,
      related_entity_type, related_entity_id, metadata
    ) VALUES (
      first_user_id, 'scout_received',
      '新しいスカウトを受信',
      '株式会社テックスタートからIPO準備CFOのスカウトが届きました',
      second_user_id, 'scout', scout_id,
      '{"company_name": "株式会社テックスタート", "position": "IPO準備CFO", "urgency": "high"}'::jsonb
    );
  END IF;
END $$;

-- 9. 実行結果の確認
SELECT 'Scout tables created successfully' as result;