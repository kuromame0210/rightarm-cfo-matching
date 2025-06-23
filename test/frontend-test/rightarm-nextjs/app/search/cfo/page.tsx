'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Search, Filter, MapPin, Clock, DollarSign, Star, MessageSquare, Eye } from 'lucide-react'

const CFOSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState({
    specialty: [],
    experience: '',
    location: '',
    availability: '',
    rate: ''
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

  const cfos = [
    {
      id: 1,
      name: '山田 太郎',
      title: '元メガバンク CFO',
      experience: '15年',
      specialties: ['資金調達', 'IPO準備', '銀行折衝'],
      location: '東京',
      availability: '週2-3日',
      rate: '月80-120万円',
      rating: 4.9,
      reviewCount: 12,
      description: 'メガバンクで15年間の経験を持ち、IPO準備から資金調達まで幅広くサポート。特に銀行との折衝に強みを持っています。',
      achievements: ['IPO成功: 3社', '資金調達総額: 50億円'],
      remote: true,
      responseRate: 95
    },
    {
      id: 2,
      name: '田中 花子',
      title: 'スタートアップCFO経験者',
      experience: '12年',
      specialties: ['管理会計', '財務分析', 'KPI設計'],
      location: '大阪',
      availability: '週1-2日',
      rate: '月60-90万円',
      rating: 4.8,
      reviewCount: 8,
      description: '複数のスタートアップでCFOを経験。管理会計の導入と財務分析による経営支援が得意分野です。',
      achievements: ['管理会計導入: 10社', 'KPI設計: 15社'],
      remote: true,
      responseRate: 88
    },
    {
      id: 3,
      name: '佐藤 次郎',
      title: 'PEファンド出身',
      experience: '18年',
      specialties: ['M&A', '事業再生', 'バリュエーション'],
      location: '東京',
      availability: '週3-4日',
      rate: '月100-150万円',
      rating: 4.9,
      reviewCount: 15,
      description: 'PEファンドでの豊富な経験を活かし、M&Aアドバイザリーと事業再生支援を専門としています。',
      achievements: ['M&A成約: 20件', '事業再生: 5社'],
      remote: false,
      responseRate: 92
    },
    {
      id: 4,
      name: '鈴木 美咲',
      title: '公認会計士・元監査法人',
      experience: '10年',
      specialties: ['内部統制', '監査対応', 'IPO準備'],
      location: '名古屋',
      availability: '週1-2日',
      rate: '月70-100万円',
      rating: 4.7,
      reviewCount: 6,
      description: '監査法人での経験を活かし、内部統制構築とIPO準備支援を得意としています。',
      achievements: ['IPO準備: 5社', '内部統制構築: 8社'],
      remote: true,
      responseRate: 90
    }
  ]

  const specialtyOptions = ['資金調達', 'IPO準備', 'M&A', '管理会計', '財務分析', '事業再生', '内部統制', 'KPI設計']

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
              CFOを探す
            </h1>
            <p className="text-gray-600">あなたの課題に最適なCFOを見つけましょう</p>
          </motion.div>

          {/* Search Bar */}
          <motion.div className="mb-8" variants={itemVariants}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="専門分野、経験、キーワードで検索..."
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

                {/* Specialty Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">専門分野</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {specialtyOptions.map((specialty) => (
                      <label key={specialty} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-black focus:ring-black"
                          checked={selectedFilters.specialty.includes(specialty)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFilters(prev => ({
                                ...prev,
                                specialty: [...prev.specialty, specialty]
                              }))
                            } else {
                              setSelectedFilters(prev => ({
                                ...prev,
                                specialty: prev.specialty.filter(s => s !== specialty)
                              }))
                            }
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-700">{specialty}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Experience Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">経験年数</h3>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedFilters.experience}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, experience: e.target.value }))}
                  >
                    <option value="">すべて</option>
                    <option value="5-">5年未満</option>
                    <option value="5-10">5-10年</option>
                    <option value="10-15">10-15年</option>
                    <option value="15+">15年以上</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">勤務地</h3>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedFilters.location}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, location: e.target.value }))}
                  >
                    <option value="">すべて</option>
                    <option value="tokyo">東京</option>
                    <option value="osaka">大阪</option>
                    <option value="nagoya">名古屋</option>
                    <option value="remote">リモート可</option>
                  </select>
                </div>

                {/* Availability Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">稼働日数</h3>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedFilters.availability}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, availability: e.target.value }))}
                  >
                    <option value="">すべて</option>
                    <option value="1">週1日</option>
                    <option value="2">週2日</option>
                    <option value="3">週3日以上</option>
                  </select>
                </div>

                {/* Rate Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">月額報酬</h3>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={selectedFilters.rate}
                    onChange={(e) => setSelectedFilters(prev => ({ ...prev, rate: e.target.value }))}
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
                  onClick={() => setSelectedFilters({ specialty: [], experience: '', location: '', availability: '', rate: '' })}
                >
                  フィルターをクリア
                </button>
              </div>
            </motion.div>

            {/* Results */}
            <motion.div className="lg:col-span-3" variants={itemVariants}>
              <div className="mb-6 flex justify-between items-center">
                <p className="text-gray-600">{cfos.length}件のCFOが見つかりました</p>
                <select className="p-2 border border-gray-300 rounded-md">
                  <option>おすすめ順</option>
                  <option>評価順</option>
                  <option>経験年数順</option>
                  <option>料金順</option>
                </select>
              </div>

              <div className="space-y-6">
                {cfos.map((cfo, index) => (
                  <motion.div
                    key={cfo.id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Profile Image */}
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 bg-gray-200 rounded-lg" />
                      </div>

                      {/* Main Info */}
                      <div className="flex-1">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4">
                          <div>
                            <h3 className="text-xl font-medium text-gray-900 mb-1">{cfo.name}</h3>
                            <p className="text-gray-600 mb-2">{cfo.title}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                経験 {cfo.experience}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {cfo.location} {cfo.remote && '(リモート可)'}
                              </span>
                              <span className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-1" />
                                {cfo.rate}
                              </span>
                            </div>
                            <div className="flex items-center mb-3">
                              <div className="flex items-center mr-4">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < Math.floor(cfo.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                                <span className="text-sm text-gray-600 ml-2">{cfo.rating} ({cfo.reviewCount}件)</span>
                              </div>
                              <span className="text-sm text-green-600">返信率 {cfo.responseRate}%</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600 mb-1">稼働可能</p>
                            <p className="text-lg font-medium text-gray-900">{cfo.availability}</p>
                          </div>
                        </div>

                        {/* Specialties */}
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {cfo.specialties.map((specialty, specIndex) => (
                              <span 
                                key={specIndex}
                                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                              >
                                {specialty}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 mb-4">{cfo.description}</p>

                        {/* Achievements */}
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">主な実績</h4>
                          <div className="flex flex-wrap gap-2">
                            {cfo.achievements.map((achievement, achIndex) => (
                              <span 
                                key={achIndex}
                                className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                              >
                                {achievement}
                              </span>
                            ))}
                          </div>
                        </div>

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
                            スカウトを送る
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

export default CFOSearchPage