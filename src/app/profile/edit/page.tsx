'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppHeader from '@/components/AppHeader'

export const dynamic = 'force-dynamic'

export default function ProfileEditPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>({})
  
  // プロフィールを取得
  const fetchProfile = async () => {
    try {
      console.log('プロフィールを取得中...')
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': 'Bearer demo-token'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('プロフィール:', data)
        if (data.success) {
          setProfile(data.data)
        }
      } else {
        console.error('プロフィールの取得に失敗しました')
      }
    } catch (error) {
      console.error('プロフィールの取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  // プロフィールを保存
  const saveProfile = async () => {
    setSaving(true)
    try {
      console.log('プロフィールを保存中...', profile)
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token'
        },
        body: JSON.stringify(profile)
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('保存成功:', data)
        if (data.success) {
          alert('プロフィールを更新しました')
          router.push('/profile')
        }
      } else {
        const errorData = await response.json()
        console.error('プロフィールの保存に失敗しました:', errorData.error)
        alert(`保存に失敗しました: ${errorData.error}`)
      }
    } catch (error) {
      console.error('プロフィールの保存エラー:', error)
      alert('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleInputChange = (field: string, value: any) => {
    setProfile((prev: any) => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
        <AppHeader />
        <div className="max-w-7xl mx-auto px-2 md:px-4 lg:px-8 py-4 md:py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">プロフィールを読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader />

      <div className="max-w-4xl mx-auto px-2 md:px-4 lg:px-8 py-4 md:py-8">
        {/* ページタイトル */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">プロフィール編集</h2>
          <p className="text-gray-600 text-sm md:text-base">あなたのプロフィール情報を編集できます</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* 基本情報 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  氏名 *
                </label>
                <input
                  type="text"
                  value={profile.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="山田 太郎"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={profile.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">メールアドレスは変更できません</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  電話番号
                </label>
                <input
                  type="tel"
                  value={profile.phoneNumber || ''}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="090-1234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  住所
                </label>
                <input
                  type="text"
                  value={profile.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="東京都渋谷区..."
                />
              </div>
            </div>
          </div>

          {/* CFO固有の項目 */}
          {profile.userType === 'cfo' && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">CFO情報</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    肩書き
                  </label>
                  <input
                    type="text"
                    value={profile.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="戦略CFO、財務コンサルタント等"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    自己紹介
                  </label>
                  <textarea
                    value={profile.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="あなたの経験や強みを教えてください"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      時間単価（円）
                    </label>
                    <input
                      type="number"
                      value={profile.hourlyRate || ''}
                      onChange={(e) => handleInputChange('hourlyRate', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="10000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      稼働状況
                    </label>
                    <select
                      value={profile.availabilityStatus || 'available'}
                      onChange={(e) => handleInputChange('availabilityStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="available">稼働可能</option>
                      <option value="busy">多忙</option>
                      <option value="unavailable">稼働不可</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    得意分野（カンマ区切り）
                  </label>
                  <input
                    type="text"
                    value={profile.specialties?.join(', ') || ''}
                    onChange={(e) => handleInputChange('specialties', e.target.value.split(', ').filter(s => s.trim()))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="資金調達, IPO準備, M&A"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Company固有の項目 */}
          {profile.userType === 'company' && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">企業情報</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    会社名 *
                  </label>
                  <input
                    type="text"
                    value={profile.companyName || ''}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="株式会社◯◯"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    事業内容
                  </label>
                  <textarea
                    value={profile.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="どのような事業を行っているか教えてください"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      業界
                    </label>
                    <input
                      type="text"
                      value={profile.industry || ''}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="IT, 製造業, 小売業等"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      従業員数
                    </label>
                    <input
                      type="number"
                      value={profile.employeeCount || ''}
                      onChange={(e) => handleInputChange('employeeCount', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      設立年
                    </label>
                    <input
                      type="number"
                      value={profile.foundedYear || ''}
                      onChange={(e) => handleInputChange('foundedYear', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2020"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ウェブサイト
                    </label>
                    <input
                      type="url"
                      value={profile.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 保存ボタン */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => router.push('/profile')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={saveProfile}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}