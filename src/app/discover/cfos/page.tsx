'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import AppHeader from '@/components/AppHeader'
import Loading from '@/components/Loading'
import { useInterests } from '@/lib/interests-context'
import { useAuth } from '@/lib/hooks/useAuth'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { isNetworkError, getNetworkErrorMessage } from '@/utils/api'

// Force dynamic rendering to avoid auth context issues during static generation
export const dynamic = 'force-dynamic'

export default function DiscoverCFOsPage() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()
  const { isInterested, toggleInterest } = useInterests()
  const { isOnline } = useNetworkStatus()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedWorkStyle, setSelectedWorkStyle] = useState('')
  const [selectedCompensation, setSelectedCompensation] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showScoutModal, setShowScoutModal] = useState(false)
  const [selectedCFO, setSelectedCFO] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [cfos, setCfos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // マスターデータの状態管理
  const [skillCategories, setSkillCategories] = useState<string[]>([])
  const [regions, setRegions] = useState<any[]>([])
  const [workStyles, setWorkStyles] = useState<any[]>([])
  const [compensationRanges, setCompensationRanges] = useState<string[]>([])
  const [masterDataLoading, setMasterDataLoading] = useState(true)
  const sortOptions = [
    { value: 'newest', label: '新着順' },
    { value: 'compensation_high', label: '報酬高順' },
    { value: 'rating', label: '評価順' },
    { value: 'experience', label: '経験順' }
  ]

  // マスターデータ取得
  const fetchMasterData = async () => {
    try {
      setMasterDataLoading(true)
      
      if (!isOnline) {
        showToastMessage('インターネット接続がありません。接続を確認してください。')
        return
      }
      
      // 並列でマスターデータを取得
      const [skillsRes, regionsRes, workStylesRes] = await Promise.all([
        fetch('/api/master/skills?category=finance'),
        fetch('/api/master/regions?popular=true'),
        fetch('/api/master/work-styles?popular=true')
      ])

      if (skillsRes.ok) {
        const skillsData = await skillsRes.json()
        if (skillsData.success) {
          setSkillCategories(skillsData.data.categories || [])
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
      if (isNetworkError(error)) {
        showToastMessage(getNetworkErrorMessage(error))
      } else {
        showToastMessage('マスターデータの取得に失敗しました')
      }
    } finally {
      setMasterDataLoading(false)
    }
  }

  useEffect(() => {
    fetchMasterData()
  }, [])

  // 新しいAPIレスポンス形式に対応（formatCFOData関数は不要）
  // APIから既に整形されたデータが返ってくるため、そのまま使用
  const displayCFOs = cfos

  // 認証チェックとCFOデータ取得
  useEffect(() => {
    if (isAuthenticated === false) {
      // 未認証の場合はログインページにリダイレクト
      router.push('/auth/login')
      return
    }
    
    if (isAuthenticated) {
      fetchCFOs()
    }
  }, [isAuthenticated, router])

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter((s: string) => s !== skill)
        : [...prev, skill]
    )
  }

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // CFOデータをAPIから取得する関数
  const fetchCFOs = useCallback(async () => {
    try {
      setLoading(true)
      
      if (!isOnline) {
        showToastMessage('インターネット接続がありません。接続を確認してください。')
        return
      }
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      
      if (searchQuery) params.append('search', searchQuery)
      if (selectedRegion && selectedRegion !== '全国') params.append('region', selectedRegion)
      if (selectedSkills.length > 0) params.append('skills', selectedSkills.join(','))
      if (selectedWorkStyle) params.append('available', 'true')
      
      const response = await fetch(`/api/cfos?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setCfos(data.data)
        setPagination(data.pagination)
      } else {
        console.error('CFOデータの取得に失敗:', data.error)
        showToastMessage('CFO一覧の取得に失敗しました')
        setCfos([])
      }
    } catch (error) {
      console.error('CFOデータの取得に失敗:', error)
      if (isNetworkError(error)) {
        showToastMessage(getNetworkErrorMessage(error))
      } else {
        showToastMessage('CFO一覧の取得に失敗しました')
      }
      setCfos([])
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, selectedSkills, selectedRegion, selectedWorkStyle, searchQuery, isOnline])

  // 検索実行関数
  const handleSearch = useCallback(async () => {
    setIsSearching(true)
    await fetchCFOs()
    setIsSearching(false)
    showToastMessage('検索が完了しました')
  }, [fetchCFOs])

  // リセット関数
  const handleReset = () => {
    setSearchQuery('')
    setSelectedSkills([])
    setSelectedRegion('')
    setSelectedWorkStyle('')
    setSelectedCompensation('')
    showToastMessage('検索条件をリセットしました')
  }

  const handleInterested = async (cfo: any) => {
    try {
      console.log('🔄 お気に入り操作開始:', {
        cfoId: cfo.id,
        cfoName: cfo.name,
        isAuthenticated,
        userType: user?.userType
      })
      
      const success = await toggleInterest(cfo.id, 'cfo')
      
      if (success) {
        const currentlyInterested = isInterested(cfo.id)
        const message = currentlyInterested 
          ? '気になるに追加しました ❤️' 
          : '気になるから削除しました'
        showToastMessage(message)
        
        console.log('✅ お気に入り操作成功:', {
          cfoId: cfo.id,
          action: currentlyInterested ? 'added' : 'removed'
        })
      } else {
        console.warn('❌ お気に入り操作失敗:', cfo.id)
        showToastMessage('操作に失敗しました。もう一度お試しください。')
      }
    } catch (error) {
      console.error('❌ 気になる機能エラー:', error)
      
      // エラーの詳細を表示
      if (error instanceof Error) {
        showToastMessage(`エラー: ${error.message}`)
      } else {
        showToastMessage('予期しないエラーが発生しました')
      }
    }
  }

  const handleScout = (cfo: any) => {
    setSelectedCFO(cfo)
    setShowScoutModal(true)
  }

  const sendScout = async () => {
    const messageInput = document.querySelector('textarea')?.value?.trim()
    
    if (!messageInput) {
      showToastMessage('スカウトメッセージを入力してください')
      return
    }

    if (!selectedCFO) {
      showToastMessage('CFOが選択されていません')
      return
    }

    try {
      const response = await fetch('/api/scouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: selectedCFO.id,
          recipientType: 'cfo',
          senderType: 'company',
          title: `${selectedCFO.name}さんへのスカウト`,
          message: messageInput,
          urgency: 'normal',
          metadata: {
            company_name: '募集企業',
            target_cfo: selectedCFO.name
          }
        })
      })

      const data = await response.json()
      
      if (response.ok && data.success) {
        showToastMessage(`${selectedCFO.name}さんにスカウトを送信しました`)
        setShowScoutModal(false)
        setSelectedCFO(null)
      } else {
        console.error('スカウト送信API エラー:', response.status, data)
        showToastMessage(`エラー: ${data.error || 'スカウト送信に失敗しました'}`)
      }
    } catch (error) {
      console.error('スカウト送信エラー:', error)
      showToastMessage('スカウトの送信に失敗しました')
    }
  }

  // フィルタリング処理（ローカルフィルタ - APIフィルタを補完）
  const filteredCFOs = displayCFOs.filter((cfo: any) => {
    const matchesSearch = searchQuery === '' || 
      cfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cfo.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cfo.skills.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
      cfo.achievements.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSkills = selectedSkills.length === 0 || 
      selectedSkills.some((skill: string) => cfo.skills.includes(skill))
    
    const matchesRegion = selectedRegion === '' || selectedRegion === '全国' || 
      cfo.region === selectedRegion
    
    const matchesWorkStyle = selectedWorkStyle === '' || 
      cfo.workPreference.includes(selectedWorkStyle)
    
    return matchesSearch && matchesSkills && matchesRegion && matchesWorkStyle
  })

  // ソート処理
  const sortedCFOs = [...filteredCFOs].sort((a: any, b: any) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
      case 'compensation_high':
        const aComp = parseInt(a.compensationRange.replace(/[^\d]/g, ''))
        const bComp = parseInt(b.compensationRange.replace(/[^\d]/g, ''))
        return bComp - aComp
      case 'rating':
        return b.rating - a.rating
      case 'experience':
        // 実績の長さを経験の指標として使用
        return b.achievements.length - a.achievements.length
      default:
        return 0
    }
  })

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">

        {/* ページヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">CFO検索</h1>
          <p className="text-gray-600">あなたの企業に最適なCFOを見つけましょう</p>
        </div>

        {/* モバイル検索・フィルターバー */}
        <div className="md:hidden mb-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="CFOの名前やスキルで検索"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm mb-3"
            />
            <button 
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
            >
              絞り込み設定 {showMobileFilters ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* モバイル用絞り込みパネル */}
        {showMobileFilters && (
          <div className="md:hidden mb-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">検索・絞り込み</h3>
              
              {/* 専門スキル */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">専門スキル</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {skillCategories.map((skill: string) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                        selectedSkills.includes(skill)
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* その他フィルター */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">地域</label>
                  <select 
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {regions.map((region: any) => (
                      <option key={region.id} value={region.id === 'all' ? '' : region.name}>{region.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">稼働形態</label>
                  <select 
                    value={selectedWorkStyle}
                    onChange={(e) => setSelectedWorkStyle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">すべて</option>
                    {workStyles.map((style: any) => (
                      <option key={style.id} value={style.name}>{style.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">並び替え</label>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {sortOptions.map((option: any) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button 
                  onClick={async () => {
                    await handleSearch()
                    setShowMobileFilters(false)
                  }}
                  disabled={isSearching}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? '検索中...' : '検索'}
                </button>
                <button 
                  onClick={handleReset}
                  className="px-4 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-200"
                >
                  リセット
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
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
                  placeholder="CFOの名前やスキルで検索"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 専門スキル */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">専門スキル</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {skillCategories.map((skill: string) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                        selectedSkills.includes(skill)
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {skill}
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
                    {regions.map((region: any) => (
                      <option key={region.id} value={region.id === 'all' ? '' : region.name}>{region.name}</option>
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
                    {workStyles.map((style: any) => (
                      <option key={style.id} value={style.name}>{style.name}</option>
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
                    {compensationRanges.map((range: string) => (
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
                    {sortOptions.map((option: any) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 検索・リセットボタン */}
              <div className="mt-6 space-y-3">
                <button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? '検索中...' : '検索'}
                </button>
                <button 
                  onClick={handleReset}
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
                  募集中のCFO一覧
                </h2>
                <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full border">
                  ユーザー: 企業
                </div>
                <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border">
                  表示: CFOデータ
                </div>
                <div className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full border">
                  状態: {loading ? '読込中' : '完了'}
                </div>
              </div>
              {!loading && (
                <p className="text-gray-600 text-sm md:text-base">
                  {sortedCFOs.length}件見つかりました
                </p>
              )}
              
              {/* モバイル用ソート */}
              <div className="md:hidden mt-3">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {sortOptions.map((option: any) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 選択中のスキル表示 */}
            {!loading && selectedSkills.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map((skill: string) => (
                    <span 
                      key={skill}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200"
                    >
                      {skill}
                      <button 
                        onClick={() => toggleSkill(skill)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
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
                <Loading size="md" text="CFOデータを読み込み中..." />
              </div>
            )}

            {/* CFOプロフィールカード */}
            {!loading && (
              <div className="space-y-4 md:space-y-6">
                {sortedCFOs.map((cfo: any) => (
                <div key={cfo.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
                  {/* 名前・評価・ステータス・ボタン */}
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                    <div className="flex-1 min-w-0 mb-2 md:mb-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        {/* CFO写真 */}
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center">
                          {cfo.photoUrl && cfo.photoUrl.startsWith('http') ? (
                            <Image 
                              src={cfo.photoUrl} 
                              alt={cfo.name} 
                              width={40}
                              height={40}
                              className="w-full h-full rounded-full object-cover" 
                              unoptimized={true}
                            />
                          ) : cfo.photoUrl && (cfo.photoUrl.includes('👨') || cfo.photoUrl.includes('👩') || cfo.photoUrl.includes('🧑')) ? (
                            <span className="text-sm md:text-base">{cfo.photoUrl}</span>
                          ) : (
                            <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <h3 className="text-base md:text-lg font-semibold text-gray-900">
                          {cfo.name || '名前未設定'}
                        </h3>
                      </div>
                      <p className="text-gray-600 text-sm ml-11 md:ml-13">
                        📍 {cfo.location || '居住地未設定'}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-wrap md:flex-nowrap">
                      <Link 
                        href={`/cfo/${cfo.id}`}
                        className="flex-1 md:flex-none min-h-[40px] px-3 py-2 border border-blue-500 text-blue-600 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 hover:bg-blue-50 text-center flex items-center justify-center whitespace-nowrap"
                      >
                        📋 詳細へ
                      </Link>
                      <button 
                        onClick={() => handleInterested(cfo)}
                        className={`flex-1 md:flex-none min-h-[40px] px-3 py-2 border text-xs md:text-sm font-medium transition-all duration-200 active:scale-95 rounded-lg flex items-center justify-center whitespace-nowrap ${
                          isInterested(cfo.id)
                            ? 'border-pink-500 bg-pink-500 text-white hover:bg-pink-600 hover:border-pink-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                      >
                        {isInterested(cfo.id) ? '❤️ 気になる中' : '🤍 気になる'}
                      </button>
                      <Link 
                        href={`/messages?user=${cfo.id}`}
                        className="flex-1 md:flex-none min-h-[40px] px-3 py-2 border border-green-500 text-green-600 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 hover:bg-green-50 text-center flex items-center justify-center whitespace-nowrap"
                      >
                        💬 メッセージ
                      </Link>
                      <button 
                        onClick={() => handleScout(cfo)}
                        className="flex-1 md:flex-none min-h-[40px] px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center whitespace-nowrap bg-gray-900 text-white hover:bg-gray-800 hover:scale-105"
                      >
                        スカウト
                      </button>
                    </div>
                  </div>
                  
                  {/* 可能な業務/スキル */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">可能な業務/スキル:</p>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {cfo.skills.map((skill: string) => (
                        <span key={skill} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  

                  {/* 保有資格 */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">保有資格:</p>
                    <p className="text-gray-600 text-sm">
                      {cfo.certifications || '未設定'}
                    </p>
                  </div>

                  {/* 対応エリア・報酬 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="text-xs text-gray-500">対応エリア:</span>
                      <p className="font-medium">{cfo.workingAreas || '未設定'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">報酬:</span>
                      <p className="font-medium">{cfo.compensation || '応相談'}</p>
                    </div>
                  </div>
                  
                  {/* 自己紹介/一言 */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">自己紹介:</p>
                    <p className="text-gray-600 text-sm line-clamp-2">{cfo.introduction}</p>
                  </div>
                </div>
                ))}
              </div>
            )}

            {/* 検索結果が0件の場合 */}
            {!loading && sortedCFOs.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">該当するCFOが見つかりませんでした</h3>
                <p className="text-gray-600 mb-4">検索条件を変更してお試しください</p>
                <button 
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedSkills([])
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
      </div>

      {/* Scout Modal */}
      {showScoutModal && selectedCFO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">🎯 スカウト送信</h3>
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
                  {selectedCFO.photoUrl}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedCFO.name}</p>
                  <p className="text-sm text-gray-600">{selectedCFO.nickname}</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">このCFOにスカウトを送信しますか？</p>
              
              <textarea
                placeholder="スカウトメッセージを入力してください..."
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
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}
    </>
  )
}