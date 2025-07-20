# Rextrix Project - Claude Code Context

## プロジェクト概要
CFO・企業マッチングプラットフォーム（旧RightArm）
- Next.js + TypeScript + Supabase
- 認証、プロフィール管理、ファイルアップロード機能

## 変更履歴

### 2025-01-10 - ファイルアップロード＆プロフィール更新修正
**問題:** プロフィール画像アップロードでSupabase RLSエラー
- エラー: `Bucket not found` → `rextrix-*` プレフィックス付きバケット作成
- エラー: `RLS policy violation` → セキュアなAPI経由アップロードに変更

**実装変更:**
- `src/lib/storage.ts` - バケット名にrextrixプレフィックス追加
- `src/app/api/upload/route.ts` - 新規作成、サーバーサイドアップロード
- `scripts/setup-storage-buckets.sql` - バケット作成SQL
- `scripts/fix-storage-rls-policies.sql` - RLSポリシー修正（未使用）

**問題2:** プロフィール更新API認証エラー
- エラー: `401 Unauthorized` → 複数認証システムの混在
- 原因: NextAuth.js、テーブルベース認証、Supabase Authが混在
- 解決: 一時的にSupabase認証対応（統一は今後の課題）

**発見された根本問題（再発）:**
- **認証統一作業が未完了**: 先週開始したNextAuth.js統一が途中で停止
- **新機能追加時の回帰**: 新しいAPIで古い認証方式を使用
- **3つの認証システムが再び混在**: NextAuth.js、独自JWT、Supabase Auth
- **統一計画は存在**: `read/authrefactrecipe.md`に詳細な移行プランあり

**重要な技術決定:**
- クライアントサイドでのService Role Key使用を回避
- サーバーサイドAPI経由でセキュアなアップロード実装
- 認証統一の必要性を確認（NextAuth.js推奨）

## プロジェクト構造
```
src/
├── app/
│   ├── api/upload/          # ファイルアップロードAPI
│   └── profile/             # プロフィール編集画面
├── lib/
│   ├── storage.ts           # ストレージ操作
│   └── supabase.ts          # Supabase設定
└── components/
    └── FileUpload.tsx       # ファイルアップロードコンポーネント
```

## 開発コマンド
- `npm run dev` - 開発サーバー起動
- `npm run build` - ビルド
- `npm run lint` - リント実行
- `npm run type-check` - 型チェック

## Supabase設定
- バケット: `rextrix-profile-images`, `rextrix-company-logos`, etc.
- 認証: Supabase Auth
- データベース: PostgreSQL with RLS

## 現在の状況
- ✅ ストレージバケット作成完了
- ✅ セキュアなAPI経由アップロード実装
- ✅ ファイルアップロード機能動作確認済み
- ✅ プロフィール更新API認証エラー修正完了

## TODOと課題

### 2025-07-11 - 認証システム統一状況確認・不要コード削除

**実行内容:**
1. ✅ 認証システムの調査・分析完了
2. ✅ 不要なレガシーファイル削除（auth-client.ts、authUtils.ts、replace-demo-tokens.js）
3. ✅ テストファイル修正（isPublicOnlyRoute関数削除対応）
4. ✅ ビルド確認完了（エラーなし、警告のみ）
5. ✅ 認証システムがNextAuth.js統一済みを確認

### 認証統一完了状況
- ✅ **NextAuth.js統一**: 全APIとフロントエンドでNextAuth.js使用
- ✅ **レガシーシステム削除**: withAuth HOC、独自JWT、localStorage認証削除
- ✅ **一貫性確保**: useSession、getServerSession統一使用
- ✅ **型安全性**: NextAuth.js型定義活用

### 残タスク（優先度低）
- [ ] より厳密なRLSポリシーの設定
- [ ] ファイルサイズ制限の実装確認
- [ ] テストファイルの型エラー修正（jest設定）

## Claude Codeでの作業履歴
**このファイル（CLAUDE.md）を毎回更新して履歴を残す**
- 変更理由、技術的決定、トラブルシューティング過程を記録
- 次回のセッションで即座にコンテキストを把握可能

### 2025-07-13 - CFOプロフィール機能強化実装
**問題:** 実際のCFO情報（CFO.md）を格納するには既存のデータベース構造では不十分
- 課題: 詳細職歴、複雑な稼働条件、多様な報酬体系、海外経験等の管理不可
- 検討: 新規テーブル追加 vs 既存テーブル拡張の比較

**実装アプローチ:**
- **既存テーブル拡張方式を採用** - 新規テーブル作成ではなく、JSONBカラム追加
- CFOプロフィールテーブルにJSONB拡張: work_experiences, detailed_certifications, availability_conditions, compensation_details等
- ユーザープロフィールテーブルにJSONB拡張: location_details, contact_preferences, international_experience等

**技術的決定:**
- **JSONBフィールド活用**: 複雑な構造化データを柔軟に管理
- **GINインデックス**: JSONB検索の高速化
- **後方互換性**: 既存データを新構造に自動移行
- **段階的実装**: システム停止なしで機能拡張

**実装ファイル:**
- `sql/implement-cfo-profile-enhancement.sql` - メイン実装スクリプト
- `sql/analyze-cfo-data-mapping.sql` - データマッピング分析
- `sql/enhance-existing-tables.sql` - テーブル拡張設計

**実装内容:**
- 既存テーブルに11個のJSONBカラム追加
- CFO.mdの5名分の詳細プロフィールデータを完全格納可能に
- 高度な検索関数とビューの作成
- プロフィール完成度自動計算機能

**検証結果:**
- ✅ 全てのCFO情報（複雑な職歴、海外経験、M&A売却歴等）を格納可能
- ✅ 高速検索（GINインデックス活用）
- ✅ 既存システムとの完全互換性
- ✅ 新規テーブル作成なしで機能大幅拡張達成

### 2025-07-11 - 認証システム現状確認
**調査結果:**
- 認証システムは既にNextAuth.js統一済み（完全動作）
- 重複コードの指摘は現在のコードベースと一致せず
- 不要なレガシーコードを削除し、クリーンな状態に整理完了

### 2025-07-13 - cfo_data.mdデータ完全投入作業完了
**実装完了内容:**
- ✅ `cfo_data.md`の佐藤大悟さん・奥田豊さんデータを既存フィールドに完全投入
- ✅ JSONB型specialties配列対応（佐藤:25項目、奥田:23項目の専門分野）
- ✅ 既存テーブル活用（新アーキテクチャ対応）
- ✅ 検索機能動作確認（M&A、IPO、フィリピン関連スキル検索）

**技術的実装:**
- JavaScript Supabase Client使用による安全なデータ投入
- JSONB配列形式による構造化された専門分野データ
- 既存ユーザーアカウント活用（UUID重複エラー回避）
- UPDATE方式による既存レコード更新

**投入データ詳細:**
```
佐藤大悟さん（dai88@example.com）:
- タイトル: クロスボーダーM&A・海外事業・USアップサポート専門家
- 経験年数: 23年
- 専門分野: 25項目（海外業務、M&A支援、IPOサポート等）
- 地域: 千葉県千葉市
- 働き方: 応相談（臨機応変に対応）

奥田豊さん（okuda@example.com）:
- タイトル: IPO達成経験・銀行出身・中小企業診断士
- 経験年数: 18年
- 専門分野: 23項目（IPO支援、銀行業務、経理業務等）
- 地域: 奈良県生駒市
- 働き方: 週２日・10時から18時
```

**作成ファイル:**
- `scripts/execute-cfo-data-import.js` - メインデータ投入スクリプト
- `scripts/verify-final-data.js` - データ検証スクリプト
- `scripts/test-search-functionality.js` - 検索機能テストスクリプト

**データベース状況:**
- 既存フィールドを最大活用（新テーブル作成回避）
- JSONB配列による効率的な専門分野管理
- テキストベース検索とJSONB検索の併用可能

### 2025-07-19 - 構造化検索フィールド実装・UI階層再設計完了

**実行内容:**
1. ✅ CFOプロフィール編集画面の大幅UI再設計実装
2. ✅ 構造化入力フィールドを必須項目として上位配置
3. ✅ テキスト入力を任意の詳細情報として下位配置
4. ✅ 地域選択を都道府県→エリア単位（関東、関西等）に変更
5. ✅ 必須フィールドバリデーション実装

**技術的実装:**
- **EssentialProfileInputs.tsx**: 新規コンポーネント作成
  - 報酬設定（月額制・応相談）、稼働条件（週日数）、対応エリア（関東・関西等）
  - required prop対応、視覚的な必須項目表示（赤いアスタリスク）
- **profile/page.tsx**: UI階層完全再設計
  - 🎯 基本設定（必須項目）: 青色背景で明確区分
  - 📝 詳細情報（任意）: 従来のテキスト入力を任意項目として配置
- **api/cfos/route.ts**: 構造化検索対応
  - 選択式データ優先、テキスト検索は補完的役割
  - エリア単位検索（kanto, kansai等）対応
- **sql/add-essential-structured-fields.sql**: データベース設計
  - compensation_type, monthly_fee_min/max, weekly_days, supported_prefectures等

**UI設計の重要な変更:**
- **階層構造**: 選択式（必須）→ テキスト（任意）の明確な優先順位
- **視覚的区分**: 青色背景とアイコンによる項目区分
- **地域粒度**: 都道府県47選択肢 → エリア6選択肢への簡素化
- **検索最適化**: 精度の高い構造化データを主軸とした検索システム

**解決した課題:**
- テキストベース検索の精度問題 → 構造化データによる正確な検索実現
- UI複雑性 → 必須/任意の明確な階層化
- 地域選択の煩雑性 → エリア単位での直感的選択

**動作確認:**
- ✅ ビルドエラーなし（警告のみ）
- ✅ 型チェック（Jest設定の問題のみ、実装コードは正常）
- ✅ 必須フィールドの視覚的表示
- ✅ 構造化データ検索API対応

## 参考情報
- Supabase Storage: https://supabase.com/docs/guides/storage
- Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers