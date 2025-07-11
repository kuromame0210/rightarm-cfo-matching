# 🔐 Supabase Authentication 設定ガイド

## 🚨 重要：設定が必要です！

現在のRextrix v3では**カスタム認証**（NextAuth.js + 独自のrextrix_usersテーブル）を使用しているため、**Supabase Authの設定を無効化**する必要があります。

## 🔧 Supabaseダッシュボードでの設定

### 1. Authentication設定画面にアクセス
```
Supabaseダッシュボード > Authentication > Settings
```

### 2. 重要な設定変更

#### 🔴 **必須設定**

1. **Enable email confirmations**: `OFF`
   - 理由: 独自の認証システムを使用するため

2. **Enable phone confirmations**: `OFF`
   - 理由: 電話認証は使用しない

3. **Enable manual linking**: `OFF`
   - 理由: 独自のユーザー管理を行うため

#### ⚠️ **RLS (Row Level Security) 設定**

すでに設定済みですが、確認してください：

```sql
-- 現在のRLSポリシー（開発用）
-- 本番環境では適切なポリシーに変更必要

-- 例：rextrix_users テーブル
CREATE POLICY "Enable read access for all users" ON rextrix_users FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON rextrix_users FOR INSERT WITH CHECK (true);
-- ... 他のテーブルも同様
```

### 3. URL設定（本番時に必要）

#### **Site URL** 
```
開発: http://localhost:3000
本番: https://your-domain.com
```

#### **Redirect URLs**
```
開発: http://localhost:3000/auth/callback
本番: https://your-domain.com/auth/callback
```

## 🔄 認証フローの仕組み

### Rextrix v3の認証アーキテクチャ

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   フロントエンド   │────│   NextAuth.js    │────│   Supabase DB   │
│   (Next.js)     │    │  (認証ロジック)    │    │ (rextrix_users) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

1. **ユーザー登録**: 独自フォーム → `rextrix_users`テーブル
2. **ログイン**: NextAuth.js → パスワード検証 → JWTセッション
3. **認証状態**: NextAuth.jsセッション管理
4. **データアクセス**: Supabase RLS + カスタムポリシー

### ✅ **利点**
- 完全なユーザーデータ制御
- カスタムフィールド（user_type: company/cfo）
- 柔軟な認証フロー
- 他サービスとの統合容易

### ❌ **Supabase Authを使わない理由**
- ユーザータイプ（企業/CFO）の区別が必要
- カスタムプロフィールフィールドが多数
- 独自の登録フローが必要
- 決済システムとの連携

## 🛡️ セキュリティ設定

### 1. JWT Secret設定（重要）

`.env.local`で必須：
```bash
# 強力なランダム文字列を生成
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

### 2. Supabase Service Role Key

**⚠️ 絶対に外部に漏らさないでください**
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. 本番環境でのRLSポリシー強化

開発完了後、以下のような厳格なポリシーに変更：

```sql
-- 本番用ポリシー例
CREATE POLICY "Users can only view own data" ON rextrix_users 
FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can only update own data" ON rextrix_users 
FOR UPDATE USING (auth.uid()::text = id);
```

## 🧪 テスト方法

### 1. 認証テスト

```typescript
// テスト用ユーザー作成
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  user_type: 'company'
}

// 登録 → ログイン → セッション確認
```

### 2. データアクセステスト

```typescript
// 認証後のデータアクセス
const profile = await getUserProfile(session.user.id)
```

## 🚀 本番デプロイ前チェック

- [ ] RLSポリシーの本番用への変更
- [ ] Site URL / Redirect URLsの設定
- [ ] 環境変数の本番設定（Vercel等）
- [ ] NEXTAUTH_SECRET の強力な値設定
- [ ] Google OAuth設定（使用する場合）

## 📞 トラブルシューティング

### よくある問題

1. **"User not found" エラー**
   → `rextrix_users`テーブルにデータがあるか確認

2. **"Unauthorized" エラー** 
   → RLSポリシーが正しく設定されているか確認

3. **セッションが保持されない**
   → `NEXTAUTH_SECRET`が設定されているか確認

4. **データベース接続エラー**
   → `.env.local`のSupabase設定を確認

これで安全で柔軟な認証システムが構築できます！