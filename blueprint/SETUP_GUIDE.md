# Firebase + Supabase 認証システム セットアップガイド

## 概要
このガイドでは、Firebase認証とSupabaseデータベースを連携させた認証システムの設定方法を説明します。

## 前提条件
- Node.js (v16以上)
- npm または yarn
- Firebaseアカウント
- Supabaseアカウント

## ステップ1: Firebaseプロジェクトの作成

### 1.1 Firebase Console でプロジェクト作成
1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: rightarm-cfo-matching）
4. Google Analytics は任意で設定

### 1.2 Authentication の設定
1. Firebase Console で「Authentication」を選択
2. 「始める」をクリック
3. 「Sign-in method」タブで以下を有効化：
   - メール/パスワード
   - Google（任意）

### 1.3 ウェブアプリの追加
1. Firebase Console でプロジェクト設定を開く
2. 「ウェブアプリを追加」をクリック
3. アプリ名を入力
4. 設定情報をコピー（後で使用）

### 1.4 Firebase Admin SDK の設定
1. Firebase Console で「プロジェクトの設定」→「サービスアカウント」
2. 「新しい秘密鍵の生成」をクリック
3. JSONファイルをダウンロード
4. 環境変数として設定（後述）

## ステップ2: Supabaseプロジェクトの作成

### 2.1 Supabaseプロジェクト作成
1. [Supabase](https://supabase.com/) にサインアップ
2. 「New project」をクリック
3. Organization を選択または作成
4. プロジェクト名、データベースパスワードを設定
5. リージョンを選択（日本の場合は Tokyo）

### 2.2 データベーススキーマの作成
1. Supabase Dashboard で「SQL Editor」を開く
2. `supabase-schema.sql` の内容をコピー&ペースト
3. 「Run」をクリックして実行

### 2.3 API キーの取得
1. Supabase Dashboard で「Settings」→「API」
2. 以下のキーをコピー：
   - Project URL
   - anon public key
   - service_role secret key

## ステップ3: 環境変数の設定

### 3.1 環境変数ファイルの作成
プロジェクトルートに `.env.local` ファイルを作成：

\`\`\`env
# Firebase設定
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CLIENT_CERT_URL=your_client_cert_url

# Supabase設定
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

### 3.2 設定ファイルの更新
1. `firebase-config.js` の設定情報を環境変数から読み込むように更新
2. `supabase-config.js` の設定情報を環境変数から読み込むように更新

## ステップ4: 依存関係のインストール

### 4.1 必要なパッケージのインストール
\`\`\`bash
npm install firebase firebase-admin @supabase/supabase-js
\`\`\`

### 4.2 Next.js プロジェクトの場合
\`\`\`bash
npm install next react react-dom
\`\`\`

## ステップ5: 認証フローのテスト

### 5.1 開発サーバーの起動
\`\`\`bash
npm run dev
\`\`\`

### 5.2 認証テスト手順
1. ブラウザで `http://localhost:3000/auth.html` にアクセス
2. 会員登録フォームでテストユーザーを作成
3. ログインフォームでログインをテスト
4. Google認証をテスト（設定している場合）

### 5.3 データベース確認
1. Supabase Dashboard で「Table Editor」を開く
2. `profiles` テーブルにユーザーデータが作成されているか確認

## ステップ6: セキュリティ設定

### 6.1 Firebase Security Rules
Firebase Console の「Authentication」→「設定」で以下を確認：
- 承認済みドメインにあなたのドメインを追加
- パスワード設定の要件を確認

### 6.2 Supabase RLS（Row Level Security）
必要に応じて `supabase-schema.sql` のRLSポリシーを本番環境用に調整

## トラブルシューティング

### よくあるエラーと解決方法

**1. Firebase設定エラー**
- 環境変数が正しく設定されているか確認
- Firebase Console の設定情報と一致しているか確認

**2. Supabase接続エラー**
- Supabase URL と API キーが正しいか確認
- ネットワーク接続を確認

**3. 認証エラー**
- Firebase Admin SDK の秘密鍵が正しく設定されているか確認
- IDトークンの有効期限を確認

**4. CORS エラー**
- Firebase Console で承認済みドメインを設定
- 開発環境では `localhost` を追加

## 本番環境デプロイ時の注意点

1. **環境変数の設定**: 本番環境で環境変数を適切に設定
2. **HTTPS の使用**: Firebase認証はHTTPS環境が推奨
3. **ドメイン設定**: Firebase Console で本番ドメインを承認済みドメインに追加
4. **Supabase RLS**: 本番環境では適切なRLSポリシーを設定
5. **エラーハンドリング**: 適切なエラーメッセージとログ出力を実装

## サポート

問題が発生した場合は以下を確認してください：
- [Firebase ドキュメント](https://firebase.google.com/docs)
- [Supabase ドキュメント](https://supabase.com/docs)
- エラーログとコンソールメッセージ