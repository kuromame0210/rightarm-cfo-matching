# 気になる機能 API テスト

このディレクトリには、気になる機能（いいね機能）のAPIテストが含まれています。

## テストファイル構成

### 1. `route.simple.test.ts`
- **目的**: 基本的な機能の動作確認
- **特徴**: モックライブラリに依存しない軽量テスト
- **テスト内容**:
  - リクエストオブジェクトの作成確認
  - URLパラメータの解析
  - データバリデーション
  - レスポンス構造の確認

### 2. `route.test.ts`
- **目的**: 包括的なAPIテスト
- **特徴**: Supabaseのモックを使用したフルテスト
- **テスト内容**:
  - GET /api/interests (気になるリスト取得)
  - POST /api/interests (気になる追加)
  - DELETE /api/interests (気になる削除)
  - 認証処理のテスト
  - エラーハンドリング

### 3. `../interests.integration.test.ts`
- **目的**: 統合テストとシナリオテスト
- **特徴**: 実際の使用フローに近いテスト
- **テスト内容**:
  - フルワークフロー（追加→取得→削除）
  - 大量データ処理
  - 同時リクエスト処理
  - データ整合性確認

## テスト実行方法

### シンプルテストのみ実行
```bash
npx jest src/app/api/__tests__/interests/route.simple.test.ts
```

### 全ての気になるAPIテスト実行
```bash
npx jest --testPathPattern="interests"
```

### カバレッジ付きでテスト実行
```bash
npx jest --coverage --testPathPattern="interests"
```

## API エンドポイント詳細

### GET /api/interests
**目的**: ユーザーの気になるリストを取得

**認証**: Bearer token必須

**レスポンス例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "interest-1",
      "target_user_id": "cfo-1",
      "target_type": "cfo",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST /api/interests
**目的**: 気になるプロフィールを追加

**認証**: Bearer token必須

**リクエストBody**:
```json
{
  "targetUserId": "cfo-1",
  "targetType": "cfo"
}
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "id": "interest-1",
    "user_id": "user-1",
    "target_user_id": "cfo-1",
    "target_type": "cfo",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "気になるに追加しました"
}
```

### DELETE /api/interests
**目的**: 気になるプロフィールを削除

**認証**: Bearer token必須

**クエリパラメータ**: `?targetUserId=cfo-1`

**レスポンス例**:
```json
{
  "success": true,
  "message": "気になるから削除しました"
}
```

## 認証方式

### Demo Token
- 開発・テスト用
- 値: `demo-token`
- 動作: データベースから最初のユーザーを取得して使用

### JWT Token
- 本番用
- JWTトークンをデコードしてemailを取得
- 環境変数 `NEXTAUTH_SECRET` が必要

## エラーレスポンス

全てのエラーレスポンスは以下の形式:
```json
{
  "success": false,
  "error": "エラーメッセージ"
}
```

### 主なエラーケース
- `401`: 認証が必要です
- `400`: targetUserIdとtargetTypeが必要です
- `404`: ユーザーが見つかりません
- `409`: 既に気になるに追加されています
- `500`: 気になるリストの取得に失敗しました

## データベーステーブル

### rextrix_interests
- `id`: プライマリキー
- `user_id`: 気になるボタンを押したユーザー
- `target_user_id`: 気になるされたユーザー
- `target_type`: 'cfo' | 'company'
- `created_at`: 作成日時

## 依存関係

- `@/lib/supabase`: Supabaseクライアント
- `@/lib/constants`: テーブル名定数
- `jsonwebtoken`: JWT認証
- `zod`: 入力バリデーション（将来的に）

## テスト改善点

1. **リアルデータベーステスト**: Supabaseローカル環境での実際のデータベーステスト
2. **パフォーマンステスト**: 大量データでのレスポンス時間測定
3. **E2Eテスト**: フロントエンドとの統合テスト
4. **セキュリティテスト**: SQLインジェクション等の脆弱性テスト

## 継続的インテグレーション

テストはGitHub Actionsで自動実行され、以下をチェック:
- 全テストの成功
- コードカバレッジ80%以上
- ESLintルール遵守
- TypeScript型チェック