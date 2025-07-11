'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

let navigationStartTime: number | null = null

export default function NavigationPerformanceLogger() {
  const pathname = usePathname()

  useEffect(() => {
    // ページ遷移完了時の処理
    if (navigationStartTime) {
      const navigationEndTime = performance.now()
      const navigationDuration = navigationEndTime - navigationStartTime
      
      console.log(`🚀 ページ遷移完了: ${pathname}`)
      console.log(`⏱️ 遷移時間: ${navigationDuration.toFixed(2)}ms`)
      
      // 500ms以上の場合は警告
      if (navigationDuration > 500) {
        console.warn(`⚠️ 遷移時間が長いです: ${navigationDuration.toFixed(2)}ms`)
      }
      
      navigationStartTime = null
    }
  }, [pathname])

  useEffect(() => {
    // リンククリック時の処理
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const link = target.closest('a')
      
      if (link && link.href && !link.href.startsWith('mailto:') && !link.href.startsWith('tel:')) {
        navigationStartTime = performance.now()
        console.log(`🔗 ページ遷移開始: ${link.href}`)
      }
    }

    // Next.js Linkコンポーネントのクリックをキャッチ
    const handleRouteChangeStart = () => {
      if (!navigationStartTime) {
        navigationStartTime = performance.now()
        console.log('🔗 ページ遷移開始')
      }
    }

    // popstate（ブラウザの戻る/進む）の処理
    const handlePopState = () => {
      navigationStartTime = performance.now()
      console.log('🔙 ブラウザナビゲーション開始')
    }

    document.addEventListener('click', handleLinkClick)
    window.addEventListener('popstate', handlePopState)

    // Next.js Router eventsの代替として、navigation APIを使用
    if (typeof window !== 'undefined' && 'navigation' in window) {
      const navigation = (window as any).navigation
      navigation.addEventListener('navigate', handleRouteChangeStart)
      
      return () => {
        document.removeEventListener('click', handleLinkClick)
        window.removeEventListener('popstate', handlePopState)
        navigation.removeEventListener('navigate', handleRouteChangeStart)
      }
    }

    return () => {
      document.removeEventListener('click', handleLinkClick)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  return null
}