'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
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

  // マスターデータを固定値で設定（EssentialProfileInputs.tsxと統一）
  const fetchMasterData = async () => {
    try {
      setMasterDataLoading(true)
      
      // 🆕 固定データ設定（プロフィール編集と統一）
      const defaultSkills = [
        'M&A支援', 'IPOサポート', '資金調達', '管理会計', '財務分析',
        '予算管理', '原価計算', '資金管理', '経営企画', '投資計画',
        '税務対応', '監査対応', '内部統制', '業績管理', '海外業務'
      ]
      
      const defaultRegions = [
        { id: 'all', name: '全国' },
        { id: 'kanto', name: '関東エリア' },
        { id: 'kansai', name: '関西エリア' },
        { id: 'chubu', name: '中部エリア' },
        { id: 'tohoku', name: '東北エリア' },
        { id: 'kyushu', name: '九州エリア' }
      ]
      
      const defaultWorkStyles = [
        { id: '1', name: '週1日' },
        { id: '2', name: '週2日' },
        { id: '3', name: '週3日' },
        { id: '4', name: '週4日' },
        { id: '5', name: '週5日（フルタイム）' }
      ]
      
      setSkillCategories(defaultSkills)
      setRegions(defaultRegions)
      setWorkStyles(defaultWorkStyles)
      
      // 🆕 報酬検索を250万円以下まで対応
      setCompensationRanges([
        '応相談', '月額制：20万円以下', '月額制：30万円以下', '月額制：50万円以下', '月額制：80万円以下', '月額制：100万円以下', '月額制：150万円以下', '月額制：200万円以下', '月額制：250万円以下'
      ])

    } catch (error) {
      console.error('Master data setup error:', error)
      showToastMessage('設定の読み込みに失敗しました')
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
      if (selectedRegion && selectedRegion !== '全国') {
        if (selectedRegion === '関東エリア') params.append('regions', 'kanto')
        else if (selectedRegion === '関西エリア') params.append('regions', 'kansai')
        else if (selectedRegion === '中部エリア') params.append('regions', 'chubu')
        else if (selectedRegion === '東北エリア') params.append('regions', 'tohoku')
        else if (selectedRegion === '九州エリア') params.append('regions', 'kyushu')
      }
      if (selectedSkills.length > 0) params.append('skills', selectedSkills.join(','))
      
      // 🆕 稼働形態フィルタを修正（週日数として送信）
      if (selectedWorkStyle && selectedWorkStyle !== '') {
        if (selectedWorkStyle === '週1日') params.append('weeklyDays', '1')
        else if (selectedWorkStyle === '週2日') params.append('weeklyDays', '2')
        else if (selectedWorkStyle === '週3日') params.append('weeklyDays', '3')
        else if (selectedWorkStyle === '週4日') params.append('weeklyDays', '4')
        else if (selectedWorkStyle === '週5日（フルタイム）') params.append('weeklyDays', '5')
      }
      
      // 🆕 報酬フィルタをプロフィール編集設計に合わせて改善
      if (selectedCompensation && selectedCompensation !== '') {
        if (selectedCompensation === '応相談') {
          // 応相談のCFOのみ
          params.append('compensationType', 'negotiable')
        } else if (selectedCompensation.startsWith('月額制：')) {
          // 月額制で予算上限指定検索
          params.append('compensationType', 'monthly')
          
          if (selectedCompensation === '月額制：20万円以下') {
            params.append('budgetMax', '200000')
          } else if (selectedCompensation === '月額制：30万円以下') {
            params.append('budgetMax', '300000')
          } else if (selectedCompensation === '月額制：50万円以下') {
            params.append('budgetMax', '500000')
          } else if (selectedCompensation === '月額制：80万円以下') {
            params.append('budgetMax', '800000')
          } else if (selectedCompensation === '月額制：100万円以下') {
            params.append('budgetMax', '1000000')
          } else if (selectedCompensation === '月額制：150万円以下') {
            params.append('budgetMax', '1500000')
          } else if (selectedCompensation === '月額制：200万円以下') {
            params.append('budgetMax', '2000000')
          } else if (selectedCompensation === '月額制：250万円以下') {
            params.append('budgetMax', '2500000')
          }
        }
      }
      
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
  }, [pagination.page, pagination.limit, selectedSkills, selectedRegion, selectedWorkStyle, selectedCompensation, searchQuery, isOnline])

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
  const filteredCFOs = useMemo(() => 
    displayCFOs.filter((cfo: any) => {
      const matchesSearch = searchQuery === '' || 
        cfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cfo.displayName && cfo.displayName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        cfo.skills.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (cfo.introduction && cfo.introduction.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesSkills = selectedSkills.length === 0 || 
        selectedSkills.some((skill: string) => cfo.skills.includes(skill))
      
      const matchesRegion = selectedRegion === '' || selectedRegion === '全国' || 
        (cfo.structured?.supportedPrefectures && cfo.structured.supportedPrefectures.length > 0) ||
        cfo.structured?.fullRemoteAvailable
      
      // 🆕 稼働形態フィルタを修正
      const matchesWorkStyle = selectedWorkStyle === '' ||
        (selectedWorkStyle === '週1日' && cfo.structured?.weeklyDays === 1) ||
        (selectedWorkStyle === '週2日' && cfo.structured?.weeklyDays === 2) ||
        (selectedWorkStyle === '週3日' && cfo.structured?.weeklyDays === 3) ||
        (selectedWorkStyle === '週4日' && cfo.structured?.weeklyDays === 4) ||
        (selectedWorkStyle === '週5日（フルタイム）' && cfo.structured?.weeklyDays === 5) ||
        cfo.structured?.weeklyDaysFlexible // 柔軟対応可能な場合はマッチ
      
      // 🆕 報酬フィルタ（API検索と連携、フロントエンドは補完的）
      const matchesCompensation = selectedCompensation === '' ||
        (selectedCompensation === '応相談' && (
          cfo.structured?.compensationType === 'negotiable' || 
          (cfo.compensation && cfo.compensation.includes('応相談'))
        )) ||
        // 月額制の場合：具体的な予算範囲をチェック
        (selectedCompensation === '月額制：20万円以下' && cfo.structured?.compensationType === 'monthly' && (cfo.structured?.monthlyFeeMin || 0) <= 200000) ||
        (selectedCompensation === '月額制：30万円以下' && cfo.structured?.compensationType === 'monthly' && (cfo.structured?.monthlyFeeMin || 0) <= 300000) ||
        (selectedCompensation === '月額制：50万円以下' && cfo.structured?.compensationType === 'monthly' && (cfo.structured?.monthlyFeeMin || 0) <= 500000) ||
        (selectedCompensation === '月額制：80万円以下' && cfo.structured?.compensationType === 'monthly' && (cfo.structured?.monthlyFeeMin || 0) <= 800000) ||
        (selectedCompensation === '月額制：100万円以下' && cfo.structured?.compensationType === 'monthly' && (cfo.structured?.monthlyFeeMin || 0) <= 1000000) ||
        (selectedCompensation === '月額制：150万円以下' && cfo.structured?.compensationType === 'monthly' && (cfo.structured?.monthlyFeeMin || 0) <= 1500000) ||
        (selectedCompensation === '月額制：200万円以下' && cfo.structured?.compensationType === 'monthly' && (cfo.structured?.monthlyFeeMin || 0) <= 2000000) ||
        (selectedCompensation === '月額制：250万円以下' && cfo.structured?.compensationType === 'monthly' && (cfo.structured?.monthlyFeeMin || 0) <= 2500000)
      
      return matchesSearch && matchesSkills && matchesRegion && matchesWorkStyle && matchesCompensation
    }),
    [displayCFOs, searchQuery, selectedSkills, selectedRegion, selectedWorkStyle, selectedCompensation]
  )

  // ソート処理
  const sortedCFOs = useMemo(() => 
    [...filteredCFOs].sort((a: any, b: any) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
        case 'compensation_high':
          // 構造化データの下限金額でソート（下限が高い順）
          const aCompMin = a.structured?.monthlyFeeMin || (a.feeMin ? a.feeMin * 10000 : 0)
          const bCompMin = b.structured?.monthlyFeeMin || (b.feeMin ? b.feeMin * 10000 : 0)
          return bCompMin - aCompMin
        case 'rating':
          return b.rating - a.rating
        case 'experience':
          // 経験年数または構造化データの経験年数を使用
          const aExp = a.structured?.experienceYears || (a.experience ? a.experience.length / 100 : 0)
          const bExp = b.structured?.experienceYears || (b.experience ? b.experience.length / 100 : 0)
          return bExp - aExp
        default:
          return 0
      }
    }),
    [filteredCFOs, sortBy]
  )

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
                  {/* ヘッダー: 名前・居住地・アクションボタン */}
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                    <div className="flex-1 min-w-0 mb-3 md:mb-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        {/* CFO写真 */}
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center">
                          {cfo.photoUrl && cfo.photoUrl.startsWith('http') ? (
                            <Image 
                              src={cfo.photoUrl} 
                              alt={cfo.name} 
                              width={48}
                              height={48}
                              className="w-full h-full rounded-full object-cover" 
                              unoptimized={true}
                            />
                          ) : cfo.photoUrl && (cfo.photoUrl.includes('👨') || cfo.photoUrl.includes('👩') || cfo.photoUrl.includes('🧑')) ? (
                            <span className="text-lg md:text-xl">{cfo.photoUrl}</span>
                          ) : (
                            <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                            {cfo.name || '名前未設定'}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            📍 {cfo.location || '居住地未設定'}
                            {cfo.structured?.fullRemoteAvailable && (
                              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                完全リモート可
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
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
                  
                  {/* 🆕 構造化情報（最重要） */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {/* 報酬情報 */}
                      {cfo.structured?.compensationType && (
                        <div className="px-3 py-1.5 bg-green-100 text-green-800 text-sm rounded-lg font-medium">
                          💰 {cfo.structured.compensationType === 'monthly' ? '月額制' : '応相談'}
                          {cfo.structured.compensationType === 'monthly' && cfo.structured.monthlyFeeMin && (
                            <span className="ml-1">
                              {Math.floor(cfo.structured.monthlyFeeMin / 10000)}万円
                              {cfo.structured.monthlyFeeMax && cfo.structured.monthlyFeeMax !== cfo.structured.monthlyFeeMin ? 
                                `〜${Math.floor(cfo.structured.monthlyFeeMax / 10000)}万円` : '〜'}
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* 稼働条件 */}
                      {cfo.structured?.weeklyDays && (
                        <div className="px-3 py-1.5 bg-blue-100 text-blue-800 text-sm rounded-lg font-medium">
                          ⏰ 週{cfo.structured.weeklyDays}日
                          {cfo.structured.weeklyDaysFlexible && <span className="ml-1">（応相談可）</span>}
                        </div>
                      )}
                      
                      {/* 対応エリア */}
                      {cfo.structured?.supportedPrefectures && cfo.structured.supportedPrefectures.length > 0 && (
                        <div className="px-3 py-1.5 bg-purple-100 text-purple-800 text-sm rounded-lg font-medium">
                          🗺️ {cfo.structured.supportedPrefectures.map((region: string) => {
                            const regionMap: { [key: string]: string } = {
                              'kanto': '関東',
                              'kansai': '関西',
                              'chubu': '中部',
                              'tohoku': '東北',
                              'kyushu': '九州',
                              'nationwide': '全国'
                            }
                            return regionMap[region] || region
                          }).slice(0, 2).join('・')}
                          {cfo.structured.supportedPrefectures.length > 2 && '他'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 専門スキル（重要なもの優先表示） */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">専門スキル:</p>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {cfo.skills.slice(0, 6).map((skill: string, index: number) => (
                        <span key={skill} className={`px-2 py-1 text-xs rounded border ${
                          index < 3 ? 'bg-blue-50 text-blue-700 border-blue-200 font-medium' : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}>
                          {skill}
                        </span>
                      ))}
                      {cfo.skills.length > 6 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{cfo.skills.length - 6}個
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 簡潔な紹介文 */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">紹介:</p>
                    <p className="text-gray-700 text-sm line-clamp-2 leading-relaxed">
                      {cfo.introduction || '経験豊富なCFOとして、企業の財務戦略をサポートします。'}
                    </p>
                  </div>

                  {/* 詳細情報（折り畳み可能） */}
                  <details className="mt-3">
                    <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                      詳細情報を表示
                    </summary>
                    <div className="mt-2 pt-2 border-t border-gray-100 space-y-2">
                      {/* 保有資格 */}
                      <div>
                        <span className="text-xs text-gray-500">保有資格:</span>
                        <p className="text-gray-600 text-xs">{cfo.certifications || '未設定'}</p>
                      </div>
                      
                      {/* テキストベースの詳細情報 */}
                      {cfo.compensation && (
                        <div>
                          <span className="text-xs text-gray-500">報酬詳細:</span>
                          <p className="text-gray-600 text-xs">{cfo.compensation}</p>
                        </div>
                      )}
                      
                      {cfo.workingAreas && (
                        <div>
                          <span className="text-xs text-gray-500">エリア詳細:</span>
                          <p className="text-gray-600 text-xs">{cfo.workingAreas}</p>
                        </div>
                      )}
                    </div>
                  </details>
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