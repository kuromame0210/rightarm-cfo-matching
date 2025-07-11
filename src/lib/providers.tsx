'use client'

// NextAuth.js統合プロバイダーシステム
// authrefactrecipe.md Phase 1: NextAuth.js基盤構築
import { ReactNode, useEffect, useState } from 'react'
import { SessionProvider } from 'next-auth/react'

import { InterestsProvider } from './interests-context'
import { ToastProvider } from '@/components/ui/Toast'
import { ApiSessionProvider } from './providers/ApiSessionProvider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // NextAuth.js統合プロバイダー構造
  // SessionProvider -> ApiSessionProvider -> InterestsProvider -> ToastProvider -> children
  return (
    <SessionProvider
      refetchInterval={0} // 自動更新を無効化（安定性向上）
      refetchOnWindowFocus={false} // ウィンドウフォーカス時の更新を無効化
      refetchWhenOffline={false} // オフライン時は更新しない
    >
      <ApiSessionProvider>
        <InterestsProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </InterestsProvider>
      </ApiSessionProvider>
    </SessionProvider>
  )
}