'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import UserDropdown from './UserDropdown'
import { ResponsiveLoginStatus } from './LoginStatus'
import { useAuth } from '@/lib/hooks/useAuth'

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

export default function AppHeader({ userName, userAvatar = '👤' }: AppHeaderProps) {
  const { user, isAuthenticated, logout, isLoading } = useAuth()
  
  // NextAuth.jsから認証状態を取得
  const actualIsLoggedIn = isAuthenticated
  const actualUserName = userName || user?.name || 'ユーザー'
  const isAuthLoading = isLoading
  
  // ユーザータイプは認証コンテキストから取得
  const userType = user?.userType || 'company' // デフォルトは company
  const pathname = usePathname()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showHelpMenu, setShowHelpMenu] = useState(false)
  const helpMenuRef = useRef<HTMLDivElement>(null)

  // 通知クリック処理
  const handleNotificationClick = useCallback(() => {
    setShowNotifications(prev => !prev)
    setShowUserMenu(false) // ユーザーメニューを閉じる
  }, [])

  // ユーザーメニュークリック処理
  const handleUserMenuClick = useCallback(() => {
    setShowUserMenu(prev => !prev)
    setShowNotifications(false) // 通知を閉じる
    setShowHelpMenu(false) // ヘルプメニューを閉じる
  }, [])

  // ヘルプメニュークリック処理
  const handleHelpMenuClick = useCallback(() => {
    setShowHelpMenu(prev => !prev)
    setShowNotifications(false) // 通知を閉じる
    setShowUserMenu(false) // ユーザーメニューを閉じる
  }, [])

  // 外部クリックでヘルプメニューを閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (helpMenuRef.current && !helpMenuRef.current.contains(event.target as Node)) {
        setShowHelpMenu(false)
      }
    }

    if (showHelpMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showHelpMenu])

  // 現在のページかチェック
  const isCurrentPage = useCallback((path: string) => {
    // ホームボタンの場合は、/discover/companies または /discover/cfos にいる時もアクティブにする
    if (path === (userType === 'cfo' ? '/discover/companies' : '/discover/cfos')) {
      return pathname === '/discover/companies' || pathname === '/discover/cfos'
    }
    return pathname === path
  }, [pathname, userType])

  // ナビゲーション項目の設定
  const navigationItems = [
    { 
      path: userType === 'cfo' ? '/discover/companies' : '/discover/cfos', 
      label: 'ホーム', 
      icon: '🏠' 
    },
    { path: '/scout', label: 'スカウト', icon: '🎯' },
    { path: '/messages', label: 'メッセージ', icon: '💬' },
    { path: '/meetings', label: '面談予定', icon: '📅' },
    { path: '/interested', label: '気になる', icon: '❤️' }
  ]

  // デモページかどうかをチェック
  const isDemoPage = pathname?.startsWith('/demo')

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-[1000]">
      {/* 上段: ロゴ＋企業・CFO一覧ボタン */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 md:h-14">
            {/* ロゴ */}
            <div className="flex items-center space-x-4">
              <Link 
                href={userType === 'cfo' ? '/discover/companies' : '/discover/cfos'} 
                className="text-lg md:text-xl font-bold text-gray-900 tracking-wide hover:text-gray-700 transition-colors"
              >
                REXTRIX
              </Link>
              {isDemoPage && (
                <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  🎬 DEMO
                </div>
              )}
            </div>

            {/* 企業・CFO一覧ボタン + デバッグ情報 */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* 企業一覧ボタン - CFOユーザーのみ有効 */}
              {userType === 'company' ? (
                <div className="px-2 sm:px-3 py-2 bg-gray-300 text-gray-500 text-xs sm:text-sm rounded-lg font-medium text-center cursor-not-allowed">
                  <span className="hidden sm:inline">募集している</span>企業一覧
                </div>
              ) : (
                <Link 
                  href="/discover/companies" 
                  className="px-2 sm:px-3 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
                >
                  <span className="hidden sm:inline">募集している</span>企業一覧
                </Link>
              )}
              
              {/* CFO一覧ボタン - 企業ユーザーのみ有効 */}
              {userType === 'cfo' ? (
                <div className="px-2 sm:px-3 py-2 bg-gray-300 text-gray-500 text-xs sm:text-sm rounded-lg font-medium text-center cursor-not-allowed">
                  <span className="hidden sm:inline">募集している</span>CFO一覧
                </div>
              ) : (
                <Link 
                  href="/discover/cfos" 
                  className="px-2 sm:px-3 py-2 bg-green-600 text-white text-xs sm:text-sm rounded-lg hover:bg-green-700 transition-colors font-medium text-center"
                >
                  <span className="hidden sm:inline">募集している</span>CFO一覧
                </Link>
              )}

              {/* ログイン状態表示 */}
              <ResponsiveLoginStatus />
            </div>
          </div>
        </div>
      </div>

      {/* 下段: ナビゲーション＋右側アイコン */}
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12 md:h-14">
            
            {/* PC用ナビゲーション */}
            {actualIsLoggedIn && !isDemoPage && (
              <nav className="hidden md:flex space-x-6 lg:space-x-8 h-full">
                {navigationItems.map((item: any) => (
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
            <div className="flex items-center space-x-1 md:space-x-2 lg:space-x-4">
              {/* 通知ボタン - ログイン時のみ表示 */}
              {actualIsLoggedIn && (
                <div className="relative">
                  <button 
                    onClick={handleNotificationClick}
                    className="p-1 md:p-2 text-gray-700 hover:text-gray-900 transition-colors relative"
                    aria-label="通知"
                  >
                    <span className="text-base md:text-lg">🔔</span>
                    {/* 未読通知があるかデモ用のバッジ */}
                    <span className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full"></span>
                  </button>
                
                {/* 通知ドロップダウン */}
                {showNotifications && (
                  <div className="fixed md:absolute left-2 right-2 md:right-0 md:left-auto top-14 md:top-full md:mt-2 max-h-[60vh] w-auto md:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-[1001] flex flex-col">
                    <div className="p-2 md:p-3 lg:p-4 border-b border-gray-200">
                      <h3 className="font-medium text-gray-900 text-xs md:text-sm lg:text-base">通知</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0">
                      <Link 
                        href="/scout"
                        className="w-full p-2 md:p-3 lg:p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors text-left min-h-[50px] md:min-h-[60px] flex flex-col justify-center"
                        onClick={() => setShowNotifications(false)}
                      >
                        <p className="text-xs md:text-sm text-gray-900">新しいスカウトが届きました</p>
                        <p className="text-xs text-gray-500 mt-0.5 md:mt-1">2時間前</p>
                      </Link>
                      <Link 
                        href="/meetings"
                        className="w-full p-2 md:p-3 lg:p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors text-left min-h-[50px] md:min-h-[60px] flex flex-col justify-center"
                        onClick={() => setShowNotifications(false)}
                      >
                        <p className="text-xs md:text-sm text-gray-900">面談スケジュールが更新されました</p>
                        <p className="text-xs text-gray-500 mt-0.5 md:mt-1">5時間前</p>
                      </Link>
                      <Link 
                        href="/messages"
                        className="w-full p-2 md:p-3 lg:p-4 hover:bg-gray-50 cursor-pointer transition-colors text-left min-h-[50px] md:min-h-[60px] flex flex-col justify-center block"
                        onClick={() => setShowNotifications(false)}
                      >
                        <p className="text-xs md:text-sm text-gray-900">新しいメッセージが届きました</p>
                        <p className="text-xs text-gray-500 mt-0.5 md:mt-1">1日前</p>
                      </Link>
                    </div>
                    <div className="p-2 md:p-3 border-t border-gray-200 flex-shrink-0">
                      <button className="w-full min-h-[36px] md:min-h-[44px] text-center text-xs md:text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors">
                        すべての通知を見る
                      </button>
                    </div>
                  </div>
                )}
                </div>
              )}
              
              {/* ヘルプボタン - ログイン時のみ表示 */}
              {actualIsLoggedIn && (
                <div className="relative" ref={helpMenuRef}>
                  <button 
                    onClick={handleHelpMenuClick}
                    className="p-2 text-gray-700 hover:text-gray-900 transition-colors"
                    aria-label="ヘルプ"
                    title="ヘルプ"
                  >
                    <span className="text-lg">❓</span>
                  </button>
                  
                  {/* ヘルプドロップダウン */}
                  {showHelpMenu && (
                    <div className="absolute right-0 mt-1 md:mt-2 w-64 md:w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-[1001] origin-top-right max-w-[calc(100vw-2rem)]">
                      <div className="p-3 md:p-4 border-b border-gray-200">
                        <h3 className="font-medium text-gray-900 text-xs md:text-sm">ヘルプ・サポート</h3>
                      </div>
                      <div className="py-1 md:py-2">
                        <Link 
                          href="/help/getting-started"
                          className="flex items-center px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowHelpMenu(false)}
                        >
                          <span className="mr-2 md:mr-3 text-sm md:text-base">🚀</span>
                          <div>
                            <p className="font-medium text-xs md:text-sm">はじめての方へ</p>
                            <p className="text-xs text-gray-500 hidden md:block">基本的な使い方を確認</p>
                          </div>
                        </Link>
                        <Link 
                          href="/help/faq"
                          className="flex items-center px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowHelpMenu(false)}
                        >
                          <span className="mr-2 md:mr-3 text-sm md:text-base">❓</span>
                          <div>
                            <p className="font-medium text-xs md:text-sm">よくある質問</p>
                            <p className="text-xs text-gray-500 hidden md:block">FAQ・トラブルシューティング</p>
                          </div>
                        </Link>
                        <Link 
                          href="/help/contact"
                          className="flex items-center px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowHelpMenu(false)}
                        >
                          <span className="mr-2 md:mr-3 text-sm md:text-base">💬</span>
                          <div>
                            <p className="font-medium text-xs md:text-sm">お問い合わせ</p>
                            <p className="text-xs text-gray-500 hidden md:block">サポートチームに連絡</p>
                          </div>
                        </Link>
                        <Link 
                          href="/help/guide"
                          className="flex items-center px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowHelpMenu(false)}
                        >
                          <span className="mr-2 md:mr-3 text-sm md:text-base">📖</span>
                          <div>
                            <p className="font-medium text-xs md:text-sm">利用ガイド</p>
                            <p className="text-xs text-gray-500 hidden md:block">詳細な操作説明</p>
                          </div>
                        </Link>
                      </div>
                      <div className="py-1 md:py-2 border-t border-gray-200">
                        <Link 
                          href="/help/terms"
                          className="flex items-center px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowHelpMenu(false)}
                        >
                          <span className="mr-2 md:mr-3 text-sm">📋</span>
                          利用規約
                        </Link>
                        <Link 
                          href="/help/privacy"
                          className="flex items-center px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                          onClick={() => setShowHelpMenu(false)}
                        >
                          <span className="mr-2 md:mr-3 text-sm">🔒</span>
                          プライバシーポリシー
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ユーザードロップダウン - ログイン時のみ表示 */}
              {actualIsLoggedIn && (
                <UserDropdown 
                  userName={actualUserName} 
                  userAvatar={userAvatar} 
                  showUserMenu={showUserMenu}
                  onToggleUserMenu={handleUserMenuClick}
                  onCloseUserMenu={() => setShowUserMenu(false)}
                  onLogout={logout}
                />
              )}

              {/* ログアウト時のボタン */}
              {!actualIsLoggedIn && !isAuthLoading && (
                <div className="flex items-center space-x-1 md:space-x-2">
                  <Link 
                    href="/auth/login" 
                    className="px-2 py-1 md:px-4 md:py-2 text-gray-700 hover:text-gray-900 text-xs md:text-sm transition-colors"
                  >
                    ログイン
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="px-2 py-1 md:px-4 md:py-2 bg-gray-900 text-white rounded-lg text-xs md:text-sm hover:bg-gray-800 transition-colors"
                  >
                    会員登録
                  </Link>
                </div>
              )}
              
              {/* ローディング時のスケルトン */}
              {isAuthLoading && (
                <div className="flex items-center space-x-1 md:space-x-2">
                  <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* モバイル用ボトムナビゲーション */}
      {actualIsLoggedIn && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[500] pb-safe shadow-lg">
          <div className="grid grid-cols-5 h-16">
            {navigationItems.map((item: any) => (
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
      {actualIsLoggedIn && showNotifications && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-[999] md:hidden"
          onClick={() => setShowNotifications(false)}
        />
      )}

    </header>
  )
}