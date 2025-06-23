'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function CFODetailPage() {
  const [showContactForm, setShowContactForm] = useState(false)
  
  // サンプルCFOデータ（実際にはAPIから取得）
  const cfo = {
    id: 1,
    name: '田中 太郎',
    experience: '15年以上',
    skills: ['資金調達支援', 'IPO・M&A関連', '管理会計構築'],
    location: '東京都',
    rate: '100〜200万円',
    rating: 4.8,
    reviews: 24,
    bio: '大手商社でのCFO経験を活かし、スタートアップの資金調達から上場まで幅広く支援しています。特に、財務戦略の立案から実行まで一貫してサポートし、企業の成長段階に応じた最適な資金調達手法をご提案いたします。',
    workStyle: 'リモート可',
    detailedBio: `20年以上の財務・経営企画の経験を持ち、大手商社にてCFOとして企業価値向上に貢献してまいりました。

    【主な実績】
    • スタートアップ企業の資金調達支援（累計50億円以上）
    • IPO準備支援（5社の上場サポート）
    • M&A案件のPMI（買収後統合）支援
    • 管理会計システムの導入・運用改善

    現在は独立し、成長企業の「右腕CFO」として、財務面から事業成長をサポートしています。企業の成長段階や課題に応じて、柔軟なサポート体制を提供いたします。`,
    availability: 'リモート中心、月2-3回の訪問可能',
    responseTime: '24時間以内',
    languages: ['日本語', '英語（ビジネスレベル）'],
    certifications: ['公認会計士', 'MBA（経営学修士）', 'CFA（米国証券アナリスト）'],
    pastProjects: [
      {
        title: 'SaaS企業のシリーズB資金調達支援',
        description: '15億円の資金調達をリードし、バリュエーション向上に貢献',
        duration: '6ヶ月'
      },
      {
        title: 'ヘルステック企業のIPO準備',
        description: '内部統制構築から開示書類作成まで上場準備全般をサポート',
        duration: '18ヶ月'
      },
      {
        title: 'EC企業の管理会計システム導入',
        description: '事業部別損益管理システムの構築と運用改善',
        duration: '3ヶ月'
      }
    ]
  }

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
    },
    {
      id: 3,
      companyName: '株式会社スマートソリューション',
      rating: 4,
      comment: '管理会計の仕組み作りでお世話になりました。現場の実情を理解した上で実用的な提案をいただけました。',
      date: '2023年12月'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/home" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900 tracking-wide">RIGHTARM</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </button>
              
              <Link href="/profile" className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors">
                <span className="text-sm font-medium">企</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* プロフィールヘッダー */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start space-x-6">
                <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-semibold">{cfo.name[0]}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">{cfo.name}</h1>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span>{cfo.location}</span>
                        <span>•</span>
                        <span>{cfo.workStyle}</span>
                        <span>•</span>
                        <span>経験 {cfo.experience}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400 text-lg">★</span>
                          <span className="font-medium">{cfo.rating}</span>
                          <span className="text-gray-500">({cfo.reviews}件の評価)</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900 mb-1">{cfo.rate}</div>
                      <div className="text-sm text-gray-600">月額報酬</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 専門スキル */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">専門スキル</h2>
              <div className="flex flex-wrap gap-2">
                {cfo.skills.map(skill => (
                  <span key={skill} className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* 自己紹介 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">自己紹介</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{cfo.detailedBio}</p>
              </div>
            </div>

            {/* 実績・プロジェクト */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">主な実績</h2>
              <div className="space-y-4">
                {cfo.pastProjects.map((project, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-medium text-gray-900">{project.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                    <p className="text-gray-500 text-xs mt-2">期間: {project.duration}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* レビュー */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">クライアントレビュー</h2>
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
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            
            {/* 連絡フォーム */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">連絡する</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>返信時間: {cfo.responseTime}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{cfo.availability}</span>
                </div>
              </div>

              {!showContactForm ? (
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowContactForm(true)}
                    className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                  >
                    メッセージを送る
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    お気に入りに追加
                  </button>
                </div>
              ) : (
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">件名</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="相談内容の件名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">メッセージ</label>
                    <textarea 
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="相談したい内容を詳しくお書きください"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      type="submit"
                      className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      送信
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowContactForm(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* 追加情報 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">追加情報</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">対応言語</h4>
                  <div className="flex flex-wrap gap-1">
                    {cfo.languages.map(lang => (
                      <span key={lang} className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">資格・認定</h4>
                  <div className="space-y-1">
                    {cfo.certifications.map(cert => (
                      <div key={cert} className="text-sm text-gray-600">• {cert}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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