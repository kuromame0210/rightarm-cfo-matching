'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { isProtectedRoute, getDefaultRedirect } from '@/lib/auth/index'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // AuthGuardの状態をログ出力
  useEffect(() => {
    console.log(`🛡️ AuthGuard State:`, {
      pathname,
      isAuthenticated,
      isLoading,
      hasUser: !!user,
      userType: user?.userType || 'none'
    })
  }, [pathname, isAuthenticated, isLoading, user])

  useEffect(() => {
    console.log(`🔍 AuthGuard Effect - Loading: ${isLoading}, Auth: ${isAuthenticated}, Path: ${pathname}`)
    
    // ローディング中は何もしない（重要：初期化完了まで待つ）
    if (isLoading) {
      console.log('⏳ AuthGuard: Still loading, waiting...')
      return
    }

    const isProtected = isProtectedRoute(pathname)
    console.log(`🔒 Route protection check - Path: ${pathname}, Protected: ${isProtected}`)
    
    // 認証が必要なページで未認証の場合
    if (isProtected && !isAuthenticated) {
      console.log('🚨 REDIRECT TO LOGIN - Protected route access denied', {
        pathname,
        isProtected,
        isAuthenticated,
        redirectUrl: `/auth/login?redirect=${encodeURIComponent(pathname)}`
      })
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }
    
    // 認証済みユーザーがログイン/登録ページにアクセスした場合
    if (isAuthenticated && user && (pathname === '/auth/login' || pathname === '/auth/register')) {
      const redirectTo = getDefaultRedirect(user.userType)
      console.log('🔄 Redirecting authenticated user to default page', {
        from: pathname,
        to: redirectTo,
        userType: user.userType
      })
      router.push(redirectTo)
      return
    }

    console.log('✅ AuthGuard: No action needed, allowing access')
  }, [isAuthenticated, isLoading, pathname, router, user])

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