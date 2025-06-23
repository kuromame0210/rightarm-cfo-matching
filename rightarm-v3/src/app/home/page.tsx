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

  // v5.1仕様書準拠：CFOカード表示項目増強
  const cfoProfiles = [
    {
      id: 1,
      name: '山田 太郎',
      nickname: '戦略CFO山田',
      profileImage: '/placeholder-avatar.jpg',
      photoUrl: '👨‍💼',
      // 可能な業務/スキル
      skills: ['資金調達', 'IPO準備', '銀行融資', '投資家対応'],
      // 実績・経歴
      experience: '大手証券会社で15年勤務後、5社のIPOをリード。累計調達額200億円以上の実績',
      achievements: [
        'シリーズA〜C資金調達支援：15社',
        'IPO実行支援：5社（マザーズ3社、プライム2社）',
        '投資家ピッチ支援：50回以上'
      ],
      // 保有資格
      certifications: ['公認会計士', 'CFA', 'MBA(ファイナンス)'],
      // 稼働希望形態
      workStyle: 'リモート可・週2日〜',
      workPreference: '長期プロジェクト重視',
      // 希望報酬イメージ
      compensation: '月100万円〜',
      compensationRange: '月100万円〜150万円',
      // 自己紹介/一言
      introduction: '大手証券会社出身。多数のIPO実績を持ち、資金調達から上場まで一貫してサポート可能。戦略的CFOとして企業価値最大化に貢献します。',
      // 顔写真（可能であれば）
      hasPhoto: true,
      rating: 4.9,
      reviewCount: 12,
      available: true
    },
    {
      id: 2,
      name: '田中 花子',
      nickname: 'システムCFO田中',
      profileImage: '/placeholder-avatar.jpg',
      photoUrl: '👩‍💼',
      skills: ['管理会計', '財務分析', 'ERP導入', '財務DX'],
      experience: '監査法人出身、中小企業の財務改善・システム導入を12年間支援',
      achievements: [
        '管理会計システム導入：30社以上',
        'ERP導入プロジェクト成功率：95%',
        '財務改善効果：平均コスト削減20%'
      ],
      certifications: ['公認会計士', 'システム監査技術者', 'PMP'],
      workStyle: '週1日〜・複数社対応可',
      workPreference: 'システム導入重視',
      compensation: '月60万円〜',
      compensationRange: '月60万円〜90万円',
      introduction: '監査法人出身。中小企業の財務改善・システム導入に豊富な実績。複数社の並行支援も可能で、効率的な財務体制構築をサポートします。',
      hasPhoto: true,
      rating: 4.7,
      reviewCount: 8,
      available: true
    },
    {
      id: 3,
      name: '佐藤 次郎',
      nickname: 'M&A佐藤',
      profileImage: '/placeholder-avatar.jpg',
      photoUrl: '👨‍💼',
      skills: ['M&A', '事業再生', 'バリュエーション', 'IPO・M&A関連'],
      experience: 'PEファンド出身、M&A案件50件以上の経験。事業再生から企業価値向上まで幅広く対応',
      achievements: [
        'M&A案件実行：50件以上（買収30件、売却20件）',
        '事業再生支援：15社（全社黒字化達成）',
        '企業価値評価：累計100社以上'
      ],
      certifications: ['MBA(経営戦略)', '事業再生士', 'M&Aエキスパート'],
      workStyle: 'フルリモート・プロジェクト単位',
      workPreference: '高度専門案件重視',
      compensation: '月120万円〜',
      compensationRange: '月120万円〜200万円',
      introduction: 'PEファンド出身。事業再生・M&Aの豊富な経験で企業価値向上をサポート。複雑な案件ほど力を発揮します。',
      hasPhoto: true,
      rating: 4.8,
      reviewCount: 15,
      available: false
    },
  ]

  // v5.1仕様書準拠：企業カード表示項目増強
  const companyProfiles = [
    {
      id: 1,
      // 会社名/事業名
      companyName: '株式会社テックスタート',
      businessName: 'AI-SaaSプラットフォーム開発',
      logo: '🏢',
      industry: 'IT・ソフトウェア',
      // 会社概要
      overview: 'BtoB向けAI SaaSプラットフォームを展開。データ解析の自動化により業務効率化を支援',
      revenue: '年商8億円',
      employeeCount: '50名',
      location: '東京都渋谷区',
      // 抱えている財務課題
      challenges: ['資金調達', 'IPO準備', '投資家対応'],
      // 課題の背景や状況
      challengeBackground: 'シリーズBラウンドでの10億円調達を予定。VCとの交渉や株主総会対応の経験が必要',
      challengeDetails: [
        'VC・投資家との交渉サポート',
        '資金調達資料の作成支援',
        '財務DD対応の体制構築',
        'KPI管理システムの強化'
      ],
      // CFOに求めたいこと
      cfoRequirements: '上場企業でのIR経験、VC調達経験、株主対応経験必須',
      requiredSkills: ['IPO準備', 'VC調達', '投資家対応', 'DD対応'],
      // 希望時期
      timeline: '2024年4月〜長期',
      expectedDuration: '最低1年、IPOまで継続希望',
      compensation: '月100万円〜',
      workStyle: 'ハイブリッド（週2-3日出社）',
      description: 'BtoB向けAIソリューションを提供。シリーズBラウンドの資金調達を予定。',
      urgency: 'high',
      rating: 4.6,
      reviewCount: 8
    },
    {
      id: 2,
      companyName: '製造業ABC株式会社',
      businessName: '精密機械部品製造',
      logo: '🏭',
      industry: '製造業',
      overview: '自動車部品などの精密機械部品を製造する創業50年の老舗メーカー',
      revenue: '年商50億円',
      employeeCount: '300名',
      location: '愛知県名古屋市',
      challenges: ['管理会計強化', '原価計算', 'ERP導入'],
      challengeBackground: '創業50年の老舗だが、原価計算が曖昧で部門別収益性が見えない状況',
      challengeDetails: [
        '製品別原価計算の精度向上',
        '部門別損益管理の導入',
        'ERP導入による業務効率化',
        '予実管理システムの構築'
      ],
      cfoRequirements: '製造業での管理会計経験、ERP導入プロジェクト経験、原価計算システム構築経験',
      requiredSkills: ['管理会計', 'ERP導入', '原価計算', '製造業経験'],
      timeline: '2024年3月〜1年間',
      expectedDuration: '1年間（成果により延長検討）',
      compensation: '月80万円〜',
      workStyle: '現地・週1日〜',
      description: '創業50年の老舗メーカー。原価計算の精度向上が課題。',
      urgency: 'medium',
      rating: 4.3,
      reviewCount: 5
    },
    {
      id: 3,
      companyName: 'グリーンエナジー株式会社',
      businessName: '再生可能エネルギー事業',
      logo: '🌱',
      industry: 'エネルギー',
      overview: '太陽光・風力発電事業を展開する成長企業',
      revenue: '年商25億円',
      employeeCount: '80名',
      location: '大阪府大阪市',
      challenges: ['補助金活用', '銀行融資', '財務分析'],
      challengeBackground: '太陽光発電事業の拡大に向け、補助金活用と銀行融資による資金調達が必要',
      challengeDetails: [
        '補助金申請・管理の体制構築',
        '銀行との融資交渉サポート',
        'プロジェクト収益性分析',
        'リスク管理体制の強化'
      ],
      cfoRequirements: 'エネルギー業界知識、補助金申請経験、プロジェクトファイナンス経験',
      requiredSkills: ['補助金活用', '銀行融資', '財務分析', 'プロジェクトファイナンス'],
      timeline: '2024年5月〜18ヶ月',
      expectedDuration: '18ヶ月（プロジェクト完了まで）',
      compensation: '月90万円〜',
      workStyle: 'リモート可・週1日〜',
      description: '太陽光・風力発電事業を展開。新規プロジェクトの資金調達と収益性分析の専門家を求む',
      urgency: 'medium',
      rating: 4.1,
      reviewCount: 3
    }
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
                // v5.1仕様書準拠：CFOプロフィール表示
                cfoProfiles.map((cfo) => (
                  <div key={cfo.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-4">
                      {/* 顔写真（可能であれば） */}
                      <div className="flex items-start space-x-3 md:space-x-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center">
                          <span className="text-lg md:text-2xl">{cfo.photoUrl}</span>
                        </div>
                        <div className="flex-1 md:hidden">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-semibold text-gray-900">{cfo.name}</h3>
                            <div className="flex items-center">
                              <span className="text-yellow-400 text-sm">★</span>
                              <span className="text-sm text-gray-600 ml-1">{cfo.rating}</span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              cfo.available 
                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                : 'bg-gray-50 text-gray-600 border border-gray-200'
                            }`}>
                              {cfo.available ? '対応可能' : '満員'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">{cfo.nickname}</p>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        {/* 氏名/ニックネーム */}
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                          <div className="hidden md:block">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900">{cfo.name}</h3>
                              <div className="flex items-center">
                                <span className="text-yellow-400">★</span>
                                <span className="text-gray-900 ml-1">{cfo.rating}</span>
                                <span className="text-sm text-gray-500 ml-1">({cfo.reviewCount}件)</span>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs border ${
                                cfo.available 
                                  ? 'bg-green-50 text-green-700 border-green-200' 
                                  : 'bg-gray-50 text-gray-600 border-gray-200'
                              }`}>
                                {cfo.available ? '対応可能' : '満員'}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm">{cfo.nickname}</p>
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
                              disabled={scoutedProfiles.includes(cfo.id) || !cfo.available}
                              className={`flex-1 md:flex-none min-h-[44px] px-3 md:px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center ${
                                scoutedProfiles.includes(cfo.id) || !cfo.available
                                  ? 'bg-gray-400 text-white cursor-not-allowed'
                                  : 'bg-gray-900 text-white hover:bg-gray-800 hover:scale-105'
                              }`}
                            >
                              {scoutedProfiles.includes(cfo.id) ? '送信済み' : !cfo.available ? '対応不可' : 'スカウト'}
                            </button>
                          </div>
                        </div>
                        
                        {/* 可能な業務/スキル */}
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">可能な業務/スキル:</p>
                          <div className="flex flex-wrap gap-1 md:gap-2">
                            {cfo.skills.map((skill) => (
                              <span key={skill} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {/* 実績・経歴 */}
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">実績・経歴:</p>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-1 md:line-clamp-none">{cfo.experience}</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {cfo.achievements.slice(0, 2).map((achievement, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-green-500 mr-1">•</span>
                                {achievement}
                              </li>
                            ))}
                            {cfo.achievements.length > 2 && (
                              <li className="text-gray-500">+{cfo.achievements.length - 2}件の実績</li>
                            )}
                          </ul>
                        </div>

                        {/* 保有資格 */}
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">保有資格:</p>
                          <div className="flex flex-wrap gap-1">
                            {cfo.certifications.map((cert) => (
                              <span key={cert} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* 稼働希望形態・希望報酬イメージ */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="text-xs text-gray-500">稼働希望形態:</span>
                            <p className="font-medium">{cfo.workStyle}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">希望報酬:</span>
                            <p className="font-medium">{cfo.compensationRange}</p>
                          </div>
                        </div>
                        
                        {/* 自己紹介/一言 */}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">自己紹介:</p>
                          <p className="text-gray-600 text-sm line-clamp-2 md:line-clamp-none">{cfo.introduction}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // v5.1仕様書準拠：企業プロフィール表示
                companyProfiles.map((company) => (
                  <div key={company.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                      <div className="flex items-start space-x-3 flex-1">
                        {/* 会社ロゴ */}
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                          {company.logo}
                        </div>
                        <div className="flex-1">
                          {/* 会社名/事業名 */}
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg md:text-xl font-semibold text-gray-900">{company.companyName}</h3>
                            <div className="flex items-center">
                              <span className="text-yellow-400">★</span>
                              <span className="text-gray-900 ml-1">{company.rating}</span>
                              <span className="text-sm text-gray-500 ml-1">({company.reviewCount}件)</span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs border ${
                              company.urgency === 'high' 
                                ? 'bg-red-50 text-red-700 border-red-200' 
                                : 'bg-orange-50 text-orange-700 border-orange-200'
                            }`}>
                              {company.urgency === 'high' ? '急募' : '通常'}
                            </span>
                          </div>
                          <p className="text-gray-600 font-medium text-sm md:text-base">{company.businessName}</p>
                          <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-xs md:text-sm text-gray-500">
                            <span>{company.industry}</span>
                            <span>•</span>
                            <span>{company.location}</span>
                            <span>•</span>
                            <span>{company.revenue}</span>
                            <span>•</span>
                            <span>{company.employeeCount}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-3 md:mt-0">
                        <button 
                          onClick={(e) => handleInterested(company, e)}
                          className={`flex-1 md:flex-none min-h-[44px] px-3 md:px-4 py-2 border text-sm transition-all duration-200 active:scale-95 rounded ${
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
                          className={`flex-1 md:flex-none min-h-[44px] px-3 md:px-4 py-2 rounded text-sm transition-all duration-200 active:scale-95 ${
                            scoutedProfiles.includes(company.id)
                              ? 'bg-gray-400 text-white cursor-not-allowed'
                              : 'bg-gray-900 text-white hover:bg-gray-800'
                          }`}
                        >
                          {scoutedProfiles.includes(company.id) ? '応募済み' : '応募'}
                        </button>
                      </div>
                    </div>
                    
                    {/* 会社概要 */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">会社概要:</p>
                      <p className="text-gray-700 text-sm">{company.overview}</p>
                    </div>
                    
                    {/* 抱えている財務課題 */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">抱えている財務課題:</p>
                      <div className="flex flex-wrap gap-1 md:gap-2">
                        {company.challenges.map((challenge) => (
                          <span key={challenge} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded border border-red-200">
                            {challenge}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 課題の背景や状況 */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">課題の背景や状況:</p>
                      <p className="text-gray-600 text-sm line-clamp-2 md:line-clamp-none">{company.challengeBackground}</p>
                    </div>

                    {/* CFOに求めたいこと */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">CFOに求めたいこと:</p>
                      <p className="text-gray-700 text-sm line-clamp-1 md:line-clamp-none">{company.cfoRequirements}</p>
                    </div>

                    {/* 希望時期・条件 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-sm text-gray-600">
                      <div>
                        <span className="text-xs text-gray-500">希望時期:</span>
                        <p className="font-medium">{company.timeline}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">報酬:</span>
                        <p className="font-medium">{company.compensation}</p>
                      </div>
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