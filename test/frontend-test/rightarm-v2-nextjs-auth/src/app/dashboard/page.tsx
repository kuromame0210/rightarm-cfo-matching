'use client'

import { useState } from 'react'
import DashboardHeader from '@/components/DashboardHeader'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function DashboardPage() {
  const [userType] = useState<'company' | 'cfo'>('company') // 実際はログインユーザー情報から取得
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // サンプルデータ（実際はAPIから取得）
  const cfoProfiles = [
    {
      id: 1,
      name: '山田 太郎',
      skills: ['資金調達', 'IPO準備', '銀行融資'],
      experience: '15年',
      rate: '月80万円〜',
      location: '東京',
      workStyle: 'リモート可',
      description: '大手証券会社出身。IPO実績多数。',
    },
    {
      id: 2,
      name: '田中 花子',
      skills: ['管理会計', '財務分析', 'ERP導入'],
      experience: '12年',
      rate: '月60万円〜',
      location: '大阪',
      workStyle: '週1〜対応',
      description: '監査法人出身。中小企業の財務改善が得意。',
    },
    {
      id: 3,
      name: '佐藤 次郎',
      skills: ['M&A', '事業再生', 'バリュエーション'],
      experience: '18年',
      rate: '月100万円〜',
      location: '愛知',
      workStyle: 'フルリモート',
      description: 'PEファンド出身。事業再生・M&A実績豊富。',
    },
  ]

  const companyProfiles = [
    {
      id: 1,
      companyName: '株式会社テックスタート',
      industry: 'IT・Web',
      revenue: '年商8億円',
      employees: '50名',
      challenge: '資金調達・IPO準備',
      description: 'SaaSプロダクトを展開中。シリーズBラウンドの資金調達を検討。',
      requirements: 'IPO経験のあるCFOを求む',
    },
    {
      id: 2,
      companyName: '製造業ABC株式会社',
      industry: '製造業',
      revenue: '年商50億円',
      employees: '200名',
      challenge: '管理会計強化',
      description: '創業50年の老舗メーカー。原価管理の精度向上が課題。',
      requirements: '製造業での管理会計経験者希望',
    },
    {
      id: 3,
      companyName: '地方物流株式会社',
      industry: '物流・運輸',
      revenue: '年商30億円',
      employees: '150名',
      challenge: '事業承継・M&A',
      description: '後継者不在のため事業承継を検討中。',
      requirements: 'M&A・事業承継の実績必須',
    },
  ]

  const skillTags = [
    '資金調達', 'IPO準備', 'M&A', '管理会計', '財務分析',
    '事業再生', '銀行融資', 'VC調達', 'ERP導入', 'バリュエーション'
  ]

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const displayProfiles = userType === 'company' ? cfoProfiles : companyProfiles

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      <DashboardHeader currentPage="home" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* サイドバー（フィルター） */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">検索・絞り込み</h3>
              
              {/* キーワード検索 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  キーワード検索
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={userType === 'company' ? 'CFOの名前やスキル' : '会社名や業界'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                />
              </div>

              {/* スキル・課題タグ */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {userType === 'company' ? 'スキル' : '財務課題'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {skillTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-gray-200 border-gray-600 text-gray-900'
                          : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* 地域フィルター */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  地域
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500">
                  <option value="">全国</option>
                  <option value="tokyo">東京</option>
                  <option value="osaka">大阪</option>
                  <option value="aichi">愛知</option>
                  <option value="other">その他</option>
                </select>
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="lg:w-3/4">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {userType === 'company' ? 'CFO一覧' : '企業一覧'}
              </h2>
              <p className="text-gray-600">
                {displayProfiles.length}件の{userType === 'company' ? 'CFO' : '企業'}が見つかりました
              </p>
            </div>

            {/* プロフィールカード */}
            <div className="grid gap-6">
              {userType === 'company' ? (
                // CFOプロフィール表示
                cfoProfiles.map((cfo) => (
                  <div key={cfo.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0"></div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{cfo.name}</h3>
                          <p className="text-gray-600 text-sm mb-2">{cfo.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {cfo.skills.map((skill) => (
                              <span key={skill} className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>経験: {cfo.experience}</div>
                            <div>報酬: {cfo.rate}</div>
                            <div>地域: {cfo.location}</div>
                            <div>{cfo.workStyle}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                          気になる
                        </button>
                        <button className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800">
                          スカウト
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // 企業プロフィール表示
                companyProfiles.map((company) => (
                  <div key={company.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{company.companyName}</h3>
                        <p className="text-gray-600 text-sm mb-3">{company.description}</p>
                        
                        <div className="mb-3">
                          <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded">
                            {company.challenge}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>業界: {company.industry}</div>
                          <div>規模: {company.revenue}</div>
                          <div>従業員: {company.employees}</div>
                          <div>求める要件: {company.requirements}</div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                          気になる
                        </button>
                        <button className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800">
                          応募
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </ProtectedRoute>
  )
}