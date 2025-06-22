# **RIGHTARM β版 データベース設計書 Version 1.2 完全修正版**

画面設計書 Version 1.2 の新要件に対応するため、以下の変更を実装します。

---

## **変更概要**

**主な変更点:**
1. 企業・CFOプロフィールテーブルにカード表示用フィールドを追加
2. 「気になる」機能用の新テーブル `rightarm_user_favorites` を追加
3. カード表示最適化用のビューを新規作成
4. 全文検索インデックスを新フィールドに対応
5. RLSポリシーを気になる機能に対応

---

## **Step 2-bis: プロフィールテーブルの拡張**

```sql
-- 企業プロフィールテーブルにカード表示用フィールドを追加
ALTER TABLE rightarm_company_profiles
  ADD COLUMN financial_challenges TEXT,        -- 抱えている財務課題
  ADD COLUMN challenge_background TEXT,        -- 課題の背景や状況
  ADD COLUMN cfo_requirements TEXT,            -- CFOに求めたいこと
  ADD COLUMN desired_start_timing VARCHAR(50); -- 希望時期

-- CFOプロフィールテーブルにカード表示用フィールドを追加
ALTER TABLE rightarm_cfo_profiles
  ADD COLUMN career_achievements TEXT,         -- 実績・経歴
  ADD COLUMN certifications TEXT,              -- 保有資格
  ADD COLUMN work_style_preference VARCHAR(100), -- 稼働希望形態
  ADD COLUMN desired_compensation TEXT,        -- 希望報酬イメージ
  ADD COLUMN self_introduction TEXT,           -- 自己紹介/一言
  ADD COLUMN profile_photo_url VARCHAR(255);   -- 顔写真URL
```

---

## **Step 3-bis: 「気になる」機能用テーブル**

```sql
-- 気になる（お気に入り）機能用の新テーブル
CREATE TABLE rightarm_user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  target_profile_id UUID NOT NULL,
  target_profile_type profile_type_enum NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT fk_favorite_user 
    FOREIGN KEY (user_id) REFERENCES rightarm_users(id) ON DELETE RESTRICT,
  CONSTRAINT uq_user_favorite 
    UNIQUE (user_id, target_profile_id, target_profile_type)
);

-- インデックス作成
CREATE INDEX idx_favorites_user ON rightarm_user_favorites(user_id) 
  WHERE deleted_at IS NULL;
CREATE INDEX idx_favorites_target ON rightarm_user_favorites(target_profile_id, target_profile_type) 
  WHERE deleted_at IS NULL;
```

---

## **Step 6-bis: 拡張インデックス**

```sql
-- 全文検索用GINインデックス（新フィールド対応）
DROP INDEX IF EXISTS idx_cfo_search;
CREATE INDEX idx_cfo_search ON rightarm_cfo_profiles
  USING gin(to_tsvector('japanese', 
    COALESCE(first_name, '') || ' ' || 
    COALESCE(last_name, '') || ' ' || 
    COALESCE(bio, '') || ' ' ||
    COALESCE(career_achievements, '') || ' ' ||
    COALESCE(certifications, '') || ' ' ||
    COALESCE(self_introduction, '')
  )) WHERE deleted_at IS NULL;

DROP INDEX IF EXISTS idx_company_search;
CREATE INDEX idx_company_search ON rightarm_company_profiles
  USING gin(to_tsvector('japanese', 
    COALESCE(company_name, '') || ' ' || 
    COALESCE(company_description, '') || ' ' ||
    COALESCE(financial_challenges, '') || ' ' ||
    COALESCE(challenge_background, '') || ' ' ||
    COALESCE(cfo_requirements, '')
  )) WHERE deleted_at IS NULL;
```

---

## **Step 7-bis: トリガ関数の更新**

```sql
-- 論理削除カスケード用トリガ関数を更新（気になる機能対応）
CREATE OR REPLACE FUNCTION fn_soft_delete_cascade()
RETURNS trigger AS $$
BEGIN
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    
    -- 契約削除時：関連する請求書とレビューを論理削除
    IF TG_TABLE_NAME = 'rightarm_contracts' THEN
      UPDATE rightarm_invoices
        SET deleted_at = NEW.deleted_at
        WHERE contract_id = NEW.id AND deleted_at IS NULL;
        
      UPDATE rightarm_reviews
        SET deleted_at = NEW.deleted_at
        WHERE contract_id = NEW.id AND deleted_at IS NULL;
    END IF;
    
    -- アプリケーション削除時：関連する契約を論理削除
    IF TG_TABLE_NAME = 'rightarm_applications' THEN
      UPDATE rightarm_contracts
        SET deleted_at = NEW.deleted_at
        WHERE application_id = NEW.id AND deleted_at IS NULL;
    END IF;
    
    -- 会話削除時：関連するメッセージを論理削除
    IF TG_TABLE_NAME = 'rightarm_conversations' THEN
      UPDATE rightarm_messages
        SET deleted_at = NEW.deleted_at
        WHERE conversation_id = NEW.id AND deleted_at IS NULL;
    END IF;
    
    -- ユーザー削除時：関連するプロフィール・イベントログ・気になりを論理削除
    IF TG_TABLE_NAME = 'rightarm_users' THEN
      UPDATE rightarm_company_profiles
        SET deleted_at = NEW.deleted_at
        WHERE user_id = NEW.id AND deleted_at IS NULL;
        
      UPDATE rightarm_cfo_profiles
        SET deleted_at = NEW.deleted_at
        WHERE user_id = NEW.id AND deleted_at IS NULL;
        
      UPDATE rightarm_event_log
        SET deleted_at = NEW.deleted_at
        WHERE user_id = NEW.id AND deleted_at IS NULL;
        
      -- 気になり機能も論理削除
      UPDATE rightarm_user_favorites
        SET deleted_at = NEW.deleted_at
        WHERE user_id = NEW.id AND deleted_at IS NULL;
    END IF;
    
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## **Step 9-bis: RLSポリシーの追加**

```sql
-- 気になる機能のRLS
ALTER TABLE rightarm_user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorites" ON rightarm_user_favorites
  FOR ALL USING (user_id = auth.uid() AND deleted_at IS NULL);
```

---

## **Step 10-bis: カード表示用ビューの作成**

```sql
-- 企業カード表示用ビュー
CREATE VIEW v_company_card_display AS
SELECT 
  cp.*,
  u.email,
  u.email_verified,
  ARRAY_AGG(t.name) FILTER (WHERE t.type = 'challenge') as challenge_tags,
  -- 気になり数の集計
  (SELECT COUNT(*) FROM rightarm_user_favorites f 
   WHERE f.target_profile_id = cp.id 
     AND f.target_profile_type = 'company' 
     AND f.deleted_at IS NULL) as favorite_count
FROM rightarm_company_profiles cp
JOIN rightarm_users u ON cp.user_id = u.id
LEFT JOIN rightarm_profile_tags pt ON cp.id = pt.profile_id AND pt.profile_type = 'company'
LEFT JOIN rightarm_tags t ON pt.tag_id = t.id
WHERE cp.deleted_at IS NULL AND u.deleted_at IS NULL
GROUP BY cp.id, u.email, u.email_verified;

-- CFOカード表示用ビュー
CREATE VIEW v_cfo_card_display AS
SELECT 
  cfp.*,
  u.email,
  u.email_verified,
  ARRAY_AGG(t.name) FILTER (WHERE t.type = 'skill') as skill_tags,
  -- 気になり数の集計
  (SELECT COUNT(*) FROM rightarm_user_favorites f 
   WHERE f.target_profile_id = cfp.id 
     AND f.target_profile_type = 'cfo' 
     AND f.deleted_at IS NULL) as favorite_count
FROM rightarm_cfo_profiles cfp
JOIN rightarm_users u ON cfp.user_id = u.id
LEFT JOIN rightarm_profile_tags pt ON cfp.id = pt.profile_id AND pt.profile_type = 'cfo'
LEFT JOIN rightarm_tags t ON pt.tag_id = t.id
WHERE cfp.deleted_at IS NULL AND u.deleted_at IS NULL
GROUP BY cfp.id, u.email, u.email_verified;
```

---

## **実装時の重要な注意点**

### **段階的実装推奨**
1. **Step 1**: 新カラム追加（NULL許可で追加）
2. **Step 2**: 気になる機能テーブル作成
3. **Step 3**: インデックス更新
4. **Step 4**: トリガ関数更新
5. **Step 5**: RLSポリシー追加
6. **Step 6**: ビュー作成

### **データ互換性**
- 新カラムはすべてNULL許可で追加
- 既存データに影響を与えない設計
- 段階的なデータ投入が可能

### **パフォーマンス考慮**
- 新しいビューは適切にインデックスを活用
- 全文検索は新フィールドを含めて最適化
- 気になり数の集計はサブクエリで効率化

### **推定年商の対応**
既存の `revenue_range VARCHAR(30)` カラムで以下の値に対応：
- '1億円未満'
- '1-10億円'  
- '10-30億円'
- '30-50億円'
- '50億円以上'
- '非公開'

### **スキル大分類の対応**
既存のタグシステムを活用し、フロントエンド側で以下の6つの大分類にグルーピング：
1. 資金調達
2. IPO・M&A関連
3. 財務DX・システム導入
4. 事業承継・再生
5. 組織・ガバナンス
6. その他

---

## **動作確認用クエリ**

```sql
-- 1. 新カラムの確認
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('rightarm_company_profiles', 'rightarm_cfo_profiles')
  AND column_name IN ('financial_challenges', 'career_achievements', 'profile_photo_url')
ORDER BY table_name, column_name;

-- 2. 気になる機能テーブルの確認
SELECT COUNT(*) as total_favorites FROM rightarm_user_favorites WHERE deleted_at IS NULL;

-- 3. カード表示ビューの動作確認
SELECT company_name, challenge_tags, favorite_count 
FROM v_company_card_display 
LIMIT 5;

-- 4. RLS動作確認
SELECT policy_name, table_name FROM information_schema.table_privileges 
WHERE table_name = 'rightarm_user_favorites';
```

**この修正により、画面設計書 Version 1.2 の全要件に対応し、既存システムとの互換性を保ちながら新機能を追加できます。**