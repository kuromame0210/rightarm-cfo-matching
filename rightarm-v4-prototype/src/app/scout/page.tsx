'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ScoutPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterIndustry, setFilterIndustry] = useState('')
  const [filterSize, setFilterSize] = useState('')
  const [filterTags, setFilterTags] = useState<string[]>([])

  // サンプル企業データ（スカウト対象）
  const companies = [
    {
      id: 1,
      name: '株式会社テックイノベーション',
      industry: 'IT・ソフトウェア',
      size: '30名',
      location: '東京都渋谷区',
      challenges: ['資金調達', 'IPO準備'],
      tags: ['SaaS', 'B2B', '急成長', 'シリーズA'],
      description: 'AI技術を活用したSaaSプラットフォームを展開するスタートアップ。今期中のシリーズA調達を目指しています。',
      budget: '100〜200万円',
      urgency: 'high',
      logo: '🚀',
      founded: '2020年',
      revenue: '2億円',
      lastActive: '2日前'
    },
    {
      id: 2,
      name: '株式会社グロースパートナーズ',
      industry: 'コンサルティング',
      size: '15名',
      location: '大阪府大阪市',
      challenges: ['管理会計', '財務DX'],
      tags: ['コンサル', '中小企業支援', 'DX推進'],
      description: '中小企業向けの経営コンサルティングを展開。デジタル化支援で急速に事業拡大中。',
      budget: '50〜100万円',
      urgency: 'medium',
      logo: '📊',
      founded: '2019年',
      revenue: '5,000万円',
      lastActive: '1週間前'
    },
    {
      id: 3,
      name: '株式会社メディカルテック',
      industry: 'ヘルスケア',
      size: '50名',
      location: '神奈川県横浜市',
      challenges: ['IPO・M&A関連', '組織・ガバナンス'],
      tags: ['医療', 'テクノロジー', 'IPO準備', '上場企業'],
      description: '医療機器とITを組み合わせた革新的なヘルスケアソリューションを提供。来年のIPOを計画中。',
      budget: '200万円〜',
      urgency: 'high',
      logo: '🏥',
      founded: '2018年',
      revenue: '10億円',
      lastActive: '3日前'
    },
    {
      id: 4,
      name: '株式会社エコソリューション',
      industry: '環境・エネルギー',
      size: '80名',
      location: '愛知県名古屋市',
      challenges: ['事業再生', '財務DX'],
      tags: ['環境', '再生可能エネルギー', '事業転換', 'ESG'],
      description: '再生可能エネルギー事業への転換を進める老舗企業。持続可能な経営体制の構築が急務。',
      budget: '100〜200万円',
      urgency: 'medium',
      logo: '🌱',
      founded: '1995年',
      revenue: '50億円',
      lastActive: '5日前'
    },
    {
      id: 5,
      name: '株式会社フィンテックX',
      industry: '金融・フィンテック',
      size: '25名',
      location: '東京都港区',
      challenges: ['資金調達', '管理会計'],
      tags: ['フィンテック', 'ブロックチェーン', 'B2C', 'シリーズB'],
      description: 'ブロックチェーン技術を活用した新しい金融サービスを開発。次のラウンドに向けた準備中。',
      budget: '150〜250万円',
      urgency: 'high',
      logo: '💳',
      founded: '2021年',
      revenue: '3億円',
      lastActive: '1日前'
    }
  ]

  // 利用可能なタグ一覧
  const availableTags = [
    'SaaS', 'B2B', 'B2C', '急成長', 'スタートアップ',
    'シリーズA', 'シリーズB', 'IPO準備', '上場企業',
    'DX推進', 'AI・機械学習', 'ブロックチェーン',
    'フィンテック', '医療', '環境', 'ESG',
    'コンサル', '中小企業支援', '事業転換'
  ]

  const handleTagToggle = (tag: string) => {
    setFilterTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.includes(searchQuery) || 
                         company.description.includes(searchQuery) ||
                         company.challenges.some(challenge => challenge.includes(searchQuery))
    const matchesIndustry = !filterIndustry || company.industry === filterIndustry
    const matchesSize = !filterSize || company.size.includes(filterSize)
    const matchesTags = filterTags.length === 0 || filterTags.every(tag => company.tags.includes(tag))
    
    return matchesSearch && matchesIndustry && matchesSize && matchesTags
  })

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900 tracking-wide">RIGHTARM</h1>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/cfo-dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                案件一覧
              </Link>
              <Link href="/scout" className="text-gray-900 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                企業スカウト
              </Link>
              <Link href="/messages" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                メッセージ
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">2</span>
              </button>
              
              <Link href="/cfo-profile" className="w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors">
                <span className="text-sm font-medium text-white">CFO</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ページタイトル */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">企業スカウト</h2>
          <p className="text-gray-600">あなたのスキルを求めている企業を見つけて、積極的にアプローチしましょう</p>
        </div>

        {/* 検索・フィルターセクション */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="space-y-6">
            
            {/* 基本検索 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="企業名、業界、キーワードで検索"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <select
                  value={filterIndustry}
                  onChange={(e) => setFilterIndustry(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">すべての業界</option>
                  <option value="IT・ソフトウェア">IT・ソフトウェア</option>
                  <option value="金融・フィンテック">金融・フィンテック</option>
                  <option value="ヘルスケア">ヘルスケア</option>
                  <option value="コンサルティング">コンサルティング</option>
                  <option value="環境・エネルギー">環境・エネルギー</option>
                </select>
              </div>
              
              <div>
                <select
                  value={filterSize}
                  onChange={(e) => setFilterSize(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">すべての規模</option>
                  <option value="10名未満">10名未満</option>
                  <option value="10-30名">10-30名</option>
                  <option value="30-100名">30-100名</option>
                  <option value="100名以上">100名以上</option>
                </select>
              </div>
            </div>

            {/* タグフィルター */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                タグで絞り込み
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filterTags.includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {filterTags.length > 0 && (
                <div className="mt-3 flex items-center space-x-2">
                  <span className="text-sm text-gray-600">選択中:</span>
                  {filterTags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {tag}
                      <button
                        onClick={() => handleTagToggle(tag)}
                        className="ml-1 hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => setFilterTags([])}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    すべてクリア
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 検索結果 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {filteredCompanies.length}社の企業が見つかりました
            </h3>
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option>マッチ度順</option>
              <option>新着順</option>
              <option>予算が高い順</option>
              <option>企業規模順</option>
            </select>
          </div>

          {/* 企業カード一覧 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCompanies.map(company => (
              <div key={company.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  
                  {/* ヘッダー部分 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                        {company.logo}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{company.name}</h4>
                        <p className="text-sm text-gray-600">{company.industry} • {company.size} • {company.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(company.urgency)}`}>
                        {company.urgency === 'high' ? '急募' : company.urgency === 'medium' ? '通常' : '長期'}
                      </span>
                    </div>
                  </div>

                  {/* 企業情報 */}
                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">設立</span>
                      <p className="font-medium">{company.founded}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">売上</span>
                      <p className="font-medium">{company.revenue}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">最終ログイン</span>
                      <p className="font-medium">{company.lastActive}</p>
                    </div>
                  </div>

                  {/* 説明 */}
                  <p className="text-gray-700 mb-4 text-sm">{company.description}</p>

                  {/* 課題・タグ */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">求めているスキル</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {company.challenges.map(challenge => (
                          <span key={challenge} className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                            {challenge}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">企業タグ</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {company.tags.map(tag => (
                          <span key={tag} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 予算・アクション */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-500">予算</span>
                      <p className="font-semibold text-gray-900">{company.budget}</p>
                    </div>
                    <div className="flex space-x-3">
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                        詳細を見る
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                        スカウト申請
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* モバイルフッターナビゲーション */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <Link href="/cfo-dashboard" className="flex flex-col items-center py-2 text-gray-600">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
            </svg>
            <span className="text-xs">案件</span>
          </Link>
          <Link href="/scout" className="flex flex-col items-center py-2 text-blue-600">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs">スカウト</span>
          </Link>
          <Link href="/messages" className="flex flex-col items-center py-2 text-gray-600">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.991 8.991 0 01-4.683-1.317L3 21l2.317-5.317A8.991 8.991 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
            <span className="text-xs">メッセージ</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}