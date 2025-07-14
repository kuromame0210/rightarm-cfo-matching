// 統一認証システム - NextAuth.js中心アーキテクチャ
// すべての認証チェックをNextAuth.jsに統一

import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { cookies } from 'next/headers'
import { authOptions } from './index'

export interface AuthenticatedUser {
  id: string
  email: string
  userType: 'company' | 'cfo'
  status: string
  name: string
}

/**
 * 統一認証チェック（API Routes用）
 * NextAuth.jsセッションを使用した認証状態の確認
 */
export async function getAuthenticatedUser(req?: any, res?: any): Promise<AuthenticatedUser | null> {
  try {
    console.log('🔍 統一認証: セッション取得開始')
    // Next.js 13+ App Router では req/res は不要ですが、念のため対応
    const session = await getServerSession(req && res ? { req, res, ...authOptions } : authOptions)
    console.log('🔍 統一認証: セッション結果:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
      userId: session?.user?.id
    })
    
    if (!session?.user) {
      console.log('🔐 統一認証: セッションが見つかりません')
      return null
    }

    console.log('🔐 統一認証: セッション取得成功', {
      userId: session.user.id,
      email: session.user.email,
      userType: session.user.userType
    })

    return {
      id: session.user.id,
      email: session.user.email,
      userType: session.user.userType,
      status: session.user.status,
      name: session.user.name
    }
  } catch (error) {
    console.error('🚨 統一認証チェックエラー:', error)
    return null
  }
}

/**
 * 認証必須API用ヘルパー
 * 認証が必要なAPIルートで使用
 */
export async function requireAuth(): Promise<{
  user: AuthenticatedUser | null
  error: Response | null
}> {
  const user = await getAuthenticatedUser()
  
  if (!user) {
    return {
      user: null,
      error: new Response(
        JSON.stringify({ 
          success: false, 
          error: { 
            code: 'UNAUTHORIZED', 
            message: '認証が必要です' 
          } 
        }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        }
      )
    }
  }

  // アカウント状態チェック
  if (user.status !== 'active') {
    return {
      user: null,
      error: new Response(
        JSON.stringify({ 
          success: false, 
          error: { 
            code: 'ACCOUNT_INACTIVE', 
            message: 'アカウントが無効です' 
          } 
        }),
        { 
          status: 403, 
          headers: { 'Content-Type': 'application/json' } 
        }
      )
    }
  }

  return { user, error: null }
}

/**
 * ユーザータイプ別認証チェック
 * 特定のユーザータイプのみアクセス可能なAPIで使用
 */
export async function requireUserType(allowedTypes: ('company' | 'cfo')[]): Promise<{
  user: AuthenticatedUser | null
  error: Response | null
}> {
  const { user, error } = await requireAuth()
  
  if (error) {
    return { user: null, error }
  }

  if (!allowedTypes.includes(user!.userType)) {
    return {
      user: null,
      error: new Response(
        JSON.stringify({ 
          success: false, 
          error: { 
            code: 'INSUFFICIENT_PERMISSIONS', 
            message: 'このリソースにアクセスする権限がありません' 
          } 
        }),
        { 
          status: 403, 
          headers: { 'Content-Type': 'application/json' } 
        }
      )
    }
  }

  return { user, error: null }
}

/**
 * 自分のリソースへのアクセス制限
 * ユーザーが自分のデータのみアクセス可能にする
 */
export async function requireOwnership(resourceUserId: string): Promise<{
  user: AuthenticatedUser | null
  error: Response | null
}> {
  const { user, error } = await requireAuth()
  
  if (error) {
    return { user: null, error }
  }

  if (user!.id !== resourceUserId) {
    return {
      user: null,
      error: new Response(
        JSON.stringify({ 
          success: false, 
          error: { 
            code: 'ACCESS_DENIED', 
            message: '他のユーザーのデータにはアクセスできません' 
          } 
        }),
        { 
          status: 403, 
          headers: { 'Content-Type': 'application/json' } 
        }
      )
    }
  }

  return { user, error: null }
}

/**
 * 認証状態のログ出力（開発環境のみ）
 */
export function logAuthStatus(user: AuthenticatedUser | null, context: string = '') {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔐 統一認証[${context}]:`, {
      authenticated: !!user,
      userId: user?.id || 'none',
      userType: user?.userType || 'none',
      status: user?.status || 'none',
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * 統一認証システム設定
 */
export const AUTH_CONFIG = {
  // 保護されたルートパターン
  PROTECTED_PATHS: [
    '/home',
    '/discover',
    '/profile',
    '/contracts',
    '/billing',
    '/settings',
    '/meetings',
    '/messages',
    '/api/users',
    '/api/companies',
    '/api/cfos',
    '/api/scouts',
    '/api/interests',
    '/api/meetings',
    '/api/messages',
    '/api/contracts',
    '/api/profile'
  ],
  
  // 認証済みユーザーのみアクセス不可（ログイン・登録ページ）
  PUBLIC_ONLY_PATHS: [
    '/auth/login',
    '/auth/register'
  ],
  
  // 常に公開（認証不要）
  PUBLIC_PATHS: [
    '/',
    '/api/auth',
    '/api/health'
  ]
}