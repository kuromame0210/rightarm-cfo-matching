'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'
import Loading from '@/components/Loading'
import { useAuth } from '@/lib/hooks/useAuth'
import { useInterests } from '@/lib/interests-context'

export const dynamic = 'force-dynamic'

export default function DiscoverCompaniesPage() {
  const { user, isAuthenticated } = useAuth()
  const { isInterested, toggleInterest, refetchInterests } = useInterests()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRevenueRange, setSelectedRevenueRange] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showScoutModal, setShowScoutModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [scoutMessage, setScoutMessage] = useState('')
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // 企業が実際に設定可能な年商範囲
  const revenueRanges = [
    { value: '', label: 'すべて' },
    { value: 'under_100m', label: '1億円未満' },
    { value: '100m_1b', label: '1〜10億円' },
    { value: '1b_10b', label: '10〜30億円' },
    { value: '10b_30b', label: '30〜50億円' },
    { value: 'over_50b', label: '50億円以上' },
    { value: 'private', label: '非公開' }
  ]
  const sortOptions = [
    { value: 'newest', label: '新着順' },
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
      if (selectedRevenueRange) params.append('revenue_range', selectedRevenueRange)
      
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
  }, [searchQuery, selectedRevenueRange, pagination.page, pagination.limit])
  
  // 実際の企業編集可能項目のみ使用するフォーマット関数
  const formatCompanyData = (company: any) => {
    // 年商数値範囲を日本語表示に変換
    const formatRevenueFromNumbers = (minRevenue: number, maxRevenue: number) => {
      // null、undefined、両方と0の場合のみ未設定とする
      if ((minRevenue == null || minRevenue === 0) && (maxRevenue == null || maxRevenue === 0)) {
        return '年商未設定'
      }
      
      const formatBillion = (amount: number) => {
        if (amount >= 100000000) {
          return Math.floor(amount / 100000000) + '億円'
        }
        return Math.floor(amount / 10000) + '万円'
      }
      
      // 片方のみ設定されている場合
      if (minRevenue && !maxRevenue) {
        return `${formatBillion(minRevenue)}以上`
      }
      if (!minRevenue && maxRevenue) {
        return `${formatBillion(maxRevenue)}以下`
      }
      
      // 両方設定されている場合
      if (minRevenue === maxRevenue) {
        return formatBillion(minRevenue)
      }
      
      return `${formatBillion(minRevenue)}〜${formatBillion(maxRevenue)}`
    }

    return {
      id: company.id || company.biz_user_id,
      companyName: company.companyName || company.biz_company_name || '会社名未設定',
      description: company.description || company.biz_raw_profile || '会社概要未設定',
      revenueRange: formatRevenueFromNumbers(company.revenueMin || company.biz_revenue_min, company.revenueMax || company.biz_revenue_max),
      challenges: company.biz_raw_profile ? '詳細は企業概要をご覧ください' : '財務課題未設定',
      postedAt: company.created_at || new Date().toISOString(),
      logo: '🏢'
    }
  }
  
  
  // 表示用企業データ
  const displayCompanies = companies.map((company: any) => formatCompanyData(company))
  
  // 認証チェックと企業データ取得
  useEffect(() => {
    if (isAuthenticated === false) {
      // 未認証の場合はログインページにリダイレクト
      router.push('/auth/login')
      return
    }
    
    if (isAuthenticated) {
      fetchCompanies()
      // ページ表示時にお気に入り状態も再取得
      refetchInterests()
    }
  }, [isAuthenticated, router, fetchCompanies, refetchInterests])


  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleInterested = async (company: any) => {
    const success = await toggleInterest(company.id, 'company')
    if (success) {
      if (isInterested(company.id)) {
        showToastMessage('気になるに追加しました ❤️')
      } else {
        showToastMessage('気になるから削除しました')
      }
    } else {
      showToastMessage('操作に失敗しました。再度お試しください。')
    }
  }

  const handleScout = (company: any) => {
    setSelectedCompany(company)
    setShowScoutModal(true)
  }

  const sendScout = async () => {
    if (!scoutMessage.trim()) {
      showToastMessage('メッセージを入力してください')
      return
    }

    if (!isAuthenticated) {
      showToastMessage('ログインが必要です')
      return
    }

    if (!selectedCompany?.id) {
      showToastMessage('企業情報が取得できません')
      return
    }

    try {
      const response = await fetch('/api/scouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: selectedCompany.id,
          message: scoutMessage.trim(),
          title: `${selectedCompany.companyName}への応募`
        })
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        showToastMessage(`${selectedCompany.companyName}に応募しました`)
        setShowScoutModal(false)
        setScoutMessage('') // メッセージをクリア
      } else {
        console.error('スカウト送信API エラー:', response.status, data)
        showToastMessage(`エラー: ${data.error || 'スカウト送信に失敗しました'}`)
      }
    } catch (error) {
      console.error('スカウト送信エラー:', error)
      showToastMessage('スカウトの送信に失敗しました')
    }
  }

  // 実際の編集可能項目でのフィルタリング処理（API側で年商フィルター対応済み）
  const filteredCompanies = displayCompanies.filter((company: any) => {
    // 会社名・概要でのキーワード検索
    const matchesSearch = searchQuery === '' || 
      company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    // 年商フィルターはAPI側で処理済みのため、ローカルフィルターは不要
    return matchesSearch
  })

  // ソート処理（編集可能項目のみ）
  const sortedCompanies = [...filteredCompanies].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      case 'company_name':
        return a.companyName.localeCompare(b.companyName)
      default:
        return 0
    }
  })


  // 認証状態が不明の間はローディング画面を表示
  if (isAuthenticated === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">認証状態を確認中...</p>
      </div>
    )
  }

  // 未認証の場合は何も表示しない（リダイレクト処理中）
  if (isAuthenticated === false) {
    return null
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
        <AppHeader />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1.5 md:py-4">
        {/* デバッグ用ユーザータイプ表示 */}

        {/* ページヘッダー */}
        <div className="mb-2 md:mb-4">
          <h1 className="text-base md:text-2xl lg:text-3xl font-bold text-gray-900 mb-0.5 md:mb-2">企業検索</h1>
          <p className="text-xs md:text-base text-gray-600">CFOを募集している企業を検索できます</p>
        </div>

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
              
              {/* 年商範囲フィルター */}
              <div className="space-y-1.5">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">年商範囲</label>
                  <select 
                    value={selectedRevenueRange}
                    onChange={(e) => setSelectedRevenueRange(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs"
                  >
                    {revenueRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
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
                    setSelectedRevenueRange('')
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

              {/* 年商範囲フィルター */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">年商範囲</label>
                  <select 
                    value={selectedRevenueRange}
                    onChange={(e) => setSelectedRevenueRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {revenueRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
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
                    setSelectedRevenueRange('')
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

            {/* 企業プロフィールカード - CFO一覧と同じ横長レイアウト */}
            {!loading && (
              <div className="space-y-2 md:space-y-4">
                {sortedCompanies.map((company) => (
                <div key={company.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 md:p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2 md:mb-3">
                    <div className="flex items-start space-x-1.5 md:space-x-3 flex-1 min-w-0">
                      {/* 企業ロゴ */}
                      <div className="w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                        {company.logo ? (
                          <span className="text-sm md:text-lg lg:text-2xl">{company.logo}</span>
                        ) : (
                          <svg className="w-4 h-4 md:w-6 md:h-6 lg:w-8 lg:h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 2a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 01-1-1V6zm0 5a1 1 0 011-1h6a1 1 0 011 1v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-1z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      
                      {/* 企業情報部分 - レスポンシブ対応 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-0.5 md:gap-2 mb-0.5 md:mb-1 safe-flex-wrap">
                          <h3 className="text-xs md:text-base lg:text-lg font-semibold text-gray-900 safe-flex-item responsive-truncate">{company.companyName}</h3>
                          <span className="px-1 py-0.5 md:px-2 md:py-1 rounded-full text-xs border safe-flex-item-important whitespace-nowrap bg-blue-100 text-blue-800 border-blue-200">
                            募集中
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs md:text-sm mb-0.5 md:mb-1 responsive-truncate">{company.description}</p>
                        <div className="flex items-center safe-flex-wrap text-xs text-gray-500">
                          <span className="safe-flex-item-important">年商: {company.revenueRange}</span>
                          <span className="text-gray-400 safe-flex-item-important">•</span>
                          <span className="safe-flex-item-important">{new Date(company.postedAt).toLocaleDateString('ja-JP')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* アクションボタン */}
                    <div className="flex gap-0.5 md:gap-2 mt-1.5 md:mt-0 safe-flex-wrap md:flex-shrink-0">
                      <Link 
                        href={`/company/${company.id}`}
                        className="flex-1 md:flex-none min-h-[28px] md:min-h-[36px] px-1.5 md:px-3 py-0.5 md:py-1.5 border border-blue-500 text-blue-600 rounded-lg text-xs font-medium transition-all duration-200 hover:bg-blue-50 text-center flex items-center justify-center whitespace-nowrap"
                      >
                        📋 詳細
                      </Link>
                      <button 
                        onClick={() => handleInterested(company)}
                        className={`flex-1 md:flex-none min-h-[28px] md:min-h-[36px] px-1.5 md:px-3 py-0.5 md:py-1.5 border text-xs font-medium transition-all duration-200 active:scale-95 rounded-lg flex items-center justify-center whitespace-nowrap ${
                          isInterested(company.id)
                            ? 'border-pink-500 bg-pink-50 text-pink-700 hover:bg-pink-100'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                      >
                        {isInterested(company.id) ? '❤️ 気になる' : '🤍 気になる'}
                      </button>
                      <Link 
                        href={`/messages?user=${company.id}`}
                        className="flex-1 md:flex-none min-h-[28px] md:min-h-[36px] px-1.5 md:px-3 py-0.5 md:py-1.5 border border-green-500 text-green-600 rounded-lg text-xs font-medium transition-all duration-200 hover:bg-green-50 text-center flex items-center justify-center whitespace-nowrap"
                      >
                        💬 メッセージ
                      </Link>
                      <button 
                        onClick={() => handleScout(company)}
                        className="flex-1 md:flex-none min-h-[28px] md:min-h-[36px] px-1.5 md:px-3 py-0.5 md:py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center whitespace-nowrap bg-gray-900 text-white hover:bg-gray-800 hover:scale-105"
                      >
                        応募
                      </button>
                    </div>
                  </div>
                  
                  {/* 企業詳細情報セクション */}
                  <div className="space-y-1.5 md:space-y-3">
                    {/* 財務課題 */}
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">財務課題:</p>
                      <p className="text-gray-600 text-xs md:text-sm line-clamp-2">{company.challenges}</p>
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
                    setSelectedRevenueRange('')
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  条件をリセット
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scout Modal */}
      {showScoutModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">📝 企業への応募</h3>
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
                  🏢
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedCompany.companyName}</p>
                  <p className="text-sm text-gray-600">{selectedCompany.businessName}</p>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">財務課題:</p>
                <div className="bg-gray-50 p-2 rounded text-xs text-gray-700">
                  {selectedCompany.challenges || '財務課題未設定'}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">応募メッセージを入力してください:</p>
              
              <textarea
                value={scoutMessage}
                onChange={(e) => setScoutMessage(e.target.value)}
                placeholder="応募の動機や提案したいソリューションを入力してください..."
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
                送信
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-16 md:bottom-4 right-3 md:right-4 bg-gray-900 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg shadow-lg z-50 animate-fade-in text-xs md:text-sm">
          {toastMessage}
        </div>
      )}
      </div>
    </>
  )
}