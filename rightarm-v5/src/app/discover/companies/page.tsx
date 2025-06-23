'use client'

import { useState, useMemo } from 'react'
import { Layout } from '@/components/layout/layout'
import { ProfileCard } from '@/components/profile/profile-card'
import { TagSelector } from '@/components/search/tag-selector'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { mockCompanyProfiles, mockTags } from '@/lib/mock-data'
import { SearchFilters } from '@/types'
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'

export default function DiscoverCompaniesPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    tags: [],
    locationPrefecture: '',
    sortBy: 'recent'
  })
  const [showFilters, setShowFilters] = useState(false)

  const filteredCompanies = useMemo(() => {
    let result = [...mockCompanyProfiles]

    // Keyword search
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      result = result.filter(company => 
        company.companyName.toLowerCase().includes(keyword) ||
        company.companyDescription?.toLowerCase().includes(keyword) ||
        company.industry?.toLowerCase().includes(keyword)
      )
    }

    // Tag filter
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(company =>
        filters.tags!.some(tagId => company.tags.some(tag => tag.id === tagId))
      )
    }

    // Location filter
    if (filters.locationPrefecture) {
      result = result.filter(company => 
        company.locationPrefecture === filters.locationPrefecture
      )
    }

    // Sort
    switch (filters.sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      // Add more sorting options as needed
    }

    return result
  }, [filters])

  const handleScout = (companyId: string) => {
    // In a real app, this would open a scout modal
    alert(`${companyId}への逆スカウト機能（実装予定）`)
  }

  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ]

  const industries = [
    'IT・ソフトウェア',
    'フィンテック',
    '製造業',
    'バイオテクノロジー',
    'ヘルスケア',
    'eコマース',
    'SaaS',
    'AI・機械学習',
    'ブロックチェーン',
    'IoT',
    'ゲーム',
    'メディア・エンターテイメント',
    '不動産',
    '教育',
    '人材',
    'マーケティング',
    'コンサルティング',
    '金融',
    '小売',
    'その他'
  ]

  const companySizes = [
    '1-10名',
    '11-50名',
    '51-100名',
    '101-500名',
    '501-1000名',
    '1000名以上'
  ]

  return (
    <Layout isLoggedIn userType="cfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">企業検索</h1>
          <p className="text-gray-600">
            成長企業を見つけて、CFOとしてビジネスの成長を支援しましょう
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="企業名、業界、課題で検索..."
                value={filters.keyword}
                onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              フィルター
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'} space-y-6`}>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="font-semibold text-lg mb-4">絞り込み条件</h3>
              
              {/* Tag Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  課題・ニーズ
                </label>
                <TagSelector
                  tags={mockTags.filter(tag => tag.type === 'challenge')}
                  selectedTags={filters.tags || []}
                  onChange={(tags) => setFilters(prev => ({ ...prev, tags }))}
                  placeholder="課題を検索..."
                />
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  所在地
                </label>
                <select
                  value={filters.locationPrefecture || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, locationPrefecture: e.target.value || undefined }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">すべての地域</option>
                  {prefectures.map(prefecture => (
                    <option key={prefecture} value={prefecture}>
                      {prefecture}
                    </option>
                  ))}
                </select>
              </div>

              {/* Industry Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  業界
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">すべての業界</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              {/* Company Size Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  従業員数
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">指定なし</option>
                  {companySizes.map(size => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  並び替え
                </label>
                <select
                  value={filters.sortBy || 'recent'}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="recent">登録が新しい順</option>
                  <option value="name">企業名順</option>
                </select>
              </div>

              <Button
                variant="outline"
                onClick={() => setFilters({
                  keyword: '',
                  tags: [],
                  locationPrefecture: '',
                  sortBy: 'recent'
                })}
                className="w-full"
              >
                条件をリセット
              </Button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {filteredCompanies.length}社の企業が見つかりました
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
                <ProfileCard
                  key={company.id}
                  profile={company}
                  variant="company"
                  onScout={() => handleScout(company.id)}
                />
              ))}
            </div>

            {filteredCompanies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  条件に合う企業が見つかりませんでした
                </p>
                <p className="text-gray-400 mt-2">
                  検索条件を変更して再度お試しください
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}