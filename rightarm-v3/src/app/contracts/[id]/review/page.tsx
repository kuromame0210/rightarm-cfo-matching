'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppHeader from '@/components/AppHeader'

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // サンプル契約データ（v5.1仕様書準拠）
  const contractData = {
    id: params.id,
    cfoName: '山田 太郎',
    companyName: '株式会社テックスタート',
    period: '2024年1月〜2024年6月',
    completedDate: '2024-06-30',
    userType: 'company', // company または cfo
    partnerType: 'cfo' // 評価対象
  }

  // v5.1仕様書準拠：評価項目
  const ratingCategories = [
    {
      id: 'expertise',
      label: '専門性',
      description: '財務・会計の専門知識と実務能力'
    },
    {
      id: 'communication',
      label: 'コミュニケーション',
      description: '報告・相談・提案の質と頻度'
    },
    {
      id: 'delivery',
      label: '成果物の質',
      description: '期待される成果の達成度'
    },
    {
      id: 'schedule',
      label: 'スケジュール管理',
      description: '納期・会議時間の遵守'
    },
    {
      id: 'proactive',
      label: '提案力',
      description: '課題発見と改善提案の積極性'
    }
  ]

  const [categoryRatings, setCategoryRatings] = useState<{[key: string]: number}>({})

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleCategoryRating = (categoryId: string, rating: number) => {
    setCategoryRatings(prev => ({
      ...prev,
      [categoryId]: rating
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // バリデーション
    if (rating === 0) {
      showToastMessage('総合評価を選択してください')
      return
    }
    
    if (Object.keys(categoryRatings).length < ratingCategories.length) {
      showToastMessage('すべての項目を評価してください')
      return
    }
    
    if (reviewText.trim().length < 10) {
      showToastMessage('レビューコメントは10文字以上入力してください')
      return
    }

    setIsSubmitting(true)
    
    try {
      // 実際の実装では API を呼び出してレビューを投稿
      await new Promise(resolve => setTimeout(resolve, 1500)) // デモ用待機
      
      showToastMessage('レビューを投稿しました')
      setTimeout(() => {
        router.push(`/contracts/${params.id}`)
      }, 2000)
    } catch (error) {
      showToastMessage('エラーが発生しました。再度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStarRating = (currentRating: number, onRatingChange: (rating: number) => void, size: 'sm' | 'lg' = 'sm') => {
    const starSize = size === 'lg' ? 'text-2xl' : 'text-xl'
    
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`${starSize} transition-colors ${
              star <= currentRating
                ? 'text-yellow-400 hover:text-yellow-500'
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    )
  }

  const getPartnerDisplayName = () => {
    return contractData.userType === 'company' ? contractData.cfoName : contractData.companyName
  }

  const getPartnerRole = () => {
    return contractData.userType === 'company' ? 'CFO' : '企業'
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader isLoggedIn={true} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* ページヘッダー */}
        <div className="mb-6">
          <button 
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 text-sm mb-2 flex items-center"
          >
            ← 戻る
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                レビュー投稿
              </h1>
              <p className="text-gray-600">
                {getPartnerDisplayName()}（{getPartnerRole()}）への評価
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 契約情報 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">契約情報</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">契約ID:</span>
                    <p className="font-medium">{contractData.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">期間:</span>
                    <p className="font-medium">{contractData.period}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">完了日:</span>
                    <p className="font-medium">{contractData.completedDate}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">評価対象:</span>
                    <p className="font-medium">{getPartnerDisplayName()}</p>
                  </div>
                </div>
              </div>

              {/* 総合評価 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  総合評価 <span className="text-red-500">*</span>
                </h2>
                <div className="flex items-center space-x-4">
                  {renderStarRating(rating, setRating, 'lg')}
                  <span className="text-lg font-medium text-gray-700">
                    {rating > 0 ? `${rating}/5` : '評価を選択'}
                  </span>
                </div>
                {rating > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {rating === 5 && '非常に満足'}
                    {rating === 4 && '満足'}
                    {rating === 3 && '普通'}
                    {rating === 2 && 'やや不満'}
                    {rating === 1 && '不満'}
                  </p>
                )}
              </div>

              {/* 詳細評価 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  詳細評価 <span className="text-red-500">*</span>
                </h2>
                <div className="space-y-6">
                  {ratingCategories.map((category) => (
                    <div key={category.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{category.label}</h3>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {renderStarRating(
                            categoryRatings[category.id] || 0,
                            (rating) => handleCategoryRating(category.id, rating)
                          )}
                          <span className="text-sm text-gray-600 min-w-[3rem]">
                            {categoryRatings[category.id] ? `${categoryRatings[category.id]}/5` : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* レビューコメント */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  レビューコメント <span className="text-red-500">*</span>
                </h2>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="具体的な評価理由や感想をお聞かせください。今後の参考になる建設的なコメントをお願いします。"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={6}
                  required
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">
                    最低10文字以上入力してください
                  </p>
                  <p className="text-sm text-gray-500">
                    {reviewText.length}/500文字
                  </p>
                </div>
              </div>

              {/* 公開設定 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">公開設定</h2>
                <div className="space-y-3">
                  <label className="flex items-start space-x-3">
                    <input type="checkbox" defaultChecked className="mt-1 text-blue-600 focus:ring-blue-500" />
                    <div>
                      <span className="font-medium text-gray-900">プロフィールに表示</span>
                      <p className="text-sm text-gray-600">
                        {getPartnerRole()}のプロフィールページにこのレビューを表示します
                      </p>
                    </div>
                  </label>
                  <label className="flex items-start space-x-3">
                    <input type="checkbox" defaultChecked className="mt-1 text-blue-600 focus:ring-blue-500" />
                    <div>
                      <span className="font-medium text-gray-900">匿名での投稿</span>
                      <p className="text-sm text-gray-600">
                        レビュー投稿者名を「利用企業」または「CFO」として表示します
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* 投稿ボタン */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? '投稿中...' : 'レビューを投稿'}
                </button>
              </div>
            </form>
          </div>

          {/* サイドバー */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">レビュー投稿について</h3>
              
              <div className="space-y-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">💡 レビューのポイント</h4>
                  <ul className="space-y-1 text-xs">
                    <li>• 具体的な事例を含めて記載</li>
                    <li>• 建設的で参考になる内容を心がける</li>
                    <li>• 個人情報や機密情報は含めない</li>
                    <li>• 誹謗中傷は禁止されています</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">📋 評価項目の説明</h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <strong>専門性:</strong> 期待されるレベルの知識・スキルがあったか
                    </div>
                    <div>
                      <strong>コミュニケーション:</strong> 報告・相談が適切だったか
                    </div>
                    <div>
                      <strong>成果物の質:</strong> 期待される成果が得られたか
                    </div>
                    <div>
                      <strong>スケジュール管理:</strong> 約束した期限を守れたか
                    </div>
                    <div>
                      <strong>提案力:</strong> 課題発見・改善提案があったか
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">お問い合わせ</h4>
                  <p className="text-xs mb-2">
                    レビューに関するご質問やトラブルがございましたらサポートまでご連絡ください。
                  </p>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                    サポートに連絡
                  </button>
                </div>
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