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

  // プロフィール作成状況をチェック（一度だけ実行）
  useEffect(() => {
    // 認証状態でない場合は早期リターン
    if (!session?.user || status !== 'authenticated') {
      setProfileSetupRequired(null)
      return
    }

    // すでにチェック済みなら実行しない
    if (profileSetupRequired !== null) {
      return
    }

    async function checkProfileSetup() {
      const checkId = Math.random().toString(36).substr(2, 9)
      console.log(`🔍 useAuth[${checkId}]: checkProfileSetup start (delayed 500ms)`, {
        hasSession: !!session?.user,
        status,
        userEmail: session?.user?.email,
        userType: session?.user?.userType,
        profileSetupRequired,
        timestamp: new Date().toISOString()
      })

      try {
        console.log(`📡 useAuth[${checkId}]: Calling /api/profile for profile setup check`)
        const response = await fetch('/api/profile')
        console.log(`📡 useAuth[${checkId}]: Profile check response:`, {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
          url: response.url
        })
        
        if (response.ok) {
          console.log(`✅ useAuth[${checkId}]: Profile exists, setup not required`)
          setProfileSetupRequired(false) // プロフィール存在
        } else if (response.status === 404) {
          console.log(`❌ useAuth[${checkId}]: Profile not found, setup required`)
          setProfileSetupRequired(true) // プロフィール未作成
        } else {
          console.log(`⚠️ useAuth[${checkId}]: Profile check error status:`, response.status)
          try {
            const errorData = await response.text()
            console.log(`⚠️ useAuth[${checkId}]: Error response body:`, errorData)
          } catch (e) {
            console.log(`⚠️ useAuth[${checkId}]: Could not read error response body`)
          }
          // 500エラーの場合は再試行せずに一旦null（未確定）状態にする
          setProfileSetupRequired(null)
        }
      } catch (error) {
        console.error(`❌ useAuth[${checkId}]: Profile check error:`, {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        })
        setProfileSetupRequired(null)
      }
    }

    // セッションが完全に確立されるまで少し待機（認証トークンの設定待ち）
    const timer = setTimeout(() => {
      checkProfileSetup()
    }, 500) // 500ms待機してからAPI呼び出し

    return () => clearTimeout(timer)
  }, [session?.user?.id, status]) // 依存関係を最小限に変更

  // 認証状態の変化をログ出力（デバッグ用）
  useEffect(() => {
    // 最初の初期化時とステータス変更時のみ
    if (prevStatusRef.current !== status) {
      prevStatusRef.current = status
    }
  }, [status])

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