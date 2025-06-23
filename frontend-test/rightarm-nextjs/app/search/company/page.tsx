'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Search, Filter, MapPin, Building2, DollarSign, Users, Eye, MessageSquare, TrendingUp } from 'lucide-react'

const CompanySearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState({
    industry: [],
    size: '',
    location: '',
    challenges: '',
    budget: ''
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  }

  const companies = [
    {
      id: 1,
      name: '株式会社テックイノベーション',
      industry: 'IT・テクノロジー',
      size: '従業員80名',
      revenue: '年商12億円',
      location: '東京都渋谷区',
      challenges: ['資金調達', 'IPO準備'],
      budget: '月80-120万円',
      description: 'AIを活用したSaaSプロダクトを展開する成長企業。次回の資金調達に向けて財務体制の強化を図りたい。',
      workStyle: 'リモート可・週2-3日',
      urgency: '急募',
      founded: '2018年',
      stage: 'シリーズB準備中'
    },
    {
      id: 2,
      name: '株式会社地域製造業',
      industry: '製造業',
      size: '従業員120名',
      revenue: '年商25億円',
      location: '愛知県名古屋市',
      challenges: ['管理会計', 'コスト削減'],
      budget: '月60-80万円',
      description: '自動車部品の製造を手がける老舗企業。デジタル化による管理会計の強化と原価管理の改善を目指している。',
      workStyle: '月1-2回出社・リモート併用',
      urgency: '通常',
      founded: '1985年',
      stage: '安定成長期'
    },
    {
      id: 3,
      name: '株式会社リテールチェーン',
      industry: '小売・EC',
      size: '従業員200名',
      revenue: '年商45億円',
      location: '大阪府大阪市',
      challenges: ['M&A', '事業承継'],
      budget: '月100-150万円',
      description: '関西圏でチェーン展開する小売企業。M&Aによる事業拡大と将来的な事業承継の準備を進めたい。',
      workStyle: '月3-4回出社',
      urgency: '通常',
      founded: '1995年',
      stage: '事業拡大期'
    },
    {
      id: 4,
      name: '株式会社バイオテック',
      industry: 'バイオ・医療',
      size: '従業員45名',
      revenue: '年商8億円',
      location: '神奈川県横浜市',
      challenges: ['補助金申請', '研究開発資金'],
      budget: '月70-100万円',
      description: 'バイオテクノロジーの研究開発企業。政府補助金の活用と研究開発資金の調達支援を求めている。',
      workStyle: 'リモート可・週1-2日',
      urgency: '急募',
      founded: '2020年',
      stage: 'アーリーステージ'
    }
  ]

  const industryOptions = ['IT・テクノロジー', '製造業', '小売・EC', 'バイオ・医療', '建設業', '金融・保険', 'サービス業']
  const challengeOptions = ['資金調達', 'IPO準備', 'M&A', '管理会計', 'コスト削減', '補助金申請', '事業承継']

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case '急募': return 'bg-red-100 text-red-800'
      case '通常': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div className="mb-8" variants={itemVariants}>
            <h1 className="text-3xl font-thin tracking-wide text-gray-900 mb-2">
              企業を探す
            </h1>
            <p className="text-gray-600">あなたの専門性を活かせる企業を見つけましょう</p>
          </motion.div>

          {/* Search Bar */}
          <motion.div className="mb-8" variants={itemVariants}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="企業名、業界、課題で検索..."
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Filters */}
            <motion.div className="lg:col-span-1" variants={itemVariants}>
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <div className="flex items-center mb-6">
                  <Filter className="w-5 h-5 mr-2" />
                  <h2 className="text-lg font-medium">フィルター</h2>
                </div>

                {/* Industry Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">業界</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {industryOptions.map((industry) => (
                      <label key={industry} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-black focus:ring-black"
                          checked={selectedFilters.industry.includes(industry)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFilters(prev => ({
                                ...prev,
                                industry: [...prev.industry, industry]
                              }))
                            } else {
                              setSelectedFilters(prev => ({
                                ...prev,
                                industry: prev.industry.filter(i => i !== industry)
                              }))
                            }
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-700">{industry}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Company Size Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">企業規模</h3>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedFilters.size}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, size: e.target.value }))}
                  >
                    <option value="">すべて</option>
                    <option value="small">50名未満</option>
                    <option value="medium">50-200名</option>
                    <option value="large">200名以上</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">所在地</h3>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedFilters.location}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, location: e.target.value }))}
                  >
                    <option value="">すべて</option>
                    <option value="tokyo">東京</option>
                    <option value="osaka">大阪</option>
                    <option value="nagoya">名古屋</option>
                    <option value="other">その他地域</option>
                  </select>
                </div>

                {/* Challenges Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">課題</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {challengeOptions.map((challenge) => (
                      <label key={challenge} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="ml-2 text-sm text-gray-700">{challenge}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Budget Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">予算</h3>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedFilters.budget}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, budget: e.target.value }))}
                  >
                    <option value="">すべて</option>
                    <option value="0-50">50万円以下</option>
                    <option value="50-100">50-100万円</option>
                    <option value="100-150">100-150万円</option>
                    <option value="150+">150万円以上</option>
                  </select>
                </div>

                <button 
                  className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                  onClick={() => setSelectedFilters({ industry: [], size: '', location: '', challenges: '', budget: '' })}
                >
                  フィルターをクリア
                </button>
              </div>
            </motion.div>

            {/* Results */}
            <motion.div className="lg:col-span-3" variants={itemVariants}>
              <div className="mb-6 flex justify-between items-center">
                <p className="text-gray-600">{companies.length}件の企業が見つかりました</p>
                <select className="p-2 border border-gray-300 rounded-md">
                  <option>おすすめ順</option>
                  <option>予算順</option>
                  <option>設立年順</option>
                  <option>企業規模順</option>
                </select>
              </div>

              <div className="space-y-6">
                {companies.map((company, index) => (
                  <motion.div
                    key={company.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Company Logo */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-gray-400" />
                        </div>
                      </div>

                      {/* Main Info */}
                      <div className="flex-1">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-medium text-gray-900">{company.name}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${getUrgencyColor(company.urgency)}`}>
                                {company.urgency}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-2">{company.industry}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                {company.size}
                              </span>
                              <span className="flex items-center">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                {company.revenue}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {company.location}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>設立: {company.founded}</span>
                              <span>ステージ: {company.stage}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 mb-1">予算</p>
                            <p className="text-lg font-medium text-gray-900">{company.budget}</p>
                            <p className="text-sm text-gray-600 mt-1">{company.workStyle}</p>
                          </div>
                        </div>

                        {/* Challenges */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">解決したい課題</h4>
                          <div className="flex flex-wrap gap-2">
                            {company.challenges.map((challenge, chalIndex) => (
                              <span 
                                key={chalIndex}
                                className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                              >
                                {challenge}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 mb-6">{company.description}</p>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <motion.button
                            className="flex-1 py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            詳細を見る
                          </motion.button>
                          <motion.button
                            className="flex-1 py-3 px-6 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            応募する
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-8 flex justify-center">
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">前</button>
                  <button className="px-4 py-2 bg-black text-white rounded-md">1</button>
                  <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">2</button>
                  <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">3</button>
                  <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">次</button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default CompanySearchPage