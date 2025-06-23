'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview')

  // サンプル統計データ
  const stats = {
    totalUsers: 1247,
    totalCFOs: 523,
    totalCompanies: 724,
    activeContracts: 89,
    totalRevenue: 15680000,
    monthlyGrowth: 12.5,
    averageRating: 4.7,
    completedProjects: 234
  }

  const recentActivities = [
    {
      id: 1,
      type: 'user_register',
      message: '新規CFO登録: 田中花子さん',
      timestamp: '5分前',
      icon: '👤'
    },
    {
      id: 2,
      type: 'contract_complete',
      message: '契約完了: 株式会社テックスタート × 山田太郎CFO',
      timestamp: '1時間前',
      icon: '✅'
    },
    {
      id: 3,
      type: 'payment_verify',
      message: '入金確認: INV-001 (¥1,050,000)',
      timestamp: '2時間前',
      icon: '💰'
    },
    {
      id: 4,
      type: 'review_posted',
      message: '新規レビュー投稿: ★4.8 (佐藤次郎CFO)',
      timestamp: '3時間前',
      icon: '⭐'
    },
    {
      id: 5,
      type: 'company_register',
      message: '新規企業登録: グローバル商事株式会社',
      timestamp: '4時間前',
      icon: '🏢'
    }
  ]

  const quickActions = [
    {
      title: 'タグ管理',
      description: '財務課題・スキルタグの編集',
      href: '/admin/tags',
      icon: '🏷️',
      color: 'bg-blue-500'
    },
    {
      title: 'ユーザー管理',
      description: 'CFO・企業アカウントの管理',
      href: '/admin/users',
      icon: '👥',
      color: 'bg-green-500'
    },
    {
      title: '契約管理',
      description: '進行中契約・支払い状況の確認',
      href: '/admin/contracts',
      icon: '📄',
      color: 'bg-orange-500'
    },
    {
      title: 'レビュー管理',
      description: '投稿レビューの監視・管理',
      href: '/admin/reviews',
      icon: '💬',
      color: 'bg-purple-500'
    },
    {
      title: '売上分析',
      description: '収益・成長率の詳細分析',
      href: '/admin/analytics',
      icon: '📊',
      color: 'bg-red-500'
    },
    {
      title: 'システム設定',
      description: 'プラットフォーム設定・メンテナンス',
      href: '/admin/settings',
      icon: '⚙️',
      color: 'bg-gray-500'
    }
  ]

  const tabs = [
    { id: 'overview', label: '概要', icon: '📊' },
    { id: 'tags', label: 'タグ管理', icon: '🏷️' },
    { id: 'analytics', label: '分析', icon: '📈' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader isLoggedIn={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* ページヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">管理画面</h1>
          <p className="text-gray-600">プラットフォームの管理・分析ダッシュボード</p>
        </div>

        {/* タブナビゲーション */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 概要タブ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 統計カード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">👥</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">総ユーザー数</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📄</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">進行中契約</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeContracts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">月間売上</p>
                    <p className="text-2xl font-bold text-gray-900">¥{Math.floor(stats.totalRevenue / 12).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">⭐</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">平均評価</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 最近のアクティビティ */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">最近のアクティビティ</h3>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-xl">{activity.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* クイックアクション */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action) => (
                    <Link
                      key={action.title}
                      href={action.href}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                          <span className="text-lg">{action.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{action.title}</h4>
                          <p className="text-xs text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* タグ管理タブ */}
        {activeTab === 'tags' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">財務課題タグ管理</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  新規タグ追加
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['資金調達', 'IPO準備', 'M&A', '管理会計強化', '財務分析', 'ERP導入', '銀行融資', 'VC調達', '事業再生', '補助金活用', '原価計算', '予実管理'].map((tag) => (
                  <div key={tag} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">{tag}</span>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">編集</button>
                      <button className="text-red-600 hover:text-red-800 text-sm">削除</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">スキルタグ管理</h3>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                  カテゴリ追加
                </button>
              </div>
              
              <div className="space-y-4">
                {[
                  { category: '資金調達', skills: ['VC調達', '銀行融資', '補助金申請', '投資家対応'] },
                  { category: 'IPO・M&A関連', skills: ['IPO準備', 'M&A戦略', '企業価値評価', 'DD対応'] },
                  { category: '財務DX・システム導入', skills: ['ERP導入', '管理会計システム', 'BI導入', 'API連携'] }
                ].map((categoryData) => (
                  <div key={categoryData.category} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{categoryData.category}</h4>
                      <button className="text-blue-600 hover:text-blue-800 text-sm">スキル追加</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {categoryData.skills.map((skill) => (
                        <span key={skill} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded border">
                          {skill}
                          <button className="ml-1 text-red-600 hover:text-red-800">✕</button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 分析タブ */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* 成長指標 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">ユーザー成長率</h3>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">+{stats.monthlyGrowth}%</p>
                  <p className="text-sm text-gray-600">月間成長率</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">完了プロジェクト</h3>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{stats.completedProjects}</p>
                  <p className="text-sm text-gray-600">累計完了数</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">総売上</h3>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">¥{(stats.totalRevenue / 1000000).toFixed(1)}M</p>
                  <p className="text-sm text-gray-600">累計売上</p>
                </div>
              </div>
            </div>

            {/* 詳細分析 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">人気スキルランキング</h3>
                <div className="space-y-3">
                  {[
                    { skill: '資金調達', count: 156, percentage: 85 },
                    { skill: 'IPO準備', count: 134, percentage: 72 },
                    { skill: '管理会計強化', count: 123, percentage: 67 },
                    { skill: 'M&A', count: 98, percentage: 53 },
                    { skill: 'ERP導入', count: 87, percentage: 47 }
                  ].map((item) => (
                    <div key={item.skill} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-900">{item.skill}</span>
                        <span className="text-xs text-gray-500">({item.count}件)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">地域別利用状況</h3>
                <div className="space-y-3">
                  {[
                    { region: '東京', count: 456, percentage: 60 },
                    { region: '大阪', count: 234, percentage: 31 },
                    { region: '愛知', count: 123, percentage: 16 },
                    { region: '福岡', count: 87, percentage: 11 },
                    { region: 'その他', count: 347, percentage: 46 }
                  ].map((item) => (
                    <div key={item.region} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-900">{item.region}</span>
                        <span className="text-xs text-gray-500">({item.count}社)</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 月間レポート */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">月間サマリー</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">新規登録CFO</p>
                  <p className="text-2xl font-bold text-blue-600">23</p>
                  <p className="text-xs text-green-600">+15% 前月比</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">新規登録企業</p>
                  <p className="text-2xl font-bold text-green-600">34</p>
                  <p className="text-xs text-green-600">+22% 前月比</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">マッチング成立</p>
                  <p className="text-2xl font-bold text-purple-600">18</p>
                  <p className="text-xs text-green-600">+8% 前月比</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">契約完了</p>
                  <p className="text-2xl font-bold text-orange-600">12</p>
                  <p className="text-xs text-green-600">+5% 前月比</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}