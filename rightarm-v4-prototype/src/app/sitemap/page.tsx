'use client'

import Link from 'next/link'

export default function SitemapPage() {
  const siteStructure = [
    {
      category: '基本ページ',
      pages: [
        { name: 'ホーム（ランディング）', path: '/', description: 'トップページ・サービス紹介' },
        { name: 'CFO検索', path: '/home', description: '企業がCFOを検索・閲覧' },
        { name: 'メッセージ', path: '/messages', description: 'チャット・コミュニケーション' },
        { name: 'プロフィール', path: '/profile', description: 'ユーザープロフィール管理' }
      ]
    },
    {
      category: '認証・登録',
      pages: [
        { name: 'ログイン', path: '/auth/login', description: 'ユーザーログイン' },
        { name: '会員登録', path: '/auth/register', description: '企業・CFO登録フォーム' },
        { name: '企業登録', path: '/auth/register?type=company', description: '企業向け登録' },
        { name: 'CFO登録', path: '/auth/register?type=cfo', description: 'CFO向け登録' }
      ]
    },
    {
      category: 'CFO向け機能',
      pages: [
        { name: 'CFOダッシュボード', path: '/cfo-dashboard', description: '案件一覧・応募履歴' },
        { name: 'CFOプロフィール', path: '/cfo-profile', description: 'CFOプロフィール編集' },
        { name: 'CFO詳細', path: '/cfo/1', description: '個別CFOプロフィール表示（例: ID=1）' }
      ]
    },
    {
      category: '管理者機能',
      pages: [
        { name: '管理ダッシュボード', path: '/admin', description: 'システム統計・管理機能' },
        { name: '支払い管理', path: '/admin/payments', description: '決済・支払い状況管理' }
      ]
    }
  ]

  const additionalInfo = [
    {
      title: '技術仕様',
      items: [
        'Next.js 15 (App Router)',
        'React 19 + TypeScript',
        'Tailwind CSS v4',
        'レスポンシブデザイン対応'
      ]
    },
    {
      title: '主要機能',
      items: [
        'CFOマッチングプラットフォーム',
        '企業・CFO双方向登録',
        'フィルタリング検索',
        'メッセージング機能',
        '管理者機能'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-gray-900 tracking-wide">
                RIGHTARM
              </Link>
              <span className="text-sm text-gray-600">サイトマップ</span>
            </div>
            
            <Link 
              href="/"
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm">ホームに戻る</span>
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ページタイトル */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            サイトマップ
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            RIGHTARMプラットフォームの全ページ構成をご確認いただけます
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* サイト構造 */}
          <div className="lg:col-span-2">
            <div className="space-y-8">
              {siteStructure.map((section, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    {section.category}
                  </h2>
                  
                  <div className="space-y-4">
                    {section.pages.map((page, pageIndex) => (
                      <div key={pageIndex} className="border-l-2 border-gray-100 pl-4 hover:border-blue-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link 
                              href={page.path}
                              className="text-gray-900 hover:text-blue-600 font-medium transition-colors"
                            >
                              {page.name}
                            </Link>
                            <p className="text-sm text-gray-600 mt-1">{page.description}</p>
                          </div>
                          <div className="ml-4">
                            <Link
                              href={page.path}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              →
                            </Link>
                          </div>
                        </div>
                        <div className="mt-2">
                          <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {page.path}
                          </code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* サイドバー情報 */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              
              {/* プロジェクト情報 */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  プロジェクト概要
                </h3>
                <p className="text-blue-800 text-sm mb-4">
                  CFOマッチングプラットフォーム「RIGHTARM」のプロトタイプ版です。
                </p>
                <div className="text-xs text-blue-700">
                  <div className="mb-2">
                    <strong>バージョン:</strong> v4-prototype
                  </div>
                  <div className="mb-2">
                    <strong>状態:</strong> 開発中
                  </div>
                  <div>
                    <strong>更新:</strong> 2024年12月
                  </div>
                </div>
              </div>

              {/* 追加情報 */}
              {additionalInfo.map((info, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {info.title}
                  </h3>
                  <ul className="space-y-2">
                    {info.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-3 flex-shrink-0"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* クイックナビゲーション */}
              <div className="bg-gray-900 rounded-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-4">クイックナビ</h3>
                <div className="space-y-3">
                  <Link 
                    href="/"
                    className="block text-sm hover:text-gray-300 transition-colors"
                  >
                    🏠 ホームページ
                  </Link>
                  <Link 
                    href="/home"
                    className="block text-sm hover:text-gray-300 transition-colors"
                  >
                    🔍 CFO検索
                  </Link>
                  <Link 
                    href="/cfo-dashboard"
                    className="block text-sm hover:text-gray-300 transition-colors"
                  >
                    📊 CFOダッシュボード
                  </Link>
                  <Link 
                    href="/admin"
                    className="block text-sm hover:text-gray-300 transition-colors"
                  >
                    ⚙️ 管理画面
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>© 2024 RIGHTARM. All rights reserved.</p>
            <p className="mt-2">CFOマッチングプラットフォーム v4-prototype</p>
          </div>
        </div>
      </footer>
    </div>
  )
}