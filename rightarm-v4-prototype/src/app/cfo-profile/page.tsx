'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CFOProfilePage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)

  // サンプルCFOプロフィールデータ
  const [profileData, setProfileData] = useState({
    name: '田中 太郎',
    email: 'tanaka@cfo-expert.com',
    bio: '大手商社でのCFO経験を活かし、スタートアップの資金調達から上場まで幅広く支援しています。特に、財務戦略の立案から実行まで一貫してサポートし、企業の成長段階に応じた最適な資金調達手法をご提案いたします。',
    location: '東京都',
    skills: ['資金調達支援', 'IPO・M&A関連', '管理会計構築'],
    experienceYears: '15年以上',
    rateRange: '100〜200万円',
    workStyle: 'リモート可',
    availability: 'リモート中心、月2-3回の訪問可能',
    languages: ['日本語', '英語（ビジネスレベル）'],
    certifications: ['公認会計士', 'MBA（経営学修士）', 'CFA（米国証券アナリスト）'],
    linkedIn: 'https://linkedin.com/in/tanaka-taro',
    website: 'https://tanaka-cfo.com'
  })

  const contracts = [
    {
      id: 1,
      companyName: '株式会社テックイノベーション',
      status: 'active',
      startDate: '2024-01-01',
      duration: '6ヶ月',
      amount: '150万円/月'
    },
    {
      id: 2,
      companyName: '株式会社フューチャーソリューション',
      status: 'completed',
      startDate: '2023-06-01',
      duration: '12ヶ月',
      amount: '200万円/月'
    }
  ]

  const reviews = [
    {
      id: 1,
      companyName: '株式会社テックイノベーション',
      rating: 5,
      comment: '資金調達の戦略立案から実行まで、的確なアドバイスをいただきました。おかげで目標額を上回る調達に成功しました。',
      date: '2024年2月'
    },
    {
      id: 2,
      companyName: '株式会社グロースパートナーズ',
      rating: 5,
      comment: 'IPO準備において、複雑な会計処理から開示書類の作成まで丁寧にサポートしていただきました。',
      date: '2024年1月'
    }
  ]

  const handleSave = () => {
    setIsEditing(false)
  }

  const handleLogout = () => {
    window.location.href = '/auth/login'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/cfo-dashboard" className="md:hidden text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900 tracking-wide">RIGHTARM</h1>
              <span className="text-sm text-gray-600">CFOプロフィール</span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/cfo-dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                案件一覧
              </Link>
              <Link href="/cfo-messages" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                メッセージ
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">2</span>
              </button>
              
              <div className="w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">CFO</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* サイドバー */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-semibold">CFO</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{profileData.name}</h2>
                <p className="text-sm text-gray-600">CFO・財務コンサルタント</p>
                <div className="flex items-center justify-center mt-2">
                  <span className="text-yellow-400 text-lg">★</span>
                  <span className="font-medium ml-1">4.9</span>
                  <span className="text-gray-500 ml-1">(24件)</span>
                </div>
              </div>
              
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'profile'
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  プロフィール
                </button>
                <button
                  onClick={() => setActiveTab('contracts')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'contracts'
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  契約履歴
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'reviews'
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  クライアントレビュー
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'settings'
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  設定
                </button>
              </nav>

              <div className="border-t border-gray-200 mt-6 pt-6">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md"
                >
                  ログアウト
                </button>
              </div>
            </div>
          </div>

          {/* メインコンテンツエリア */}
          <div className="lg:col-span-3">
            
            {/* プロフィールタブ */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">CFOプロフィール</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    {isEditing ? 'キャンセル' : '編集'}
                  </button>
                </div>

                <div className="space-y-6">
                  {/* 基本情報 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">お名前</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">居住地</label>
                      {isEditing ? (
                        <select
                          value={profileData.location}
                          onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="東京都">東京都</option>
                          <option value="神奈川県">神奈川県</option>
                          <option value="大阪府">大阪府</option>
                          <option value="愛知県">愛知県</option>
                        </select>
                      ) : (
                        <p className="text-gray-900">{profileData.location}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">経験年数</label>
                      <p className="text-gray-900">{profileData.experienceYears}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">希望報酬（月額）</label>
                      <p className="text-gray-900">{profileData.rateRange}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">稼働形態</label>
                      <p className="text-gray-900">{profileData.workStyle}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">稼働可能性</label>
                      <p className="text-gray-900">{profileData.availability}</p>
                    </div>
                  </div>

                  {/* 自己紹介 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">自己紹介</label>
                    {isEditing ? (
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.bio}</p>
                    )}
                  </div>

                  {/* 専門スキル */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">専門スキル</label>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.map(skill => (
                        <span key={skill} className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 対応言語 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">対応言語</label>
                    <div className="flex flex-wrap gap-2">
                      {profileData.languages.map(lang => (
                        <span key={lang} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 資格・認定 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">資格・認定</label>
                    <div className="space-y-1">
                      {profileData.certifications.map(cert => (
                        <div key={cert} className="text-sm text-gray-900">• {cert}</div>
                      ))}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        キャンセル
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 契約履歴タブ */}
            {activeTab === 'contracts' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">契約履歴</h3>
                <div className="space-y-4">
                  {contracts.map(contract => (
                    <div key={contract.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{contract.companyName}</h4>
                          <p className="text-sm text-gray-600">
                            {contract.startDate}開始 • {contract.duration} • {contract.amount}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          contract.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {contract.status === 'active' ? '進行中' : '完了'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* レビュータブ */}
            {activeTab === 'reviews' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">クライアントレビュー</h3>
                <div className="space-y-6">
                  {reviews.map(review => (
                    <div key={review.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{review.companyName}</h4>
                          <div className="flex items-center space-x-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 設定タブ */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">アカウント設定</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
                    <input
                      type="email"
                      value={profileData.email}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">通知設定</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm text-gray-700">新しい案件の通知</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm text-gray-700">メッセージ通知</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm text-gray-700">マーケティング情報</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-sm font-medium text-red-700 mb-3">危険な操作</h4>
                    <button className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 text-sm">
                      アカウントを削除
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* モバイルフッターナビゲーション */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <Link href="/cfo-dashboard" className="flex flex-col items-center py-2 text-gray-600">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6" />
            </svg>
            <span className="text-xs">案件</span>
          </Link>
          <Link href="/cfo-messages" className="flex flex-col items-center py-2 text-gray-600">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.991 8.991 0 01-4.683-1.317L3 21l2.317-5.317A8.991 8.991 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
            <span className="text-xs">メッセージ</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}