'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

// 定数を外に出して再作成を防ぐ
const AVAILABLE_SKILLS = [
  '資金調達', 'IPO準備', 'M&A', '管理会計', '財務分析', 
  '事業再生', '銀行融資', 'VC調達', 'ERP導入', 'バリュエーション'
]

// 初期データを関数外で定義
const INITIAL_FORM_DATA = {
  name: '山田 太郎',
  email: 'yamada@example.com',
  phone: '090-1234-5678',
  company: '株式会社サンプル',
  position: 'CFO',
  bio: '大手証券会社で15年間勤務し、IPO支援を中心とした財務コンサルティング業務に従事。これまで50社以上の企業の資金調達・上場支援を手がけてきました。',
  skills: ['資金調達', 'IPO準備', '銀行融資', '財務分析'],
  experience: '15年以上',
  workStyle: 'リモート可・週2日〜',
  compensation: '月80万円〜',
  location: '東京都',
  availability: '即座に対応可能'
}

export default function ProfilePage() {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  const [isEditing, setIsEditing] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSkillToggle = useCallback((skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }, [])

  const handleSave = useCallback(() => {
    setIsEditing(false)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader isLoggedIn={true} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 mb-6 md:mb-0">
        {/* ページタイトル */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">プロフィール編集</h2>
          <p className="text-gray-600 text-sm md:text-base">あなたの情報を管理・編集できます</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* プロフィール画像エリア */}
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 md:p-8 text-center">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl md:text-4xl">👤</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{formData.name}</h3>
            <p className="text-gray-600">{formData.position} at {formData.company}</p>
            {isEditing && (
              <button className="mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 text-sm">
                写真を変更
              </button>
            )}
          </div>

          {/* 編集ボタン */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-end">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm"
              >
                編集する
              </button>
            ) : (
              <div className="flex space-x-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm"
                >
                  キャンセル
                </button>
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm"
                >
                  保存
                </button>
              </div>
            )}
          </div>

          {/* 基本情報 */}
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h4>
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">氏名</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">電話番号</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">現在の会社</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.company}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">役職</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.position}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">所在地</label>
                {isEditing ? (
                  <select
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  >
                    <option>東京都</option>
                    <option>大阪府</option>
                    <option>愛知県</option>
                    <option>神奈川県</option>
                    <option>福岡県</option>
                    <option>その他</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{formData.location}</p>
                )}
              </div>
            </div>

            {/* 自己紹介 */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">自己紹介</label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 resize-none"
                  placeholder="あなたの経験やスキルについて教えてください..."
                />
              ) : (
                <p className="text-gray-900">{formData.bio}</p>
              )}
            </div>
          </div>

          {/* 専門スキル */}
          <div className="p-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">専門スキル</h4>
            {isEditing ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-3">該当するスキルを選択してください</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {AVAILABLE_SKILLS.map((skill) => (
                    <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.skills.includes(skill)}
                        onChange={() => handleSkillToggle(skill)}
                        className="rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                      />
                      <span className="text-sm text-gray-700">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 勤務条件 */}
          <div className="p-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">勤務条件</h4>
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">経験年数</label>
                {isEditing ? (
                  <select
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  >
                    <option>3年未満</option>
                    <option>3-5年</option>
                    <option>5-10年</option>
                    <option>10-15年</option>
                    <option>15年以上</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{formData.experience}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">稼働形態</label>
                {isEditing ? (
                  <select
                    value={formData.workStyle}
                    onChange={(e) => handleInputChange('workStyle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  >
                    <option>週1日〜</option>
                    <option>週2-3日</option>
                    <option>週4日以上</option>
                    <option>フルタイム</option>
                    <option>プロジェクト単位</option>
                    <option>リモートのみ</option>
                    <option>リモート可・週2日〜</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{formData.workStyle}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">希望報酬</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.compensation}
                    onChange={(e) => handleInputChange('compensation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                    placeholder="例：月80万円〜"
                  />
                ) : (
                  <p className="text-gray-900">{formData.compensation}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">対応可能時期</label>
                {isEditing ? (
                  <select
                    value={formData.availability}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  >
                    <option>即座に対応可能</option>
                    <option>1ヶ月後</option>
                    <option>2-3ヶ月後</option>
                    <option>半年後</option>
                    <option>相談により調整可能</option>
                  </select>
                ) : (
                  <p className="text-gray-900">{formData.availability}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast通知 */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          プロフィールが更新されました ✓
        </div>
      )}
    </div>
  )
}