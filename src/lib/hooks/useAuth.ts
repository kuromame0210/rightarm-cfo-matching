'use client'

// NextAuth.js統合認証フック - 統一認証システム
import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { translateError } from '@/lib/utils/errorMessages'

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
      console.log(`🔍 useAuth[${checkId}]: checkProfileSetup start`, {
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
            const errorData = await response.json()
            console.log(`⚠️ useAuth[${checkId}]: Error response:`, errorData)
            // より詳細なSupabaseエラー情報をログ出力
            if (errorData.debugInfo) {
              console.log(`🔍 useAuth[${checkId}]: Supabase debug info:`, errorData.debugInfo)
            }
          } catch (e) {
            console.log(`⚠️ useAuth[${checkId}]: Could not parse error response`)
          }
          // 500エラーの場合は再試行せずに一旦null（未確定）状態にする
          setProfileSetupRequired(null)
        }
      } catch (error) {
        console.error(`❌ useAuth[${checkId}]: Profile check network error:`, {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        })
        setProfileSetupRequired(null)
      }
    }

    checkProfileSetup()
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
          error: translateError(result.error) // 日本語化されたエラーメッセージを返す
        }
      }

      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: translateError(error) // catchブロックでも日本語化を適用
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