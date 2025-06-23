'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [userRole, setUserRole] = useState<'cfo' | 'company_owner' | 'other_company'>('cfo') // デモ用
  const [isInterested, setIsInterested] = useState(false)
  const [showScoutModal, setShowScoutModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // サンプル企業詳細データ（v5.1仕様書準拠）
  const companyDetail = {
    id: 1,
    companyName: '株式会社テックスタート',
    businessName: 'AI-SaaSプラットフォーム開発',
    logo: '🏢',
    industry: 'IT・ソフトウェア',
    location: '東京都渋谷区',
    founded: '2018年',
    revenue: '年商8億円',
    employeeCount: '50名',
    website: 'https://techstart.co.jp',
    rating: 4.6,
    reviewCount: 8,
    
    // 概要タブ
    overview: {
      vision: '「AIで世界の仕事を変える」をミッションに、BtoB向けAI SaaSプラットフォームを展開しています。',
      business: 'SaaS型のAI分析ツールを企業向けに提供。データ解析の自動化により業務効率化を支援しています。現在、導入企業数は200社を超え、月間ARRは6,000万円に到達しています。',
      strengths: ['AIアルゴリズムの独自性', '高い顧客満足度（NPS 70+）', '豊富な導入実績', '優秀なエンジニアチーム'],
      challenges: ['急速な成長に対応する財務体制の構築', 'シリーズB調達に向けた準備', '投資家対応の強化']
    },
    
    // 課題タブ
    challenges: {
      primaryChallenges: ['資金調達', 'IPO準備', '投資家対応'],
      background: 'シリーズBラウンドでの10億円調達を2024年Q3に予定しており、VCとの交渉や株主総会対応、DD（デューデリジェンス）準備が急務となっています。また、将来的なIPOも視野に入れた財務・内部統制体制の構築が必要です。',
      specificNeeds: [
        'VC・投資家との交渉サポート',
        '資金調達資料の作成支援',
        '財務DD対応の体制構築',
        '月次・四半期決算の精度向上',
        'KPI管理システムの強化',
        '内部統制システムの設計'
      ],
      urgency: 'high',
      timeline: '2024年4月開始（調達完了まで約6ヶ月）'
    },
    
    // 条件タブ
    conditions: {
      cfoRequirements: [
        '上場企業でのIR・投資家対応経験必須',
        'VC調達経験（シリーズB以降）',
        'SaaS/IT業界での財務経験',
        'DD対応経験',
        'IPO準備経験があれば尚良',
        'English business level（海外投資家対応）'
      ],
      workStyle: 'ハイブリッド（週2-3日出社 + リモート）',
      commitment: '週2日〜（調達期間中は週3日）',
      duration: '長期契約希望（最低1年、IPOまで継続可能であれば優遇）',
      compensation: '月100万円〜150万円（経験・スキルにより調整）',
      benefits: ['ストックオプション付与検討', '成功報酬あり', '交通費全額支給'],
      startDate: '2024年4月1日〜（応相談）',
      reportingLine: 'CEO直轄、取締役会への参加'
    },
    
    // レビュー（サンプル）
    reviews: [
      {
        id: 1,
        reviewer: '田中CFO',
        rating: 5,
        date: '2024-01-10',
        period: '6ヶ月',
        comment: '非常にやりがいのあるプロジェクトでした。経営陣のビジョンが明確で、CFOとして戦略的に関われました。',
        pros: ['経営陣の意思決定が早い', 'データドリブンな文化', '成長性が高い'],
        cons: ['初期は業務範囲が曖昧', '急成長による業務量の多さ']
      },
      {
        id: 2,
        reviewer: '佐藤CFO',
        rating: 4,
        date: '2023-12-15',
        period: '8ヶ月',
        comment: 'スタートアップらしいスピード感で、多くのことを学べました。財務基盤の構築にやりがいを感じました。',
        pros: ['新しい挑戦ができる', 'チームワークが良い', '技術力が高い'],
        cons: ['稼働時間が予想より多め', '制度整備が追いついていない']
      }
    ]
  }

  const tabs = [
    { id: 'overview', label: '概要', icon: '📋' },
    { id: 'challenges', label: '課題', icon: '🎯' },
    { id: 'conditions', label: '条件', icon: '📄' },
    { id: 'reviews', label: 'レビュー', icon: '⭐' }
  ]

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleInterested = () => {
    setIsInterested(!isInterested)
    showToastMessage(isInterested ? '気になるから削除しました' : '気になるに追加しました ❤️')
  }

  const handleScout = () => {
    setShowScoutModal(true)
  }

  const sendScout = () => {
    showToastMessage(`${companyDetail.companyName}に応募しました`)
    setShowScoutModal(false)
  }

  // v5.1仕様書のCTA権限に基づく表示制御
  const renderActionButtons = () => {
    if (userRole === 'company_owner') {
      return (
        <div className="flex space-x-3">
          <button className="flex-1 lg:flex-none px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            編集
          </button>
        </div>
      )
    }
    
    if (userRole === 'cfo') {
      return (
        <div className="flex space-x-3">
          <button 
            onClick={handleInterested}
            className={`flex-1 lg:flex-none px-6 py-3 border font-medium transition-all duration-200 rounded-lg ${
              isInterested
                ? 'border-pink-500 bg-pink-50 text-pink-700 hover:bg-pink-100'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            {isInterested ? '❤️ 気になる' : '🤍 気になる'}
          </button>
          <button 
            onClick={handleScout}
            className="flex-1 lg:flex-none px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            応募する
          </button>
        </div>
      )
    }
    
    // other_company の場合はCTA非表示
    return null
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">ビジョン・ミッション</h3>
              <p className="text-gray-700 leading-relaxed">{companyDetail.overview.vision}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">事業説明</h3>
              <p className="text-gray-700 leading-relaxed">{companyDetail.overview.business}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">強み・特徴</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {companyDetail.overview.strengths.map((strength, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <span className="text-green-500 mr-2">✓</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">現在の主な課題</h3>
              <ul className="space-y-2">
                {companyDetail.overview.challenges.map((challenge, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <span className="text-orange-500 mr-2">●</span>
                    {challenge}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      
      case 'challenges':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">主要な財務課題</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {companyDetail.challenges.primaryChallenges.map((challenge) => (
                  <span key={challenge} className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded-full border border-red-200">
                    {challenge}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">課題の背景・状況</h3>
              <p className="text-gray-700 leading-relaxed">{companyDetail.challenges.background}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">具体的に必要な支援</h3>
              <ul className="space-y-2">
                {companyDetail.challenges.specificNeeds.map((need, index) => (
                  <li key={index} className="flex items-start text-gray-700">
                    <span className="text-blue-500 mr-3 mt-1">‣</span>
                    {need}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-orange-600 text-lg mr-2">⚡</span>
                <h4 className="font-semibold text-orange-900">緊急度・タイムライン</h4>
              </div>
              <p className="text-orange-800">{companyDetail.challenges.timeline}</p>
            </div>
          </div>
        )
      
      case 'conditions':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">CFOに求める要件</h3>
              <ul className="space-y-2">
                {companyDetail.conditions.cfoRequirements.map((req, index) => (
                  <li key={index} className="flex items-start text-gray-700">
                    <span className="text-blue-500 mr-3 mt-1">‣</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">稼働条件</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div><strong>勤務形態:</strong> {companyDetail.conditions.workStyle}</div>
                  <div><strong>稼働頻度:</strong> {companyDetail.conditions.commitment}</div>
                  <div><strong>契約期間:</strong> {companyDetail.conditions.duration}</div>
                  <div><strong>開始時期:</strong> {companyDetail.conditions.startDate}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">報酬・待遇</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div><strong>月額報酬:</strong> {companyDetail.conditions.compensation}</div>
                  <div><strong>その他:</strong></div>
                  <ul className="ml-4 space-y-1">
                    {companyDetail.conditions.benefits.map((benefit, index) => (
                      <li key={index}>• {benefit}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">ポジション</h4>
              <p className="text-blue-800">{companyDetail.conditions.reportingLine}</p>
            </div>
          </div>
        )
      
      case 'reviews':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">CFOからのレビュー</h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <span className="text-yellow-400 text-lg">★</span>
                  <span className="font-semibold text-gray-900 ml-1">{companyDetail.rating}</span>
                </div>
                <span className="text-gray-500">({companyDetail.reviewCount}件)</span>
              </div>
            </div>
            
            <div className="space-y-6">
              {companyDetail.reviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{review.reviewer}</h4>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span 
                              key={i} 
                              className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        稼働期間: {review.period} | {review.date}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{review.comment}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium text-green-700 mb-2">良かった点</h5>
                      <ul className="space-y-1">
                        {review.pros.map((pro, index) => (
                          <li key={index} className="flex items-center text-green-600">
                            <span className="mr-2">+</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-orange-700 mb-2">改善点</h5>
                      <ul className="space-y-1">
                        {review.cons.map((con, index) => (
                          <li key={index} className="flex items-center text-orange-600">
                            <span className="mr-2">-</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader isLoggedIn={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* 企業ヘッダー */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
                {companyDetail.logo}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{companyDetail.companyName}</h1>
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="text-lg font-medium text-gray-900 ml-1">{companyDetail.rating}</span>
                  </div>
                </div>
                <p className="text-lg text-gray-600 mb-2">{companyDetail.businessName}</p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <span>{companyDetail.industry}</span>
                  <span>•</span>
                  <span>{companyDetail.location}</span>
                  <span>•</span>
                  <span>{companyDetail.employeeCount}</span>
                  <div className="flex flex-wrap gap-1 ml-4">
                    {companyDetail.challenges.primaryChallenges.map((challenge) => (
                      <span key={challenge} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                        {challenge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* CTA権限別表示 */}
            {renderActionButtons()}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* メインコンテンツ */}
          <div className="lg:w-2/3">
            {/* タブナビゲーション */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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
              
              {/* タブコンテンツ */}
              <div className="p-6">
                {renderTabContent()}
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">会社基本情報</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">設立</span>
                  <span className="text-gray-900">{companyDetail.founded}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">売上</span>
                  <span className="text-gray-900">{companyDetail.revenue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">従業員数</span>
                  <span className="text-gray-900">{companyDetail.employeeCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">業界</span>
                  <span className="text-gray-900">{companyDetail.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">所在地</span>
                  <span className="text-gray-900">{companyDetail.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ウェブサイト</span>
                  <a href={companyDetail.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    公式サイト
                  </a>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">レビュー評価</span>
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="font-medium text-gray-900 ml-1">{companyDetail.rating}</span>
                    <span className="text-sm text-gray-500 ml-1">({companyDetail.reviewCount}件)</span>
                  </div>
                </div>
                
                {/* 評価分布（簡易版） */}
                <div className="space-y-1">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center text-xs">
                      <span className="w-2 text-gray-500">{rating}</span>
                      <span className="text-yellow-400 mx-1">★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5 mx-2">
                        <div 
                          className="bg-yellow-400 h-1.5 rounded-full"
                          style={{ width: `${rating === 5 ? 60 : rating === 4 ? 30 : rating === 3 ? 10 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-500 w-6 text-right">
                        {rating === 5 ? '5' : rating === 4 ? '2' : rating === 3 ? '1' : '0'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast通知 */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* 応募モーダル */}
      {showScoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">📝 応募確認</h3>
              <button 
                onClick={() => setShowScoutModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                  {companyDetail.logo}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{companyDetail.companyName}</p>
                  <p className="text-sm text-gray-600">{companyDetail.businessName}</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">この企業に応募しますか？</p>
              
              <textarea
                placeholder="応募メッセージを入力してください..."
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm resize-none"
              />
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowScoutModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm"
              >
                キャンセル
              </button>
              <button 
                onClick={sendScout}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                応募
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}