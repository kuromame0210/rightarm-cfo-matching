'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

export default function ActivityPage() {
  const [selectedTab, setSelectedTab] = useState<'all' | 'scouts' | 'messages' | 'meetings'>('all')

  // サンプルアクティビティデータ
  const activities = [
    {
      id: 1,
      type: 'scout_received',
      title: '新しいスカウトを受信',
      description: '株式会社テックスタートからIPO準備CFOのスカウトが届きました',
      from: '株式会社テックスタート',
      timestamp: '2024年1月15日 14:30',
      status: 'unread',
      icon: '📨',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      id: 2,
      type: 'message_sent',
      title: 'メッセージを送信',
      description: '山田太郎さんとの面談日程について返信しました',
      from: '山田 太郎',
      timestamp: '2024年1月15日 10:45',
      status: 'read',
      icon: '💬',
      color: 'bg-green-50 border-green-200'
    },
    {
      id: 3,
      type: 'meeting_scheduled',
      title: '面談が予定されました',
      description: '地方物流株式会社との初回面談が2024年1月25日に設定されました',
      from: '地方物流株式会社',
      timestamp: '2024年1月14日 16:20',
      status: 'read',
      icon: '📅',
      color: 'bg-purple-50 border-purple-200'
    },
    {
      id: 4,
      type: 'profile_viewed',
      title: 'プロフィールが閲覧されました',
      description: '5名の企業担当者があなたのプロフィールを閲覧しました',
      from: '',
      timestamp: '2024年1月14日 09:15',
      status: 'read',
      icon: '👀',
      color: 'bg-gray-50 border-gray-200'
    },
    {
      id: 5,
      type: 'scout_sent',
      title: 'スカウトを送信',
      description: '製造業XYZ株式会社に管理会計システム導入支援の提案を送信しました',
      from: '製造業XYZ株式会社',
      timestamp: '2024年1月13日 15:30',
      status: 'read',
      icon: '🎯',
      color: 'bg-orange-50 border-orange-200'
    },
    {
      id: 6,
      type: 'scout_accepted',
      title: 'スカウトが承諾されました',
      description: '田中花子さんがあなたのスカウトを承諾しました',
      from: '田中 花子',
      timestamp: '2024年1月12日 11:00',
      status: 'read',
      icon: '✅',
      color: 'bg-green-50 border-green-200'
    },
    {
      id: 7,
      type: 'meeting_completed',
      title: '面談が完了しました',
      description: 'フードテック合同会社との補助金申請サポート面談が完了しました',
      from: 'フードテック合同会社',
      timestamp: '2024年1月12日 14:00',
      status: 'read',
      icon: '✅',
      color: 'bg-gray-50 border-gray-200'
    },
    {
      id: 8,
      type: 'profile_updated',
      title: 'プロフィールを更新',
      description: 'スキル情報と希望条件を更新しました',
      from: '',
      timestamp: '2024年1月10日 16:45',
      status: 'read',
      icon: '📝',
      color: 'bg-gray-50 border-gray-200'
    }
  ]

  const filteredActivities = activities.filter(activity => {
    if (selectedTab === 'all') return true
    if (selectedTab === 'scouts') return activity.type.includes('scout')
    if (selectedTab === 'messages') return activity.type.includes('message')
    if (selectedTab === 'meetings') return activity.type.includes('meeting')
    return true
  })

  const tabs = [
    { id: 'all', name: 'すべて', count: activities.length },
    { id: 'scouts', name: 'スカウト', count: activities.filter(a => a.type.includes('scout')).length },
    { id: 'messages', name: 'メッセージ', count: activities.filter(a => a.type.includes('message')).length },
    { id: 'meetings', name: '面談', count: activities.filter(a => a.type.includes('meeting')).length }
  ]

  const getTypeText = (type: string) => {
    switch (type) {
      case 'scout_received': return 'スカウト受信'
      case 'scout_sent': return 'スカウト送信'
      case 'scout_accepted': return 'スカウト承諾'
      case 'message_sent': return 'メッセージ送信'
      case 'message_received': return 'メッセージ受信'
      case 'meeting_scheduled': return '面談予定'
      case 'meeting_completed': return '面談完了'
      case 'profile_viewed': return 'プロフィール閲覧'
      case 'profile_updated': return 'プロフィール更新'
      default: return 'その他'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader isLoggedIn={true} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 mb-6 md:mb-0">
        {/* ページタイトル */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">アクティビティ</h2>
          <p className="text-gray-600 text-sm md:text-base">あなたの活動履歴を確認できます</p>
        </div>

        {/* サマリー統計 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">8</div>
            <div className="text-sm text-gray-600">今週の活動</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">3</div>
            <div className="text-sm text-gray-600">新着スカウト</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">2</div>
            <div className="text-sm text-gray-600">面談予定</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">15</div>
            <div className="text-sm text-gray-600">プロフィール閲覧</div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    selectedTab === tab.id
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* アクティビティリスト */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredActivities.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className={`p-4 md:p-6 hover:bg-gray-50 transition-colors border-l-4 ${activity.color}`}>
                  <div className="flex items-start space-x-3 md:space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-sm border">
                        <span className="text-lg md:text-xl">{activity.icon}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-sm md:text-base font-medium text-gray-900 mb-1">
                            {activity.title}
                            {activity.status === 'unread' && (
                              <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                          {activity.from && (
                            <p className="text-xs text-gray-500 mb-2">
                              <span className="font-medium">関連:</span> {activity.from}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            {getTypeText(activity.type)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{activity.timestamp}</span>
                        
                        {(activity.type === 'scout_received' || activity.type === 'message_sent') && (
                          <div className="flex space-x-2">
                            {activity.type === 'scout_received' && (
                              <Link href="/scout" className="text-xs text-blue-600 hover:text-blue-800">
                                詳細を見る
                              </Link>
                            )}
                            {activity.type === 'message_sent' && (
                              <Link href="/messages" className="text-xs text-blue-600 hover:text-blue-800">
                                メッセージを見る
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-500 mb-2">アクティビティがありません</p>
              <p className="text-sm text-gray-400">スカウトやメッセージなどの活動が表示されます</p>
            </div>
          )}
        </div>

        {/* ページネーション */}
        {filteredActivities.length > 0 && (
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50" disabled>
                前へ
              </button>
              <button className="px-3 py-2 text-sm bg-gray-900 text-white rounded">
                1
              </button>
              <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
                2
              </button>
              <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
                次へ
              </button>
            </div>
          </div>
        )}

        {/* フィルター・設定 */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">アクティビティ設定</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                表示期間
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500">
                <option>すべて</option>
                <option>過去1週間</option>
                <option>過去1ヶ月</option>
                <option>過去3ヶ月</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                並び順
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500">
                <option>新しい順</option>
                <option>古い順</option>
                <option>重要度順</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-2">
            <button className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm">
              設定を適用
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">
              データをエクスポート
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}