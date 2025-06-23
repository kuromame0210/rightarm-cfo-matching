'use client'

import { useState } from 'react'
import DashboardHeader from '@/components/DashboardHeader'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState('')
  const [selectedExperience, setSelectedExperience] = useState('')

  // サンプルCFOデータ（youbou_v2.md仕様準拠）
  const cfoProfiles = [
    {
      id: 1,
      name: '山田 太郎',
      nickname: 'やまちゃん',
      skills: ['資金調達', 'IPO準備', '銀行融資', 'VC・エクイティ調達支援'],
      experience: '大手証券会社で15年間勤務。IPO支援実績20社以上。',
      qualifications: ['公認会計士', '証券アナリスト'],
      workStyle: 'リモート可・週1〜3日',
      salaryRange: '月80万円〜150万円',
      introduction: 'スタートアップから中堅企業まで、幅広い資金調達支援が可能です。特にIPO準備においては豊富な実績があります。',
      location: '東京',
      avatar: '/placeholder-avatar.jpg'
    },
    {
      id: 2,
      name: '田中 花子',
      nickname: '田中さん',
      skills: ['管理会計', '財務分析', 'ERP導入', '月次決算の早期化'],
      experience: '監査法人出身。中小企業の財務改善支援12年。',
      qualifications: ['公認会計士', 'システム監査技術者'],
      workStyle: '週1〜2日・関西圏',
      salaryRange: '月60万円〜100万円',
      introduction: '製造業を中心とした管理会計の構築が得意です。ERPシステム導入から運用まで一貫してサポートします。',
      location: '大阪',
      avatar: '/placeholder-avatar.jpg'
    },
    {
      id: 3,
      name: '佐藤 次郎',
      nickname: 'サトジ',
      skills: ['M&A', '事業再生', 'バリュエーション', '財務DD対応'],
      experience: 'PEファンドで18年間M&A案件を担当。事業再生実績多数。',
      qualifications: ['公認会計士', 'バリュエーション・アナリスト'],
      workStyle: 'フルリモート・プロジェクトベース',
      salaryRange: '月100万円〜200万円',
      introduction: 'M&Aや事業再生のスペシャリストです。企業価値向上に向けた戦略的財務アドバイスを提供します。',
      location: '愛知',
      avatar: '/placeholder-avatar.jpg'
    },
    {
      id: 4,
      name: '鈴木 美咲',
      nickname: 'みさきん',
      skills: ['補助金・助成金申請支援', '資金繰り表の作成・改善', '銀行融資対応'],
      experience: '地方銀行出身。中小企業向け融資業務10年。',
      qualifications: ['中小企業診断士', 'FP1級'],
      workStyle: '地方対応可・週1〜2日',
      salaryRange: '月40万円〜80万円',
      introduction: '地方企業の資金調達支援に特化。補助金活用で多くの企業の成長をサポートしてきました。',
      location: '福岡',
      avatar: '/placeholder-avatar.jpg'
    }
  ]

  const skillOptions = [
    '資金調達', 'IPO準備', 'M&A', '管理会計', '財務分析',
    '事業再生', '銀行融資', 'VC・エクイティ調達支援', 'ERP導入', 
    'バリュエーション', '補助金・助成金申請支援', '月次決算の早期化'
  ]

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  const filteredCFOs = cfoProfiles.filter(cfo => {
    const matchesSearch = searchQuery === '' || 
      cfo.name.includes(searchQuery) || 
      cfo.skills.some(skill => skill.includes(searchQuery)) ||
      cfo.introduction.includes(searchQuery)
    
    const matchesSkills = selectedSkills.length === 0 || 
      selectedSkills.some(skill => cfo.skills.includes(skill))
    
    const matchesLocation = selectedLocation === '' || cfo.location === selectedLocation
    
    return matchesSearch && matchesSkills && matchesLocation
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
              <h3 className="text-lg font-semibold text-gray-900 mb-6">CFOを探す</h3>
              
              {/* キーワード検索 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  キーワード検索
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="名前、スキル、自己紹介など"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                />
              </div>

              {/* スキルフィルター */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  スキル・専門分野
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {skillOptions.map((skill) => (
                    <label key={skill} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={() => toggleSkill(skill)}
                        className="mr-2 rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                      />
                      <span className="text-sm text-gray-600">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 地域フィルター */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  地域
                </label>
                <select 
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                >
                  <option value="">全国</option>
                  <option value="東京">東京</option>
                  <option value="大阪">大阪</option>
                  <option value="愛知">愛知</option>
                  <option value="福岡">福岡</option>
                </select>
              </div>

              {/* 経験年数フィルター */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  経験年数
                </label>
                <select 
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                >
                  <option value="">指定なし</option>
                  <option value="5年以上">5年以上</option>
                  <option value="10年以上">10年以上</option>
                  <option value="15年以上">15年以上</option>
                </select>
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="lg:w-3/4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                CFO一覧
              </h2>
              <p className="text-gray-600">
                {filteredCFOs.length}人のCFOが見つかりました
              </p>
            </div>

            {/* CFOプロフィールカード */}
            <div className="grid gap-6">
              {filteredCFOs.map((cfo) => (
                <div key={cfo.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-6">
                    {/* アバター */}
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">写真</span>
                    </div>
                    
                    {/* プロフィール情報 */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {cfo.name}
                            <span className="text-sm text-gray-500 ml-2">({cfo.nickname})</span>
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">{cfo.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-medium text-gray-900">{cfo.salaryRange}</p>
                          <p className="text-sm text-gray-500">{cfo.workStyle}</p>
                        </div>
                      </div>

                      {/* スキルタグ */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">可能な業務・スキル</h4>
                        <div className="flex flex-wrap gap-2">
                          {cfo.skills.map((skill) => (
                            <span key={skill} className="px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 実績・経歴 */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">実績・経歴</h4>
                        <p className="text-sm text-gray-600">{cfo.experience}</p>
                      </div>

                      {/* 保有資格 */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">保有資格</h4>
                        <div className="flex flex-wrap gap-2">
                          {cfo.qualifications.map((qual) => (
                            <span key={qual} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {qual}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 自己紹介 */}
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-1">自己紹介・一言</h4>
                        <p className="text-sm text-gray-600">{cfo.introduction}</p>
                      </div>

                      {/* アクションボタン */}
                      <div className="flex gap-3">
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                          気になる
                        </button>
                        <button className="px-6 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors">
                          スカウト
                        </button>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                          詳細を見る
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredCFOs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">条件に一致するCFOが見つかりませんでした。</p>
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