'use client'

import { useState, useMemo } from 'react'
import { Layout } from '@/components/layout/layout'
import { ProfileCard } from '@/components/profile/profile-card'
import { TagSelector } from '@/components/search/tag-selector'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { mockCfoProfiles, mockTags } from '@/lib/mock-data'
import { SearchFilters } from '@/types'
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'

export default function DiscoverCfosPage() {
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    tags: [],
    locationPrefecture: '',
    hourlyRateMin: undefined,
    hourlyRateMax: undefined,
    yearsExperience: undefined,
    sortBy: 'rating'
  })
  const [showFilters, setShowFilters] = useState(false)

  const filteredCfos = useMemo(() => {
    let result = [...mockCfoProfiles]

    // Keyword search
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      result = result.filter(cfo => 
        cfo.displayName?.toLowerCase().includes(keyword) ||
        cfo.firstName.toLowerCase().includes(keyword) ||
        cfo.lastName.toLowerCase().includes(keyword) ||
        cfo.bio?.toLowerCase().includes(keyword)
      )
    }

    // Tag filter
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter(cfo =>
        filters.tags!.some(tagId => cfo.tags.some(tag => tag.id === tagId))
      )
    }

    // Location filter
    if (filters.locationPrefecture) {
      result = result.filter(cfo => 
        cfo.locationPrefecture === filters.locationPrefecture
      )
    }

    // Experience filter
    if (filters.yearsExperience) {
      result = result.filter(cfo => 
        (cfo.yearsExperience || 0) >= filters.yearsExperience!
      )
    }

    // Rate filter
    if (filters.hourlyRateMin) {
      result = result.filter(cfo => 
        (cfo.hourlyRateMin || 0) >= filters.hourlyRateMin!
      )
    }

    if (filters.hourlyRateMax) {
      result = result.filter(cfo => 
        (cfo.hourlyRateMax || Infinity) <= filters.hourlyRateMax!
      )
    }

    // Sort
    switch (filters.sortBy) {
      case 'rating':
        result.sort((a, b) => b.ratingAverage - a.ratingAverage)
        break
      case 'experience':
        result.sort((a, b) => (b.yearsExperience || 0) - (a.yearsExperience || 0))
        break
      case 'rate':
        result.sort((a, b) => (a.hourlyRateMin || 0) - (b.hourlyRateMin || 0))
        break
      case 'recent':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    return result
  }, [filters])

  const handleScout = (cfoId: string) => {
    // In a real app, this would open a scout modal
    alert(`${cfoId}へのスカウト機能（実装予定）`)
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

  return (
    <Layout isLoggedIn userType="company">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CFO検索</h1>
          <p className="text-gray-600">
            経験豊富なCFOを見つけて、事業成長を加速させましょう
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="名前、スキル、経験で検索..."
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
                  スキル・課題タグ
                </label>
                <TagSelector
                  tags={mockTags}
                  selectedTags={filters.tags || []}
                  onChange={(tags) => setFilters(prev => ({ ...prev, tags }))}
                />
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  勤務地
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

              {/* Experience Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  最小経験年数
                </label>
                <select
                  value={filters.yearsExperience || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, yearsExperience: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">指定なし</option>
                  <option value="1">1年以上</option>
                  <option value="3">3年以上</option>
                  <option value="5">5年以上</option>
                  <option value="10">10年以上</option>
                  <option value="15">15年以上</option>
                </select>
              </div>

              {/* Rate Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  時給範囲
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="最低"
                    value={filters.hourlyRateMin || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, hourlyRateMin: e.target.value ? Number(e.target.value) : undefined }))}
                  />
                  <Input
                    type="number"
                    placeholder="最高"
                    value={filters.hourlyRateMax || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, hourlyRateMax: e.target.value ? Number(e.target.value) : undefined }))}
                  />
                </div>
              </div>

              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  並び替え
                </label>
                <select
                  value={filters.sortBy || 'rating'}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="rating">評価が高い順</option>
                  <option value="experience">経験年数が多い順</option>
                  <option value="rate">時給が安い順</option>
                  <option value="recent">登録が新しい順</option>
                </select>
              </div>

              <Button
                variant="outline"
                onClick={() => setFilters({
                  keyword: '',
                  tags: [],
                  locationPrefecture: '',
                  hourlyRateMin: undefined,
                  hourlyRateMax: undefined,
                  yearsExperience: undefined,
                  sortBy: 'rating'
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
                {filteredCfos.length}名のCFOが見つかりました
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCfos.map((cfo) => (
                <ProfileCard
                  key={cfo.id}
                  profile={cfo}
                  variant="cfo"
                  onScout={() => handleScout(cfo.id)}
                />
              ))}
            </div>

            {filteredCfos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  条件に合うCFOが見つかりませんでした
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