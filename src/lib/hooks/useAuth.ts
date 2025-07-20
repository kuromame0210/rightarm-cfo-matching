'use client'

// NextAuth.js統合認証フック - 統一認証システム
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const prevStatusRef = useRef<string | null>(null)
  const [profileSetupRequired, setProfileSetupRequired] = useState<boolean | null>(null)

  // プロフィール作成状況をチェック
  useEffect(() => {
    async function checkProfileSetup() {
      if (!session?.user || status !== 'authenticated') {
        setProfileSetupRequired(null)
        return
      }

      try {
        const response = await fetch('/api/profile')
        if (response.ok) {
          const data = await response.json()
          setProfileSetupRequired(false) // プロフィール存在
        } else if (response.status === 404) {
          setProfileSetupRequired(true) // プロフィール未作成
        } else {
          setProfileSetupRequired(null) // エラー状態
        }
      } catch (error) {
        console.error('Profile check error:', error)
        setProfileSetupRequired(null)
      }
    }

    checkProfileSetup()
  }, [session, status])

  // 認証状態の変化をログ出力（開発環境のみ）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // 最初の初期化時とステータス変更時のみ
      if (prevStatusRef.current !== status) {
        // console.log(`🔐 Auth: ${status}`, {
        //   hasSession: !!session,
        //   userEmail: session?.user?.email || 'none',
        //   userType: session?.user?.userType || 'none',
        //   profileSetupRequired: profileSetupRequired
        // })
        prevStatusRef.current = status
      }
    }
  }, [status, profileSetupRequired]) // statusとprofileSetupRequiredの変化を追跡

  const login = useCallback(async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      if (result?.error) {
        return {
          success: false,
          error: result.error // より具体的なエラーメッセージを返す
        }
      }

      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: 'ネットワークエラーまたは予期せぬ問題が発生しました'
      }
    }
  }, [])

  const logout = useCallback(async () => {
    await signOut({ redirect: false })
    router.push('/auth/login')
  }, [router])

  return {
    // 統一認証システムのシンプルなインターフェース
    user: session?.user || null,
    isLoading: status === 'loading',
    isAuthenticated: !!session?.user,
    userType: session?.user?.userType || null,
    status: session?.user?.status || null,
    profileSetupRequired: profileSetupRequired,
    login,
    logout
  }
}

export function useRequireAuth() {
  const auth = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.push('/auth/login')
    }
  }, [auth.isLoading, auth.isAuthenticated, router])
  
  return auth
}

// 統一認証システムのエイリアス
export function useAuthContext() {
  return useAuth()
}