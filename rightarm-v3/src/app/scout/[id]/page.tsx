'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import AppHeader from '@/components/AppHeader'

export default function ScoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // サンプルスカウト詳細データ（実際はAPIから取得）
  const scoutDetail = {
    id: parseInt(resolvedParams.id),
    from: '株式会社テックスタート',
    fromType: 'company',
    title: 'IPO準備CFOを募集しています',
    message: 'はじめまして。株式会社テックスタートの採用担当の田中と申します。\n\nあなたの豊富な上場経験とIPO支援実績に大変注目しており、ぜひ弊社のCFOとしてお力をお借りしたいと思います。\n\n弊社は現在シリーズBラウンドの資金調達を予定しており、2025年中のIPOを目指しております。特に以下の点でご支援いただければと考えております：\n\n・資金調達戦略の策定\n・投資家向け資料の作成\n・財務体制の構築\n・上場準備プロセスの管理\n\nまずはお時間をいただき、詳しくお話しさせていただけませんでしょうか。',
    receivedAt: '2024年1月15日 14:30',
    status: 'pending',
    urgency: 'high',
    compensation: '月120万円〜150万円',
    workStyle: '週3-4日（リモート可）',
    startDate: '2024年3月〜',
    projectDuration: '1-2年（IPO完了まで）',
    companyInfo: {
      name: '株式会社テックスタート',
      industry: 'AI・SaaS',
      size: '従業員数: 50名',
      revenue: '年商8億円',
      location: '東京都渋谷区',
      founded: '2018年',
      ceo: '佐藤 一郎',
      funding: 'シリーズA完了（累計調達額15億円）'
    },
    requirements: [
      'IPO支援経験（3社以上）',
      'VC・投資家との交渉経験',
      '上場企業での財務担当経験',
      '資金調達における財務DD対応経験',
      'CFO or 財務責任者の経験'
    ],
    benefits: [
      '成功報酬あり（IPO達成時）',
      'ストックオプション付与',
      'フルリモート勤務可能',
      '柔軟な勤務時間',
      '最新の財務システム環境'
    ],
    nextSteps: [
      '1. まずは30分程度のカジュアル面談',
      '2. 会社説明・事業計画の詳細共有',
      '3. 条件面談・契約条件の調整',
      '4. 最終面接（CEO・CTO・既存役員）',
      '5. 契約締結・業務開始'
    ],
    contactPerson: {
      name: '田中 美咲',
      position: '人事部長',
      email: 'tanaka@techstart.com',
      phone: '03-1234-5678'
    },
    attachments: [
      { name: '会社概要資料.pdf', size: '2.4MB', type: 'pdf' },
      { name: '事業計画書_2024.pdf', size: '3.1MB', type: 'pdf' },
      { name: '組織図.png', size: '1.2MB', type: 'image' }
    ]
  }

  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleAccept = () => {
    setShowAcceptModal(false)
    showToastMessage('スカウトを承諾しました。メッセージ画面に移動します。')
    setTimeout(() => {
      router.push('/messages')
    }, 2000)
  }

  const handleDecline = () => {
    setShowDeclineModal(false)
    showToastMessage('スカウトを辞退しました。')
    setTimeout(() => {
      router.push('/scout')
    }, 2000)
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-orange-500'
      case 'low': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high': return '急募'
      case 'medium': return '通常'
      case 'low': return '長期'
      default: return '通常'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader isLoggedIn={true} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 mb-6 md:mb-0">
        {/* ナビゲーション */}
        <div className="mb-6">
          <Link href="/scout" className="text-sm text-gray-600 hover:text-gray-900">
            ← スカウト一覧に戻る
          </Link>
        </div>

        {/* スカウト詳細 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          {/* ヘッダー情報 */}
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
              <div className="flex items-start space-x-3 md:space-x-4 mb-3 md:mb-0">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg md:text-2xl">🏢</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-2 pr-2">{scoutDetail.title}</h1>
                  <p className="text-gray-600 font-medium text-sm md:text-base">{scoutDetail.from}</p>
                  <p className="text-xs md:text-sm text-gray-500">{scoutDetail.receivedAt}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 flex-wrap">
                <span className={`inline-block px-2 py-1 text-white text-xs rounded-full ${getUrgencyColor(scoutDetail.urgency)}`}>
                  {getUrgencyText(scoutDetail.urgency)}
                </span>
                <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  返答待ち
                </span>
              </div>
            </div>

            {/* 条件概要 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4 bg-gray-50 rounded-lg p-3 md:p-4">
              <div className="grid grid-cols-2 gap-3 md:contents">
                <div>
                  <div className="text-xs text-gray-500 mb-1">報酬</div>
                  <div className="text-xs md:text-sm font-medium text-gray-900">{scoutDetail.compensation}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">稼働</div>
                  <div className="text-xs md:text-sm font-medium text-gray-900">{scoutDetail.workStyle}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:contents">
                <div>
                  <div className="text-xs text-gray-500 mb-1">開始時期</div>
                  <div className="text-xs md:text-sm font-medium text-gray-900">{scoutDetail.startDate}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">期間</div>
                  <div className="text-xs md:text-sm font-medium text-gray-900">{scoutDetail.projectDuration}</div>
                </div>
              </div>
            </div>
          </div>

          {/* スカウトメッセージ */}
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">スカウトメッセージ</h2>
            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
              <p className="text-sm md:text-base text-gray-700 whitespace-pre-line leading-relaxed">{scoutDetail.message}</p>
            </div>
          </div>

          {/* 会社情報 */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">会社情報</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">会社名:</span>
                  <span className="ml-2 text-sm text-gray-900">{scoutDetail.companyInfo.name}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">業界:</span>
                  <span className="ml-2 text-sm text-gray-900">{scoutDetail.companyInfo.industry}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">規模:</span>
                  <span className="ml-2 text-sm text-gray-900">{scoutDetail.companyInfo.size}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">売上:</span>
                  <span className="ml-2 text-sm text-gray-900">{scoutDetail.companyInfo.revenue}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">所在地:</span>
                  <span className="ml-2 text-sm text-gray-900">{scoutDetail.companyInfo.location}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">設立:</span>
                  <span className="ml-2 text-sm text-gray-900">{scoutDetail.companyInfo.founded}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">代表:</span>
                  <span className="ml-2 text-sm text-gray-900">{scoutDetail.companyInfo.ceo}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">資金調達:</span>
                  <span className="ml-2 text-sm text-gray-900">{scoutDetail.companyInfo.funding}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 求める要件 */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">求める要件</h2>
            <ul className="space-y-2">
              {scoutDetail.requirements.map((req, index) => (
                <li key={index} className="flex items-center text-sm text-gray-700">
                  <span className="text-green-600 mr-2">✓</span>
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* 提供条件・福利厚生 */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">提供条件・福利厚生</h2>
            <ul className="space-y-2">
              {scoutDetail.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center text-sm text-gray-700">
                  <span className="text-blue-600 mr-2">●</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* 選考フロー */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">選考フロー</h2>
            <div className="space-y-3">
              {scoutDetail.nextSteps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <span className="text-xs font-medium text-gray-600">{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700 flex-1">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 添付資料 */}
          {scoutDetail.attachments.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">添付資料</h2>
              <div className="space-y-2">
                {scoutDetail.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">📎</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.size}</p>
                      </div>
                    </div>
                    <button className="min-h-[44px] px-3 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded">ダウンロード</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 担当者情報 */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">担当者情報</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{scoutDetail.contactPerson.name}</p>
                  <p className="text-sm text-gray-600">{scoutDetail.contactPerson.position}</p>
                </div>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>📧 {scoutDetail.contactPerson.email}</p>
                <p>📞 {scoutDetail.contactPerson.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        {scoutDetail.status === 'pending' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">このスカウトへの対応</h3>
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
              <button 
                onClick={() => setShowAcceptModal(true)}
                className="flex-1 min-h-[48px] md:min-h-[44px] px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-center text-sm md:text-base flex items-center justify-center"
              >
                ✓ 承諾する
              </button>
              <button 
                onClick={() => setShowDeclineModal(true)}
                className="flex-1 min-h-[48px] md:min-h-[44px] px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-center text-sm md:text-base flex items-center justify-center"
              >
                ✗ 辞退する
              </button>
              <button className="flex-1 min-h-[48px] md:min-h-[44px] px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-center text-sm md:text-base flex items-center justify-center">
                💬 質問する
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 承諾モーダル */}
      {showAcceptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">スカウトを承諾しますか？</h3>
            <p className="text-gray-600 mb-4">
              承諾すると、{scoutDetail.from}とのメッセージ交換が開始されます。
            </p>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="承諾メッセージを入力してください（任意）"
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm resize-none mb-4"
            />
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowAcceptModal(false)}
                className="flex-1 min-h-[44px] px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center justify-center"
              >
                キャンセル
              </button>
              <button 
                onClick={handleAccept}
                className="flex-1 min-h-[44px] px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center"
              >
                承諾する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 辞退モーダル */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">スカウトを辞退しますか？</h3>
            <p className="text-gray-600 mb-4">
              一度辞退すると、元に戻すことはできません。
            </p>
            <textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="辞退理由を入力してください（任意）"
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm resize-none mb-4"
            />
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowDeclineModal(false)}
                className="flex-1 min-h-[44px] px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center justify-center"
              >
                キャンセル
              </button>
              <button 
                onClick={handleDecline}
                className="flex-1 min-h-[44px] px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center"
              >
                辞退する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast通知 */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  )
}