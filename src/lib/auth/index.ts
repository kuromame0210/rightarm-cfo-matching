// 統合認証システム - NextAuth.js ベースの認証機能
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { supabaseAdmin, TABLES } from '@/lib/supabase'

// 🔍 NextAuth環境変数診断
console.log('🔍 NextAuth環境変数診断:')
console.log(`  NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ 設定済み (' + process.env.NEXTAUTH_SECRET.length + '文字)' : '❌ 未設定'}`)
console.log(`  NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || '❌ 未設定'}`)
console.log(`  NODE_ENV: ${process.env.NODE_ENV}`)
console.log(`  Cookie Secure設定: ${process.env.NODE_ENV === "production" ? 'true (本番)' : 'false (開発)'}`)

// ===== 型定義（削除：NextAuth.jsの型拡張を使用）=====

// ===== JWT関連（削除：NextAuth.jsが処理）=====

// ===== ユーティリティ関数（削除：unified-auth.tsに統合）=====


// ===== パスワード関連 =====
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12)
}

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}


// ===== NextAuth Configuration =====
export const authOptions: NextAuthOptions = {
  providers: [
    // メール・パスワード認証
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 NextAuth: 認証開始', {
          email: credentials?.email,
          hasPassword: !!credentials?.password
        })

        if (!credentials?.email || !credentials?.password) {
          console.log('🚨 NextAuth: 認証情報不足')
          return null
        }

        try {
          // ユーザー検索
          console.log('🔍 NextAuth: ユーザー検索開始', { email: credentials.email })
          const { data: user, error } = await supabaseAdmin
            .from(TABLES.USERS)
            .select(`
              id,
              email,
              password_hash,
              user_type,
              status,
              rextrix_user_profiles!inner (
                display_name,
                nickname
              )
            `)
            .eq('email', credentials.email)
            .single()

          if (error || !user) {
            console.log('🚨 NextAuth: ユーザー検索失敗', { 
              error: error?.message,
              hasUser: !!user,
              email: credentials.email
            })
            return null
          }

          console.log('✅ NextAuth: ユーザー検索成功', {
            userId: user.id,
            email: user.email,
            userType: user.user_type,
            status: user.status
          })

          // アカウント状態チェック
          if (user.status !== 'active') {
            console.log('🚨 NextAuth: アカウント無効', { status: user.status })
            throw new Error('アカウントが無効です')
          }

          // パスワード検証
          if (!user.password_hash) {
            console.log('🚨 NextAuth: パスワードハッシュなし')
            return null
          }

          console.log('🔐 NextAuth: パスワード検証開始')
          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password_hash
          )

          if (!isValidPassword) {
            console.log('🚨 NextAuth: パスワード検証失敗')
            return null
          }

          console.log('✅ NextAuth: パスワード検証成功')

          // 最終ログイン時刻更新
          await supabaseAdmin
            .from(TABLES.USERS)
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', user.id)

          const profile = Array.isArray(user.rextrix_user_profiles)
            ? user.rextrix_user_profiles[0]
            : user.rextrix_user_profiles

          const userResult = {
            id: user.id,
            email: user.email,
            name: profile?.display_name || profile?.nickname || user.email,
            userType: user.user_type, // ✅ snake_case から camelCase に変換
            status: user.status
          }

          console.log('✅ NextAuth: 認証成功 - ユーザー情報返却', userResult)
          return userResult
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    }),

    // Google OAuth（オプション）
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id        // ✅ 明示的にuserIdを設定
        token.userType = user.userType // ✅ 既に変換済み
        token.status = user.status
        console.log('🔑 JWT: セッション作成', {
          userId: token.userId,
          userType: token.userType,
          email: user.email
        })
      }
      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string      // ✅ userIdを使用
        session.user.userType = token.userType as 'company' | 'cfo'
        session.user.status = token.status as string
        console.log('🔑 Session: セッション取得', {
          userId: session.user.id,
          userType: session.user.userType,
          email: session.user.email
        })
      }
      
      return session
    },

    async signIn({ user, account, profile }) {
      // Google OAuth の場合の処理
      if (account?.provider === 'google' && profile?.email) {
        try {
          // 既存ユーザーをチェック
          const { data: existingUser } = await supabaseAdmin
            .from(TABLES.USERS)
            .select('id, status')
            .eq('email', profile.email)
            .single()

          if (existingUser) {
            // 既存ユーザーの場合はログイン許可
            return existingUser.status === 'active'
          } else {
            // 新規ユーザーの場合は自動登録（オプション）
            // 本番環境では false にして手動登録を必須にすることを推奨
            return false
          }
        } catch (error) {
          console.error('Google sign-in error:', error)
          return false
        }
      }

      return true
    }
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/error'
  },


  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30日
    updateAge: 24 * 60 * 60, // 24時間
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    // 🚨 重要：カスタムencode/decode実装を完全に削除
    // NextAuth.jsがデフォルトで適切に処理します
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
}

// ===== Route Protection Utils =====
export function isProtectedRoute(pathname: string): boolean {
  const protectedPaths = [
    '/home',
    '/discover',
    '/profile',
    '/contracts',
    '/billing',
    '/settings',
    '/meetings',
    '/messages',
    '/scout',
    '/activity',
    '/interested'
  ]
  
  return protectedPaths.some(path => pathname.startsWith(path))
}

export function getDefaultRedirect(userType: 'company' | 'cfo'): string {
  return '/home'
}

// NextAuth.js型拡張は src/types/next-auth.d.ts に移動済み