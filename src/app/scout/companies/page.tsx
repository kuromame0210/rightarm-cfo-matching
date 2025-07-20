'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AppHeader from '@/components/AppHeader'
import ScoutCard from '@/components/ScoutCard'
import { useAuth } from '@/lib/hooks/useAuth'
import { useInterests } from '@/lib/interests-context'
import Loading from '@/components/Loading'

export const dynamic = 'force-dynamic'

export default function ScoutCompaniesPage() {
  const { user, isAuthenticated } = useAuth()
  const { isInterested, toggleInterest } = useInterests()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedWorkStyle, setSelectedWorkStyle] = useState('')
  const [selectedCompensation, setSelectedCompensation] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [appliedCompanies, setAppliedCompanies] = useState<Set<string>>(new Set())
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })

  // 実際のAPIと連携したスキル・フィルターデータ
  const skillCategories = [
    'M&A支援', 'IPOサポート', '資金調達', '管理会計', '財務分析',
    '予算管理', '原価計算', '資金管理', '経営企画', '投資計画',
    '税務対応', '監査対応', '内部統制', '業績管理', '海外業務'
  ]

  const regions = [
    { id: 'all', name: '全国' },
    { id: 'kanto', name: '関東エリア' },
    { id: 'kansai', name: '関西エリア' },
    { id: 'chubu', name: '中部エリア' },
    { id: 'tohoku', name: '東北エリア' },
    { id: 'kyushu', name: '九州エリア' }
  ]
  
  const workStyles = [
    { id: '1', name: '週1日' },
    { id: '2', name: '週2日' },
    { id: '3', name: '週3日' },
    { id: '4', name: '週4日' },
    { id: '5', name: '週5日（フルタイム）' }
  ]
  
  const compensationRanges = [
    '応相談', '月額制：20万円以下', '月額制：30万円以下', '月額制：50万円以下', 
    '月額制：80万円以下', '月額制：100万円以下', '月額制：150万円以下', 
    '月額制：200万円以下', '月額制：250万円以下'
  ]
  const sortOptions = [
    { value: 'newest', label: '新着順' },
    { value: 'compensation_high', label: '報酬高順' },
    { value: 'company_name', label: '会社名順' }
  ]

  // 企業データをAPIから取得する関数
  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      
      if (searchQuery) params.append('search', searchQuery)
      if (selectedRegion) params.append('revenue_range', selectedRegion)
      
      const response = await fetch(`/api/companies?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setCompanies(data.data)
        setPagination(data.pagination)
      } else {
        console.error('企業データの取得に失敗:', data.error)
        setCompanies([])
      }
    } catch (error) {
      console.error('企業データの取得エラー:', error)
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedRegion, pagination.page, pagination.limit])

  // 応募済み企業を取得する関数
  const fetchAppliedCompanies = useCallback(async () => {
    if (!isAuthenticated) return

    try {
      const response = await fetch('/api/scouts?type=sent')
      const data = await response.json()
      
      console.log('🔍 応募済み企業取得レスポンス:', data)
      
      if (data.success) {
        // type=sentの場合、data.sentに送信済みスカウトが入っている
        const sentScouts = data.data?.sent || []
        console.log('📤 送信済みスカウト:', sentScouts)
        const appliedSet = new Set<string>(
          sentScouts.map((scout: any) => String(scout.receiverId || scout.receiver_id))
        )
        setAppliedCompanies(appliedSet)
        console.log('✅ 応募済み企業セット:', appliedSet)
      }
    } catch (error) {
      console.error('応募済み企業の取得エラー:', error)
    }
  }, [isAuthenticated])

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  // 認証チェックと企業データ取得
  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/auth/login')
      return
    }
    
    if (isAuthenticated) {
      fetchCompanies()
      fetchAppliedCompanies()
    }
  }, [isAuthenticated, router, fetchCompanies, fetchAppliedCompanies])

  // 企業データをScoutCard形式に変換
  const formatCompanyAsScout = (company: any) => {
    return {
      id: company.id || company.biz_user_id,
      from: company.companyName || company.biz_company_name || '企業名未設定',
      to: user?.name || 'CFO',
      fromType: 'company',
      toType: 'cfo',
      title: `${company.companyName || company.biz_company_name || '企業'}への応募機会`,
      message: company.description || company.biz_raw_profile || '詳細は企業概要をご覧ください',
      receivedAt: company.created_at || new Date().toISOString(),
      sentAt: null,
      status: appliedCompanies.has(String(company.id || company.biz_user_id)) ? 'applied' : 'available', // 応募済みかスカウト可能か
      urgency: 'medium',
      compensation: company.revenueRange || '応相談',
      workStyle: '応相談',
      avatar: '🏢',
      senderUserId: company.id || company.biz_user_id,
      recipientUserId: user?.id
    }
  }

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // ScoutCard形式に変換された企業データ
  const scoutFormattedCompanies = companies.map(formatCompanyAsScout)
  
  // フィルタリング処理
  const filteredCompanies = scoutFormattedCompanies.filter(company => {
    const matchesSearch = searchQuery === '' || 
      company.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.message.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  // ソート処理
  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.receivedAt || '').getTime() - new Date(a.receivedAt || '').getTime()
      case 'compensation_high':
        return b.compensation.localeCompare(a.compensation)
      case 'company_name':
        return a.from.localeCompare(b.from)
      default:
        return 0
    }
  })

  // カスタムScoutCard用のステータス更新関数（企業への応募時）
  const handleCompanyScout = useCallback(async (companyId: number) => {
    try {
      const response = await fetch('/api/scouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: companyId,
          message: 'あなたの企業に興味があります。ぜひお話しさせてください。'
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        showToastMessage('企業への応募を送信しました')
        // 応募済み企業リストを更新
        setAppliedCompanies(prev => new Set([...Array.from(prev), companyId.toString()]))
        // 企業データを再取得
        fetchCompanies()
      } else {
        showToastMessage(`エラー: ${data.error || '応募送信に失敗しました'}`)
      }
    } catch (error) {
      console.error('応募送信エラー:', error)
      showToastMessage('応募の送信に失敗しました')
    }
  }, [fetchCompanies])

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* ページヘッダー */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">企業への応募</h2>
          <p className="text-gray-600 text-sm md:text-base">CFOを募集している企業に応募できます</p>
        </div>

        {/* 認証状態が不明の間はローディング画面を表示 */}
        {isAuthenticated === undefined && (
          <div className="flex items-center justify-center py-12">
            <Loading size="lg" text="認証状態を確認中..." />
          </div>
        )}
        
        {/* 未認証の場合は何も表示しない（リダイレクト処理中） */}
        {isAuthenticated === false && null}

        {isAuthenticated && (
          <>
            {/* モバイル検索・フィルターバー */}
            <div className="md:hidden mb-2">
              <div className="bg-white rounded-lg shadow-sm p-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="会社名や概要で検索"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs mb-1.5"
                />
                <button 
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="w-full bg-gray-100 text-gray-700 py-1.5 rounded-lg text-xs hover:bg-gray-200 transition-colors"
                >
                  絞り込み設定 {showMobileFilters ? '▲' : '▼'}
                </button>
              </div>
            </div>

            {/* モバイル用絞り込みパネル */}
            {showMobileFilters && (
              <div className="md:hidden mb-2">
                <div className="bg-white rounded-lg shadow-sm p-2">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">検索・絞り込み</h3>
                  
                  <div className="space-y-1.5">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">地域</label>
                      <select 
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs"
                      >
                        {regions.map(region => (
                          <option key={region.id} value={region.id === 'all' ? '' : region.id}>{region.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-0.5">並び替え</label>
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs"
                      >
                        {sortOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-2 flex gap-1.5">
                    <button 
                      onClick={async () => {
                        await fetchCompanies()
                        setShowMobileFilters(false)
                      }}
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white py-1 rounded-lg text-xs hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? '検索中...' : '検索'}
                    </button>
                    <button 
                      onClick={() => {
                        setSearchQuery('')
                        setSelectedRegion('')
                      }}
                      className="px-2 bg-gray-100 text-gray-700 py-1 rounded-lg text-xs hover:bg-gray-200"
                    >
                      リセット
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-2 md:gap-4">
              {/* サイドバー - PC用フィルターパネル */}
              <div className="hidden lg:block lg:w-80">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">検索・絞り込み</h3>
                  
                  {/* キーワード検索 */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">キーワード検索</label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="会社名や概要で検索"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* フィルター */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">地域</label>
                      <select 
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {regions.map(region => (
                          <option key={region.id} value={region.id === 'all' ? '' : region.id}>{region.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">並び替え</label>
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        {sortOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 検索・リセットボタン */}
                  <div className="mt-6 space-y-3">
                    <button 
                      onClick={fetchCompanies}
                      disabled={loading}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? '検索中...' : '検索'}
                    </button>
                    <button 
                      onClick={() => {
                        setSearchQuery('')
                        setSelectedRegion('')
                      }}
                      className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      条件をリセット
                    </button>
                  </div>
                </div>
              </div>

              {/* メインコンテンツ */}
              <div className="flex-1">
                <div className="mb-4 md:mb-6">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                      募集中の企業一覧
                    </h2>
                    <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full border">
                      ユーザー: CFO
                    </div>
                    <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border">
                      表示: 企業データ
                    </div>
                    <div className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full border">
                      状態: {loading ? '読込中' : '完了'}
                    </div>
                  </div>
                  {!loading && (
                    <p className="text-gray-600 text-sm md:text-base">
                      {sortedCompanies.length}件見つかりました
                    </p>
                  )}
                  
                  {/* モバイル用ソート */}
                  <div className="md:hidden mt-3">
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ローディング表示 */}
                {loading && (
                  <div className="py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">企業データを読み込み中...</p>
                  </div>
                )}

                {/* 企業スカウトカード（ScoutCard形式） */}
                {!loading && (
                  <div className="space-y-2 md:space-y-4">
                    {sortedCompanies.map((company) => (
                      <div key={company.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 md:p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2 md:mb-3">
                          <div className="flex items-start space-x-1.5 md:space-x-3 flex-1 min-w-0">
                            {/* 企業ロゴ */}
                            <div className="w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                              <span className="text-sm md:text-lg lg:text-2xl">{company.avatar}</span>
                            </div>
                            
                            {/* 企業情報部分 */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-0.5 md:gap-2 mb-0.5 md:mb-1">
                                <h3 className="text-xs md:text-base lg:text-lg font-semibold text-gray-900">{company.from}</h3>
                                <span className="px-1 py-0.5 md:px-2 md:py-1 rounded-full text-xs border whitespace-nowrap bg-blue-100 text-blue-800 border-blue-200">
                                  応募可
                                </span>
                              </div>
                              <p className="text-gray-600 text-xs md:text-sm mb-0.5 md:mb-1">{company.message}</p>
                              <div className="flex items-center text-xs text-gray-500">
                                <span>報酬: {company.compensation}</span>
                                <span className="text-gray-400">•</span>
                                <span>{company.workStyle}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* アクションボタン */}
                          <div className="flex gap-0.5 md:gap-2 mt-1.5 md:mt-0 md:flex-shrink-0">
                            <button 
                              onClick={async () => {
                                // 操作前の状態を記録
                                const wasInterested = isInterested(company.senderUserId)
                                const success = await toggleInterest(company.senderUserId, 'company')
                                if (success) {
                                  const message = !wasInterested ? '気になるに追加しました ❤️' : '気になるから削除しました'
                                  showToastMessage(message)
                                }
                              }}
                              className={`flex-1 md:flex-none min-h-[28px] md:min-h-[36px] px-1.5 md:px-3 py-0.5 md:py-1.5 border text-xs font-medium transition-all duration-200 active:scale-95 rounded-lg flex items-center justify-center whitespace-nowrap ${
                                isInterested(company.senderUserId)
                                  ? 'border-pink-500 bg-pink-50 text-pink-700 hover:bg-pink-100'
                                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                              }`}
                            >
                              {isInterested(company.senderUserId) ? '❤️ 気になる' : '🤍 気になる'}
                            </button>
                            {appliedCompanies.has(String(company.senderUserId)) ? (
                              <button 
                                disabled
                                className="flex-1 md:flex-none min-h-[28px] md:min-h-[36px] px-1.5 md:px-3 py-0.5 md:py-1.5 rounded-lg text-xs font-medium flex items-center justify-center whitespace-nowrap bg-gray-400 text-white cursor-not-allowed opacity-75"
                              >
                                応募済み
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleCompanyScout(company.senderUserId)}
                                className="flex-1 md:flex-none min-h-[28px] md:min-h-[36px] px-1.5 md:px-3 py-0.5 md:py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center whitespace-nowrap bg-gray-900 text-white hover:bg-gray-800 hover:scale-105"
                              >
                                応募
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 検索結果が0件の場合 */}
                {!loading && sortedCompanies.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">該当する企業が見つかりませんでした</h3>
                    <p className="text-gray-600 mb-4">検索条件を変更してお試しください</p>
                    <button 
                      onClick={() => {
                        setSearchQuery('')
                        setSelectedRegion('')
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      条件をリセット
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>  
        )}
      </div>


      {/* Toast通知 */}
      {showToast && (
        <div className="fixed bottom-16 md:bottom-4 right-3 md:right-4 bg-gray-900 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg shadow-lg z-50 animate-fade-in text-xs md:text-sm">
          {toastMessage}
        </div>
      )}
    </div>
  )
}