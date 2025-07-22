# Supabase メールテンプレート設定手順

## 1. 認証エラーメッセージの日本語化

✅ **完了済み**
- `src/lib/utils/errorMessages.ts` - エラーメッセージ変換関数
- `src/lib/hooks/useAuth.ts` - useAuthフックでの適用
- 主要な認証エラーを日本語化

### 対応済みエラータイプ
- NextAuth.js標準エラー (CredentialsSignin, EmailSignin等)
- Supabase Auth エラー (invalid_credentials, email_not_confirmed等)
- ネットワークエラー、バリデーションエラー
- rate limitエラー

---

## 2. Supabase メールテンプレート設定

### Step 1: Supabase管理画面にアクセス
1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. プロジェクト選択
3. 左メニューから「Authentication」→「Email Templates」を選択

### Step 2: 確認メールテンプレートの設定
1. 「Confirm your signup」テンプレートを選択
2. 「Subject」を以下に変更：
   ```
   【Rextrix】メールアドレスの確認をお願いします
   ```

3. 「Body (HTML)」を以下の内容に置き換え：
   
**完全なHTMLテンプレート** (`email-templates/confirmation-template.html`を参照)

### Step 3: その他のメールテンプレート設定（オプション）

#### パスワードリセット (「Reset your password」)
**Subject:**
```
【Rextrix】パスワードリセットのご案内
```

**Body (簡易版):**
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>パスワードリセット - Rextrix</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; background-color: #f8fafc; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px;">
        <h1 style="color: #667eea; text-align: center;">Rextrix</h1>
        <h2>パスワードリセット</h2>
        <p>パスワードリセットのリクエストを受け付けました。以下のリンクをクリックして新しいパスワードを設定してください。</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ .ConfirmationURL }}" style="background: #667eea; color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; display: inline-block;">
                パスワードを変更する
            </a>
        </div>
        <p style="color: #718096; font-size: 14px;">このリンクの有効期限は24時間です。</p>
    </div>
</body>
</html>
```

#### Magic Link (「Magic Link」)
**Subject:**
```
【Rextrix】ログインリンクをお送りします
```

### Step 4: 設定確認
1. 「Save」ボタンをクリックして保存
2. テストユーザー登録で確認

---

## 3. 設定のポイント

### ✅ Do（推奨）
- **日本語の件名**: ユーザーがメールを認識しやすい
- **ブランドカラー**: `#667eea`（メインカラー）を使用
- **レスポンシブデザイン**: モバイルでも見やすい
- **セキュリティ情報**: 有効期限や注意事項を明記
- **代替手段**: ボタンが効かない場合のToken表示

### ❌ Don't（避ける）
- ~~英語の件名やメッセージ~~
- ~~デザインなしのプレーンテキスト~~
- ~~長すぎるメール内容~~
- ~~セキュリティ情報の不備~~

---

## 4. テスト方法

1. **新規ユーザー登録**でメール受信を確認
2. **メールデザイン**のレスポンシブ対応確認
3. **確認ボタン**と**Tokenコード**両方の動作確認
4. **日本語表示**が正しく表示されるか確認

---

## 5. トラブルシューティング

### メールが届かない場合
1. Spam/迷惑メールフォルダを確認
2. Resendダッシュボードで送信ログを確認
3. DNS設定（SPF/DKIM）を確認

### デザインが崩れる場合  
1. HTMLの構文エラーを確認
2. CSSインライン化を検討
3. 主要メールクライアントでの表示テスト

### 日本語が文字化けする場合
1. `<meta charset="UTF-8">` が設定されているか確認
2. Supabase側の文字エンコーディング設定を確認

---

## 6. 追加カスタマイズ案

### 高度なブランディング
- 会社ロゴの追加
- フッターリンクの充実
- ソーシャルメディアリンク

### パーソナライゼーション
- ユーザー名の表示（`{{ .Email }}`等の変数活用）
- ユーザータイプ別のメッセージ
- 地域別の情報

---

## 設定完了後の確認事項

- [x] 日本語エラーメッセージの動作確認
- [ ] メールテンプレートの設定
- [ ] テストメール送信・受信確認
- [ ] モバイル・PCでのデザイン確認
- [ ] 各種メールクライアントでの表示確認