'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { isProtectedRoute, getDefaultRedirect } from '@/lib/auth/index'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading, profileSetupRequired } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // ローディング中は何もしない（重要：初期化完了まで待つ）
    if (isLoading) {
      return
    }

    const isProtected = isProtectedRoute(pathname)
    
    // 認証が必要なページで未認証の場合
    if (isProtected && !isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }
    
    // 認証済みユーザーがログイン/登録ページにアクセスした場合
    if (isAuthenticated && user && (pathname === '/auth/login' || pathname === '/auth/register')) {
      // URLパラメータからリダイレクト先を取得
      const urlParams = new URLSearchParams(window.location.search)
      const redirectParam = urlParams.get('redirect')
      const redirectTo = redirectParam || getDefaultRedirect(user.userType)
      
      router.push(redirectTo)
      return
    }

    // プロフィール作成が必要な場合のリダイレクト
    if (isAuthenticated && user && profileSetupRequired === true) {
      // プロフィール作成ページ自体は除外
      if (pathname === '/profile' || pathname === '/auth/register') {
        return
      }

      const userType = user.userType
      if (!userType || userType === null) {
        // ユーザータイプが未設定の場合は登録画面に誘導
        router.push('/auth/register')
        return
      }

      // ユーザータイプに応じたプロフィール作成画面に誘導
      router.push('/profile')
      return
    }
  }, [isAuthenticated, isLoading, pathname, router, user, profileSetupRequired])

  // ローディング中
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">認証状態を確認中...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}