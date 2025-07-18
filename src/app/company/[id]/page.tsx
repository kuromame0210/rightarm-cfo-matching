'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'
import { useAuth } from '@/lib/hooks/useAuth'

export const dynamic = 'force-dynamic'

export default function CompanyDetailPage() {
  const { user, isAuthenticated } = useAuth()
  const params = useParams()
  const router = useRouter()
  const companyId = params.id
  
  const [activeTab, setActiveTab] = useState('overview')
  const [userRole, setUserRole] = useState<'cfo' | 'company_owner' | 'other_company'>('cfo') // デモ用
  const [isInterested, setIsInterested] = useState(false)
  const [showScoutModal, setShowScoutModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [companyData, setCompanyData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // APIから企業データを取得
  const fetchCompanyData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/companies/${companyId}`)
      const data = await response.json()
      
      if (data.success) {
        setCompanyData(formatCompanyData(data.data))
      } else {
        console.error('企業データの取得に失敗:', data.error)
      }
    } catch (error) {
      console.error('企業データの取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }, [companyId])
  
  // 企業データをフォーマット
  const formatCompanyData = (company: any) => {
    console.log('Format company data:', company) // デバッグ用
    return {
      id: company.biz_user_id,
      companyName: company.biz_company_name || '',
      businessName: company.biz_company_name || '',
      logo: '🏢',
      industry: '-',  // 業界情報は提供されていない
      location: company.biz_location || '-',
      founded: '-',   // 設立年は提供されていない（創業25年のみ）
      revenue: company.biz_revenue_min && company.biz_revenue_max ? 
        `${(company.biz_revenue_min / 100000000).toFixed(0)}〜${(company.biz_revenue_max / 100000000).toFixed(0)}億円` : '-',
      employeeCount: '-',  // 従業員数は提供されていない
      website: '-',        // ウェブサイトは提供されていない
      rating: 0,           // レビューがないので0
      reviewCount: 0,
      
      overview: {
        vision: '',          // ビジョンは提供されていない
        business: company.biz_raw_profile || '',  // 会社概要のみ
        strengths: [],       // 強みは明示されていない
        challenges: company.biz_issues || []
      },
      
      challenges: {
        primaryChallenges: company.biz_issues || [],
        background: company.biz_raw_profile || '',
        specificNeeds: [],   // 具体的なニーズは提供されていない
        urgency: '-',        // 緊急度は提供されていない
        timeline: '-'        // タイムラインは提供されていない
      },
      
      conditions: {
        cfoRequirements: [], // CFO要件は提供されていない
        workStyle: '-',      // 勤務形態は提供されていない
        commitment: '-',     // 稼働頻度は提供されていない
        duration: '-',       // 契約期間は提供されていない
        compensation: '-',   // 報酬は提供されていない
        benefits: [],       // 福利厚生は提供されていない
        startDate: '-',     // 開始時期は提供されていない
        reportingLine: '-'  // 報告ラインは提供されていない
      },
      
      reviews: []
    }
  }
  
  useEffect(() => {
    if (companyId) {
      fetchCompanyData()
    }
  }, [companyId, fetchCompanyData])

  const tabs = [
    { id: 'overview', label: '概要', icon: '📋' },
    { id: 'challenges', label: '課題', icon: '🎯' },
    { id: 'conditions', label: '条件', icon: '📄' }
    // { id: 'reviews', label: 'レビュー', icon: '⭐' } // レビュー機能未実装のため一時的に非表示
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

  const sendScout = async () => {
    const messageInput = document.querySelector('textarea')?.value?.trim()
    
    if (!messageInput) {
      showToastMessage('応募メッセージを入力してください')
      return
    }

    if (!isAuthenticated) {
      showToastMessage('ログインが必要です')
      return
    }

    try {
      const response = await fetch('/api/scouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: companyId,
          recipientType: 'company',
          senderType: user?.userType || 'cfo',
          title: `${companyData?.companyName}への応募`,
          message: messageInput
        })
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        showToastMessage(`${companyData?.companyName}に応募しました`)
        setShowScoutModal(false)
      } else {
        console.error('応募送信API エラー:', response.status, data)
        showToastMessage(`エラー: ${data.error || '応募送信に失敗しました'}`)
      }
    } catch (error) {
      console.error('応募送信エラー:', error)
      showToastMessage('応募の送信に失敗しました')
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">企業データを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!companyData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">企業が見つかりません</h1>
          <Link href="/home" className="text-blue-600 hover:text-blue-800">
            ホームに戻る
          </Link>
        </div>
      </div>
    )
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
        <div className="flex space-x-2 md:space-x-3">
          <button 
            onClick={handleInterested}
            className={`flex-1 lg:flex-none px-3 py-2 md:px-4 md:py-2 border font-medium transition-all duration-200 rounded-lg text-xs md:text-sm ${
              isInterested
                ? 'border-pink-500 bg-pink-50 text-pink-700 hover:bg-pink-100'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            {isInterested ? '❤️ 気になる' : '🤍 気になる'}
          </button>
          <button 
            onClick={handleScout}
            className="flex-1 lg:flex-none px-3 py-2 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-xs md:text-sm"
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
          <div className="space-y-4 md:space-y-6">
            {companyData?.overview?.vision && (
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">ビジョン・ミッション</h3>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">{companyData.overview.vision}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">事業説明</h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">{companyData.overview.business}</p>
            </div>
            
            {companyData.overview.strengths.length > 0 && (
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">強み・特徴</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-2">
                  {companyData.overview.strengths.map((strength: string, index: number) => (
                    <li key={index} className="flex items-center text-sm md:text-base text-gray-700">
                      <span className="text-green-500 mr-1 md:mr-2">✓</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">現在の主な課題</h3>
              <ul className="space-y-1 md:space-y-2">
                {companyData.overview.challenges.map((challenge: string, index: number) => (
                  <li key={index} className="flex items-center text-sm md:text-base text-gray-700">
                    <span className="text-orange-500 mr-1 md:mr-2">●</span>
                    {challenge}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      
      case 'challenges':
        return (
          <div className="space-y-4 md:space-y-6">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">主要な財務課題</h3>
              <div className="flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-4">
                {companyData.challenges.primaryChallenges.map((challenge: string) => (
                  <span key={challenge} className="px-2 py-1 md:px-3 bg-red-50 text-red-700 text-xs md:text-sm rounded-full border border-red-200">
                    {challenge}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">課題の背景・状況</h3>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">{companyData.challenges.background}</p>
            </div>
            
            {companyData.challenges.specificNeeds.length > 0 && (
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">具体的に必要な支援</h3>
                <ul className="space-y-1 md:space-y-2">
                  {companyData.challenges.specificNeeds.map((need: string, index: number) => (
                    <li key={index} className="flex items-start text-sm md:text-base text-gray-700">
                      <span className="text-blue-500 mr-2 md:mr-3 mt-1">‣</span>
                      {need}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {companyData.challenges.timeline !== '-' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 md:p-4">
                <div className="flex items-center mb-2">
                  <span className="text-orange-600 text-base md:text-lg mr-2">⚡</span>
                  <h4 className="font-semibold text-orange-900 text-sm md:text-base">緊急度・タイムライン</h4>
                </div>
                <p className="text-orange-800 text-sm md:text-base">{companyData.challenges.timeline}</p>
              </div>
            )}
          </div>
        )
      
      case 'conditions':
        return (
          <div className="space-y-4 md:space-y-6">
            {companyData.conditions.cfoRequirements.length > 0 && (
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">CFOに求める要件</h3>
                <ul className="space-y-1 md:space-y-2">
                  {companyData.conditions.cfoRequirements.map((req: string, index: number) => (
                    <li key={index} className="flex items-start text-sm md:text-base text-gray-700">
                      <span className="text-blue-500 mr-2 md:mr-3 mt-1">‣</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">稼働条件</h4>
                <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-700">
                  <div><strong>勤務形態:</strong> {companyData.conditions.workStyle}</div>
                  <div><strong>稼働頻度:</strong> {companyData.conditions.commitment}</div>
                  <div><strong>契約期間:</strong> {companyData.conditions.duration}</div>
                  <div><strong>開始時期:</strong> {companyData.conditions.startDate}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">報酬・待遇</h4>
                <div className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-700">
                  <div><strong>月額報酬:</strong> {companyData.conditions.compensation}</div>
                  {companyData.conditions.benefits.length > 0 && (
                    <>
                      <div><strong>その他:</strong></div>
                      <ul className="ml-3 md:ml-4 space-y-1">
                        {companyData.conditions.benefits.map((benefit: string, index: number) => (
                          <li key={index}>• {benefit}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {companyData.conditions.reportingLine !== '-' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4">
                <h4 className="font-semibold text-blue-900 mb-2 text-sm md:text-base">ポジション</h4>
                <p className="text-blue-800 text-sm md:text-base">{companyData.conditions.reportingLine}</p>
              </div>
            )}
          </div>
        )
      
      case 'reviews':
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">CFOからのレビュー</h3>
              {companyData.rating > 0 ? (
                <div className="flex items-center space-x-1 md:space-x-2">
                  <div className="flex items-center">
                    <span className="text-yellow-400 text-sm md:text-lg">★</span>
                    <span className="font-semibold text-gray-900 ml-1 text-sm md:text-base">{companyData.rating}</span>
                  </div>
                  <span className="text-gray-500 text-xs md:text-sm">({companyData.reviewCount}件)</span>
                </div>
              ) : (
                <span className="text-gray-500 text-xs md:text-sm">レビューなし</span>
              )}
            </div>
            
            <div className="space-y-4 md:space-y-6">
              {companyData.reviews.length > 0 ? companyData.reviews.map((review: any) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-3 md:p-4">
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 text-sm md:text-base">{review.reviewer}</h4>
                        <div className="flex">
                          {[...Array(5)].map((_: any, i: number) => (
                            <span 
                              key={i} 
                              className={`text-xs md:text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-xs md:text-sm text-gray-500">
                        稼働期間: {review.period} | {review.date}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4">{review.comment}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 text-xs md:text-sm">
                    <div>
                      <h5 className="font-medium text-green-700 mb-1 md:mb-2 text-xs md:text-sm">良かった点</h5>
                      <ul className="space-y-1">
                        {review.pros.map((pro: string, index: number) => (
                          <li key={index} className="flex items-start text-green-600">
                            <span className="mr-2 mt-0.5">+</span>
                            <span className="flex-1">{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-orange-700 mb-1 md:mb-2 text-xs md:text-sm">改善点</h5>
                      <ul className="space-y-1">
                        {review.cons.map((con: string, index: number) => (
                          <li key={index} className="flex items-start text-orange-600">
                            <span className="mr-2 mt-0.5">-</span>
                            <span className="flex-1">{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">💬</div>
                  <p className="text-gray-500">まだレビューはありません</p>
                  <p className="text-sm text-gray-400 mt-2">この企業で働いたCFOからのレビューがあると表示されます</p>
                </div>
              )}
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

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 md:py-8">
        {/* 企業ヘッダー */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-6 mb-3 md:mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 md:gap-6">
            <div className="flex items-start space-x-2 md:space-x-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xl md:text-3xl">
                {companyData.logo}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 md:space-x-3 mb-1 md:mb-2">
                  <h1 className="text-lg md:text-3xl font-bold text-gray-900">{companyData.companyName}</h1>
                  {/* レビュー機能未実装のため一時的に非表示
                  {companyData.rating > 0 && (
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm md:text-lg font-medium text-gray-900 ml-1">{companyData.rating}</span>
                    </div>
                  )}
                  */}
                </div>
                <p className="text-sm md:text-lg text-gray-600 mb-1 md:mb-2">{companyData.businessName}</p>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-500">
                  <span>{companyData.industry}</span>
                  <span>•</span>
                  <span>{companyData.location}</span>
                  <span>•</span>
                  <span>{companyData.employeeCount}</span>
                  <div className="flex flex-wrap gap-0.5 md:gap-1 ml-2 md:ml-4">
                    {companyData.challenges.primaryChallenges.map((challenge: string) => (
                      <span key={challenge} className="px-1.5 py-0.5 md:px-2 md:py-1 bg-red-50 text-red-700 text-xs rounded border border-red-200">
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

        <div className="flex flex-col lg:flex-row gap-3 md:gap-6">
          {/* メインコンテンツ */}
          <div className="lg:w-2/3">
            {/* タブナビゲーション */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-3 md:mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex overflow-x-auto">
                  {tabs.map((tab: any) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-1 md:space-x-2 px-3 py-2 md:px-6 md:py-4 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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
              <div className="p-3 md:p-6">
                {renderTabContent()}
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-6 sticky top-24">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-4">会社基本情報</h3>
              
              <div className="space-y-2 md:space-y-3 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">設立</span>
                  <span className="text-gray-900">{companyData.founded}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">売上</span>
                  <span className="text-gray-900">{companyData.revenue}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">従業員数</span>
                  <span className="text-gray-900">{companyData.employeeCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">業界</span>
                  <span className="text-gray-900">{companyData.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">所在地</span>
                  <span className="text-gray-900">{companyData.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">ウェブサイト</span>
                  <a href={companyData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    公式サイト
                  </a>
                </div>
              </div>
              
              {/* レビュー機能未実装のため一時的に非表示
              <div className="mt-3 md:mt-6 pt-3 md:pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-1 md:mb-2">
                  <span className="text-xs md:text-sm font-medium text-gray-700">レビュー評価</span>
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="font-medium text-gray-900 ml-1">{companyData.rating}</span>
                    <span className="text-xs md:text-sm text-gray-500 ml-1">({companyData.reviewCount}件)</span>
                  </div>
                </div>
                
                評価分布（簡易版）
                <div className="space-y-0.5 md:space-y-1">
                  {[5, 4, 3, 2, 1].map((rating: number) => (
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
              */}
            </div>
          </div>
        </div>
      </div>

      {/* Toast通知 */}
      {showToast && (
        <div className="fixed bottom-16 md:bottom-4 right-3 md:right-4 bg-gray-900 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg shadow-lg z-50 animate-fade-in text-xs md:text-sm">
          {toastMessage}
        </div>
      )}

      {/* 応募モーダル */}
      {showScoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 md:p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-4 md:p-6 transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">📝 応募確認</h3>
              <button 
                onClick={() => setShowScoutModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-3 md:mb-4">
              <div className="flex items-center space-x-2 md:space-x-3 mb-2 md:mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-full flex items-center justify-center text-base md:text-lg">
                  {companyData.logo}
                </div>
                <div>
                  <p className="font-medium text-sm md:text-base text-gray-900">{companyData.companyName}</p>
                  <p className="text-xs md:text-sm text-gray-600">{companyData.businessName}</p>
                </div>
              </div>
              
              <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">この企業に応募しますか？</p>
              
              <textarea
                placeholder="応募メッセージを入力してください..."
                className="w-full h-20 md:h-24 px-2 py-1.5 md:px-3 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs md:text-sm resize-none"
              />
            </div>
            
            <div className="flex space-x-2 md:space-x-3">
              <button 
                onClick={() => setShowScoutModal(false)}
                className="flex-1 px-3 py-1.5 md:px-4 md:py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-xs md:text-sm"
              >
                キャンセル
              </button>
              <button 
                onClick={sendScout}
                className="flex-1 px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs md:text-sm"
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