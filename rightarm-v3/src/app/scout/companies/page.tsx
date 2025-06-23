'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

export default function ScoutCompaniesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedWorkStyle, setSelectedWorkStyle] = useState('')
  const [selectedCompensation, setSelectedCompensation] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [interestedCompanies, setInterestedCompanies] = useState<number[]>([])
  const [scoutedCompanies, setScoutedCompanies] = useState<number[]>([])
  const [showScoutModal, setShowScoutModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [scoutMessage, setScoutMessage] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // v5.1仕様書に基づく財務課題タグ
  const challengeTags = [
    '資金調達', 'IPO準備', 'M&A', '管理会計強化', '財務分析', 'ERP導入',
    '銀行融資', 'VC調達', '事業再生', '補助金活用', '原価計算', '予実管理',
    '資金繰り改善', '投資家対応', '内部統制'
  ]

  const regions = ['全国', '東京', '大阪', '愛知', '福岡', '北海道', '宮城', '広島']
  const workStyles = ['リモート可', '週1日〜', '週2日〜', '月1回〜', 'プロジェクト単位', 'フルタイム']
  const compensationRanges = ['〜50万円', '50〜100万円', '100〜150万円', '150〜200万円', '200万円〜']
  const sortOptions = [
    { value: 'newest', label: '新着順' },
    { value: 'compensation_high', label: '報酬高順' },
    { value: 'company_size', label: '企業規模順' },
    { value: 'urgency', label: '緊急度順' }
  ]

  // サンプル企業データ（逆スカウト用）
  const companyProfiles = [
    {
      id: 1,
      companyName: '株式会社テックスタート',
      businessName: 'AI-SaaSプラットフォーム開発',
      industry: 'IT・ソフトウェア',
      region: '東京',
      revenue: '年商8億円',
      employeeCount: '50名',
      challenges: ['資金調達', 'IPO準備', '投資家対応'],
      challengeBackground: 'シリーズBラウンドでの10億円調達を予定。VCとの交渉や株主総会対応の経験が必要',
      cfoRequirements: '上場企業でのIR経験、VC調達経験、株主対応経験必須',
      expectedTimeline: '2024年4月〜長期',
      workStyle: 'リモート可・週2日〜',
      compensation: '月100万円〜',
      description: 'BtoB向けAI SaaSプラットフォームを展開。シリーズBラウンドを控え、財務・IR体制の強化が急務',
      urgency: 'high',
      postedAt: '2024-01-15',
      logo: '🏢',
      isScoutFriendly: true // スカウト歓迎
    },
    {
      id: 2,
      companyName: '製造業ABC株式会社',
      businessName: '精密機械部品製造',
      industry: '製造業',
      region: '愛知',
      revenue: '年商50億円',
      employeeCount: '300名',
      challenges: ['管理会計強化', '原価計算', 'ERP導入'],
      challengeBackground: '創業50年の老舗だが、原価計算が曖昧で部門別収益性が見えない状況',
      cfoRequirements: '製造業での管理会計経験、ERP導入プロジェクト経験、原価計算システム構築経験',
      expectedTimeline: '2024年3月〜1年間',
      workStyle: '現地・週1日〜',
      compensation: '月80万円〜',
      description: '自動車部品などの精密機械部品を製造。管理会計システムの刷新により収益性向上を目指す',
      urgency: 'medium',
      postedAt: '2024-01-10',
      logo: '🏭',
      isScoutFriendly: true
    },
    {
      id: 3,
      companyName: '地方物流サービス株式会社',
      businessName: '地域密着型物流サービス',
      industry: '物流・運輸',
      region: '福岡',
      revenue: '年商15億円',
      employeeCount: '120名',
      challenges: ['事業承継', 'M&A', '補助金活用'],
      challengeBackground: '創業社長の引退を控え、事業承継またはM&Aを検討中。企業価値向上が課題',
      cfoRequirements: 'M&A経験、企業価値評価経験、事業承継コンサルティング経験',
      expectedTimeline: '2024年2月〜2年間',
      workStyle: 'リモート・月2回現地',
      compensation: '月120万円〜',
      description: '九州エリアで物流サービスを展開。事業承継に向けた財務体制整備と企業価値最大化を推進',
      urgency: 'high',
      postedAt: '2024-01-12',
      logo: '🚛',
      isScoutFriendly: false // スカウト不可
    },
    {
      id: 4,
      companyName: 'グリーンエナジー株式会社',
      businessName: '再生可能エネルギー事業',
      industry: 'エネルギー',
      region: '大阪',
      revenue: '年商25億円',
      employeeCount: '80名',
      challenges: ['補助金活用', '銀行融資', '財務分析'],
      challengeBackground: '太陽光発電事業の拡大に向け、補助金活用と銀行融資による資金調達が必要',
      cfoRequirements: 'エネルギー業界知識、補助金申請経験、プロジェクトファイナンス経験',
      expectedTimeline: '2024年5月〜18ヶ月',
      workStyle: 'リモート可・週1日〜',
      compensation: '月90万円〜',
      description: '太陽光・風力発電事業を展開。新規プロジェクトの資金調達と収益性分析の専門家を求む',
      urgency: 'medium',
      postedAt: '2024-01-08',
      logo: '🌱',
      isScoutFriendly: true
    }
  ]

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

  const handleScoutClick = (company: any) => {
    if (!company.isScoutFriendly) {
      showToastMessage('この企業はスカウトを受け付けていません')
      return
    }
    setSelectedCompany(company)
    setShowScoutModal(true)
  }

  const handleScoutSubmit = () => {
    if (!selectedCompany) return
    
    if (scoutMessage.trim().length < 50) {
      showToastMessage('スカウトメッセージは50文字以上入力してください')
      return
    }

    // 実際の実装では API を呼び出してスカウトを送信
    setScoutedCompanies(prev => [...prev, selectedCompany.id])
    showToastMessage(`${selectedCompany.companyName}にスカウトを送信しました！`)
    setShowScoutModal(false)
    setScoutMessage('')
    setSelectedCompany(null)
  }

  // フィルタリング処理（スカウト可能な企業のみ表示）
  const filteredCompanies = companyProfiles.filter(company => {
    if (!company.isScoutFriendly) return false
    
    const matchesSearch = searchQuery === '' || 
      company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => company.challenges.includes(tag))
    
    const matchesRegion = selectedRegion === '' || selectedRegion === '全国' || 
      company.region === selectedRegion
    
    const matchesWorkStyle = selectedWorkStyle === '' || 
      company.workStyle.includes(selectedWorkStyle)
    
    return matchesSearch && matchesTags && matchesRegion && matchesWorkStyle
  })

  // ソート処理
  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
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

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader isLoggedIn={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* ページヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">企業スカウト</h1>
          <p className="text-gray-600">あなたの専門性を活かせる企業にスカウトを送りましょう</p>
        </div>

        {/* スカウト歓迎バッジ説明 */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-blue-600 text-xl">💌</div>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">スカウトについて</h3>
              <p className="text-sm text-blue-800">
                「スカウト歓迎」マークの企業に積極的にアプローチできます。あなたの専門性を活かせる企業を見つけて、直接連絡を取ってみましょう。
              </p>
            </div>
          </div>
        </div>

        {/* モバイル検索・フィルターバー */}
        <div className="md:hidden mb-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="会社名や業界で検索"
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
              
              {/* 財務課題タグ */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">財務課題</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
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
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">地域</label>
                  <select 
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {regions.map(region => (
                      <option key={region} value={region === '全国' ? '' : region}>{region}</option>
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
                    {workStyles.map(style => (
                      <option key={style} value={style}>{style}</option>
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
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                onClick={() => setShowMobileFilters(false)}
                className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700"
              >
                フィルターを適用
              </button>
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
                      <option key={region} value={region === '全国' ? '' : region}>{region}</option>
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
                      <option key={style} value={style}>{style}</option>
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
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="flex-1">
            <div className="mb-4 md:mb-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">スカウト歓迎企業一覧</h2>
                  <p className="text-gray-600 text-sm md:text-base">
                    {sortedCompanies.length}件見つかりました
                  </p>
                </div>
                
                {/* モバイル用ソート */}
                <div className="md:hidden">
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
            </div>

            {/* 選択中のタグ表示 */}
            {selectedTags.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tag => (
                    <span 
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200"
                    >
                      {tag}
                      <button 
                        onClick={() => toggleTag(tag)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 企業プロフィールカード */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedCompanies.map((company) => (
                <div key={company.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  {/* 企業基本情報 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                        {company.logo}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">{company.companyName}</h3>
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded border border-green-200">
                            💌 スカウト歓迎
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{company.businessName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{company.industry}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{company.region}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{company.employeeCount}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs border ${getUrgencyBadge(company.urgency)}`}>
                      {getUrgencyText(company.urgency)}
                    </span>
                  </div>

                  {/* 財務課題タグ */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {company.challenges.slice(0, 4).map((challenge) => (
                      <span key={challenge} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                        {challenge}
                      </span>
                    ))}
                    {company.challenges.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{company.challenges.length - 4}
                      </span>
                    )}
                  </div>

                  {/* 課題の背景 */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{company.challengeBackground}</p>

                  {/* CFOに求めたいこと */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">CFOに求めたいこと:</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{company.cfoRequirements}</p>
                  </div>

                  {/* 条件情報 */}
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="text-xs text-gray-500">希望時期:</span>
                      <p className="font-medium">{company.expectedTimeline}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">報酬:</span>
                      <p className="font-medium">{company.compensation}</p>
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleInterested(company)}
                      className={`flex-1 min-h-[44px] px-4 py-2 border text-sm font-medium transition-all duration-200 rounded-lg flex items-center justify-center ${
                        interestedCompanies.includes(company.id)
                          ? 'border-pink-500 bg-pink-50 text-pink-700 hover:bg-pink-100'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      {interestedCompanies.includes(company.id) ? '❤️ 気になる' : '🤍 気になる'}
                    </button>
                    <button 
                      onClick={() => handleScoutClick(company)}
                      disabled={scoutedCompanies.includes(company.id)}
                      className={`flex-1 min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                        scoutedCompanies.includes(company.id)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {scoutedCompanies.includes(company.id) ? '✓ スカウト済み' : '💌 スカウト送信'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 検索結果が0件の場合 */}
            {sortedCompanies.length === 0 && (
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

      {/* スカウトモーダル */}
      {showScoutModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedCompany.companyName}にスカウトを送信
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                スカウトメッセージ <span className="text-red-500">*</span>
              </label>
              <textarea
                value={scoutMessage}
                onChange={(e) => setScoutMessage(e.target.value)}
                placeholder="あなたの専門性や経験をアピールし、どのように企業の課題解決に貢献できるかを具体的に記載してください。"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                rows={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                最低50文字以上、最大500文字まで入力可能です。({scoutMessage.length}/500文字)
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowScoutModal(false)
                  setScoutMessage('')
                  setSelectedCompany(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleScoutSubmit}
                disabled={scoutMessage.trim().length < 50}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                  scoutMessage.trim().length >= 50
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                スカウト送信
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast通知 */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  )
}