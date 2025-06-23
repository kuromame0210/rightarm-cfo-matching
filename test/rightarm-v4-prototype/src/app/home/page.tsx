'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [filterSkill, setFilterSkill] = useState('')

  // サンプルCFOデータ
  const cfos = [
    {
      id: 1,
      name: '田中 太郎',
      experience: '15年以上',
      skills: ['資金調達支援', 'IPO・M&A関連', '管理会計構築'],
      location: '東京都',
      rate: '100〜200万円',
      rating: 4.8,
      reviews: 24,
      bio: '大手商社でのCFO経験を活かし、スタートアップの資金調達から上場まで幅広く支援しています。',
      workStyle: 'リモート可'
    },
    {
      id: 2,
      name: '佐藤 花子',
      experience: '8-15年',
      skills: ['財務DX・システム導入', '事業再生・事業承継'],
      location: '大阪府',
      rate: '50〜100万円',
      rating: 4.9,
      reviews: 18,
      bio: 'IT企業での財務責任者として、システム導入から業務効率化まで実践的な支援を提供します。',
      workStyle: 'どちらでも可'
    },
    {
      id: 3,
      name: '山田 次郎',
      experience: '4-7年',
      skills: ['管理会計構築', '組織・ガバナンス関連'],
      location: '愛知県',
      rate: '〜50万円',
      rating: 4.7,
      reviews: 12,
      bio: '中小企業の管理会計体制構築に特化。現場に寄り添った実用的な仕組み作りが得意です。',
      workStyle: '出社必要'
    }
  ]

  const filteredCfos = cfos.filter(cfo => {
    const matchesSearch = cfo.name.includes(searchQuery) || 
                         cfo.skills.some(skill => skill.includes(searchQuery)) ||
                         cfo.bio.includes(searchQuery)
    const matchesLocation = !filterLocation || cfo.location === filterLocation
    const matchesSkill = !filterSkill || cfo.skills.includes(filterSkill)
    
    return matchesSearch && matchesLocation && matchesSkill
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* ロゴ */}
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900 tracking-wide">RIGHTARM</h1>
            </div>
            
            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/home" className="text-gray-900 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                CFOを探す
              </Link>
              <Link href="/messages" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                メッセージ
              </Link>
            </nav>

            {/* 右側メニュー */}
            <div className="flex items-center space-x-4">
              {/* 通知ベル */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </button>
              
              {/* ユーザーメニュー */}
              <div className="relative">
                <Link href="/profile" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">企</span>
                  </div>
                  <span className="hidden md:block text-sm">企業アカウント</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 検索セクション */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">CFOを探す</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 検索クエリ */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="名前、スキル、キーワードで検索"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              />
            </div>
            
            {/* 地域フィルター */}
            <div>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                <option value="">すべての地域</option>
                <option value="東京都">東京都</option>
                <option value="神奈川県">神奈川県</option>
                <option value="大阪府">大阪府</option>
                <option value="愛知県">愛知県</option>
              </select>
            </div>
            
            {/* スキルフィルター */}
            <div>
              <select
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              >
                <option value="">すべてのスキル</option>
                <option value="資金調達支援">資金調達支援</option>
                <option value="IPO・M&A関連">IPO・M&A関連</option>
                <option value="管理会計構築">管理会計構築</option>
                <option value="財務DX・システム導入">財務DX・システム導入</option>
                <option value="事業再生・事業承継">事業再生・事業承継</option>
                <option value="組織・ガバナンス関連">組織・ガバナンス関連</option>
              </select>
            </div>
          </div>
        </div>

        {/* 検索結果 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              検索結果: {filteredCfos.length}名のCFOが見つかりました
            </h3>
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent">
              <option>おすすめ順</option>
              <option>評価が高い順</option>
              <option>経験年数順</option>
              <option>料金が安い順</option>
            </select>
          </div>

          {/* CFOカード一覧 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCfos.map(cfo => (
              <div key={cfo.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* ヘッダー部分 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold">{cfo.name[0]}</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{cfo.name}</h4>
                        <p className="text-sm text-gray-600">{cfo.location} • {cfo.workStyle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-sm font-medium">{cfo.rating}</span>
                        <span className="text-xs text-gray-500">({cfo.reviews})</span>
                      </div>
                    </div>
                  </div>

                  {/* 基本情報 */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">経験年数</span>
                      <p className="text-sm text-gray-900">{cfo.experience}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">希望報酬（月額）</span>
                      <p className="text-sm text-gray-900">{cfo.rate}</p>
                    </div>
                  </div>

                  {/* スキルタグ */}
                  <div className="mb-4">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">専門スキル</span>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {cfo.skills.map(skill => (
                        <span key={skill} className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 自己紹介 */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 line-clamp-3">{cfo.bio}</p>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex space-x-3">
                    <Link 
                      href={`/cfo/${cfo.id}`}
                      className="flex-1 bg-gray-900 text-white text-center py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      詳細を見る
                    </Link>
                    <button className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                      メッセージ
                    </button>
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
          <Link href="/home" className="flex flex-col items-center py-2 text-gray-900">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs">探す</span>
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