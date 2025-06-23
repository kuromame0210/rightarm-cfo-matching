'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AdminDashboardPage() {
  // ダッシュボード統計データ
  const stats = {
    totalUsers: 127,
    totalCompanies: 63,
    totalCFOs: 64,
    activeContracts: 18,
    pendingPayments: 5,
    totalRevenue: 2450000,
    monthlyGrowth: 12.5
  }

  const recentActivity = [
    {
      id: 1,
      type: 'user_registration',
      message: '新規企業登録: 株式会社テックスタートアップ',
      timestamp: '5分前',
      priority: 'normal'
    },
    {
      id: 2,
      type: 'security_alert',
      message: 'セキュリティアラート: 不正ログイン試行を検出（企業ID: 1027）',
      timestamp: '15分前',
      priority: 'urgent'
    },
    {
      id: 3,
      type: 'contract_signed',
      message: '契約締結: 田中太郎 × 株式会社イノベーション',
      timestamp: '1時間前',
      priority: 'high'
    },
    {
      id: 4,
      type: 'system_maintenance',
      message: 'システムメンテナンス完了: データベース最適化処理',
      timestamp: '1時間前',
      priority: 'normal'
    },
    {
      id: 5,
      type: 'payment_overdue',
      message: '支払い遅延: 株式会社グロースパートナーズ (15日経過)',
      timestamp: '2時間前',
      priority: 'urgent'
    },
    {
      id: 6,
      type: 'cfo_suspension',
      message: 'CFOアカウント停止: 利用規約違反による一時停止（佐々木一郎）',
      timestamp: '2時間前',
      priority: 'high'
    },
    {
      id: 7,
      type: 'cfo_application',
      message: 'CFO応募: 佐藤花子 → 株式会社フューチャーテック',
      timestamp: '3時間前',
      priority: 'normal'
    },
    {
      id: 8,
      type: 'data_export',
      message: '月次レポート自動生成完了: 2024年12月分データ',
      timestamp: '3時間前',
      priority: 'normal'
    },
    {
      id: 9,
      type: 'refund_request',
      message: '返金申請受付: 株式会社ベンチャーX（契約解除に伴う）',
      timestamp: '4時間前',
      priority: 'high'
    },
    {
      id: 10,
      type: 'review_submitted',
      message: '新規レビュー投稿: 株式会社スマートソリューション (★★★★★)',
      timestamp: '4時間前',
      priority: 'normal'
    },
    {
      id: 11,
      type: 'api_limit_exceeded',
      message: 'API利用制限超過: 外部決済システム連携でエラー発生',
      timestamp: '5時間前',
      priority: 'urgent'
    },
    {
      id: 12,
      type: 'new_feature_request',
      message: '機能追加要望: メッセージ機能の動画通話対応（企業からの要望）',
      timestamp: '6時間前',
      priority: 'normal'
    }
  ]

  const pendingApprovals = [
    {
      id: 1,
      type: 'cfo_verification',
      title: 'CFO資格認証待ち',
      description: '山田次郎の公認会計士資格認証',
      priority: 'high'
    },
    {
      id: 2,
      type: 'company_verification',
      title: '企業認証待ち',
      description: '株式会社ニューテックの法人認証',
      priority: 'normal'
    },
    {
      id: 3,
      type: 'dispute_resolution',
      title: '紛争解決待ち',
      description: '契約内容に関する調停案件',
      priority: 'urgent'
    },
    {
      id: 4,
      type: 'account_recovery',
      title: 'アカウント復旧申請',
      description: '企業アカウントのパスワードリセット要求',
      priority: 'normal'
    },
    {
      id: 5,
      type: 'content_moderation',
      title: 'コンテンツ審査待ち',
      description: 'CFOプロフィールの不適切コンテンツ報告',
      priority: 'high'
    },
    {
      id: 6,
      type: 'refund_approval',
      title: '返金承認待ち',
      description: '契約解除に伴う返金処理（¥120,000）',
      priority: 'urgent'
    },
    {
      id: 7,
      type: 'data_deletion',
      title: 'データ削除要求',
      description: 'GDPR準拠による個人データ削除申請',
      priority: 'high'
    },
    {
      id: 8,
      type: 'premium_upgrade',
      title: 'プレミアム申請承認',
      description: '企業の有料プラン移行申請',
      priority: 'normal'
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return '緊急'
      case 'high': return '高'
      case 'normal': return '通常'
      default: return priority
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900 tracking-wide">RIGHTARM</h1>
              <span className="text-sm text-gray-600 bg-red-100 px-2 py-1 rounded">管理画面</span>
            </div>
            
            {/* ナビゲーション */}
            <nav className="hidden md:flex space-x-6">
              <Link href="/admin" className="text-gray-900 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                ダッシュボード
              </Link>
              <Link href="/admin/users" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                ユーザー管理
              </Link>
              <Link href="/admin/contracts" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                契約管理
              </Link>
              <Link href="/admin/payments" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                支払い管理
              </Link>
              <Link href="/admin/reviews" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                レビュー管理
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">5</span>
              </button>
              
              <div className="w-8 h-8 bg-red-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">管</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ページタイトル */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">管理ダッシュボード</h2>
          <p className="text-gray-600">システム全体の状況を確認できます</p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">総ユーザー数</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalUsers.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">アクティブ契約</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.activeContracts}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">未払い件数</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.pendingPayments}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">月間売上</dt>
                  <dd className="text-lg font-medium text-gray-900">¥{stats.totalRevenue.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 最近のアクティビティ */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">最近のアクティビティ</h3>
              </div>
              <div className="p-6">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {recentActivity.map((activity, index) => (
                      <li key={activity.id}>
                        <div className="relative pb-8">
                          {index !== recentActivity.length - 1 && (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                          )}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                activity.priority === 'urgent' ? 'bg-red-500' :
                                activity.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                              }`}>
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-900">{activity.message}</p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                <time>{activity.timestamp}</time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 承認待ち項目 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">承認待ち</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {pendingApprovals.map(approval => (
                    <div key={approval.id} className={`p-4 rounded-lg border ${getPriorityColor(approval.priority)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium mb-1">{approval.title}</h4>
                          <p className="text-xs opacity-90">{approval.description}</p>
                        </div>
                        <span className="text-xs font-medium">
                          {getPriorityText(approval.priority)}
                        </span>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <button className="text-xs bg-white bg-opacity-50 hover:bg-opacity-75 px-2 py-1 rounded">
                          承認
                        </button>
                        <button className="text-xs bg-white bg-opacity-50 hover:bg-opacity-75 px-2 py-1 rounded">
                          詳細
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* クイックアクション */}
            <div className="bg-white rounded-lg shadow-sm mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">クイックアクション</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <Link 
                    href="/admin/users" 
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    📊 ユーザー管理
                  </Link>
                  <Link 
                    href="/admin/payments" 
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    💰 支払い状況確認
                  </Link>
                  <Link 
                    href="/admin/contracts" 
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    📋 契約管理
                  </Link>
                  <Link 
                    href="/admin/reports" 
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  >
                    📈 レポート生成
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}