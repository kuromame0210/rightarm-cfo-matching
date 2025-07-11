'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'
import Loading from '@/components/Loading'
import { useAuth } from '@/lib/hooks/useAuth'

export const dynamic = 'force-dynamic'

export default function DiscoverCompaniesPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedWorkStyle, setSelectedWorkStyle] = useState('')
  const [selectedCompensation, setSelectedCompensation] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [interestedCompanies, setInterestedCompanies] = useState<number[]>([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // マスターデータの状態管理
  const [challengeTags, setChallengeTags] = useState<string[]>([])
  const [regions, setRegions] = useState<any[]>([])
  const [workStyles, setWorkStyles] = useState<any[]>([])
  const [compensationRanges, setCompensationRanges] = useState<string[]>([])
  const [masterDataLoading, setMasterDataLoading] = useState(true)
  const sortOptions = [
    { value: 'newest', label: '新着順' },
    { value: 'compensation_high', label: '報酬高順' },
    { value: 'company_size', label: '企業規模順' },
    { value: 'urgency', label: '緊急度順' }
  ]

  // マスターデータ取得
  const fetchMasterData = async () => {
    try {
      setMasterDataLoading(true)
      
      // 並列でマスターデータを取得
      const [skillsRes, regionsRes, workStylesRes] = await Promise.all([
        fetch('/api/master/skills?category=finance'),
        fetch('/api/master/regions?popular=true'),
        fetch('/api/master/work-styles?popular=true')
      ])

      if (skillsRes.ok) {
        const skillsData = await skillsRes.json()
        if (skillsData.success) {
          // 課題タグとしてスキル名を使用
          const tags = skillsData.data.skills?.map((skill: any) => skill.name) || []
          setChallengeTags(tags)
        }
      }

      if (regionsRes.ok) {
        const regionsData = await regionsRes.json()
        if (regionsData.success) {
          setRegions(regionsData.data.regions || [])
        }
      }

      if (workStylesRes.ok) {
        const workStylesData = await workStylesRes.json()
        if (workStylesData.success) {
          setWorkStyles(workStylesData.data.workStyles || [])
        }
      }

      // 報酬レンジは一旦固定（将来的にはマスターデータ化）
      setCompensationRanges(['〜50万円', '50〜100万円', '100〜150万円', '150〜200万円', '200万円〜'])

    } catch (error) {
      console.error('Master data fetch error:', error)
    } finally {
      setMasterDataLoading(false)
    }
  }

  useEffect(() => {
    fetchMasterData()
  }, [])

  // 企業データをAPIから取得する関数
  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      
      if (searchQuery) params.append('search', searchQuery)
      if (selectedRegion && selectedRegion !== '全国') params.append('region', selectedRegion)
      if (selectedTags.length > 0) params.append('challenges', selectedTags.join(','))
      
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
  }, [])
  
  // APIデータを統一フォーマットに変換
  const formatCompanyData = (company: any) => {
    return {
      id: company.id,
      companyName: company.company_name || '会社名',
      businessName: company.business_name || '事業名',
      industry: company.industry || '業界',
      region: company.region || '地域',
      revenue: company.revenue_range || '年商未入力',
      employeeCount: '従業員数未入力',
      challenges: company.rightarm_company_challenges?.map((c: any) => c.rightarm_challenge_tags?.name).filter((name: any) => Boolean(name)) || [],
      challengeBackground: company.description || '課題の背景を記載中',
      cfoRequirements: 'CFOに求めるスキルを記載中',
      expectedTimeline: '2024年〜',
      workStyle: '相談可能',
      compensation: '相談可能',
      description: company.description || '企業の説明を記載中',
      urgency: 'medium',
      postedAt: company.created_at || '2024-01-01',
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
    }
  }, [isAuthenticated, router, fetchCompanies])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleInterested = (company: any) => {
    if (interestedCompanies.includes(company.id)) {
      setInterestedCompanies(prev => prev.filter(id => id !== company.id))
      showToastMessage('気になるから削除しました')
    } else {
      setInterestedCompanies(prev => [...prev, company.id])
      showToastMessage('気になるに追加しました ❤️')
    }
  }

  // フィルタリング処理（ローカルフィルタ - APIフィルタを補完）
  const filteredCompanies = displayCompanies.filter((company: any) => {
    const matchesSearch = searchQuery === '' || 
      company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some((tag: string) => company.challenges.includes(tag))
    
    const matchesRegion = selectedRegion === '' || selectedRegion === '全国' || 
      company.region === selectedRegion
    
    const matchesWorkStyle = selectedWorkStyle === '' || 
      company.workStyle.includes(selectedWorkStyle)
    
    return matchesSearch && matchesTags && matchesRegion && matchesWorkStyle
  })

  // ソート処理
  const sortedCompanies = [...filteredCompanies].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
      case 'compensation_high':
        const aComp = parseInt(a.compensation.replace(/[^\d]/g, ''))
        const bComp = parseInt(b.compensation.replace(/[^\d]/g, ''))
        return bComp - aComp
      case 'urgency':
        const urgencyOrder = { 'high': 3, 'medium': 2, 'low': 1 }
        return urgencyOrder[b.urgency as keyof typeof urgencyOrder] - urgencyOrder[a.urgency as keyof typeof urgencyOrder]
      default:
        return 0
    }
  })

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high': return '急募'
      case 'medium': return '通常'
      case 'low': return '長期'
      default: return '通常'
    }
  }

  // 認証状態が不明の間はローディング画面を表示
  if (isAuthenticated === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="認証状態を確認中..." />
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
              placeholder="会社名や業界で検索"
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
              
              {/* 財務課題タグ */}
              <div className="mb-2">
                <label className="block text-xs font-medium text-gray-700 mb-0.5">財務課題</label>
                <div className="flex flex-wrap gap-0.5 max-h-20 overflow-y-auto">
                  {challengeTags.map((tag: string) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-1.5 py-0.5 rounded-full text-xs border transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* その他フィルター */}
              <div className="space-y-1.5">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">地域</label>
                  <select 
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs"
                  >
                    {regions.map(region => (
                      <option key={region.id || region.name} value={region.name === '全国' ? '' : region.name}>{region.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">稼働形態</label>
                  <select 
                    value={selectedWorkStyle}
                    onChange={(e) => setSelectedWorkStyle(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg text-xs"
                  >
                    <option value="">すべて</option>
                    {workStyles.map(style => (
                      <option key={style.id || style.name} value={style.name}>{style.name}</option>
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
                    setSelectedTags([])
                    setSelectedRegion('')
                    setSelectedWorkStyle('')
                    setSelectedCompensation('')
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
                  placeholder="会社名や業界で検索"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 財務課題タグ */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">財務課題</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {challengeTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* その他フィルター */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">地域</label>
                  <select 
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {regions.map(region => (
                      <option key={region.id || region.name} value={region.name === '全国' ? '' : region.name}>{region.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">稼働形態</label>
                  <select 
                    value={selectedWorkStyle}
                    onChange={(e) => setSelectedWorkStyle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">すべて</option>
                    {workStyles.map(style => (
                      <option key={style.id || style.name} value={style.name}>{style.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">報酬</label>
                  <select 
                    value={selectedCompensation}
                    onChange={(e) => setSelectedCompensation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">すべて</option>
                    {compensationRanges.map(range => (
                      <option key={range} value={range}>{range}</option>
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
                    setSelectedTags([])
                    setSelectedRegion('')
                    setSelectedWorkStyle('')
                    setSelectedCompensation('')
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

            {/* 選択中のタグ表示 */}
            {!loading && selectedTags.length > 0 && (
              <div className="mb-2">
                <div className="flex flex-wrap gap-0.5">
                  {selectedTags.map(tag => (
                    <span 
                      key={tag}
                      className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200"
                    >
                      {tag}
                      <button 
                        onClick={() => toggleTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800 text-xs"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ローディング表示 */}
            {loading && (
              <div className="py-12">
                <Loading size="md" text="企業データを読み込み中..." />
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
                          <span className={`px-1 py-0.5 md:px-2 md:py-1 rounded-full text-xs border safe-flex-item-important whitespace-nowrap ${getUrgencyBadge(company.urgency)}`}>
                            {getUrgencyText(company.urgency)}
                          </span>
                        </div>
                        <p className="text-gray-600 text-xs md:text-sm mb-0.5 md:mb-1 responsive-truncate">{company.businessName}</p>
                        <div className="flex items-center safe-flex-wrap text-xs text-gray-500">
                          <span className="safe-flex-item-important">{company.industry}</span>
                          <span className="text-gray-400 safe-flex-item-important">•</span>
                          <span className="safe-flex-item-important">{company.region}</span>
                          <span className="text-gray-400 hidden md:inline safe-flex-item-important">•</span>
                          <span className="hidden md:inline safe-flex-item-important">{company.employeeCount}</span>
                          <span className="text-gray-400 hidden lg:inline safe-flex-item-important">•</span>
                          <span className="hidden lg:inline safe-flex-item-important">{company.revenue}</span>
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
                          interestedCompanies.includes(company.id)
                            ? 'border-pink-500 bg-pink-50 text-pink-700 hover:bg-pink-100'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                      >
                        {interestedCompanies.includes(company.id) ? '❤️ 気になる' : '🤍 気になる'}
                      </button>
                      <Link 
                        href={`/messages?user=${company.id}`}
                        className="flex-1 md:flex-none min-h-[28px] md:min-h-[36px] px-1.5 md:px-3 py-0.5 md:py-1.5 border border-green-500 text-green-600 rounded-lg text-xs font-medium transition-all duration-200 hover:bg-green-50 text-center flex items-center justify-center whitespace-nowrap"
                      >
                        💬 メッセージ
                      </Link>
                      <Link 
                        href={`/company/${company.id}/apply`}
                        className="flex-1 md:flex-none min-h-[28px] md:min-h-[36px] px-1.5 md:px-3 py-0.5 md:py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center whitespace-nowrap bg-gray-900 text-white hover:bg-gray-800 hover:scale-105"
                      >
                        応募
                      </Link>
                    </div>
                  </div>
                  
                  {/* 企業詳細情報セクション */}
                  <div className="space-y-1.5 md:space-y-3">
                    {/* 財務課題タグ */}
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">財務課題:</p>
                      <div className="safe-flex-wrap">
                        {company.challenges.slice(0, 3).map((challenge: string) => (
                          <span key={challenge} className="px-1 py-0.5 md:px-2 md:py-1 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                            {challenge}
                          </span>
                        ))}
                        {company.challenges.length > 3 && (
                          <span className="px-1 py-0.5 md:px-2 md:py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{company.challenges.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* 課題の背景 */}
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">課題の背景:</p>
                      <p className="text-gray-600 text-xs md:text-sm line-clamp-1 md:line-clamp-2">{company.challengeBackground}</p>
                    </div>

                    {/* CFOに求めたいこと */}
                    <div className="hidden md:block">
                      <p className="text-xs text-gray-500 mb-0.5">CFOに求めたいこと:</p>
                      <p className="text-gray-600 text-xs md:text-sm line-clamp-1 md:line-clamp-2">{company.cfoRequirements}</p>
                    </div>

                    {/* 条件情報 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 md:gap-2 text-xs text-gray-600">
                      <div className="safe-flex-item">
                        <span className="text-xs text-gray-500 block">時期:</span>
                        <p className="font-medium text-xs responsive-truncate">{company.expectedTimeline}</p>
                      </div>
                      <div className="safe-flex-item">
                        <span className="text-xs text-gray-500 block">稼働:</span>
                        <p className="font-medium text-xs responsive-truncate">{company.workStyle}</p>
                      </div>
                      <div className="safe-flex-item">
                        <span className="text-xs text-gray-500 block">報酬:</span>
                        <p className="font-medium text-xs responsive-truncate">{company.compensation}</p>
                      </div>
                      <div className="safe-flex-item">
                        <span className="text-xs text-gray-500 block">投稿:</span>
                        <p className="font-medium text-xs responsive-truncate">{new Date(company.postedAt).toLocaleDateString('ja-JP')}</p>
                      </div>
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
                    setSelectedTags([])
                    setSelectedRegion('')
                    setSelectedWorkStyle('')
                    setSelectedCompensation('')
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