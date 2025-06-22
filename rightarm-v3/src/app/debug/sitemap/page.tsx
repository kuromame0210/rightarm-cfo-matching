'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

interface PageInfo {
  path: string
  name: string
  description: string
  status: 'completed' | 'in_progress' | 'planned'
  category: string
  requiresAuth: boolean
  children?: PageInfo[]
}

const SITEMAP_DATA: PageInfo[] = [
  {
    path: '/',
    name: 'ランディングページ',
    description: 'メインのランディングページ',
    status: 'completed',
    category: 'public',
    requiresAuth: false
  },
  {
    path: '/auth',
    name: '認証',
    description: '認証関連ページ',
    status: 'completed',
    category: 'auth',
    requiresAuth: false,
    children: [
      {
        path: '/auth/login',
        name: 'ログイン',
        description: 'ユーザーログインページ',
        status: 'completed',
        category: 'auth',
        requiresAuth: false
      },
      {
        path: '/auth/register',
        name: '会員登録',
        description: 'ユーザー会員登録ページ',
        status: 'completed',
        category: 'auth',
        requiresAuth: false
      }
    ]
  },
  {
    path: '/home',
    name: 'ホーム',
    description: 'ログイン後のメインダッシュボード',
    status: 'completed',
    category: 'main',
    requiresAuth: true
  },
  {
    path: '/scout',
    name: 'スカウト',
    description: 'スカウト送受信管理ページ',
    status: 'completed',
    category: 'main',
    requiresAuth: true
  },
  {
    path: '/messages',
    name: 'メッセージ',
    description: 'チャット・メッセージ機能',
    status: 'completed',
    category: 'main',
    requiresAuth: true
  },
  {
    path: '/meetings',
    name: '面談予定',
    description: '面談スケジュール管理',
    status: 'completed',
    category: 'main',
    requiresAuth: true
  },
  {
    path: '/profile',
    name: 'プロフィール',
    description: 'ユーザープロフィール編集',
    status: 'in_progress',
    category: 'user',
    requiresAuth: true
  },
  {
    path: '/settings',
    name: '設定',
    description: 'アプリケーション設定',
    status: 'planned',
    category: 'user',
    requiresAuth: true
  },
  {
    path: '/activity',
    name: 'アクティビティ',
    description: 'ユーザーアクティビティ履歴',
    status: 'planned',
    category: 'user',
    requiresAuth: true
  },
  {
    path: '/help',
    name: 'ヘルプ',
    description: 'ヘルプ・サポートページ',
    status: 'planned',
    category: 'support',
    requiresAuth: false
  },
  {
    path: '/cfo/[id]',
    name: 'CFO詳細',
    description: 'CFOの詳細プロフィールページ',
    status: 'completed',
    category: 'main',
    requiresAuth: true,
    children: [
      {
        path: '/cfo/1',
        name: 'CFO詳細（山田太郎）',
        description: '山田太郎CFOの詳細ページ',
        status: 'completed',
        category: 'main',
        requiresAuth: true
      },
      {
        path: '/cfo/2',
        name: 'CFO詳細（田中花子）',
        description: '田中花子CFOの詳細ページ',
        status: 'completed',
        category: 'main',
        requiresAuth: true
      },
      {
        path: '/cfo/3',
        name: 'CFO詳細（佐藤次郎）',
        description: '佐藤次郎CFOの詳細ページ',
        status: 'completed',
        category: 'main',
        requiresAuth: true
      }
    ]
  }
]

export default function SitemapDebugPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const categories = ['all', 'public', 'auth', 'main', 'user', 'support']
  const statuses = ['all', 'completed', 'in_progress', 'planned']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'planned': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'public': return 'bg-blue-100 text-blue-800'
      case 'auth': return 'bg-purple-100 text-purple-800'
      case 'main': return 'bg-indigo-100 text-indigo-800'
      case 'user': return 'bg-pink-100 text-pink-800'
      case 'support': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredPages = SITEMAP_DATA.filter(page => {
    const categoryMatch = selectedCategory === 'all' || page.category === selectedCategory
    const statusMatch = selectedStatus === 'all' || page.status === selectedStatus
    return categoryMatch && statusMatch
  })

  const flattenPages = (pages: PageInfo[]): PageInfo[] => {
    return pages.reduce((acc, page) => {
      acc.push(page)
      if (page.children) {
        acc.push(...flattenPages(page.children))
      }
      return acc
    }, [] as PageInfo[])
  }

  const allPages = flattenPages(SITEMAP_DATA)
  const completedCount = allPages.filter(p => p.status === 'completed').length
  const inProgressCount = allPages.filter(p => p.status === 'in_progress').length
  const plannedCount = allPages.filter(p => p.status === 'planned').length

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">🗺️ サイトマップ</h1>
            <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
              デバッグ専用
            </span>
          </div>
          <p className="text-gray-600">
            アプリケーションの全ページ構造とステータスを確認できます
          </p>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{allPages.length}</div>
            <div className="text-sm text-gray-600">総ページ数</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <div className="text-sm text-gray-600">完成</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{inProgressCount}</div>
            <div className="text-sm text-gray-600">進行中</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-600">{plannedCount}</div>
            <div className="text-sm text-gray-600">計画中</div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">フィルター</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリー
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'すべて' : category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ステータス
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'すべて' : 
                     status === 'completed' ? '完成' :
                     status === 'in_progress' ? '進行中' : '計画中'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ページリスト */}
        <div className="space-y-4">
          {filteredPages.map((page) => (
            <div key={page.path}>
              {/* 親ページ */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {page.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(page.category)}`}>
                        {page.category}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(page.status)}`}>
                        {page.status === 'completed' ? '完成' :
                         page.status === 'in_progress' ? '進行中' : '計画中'}
                      </span>
                      {page.requiresAuth && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          🔒 認証必要
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{page.description}</p>
                    <p className="text-gray-500 text-xs font-mono">{page.path}</p>
                  </div>
                  <div className="flex gap-2">
                    {page.status === 'completed' && (
                      <Link
                        href={page.path}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        ページを開く
                      </Link>
                    )}
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">
                      詳細
                    </button>
                  </div>
                </div>
              </div>

              {/* 子ページ */}
              {page.children && page.children.length > 0 && (
                <div className="ml-8 mt-2 space-y-2">
                  {page.children
                    .filter(child => {
                      const categoryMatch = selectedCategory === 'all' || child.category === selectedCategory
                      const statusMatch = selectedStatus === 'all' || child.status === selectedStatus
                      return categoryMatch && statusMatch
                    })
                    .map((child) => (
                    <div key={child.path} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-md font-medium text-gray-800">
                              {child.name}
                            </h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(child.category)}`}>
                              {child.category}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(child.status)}`}>
                              {child.status === 'completed' ? '完成' :
                               child.status === 'in_progress' ? '進行中' : '計画中'}
                            </span>
                            {child.requiresAuth && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                🔒 認証必要
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-1">{child.description}</p>
                          <p className="text-gray-500 text-xs font-mono">{child.path}</p>
                        </div>
                        <div className="flex gap-2">
                          {child.status === 'completed' && (
                            <Link
                              href={child.path}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              開く
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}