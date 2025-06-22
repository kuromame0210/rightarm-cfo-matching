'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

// CFOデータ（実際のアプリではAPIから取得）
const CFO_DATA = [
  {
    id: 1,
    name: '山田 太郎',
    profileImage: '/placeholder-avatar.jpg',
    skills: ['資金調達', 'IPO準備', '銀行融資'],
    experience: '大手証券会社で15年、IPO実績多数',
    workStyle: 'リモート可・週2日〜',
    compensation: '月80万円〜',
    introduction: '大手証券会社出身。多数のIPO実績を持ち、資金調達から上場まで一貫してサポート可能。',
    detailedExperience: [
      '野村證券にて15年間勤務、IPO引受部門でシニアマネージャーを歴任',
      '50社以上のIPO案件を担当、累計調達額500億円超',
      'ベンチャー企業のCFOとして3社でIPO達成',
      '現在は独立系CFOとして複数社の財務戦略をサポート'
    ],
    specialties: [
      { area: '資金調達', detail: 'シリーズA〜IPOまで幅広く対応' },
      { area: 'IPO準備', detail: '証券会社との調整、資料作成等' },
      { area: '銀行融資', detail: 'メガバンクとの交渉実績豊富' },
      { area: '財務戦略', detail: '中長期的な資本政策立案' }
    ],
    pastProjects: [
      {
        company: '株式会社テックイノベーション',
        period: '2023年4月〜2024年3月',
        description: 'シリーズBラウンドで30億円調達成功。IR体制構築も支援。',
        results: ['調達額30億円達成', 'IR体制構築', '投資家向け資料作成']
      },
      {
        company: 'AIスタートアップ株式会社',
        period: '2022年1月〜2023年12月',
        description: 'IPO準備から上場まで一貫サポート。株式公開達成。',
        results: ['東証グロース市場上場', '時価総額200億円', '調達額50億円']
      }
    ],
    workPreferences: {
      location: ['東京', 'リモート可'],
      schedule: '週2-3日（応相談）',
      duration: '3ヶ月〜長期',
      startDate: '2024年4月〜'
    },
    certifications: [
      '公認会計士',
      'CFA（米国証券アナリスト）',
      '中小企業診断士'
    ],
    education: [
      '東京大学経済学部卒業',
      'ハーバード・ビジネス・スクール MBA取得'
    ],
    languages: ['日本語（ネイティブ）', '英語（ビジネスレベル）'],
    availability: 'すぐに開始可能',
    lastLogin: '2024年1月15日'
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
    detailedExperience: [
      'あずさ監査法人にて8年間、上場企業の監査業務を担当',
      '独立後は中小企業の財務コンサルティングに特化',
      'ERP導入支援実績30社以上、業務効率化で定評',
      '製造業・サービス業での管理会計強化が得意分野'
    ],
    specialties: [
      { area: '管理会計', detail: '原価計算、予算管理の仕組み構築' },
      { area: 'ERP導入', detail: 'システム選定から運用まで一貫支援' },
      { area: '財務分析', detail: 'KPI設計、ダッシュボード構築' },
      { area: '内部統制', detail: '上場準備企業の内部統制構築' }
    ],
    pastProjects: [
      {
        company: '製造業ABC株式会社',
        period: '2023年6月〜現在',
        description: '原価計算システムの見直しと管理会計体制の構築を実施。',
        results: ['原価計算精度20%向上', 'ERP導入完了', '月次決算早期化']
      }
    ],
    workPreferences: {
      location: ['東京', '神奈川', 'リモート可'],
      schedule: '週1-2日',
      duration: '6ヶ月〜',
      startDate: '2024年3月〜'
    },
    certifications: [
      '公認会計士',
      'システム監査技術者',
      'MBA（財務会計専攻）'
    ],
    education: [
      '慶應義塾大学商学部卒業',
      '青山学院大学大学院 MBA取得'
    ],
    languages: ['日本語（ネイティブ）', '英語（日常会話レベル）'],
    availability: '2024年3月から開始可能',
    lastLogin: '2024年1月14日'
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
    detailedExperience: [
      'カーライル・グループにて10年間、M&Aアドバイザリー業務を担当',
      '事業再生案件20件以上を成功に導く',
      'バイアウトファンドでの投資実績100億円超',
      '現在は独立系として企業価値向上コンサルティングを提供'
    ],
    specialties: [
      { area: 'M&A', detail: '買収・売却の戦略立案から実行まで' },
      { area: '事業再生', detail: '赤字事業の収益化、組織再編' },
      { area: 'バリュエーション', detail: 'DCF、マルチプル等の企業価値算定' },
      { area: '投資戦略', detail: 'PE/VCからの資金調達戦略' }
    ],
    pastProjects: [
      {
        company: '地方製造業グループ',
        period: '2022年4月〜2023年6月',
        description: '業績不振子会社の事業再生と売却を支援。企業価値を3倍に向上。',
        results: ['EBITDA 150%改善', '企業価値3倍向上', '売却完了']
      }
    ],
    workPreferences: {
      location: ['全国対応（リモート）'],
      schedule: 'プロジェクト単位',
      duration: '3ヶ月〜2年',
      startDate: '2024年2月〜'
    },
    certifications: [
      'CPA（米国公認会計士）',
      'CFA（米国証券アナリスト）',
      'M&Aシニアエキスパート'
    ],
    education: [
      '一橋大学商学部卒業',
      'ウォートン・スクール MBA取得'
    ],
    languages: ['日本語（ネイティブ）', '英語（ネイティブレベル）', '中国語（日常会話）'],
    availability: '2024年2月から開始可能',
    lastLogin: '2024年1月13日'
  }
]

export default function CFODetailPage() {
  const params = useParams()
  const router = useRouter()
  const cfoId = parseInt(params.id as string)
  
  const [activeSection, setActiveSection] = useState('overview')
  const [showScoutModal, setShowScoutModal] = useState(false)
  const [isInterested, setIsInterested] = useState(false)
  const [scoutMessage, setScoutMessage] = useState('')
  
  const cfo = CFO_DATA.find(c => c.id === cfoId)
  
  if (!cfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">CFOが見つかりません</h1>
          <Link href="/home" className="text-blue-600 hover:text-blue-800">
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  const handleScout = () => {
    setShowScoutModal(true)
  }

  const sendScout = () => {
    // スカウト送信処理
    setShowScoutModal(false)
    setScoutMessage('')
    // Toast表示などの処理
  }

  const toggleInterested = () => {
    setIsInterested(!isInterested)
  }

  const sections = [
    { id: 'overview', label: '概要', icon: '📊' },
    { id: 'experience', label: '経歴・実績', icon: '💼' },
    { id: 'projects', label: '過去の案件', icon: '🎯' },
    { id: 'conditions', label: '稼働条件', icon: '⚙️' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* パンくずリスト */}
        <nav className="mb-4 md:mb-6 text-sm">
          <Link href="/home" className="text-blue-600 hover:text-blue-800">
            ホーム
          </Link>
          <span className="mx-2 text-gray-500">›</span>
          <span className="text-gray-700">{cfo.name}</span>
        </nav>

        {/* モバイル用アクションボタン - 上部に配置 */}
        <div className="lg:hidden mb-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleScout}
                className="w-full min-h-[44px] px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                🎯 スカウトを送る
              </button>
              
              <button
                onClick={toggleInterested}
                className={`w-full min-h-[44px] px-4 py-3 border rounded-lg transition-colors font-medium text-sm ${
                  isInterested
                    ? 'border-pink-500 bg-pink-50 text-pink-700 hover:bg-pink-100'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {isInterested ? '❤️ 気になる' : '🤍 気になる'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6 md:mb-0">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2">
            {/* CFOヘッダー */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">👤</span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{cfo.name}</h1>
                      <p className="text-gray-600 mb-3">{cfo.experience}</p>
                      <div className="flex flex-wrap gap-2">
                        {cfo.skills.map((skill) => (
                          <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700">{cfo.introduction}</p>
                </div>
              </div>
            </div>

            {/* ナビゲーションタブ */}
            <div className="bg-white rounded-lg shadow-sm border mb-6">
              {/* モバイル: ドロップダウン形式 */}
              <div className="md:hidden">
                <div className="relative">
                  <select 
                    value={activeSection} 
                    onChange={(e) => setActiveSection(e.target.value)}
                    className="w-full px-4 py-3 text-sm font-medium border-b border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    {sections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.icon} {section.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-400">▼</span>
                  </div>
                </div>
              </div>
              
              {/* PC: タブ形式 */}
              <nav className="hidden md:flex border-b">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeSection === section.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{section.icon}</span>
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* セクションコンテンツ */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {activeSection === 'overview' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">専門分野</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {cfo.specialties.map((specialty, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{specialty.area}</h4>
                        <p className="text-sm text-gray-600">{specialty.detail}</p>
                      </div>
                    ))}
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-4">学歴・資格</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">学歴</h4>
                      <ul className="space-y-1">
                        {cfo.education.map((edu, index) => (
                          <li key={index} className="text-sm text-gray-600">• {edu}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">資格</h4>
                      <ul className="space-y-1">
                        {cfo.certifications.map((cert, index) => (
                          <li key={index} className="text-sm text-gray-600">• {cert}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'experience' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">詳細経歴</h3>
                  <ul className="space-y-3">
                    {cfo.detailedExperience.map((exp, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-gray-700">{exp}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-900 mb-4 mt-8">言語スキル</h3>
                  <div className="flex flex-wrap gap-2">
                    {cfo.languages.map((lang, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'projects' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">過去の主要案件</h3>
                  <div className="space-y-6">
                    {cfo.pastProjects.map((project, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-gray-900">{project.company}</h4>
                          <span className="text-sm text-gray-500">{project.period}</span>
                        </div>
                        <p className="text-gray-700 mb-3">{project.description}</p>
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-2">主な成果</h5>
                          <ul className="space-y-1">
                            {project.results.map((result, resultIndex) => (
                              <li key={resultIndex} className="text-sm text-gray-600">
                                • {result}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'conditions' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">稼働条件</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">勤務地</h4>
                        <div className="flex flex-wrap gap-2">
                          {cfo.workPreferences.location.map((loc, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                              {loc}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">稼働スケジュール</h4>
                        <p className="text-gray-700">{cfo.workPreferences.schedule}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">契約期間</h4>
                        <p className="text-gray-700">{cfo.workPreferences.duration}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">開始可能時期</h4>
                        <p className="text-gray-700">{cfo.workPreferences.startDate}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">報酬</h4>
                        <p className="text-gray-700 font-semibold">{cfo.compensation}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">ステータス</h4>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                          {cfo.availability}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* サイドバー - PC専用 */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">アクション</h3>
              
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleScout}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  🎯 スカウトを送る
                </button>
                
                <button
                  onClick={toggleInterested}
                  className={`w-full px-4 py-3 border rounded-lg transition-colors font-medium ${
                    isInterested
                      ? 'border-pink-500 bg-pink-50 text-pink-700 hover:bg-pink-100'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {isInterested ? '❤️ 気になる' : '🤍 気になる'}
                </button>
                
                <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  📋 プロフィールを保存
                </button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">基本情報</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">最終ログイン</span>
                    <p className="text-gray-900">{cfo.lastLogin}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">稼働形態</span>
                    <p className="text-gray-900">{cfo.workStyle}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">報酬目安</span>
                    <p className="text-gray-900 font-semibold">{cfo.compensation}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* スカウトモーダル */}
      {showScoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">🎯 スカウト送信</h3>
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
                  <p className="font-medium text-gray-900">{cfo.name}</p>
                  <p className="text-sm text-gray-600">{cfo.experience}</p>
                </div>
              </div>
              
              <textarea
                value={scoutMessage}
                onChange={(e) => setScoutMessage(e.target.value)}
                placeholder="スカウトメッセージを入力してください..."
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm resize-none"
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                送信
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}