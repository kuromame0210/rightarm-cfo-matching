'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

export default function HomePage() {
  const [userType] = useState<'company' | 'cfo'>('company') // デモ用固定値
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [interestedProfiles, setInterestedProfiles] = useState<number[]>([])
  const [scoutedProfiles, setScoutedProfiles] = useState<number[]>([])
  const [showScoutModal, setShowScoutModal] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<any>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // サンプルCFOデータ
  const cfoProfiles = [
    {
      id: 1,
      name: '山田 太郎',
      profileImage: '/placeholder-avatar.jpg',
      skills: ['資金調達', 'IPO準備', '銀行融資'],
      experience: '大手証券会社で15年、IPO実績多数',
      workStyle: 'リモート可・週2日〜',
      compensation: '月80万円〜',
      introduction: '大手証券会社出身。多数のIPO実績を持ち、資金調達から上場まで一貫してサポート可能。',
    },
    {
      id: 2,
      name: '田中 花子',
      profileImage: '/placeholder-avatar.jpg',
      skills: ['管理会計', '財務分析', 'ERP導入'],
      experience: '監査法人出身、中小企業支援12年',
      workStyle: '週1日〜対応',
      compensation: '月60万円〜',
      introduction: '監査法人出身。中小企業の財務改善・システム導入に豊富な実績。',
    },
    {
      id: 3,
      name: '佐藤 次郎',
      profileImage: '/placeholder-avatar.jpg',
      skills: ['M&A', '事業再生', 'バリュエーション'],
      experience: 'PEファンド出身、M&A実績18年',
      workStyle: 'フルリモート',
      compensation: '月100万円〜',
      introduction: 'PEファンド出身。事業再生・M&Aの豊富な経験で企業価値向上をサポート。',
    },
  ]

  // サンプル企業データ
  const companyProfiles = [
    {
      id: 1,
      companyName: '株式会社テックスタート',
      businessName: 'AI-SaaSプラットフォーム',
      revenue: '年商8億円',
      challenges: ['資金調達', 'IPO準備'],
      requirements: 'IPO経験のあるCFO、VC対応経験必須',
      timeline: '2024年4月〜',
      description: 'BtoB向けAIソリューションを提供。シリーズBラウンドの資金調達を予定。',
    },
    {
      id: 2,
      companyName: '製造業ABC株式会社',
      businessName: '精密機械部品製造',
      revenue: '年商50億円',
      challenges: ['管理会計強化'],
      requirements: '製造業での管理会計経験、ERP導入経験',
      timeline: '2024年3月〜',
      description: '創業50年の老舗メーカー。原価計算の精度向上が課題。',
    },
  ]

  const skillOptions = ['資金調達', 'IPO準備', 'M&A', '管理会計', '財務分析', '事業再生', '銀行融資', 'VC調達', 'ERP導入']

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  // Toast表示
  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // 気になるボタンの位置を取得してポップアップを表示
  const [popupPosition, setPopupPosition] = useState<{x: number, y: number} | null>(null)
  const [showInterestedPopup, setShowInterestedPopup] = useState(false)

  // 気になるボタンクリック
  const handleInterested = (profile: any, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top - 10
    
    // 先にポップアップ位置を設定
    setPopupPosition({x, y})
    
    if (interestedProfiles.includes(profile.id)) {
      setInterestedProfiles(prev => prev.filter(id => id !== profile.id))
      setToastMessage('気になるから削除しました')
    } else {
      setInterestedProfiles(prev => [...prev, profile.id])
      setToastMessage('気になるに追加しました ❤️')
    }
    
    // 位置設定後にポップアップを表示
    setShowInterestedPopup(true)
    setTimeout(() => setShowInterestedPopup(false), 2000)
  }

  // スカウトボタンクリック
  const handleScout = (profile: any) => {
    setSelectedProfile(profile)
    setShowScoutModal(true)
  }

  // スカウトモーダルで送信
  const sendScout = () => {
    if (selectedProfile) {
      setScoutedProfiles(prev => [...prev, selectedProfile.id])
      showToastMessage(`${selectedProfile.name}さんにスカウトを送信しました`)
      setShowScoutModal(false)
      setSelectedProfile(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader isLoggedIn={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* モバイル検索バー */}
        <div className="md:hidden mb-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={userType === 'company' ? 'CFOの名前やスキル' : '会社名や業界'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 text-sm"
            />
            <button 
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="mt-2 w-full bg-gray-100 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
            >
              絞り込み設定 {showMobileFilters ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* モバイル用絞り込みパネル */}
        {showMobileFilters && (
          <div className="md:hidden mb-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">検索・絞り込み</h3>
              
              {/* スキルフィルター */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {userType === 'company' ? '専門スキル' : '財務課題'}
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {skillOptions.map((skill) => (
                    <label key={skill} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={() => toggleSkill(skill)}
                        className="mr-2"
                      />
                      <span className="text-sm">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* その他のフィルター */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {userType === 'company' ? '稼働形態' : '業界'}
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">すべて</option>
                    {userType === 'company' ? (
                      <>
                        <option>週1日〜</option>
                        <option>月1回〜</option>
                        <option>プロジェクト単位</option>
                      </>
                    ) : (
                      <>
                        <option>IT・Web</option>
                        <option>製造業</option>
                        <option>サービス業</option>
                      </>
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">地域</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">全国</option>
                    <option>東京</option>
                    <option>大阪</option>
                    <option>愛知</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={() => setShowMobileFilters(false)}
                className="mt-3 w-full bg-gray-900 text-white py-2 rounded-lg text-sm"
              >
                フィルターを適用
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* サイドバー - PC用 */}
          <div className="hidden md:block md:w-1/4">
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

              {/* スキルフィルター */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {userType === 'company' ? '専門スキル' : '財務課題'}
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {skillOptions.map((skill) => (
                    <label key={skill} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(skill)}
                        onChange={() => toggleSkill(skill)}
                        className="mr-2"
                      />
                      <span className="text-sm">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* その他のフィルター */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {userType === 'company' ? '稼働形態' : '業界'}
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">すべて</option>
                    {userType === 'company' ? (
                      <>
                        <option>週1日〜</option>
                        <option>月1回〜</option>
                        <option>プロジェクト単位</option>
                      </>
                    ) : (
                      <>
                        <option>IT・Web</option>
                        <option>製造業</option>
                        <option>サービス業</option>
                      </>
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">地域</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="">全国</option>
                    <option>東京</option>
                    <option>大阪</option>
                    <option>愛知</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* メインコンテンツ */}
          <div className="w-full md:w-3/4">
            <div className="mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                {userType === 'company' ? '募集中のCFO一覧' : '募集中の企業一覧'}
              </h2>
              <p className="text-gray-600 text-sm md:text-base">
                {userType === 'company' ? cfoProfiles.length : companyProfiles.length}件見つかりました
              </p>
            </div>

            {/* プロフィールカード */}
            <div className="space-y-4 md:space-y-6 mb-6 md:mb-0">
              {userType === 'company' ? (
                // CFOプロフィール表示
                cfoProfiles.map((cfo) => (
                  <div key={cfo.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-4">
                      <div className="flex items-start space-x-3 md:space-x-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
                          <span className="text-lg md:text-2xl">👤</span>
                        </div>
                        <div className="flex-1 md:hidden">
                          <h3 className="text-base font-semibold text-gray-900">{cfo.name}</h3>
                          <p className="text-gray-600 text-sm">{cfo.experience}</p>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                          <div className="hidden md:block">
                            <h3 className="text-lg font-semibold text-gray-900">{cfo.name}</h3>
                            <p className="text-gray-600 text-sm">{cfo.experience}</p>
                          </div>
                          <div className="flex gap-2 mt-3 md:mt-0">
                            <Link 
                              href={`/cfo/${cfo.id}`}
                              className="flex-1 md:flex-none min-h-[44px] px-3 md:px-4 py-3 border border-blue-500 text-blue-600 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 text-center flex items-center justify-center"
                            >
                              📋 詳細へ
                            </Link>
                            <button 
                              onClick={(e) => handleInterested(cfo, e)}
                              className={`flex-1 md:flex-none min-h-[44px] px-3 md:px-4 py-3 border text-sm font-medium transition-all duration-200 active:scale-95 rounded-lg flex items-center justify-center ${
                                interestedProfiles.includes(cfo.id)
                                  ? 'border-pink-500 bg-pink-50 text-pink-700 hover:bg-pink-100'
                                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                              }`}
                            >
                              {interestedProfiles.includes(cfo.id) ? '❤️ 気になる' : '🤍 気になる'}
                            </button>
                            <button 
                              onClick={() => handleScout(cfo)}
                              disabled={scoutedProfiles.includes(cfo.id)}
                              className={`flex-1 md:flex-none min-h-[44px] px-3 md:px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center ${
                                scoutedProfiles.includes(cfo.id)
                                  ? 'bg-gray-400 text-white cursor-not-allowed'
                                  : 'bg-gray-900 text-white hover:bg-gray-800 hover:scale-105'
                              }`}
                            >
                              {scoutedProfiles.includes(cfo.id) ? '送信済み' : 'スカウト'}
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 md:gap-2 mb-3">
                          {cfo.skills.map((skill) => (
                            <span key={skill} className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2 md:line-clamp-none">{cfo.introduction}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-sm text-gray-600">
                          <div><strong>稼働形態:</strong> {cfo.workStyle}</div>
                          <div><strong>報酬:</strong> {cfo.compensation}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // 企業プロフィール表示
                companyProfiles.map((company) => (
                  <div key={company.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900">{company.companyName}</h3>
                        <p className="text-gray-600 font-medium text-sm md:text-base">{company.businessName}</p>
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-xs md:text-sm text-gray-500">
                          <span>{company.revenue}</span>
                          <span>{company.timeline}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-3 md:mt-0">
                        <button 
                          onClick={(e) => handleInterested(company, e)}
                          className={`flex-1 md:flex-none px-3 md:px-4 py-2 border text-sm transition-all duration-200 active:scale-95 rounded ${
                            interestedProfiles.includes(company.id)
                              ? 'border-pink-500 bg-pink-50 text-pink-700 hover:bg-pink-100'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {interestedProfiles.includes(company.id) ? '❤️ 気になる' : '🤍 気になる'}
                        </button>
                        <button 
                          onClick={() => handleScout(company)}
                          disabled={scoutedProfiles.includes(company.id)}
                          className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded text-sm transition-all duration-200 active:scale-95 ${
                            scoutedProfiles.includes(company.id)
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-gray-900 text-white hover:bg-gray-800'
                          }`}
                        >
                          {scoutedProfiles.includes(company.id) ? '応募済み' : '応募'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 md:gap-2 mb-3">
                      {company.challenges.map((challenge) => (
                        <span key={challenge} className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded">
                          {challenge}
                        </span>
                      ))}
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 md:line-clamp-none">{company.description}</p>
                    
                    <div className="text-sm text-gray-600">
                      <strong>求める要件:</strong> {company.requirements}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 気になるポップアップ */}
      {showInterestedPopup && popupPosition && (
        <div 
          className="fixed bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg z-50 animate-fade-in-up text-sm pointer-events-none"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Toast通知 */}
      {showToast && !showInterestedPopup && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* スカウトモーダル */}
      {showScoutModal && selectedProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {userType === 'company' ? '🎯 スカウト送信' : '📝 応募確認'}
              </h3>
              <button 
                onClick={() => setShowScoutModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {userType === 'company' ? selectedProfile.name : selectedProfile.companyName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {userType === 'company' ? selectedProfile.experience : selectedProfile.businessName}
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                {userType === 'company' 
                  ? 'このCFOにスカウトを送信しますか？' 
                  : 'この企業に応募しますか？'
                }
              </p>
              
              <textarea
                placeholder={userType === 'company' 
                  ? 'スカウトメッセージを入力してください...' 
                  : '応募メッセージを入力してください...'
                }
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 text-sm resize-none"
              />
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowScoutModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm"
              >
                キャンセル
              </button>
              <button 
                onClick={sendScout}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm"
              >
                {userType === 'company' ? '送信' : '応募'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}