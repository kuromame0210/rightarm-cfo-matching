'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditing, setIsEditing] = useState(false)

  // サンプル企業プロフィールデータ
  const [profileData, setProfileData] = useState({
    companyName: '株式会社テックイノベーション',
    contactPerson: '山田 太郎',
    email: 'yamada@tech-innovation.co.jp',
    description: '最新技術を活用したソリューション開発を行うスタートアップ企業です。主にSaaS製品の開発・運営を行っており、現在急成長中です。',
    location: '東京都',
    challenges: ['資金調達', 'IPO準備', '管理会計'],
    budgetRange: '100〜200万円',
    website: 'https://tech-innovation.co.jp',
    employees: '30名',
    founded: '2020年',
    industry: 'IT・ソフトウェア'
  })

  const handleSave = () => {
    // ここで実際の保存処理を行う
    setIsEditing(false)
  }

  const handleLogout = () => {
    // ログアウト処理
    window.location.href = '/auth/login'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/home" className="md:hidden text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900 tracking-wide">RIGHTARM</h1>
            </div>
            
            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/home" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                CFOを探す
              </Link>
              <Link href="/messages" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                メッセージ
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </button>
              
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">企</span>
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
                <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-semibold">企</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">{profileData.companyName}</h2>
                <p className="text-sm text-gray-600">{profileData.contactPerson}</p>
              </div>
              
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'profile'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  プロフィール
                </button>
                <button
                  onClick={() => setActiveTab('matches')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'matches'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  マッチング履歴
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'reviews'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  レビュー
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'settings'
                      ? 'bg-gray-100 text-gray-900'
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
                  <h3 className="text-lg font-semibold text-gray-900">企業プロフィール</h3>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">会社名</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.companyName}
                          onChange={(e) => setProfileData({...profileData, companyName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.companyName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">担当者名</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.contactPerson}
                          onChange={(e) => setProfileData({...profileData, contactPerson: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.contactPerson}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">所在地</label>
                      {isEditing ? (
                        <select
                          value={profileData.location}
                          onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">業界</label>
                      <p className="text-gray-900">{profileData.industry}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">従業員数</label>
                      <p className="text-gray-900">{profileData.employees}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">設立年</label>
                      <p className="text-gray-900">{profileData.founded}</p>
                    </div>
                  </div>

                  {/* 会社概要 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">会社概要</label>
                    {isEditing ? (
                      <textarea
                        value={profileData.description}
                        onChange={(e) => setProfileData({...profileData, description: e.target.value})}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData.description}</p>
                    )}
                  </div>

                  {/* 財務課題 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">抱えている財務課題</label>
                    <div className="flex flex-wrap gap-2">
                      {profileData.challenges.map(challenge => (
                        <span key={challenge} className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {challenge}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 予算 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">希望予算（月額）</label>
                    <p className="text-gray-900">{profileData.budgetRange}</p>
                  </div>

                  {isEditing && (
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
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

            {/* マッチング履歴タブ */}
            {activeTab === 'matches' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">マッチング履歴</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold">田</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">田中 太郎</h4>
                        <p className="text-sm text-gray-600">資金調達支援 • 進行中</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        進行中
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold">佐</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">佐藤 花子</h4>
                        <p className="text-sm text-gray-600">財務システム導入 • 完了</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                        完了
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* レビュータブ */}
            {activeTab === 'reviews' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">レビュー</h3>
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">まだレビューはありません</p>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">通知設定</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm text-gray-700">新しいメッセージの通知</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm text-gray-700">マッチング通知</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span className="text-sm text-gray-700">プロモーション情報</span>
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
          <Link href="/home" className="flex flex-col items-center py-2 text-gray-600">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs">探す</span>
          </Link>
          <Link href="/messages" className="flex flex-col items-center py-2 text-gray-600">
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