'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import UserDropdown from './UserDropdown'

// ナビゲーションホバー時のプリロード
const prefetchPage = (href: string) => {
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.href = href
  document.head.appendChild(link)
}

interface AppHeaderProps {
  userName?: string
  userAvatar?: string
  isLoggedIn?: boolean
}

export default function AppHeader({ userName = '山田さん', userAvatar = '👤', isLoggedIn = true }: AppHeaderProps) {
  const pathname = usePathname()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // 通知クリック処理
  const handleNotificationClick = useCallback(() => {
    setShowNotifications(prev => !prev)
    setShowUserMenu(false) // ユーザーメニューを閉じる
  }, [])

  // ユーザーメニュークリック処理
  const handleUserMenuClick = useCallback(() => {
    setShowUserMenu(prev => !prev)
    setShowNotifications(false) // 通知を閉じる
  }, [])

  // 現在のページかチェック
  const isCurrentPage = useCallback((path: string) => {
    return pathname === path
  }, [pathname])

  // ナビゲーション項目の設定
  const navigationItems = [
    { path: '/home', label: 'ホーム', icon: '🏠' },
    { path: '/scout', label: 'スカウト', icon: '🎯' },
    { path: '/messages', label: 'メッセージ', icon: '💬' },
    { path: '/meetings', label: '面談予定', icon: '📅' }
  ]

  // デモページかどうかをチェック
  const isDemoPage = pathname?.startsWith('/demo')

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16">
          {/* ロゴ */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/home" 
              className="text-lg md:text-xl font-bold text-gray-900 tracking-wide hover:text-gray-700 transition-colors"
            >
              RIGHTARM
            </Link>
            {isDemoPage && (
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                🎬 DEMO
              </div>
            )}
          </div>
          
          {/* PC用ナビゲーション */}
          {isLoggedIn && !isDemoPage && (
            <nav className="hidden md:flex space-x-6 lg:space-x-8 h-full">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onMouseEnter={() => prefetchPage(item.path)}
                  className={`text-sm flex items-center transition-colors ${
                    isCurrentPage(item.path)
                      ? 'text-gray-900 font-medium border-b-2 border-gray-900'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
          
          {/* デモページ用ナビゲーション */}
          {isDemoPage && (
            <nav className="hidden md:flex space-x-4 h-full">
              <Link
                href="/demo/overview"
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  pathname === '/demo/overview'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                }`}
              >
                📊 概要
              </Link>
              <Link
                href="/demo/flows"
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  pathname === '/demo/flows'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                🔄 フロー
              </Link>
              <Link
                href="/debug/components"
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  pathname === '/debug/components'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                }`}
              >
                🧩 UI
              </Link>
            </nav>
          )}

          
          {/* 右側アイコン */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* 通知ボタン - ログイン時のみ表示 */}
            {isLoggedIn && (
              <div className="relative">
                <button 
                  onClick={handleNotificationClick}
                  className="p-2 text-gray-700 hover:text-gray-900 transition-colors relative"
                  aria-label="通知"
                >
                  <span className="text-lg">🔔</span>
                  {/* 未読通知があるかデモ用のバッジ */}
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                </button>
              
              {/* 通知ドロップダウン */}
              {showNotifications && (
                <div className="fixed md:absolute left-2 right-2 md:right-0 md:left-auto top-16 md:top-auto md:mt-2 bottom-20 md:bottom-auto w-auto md:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999] flex flex-col">
                  <div className="p-3 md:p-4 border-b border-gray-200">
                    <h3 className="font-medium text-gray-900 text-sm md:text-base">通知</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto min-h-0">
                    <button className="w-full p-3 md:p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors text-left min-h-[60px] flex flex-col justify-center">
                      <p className="text-sm text-gray-900">新しいスカウトが届きました</p>
                      <p className="text-xs text-gray-500 mt-1">2時間前</p>
                    </button>
                    <button className="w-full p-3 md:p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors text-left min-h-[60px] flex flex-col justify-center">
                      <p className="text-sm text-gray-900">面談スケジュールが更新されました</p>
                      <p className="text-xs text-gray-500 mt-1">5時間前</p>
                    </button>
                    <button className="w-full p-3 md:p-4 hover:bg-gray-50 cursor-pointer transition-colors text-left min-h-[60px] flex flex-col justify-center">
                      <p className="text-sm text-gray-900">新しいメッセージが届きました</p>
                      <p className="text-xs text-gray-500 mt-1">1日前</p>
                    </button>
                  </div>
                  <div className="p-3 border-t border-gray-200 flex-shrink-0">
                    <button className="w-full min-h-[44px] text-center text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors">
                      すべての通知を見る
                    </button>
                  </div>
                </div>
              )}
              </div>
            )}
            
            {/* ユーザードロップダウン - ログイン時のみ表示 */}
            {isLoggedIn && (
              <UserDropdown 
                userName={userName} 
                userAvatar={userAvatar} 
                showUserMenu={showUserMenu}
                onToggleUserMenu={handleUserMenuClick}
                onCloseUserMenu={() => setShowUserMenu(false)}
              />
            )}

            {/* ログアウト時のボタン */}
            {!isLoggedIn && (
              <div className="flex items-center space-x-2">
                <Link 
                  href="/auth/login" 
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 text-sm transition-colors"
                >
                  ログイン
                </Link>
                <Link 
                  href="/auth/register" 
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
                >
                  会員登録
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* モバイル用ボトムナビゲーション */}
      {isLoggedIn && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe shadow-lg">
          <div className="grid grid-cols-4 h-16">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors p-2 ${
                  isCurrentPage(item.path)
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
                {isCurrentPage(item.path) && (
                  <div className="w-4 h-0.5 bg-gray-900 rounded-full absolute bottom-1"></div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 通知オーバーレイ（モバイル用） */}
      {isLoggedIn && showNotifications && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
          onClick={() => setShowNotifications(false)}
        />
      )}

    </header>
  )
}