'use client'

import { useEffect } from 'react'
import { redirect } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import Loading from '@/components/Loading'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const { user, isAuthenticated } = useAuth()
  const userType = user?.userType || 'company'

  useEffect(() => {
    if (isAuthenticated) {
      // ユーザータイプに基づいてリダイレクト
      if (userType === 'cfo') {
        redirect('/discover/companies')
      } else {
        redirect('/discover/cfos')
      }
    } else {
      // 未ログインの場合はログインページへ
      redirect('/auth/login')
    }
  }, [isAuthenticated, userType])

  // リダイレクト処理中のローディング表示
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loading size="lg" text="リダイレクト中..." />
    </div>
  )
}