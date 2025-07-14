# 既存CFOプロフィール詳細化の実装手順

## 現状確認
現在3名のCFOプロフィールが基本情報のみで登録されています：
- **菅原大源**: 住友商事・KPMG・Air Water America経験
- **nanalysts**: 金融機関16年・VC業務・50社投資実績  
- **田中（仮名）**: 総合商社・Big4コンサル・北米MBA・リモートCFO実績

## 実装内容

### Phase 1: テーブル構造拡張
既存`rextrix_cfos`テーブルに以下のJSONBカラムを追加：
- `work_experiences`: 詳細職歴
- `detailed_certifications`: 資格詳細
- `availability_conditions`: 稼働条件
- `compensation_details`: 報酬体系
- `service_areas`: 対応エリア
- `consultation_approach`: コンサルティング方針

### Phase 2: 既存データの詳細化
各CFOのプロフィールをCFO.mdレベルに拡張：

#### 菅原大源さん
- 職歴: 住友商事(6年) → KPMG FAS(1年) → Air Water America(現在)
- 資格: 米国公認会計士、簿記2級、FP2級
- 稼働: 週4日・月16時間、時差対応可能
- 報酬: 月15万円〜

#### nanalystsさん  
- 職歴: 金融機関16年(海外駐在8年・VC6年・法人営業2年)
- 資格: 証券アナリスト、FP2級
- 稼働: 週2日・5時間程度
- 専門: 50社投資実績、ステージ別企業価値向上

#### 田中（仮名）さん
- 職歴: 総合商社財務部(3年) → Big4コンサル(4年)
- 資格: 北米MBA、日商簿記2級
- 稼働: 週5-10時間、日本時間対応可
- 特徴: 北米在住、リモートCFO実績

### Phase 3: UI対応
プロフィール画面で新しいJSONB情報を表示：
- 詳細職歴の一覧表示
- 保有資格のバッジ表示
- 稼働条件・報酬の構造化表示
- 対応エリア・時差情報

## 実行手順

1. **Supabase SQL Editorで実行:**
   ```bash
   sql/quick-enhance-existing-cfos.sql
   ```

2. **フロントエンド修正:**
   - `src/app/profile/page.tsx`: JSONB情報の表示対応
   - `src/hooks/useProfile.ts`: 新しいデータ構造対応

3. **動作確認:**
   - 各CFOプロフィールの詳細表示
   - 検索機能での絞り込み
   - 新規CFO登録での構造化データ入力

## 期待される効果

- ✅ CFO.mdレベルの詳細情報表示
- ✅ 高度な検索・フィルタリング機能
- ✅ 企業とCFOの精度の高いマッチング
- ✅ プロフィール完成度の向上

この実装により、基本的なCFOマッチングプラットフォームから、詳細な経歴・スキル・条件を管理できる本格的なプラットフォームへ進化します。