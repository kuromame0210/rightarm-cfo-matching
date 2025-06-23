'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function RegisterForm() {
  const searchParams = useSearchParams()
  const [userType, setUserType] = useState<'company' | 'cfo'>('company')
  
  // フォームの状態
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    // 企業用フィールド
    companyName: '',
    contactPerson: '',
    description: '',
    location: '',
    challenges: [] as string[],
    budgetRange: '',
    // CFO用フィールド
    name: '',
    bio: '',
    skills: [] as string[],
    experienceYears: '',
    rateRange: '',
    workStyle: ''
  })

  useEffect(() => {
    const type = searchParams.get('type')
    if (type === 'company' || type === 'cfo') {
      setUserType(type)
    }
  }, [searchParams])

  const challenges = [
    '資金調達', 'IPO準備', 'M&A支援', '管理会計', '財務DX', '事業再生'
  ]

  const skills = [
    '資金調達支援', 'IPO・M&A関連', '管理会計構築', 
    '財務DX・システム導入', '事業再生・事業承継', '組織・ガバナンス関連'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // デモ用：実際の登録処理は行わず、ホームページに遷移
    window.location.href = '/home'
  }

  const handleCheckboxChange = (field: 'challenges' | 'skills', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 tracking-wide">RIGHTARM</h1>
            <p className="text-gray-600 text-sm md:text-base">
              {userType === 'company' ? '企業登録' : 'CFO登録'}
            </p>
          </div>

          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setUserType('company')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                userType === 'company'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              企業
            </button>
            <button
              onClick={() => setUserType('cfo')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                userType === 'cfo'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              CFO
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 共通フィールド */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 md:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                パスワード *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 md:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                required
              />
            </div>

            {userType === 'company' ? (
              // 企業向けフォーム
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    会社名 *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-3 md:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    担当者名 *
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                    className="w-full px-3 md:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    会社概要
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 md:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    所在地
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 md:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="">都道府県を選択</option>
                    <option value="東京都">東京都</option>
                    <option value="神奈川県">神奈川県</option>
                    <option value="大阪府">大阪府</option>
                    <option value="愛知県">愛知県</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    抱えている財務課題 *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {challenges.map((challenge) => (
                      <label key={challenge} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.challenges.includes(challenge)}
                          onChange={() => handleCheckboxChange('challenges', challenge)}
                          className="mr-2 rounded"
                        />
                        <span className="text-sm text-gray-700">{challenge}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    希望予算（月額）
                  </label>
                  <select
                    value={formData.budgetRange}
                    onChange={(e) => setFormData(prev => ({ ...prev, budgetRange: e.target.value }))}
                    className="w-full px-3 md:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="">予算を選択</option>
                    <option value="〜50万円">〜50万円</option>
                    <option value="50〜100万円">50〜100万円</option>
                    <option value="100〜200万円">100〜200万円</option>
                    <option value="200万円〜">200万円〜</option>
                    <option value="応相談">応相談</option>
                  </select>
                </div>
              </>
            ) : (
              // CFO向けフォーム
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    お名前 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 md:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    自己紹介
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-3 md:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    居住地
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 md:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="">都道府県を選択</option>
                    <option value="東京都">東京都</option>
                    <option value="神奈川県">神奈川県</option>
                    <option value="大阪府">大阪府</option>
                    <option value="愛知県">愛知県</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    専門スキル *
                  </label>
                  <div className="space-y-2">
                    {skills.map((skill) => (
                      <label key={skill} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.skills.includes(skill)}
                          onChange={() => handleCheckboxChange('skills', skill)}
                          className="mr-2 rounded"
                        />
                        <span className="text-sm text-gray-700">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    経験年数
                  </label>
                  <select
                    value={formData.experienceYears}
                    onChange={(e) => setFormData(prev => ({ ...prev, experienceYears: e.target.value }))}
                    className="w-full px-3 md:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="">経験年数を選択</option>
                    <option value="1-3年">1-3年</option>
                    <option value="4-7年">4-7年</option>
                    <option value="8-15年">8-15年</option>
                    <option value="15年以上">15年以上</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    希望報酬（月額）
                  </label>
                  <select
                    value={formData.rateRange}
                    onChange={(e) => setFormData(prev => ({ ...prev, rateRange: e.target.value }))}
                    className="w-full px-3 md:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="">希望報酬を選択</option>
                    <option value="〜50万円">〜50万円</option>
                    <option value="50〜100万円">50〜100万円</option>
                    <option value="100〜200万円">100〜200万円</option>
                    <option value="200万円〜">200万円〜</option>
                    <option value="応相談">応相談</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    稼働形態
                  </label>
                  <select
                    value={formData.workStyle}
                    onChange={(e) => setFormData(prev => ({ ...prev, workStyle: e.target.value }))}
                    className="w-full px-3 md:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="">稼働形態を選択</option>
                    <option value="リモート可">リモート可</option>
                    <option value="出社必要">出社必要</option>
                    <option value="どちらでも可">どちらでも可</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-3 md:py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              登録する
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-xs md:text-sm text-gray-600">
              すでにアカウントをお持ちですか？{' '}
              <Link href="/auth/login" className="text-gray-900 hover:underline font-medium">
                ログインはこちら
              </Link>
            </p>
          </div>

          <div className="text-center mt-4">
            <Link href="/" className="text-xs md:text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  )
}