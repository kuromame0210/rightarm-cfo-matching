'use client'

import { useState } from 'react'
import AppHeader from '@/components/AppHeader'
import ScoutCard from '@/components/ScoutCard'

// データを外に出して再作成を防ぐ
const RECEIVED_SCOUTS = [
    {
      id: 1,
      from: '株式会社テックスタート',
      fromType: 'company',
      title: 'IPO準備CFOを募集しています',
      message: 'あなたの豊富な上場経験に注目し、ぜひお力をお借りしたいと思います。',
      receivedAt: '2024年1月15日',
      status: 'pending',
      urgency: 'high',
      compensation: '月80万円〜',
      workStyle: '週2-3日',
      avatar: '🏢'
    },
    {
      id: 2,
      from: '田中 花子（CFO）',
      fromType: 'cfo',
      title: '管理会計強化のご相談',
      message: 'ERP導入プロジェクトでのご協力をお願いしたく、ご連絡いたします。',
      receivedAt: '2024年1月12日',
      status: 'accepted',
      urgency: 'medium',
      compensation: '月60万円〜',
      workStyle: '週1日〜',
      avatar: '👤'
    },
    {
      id: 3,
      from: '地方物流株式会社',
      fromType: 'company',
      title: '事業承継支援CFO募集',
      message: 'M&Aアドバイザリーでの豊富な経験をお持ちのあなたにぜひご相談したいです。',
      receivedAt: '2024年1月10日',
      status: 'declined',
      urgency: 'low',
      compensation: '月100万円〜',
      workStyle: 'プロジェクト単位',
      avatar: '🏢'
    }
  ]

// サンプル送信スカウトデータ
const SENT_SCOUTS = [
    {
      id: 1,
      to: '株式会社スタートアップA',
      toType: 'company',
      title: '財務体制構築のご提案',
      message: '貴社の成長段階において、財務体制の構築をサポートさせていただきたいと思います。',
      sentAt: '2024年1月14日',
      status: 'pending',
      avatar: '🏢'
    },
    {
      id: 2,
      to: '製造業XYZ株式会社',
      toType: 'company',
      title: '管理会計システム導入支援',
      message: '原価計算の精度向上について、私の経験をお役立てできればと思います。',
      sentAt: '2024年1月11日',
      status: 'accepted',
      avatar: '🏢'
    }
  ]

export default function ScoutPage() {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* ページタイトル */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">スカウト</h2>
          <p className="text-gray-600 text-sm md:text-base">受信したスカウトと送信したスカウトを確認できます</p>
        </div>

        {/* タブ切り替え */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 md:space-x-8">
              <button
                onClick={() => setActiveTab('received')}
                className={`min-h-[44px] py-2 px-2 md:px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'received'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                受信したスカウト ({RECEIVED_SCOUTS.length})
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`min-h-[44px] py-2 px-2 md:px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sent'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                送信したスカウト ({SENT_SCOUTS.length})
              </button>
            </nav>
          </div>
        </div>

        {/* スカウトリスト */}
        <div className="space-y-4 md:space-y-6">
          {activeTab === 'received' ? (
            RECEIVED_SCOUTS.map((scout) => (
              <ScoutCard key={scout.id} scout={scout} type="received" />
            ))
          ) : (
            SENT_SCOUTS.map((scout) => (
              <ScoutCard key={scout.id} scout={scout} type="sent" />
            ))
          )}
        </div>

        {/* 空の状態 */}
        {((activeTab === 'received' && RECEIVED_SCOUTS.length === 0) || 
          (activeTab === 'sent' && SENT_SCOUTS.length === 0)) && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 mb-2">
              {activeTab === 'received' ? '受信したスカウトはありません' : '送信したスカウトはありません'}
            </p>
            <p className="text-sm text-gray-400">
              {activeTab === 'received' ? 'プロフィールを充実させてスカウトを受信しましょう' : 'ホーム画面から気になる企業にスカウトを送ってみましょう'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}