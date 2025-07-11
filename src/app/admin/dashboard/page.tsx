'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

export const dynamic = 'force-dynamic'

export default function AdminDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30days')
  // const [showUserDetails, setShowUserDetails] = useState(false) // 将来の詳細表示機能用

  // 統計情報（実際のアプリではAPIから取得）
  const stats = {
    users: {
      total: 0,
      companies: 0,
      cfos: 0,
      newThisMonth: 0,
      activeUsers: 0
    },
    matching: {
      totalMatches: 0,
      successfulContracts: 0,
      conversionRate: 0,
      averageMatchTime: 0
    },
    financial: {
      totalRevenue: 0,
      monthlyRevenue: 0,
      averageContractValue: 0,
      platformFeeRate: 5
    },
    activity: {
      dailyActiveUsers: 0,
      messagesExchanged: 0,
      meetingsScheduled: 0,
      reviewsPosted: 0
    }
  }

  // アクティビティデータ（実際のアプリではAPIから取得）
  const recentActivity: any[] = []

  // 承認待ちレビュー（実際のアプリではAPIから取得）
  const pendingReviews: any[] = []

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'verified':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'open':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader isLoggedIn={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                🛠️ 管理画面
              </h1>
              <p className="text-gray-600">
                RightArm プラットフォームの運営管理・分析
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="7days">過去7日間</option>
                <option value="30days">過去30日間</option>
                <option value="90days">過去90日間</option>
                <option value="12months">過去12ヶ月</option>
              </select>
              <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                管理者専用
              </div>
            </div>
          </div>
        </div>

        {/* 主要指標カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* ユーザー統計 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">👥 ユーザー</h3>
              <span className="text-2xl">📊</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">総登録数</span>
                <span className="font-bold text-lg">{stats.users.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">企業</span>
                <span className="font-medium">{stats.users.companies}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">CFO</span>
                <span className="font-medium">{stats.users.cfos}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600">今月新規</span>
                <span className="font-medium text-green-600">+{stats.users.newThisMonth}</span>
              </div>
            </div>
          </div>

          {/* マッチング統計 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">🎯 マッチング</h3>
              <span className="text-2xl">💼</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">総マッチ数</span>
                <span className="font-bold text-lg">{stats.matching.totalMatches}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">契約成立</span>
                <span className="font-medium">{stats.matching.successfulContracts}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">成約率</span>
                <span className="font-medium text-blue-600">{stats.matching.conversionRate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">平均マッチ日数</span>
                <span className="font-medium">{stats.matching.averageMatchTime}日</span>
              </div>
            </div>
          </div>

          {/* 収益統計 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">💰 収益</h3>
              <span className="text-2xl">📈</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">総売上</span>
                <span className="font-bold text-lg">{formatCurrency(stats.financial.totalRevenue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600">今月売上</span>
                <span className="font-medium text-green-600">{formatCurrency(stats.financial.monthlyRevenue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">平均契約額</span>
                <span className="font-medium">{formatCurrency(stats.financial.averageContractValue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">手数料率</span>
                <span className="font-medium">{stats.financial.platformFeeRate}%</span>
              </div>
            </div>
          </div>

          {/* アクティビティ統計 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">⚡ アクティビティ</h3>
              <span className="text-2xl">🔥</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">DAU</span>
                <span className="font-bold text-lg">{stats.activity.dailyActiveUsers}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">メッセージ数</span>
                <span className="font-medium">{stats.activity.messagesExchanged}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">面談予定</span>
                <span className="font-medium">{stats.activity.meetingsScheduled}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">レビュー投稿</span>
                <span className="font-medium">{stats.activity.reviewsPosted}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 最近のアクティビティ */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">📋 最近のアクティビティ</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {recentActivity.map((activity: any) => (
                  <div key={activity.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">{activity.timestamp}</span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusBadge(activity.status)}`}>
                            {activity.status === 'completed' && '完了'}
                            {activity.status === 'pending_review' && '審査待ち'}
                            {activity.status === 'verified' && '確認済み'}
                            {activity.status === 'open' && '対応中'}
                          </span>
                        </div>
                      </div>
                      {activity.amount && (
                        <div className="text-right">
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(activity.amount)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 承認待ちリスト */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">⏳ 承認待ち</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {pendingReviews.map((review: any) => (
                  <div key={review.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{review.name}</p>
                        <p className="text-xs text-gray-500">{review.email}</p>
                        <p className="text-xs text-gray-500">{review.submittedAt}</p>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <button className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                          承認
                        </button>
                        <button className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                          拒否
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* クイックアクション */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🚀 クイックアクション</h3>
              <div className="space-y-3">
                <Link 
                  href="/admin/tags"
                  className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center text-sm"
                >
                  🏷️ タグ管理
                </Link>
                <Link 
                  href="/admin/users"
                  className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center text-sm"
                >
                  👥 ユーザー管理
                </Link>
                <Link 
                  href="/admin/analytics"
                  className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center text-sm"
                >
                  📊 詳細分析
                </Link>
                <Link 
                  href="/admin/support"
                  className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center text-sm"
                >
                  💬 サポート対応
                </Link>
              </div>
            </div>

            {/* システム情報 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💻 システム情報</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium">v5.1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">DB Status:</span>
                  <span className="text-green-600 font-medium">正常</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">API Status:</span>
                  <span className="text-green-600 font-medium">正常</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Deploy:</span>
                  <span className="font-medium">2024-02-15</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}