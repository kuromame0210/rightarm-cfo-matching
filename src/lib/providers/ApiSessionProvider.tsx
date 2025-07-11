'use client'

// APIセッションプロバイダー
// NextAuth.jsセッションをAPIクライアントに自動同期

import { ReactNode, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { apiClient } from '../api-client'

interface ApiSessionProviderProps {
  children: ReactNode
}

export function ApiSessionProvider({ children }: ApiSessionProviderProps) {
  const { data: session, status } = useSession()
  const prevSessionRef = useRef<any>(null)

  // セッション変更時にAPIクライアントを更新
  useEffect(() => {
    if (status !== 'loading') {
      const currentSessionId = session?.user?.id || null
      const prevSessionId = prevSessionRef.current?.user?.id || null
      
      apiClient.updateSession(session)
      
      // セッション状態が実際に変化した場合のみログ出力（開発環境のみ）
      if (prevSessionId !== currentSessionId && process.env.NODE_ENV === 'development') {
        console.log('🔄 API: セッション同期', {
          hasSession: !!session,
          userEmail: session?.user?.email || 'none',
          userId: session?.user?.id || 'none'
        })
        prevSessionRef.current = session
      }
    }
  }, [session, status])

  return <>{children}</>
}