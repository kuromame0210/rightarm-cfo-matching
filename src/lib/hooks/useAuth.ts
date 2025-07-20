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
      console.log('🔍 useAuth: checkProfileSetup start', {
        hasSession: !!session?.user,
        status,
        userEmail: session?.user?.email,
        userType: session?.user?.userType
      })

      if (!session?.user || status !== 'authenticated') {
        console.log('⏭️ useAuth: Skipping profile check - not authenticated')
        setProfileSetupRequired(null)
        return
      }

      try {
        console.log('📡 useAuth: Calling /api/profile for profile setup check')
        const response = await fetch('/api/profile')
        console.log('📡 useAuth: Profile check response:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('✅ useAuth: Profile exists, setup not required')
          setProfileSetupRequired(false) // プロフィール存在
        } else if (response.status === 404) {
          console.log('❌ useAuth: Profile not found, setup required')
          setProfileSetupRequired(true) // プロフィール未作成
        } else {
          console.log('⚠️ useAuth: Profile check error status:', response.status)
          setProfileSetupRequired(null) // エラー状態
        }
      } catch (error) {
        console.error('❌ useAuth: Profile check error:', error)
        setProfileSetupRequired(null)
      }
    }

    checkProfileSetup()
  }, [session, status])

  // 認証状態の変化をログ出力（デバッグ用）
  useEffect(() => {
    // 最初の初期化時とステータス変更時のみ
    if (prevStatusRef.current !== status) {
      console.log(`🔐 useAuth: Status changed to ${status}`, {
        hasSession: !!session,
        userEmail: session?.user?.email || 'none',
        userType: session?.user?.userType || 'none',
        profileSetupRequired: profileSetupRequired,
        timestamp: new Date().toISOString()
      })
      prevStatusRef.current = status
    }
  }, [status, profileSetupRequired, session]) // statusとprofileSetupRequiredの変化を追跡

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