'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CFODashboardPage() {
  const [activeTab, setActiveTab] = useState('opportunities')

  // サンプル案件データ
  const opportunities = [
    {
      id: 1,
      companyName: '株式会社テックイノベーション',
      industry: 'IT・ソフトウェア',
      challenges: ['資金調達', 'IPO準備'],
      budgetRange: '100〜200万円',
      location: '東京都',
      description: '急成長中のSaaS企業です。シリーズA調達に向けた財務体制の構築をお願いします。',
      employees: '30名',
      founded: '2020年',
      urgency: 'high',
      postedDate: '2日前'
    },
    {
      id: 2,
      companyName: '株式会社グロースパートナーズ',
      industry: 'コンサルティング',
      challenges: ['管理会計', '財務DX'],
      budgetRange: '50〜100万円',
      location: '大阪府',
      description: 'コンサルティング事業の拡大に伴い、管理会計システムの導入・運用をお任せします。',
      employees: '15名',
      founded: '2019年',
      urgency: 'medium',
      postedDate: '1週間前'
    },
    {
      id: 3,
      companyName: '株式会社スマートソリューション',
      industry: 'メーカー',
      challenges: ['事業再生', 'M&A支援'],
      budgetRange: '200万円〜',
      location: '愛知県',
      description: '事業再編に向けた財務戦略の立案と実行をサポートしていただけるCFOを求めています。',
      employees: '80名',
      founded: '2015年',
      urgency: 'high',
      postedDate: '3日前'
    }
  ]

  const applications = [
    {
      id: 1,
      companyName: '株式会社フューチャーテック',
      status: 'pending',
      appliedDate: '2024-01-15',
      lastUpdate: '応募受付中'
    },
    {
      id: 2,
      companyName: '株式会社イノベーション',
      status: 'interview',
      appliedDate: '2024-01-10',
      lastUpdate: '面談調整中'
    },
    {
      id: 3,
      companyName: '株式会社ビジネスソリューション',
      status: 'contracted',
      appliedDate: '2024-01-05',
      lastUpdate: '契約締結済み'
    }
  ]

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'interview': return 'bg-blue-100 text-blue-800'
      case 'contracted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '応募中'
      case 'interview': return '面談中'
      case 'contracted': return '契約済み'
      case 'rejected': return '不採用'
      default: return status
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
              <span className="text-sm text-gray-600">CFOダッシュボード</span>
            </div>
            
            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/cfo-dashboard" className="text-gray-900 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                案件一覧
              </Link>
              <Link href="/cfo-messages" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                メッセージ
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">2</span>
              </button>
              
              <Link href="/cfo-profile" className="w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors">
                <span className="text-sm font-medium">CFO</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ウェルカムセクション */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-2">おかえりなさい、田中さん</h2>
          <p className="text-blue-100">新しい案件が3件、メッセージが2件届いています。</p>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('opportunities')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'opportunities'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                新着案件 ({opportunities.length})
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'applications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                応募履歴 ({applications.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* 新着案件タブ */}
            {activeTab === 'opportunities' && (
              <div className="space-y-6">
                {opportunities.map(opportunity => (
                  <div key={opportunity.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{opportunity.companyName}</h3>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(opportunity.urgency)}`}>
                            {opportunity.urgency === 'high' ? '急募' : opportunity.urgency === 'medium' ? '通常' : '長期'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span>{opportunity.industry}</span>
                          <span>•</span>
                          <span>{opportunity.location}</span>
                          <span>•</span>
                          <span>{opportunity.employees}</span>
                          <span>•</span>
                          <span>設立{opportunity.founded}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900 mb-1">{opportunity.budgetRange}</div>
                        <div className="text-sm text-gray-500">{opportunity.postedDate}</div>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{opportunity.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {opportunity.challenges.map(challenge => (
                          <span key={challenge} className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {challenge}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex space-x-3">
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          詳細を見る
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          応募する
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 応募履歴タブ */}
            {activeTab === 'applications' && (
              <div className="space-y-4">
                {applications.map(application => (
                  <div key={application.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{application.companyName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>応募日: {application.appliedDate}</span>
                          <span>•</span>
                          <span>{application.lastUpdate}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                          {getStatusText(application.status)}
                        </span>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          詳細
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* モバイルフッターナビゲーション */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <Link href="/cfo-dashboard" className="flex flex-col items-center py-2 text-blue-600">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
            </svg>
            <span className="text-xs">案件</span>
          </Link>
          <Link href="/cfo-messages" className="flex flex-col items-center py-2 text-gray-600">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.991 8.991 0 01-4.683-1.317L3 21l2.317-5.317A8.991 8.991 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
            <span className="text-xs">メッセージ</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}