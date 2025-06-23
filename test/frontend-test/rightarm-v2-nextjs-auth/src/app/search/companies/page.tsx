'use client'

import { useState } from 'react'
import DashboardHeader from '@/components/DashboardHeader'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function CompanySearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([])
  const [selectedIndustry, setSelectedIndustry] = useState('')
  const [selectedRevenue, setSelectedRevenue] = useState('')

  // サンプル企業データ（youbou_v2.md仕様準拠）
  const companyProfiles = [
    {
      id: 1,
      companyName: '株式会社テックスタート',
      businessName: 'AI-SaaSプラットフォーム',
      overview: 'BtoB向けAIソリューションを提供するスタートアップ企業。急成長中で事業拡大を目指している。',
      challenge: '資金調達・IPO準備',
      challengeBackground: 'シリーズBラウンドの資金調達を予定。2年後のIPOを目標としており、管理体制の整備が急務。',
      cfoRequirements: 'IPO経験のあるCFO、VC対応経験必須、週2-3日稼働可能な方',
      expectedTiming: '2024年4月〜',
      industry: 'IT・Web',
      revenue: '年商8億円',
      employees: '50名',
      location: '東京'
    },
    {
      id: 2,
      companyName: '製造業ABC株式会社',
      businessName: '精密機械部品製造',
      overview: '創業50年の老舗メーカー。自動車部品を中心とした精密機械部品の製造・販売。',
      challenge: '管理会計強化',
      challengeBackground: '原価計算の精度が低く、部門別の収益性が把握できていない。月次決算も20日かかっている状況。',
      cfoRequirements: '製造業での管理会計経験者、ERP導入経験、地方対応可能な方',
      expectedTiming: '2024年3月〜',
      industry: '製造業',
      revenue: '年商50億円',
      employees: '200名',
      location: '愛知'
    },
    {
      id: 3,
      companyName: '地方物流株式会社',
      businessName: '地域密着型物流サービス',
      overview: '九州エリアを中心とした物流・配送サービス。地域密着型で安定した顧客基盤を持つ。',
      challenge: '事業承継・M&A',
      challengeBackground: '創業者の高齢化により事業承継が課題。後継者不在のため第三者承継を検討中。',
      cfoRequirements: 'M&A・事業承継の実績必須、企業価値評価経験、地方企業への理解',
      expectedTiming: '2024年6月〜',
      industry: '物流・運輸',
      revenue: '年商30億円',
      employees: '150名',
      location: '福岡'
    },
    {
      id: 4,
      companyName: 'フードテック合同会社',
      businessName: '植物性代替食品開発',
      overview: '環境に配慮した植物性食品の開発・製造を行うスタートアップ。ESG投資にも注目されている。',
      challenge: '補助金・助成金活用',
      challengeBackground: '研究開発費が高額で資金繰りが厳しい。政府の補助金制度を活用したいが申請ノウハウがない。',
      cfoRequirements: '補助金申請の実績多数、食品業界への理解、スタートアップ支援経験',
      expectedTiming: '2024年5月〜',
      industry: '食品・バイオ',
      revenue: '年商2億円',
      employees: '25名',
      location: '大阪'
    }
  ]

  const challengeOptions = [
    '資金調達', 'IPO準備', 'M&A', '管理会計強化', '事業承継',
    '補助金・助成金活用', '経営管理DX', '事業再生', '財務分析'
  ]

  const toggleChallenge = (challenge: string) => {
    setSelectedChallenges(prev =>
      prev.includes(challenge)
        ? prev.filter(c => c !== challenge)
        : [...prev, challenge]
    )
  }

  const filteredCompanies = companyProfiles.filter(company => {
    const matchesSearch = searchQuery === '' || 
      company.companyName.includes(searchQuery) || 
      company.businessName.includes(searchQuery) ||
      company.overview.includes(searchQuery) ||
      company.challenge.includes(searchQuery)
    
    const matchesChallenges = selectedChallenges.length === 0 || 
      selectedChallenges.some(challenge => company.challenge.includes(challenge))
    
    const matchesIndustry = selectedIndustry === '' || company.industry === selectedIndustry
    
    return matchesSearch && matchesChallenges && matchesIndustry
  })

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      <DashboardHeader currentPage="home" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* サイドバー（フィルター） */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">企業を探す</h3>
              
              {/* キーワード検索 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  キーワード検索
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="会社名、事業内容、課題など"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              {/* 財務課題フィルター */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  財務課題
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {challengeOptions.map((challenge) => (
                    <label key={challenge} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedChallenges.includes(challenge)}
                        onChange={() => toggleChallenge(challenge)}
                        className="mr-2 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                      />
                      <span className="text-sm text-gray-600">{challenge}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 業界フィルター */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  業界
                </label>
                <select 
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                >
                  <option value="">すべて</option>
                  <option value="IT・Web">IT・Web</option>
                  <option value="製造業">製造業</option>
                  <option value="物流・運輸">物流・運輸</option>
                  <option value="食品・バイオ">食品・バイオ</option>
                </select>
              </div>

              {/* 売上規模フィルター */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  売上規模
                </label>
                <select 
                  value={selectedRevenue}
                  onChange={(e) => setSelectedRevenue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                >
                  <option value="">指定なし</option>
                  <option value="1億円未満">1億円未満</option>
                  <option value="1-10億円">1億円〜10億円</option>
                  <option value="10-50億円">10億円〜50億円</option>
                  <option value="50億円以上">50億円以上</option>
                </select>
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="lg:w-3/4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                企業一覧
              </h2>
              <p className="text-gray-600">
                {filteredCompanies.length}社の企業が見つかりました
              </p>
            </div>

            {/* 企業プロフィールカード */}
            <div className="grid gap-6">
              {filteredCompanies.map((company) => (
                <div key={company.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {company.companyName}
                      </h3>
                      <p className="text-gray-600 font-medium">{company.businessName}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{company.industry}</span>
                        <span>{company.revenue}</span>
                        <span>従業員{company.employees}</span>
                        <span>{company.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-full">
                        {company.challenge}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">{company.expectedTiming}</p>
                    </div>
                  </div>

                  {/* 会社概要 */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">会社概要</h4>
                    <p className="text-sm text-gray-600">{company.overview}</p>
                  </div>

                  {/* 課題の背景や状況 */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">抱えている財務課題・背景</h4>
                    <p className="text-sm text-gray-600">{company.challengeBackground}</p>
                  </div>

                  {/* CFOに求めたいこと */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">CFOに求めたいこと</h4>
                    <p className="text-sm text-gray-600">{company.cfoRequirements}</p>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                      気になる
                    </button>
                    <button className="px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors">
                      応募
                    </button>
                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                      詳細を見る
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredCompanies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">条件に一致する企業が見つかりませんでした。</p>
                <p className="text-sm text-gray-400 mt-1">検索条件を変更してお試しください。</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  )
}