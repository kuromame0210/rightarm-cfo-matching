'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

export default function DiscoverCFOsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedWorkStyle, setSelectedWorkStyle] = useState('')
  const [selectedCompensation, setSelectedCompensation] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [interestedCFOs, setInterestedCFOs] = useState<number[]>([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showScoutModal, setShowScoutModal] = useState(false)
  const [selectedCFO, setSelectedCFO] = useState<any>(null)

  // v5.1仕様書に基づく専門スキル大分類6種
  const skillCategories = [
    '資金調達', 'IPO・M&A関連', '財務DX・システム導入', 
    '事業承継・再生', '組織・ガバナンス', 'その他'
  ]

  const regions = ['全国', '東京', '大阪', '愛知', '福岡', '北海道', '宮城', '広島']
  const workStyles = ['リモート可', '週1日〜', '週2日〜', '月1回〜', 'プロジェクト単位', 'フルタイム']
  const compensationRanges = ['〜50万円', '50〜100万円', '100〜150万円', '150〜200万円', '200万円〜']
  const sortOptions = [
    { value: 'newest', label: '新着順' },
    { value: 'compensation_high', label: '報酬高順' },
    { value: 'rating', label: '評価順' },
    { value: 'experience', label: '経験順' }
  ]

  // サンプルCFOデータ（v5.1仕様書のProfileCard CFO版情報を含む）
  const cfoProfiles = [
    {
      id: 1,
      name: '田中 康平',
      nickname: '戦略CFO田中',
      profileImage: '/placeholder-avatar.jpg',
      skills: ['資金調達', 'IPO・M&A関連', '組織・ガバナンス'],
      businessCapabilities: ['シリーズA〜C資金調達', 'IPO準備・実行', 'M&A戦略立案', '投資家対応'],
      achievements: '大手証券会社で15年勤務後、5社のIPOをリード。累計調達額200億円以上の実績',
      certifications: ['公認会計士', 'CFA', 'MBA(ファイナンス)'],
      workPreference: 'リモート可・週2日〜',
      compensationRange: '月100万円〜',
      introduction: '大手証券会社出身。多数のIPO実績を持ち、資金調達から上場まで一貫してサポート可能。戦略的CFOとして企業価値最大化に貢献します。',
      region: '東京',
      rating: 4.9,
      reviewCount: 12,
      photoUrl: '👨‍💼',
      registeredAt: '2024-01-10',
      available: true
    },
    {
      id: 2,
      name: '鈴木 美咲',
      nickname: 'みさきCFO',
      profileImage: '/placeholder-avatar.jpg',
      skills: ['財務DX・システム導入', '資金調達', '組織・ガバナンス'],
      businessCapabilities: ['ERP導入・運用', 'SaaS財務管理', 'スタートアップ支援', 'チーム組成'],
      achievements: '監査法人出身、中小企業の財務改善・システム導入を12年間支援。DX化成功率95%',
      certifications: ['公認会計士', 'システム監査技術者', 'PMP'],
      workPreference: '週1日〜・複数社対応可',
      compensationRange: '月60万円〜',
      introduction: '監査法人出身。中小企業の財務改善・システム導入に豊富な実績。複数社の並行支援も可能で、効率的な財務体制構築をサポートします。',
      region: '東京',
      rating: 4.7,
      reviewCount: 8,
      photoUrl: '👩‍💼',
      registeredAt: '2024-01-08',
      available: true
    },
    {
      id: 3,
      name: '佐藤 次郎',
      nickname: 'M&A佐藤',
      profileImage: '/placeholder-avatar.jpg',
      skills: ['IPO・M&A関連', '事業承継・再生', 'その他'],
      businessCapabilities: ['M&A戦略・実行', 'バリュエーション', '事業再生', 'PEファンド経験'],
      achievements: 'PEファンド出身。M&A案件50件以上の経験。事業再生から企業価値向上まで幅広く対応',
      certifications: ['MBA(経営戦略)', '事業再生士', 'M&Aエキスパート'],
      workPreference: 'フルリモート・プロジェクト単位',
      compensationRange: '月120万円〜',
      introduction: 'PEファンド出身。事業再生・M&Aの豊富な経験で企業価値向上をサポート。複雑な案件ほど力を発揮します。',
      region: '大阪',
      rating: 4.8,
      reviewCount: 15,
      photoUrl: '👨‍💼',
      registeredAt: '2024-01-05',
      available: true
    },
    {
      id: 4,
      name: '山田 花子',
      nickname: 'はなちゃんCFO',
      profileImage: '/placeholder-avatar.jpg',
      skills: ['財務DX・システム導入', '組織・ガバナンス'],
      businessCapabilities: ['管理会計強化', '予実管理', 'KPI設計', 'チーム教育'],
      achievements: 'SaaS企業でCFOを3年務め、IPO準備まで担当。管理会計の仕組み化が得意',
      certifications: ['公認会計士', 'USCPA', 'データアナリスト'],
      workPreference: 'リモート可・週1日〜',
      compensationRange: '月80万円〜',
      introduction: 'SaaS企業でのCFO経験あり。特に管理会計の仕組み化と予実管理の精度向上を得意としています。',
      region: '愛知',
      rating: 4.6,
      reviewCount: 6,
      photoUrl: '👩‍💼',
      registeredAt: '2024-01-12',
      available: false
    },
    {
      id: 5,
      name: '高橋 誠一',
      nickname: '地方創生CFO',
      profileImage: '/placeholder-avatar.jpg',
      skills: ['事業承継・再生', '資金調達'],
      businessCapabilities: ['補助金活用', '地方銀行折衝', '事業承継支援', '地域密着型経営'],
      achievements: '地方銀行出身。地方企業の事業承継・補助金活用支援で30社以上をサポート',
      certifications: ['中小企業診断士', '事業承継士', '補助金アドバイザー'],
      workPreference: '現地・月2回〜',
      compensationRange: '月70万円〜',
      introduction: '地方銀行出身で地方企業の事情に精通。事業承継や補助金活用など、地方特有の課題解決が得意です。',
      region: '福岡',
      rating: 4.5,
      reviewCount: 9,
      photoUrl: '👨‍💼',
      registeredAt: '2024-01-03',
      available: true
    }
  ]

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleInterested = (cfo: any) => {
    if (interestedCFOs.includes(cfo.id)) {
      setInterestedCFOs(prev => prev.filter(id => id !== cfo.id))
      showToastMessage('気になるから削除しました')
    } else {
      setInterestedCFOs(prev => [...prev, cfo.id])
      showToastMessage('気になるに追加しました ❤️')
    }
  }

  const handleScout = (cfo: any) => {
    setSelectedCFO(cfo)
    setShowScoutModal(true)
  }

  const sendScout = () => {
    if (selectedCFO) {
      showToastMessage(`${selectedCFO.name}さんにスカウトを送信しました`)
      setShowScoutModal(false)
      setSelectedCFO(null)
    }
  }

  // フィルタリング処理
  const filteredCFOs = cfoProfiles.filter(cfo => {
    const matchesSearch = searchQuery === '' || 
      cfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cfo.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cfo.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
      cfo.achievements.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesSkills = selectedSkills.length === 0 || 
      selectedSkills.some(skill => cfo.skills.includes(skill))
    
    const matchesRegion = selectedRegion === '' || selectedRegion === '全国' || 
      cfo.region === selectedRegion
    
    const matchesWorkStyle = selectedWorkStyle === '' || 
      cfo.workPreference.includes(selectedWorkStyle)
    
    return matchesSearch && matchesSkills && matchesRegion && matchesWorkStyle
  })

  // ソート処理
  const sortedCFOs = [...filteredCFOs].sort((a, b) => {
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

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader isLoggedIn={true} />

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
                  {skillCategories.map((skill) => (
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
                  placeholder="CFOの名前やスキルで検索"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 専門スキル */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">専門スキル</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                  {skillCategories.map((skill) => (
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
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">募集中のCFO一覧</h2>
                  <p className="text-gray-600 text-sm md:text-base">
                    {sortedCFOs.length}件見つかりました
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

            {/* 選択中のスキル表示 */}
            {selectedSkills.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map(skill => (
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

            {/* CFOプロフィールカード - v5.1仕様書準拠のCardGrid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedCFOs.map((cfo) => (
                <div key={cfo.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  {/* CFO基本情報 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                        {cfo.photoUrl}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{cfo.name}</h3>
                        <p className="text-sm text-gray-600">{cfo.nickname}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            <span className="text-yellow-400 text-sm">★</span>
                            <span className="text-sm text-gray-600 ml-1">{cfo.rating}</span>
                            <span className="text-xs text-gray-500 ml-1">({cfo.reviewCount}件)</span>
                          </div>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{cfo.region}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs border ${
                      cfo.available 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>
                      {cfo.available ? '対応可能' : '満員'}
                    </span>
                  </div>

                  {/* 可能な業務/スキル */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">可能な業務/スキル:</p>
                    <div className="flex flex-wrap gap-1">
                      {cfo.skills.map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 実績・経歴 */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">実績・経歴:</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{cfo.achievements}</p>
                  </div>

                  {/* 保有資格 */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">保有資格:</p>
                    <div className="flex flex-wrap gap-1">
                      {cfo.certifications.map((cert) => (
                        <span key={cert} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 稼働希望形態・希望報酬 */}
                  <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="text-xs text-gray-500">稼働希望形態:</span>
                      <p className="font-medium">{cfo.workPreference}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">希望報酬:</span>
                      <p className="font-medium">{cfo.compensationRange}</p>
                    </div>
                  </div>

                  {/* 自己紹介/一言 */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">自己紹介:</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{cfo.introduction}</p>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleInterested(cfo)}
                      className={`flex-1 min-h-[44px] px-4 py-2 border text-sm font-medium transition-all duration-200 rounded-lg flex items-center justify-center ${
                        interestedCFOs.includes(cfo.id)
                          ? 'border-pink-500 bg-pink-50 text-pink-700 hover:bg-pink-100'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      {interestedCFOs.includes(cfo.id) ? '❤️ 気になる' : '🤍 気になる'}
                    </button>
                    <button 
                      onClick={() => handleScout(cfo)}
                      disabled={!cfo.available}
                      className={`flex-1 min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${
                        !cfo.available
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {cfo.available ? 'スカウト送信' : '対応不可'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* 検索結果が0件の場合 */}
            {sortedCFOs.length === 0 && (
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

      {/* Toast通知 */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* スカウトモーダル */}
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
    </div>
  )
}