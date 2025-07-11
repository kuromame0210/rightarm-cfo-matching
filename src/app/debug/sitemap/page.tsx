'use client'

import { useState } from 'react'
import Link from 'next/link'
// Remove AppHeader import since it uses useAuth which fails during static generation

interface PageInfo {
  path: string
  name: string
  description: string
  status: 'completed' | 'in_progress' | 'planned'
  category: string
  requiresAuth: boolean
  children?: PageInfo[]
  isDynamic?: boolean
}

const SITEMAP_DATA: PageInfo[] = [
  // Public Pages
  {
    path: '/',
    name: 'ランディングページ',
    description: 'サービス紹介・メインランディングページ',
    status: 'completed',
    category: 'public',
    requiresAuth: false
  },

  // Authentication
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
    name: '会員登録選択',
    description: '企業・CFO登録タイプ選択ページ',
    status: 'completed',
    category: 'auth',
    requiresAuth: false,
    children: [
      {
        path: '/auth/register?type=company',
        name: '企業登録',
        description: '企業向け登録フォーム（年商・財務課題・求める人物像）',
        status: 'completed',
        category: 'auth',
        requiresAuth: false
      },
      {
        path: '/auth/register?type=cfo',
        name: 'CFO登録',
        description: 'CFO向け登録フォーム（スキル・資格・経験・稼働希望）',
        status: 'completed',
        category: 'auth',
        requiresAuth: false
      }
    ]
  },

  // Main Application
  {
    path: '/home',
    name: 'ホーム',
    description: 'ログイン後メインダッシュボード・ProfileCard表示',
    status: 'completed',
    category: 'main',
    requiresAuth: true
  },
  {
    path: '/discover/companies',
    name: '企業検索',
    description: '業界・ステージ・課題による企業検索',
    status: 'completed',
    category: 'main',
    requiresAuth: true
  },
  {
    path: '/discover/cfos',
    name: 'CFO検索',
    description: 'スキル・経験・稼働形態によるCFO検索',
    status: 'completed',
    category: 'main',
    requiresAuth: true
  },
  {
    path: '/scout',
    name: 'スカウト管理',
    description: 'スカウト送受信・管理',
    status: 'completed',
    category: 'main',
    requiresAuth: true,
    children: [
      {
        path: '/scout/companies',
        name: '企業スカウト',
        description: '企業へのスカウト送信',
        status: 'completed',
        category: 'main',
        requiresAuth: true
      }
    ]
  },
  {
    path: '/reverse-scout',
    name: '逆スカウト（CFO→企業）',
    description: 'CFOから企業への積極的アプローチ機能',
    status: 'completed',
    category: 'main',
    requiresAuth: true
  },
  {
    path: '/messages',
    name: 'メッセージ・チャット',
    description: 'リアルタイムメッセージ・面談設定・4段階ステータス管理',
    status: 'completed',
    category: 'main',
    requiresAuth: true
  },
  {
    path: '/meetings',
    name: '面談予定管理',
    description: '面談スケジュール・リンク管理',
    status: 'completed',
    category: 'main',
    requiresAuth: true
  },

  // Profile & Settings
  {
    path: '/profile',
    name: 'プロフィール編集',
    description: 'ユーザープロフィール編集',
    status: 'completed',
    category: 'user',
    requiresAuth: true
  },
  {
    path: '/settings',
    name: 'アカウント設定',
    description: 'アプリケーション設定・通知設定',
    status: 'completed',
    category: 'user',
    requiresAuth: true
  },
  {
    path: '/activity',
    name: 'アクティビティ履歴',
    description: 'ユーザー行動履歴・統計情報',
    status: 'completed',
    category: 'user',
    requiresAuth: true
  },

  // Dynamic Pages (Examples)
  {
    path: '/cfo/[id]',
    name: 'CFO詳細ページ',
    description: 'CFOプロフィール詳細・実績・評価表示',
    status: 'completed',
    category: 'detail',
    requiresAuth: true,
    isDynamic: true,
    children: [
      {
        path: '/cfo/1',
        name: 'CFO詳細（山田太郎）',
        description: '戦略CFO山田・IPO実績・資金調達支援',
        status: 'completed',
        category: 'detail',
        requiresAuth: true
      },
      {
        path: '/cfo/2',
        name: 'CFO詳細（田中花子）',
        description: 'システムCFO田中・管理会計・ERP導入',
        status: 'completed',
        category: 'detail',
        requiresAuth: true
      },
      {
        path: '/cfo/3',
        name: 'CFO詳細（佐藤次郎）',
        description: 'M&A佐藤・事業再生・企業価値向上',
        status: 'completed',
        category: 'detail',
        requiresAuth: true
      }
    ]
  },
  {
    path: '/company/[id]',
    name: '企業詳細ページ',
    description: '企業情報詳細・課題・条件・レビュー表示',
    status: 'completed',
    category: 'detail',
    requiresAuth: true,
    isDynamic: true,
    children: [
      {
        path: '/company/1',
        name: '企業詳細（テックスタート）',
        description: 'SaaS企業・資金調達準備・シリーズA完了',
        status: 'completed',
        category: 'detail',
        requiresAuth: true
      },
      {
        path: '/company/2',
        name: '企業詳細（グリーンエナジー）',
        description: '再生エネルギー・海外展開・シリーズB',
        status: 'completed',
        category: 'detail',
        requiresAuth: true
      },
      {
        path: '/company/3',
        name: '企業詳細（フードテック）',
        description: '代替肉技術・アーリーステージ・シード調達済',
        status: 'completed',
        category: 'detail',
        requiresAuth: true
      }
    ]
  },
  {
    path: '/scout/[id]',
    name: 'スカウト詳細',
    description: '個別スカウト詳細・対応履歴',
    status: 'completed',
    category: 'detail',
    requiresAuth: true,
    isDynamic: true,
    children: [
      {
        path: '/scout/1',
        name: 'スカウト詳細（テックスタート）',
        description: 'IPO準備支援・月80-120万円・週2-3日',
        status: 'completed',
        category: 'detail',
        requiresAuth: true
      }
    ]
  },

  // Contract & Payment
  {
    path: '/contracts/[id]/invoice',
    name: '請求書管理',
    description: '支払い情報・証憑アップロード・支払い報告',
    status: 'completed',
    category: 'contract',
    requiresAuth: true,
    isDynamic: true,
    children: [
      {
        path: '/contracts/1/invoice',
        name: '請求書（テックスタート案件）',
        description: '月100万円・手数料5%・振込先表示・支払いフロー',
        status: 'completed',
        category: 'contract',
        requiresAuth: true
      }
    ]
  },
  {
    path: '/contracts/[id]/review',
    name: 'レビュー・評価',
    description: '5段階評価・項目別評価・双方向レビューシステム',
    status: 'completed',
    category: 'contract',
    requiresAuth: true,
    isDynamic: true,
    children: [
      {
        path: '/contracts/1/review',
        name: 'レビュー投稿（テックスタート案件）',
        description: '専門性・コミュニケーション・成果物・スケジュール・提案力評価',
        status: 'completed',
        category: 'contract',
        requiresAuth: true
      }
    ]
  },

  // Admin Panel
  {
    path: '/admin',
    name: '管理画面',
    description: '運営管理トップページ',
    status: 'completed',
    category: 'admin',
    requiresAuth: true,
    children: [
      {
        path: '/admin/dashboard',
        name: '管理ダッシュボード',
        description: 'KPI統計・ユーザー管理・収益分析・承認管理',
        status: 'completed',
        category: 'admin',
        requiresAuth: true
      },
      {
        path: '/admin/tags',
        name: 'タグ管理',
        description: 'スキル・業界・課題・資格タグの追加・編集・無効化',
        status: 'completed',
        category: 'admin',
        requiresAuth: true
      }
    ]
  },

  // Demo & Debug
  {
    path: '/demo',
    name: 'デモページ',
    description: '社長プレゼン・説明用デモページ',
    status: 'completed',
    category: 'demo',
    requiresAuth: false,
    children: [
      {
        path: '/demo/overview',
        name: '全体概要デモ',
        description: '機能完成度・ユーザージャーニー・実装状況プレゼン用',
        status: 'completed',
        category: 'demo',
        requiresAuth: false
      },
      {
        path: '/demo/flows',
        name: 'システムフロー図解',
        description: '面談リンク発行・支払い処理フローの可視化',
        status: 'completed',
        category: 'demo',
        requiresAuth: false
      }
    ]
  },
  {
    path: '/debug',
    name: 'デバッグ・開発用',
    description: '開発・デバッグ用ツール',
    status: 'completed',
    category: 'debug',
    requiresAuth: false,
    children: [
      {
        path: '/debug/components',
        name: 'UIコンポーネント一覧',
        description: '全UIコンポーネントのプレビュー・設計ガイドライン',
        status: 'completed',
        category: 'debug',
        requiresAuth: false
      },
      {
        path: '/debug/sitemap',
        name: 'サイトマップ',
        description: '全ページ一覧・実装ステータス確認',
        status: 'completed',
        category: 'debug',
        requiresAuth: false
      },
      {
        path: '/debug/api',
        name: 'API状況',
        description: 'API接続状況・レスポンス確認',
        status: 'completed',
        category: 'debug',
        requiresAuth: false
      },
      {
        path: '/debug/performance',
        name: 'パフォーマンス',
        description: 'ページ読み込み速度・最適化状況',
        status: 'completed',
        category: 'debug',
        requiresAuth: false
      }
    ]
  }
]

export default function SitemapDebugPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  const categories = ['all', 'public', 'auth', 'main', 'user', 'detail', 'contract', 'admin', 'demo', 'debug']
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
      case 'detail': return 'bg-teal-100 text-teal-800'
      case 'contract': return 'bg-emerald-100 text-emerald-800'
      case 'admin': return 'bg-red-100 text-red-800'
      case 'demo': return 'bg-green-100 text-green-800'
      case 'debug': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'public': return '🌐 公開ページ'
      case 'auth': return '🔐 認証'
      case 'main': return '🏠 メイン機能'
      case 'user': return '👤 ユーザー'
      case 'detail': return '📋 詳細ページ'
      case 'contract': return '📄 契約・支払い'
      case 'admin': return '🛠️ 管理者'
      case 'demo': return '🎬 デモ'
      case 'debug': return '🐛 デバッグ'
      default: return category
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

  const canOpenPage = (page: PageInfo) => {
    return page.status === 'completed' && !page.isDynamic
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple header for debug page without auth context */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-xl font-bold text-gray-900 tracking-wide hover:text-gray-700 transition-colors"
              >
                REXTRIX
              </Link>
              <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                🐛 DEBUG
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href="/debug/components" 
                className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                🧩 Components
              </Link>
              <Link 
                href="/debug/api" 
                className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                🔗 API
              </Link>
              <Link 
                href="/debug/performance" 
                className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
              >
                ⚡ Performance
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">🗺️ サイトマップ</h1>
            <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
              デバッグ専用
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              v5.1準拠
            </span>
          </div>
          <p className="text-gray-600 mb-4">
            RightArm v5.1 - 全{allPages.length}ページの実装状況と構造を確認
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">📊 実装完了率</h3>
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((completedCount / allPages.length) * 100)}%
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / allPages.length) * 100}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600">
                {completedCount}/{allPages.length} ページ完成
              </div>
            </div>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{allPages.length}</div>
            <div className="text-sm text-gray-600">総ページ数</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <div className="text-sm text-gray-600">✅ 完成</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{inProgressCount}</div>
            <div className="text-sm text-gray-600">🚧 進行中</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-600">{plannedCount}</div>
            <div className="text-sm text-gray-600">📋 計画中</div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 フィルター</h3>
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
                <option value="all">🌟 すべて</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>
                    {getCategoryLabel(category)}
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
                <option value="all">すべて</option>
                <option value="completed">✅ 完成</option>
                <option value="in_progress">🚧 進行中</option>
                <option value="planned">📋 計画中</option>
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
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {page.name}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(page.category)}`}>
                        {getCategoryLabel(page.category)}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(page.status)}`}>
                        {page.status === 'completed' ? '✅ 完成' :
                         page.status === 'in_progress' ? '🚧 進行中' : '📋 計画中'}
                      </span>
                      {page.requiresAuth && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          🔒 認証必要
                        </span>
                      )}
                      {page.isDynamic && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          ⚡ 動的ページ
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{page.description}</p>
                    <p className="text-gray-500 text-xs font-mono bg-gray-50 px-2 py-1 rounded inline-block">
                      {page.path}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {canOpenPage(page) && (
                      <Link
                        href={page.path}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        🔗 ページを開く
                      </Link>
                    )}
                    {page.isDynamic && page.children && page.children.length > 0 && (
                      <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md text-sm">
                        📋 {page.children.length}個の例
                      </span>
                    )}
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
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h4 className="text-md font-medium text-gray-800">
                              {child.name}
                            </h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(child.category)}`}>
                              {getCategoryLabel(child.category)}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(child.status)}`}>
                              {child.status === 'completed' ? '✅ 完成' :
                               child.status === 'in_progress' ? '🚧 進行中' : '📋 計画中'}
                            </span>
                            {child.requiresAuth && (
                              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                🔒 認証必要
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-1">{child.description}</p>
                          <p className="text-gray-500 text-xs font-mono bg-white px-2 py-1 rounded inline-block">
                            {child.path}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {child.status === 'completed' && (
                            <Link
                              href={child.path}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              🔗 開く
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

        {/* フッター情報 */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 開発状況サマリー</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {Math.round((completedCount / allPages.length) * 100)}%
              </div>
              <p className="text-sm text-gray-600">実装完了率</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {SITEMAP_DATA.filter(p => p.category === 'main').length}
              </div>
              <p className="text-sm text-gray-600">コア機能数</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {allPages.filter(p => p.requiresAuth === false).length}
              </div>
              <p className="text-sm text-gray-600">公開ページ数</p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              🎯 <strong>社長プレゼン推奨:</strong> 
              <Link href="/demo/overview" className="text-blue-600 hover:underline mx-1">全体概要デモ</Link>
              → 
              <Link href="/demo/flows" className="text-blue-600 hover:underline mx-1">システムフロー</Link>
              → 実機操作デモの順序で説明
            </p>
          </div>

          {/* バージョン情報 */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">🏷️ バージョン情報</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-medium">v3.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Build:</span>
                    <span className="font-medium">2024.06.23</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Commit:</span>
                    <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">c0a046a</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Branch:</span>
                    <span className="font-medium">main</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">🛠️ 技術スタック</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next.js:</span>
                    <span className="font-medium">15.3.4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">TypeScript:</span>
                    <span className="font-medium">5.x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tailwind:</span>
                    <span className="font-medium">3.x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deploy:</span>
                    <span className="font-medium">Vercel</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}