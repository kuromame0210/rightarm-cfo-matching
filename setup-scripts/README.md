# Setup Scripts

新アーキテクチャのセットアップ用スクリプト集

## ファイル一覧

### `create_new_architecture.sql`
- **目的**: 新しいSupabaseプロジェクトに6テーブル構成のデータベースを作成
- **内容**: ENUM型、テーブル定義、インデックス、RLSポリシー
- **使用方法**: Supabase SQL Editorで実行

### テスト・確認スクリプト

#### `test_auth.js`
- **目的**: Supabase Auth設定確認・テストユーザー動作確認
- **内容**: 認証システム、RLSポリシー、テーブルアクセステスト
- **使用方法**: `node test_auth.js`

#### `test_profile_creation.js`
- **目的**: CFO・企業プロフィール作成動作確認
- **内容**: CRUD操作、JSONB検索、ユーザー間インタラクション
- **使用方法**: `node test_profile_creation.js`

#### `test-new-auth.js`
- **目的**: 新アーキテクチャ対応後の総合システムテスト
- **内容**: API動作確認、認証フロー、エンドポイント状態確認
- **使用方法**: `node test-new-auth.js`

#### `verify_rls_policies.js`
- **目的**: RLSポリシー動作確認
- **内容**: 匿名アクセス制限、認証ユーザー権限テスト
- **使用方法**: `node verify_rls_policies.js`

### 実行・マイグレーション

#### `execute_sql.js` 
- **目的**: Node.jsからデータベース状態をテスト・確認
- **内容**: テーブル存在確認、接続テスト
- **使用方法**: `node execute_sql.js`

#### `migrate.js`
- **目的**: データベースマイグレーション実行
- **内容**: 自動マイグレーション試行（手動実行推奨）
- **使用方法**: `node migrate.js`

### 設定ガイド

#### `auth_setup_guide.md`
- **目的**: Supabase Auth手動設定手順書
- **内容**: 認証設定、SMTP設定、テストユーザー作成手順

## 新アーキテクチャ概要

### 6テーブル構成
1. `cfo_profiles` - CFO固有プロフィール
2. `biz_profiles` - 企業固有プロフィール  
3. `likes` - 「気になる」機能
4. `reviews` - ★評価+コメント
5. `messages` - チャット&スカウト統合
6. `attachments` - ファイル添付

### 認証
- Supabase Auth (`auth.users`) ベース
- UUID主キーで各プロフィールテーブルと連携

### データ格納
- メイン情報: TEXT形式 (`cfo_raw_profile`, `biz_raw_profile`)
- 検索用: JSONB配列 (`cfo_skills[]`, `biz_issues[]`)