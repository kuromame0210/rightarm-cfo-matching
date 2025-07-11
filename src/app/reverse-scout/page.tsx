'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'
import Loading from '@/components/Loading'

export const dynamic = 'force-dynamic'

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
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    hasNext: false
  })

  // マスターデータの状態管理
  const [industries, setIndustries] = useState<any[]>([])
  const [stages, setStages] = useState<string[]>([])
  const [regions, setRegions] = useState<any[]>([])
  const [masterDataLoading, setMasterDataLoading] = useState(true)

  // マスターデータ取得
  const fetchMasterData = async () => {
    try {
      setMasterDataLoading(true)
      
      // 並列でマスターデータを取得
      const [industriesRes, regionsRes] = await Promise.all([
        fetch('/api/master/industries?popular=true'),
        fetch('/api/master/regions?popular=true')
      ])

      if (industriesRes.ok) {
        const industriesData = await industriesRes.json()
        if (industriesData.success) {
          setIndustries(industriesData.data.industries || [])
        }
      }

      if (regionsRes.ok) {
        const regionsData = await regionsRes.json()
        if (regionsData.success) {
          setRegions(regionsData.data.regions || [])
        }
      }

      // ステージは一旦固定（将来的にはマスターデータ化）
      setStages(['アーリー', 'シリーズA', 'シリーズB', 'シリーズC以降', 'IPO準備', 'その他'])

    } catch (error) {
      console.error('Master data fetch error:', error)
    } finally {
      setMasterDataLoading(false)
    }
  }

  // 企業データをAPIから取得する関数
  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
      })
      
      if (selectedIndustries.length > 0) {
        params.append('industry', selectedIndustries[0]) // 最初の選択業界を使用
      }
      if (selectedStages.length > 0) {
        params.append('stage', selectedStages[0]) // 最初の選択ステージを使用
      }
      if (selectedRegions.length > 0) {
        params.append('region', selectedRegions[0]) // 最初の選択地域を使用
      }
      
      const response = await fetch(`/api/companies/reverse-scout?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setCompanies(data.data.companies || [])
        setPagination(data.data.pagination || { total: 0, limit: 20, offset: 0, hasNext: false })
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
  }, [pagination.limit, pagination.offset, selectedIndustries, selectedStages, selectedRegions])

  useEffect(() => {
    fetchMasterData()
  }, [])

  useEffect(() => {
    if (!masterDataLoading) {
      fetchCompanies()
    }
  }, [masterDataLoading, pagination.limit, pagination.offset, selectedIndustries, selectedStages, selectedRegions, fetchCompanies])

  // フィルター選択肢をマスターデータから取得
  const industryNames = industries.map(ind => ind.name)
  const regionNames = regions.map(reg => reg.name)

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

  // フィルタリング処理（ローカルフィルタ - APIフィルタを補完）
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = searchQuery === '' || 
      (company.name && company.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (company.industry && company.industry.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (company.challengeTags && company.challengeTags.some((challenge: string) => challenge.toLowerCase().includes(searchQuery.toLowerCase())))
    
    const matchesIndustry = selectedIndustries.length === 0 || selectedIndustries.includes(company.industry)
    const matchesStage = selectedStages.length === 0 || selectedStages.includes(company.stage)
    const matchesRegion = selectedRegions.length === 0 || selectedRegions.includes(company.region)
    
    return matchesSearch && matchesIndustry && matchesStage && matchesRegion
  })

  const handleScout = (company: any) => {
    setSelectedCompany(company)
    const challengeList = company.challengeTags?.join('・') || '財務・経営課題'
    setScoutMessage(`${company.name}様

初めまして。CFOの[お名前]と申します。

貴社の${challengeList}に関する課題に対して、私の経験を活かしてお手伝いできればと思いご連絡いたします。

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
                    {industryNames.map(industry => (
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
                    {regionNames.map(region => (
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

        {/* ローディング表示 */}
        {(loading || masterDataLoading) && (
          <div className="py-12">
            <Loading size="md" text="企業データを読み込み中..." />
          </div>
        )}

        {/* 企業一覧 */}
        {!loading && !masterDataLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCompanies.map((company) => (
              <div key={company.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                {/* ヘッダー */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                      {company.logoUrl || '🏢'}
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
                    <span className={`px-2 py-1 rounded-full text-xs border ${getUrgencyBadge('medium')}`}>
                      {getUrgencyText('medium')}
                    </span>
                    <span className="text-xs text-gray-500">{company.region}</span>
                  </div>
                </div>

                {/* 課題・求める人物像 */}
                <div className="mb-4">
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">財務・経営課題</h4>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(company.challengeTags || []).map((challenge: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                          {challenge}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">{company.challengeDescription || '財務・経営課題の詳細について'}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">求める経験・スキル</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• {company.requirements?.experience || '財務・経営企画経験3年以上'}</p>
                      <p>• スキル: {company.requirements?.skills?.join(', ') || '財務分析、事業計画、資金調達'}</p>
                      <p>• 勤務: {company.requirements?.workStyle || '週2-3日・リモート可'}</p>
                    </div>
                  </div>
                </div>

                {/* 企業情報 */}
                <div className="mb-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500">設立:</span>
                      <span className="ml-1">{company.foundedYear || '非公開'}年</span>
                    </div>
                    <div>
                      <span className="text-gray-500">報酬:</span>
                      <span className="ml-1 font-medium">{company.compensation || '応相談'}</span>
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
        )}

        {!loading && !masterDataLoading && filteredCompanies.length === 0 && (
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