# データベース最適化実装ガイド

## 概要

このガイドは、CFOマッチングプラットフォームのデータベース構造を最適化し、11個のテーブルから5個のテーブルに統合する実装プランです。

## 🎯 最適化の目標

### 現在の問題
- **過度な正規化**: 11個以上のテーブルによる複雑な構造
- **データ重複**: 同じような項目が複数テーブルに散在
- **メンテナンス性の低下**: 外部キー管理の複雑化
- **開発効率の低下**: 複数テーブルのJOINによる複雑なクエリ

### 最適化後の利点
- **テーブル数削減**: 11個 → 5個（54%削減）
- **パフォーマンス向上**: JSONB + GINインデックスによる高速検索
- **開発効率向上**: 単一テーブルでの統合管理
- **柔軟性向上**: JSONBによる構造化データの柔軟な管理

## 📊 テーブル構造比較

### 現在の構造（11テーブル）
```
rextrix_users               # ユーザー基本情報
rextrix_user_profiles       # 汎用プロフィール
rextrix_cfos               # CFO専用プロフィール
rextrix_companies          # 企業プロフィール
rextrix_cfo_work_experiences    # CFO職歴
rextrix_cfo_certifications      # CFO資格
rextrix_cfo_availability        # CFO稼働条件
rextrix_cfo_service_areas       # CFO対応エリア
rextrix_cfo_compensation        # CFO報酬設定
rextrix_skill_tags              # スキルマスター
rextrix_challenge_tags          # 課題マスター
```

### 最適化後の構造（5テーブル）
```
rextrix_users                   # ユーザー基本情報（変更なし）
rextrix_profiles_v2             # 統合プロフィール（CFO・企業共通）
rextrix_profile_skills_v2       # プロフィール-スキル関連
rextrix_skill_tags             # スキルマスター（変更なし）
rextrix_challenge_tags         # 課題マスター（変更なし）
```

## 🏗️ 実装ファイル

### 1. 分析・設計ファイル
- `database-optimization-analysis.sql` - 現状分析と最適化方針
- `comprehensive-table-analysis.sql` - 詳細なテーブル構造分析

### 2. 実装ファイル
- `implement-optimized-schema.sql` - 最適化スキーマの実装
- `migrate-data-to-optimized-schema.sql` - データ移行スクリプト

### 3. APIファイル
- `src/app/api/profile-v2/route.ts` - 最適化されたAPI（新版）
- `src/app/api/profile/route.ts` - 既存API（互換性維持）

## 🚀 実装手順

### Phase 1: テスト環境での検証
```bash
# 1. 分析クエリ実行
psql -f sql/comprehensive-table-analysis.sql

# 2. 最適化スキーマ作成
psql -f sql/implement-optimized-schema.sql

# 3. データ移行テスト
psql -f sql/migrate-data-to-optimized-schema.sql
```

### Phase 2: APIテスト
```bash
# 新APIエンドポイントのテスト
curl -X GET http://localhost:3000/api/profile-v2
curl -X PUT http://localhost:3000/api/profile-v2 -d '{"name":"テスト"}'
```

### Phase 3: フロントエンド調整
```typescript
// useProfile.ts の更新例
const response = await fetch('/api/profile-v2', {
  method: 'GET',
  credentials: 'include'
})
```

### Phase 4: 本番環境移行
1. データベースバックアップ作成
2. 最適化スキーマ実装
3. データ移行実行
4. API切り替え
5. 旧テーブルの段階的廃止

## 📝 主要な技術的変更

### 1. JSONB活用によるデータ統合

#### 職歴データ（work_experiences）
```json
[
  {
    "company_name": "株式会社A",
    "position": "CFO",
    "start_year": 2020,
    "end_year": null,
    "description": "財務戦略立案",
    "is_current": true
  }
]
```

#### 稼働条件（availability）
```json
{
  "days_per_week": 2,
  "hours_per_day": 8.0,
  "start_time": "10:00",
  "end_time": "18:00",
  "flexible_schedule": true,
  "preferred_days": ["月", "水"]
}
```

#### 報酬設定（compensation）
```json
{
  "primary_type": "hourly",
  "hourly_rate": {"min": 5000, "max": 8000},
  "performance_bonus_available": true,
  "negotiable": true,
  "currency": "JPY"
}
```

### 2. 検索最適化インデックス

```sql
-- JSONB用GINインデックス
CREATE INDEX idx_profiles_v2_location_gin ON rextrix_profiles_v2 USING GIN (location_data);
CREATE INDEX idx_profiles_v2_compensation_gin ON rextrix_profiles_v2 USING GIN (compensation);

-- 個別検索用インデックス
CREATE INDEX idx_profiles_v2_remote ON rextrix_profiles_v2 USING GIN ((location_data->'remote_available'));
CREATE INDEX idx_profiles_v2_hourly_rate ON rextrix_profiles_v2 USING GIN ((compensation->'hourly_rate'));
```

### 3. 高性能検索クエリ例

```sql
-- リモート可能なCFOを時給で検索
SELECT * FROM rextrix_profiles_v2 
WHERE profile_type = 'cfo'
  AND location_data->>'remote_available' = 'true'
  AND (compensation->'hourly_rate'->>'min')::int >= 5000;

-- 特定地域の企業を業界で検索
SELECT * FROM rextrix_profiles_v2 
WHERE profile_type = 'company'
  AND location_data->>'prefecture' = '東京都'
  AND industry = 'IT・通信';
```

## 🧪 テストシナリオ

### 1. データ整合性テスト
- [ ] 全ユーザーデータの正常移行確認
- [ ] JSONBフィールドの構造検証
- [ ] 外部キー制約の動作確認

### 2. パフォーマンステスト
- [ ] 大量データでの検索速度測定
- [ ] GINインデックスの効果確認
- [ ] 複雑条件クエリの実行時間測定

### 3. API互換性テスト
- [ ] 既存フロントエンドとの互換性確認
- [ ] レスポンス形式の検証
- [ ] エラーハンドリングの動作確認

### 4. 運用テスト
- [ ] バックアップ・リストア手順の確認
- [ ] 段階的移行プロセスの検証
- [ ] ロールバック手順の確認

## ⚠️ 重要な注意事項

### 1. データ移行前の準備
```sql
-- 必須: 本番データの完全バックアップ
pg_dump your_database > backup_before_optimization.sql

-- 制約確認
SELECT * FROM information_schema.table_constraints 
WHERE table_name LIKE 'rextrix_%';
```

### 2. 段階的移行戦略
1. **並行運用期間**: 新旧API両方を維持
2. **監視期間**: パフォーマンスとエラー率の監視
3. **完全移行**: 十分な検証後に旧システム廃止

### 3. ロールバック計画
- 旧テーブルのバックアップ保持（1ヶ月間）
- 新API → 旧API切り戻し手順の確立
- データ不整合時の修復手順

## 📈 期待される効果

### 短期効果（1ヶ月以内）
- データベース管理の簡素化
- 開発速度の向上（新機能追加）
- API応答速度の改善

### 中期効果（3ヶ月以内）
- メンテナンスコストの削減
- 複雑な検索機能の実装容易化
- データ分析の効率化

### 長期効果（6ヶ月以降）
- スケーラビリティの向上
- 新機能開発の加速
- システム全体の安定性向上

## 🎯 成功指標

### 技術指標
- テーブル数: 11 → 5（54%削減）
- 平均クエリ実行時間: 30%以上改善
- データベースサイズ: 20%削減（正規化の最適化）

### 開発指標
- 新機能実装時間: 40%短縮
- バグ発生率: 30%削減
- コードレビュー時間: 25%短縮

## 📞 サポート

実装中に問題が発生した場合：

1. **データ関連**: migration logを確認
2. **API関連**: profile-v2エンドポイントのレスポンス確認
3. **パフォーマンス関連**: インデックス使用状況の確認

---

このガイドに従って段階的に実装することで、安全にデータベース最適化を完了できます。