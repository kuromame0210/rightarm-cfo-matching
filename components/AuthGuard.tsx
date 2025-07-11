'use client'

// RightArm v3 認証ガード
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

interface AuthGuardProps {
  children: ReactNode
  requireAuth?: boolean
  allowedUserTypes?: ('company' | 'cfo')[]
  fallback?: ReactNode
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  allowedUserTypes,
  fallback = <div>ローディング中...</div>
}: AuthGuardProps) {
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'
  const isAuthenticated = !!session
  const userType = session?.user?.userType
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isLoading, isAuthenticated, requireAuth, router])

  if (isLoading) {
    return <>{fallback}</>
  }

  if (requireAuth && !isAuthenticated) {
    return <>{fallback}</>
  }

  if (allowedUserTypes && userType && !allowedUserTypes.includes(userType)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            アクセス権限がありません
          </h1>
          <p className="text-gray-600">
            このページにアクセスする権限がありません。
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}