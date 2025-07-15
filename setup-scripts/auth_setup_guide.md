# Supabase Auth 設定手順

新アーキテクチャでのSupabase認証設定ガイド

## 📋 設定手順

### 1. 基本認証設定

#### **Supabaseダッシュボードにアクセス**
1. https://supabase.com/dashboard
2. プロジェクト `ipovokidhyhojjqhanwj` を選択
3. **Authentication** → **Settings** へ移動

#### **Site URL設定**
```
Site URL: http://localhost:3000
Additional Redirect URLs: http://localhost:3000/auth/callback
```

#### **Email Auth設定**
- **Enable email confirmations**: ✅ ON（本番用）または ❌ OFF（開発用）
- **Secure email change**: ✅ ON 推奨

### 2. プロバイダー設定

#### **Email Provider**
```
Enable: ✅ ON
Confirm email: 開発時は OFF、本番は ON
```

#### **その他のプロバイダー（オプション）**
- Google OAuth（将来的に追加可能）
- GitHub OAuth（将来的に追加可能）

### 3. Email Template設定

#### **確認メール（Confirm signup）**
```
Subject: CFOマッチング - メール確認
Body: 以下のリンクをクリックしてメールアドレスを確認してください
{{ .ConfirmationURL }}
```

#### **パスワードリセット**
```
Subject: CFOマッチング - パスワードリセット
Body: 以下のリンクをクリックしてパスワードをリセットしてください
{{ .ConfirmationURL }}
```

### 4. セキュリティ設定

#### **Password Policy**
```
Minimum password length: 8
Require uppercase: ✅
Require lowercase: ✅
Require numbers: ✅
Require special characters: ❌（ユーザビリティ重視）
```

#### **Rate Limiting**
```
Password attempts: 5 attempts per hour
Email sending: 3 emails per hour
```

## 🔧 開発環境での簡易設定

**開発を早く進めたい場合の設定：**

### Authentication → Settings で以下を変更：

1. **Email confirmation**: ❌ **OFF**
2. **Email change confirmation**: ❌ **OFF**  
3. **Secure password change**: ❌ **OFF**

**⚠️ 本番環境では必ずONにしてください**

## 📧 SMTPサーバー設定（本番用）

本番環境では外部SMTPサーバーを設定：

1. **Authentication** → **Settings** → **SMTP Settings**
2. 推奨サービス：
   - **Resend** （簡単）
   - **SendGrid** （高機能）
   - **Amazon SES** （大規模）

## 🧪 テスト手順

### テスト用ユーザー作成

1. **Authentication** → **Users** → **Add user**
2. テストユーザー情報：
   ```
   Email: test-cfo@example.com
   Password: test123456
   Email confirmed: ✅ ON
   ```

3. もう1つのテストユーザー：
   ```
   Email: test-company@example.com  
   Password: test123456
   Email confirmed: ✅ ON
   ```

### 動作確認

アプリで以下をテスト：
1. ✅ ユーザー登録
2. ✅ ログイン
3. ✅ ログアウト
4. ✅ パスワードリセット（本番設定時）

## 🛡️ RLSポリシー確認

データベースのRLSポリシーが正しく設定されているか確認：

### SQL Editorで実行：
```sql
-- RLSポリシー一覧確認
SELECT schemaname, tablename, policyname, permissive, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 期待される結果：
- `cfo_profiles`: cfo_read, cfo_write, cfo_update
- `biz_profiles`: biz_read, biz_write, biz_update  
- `likes`: likes_all, likes_write, likes_del
- `reviews`: rev_read, rev_write
- `messages`: msg_read, msg_write
- `attachments`: att_read, att_write

## 🎯 推奨設定（開発→本番）

### 開発段階
```
Email confirmation: OFF
SMTP: Supabaseデフォルト
Rate limiting: 緩め
```

### 本番段階  
```
Email confirmation: ON
SMTP: 外部サービス（Resend等）
Rate limiting: 厳しめ
SSL: 必須
```

## 🚀 次のステップ

Auth設定完了後：
1. アプリケーションでログイン・登録フローをテスト
2. プロフィール作成機能の実装
3. RLSポリシーの動作確認

## 📞 トラブルシューティング

### よくある問題：
1. **メールが届かない** → SMTP設定 or スパムフォルダ確認
2. **Redirect URLエラー** → Site URL設定確認  
3. **RLS Policy エラー** → ポリシー設定確認

設定完了後、動作確認のためのテストスクリプトも用意可能です。