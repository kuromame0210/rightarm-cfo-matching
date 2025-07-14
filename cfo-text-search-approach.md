# CFOプロフィール：シンプルテキスト検索アプローチ

## 設計思想
**「原文の価値を損なわず、柔軟な検索を実現」**

複雑なJSONB構造化ではなく、原文保持 + LIKE検索で自然な情報管理を実現。

## 実装内容

### テーブル構造（シンプル）
```sql
ALTER TABLE rextrix_cfos 
ADD COLUMN career_full_text TEXT,        -- 経歴原文
ADD COLUMN skills_full_text TEXT,        -- 可能業務原文  
ADD COLUMN qualifications_text TEXT,     -- 保有資格原文
ADD COLUMN introduction_full_text TEXT,  -- 紹介文原文
ADD COLUMN availability_text TEXT,       -- 稼働時間原文
ADD COLUMN compensation_text TEXT,       -- 報酬情報原文
ADD COLUMN service_area_text TEXT;       -- 対応エリア原文
```

### 検索例（直感的）
```sql
-- M&A経験者を探す
SELECT * FROM rextrix_cfos 
WHERE career_full_text ILIKE '%M&A%';

-- 海外経験者を探す  
SELECT * FROM rextrix_cfos 
WHERE career_full_text ILIKE '%海外%' 
   OR career_full_text ILIKE '%フィリピン%'
   OR career_full_text ILIKE '%US%';

-- IPO対応可能者を探す
SELECT * FROM rextrix_cfos 
WHERE skills_full_text ILIKE '%IPO%';
```

## 追加データ例

### Dai88さん（佐藤大悟）
- **経歴**: 7つの事業経験、2社M&A売却、フィリピン・セブ島複数事業
- **特徴**: US IPOサポート、クロスボーダーM&A、不動産開発
- **検索キーワード**: 「M&A」「海外」「フィリピン」「US」「IPO」「不動産」

### 奥田さん（奥田豊）  
- **経歴**: りそな銀行 → 日本発条 → エスネットワークス（IPO達成）
- **特徴**: 銀行・事業会社両方の経験、IPO実績、中小企業診断士
- **検索キーワード**: 「IPO」「銀行」「診断士」「簿記」「資金調達」

## 利点

✅ **原文完全保持**: 情報の価値を損なわない
✅ **実装シンプル**: 複雑な構造化不要
✅ **検索柔軟**: 思いついたキーワードで自然検索
✅ **拡張容易**: 新しい情報を追加しやすい
✅ **ユーザー直感的**: 期待通りの検索結果

## 実行手順

1. **データベース拡張**:
   ```bash
   sql/simple-text-based-cfo-profiles.sql
   ```

2. **検索機能実装**:
   - フロントエンドに検索ボックス追加
   - LIKE検索でリアルタイム絞り込み
   - 複数キーワード対応

3. **表示改善**:
   - 原文をそのまま表示
   - 検索ヒット部分のハイライト

## 期待される効果

- 🔍 **自然な検索体験**: 「フィリピンでの事業経験がある人」→「フィリピン」で検索
- 📄 **情報の完全性**: 複雑な経歴も原文のまま保持
- ⚡ **高速検索**: PostgreSQL GINインデックス活用
- 🎯 **精度の高いマッチング**: 詳細情報による正確な判断

この方式なら、CFOの豊富な経験・実績を損なうことなく、企業側も直感的に必要な人材を見つけられます。