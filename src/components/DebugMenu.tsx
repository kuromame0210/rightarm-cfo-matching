'use client'

import { useState } from 'react'
import Link from 'next/link'

interface DebugMenuItem {
  name: string
  path: string
  description: string
  icon: string
}

const DEBUG_MENU_ITEMS: DebugMenuItem[] = [
  {
    name: 'サイトマップ',
    path: '/debug/sitemap',
    description: 'アプリケーション全体のページ構造を確認',
    icon: '🗺️'
  },
  {
    name: 'パフォーマンス',
    path: '/debug/performance',
    description: 'ページ読み込み時間とパフォーマンス指標',
    icon: '⚡'
  },
  {
    name: 'コンポーネント',
    path: '/debug/components',
    description: 'UI コンポーネントの一覧とテスト',
    icon: '🧩'
  },
  {
    name: 'API テスト',
    path: '/debug/api',
    description: 'API エンドポイントのテストと確認',
    icon: '🔌'
  }
]

export default function DebugMenu() {
  const [isOpen, setIsOpen] = useState(false)

  // 開発環境でのみ表示
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <>
      {/* デバッグメニューボタン */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center"
          title="デバッグメニュー"
        >
          <span className="text-lg">🛠️</span>
        </button>

        {/* デバッグメニューパネル */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">デバッグメニュー</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-2">
              {DEBUG_MENU_ITEMS.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.description}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                開発環境でのみ表示されます
              </div>
            </div>
          </div>
        )}
      </div>

      {/* オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}