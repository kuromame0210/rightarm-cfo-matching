'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

export default function ReverseScoutPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])
  const [selectedStages, setSelectedStages] = useState<string[]>([])
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [scoutedCompanies, setScoutedCompanies] = useState<number[]>([])
  const [showScoutModal, setShowScoutModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<any>(null)
  const [scoutMessage, setScoutMessage] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // v5.1仕様書準拠：企業情報表示項目増強
  const companies = [
    {
      id: 1,
      name: '株式会社テックスタート',
      logoUrl: '🏢',
      industry: 'SaaS・IT',
      stage: 'シリーズA',
      employeeCount: '30-50名',
      region: '東京',
      foundedYear: 2020,
      // 財務・経営課題
      challenges: ['資金調達準備', 'IPO準備', '管理会計強化'],
      challengeDescription: 'シリーズA調達完了後、次のシリーズBに向けた準備を進めており、財務体制の強化が急務',
      // 求める人物像・背景
      requirements: {
        experience: '上場企業またはIPO準備企業での財務経験3年以上',
        skills: ['資金調達', 'IR業務', '管理会計'],
        workStyle: '週2-3日・リモート可',
        commitment: '中長期コミット希望（1年以上）'
      },
      // 企業背景
      background: 'HR-Tech領域のSaaS企業。急成長中で組織拡大に伴う財務体制構築が必要',
      vision: '人事の未来を変えるプラットフォームの構築',
      cultureKeywords: ['スピード重視', 'データドリブン', 'チャレンジ歓迎'],
      // 条件
      compensation: '月80万円〜120万円',
      benefits: ['ストックオプション', 'フルリモート可', '副業OK'],
      location: '渋谷オフィス（フルリモート可）',
      urgency: 'high',
      recruiterType: 'direct' // direct: 直接募集, agency: エージェント経由
    },
    {
      id: 2,
      name: '株式会社グリーンエナジー',
      logoUrl: '🌱',
      industry: '再生エネルギー',
      stage: 'シリーズB',
      employeeCount: '100-200名',
      region: '大阪',
      foundedYear: 2018,
      challenges: ['海外展開準備', '財務DX', 'コスト管理'],
      challengeDescription: '海外展開に向けて国際会計基準への対応と資金調達戦略の策定が必要',
      requirements: {
        experience: '製造業または海外展開企業での財務経験5年以上',
        skills: ['IFRS', '海外子会社管理', 'M&A'],
        workStyle: '週3-4日・一部出社',
        commitment: '長期コミット必須（2年以上）'
      },
      background: '太陽光発電システムの開発・販売。アジア展開を加速中',
      vision: '持続可能なエネルギー社会の実現',
      cultureKeywords: ['ESG重視', '長期視点', '技術革新'],
      compensation: '月100万円〜150万円',
      benefits: ['RSU', '海外出張機会', '社会保険完備'],
      location: '大阪本社・東京支社',
      urgency: 'medium',
      recruiterType: 'direct'
    },
    {
      id: 3,
      name: '株式会社フードテック',
      logoUrl: '🍜',
      industry: 'フードテック',
      stage: 'アーリー',
      employeeCount: '10-30名',
      region: '東京',
      foundedYear: 2022,
      challenges: ['資金調達', '事業計画策定', '基礎財務構築'],
      challengeDescription: 'シードラウンド完了後、プロダクト開発加速のためシリーズA調達を準備中',
      requirements: {
        experience: 'スタートアップでの財務経験2年以上',
        skills: ['資金調達', '事業計画', 'Excel/スプレッドシート'],
        workStyle: '週2日〜・リモート歓迎',
        commitment: '成長に合わせて柔軟対応'
      },
      background: '代替肉・培養肉技術の研究開発スタートアップ',
      vision: '食料問題解決を通じた持続可能な未来',
      cultureKeywords: ['イノベーション', 'SDGs', 'アジャイル'],
      compensation: '月60万円〜90万円',
      benefits: ['ストックオプション大量付与', '裁量労働制', '書籍購入支援'],
      location: '品川オフィス（リモート中心）',
      urgency: 'high',
      recruiterType: 'direct'
    }
  ]

  // フィルター選択肢
  const industries = ['SaaS・IT', 'フィンテック', '再生エネルギー', 'フードテック', 'ヘルスケア', 'エンタメ', 'EC・小売', 'その他']
  const stages = ['アーリー', 'シリーズA', 'シリーズB', 'シリーズC以降', 'IPO準備', 'その他']
  const regions = ['東京', '大阪', '愛知', '福岡', '全国', 'リモート可']

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleIndustryToggle = (industry: string) => {
    setSelectedIndustries(prev => 
      prev.includes(industry) 
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    )
  }

  const handleStageToggle = (stage: string) => {
    setSelectedStages(prev => 
      prev.includes(stage) 
        ? prev.filter(s => s !== stage)
        : [...prev, stage]
    )
  }

  const handleRegionToggle = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region)
        : [...prev, region]
    )
  }

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = searchQuery === '' || 
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.challenges.some(challenge => challenge.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesIndustry = selectedIndustries.length === 0 || selectedIndustries.includes(company.industry)
    const matchesStage = selectedStages.length === 0 || selectedStages.includes(company.stage)
    const matchesRegion = selectedRegions.length === 0 || selectedRegions.includes(company.region)
    
    return matchesSearch && matchesIndustry && matchesStage && matchesRegion
  })

  const handleScout = (company: any) => {
    setSelectedCompany(company)
    setScoutMessage(`${company.name}様

初めまして。CFOの[お名前]と申します。

貴社の${company.challenges.join('・')}に関する課題に対して、私の経験を活かしてお手伝いできればと思いご連絡いたします。

[具体的な実績や提案を記載してください]

ご検討いただけますと幸いです。

よろしくお願いいたします。`)
    setShowScoutModal(true)
  }

  const handleSendScout = () => {
    if (!selectedCompany || scoutMessage.trim().length < 50) {
      showToastMessage('50文字以上のメッセージを入力してください')
      return
    }

    setScoutedCompanies(prev => [...prev, selectedCompany.id])
    showToastMessage(`${selectedCompany.name}にスカウトを送信しました`)
    setShowScoutModal(false)
    setScoutMessage('')
    setSelectedCompany(null)
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high': return '急募'
      case 'medium': return '通常'
      case 'low': return '長期'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader isLoggedIn={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* ページヘッダー */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                逆スカウト
              </h1>
              <p className="text-gray-600">
                CFOを求める企業を検索し、積極的にアプローチしましょう
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">検索結果</p>
              <p className="text-2xl font-bold text-gray-900">{filteredCompanies.length}社</p>
            </div>
          </div>

          {/* 検索バー */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="企業名・業界・課題で検索..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center md:justify-start"
            >
              🔍 詳細フィルター
            </button>
          </div>

          {/* フィルター */}
          {showFilters && (
            <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 業界 */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">業界</h3>
                  <div className="space-y-2">
                    {industries.map(industry => (
                      <label key={industry} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedIndustries.includes(industry)}
                          onChange={() => handleIndustryToggle(industry)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{industry}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* ステージ */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">成長ステージ</h3>
                  <div className="space-y-2">
                    {stages.map(stage => (
                      <label key={stage} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedStages.includes(stage)}
                          onChange={() => handleStageToggle(stage)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{stage}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 地域 */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">勤務地</h3>
                  <div className="space-y-2">
                    {regions.map(region => (
                      <label key={region} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedRegions.includes(region)}
                          onChange={() => handleRegionToggle(region)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{region}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 企業一覧 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* ヘッダー */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                    {company.logoUrl}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{company.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{company.industry}</span>
                      <span>•</span>
                      <span>{company.stage}</span>
                      <span>•</span>
                      <span>{company.employeeCount}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 rounded-full text-xs border ${getUrgencyBadge(company.urgency)}`}>
                    {getUrgencyText(company.urgency)}
                  </span>
                  <span className="text-xs text-gray-500">{company.region}</span>
                </div>
              </div>

              {/* 課題・求める人物像 */}
              <div className="mb-4">
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">財務・経営課題</h4>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {company.challenges.map((challenge, index) => (
                      <span key={index} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                        {challenge}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">{company.challengeDescription}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">求める経験・スキル</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• {company.requirements.experience}</p>
                    <p>• スキル: {company.requirements.skills.join(', ')}</p>
                    <p>• 勤務: {company.requirements.workStyle}</p>
                  </div>
                </div>
              </div>

              {/* 企業情報 */}
              <div className="mb-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500">設立:</span>
                    <span className="ml-1">{company.foundedYear}年</span>
                  </div>
                  <div>
                    <span className="text-gray-500">報酬:</span>
                    <span className="ml-1 font-medium">{company.compensation}</span>
                  </div>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex space-x-3">
                <Link 
                  href={`/company/${company.id}`}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center text-sm font-medium"
                >
                  詳細を見る
                </Link>
                <button
                  onClick={() => handleScout(company)}
                  disabled={scoutedCompanies.includes(company.id)}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    scoutedCompanies.includes(company.id)
                      ? 'bg-green-100 text-green-800 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {scoutedCompanies.includes(company.id) ? 'スカウト済み' : 'スカウト'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 mb-2">条件に合う企業が見つかりませんでした</p>
            <p className="text-sm text-gray-400">検索条件を変更してもう一度お試しください</p>
          </div>
        )}
      </div>

      {/* スカウトモーダル */}
      {showScoutModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">スカウト送信</h2>
                <button
                  onClick={() => setShowScoutModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                    {selectedCompany.logoUrl}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{selectedCompany.name}</h3>
                    <p className="text-sm text-gray-600">{selectedCompany.industry} • {selectedCompany.stage}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  スカウトメッセージ <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={scoutMessage}
                  onChange={(e) => setScoutMessage(e.target.value)}
                  placeholder="企業に送るメッセージを入力してください（50文字以上）"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={8}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    {scoutMessage.length < 50 ? `あと${50 - scoutMessage.length}文字入力してください` : '入力完了'}
                  </p>
                  <p className="text-sm text-gray-500">{scoutMessage.length}/1000文字</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowScoutModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSendScout}
                  disabled={scoutMessage.trim().length < 50}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    scoutMessage.trim().length >= 50
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  スカウトを送信
                </button>
              </div>
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