'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'
import { useInterests } from '@/lib/interests-context'
import { useAuth } from '@/lib/hooks/useAuth'

export const dynamic = 'force-dynamic'
export default function CFODetailPage() {
  const { user, isAuthenticated } = useAuth()
  const params = useParams()
  const router = useRouter()
  const cfoId = params.id as string
  const { isInterested, toggleInterest } = useInterests()
  
  const [cfoData, setCfoData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showScoutModal, setShowScoutModal] = useState(false)
  const [scoutMessage, setScoutMessage] = useState('')
  
  // 気になるボタンのトグル（useInterests版）
  const handleToggleInterested = async () => {
    try {
      // 操作前の状態を記録
      const wasInterested = isInterested(cfoId)
      const success = await toggleInterest(cfoId, 'cfo')
      
      if (success) {
        // 操作内容に基づいてメッセージを決定
        const message = !wasInterested
          ? '気になるに追加しました ❤️' 
          : '気になるから削除しました'
        setToastMessage(message)
      } else {
        setToastMessage('操作に失敗しました')
      }
    } catch (error) {
      console.error('気になる機能エラー:', error)
      setToastMessage('エラーが発生しました')
    }
    
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // APIからCFOデータを取得
  const fetchCFOData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/cfos/${cfoId}`, {
        headers: {
          'Authorization': 'Bearer development-user-token'
        }
      })
      const data = await response.json()
      
      if (data.success) {
        setCfoData(formatCFOData(data.data))
      } else {
        console.error('CFOデータの取得に失敗:', data.error)
      }
    } catch (error) {
      console.error('CFOデータの取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }, [cfoId])
  
  // CFOデータをフォーマット（新しいAPIレスポンスに対応）
  const formatCFOData = (cfo: any) => {
    // 新しいAPIレスポンスは既にフォーマット済みなのでそのまま返す
    return cfo
  }
  
  useEffect(() => {
    if (cfoId) {
      fetchCFOData()
    }
  }, [cfoId, fetchCFOData])
  const [activeSection, setActiveSection] = useState('basic')
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">CFOデータを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!cfoData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">CFOが見つかりません</h1>
          <Link href="/home" className="text-blue-600 hover:text-blue-800">
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  const handleScout = () => {
    setShowScoutModal(true)
  }

  const sendScout = async () => {
    if (!scoutMessage.trim()) {
      showToastMessage('スカウトメッセージを入力してください')
      return
    }

    if (!isAuthenticated) {
      showToastMessage('ログインが必要です')
      return
    }

    try {
      const scoutData = {
        recipientId: cfoId,
        recipientType: 'cfo',
        senderType: user?.userType || 'company',
        title: `${cfoData.name}さんへのスカウト`,
        message: scoutMessage.trim()
      }
      
      console.log('Sending scout data:', scoutData)
      console.log('Current user:', user)
      
      const response = await fetch('/api/scouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scoutData)
      })

      const data = await response.json()
      console.log('Scout API response:', { status: response.status, data })
      
      if (response.ok && data.success) {
        showToastMessage(`${cfoData.name}さんにスカウトを送信しました`)
        setShowScoutModal(false)
        setScoutMessage('')
        // スカウト送信後、CFOデータを再取得してスカウト状態を更新
        fetchCFOData()
      } else {
        console.error('スカウト送信API エラー:', response.status, data)
        showToastMessage(`エラー: ${data.error || 'スカウト送信に失敗しました'}`)
      }
    } catch (error) {
      console.error('スカウト送信エラー:', error)
      showToastMessage('スカウトの送信に失敗しました')
    }
  }



  const sections = [
    { id: 'basic', label: '基本情報', icon: '📊' },
    { id: 'experience', label: '経歴・業務', icon: '💼' },
    { id: 'conditions', label: '稼働条件', icon: '⚙️' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">

        {/* パンくずリスト */}
        <nav className="mb-3 md:mb-6 text-xs md:text-sm">
          <Link href="/home" className="text-blue-600 hover:text-blue-800">
            ホーム
          </Link>
          <span className="mx-1 md:mx-2 text-gray-500">›</span>
          <span className="text-gray-700">{cfoData.name}</span>
        </nav>

        {/* モバイル用アクションボタン - 上部に配置 */}
        <div className="lg:hidden mb-3">
          <div className="bg-white rounded-lg shadow-sm border p-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleScout}
                disabled={!cfoData.canSendScout}
                className={`w-full min-h-[40px] px-3 py-2 rounded-lg transition-colors font-medium text-xs ${
                  cfoData.canSendScout
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                🎯 {cfoData.scoutStatusText || 'スカウトを送る'}
              </button>
              
              <button
                onClick={handleToggleInterested}
                className={`w-full min-h-[40px] px-3 py-2 border rounded-lg transition-colors font-medium text-xs ${
                  isInterested(cfoId)
                    ? 'border-pink-500 bg-pink-50 text-pink-700 hover:bg-pink-100'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isInterested(cfoId) ? '❤️ 気になる' : '🤍 気になる'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 mb-6 md:mb-0">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2">
            {/* CFOヘッダー */}
            <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6 mb-4 md:mb-6">
              <div className="flex flex-col md:flex-row md:items-start gap-3 md:gap-4">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {cfoData.avatarUrl ? (
                    <img 
                      src={cfoData.avatarUrl} 
                      alt={`${cfoData.name}のプロフィール画像`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl md:text-3xl">👤</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 md:mb-4">
                    <div>
                      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2">{cfoData.name}</h1>
                      <p className="text-sm md:text-base text-gray-600 mb-2 md:mb-3">
                        {cfoData.location && `所在地: ${cfoData.location}`}
                      </p>
                      <div className="flex flex-wrap gap-1 md:gap-2">
                        {cfoData.skills.map((skill: string) => (
                          <span key={skill} className="px-2 py-1 md:px-3 bg-blue-100 text-blue-800 text-xs md:text-sm rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap">{cfoData.introduction || '紹介文なし'}</p>
                </div>
              </div>
            </div>

            {/* ナビゲーションタブ */}
            <div className="bg-white rounded-lg shadow-sm border mb-4 md:mb-6">
              {/* 統一されたタブ形式（モバイル・PC共通） */}
              <nav className="flex border-b overflow-x-auto">
                {sections.map((section: any) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex-1 min-w-0 px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeSection === section.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-1 md:mr-2">{section.icon}</span>
                    <span className="hidden sm:inline">{section.label}</span>
                    <span className="sm:hidden">
                      {section.label === '基本情報' ? '基本' : 
                       section.label === '経歴・業務' ? '経歴' :
                       section.label === '稼働条件' ? '条件' : section.label}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* セクションコンテンツ */}
            <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
              {activeSection === 'basic' && (
                <div>
                  {/* 🆕 構造化された稼働条件（統合表示） */}
                  <div className="mb-8">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">💼 稼働条件・報酬</h3>
                    
                    {/* メイン構造化表示 */}
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
                      <table className="w-full">
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="px-4 py-3 bg-gray-50 font-medium text-gray-900 w-1/3">報酬体系</td>
                            <td className="px-4 py-3">
                              {cfoData.structured?.compensationType ? (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg font-medium">
                                      💰 {cfoData.structured.compensationType === 'monthly' ? '月額制' : '応相談'}
                                    </span>
                                    {cfoData.structured.compensationType === 'monthly' && cfoData.structured.monthlyFeeMin && (
                                      <span className="text-gray-700 font-semibold">
                                        {cfoData.structured.monthlyFeeMax && cfoData.structured.monthlyFeeMax !== cfoData.structured.monthlyFeeMin ? 
                                          `${Math.floor(cfoData.structured.monthlyFeeMin / 10000)}万円〜${Math.floor(cfoData.structured.monthlyFeeMax / 10000)}万円` : 
                                          `${Math.floor(cfoData.structured.monthlyFeeMin / 10000)}万円`}
                                      </span>
                                    )}
                                  </div>
                                  {/* 時給情報 */}
                                  {(cfoData.structured.hourlyRateMin || cfoData.structured.hourlyRateMax) && (
                                    <div className="flex items-center gap-2">
                                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                                        ⏰ 時給
                                      </span>
                                      <span className="text-gray-700 text-sm">
                                        {cfoData.structured.hourlyRateMin && Math.floor(cfoData.structured.hourlyRateMin / 100) / 10}万円
                                        {cfoData.structured.hourlyRateMax && cfoData.structured.hourlyRateMax !== cfoData.structured.hourlyRateMin ? 
                                          `〜${Math.floor(cfoData.structured.hourlyRateMax / 100) / 10}万円` : '〜'}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-500">未設定</span>
                              )}
                            </td>
                          </tr>
                          
                          <tr>
                            <td className="px-4 py-3 bg-gray-50 font-medium text-gray-900">稼働時間</td>
                            <td className="px-4 py-3">
                              <div className="space-y-2">
                                {/* 週稼働日数 */}
                                {cfoData.structured?.weeklyDays ? (
                                  <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg font-medium">
                                      📅 週{cfoData.structured.weeklyDays}日
                                    </span>
                                    {cfoData.structured.weeklyDaysFlexible && (
                                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">
                                        応相談可
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-500 text-sm">週稼働日数: 未設定</span>
                                )}
                                
                                {/* 日稼働時間 */}
                                {cfoData.structured?.dailyHours ? (
                                  <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg font-medium">
                                      ⏰ 日{cfoData.structured.dailyHours}時間
                                    </span>
                                    {cfoData.structured.dailyHoursFlexible && (
                                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded">
                                        応相談可
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-500 text-sm">日稼働時間: 未設定</span>
                                )}
                              </div>
                            </td>
                          </tr>
                          
                          <tr>
                            <td className="px-4 py-3 bg-gray-50 font-medium text-gray-900">対応エリア</td>
                            <td className="px-4 py-3">
                              {cfoData.structured?.supportedPrefectures && cfoData.structured.supportedPrefectures.length > 0 ? (
                                <div className="space-y-2">
                                  <div className="flex flex-wrap gap-1">
                                    {cfoData.structured.supportedPrefectures.map((region: string) => {
                                      const regionMap: { [key: string]: string } = {
                                        'kanto': '関東エリア',
                                        'kansai': '関西エリア',
                                        'chubu': '中部エリア',
                                        'tohoku': '東北エリア',
                                        'kyushu': '九州エリア',
                                        'nationwide': '全国対応'
                                      }
                                      return (
                                        <span key={region} className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded">
                                          🗺️ {regionMap[region] || region}
                                        </span>
                                      )
                                    })}
                                  </div>
                                  {cfoData.structured.fullRemoteAvailable && (
                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                                      💻 完全リモート対応可
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-500">未設定</span>
                              )}
                            </td>
                          </tr>
                          
                          <tr>
                            <td className="px-4 py-3 bg-gray-50 font-medium text-gray-900">居住地</td>
                            <td className="px-4 py-3 text-gray-700">
                              📍 {cfoData.location || '未設定'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    {/* 詳細条件（テキスト補完） */}
                    {(cfoData.compensation || cfoData.availability) && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2 text-sm">詳細条件・特記事項</h4>
                        <div className="space-y-2 text-sm text-gray-700">
                          {cfoData.compensation && (
                            <div>
                              <span className="font-medium">報酬に関する詳細:</span>
                              <p className="whitespace-pre-wrap">{cfoData.compensation}</p>
                            </div>
                          )}
                          {cfoData.availability && (
                            <div>
                              <span className="font-medium">稼働に関する詳細:</span>
                              <p className="whitespace-pre-wrap">{cfoData.availability}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 専門スキル */}
                  <div className="mb-6 md:mb-8">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">🎯 専門スキル</h3>
                    {cfoData.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {cfoData.skills.map((skill: string, index: number) => (
                          <span key={index} className={`px-3 py-2 text-sm rounded-lg ${
                            index < 3 ? 'bg-blue-100 text-blue-800 font-medium border border-blue-200' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm md:text-base text-gray-500">スキル情報なし</p>
                    )}
                  </div>

                  {/* CFO経験・レベル */}
                  <div className="mb-6 md:mb-8">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">👨‍💼 CFO経験・レベル</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* CFO経験年数 */}
                        <div>
                          <span className="text-gray-600 block mb-2 text-sm font-medium">CFO経験年数</span>
                          {cfoData.structured?.cfoExperienceYears ? (
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg font-medium">
                                📈 {cfoData.structured.cfoExperienceYears}年
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">未設定</span>
                          )}
                        </div>

                        {/* CFOレベル */}
                        <div>
                          <span className="text-gray-600 block mb-2 text-sm font-medium">CFOレベル</span>
                          {cfoData.structured?.cfoLevel ? (
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg font-medium">
                                ⭐ {(() => {
                                  const levelMap: { [key: string]: string } = {
                                    'assistant': 'アシスタント',
                                    'manager': 'マネージャー',
                                    'director': 'ディレクター',
                                    'cfo': 'CFO',
                                    'fractional': 'フラクショナルCFO'
                                  }
                                  return levelMap[cfoData.structured.cfoLevel] || cfoData.structured.cfoLevel
                                })()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">未設定</span>
                          )}
                        </div>
                      </div>

                      {/* 業界経験 */}
                      {cfoData.structured?.industryExperience && cfoData.structured.industryExperience.length > 0 && (
                        <div className="mt-4">
                          <span className="text-gray-600 block mb-2 text-sm font-medium">業界経験</span>
                          <div className="flex flex-wrap gap-1">
                            {cfoData.structured.industryExperience.map((industry: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                                🏢 {industry}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 企業規模経験 */}
                      {cfoData.structured?.companySizeExperience && cfoData.structured.companySizeExperience.length > 0 && (
                        <div className="mt-4">
                          <span className="text-gray-600 block mb-2 text-sm font-medium">企業規模経験</span>
                          <div className="flex flex-wrap gap-1">
                            {cfoData.structured.companySizeExperience.map((size: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                📊 {size}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* プロジェクト経験 */}
                      {cfoData.structured?.projectExperience && cfoData.structured.projectExperience.length > 0 && (
                        <div className="mt-4">
                          <span className="text-gray-600 block mb-2 text-sm font-medium">プロジェクト経験</span>
                          <div className="flex flex-wrap gap-1">
                            {cfoData.structured.projectExperience.map((project: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                🚀 {project}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 保有資格 */}
                  <div className="mb-6 md:mb-8">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">🏅 保有資格</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap">
                        {cfoData.certifications || '資格情報なし'}
                      </p>
                    </div>
                  </div>

                  {/* 紹介文 */}
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">📝 紹介文</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {cfoData.introduction || '紹介文なし'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'experience' && (
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">詳細経歴</h3>
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 md:mb-8">
                    <p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap">
                      {cfoData.rawProfile || '詳細経歴情報がありません'}
                    </p>
                  </div>

                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">可能な業務</h3>
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 md:mb-8">
                    <p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap">
                      {cfoData.possibleTasks || '業務内容情報がありません'}
                    </p>
                  </div>

                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">対応可能エリア</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap">
                      {cfoData.workingAreas || '対応エリア情報がありません'}
                    </p>
                  </div>
                </div>
              )}


              {activeSection === 'conditions' && (
                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">⚙️ 対応可能性・詳細条件</h3>
                  
                  {/* 詳細勤務条件 */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">詳細勤務条件</h4>
                    <div className="space-y-4">
                      {/* 勤務形態（リモート情報は対応エリアセクションにあるので除外） */}
                      {cfoData.structured?.workStyles && cfoData.structured.workStyles.length > 0 && (
                        <div>
                          <span className="text-gray-600 block mb-2 text-sm font-medium">勤務形態</span>
                          <div className="flex flex-wrap gap-2">
                            {cfoData.structured.workStyles.map((style: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                                {style}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 希望時間帯 */}
                      {cfoData.structured?.preferredTimeSlots && cfoData.structured.preferredTimeSlots.length > 0 && (
                        <div>
                          <span className="text-gray-600 block mb-2 text-sm font-medium">希望時間帯</span>
                          <div className="flex flex-wrap gap-2">
                            {cfoData.structured.preferredTimeSlots.map((timeSlot: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                                ⏰ {timeSlot}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 出張対応レベル */}
                      {cfoData.structured?.businessTripLevel && (
                        <div>
                          <span className="text-gray-600 block mb-2 text-sm font-medium">出張対応</span>
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-lg">
                            ✈️ {(() => {
                              const levelMap: { [key: string]: string } = {
                                'none': '出張なし',
                                'local': '近隣地域のみ',
                                'domestic': '国内出張可',
                                'international': '海外出張可'
                              }
                              return levelMap[cfoData.structured.businessTripLevel] || cfoData.structured.businessTripLevel
                            })()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 詳細条件（テキスト補完） */}
                  {(cfoData.compensation || cfoData.availability || cfoData.workingAreas) && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">詳細条件・特記事項</h4>
                      <div className="space-y-4">
                        {cfoData.compensation && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 mb-2 text-sm">報酬に関する詳細</h5>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{cfoData.compensation}</p>
                          </div>
                        )}
                        
                        {cfoData.availability && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 mb-2 text-sm">稼働に関する詳細</h5>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{cfoData.availability}</p>
                          </div>
                        )}
                        
                        {cfoData.workingAreas && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 mb-2 text-sm">エリアに関する詳細</h5>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{cfoData.workingAreas}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* サイドバー - PC専用 */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-4 lg:p-6 sticky top-24">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">アクション</h3>
              
              <div className="space-y-2 lg:space-y-3 mb-4 lg:mb-6">
                <button
                  onClick={handleScout}
                  disabled={!cfoData.canSendScout}
                  className={`w-full px-3 py-2 lg:px-4 lg:py-3 rounded-lg transition-colors font-medium text-sm lg:text-base ${
                    cfoData.canSendScout
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  🎯 {cfoData.scoutStatusText || 'スカウトを送る'}
                </button>
                
                <button
                  onClick={handleToggleInterested}
                  className={`w-full px-3 py-2 lg:px-4 lg:py-3 border rounded-lg transition-colors font-medium text-sm lg:text-base ${
                    isInterested(cfoId)
                      ? 'border-pink-500 bg-pink-50 text-pink-700 hover:bg-pink-100'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isInterested(cfoId) ? '❤️ 気になる' : '🤍 気になる'}
                </button>
                
              </div>

              <div className="border-t pt-3 lg:pt-4">
                <h4 className="font-medium text-gray-900 mb-3 text-sm lg:text-base">📊 概要情報</h4>
                
                {/* 🆕 簡潔なサマリー表示 */}
                <div className="space-y-3 text-xs lg:text-sm">
                  {/* 報酬サマリー */}
                  <div>
                    <span className="text-gray-600 block mb-1">報酬</span>
                    {cfoData.structured?.compensationType === 'monthly' && cfoData.structured.monthlyFeeMin ? (
                      <div className="text-gray-900 font-semibold">
                        {cfoData.structured.monthlyFeeMax && cfoData.structured.monthlyFeeMax !== cfoData.structured.monthlyFeeMin ? 
                          `${Math.floor(cfoData.structured.monthlyFeeMin / 10000)}万円〜${Math.floor(cfoData.structured.monthlyFeeMax / 10000)}万円` : 
                          `${Math.floor(cfoData.structured.monthlyFeeMin / 10000)}万円`}
                      </div>
                    ) : (
                      <p className="text-gray-500">応相談</p>
                    )}
                  </div>

                  {/* 稼働サマリー */}
                  <div>
                    <span className="text-gray-600 block mb-1">稼働</span>
                    {cfoData.structured?.weeklyDays ? (
                      <div className="text-gray-900">
                        週{cfoData.structured.weeklyDays}日
                        {cfoData.structured.weeklyDaysFlexible && <span className="text-blue-600">（応相談可）</span>}
                      </div>
                    ) : (
                      <p className="text-gray-500">未設定</p>
                    )}
                  </div>

                  {/* エリアサマリー */}
                  <div>
                    <span className="text-gray-600 block mb-1">エリア</span>
                    {cfoData.structured?.supportedPrefectures && cfoData.structured.supportedPrefectures.length > 0 ? (
                      <div className="text-gray-900">
                        {cfoData.structured.supportedPrefectures.slice(0, 1).map((region: string) => {
                          const regionMap: { [key: string]: string } = {
                            'kanto': '関東',
                            'kansai': '関西',
                            'chubu': '中部',
                            'tohoku': '東北',
                            'kyushu': '九州',
                            'nationwide': '全国'
                          }
                          return regionMap[region] || region
                        })}
                        {cfoData.structured.supportedPrefectures.length > 1 && ` 他${cfoData.structured.supportedPrefectures.length - 1}エリア`}
                        {cfoData.structured.fullRemoteAvailable && <div className="text-green-600 text-xs">💻 リモート可</div>}
                      </div>
                    ) : (
                      <p className="text-gray-500">未設定</p>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* スカウトモーダル */}
      {showScoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 md:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm md:max-w-md w-full p-4 md:p-6">
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900">🎯 スカウト送信</h3>
              <button 
                onClick={() => setShowScoutModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg md:text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-3 md:mb-4">
              <div className="flex items-center space-x-2 md:space-x-3 mb-2 md:mb-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {cfoData.avatarUrl ? (
                    <img 
                      src={cfoData.avatarUrl} 
                      alt={`${cfoData.name}のプロフィール画像`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-base md:text-lg">👤</span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm md:text-base">{cfoData.name}</p>
                  <p className="text-xs md:text-sm text-gray-600">
                    {cfoData.introduction || '経験豊富なCFOです'}
                  </p>
                </div>
              </div>
              
              <textarea
                value={scoutMessage}
                onChange={(e) => setScoutMessage(e.target.value)}
                placeholder="スカウトメッセージを入力してください..."
                className="w-full h-24 md:h-32 px-2 py-2 md:px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs md:text-sm resize-none"
              />
            </div>
            
            <div className="flex space-x-2 md:space-x-3">
              <button 
                onClick={() => setShowScoutModal(false)}
                className="flex-1 px-3 py-2 md:px-4 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-xs md:text-sm"
              >
                キャンセル
              </button>
              <button 
                onClick={sendScout}
                className="flex-1 px-3 py-2 md:px-4 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs md:text-sm"
              >
                送信
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {showToast && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  )
}