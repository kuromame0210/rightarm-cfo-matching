'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface UserDropdownProps {
  userName?: string
  userEmail?: string
  userAvatar?: string
  showUserMenu: boolean
  onToggleUserMenu: () => void
  onCloseUserMenu: () => void
}

export default function UserDropdown({ 
  userName = "山田さん", 
  userEmail = "yamada@example.com", 
  userAvatar = "👤",
  showUserMenu,
  onToggleUserMenu,
  onCloseUserMenu
}: UserDropdownProps) {
  const userMenuRef = useRef<HTMLDivElement>(null)

  // 外部クリックでドロップダウンを閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        onCloseUserMenu()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onCloseUserMenu])

  return (
    <div className="relative" ref={userMenuRef}>
      <button 
        onClick={onToggleUserMenu}
        className="flex items-center text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 px-2 py-1 transition-all duration-200 active:scale-95"
      >
        <span className="mr-1 md:mr-2 text-sm md:text-base">{userName}</span>
        <span className="text-lg">{userAvatar}</span>
      </button>
      
      {/* ユーザーメニュードロップダウン */}
      {showUserMenu && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-[9999]">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-lg">{userAvatar}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
              </div>
            </div>
          </div>
          <div className="py-2">
            <Link 
              href="/profile" 
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={onCloseUserMenu}
            >
              <span className="mr-3">👤</span>
              プロフィール編集
            </Link>
            <Link 
              href="/settings" 
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={onCloseUserMenu}
            >
              <span className="mr-3">⚙️</span>
              設定
            </Link>
            <Link 
              href="/activity" 
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={onCloseUserMenu}
            >
              <span className="mr-3">📊</span>
              アクティビティ
            </Link>
          </div>
          <div className="py-2 border-t border-gray-200">
            <Link 
              href="/" 
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={onCloseUserMenu}
            >
              <span className="mr-3">🚪</span>
              ログアウト
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}