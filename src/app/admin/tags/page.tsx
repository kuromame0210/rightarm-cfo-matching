'use client'

import { useState } from 'react'
import AppHeader from '@/components/AppHeader'

export const dynamic = 'force-dynamic'

export default function AdminTagsPage() {
  const [selectedCategory, setSelectedCategory] = useState('skills')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // v5.1仕様書準拠：タグ管理データ
  const tagCategories = {
    skills: {
      name: 'CFOスキル',
      description: 'CFOが保有するスキル・専門分野',
      tags: [
        { id: 1, name: '資金調達', usageCount: 89, isActive: true },
        { id: 2, name: 'IPO準備', usageCount: 67, isActive: true },
        { id: 3, name: '管理会計', usageCount: 124, isActive: true },
        { id: 4, name: '財務分析', usageCount: 156, isActive: true },
        { id: 5, name: 'M&A', usageCount: 43, isActive: true },
        { id: 6, name: '事業再生', usageCount: 23, isActive: true }
      ]
    },
    challenges: {
      name: '企業課題',
      description: '企業が抱える財務・経営課題',
      tags: [
        { id: 13, name: '資金調達準備', usageCount: 156, isActive: true },
        { id: 14, name: 'IPO準備', usageCount: 89, isActive: true },
        { id: 15, name: '管理会計強化', usageCount: 134, isActive: true },
        { id: 16, name: 'コスト管理', usageCount: 167, isActive: true }
      ]
    }
  }

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const getCurrentTags = () => {
    return tagCategories[selectedCategory as keyof typeof tagCategories]?.tags || []
  }

  const getCurrentCategoryInfo = () => {
    return tagCategories[selectedCategory as keyof typeof tagCategories]
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader isLoggedIn={true} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                🏷️ タグ管理
              </h1>
              <p className="text-gray-600">
                スキル・業界・課題などのタグを管理します
              </p>
            </div>
            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
              管理者専用
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* カテゴリサイドバー */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">カテゴリ</h3>
              <nav className="space-y-2">
                {Object.entries(tagCategories).map(([key, category]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`w-full text-left px-3 py-3 rounded-lg transition-colors ${
                      selectedCategory === key
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-sm">{category.name}</p>
                      <p className={`text-xs ${
                        selectedCategory === key ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {category.tags.length}個のタグ
                      </p>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="lg:col-span-3">
            {/* カテゴリ情報 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {getCurrentCategoryInfo().name}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {getCurrentCategoryInfo().description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {getCurrentTags().length}
                  </p>
                  <p className="text-sm text-gray-500">タグ数</p>
                </div>
              </div>
            </div>

            {/* タグ一覧 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">タグ一覧</h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {getCurrentTags().map((tag) => (
                  <div key={tag.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-medium text-gray-900">{tag.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs border ${
                              tag.isActive
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : 'bg-red-100 text-red-800 border-red-200'
                            }`}>
                              {tag.isActive ? '有効' : '無効'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            使用回数: {tag.usageCount}回
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => showToastMessage('タグの状態を更新しました')}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            tag.isActive
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {tag.isActive ? '無効化' : '有効化'}
                        </button>
                        <button
                          onClick={() => showToastMessage(`「${tag.name}」を削除しました`)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                          disabled={tag.usageCount > 0}
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast通知 */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  )
}