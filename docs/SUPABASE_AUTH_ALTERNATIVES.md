# 🔐 Supabase Auth 運用方針の選択肢

## 🤔 現在の状況と課題

### 問題
- 他のサービスでSupabase Authを使用している場合、無効化できない
- せっかくのSupabase Authの機能を活用したい
- メール認証などの標準機能を利用したい

## 🚀 推奨アプローチ：**ハイブリッド方式**

### オプション1：Supabase Auth + カスタムプロフィール（推奨）

```typescript
// 認証：Supabase Auth（標準）
// プロフィール：カスタムテーブル（rextrix_*）

// lib/auth-hybrid.ts
import { createClient } from '@supabase/supabase-js'

export const authFlow = {
  // 1. Supabase Authで認証
  signUp: async (email: string, password: string, userType: 'company' | 'cfo') => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: userType // メタデータとして保存
        }
      }
    })

    if (authError) return { error: authError }

    // 2. 認証成功後、カスタムプロフィールテーブルに保存
    const { error: profileError } = await supabase
      .from('rextrix_user_profiles')
      .insert({
        user_id: authData.user!.id, // Supabase Auth のuser.id
        user_type: userType,
        display_name: '',
        // ... その他のカスタムフィールド
      })

    return { data: authData, error: profileError }
  }
}
```

### オプション2：完全分離方式（現在の実装）

```typescript
// 認証：NextAuth.js + rextrix_users
// データ：Supabase（認証機能は無効化）

// 他のサービスに影響しない
// 完全な独立性
```

### オプション3：Supabase Auth完全移行

```typescript
// 全て Supabase Auth で統一
// rextrix_users テーブルを削除
// user.id を Supabase Auth の UUID で統一
```

## 📊 比較表

| 方式 | 認証システム | メール認証 | カスタムフィールド | 他サービス影響 | 開発工数 |
|------|------------|-----------|------------------|--------------|---------|
| **ハイブリッド** | Supabase Auth | ✅ 標準機能 | ✅ カスタムテーブル | ❌ なし | 🟡 中 |
| **完全分離** | NextAuth.js | ⚠️ 自作必要 | ✅ フル制御 | ❌ なし | 🔴 高 |
| **完全移行** | Supabase Auth | ✅ 標準機能 | ⚠️ 制限あり | ❌ なし | 🟢 低 |

## 🎯 推奨：ハイブリッド方式への移行

### メリット
- ✅ Supabase Authの標準機能（メール認証、パスワードリセット等）を活用
- ✅ カスタムフィールド（user_type、プロフィール等）も自由に管理
- ✅ 他のサービスに影響なし
- ✅ セキュリティが高い（Supabase専門家が設計）
- ✅ 将来の拡張性が高い

### 実装ステップ

#### 1. テーブル構造の調整

```sql
-- rextrix_users テーブルを簡略化
-- Supabase Authのuser.idと連携

ALTER TABLE rextrix_users 
ADD COLUMN supabase_user_id UUID REFERENCES auth.users(id);

-- または、新しい連携テーブルを作成
CREATE TABLE rextrix_user_auth_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_user_id UUID NOT NULL REFERENCES auth.users(id),
  rextrix_user_id UUID NOT NULL REFERENCES rextrix_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 2. 認証フローの修正

```typescript
// lib/auth-supabase.ts
export const supabaseAuthFlow = {
  signUp: async (userData: RegisterData) => {
    // 1. Supabase Authで認証
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: { user_type: userData.userType }
      }
    })

    if (authError) return { error: authError }

    // 2. カスタムプロフィール作成
    await createCustomProfile(authData.user!.id, userData)

    return { data: authData }
  }
}
```

#### 3. 段階的移行

```typescript
// 既存ユーザーの移行スクリプト
const migrateExistingUsers = async () => {
  const existingUsers = await supabase
    .from('rextrix_users')
    .select('*')
    .is('supabase_user_id', null)

  for (const user of existingUsers) {
    // Supabase Authにユーザー作成
    const { data: authUser } = await supabase.auth.admin.createUser({
      email: user.email,
      password: generateTempPassword(),
      email_confirm: true
    })

    // 連携情報を保存
    await supabase
      .from('rextrix_users')
      .update({ supabase_user_id: authUser.user.id })
      .eq('id', user.id)
  }
}
```

## 🔧 具体的な設定

### Supabase Dashboard設定

```
Authentication > Settings:
✅ Enable email confirmations: ON （メール認証を活用）
✅ Enable phone confirmations: OFF （不要）
✅ Enable manual linking: ON （管理者による手動確認）

Email Templates:
- Welcome email をカスタマイズ
- Password reset をカスタマイズ
```

### RLS Policy更新

```sql
-- Supabase Authのuser.idベースのポリシー
CREATE POLICY "Users can access own profile" ON rextrix_user_profiles
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own company data" ON rextrix_companies  
FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM rextrix_user_profiles 
    WHERE user_id = auth.uid() AND user_type = 'company'
  )
);
```

## 🚀 移行タイムライン

### Phase 1（1週間）
- [ ] Supabase Auth設定確認
- [ ] ハイブリッド認証システム実装
- [ ] 新規ユーザー向けフロー構築

### Phase 2（1週間） 
- [ ] 既存ユーザーの段階的移行
- [ ] テスト・検証
- [ ] RLSポリシー更新

### Phase 3（1週間）
- [ ] 旧システムの段階的廃止
- [ ] ドキュメント更新
- [ ] 本番デプロイ

## 💡 結論

**ハイブリッド方式を強く推奨**します。これにより：

- 他のサービスに影響を与えない
- Supabase Authの強力な機能を活用
- カスタム要件も満たせる
- 将来の拡張性が高い

すぐに移行作業を開始しますか？