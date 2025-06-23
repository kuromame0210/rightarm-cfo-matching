'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

export default function DemoOverviewPage() {
  const [selectedUserType, setSelectedUserType] = useState<'company' | 'cfo'>('company')

  // v5.1仕様書準拠：実装済み機能一覧
  const implementedFeatures = {
    core: [
      {
        id: 'user_registration',
        title: '会員登録・プロフィール作成',
        description: '企業/CFO別の詳細登録フォーム、スキル・課題の大分類UI',
        path: '/auth/register',
        status: '完了',
        demo: '企業は年商選択・課題選択、CFOはスキル・資格・経験入力'
      },
      {
        id: 'profile_cards',
        title: 'ProfileCard情報表示',
        description: 'v5.1準拠の詳細情報表示、実績・認定・可能業務',
        path: '/home',
        status: '完了',
        demo: 'CFO：認定・実績・稼働状況、企業：課題・背景・条件'
      },
      {
        id: 'company_search',
        title: '企業検索ページ',
        description: '業界・ステージ・地域フィルター、課題タグでの絞り込み',
        path: '/discover/companies',
        status: '完了',
        demo: 'フィルター機能、カード形式表示、詳細情報表示'
      },
      {
        id: 'cfo_search',
        title: 'CFO検索ページ',
        description: 'スキル・経験・稼働形態フィルター、評価・可用性表示',
        path: '/discover/cfos',
        status: '完了',
        demo: 'スキルフィルター、レーティング表示、稼働状況確認'
      }
    ],
    matching: [
      {
        id: 'company_detail',
        title: '企業詳細ページ',
        description: 'タブ形式（概要・課題・条件・レビュー）、役割別CTA',
        path: '/company/1',
        status: '完了',
        demo: '企業情報の詳細表示、レビュー閲覧、スカウト送信'
      },
      {
        id: 'cfo_detail',
        title: 'CFO詳細ページ',
        description: 'プロフィール詳細、実績・スキル表示、評価確認',
        path: '/cfo/1',
        status: '完了',
        demo: 'CFO詳細情報、スキル・実績・評価の確認'
      },
      {
        id: 'reverse_scout',
        title: '逆スカウト機能',
        description: 'CFO→企業のアクティブ提案、企業検索・メッセージ送信',
        path: '/reverse-scout',
        status: '完了',
        demo: 'CFOが企業を検索してスカウト送信'
      },
      {
        id: 'messaging',
        title: 'メッセージ・面談設定',
        description: 'チャット機能、面談提案・設定、ステータス管理',
        path: '/messages',
        status: '完了',
        demo: 'メッセージ交換、面談設定、4段階ステータス'
      }
    ],
    contract: [
      {
        id: 'invoice_management',
        title: '請求書管理',
        description: '支払い情報表示、証憑アップロード、支払い報告機能',
        path: '/contracts/1/invoice',
        status: '完了',
        demo: '振込先表示、ファイルアップロード、支払いフロー'
      },
      {
        id: 'review_system',
        title: 'レビューシステム',
        description: '5段階評価、詳細項目別評価、双方向レビュー',
        path: '/contracts/1/review',
        status: '完了',
        demo: '総合・項目別評価、コメント投稿、公開設定'
      },
      {
        id: 'meeting_management',
        title: '面談予定管理',
        description: '面談スケジュール管理、リンク発行、参加者管理',
        path: '/meetings',
        status: '完了',
        demo: '面談一覧、スケジュール管理、参加リンク'
      }
    ],
    admin: [
      {
        id: 'admin_dashboard',
        title: '管理画面ダッシュボード',
        description: 'KPI表示、ユーザー統計、収益分析、アクティビティ監視',
        path: '/admin/dashboard',
        status: '完了',
        demo: '統計ダッシュボード、承認管理、システム監視'
      },
      {
        id: 'tag_management',
        title: 'タグ管理システム',
        description: 'スキル・業界・課題タグの追加・編集・無効化',
        path: '/admin/tags',
        status: '完了',
        demo: 'カテゴリ別タグ管理、使用数統計、有効/無効切替'
      },
      {
        id: 'demo_flows',
        title: 'システムフロー可視化',
        description: '面談設定・支払い処理の流れをステップ別に説明',
        path: '/demo/flows',
        status: '完了',
        demo: '面談リンク発行、振込・支払い確認フローの図解'
      }
    ]
  }

  // ユーザージャーニー（企業視点）
  const companyJourney = [
    {
      step: 1,
      title: '会員登録・プロフィール作成',
      description: '企業情報、年商、財務課題を登録',
      path: '/auth/register',
      icon: '📝'
    },
    {
      step: 2,
      title: 'CFO検索・発見',
      description: 'スキル・経験でCFOを検索、プロフィール閲覧',
      path: '/discover/cfos',
      icon: '🔍'
    },
    {
      step: 3,
      title: 'スカウト・メッセージ',
      description: 'CFOにスカウト送信、メッセージで詳細相談',
      path: '/messages',
      icon: '💬'
    },
    {
      step: 4,
      title: '面談設定・実施',
      description: '面談を提案・設定、オンライン/対面で面談',
      path: '/meetings',
      icon: '📅'
    },
    {
      step: 5,
      title: '契約・支払い',
      description: '条件合意後、請求書支払い、契約開始',
      path: '/contracts/1/invoice',
      icon: '💰'
    },
    {
      step: 6,
      title: 'CFOサービス提供',
      description: '財務課題解決、継続的なサポート受ける',
      path: '/messages',
      icon: '📊'
    },
    {
      step: 7,
      title: 'レビュー・評価',
      description: 'サービス終了後、CFOを評価・レビュー',
      path: '/contracts/1/review',
      icon: '⭐'
    }
  ]

  // ユーザージャーニー（CFO視点）
  const cfoJourney = [
    {
      step: 1,
      title: '会員登録・プロフィール作成',
      description: 'スキル・経験・実績・稼働希望を詳細登録',
      path: '/auth/register',
      icon: '👤'
    },
    {
      step: 2,
      title: '企業検索・逆スカウト',
      description: '興味ある企業を検索、積極的にアプローチ',
      path: '/reverse-scout',
      icon: '🎯'
    },
    {
      step: 3,
      title: 'スカウト受信・対応',
      description: '企業からのスカウト確認、興味あれば返信',
      path: '/scout',
      icon: '📨'
    },
    {
      step: 4,
      title: 'メッセージ・面談',
      description: '企業と詳細相談、面談で具体的な話し合い',
      path: '/messages',
      icon: '💼'
    },
    {
      step: 5,
      title: '契約条件確認',
      description: '報酬・期間・業務内容の最終確認',
      path: '/messages',
      icon: '📋'
    },
    {
      step: 6,
      title: 'CFOサービス提供',
      description: '企業の財務課題解決、価値提供',
      path: '/messages',
      icon: '⚡'
    },
    {
      step: 7,
      title: 'レビュー・評価',
      description: 'サービス終了後、企業を評価・レビュー',
      path: '/contracts/1/review',
      icon: '🏆'
    }
  ]

  const getCurrentJourney = () => {
    return selectedUserType === 'company' ? companyJourney : cfoJourney
  }

  const getTotalFeatures = () => {
    return Object.values(implementedFeatures).flat().length
  }

  const getCompletedFeatures = () => {
    return Object.values(implementedFeatures).flat().filter(feature => feature.status === '完了').length
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader isLoggedIn={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* ページヘッダー */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mr-4">
              🚀 RightArm v5.1 デモ
            </h1>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
              社長プレゼン用
            </div>
          </div>
          <p className="text-xl text-gray-600 mb-6">
            CFOマッチングプラットフォーム - 実装完了機能の包括デモンストレーション
          </p>
          
          {/* 実装完了率 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-md mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {Math.round((getCompletedFeatures() / getTotalFeatures()) * 100)}%
              </div>
              <p className="text-sm text-gray-600">
                機能実装完了率 ({getCompletedFeatures()}/{getTotalFeatures()}機能)
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(getCompletedFeatures() / getTotalFeatures()) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* ユーザージャーニー可視化 */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">👥 ユーザージャーニー</h2>
            <p className="text-gray-600 mb-6">
              実際のユーザーの利用フローを確認できます
            </p>
            
            {/* ユーザータイプ選択 */}
            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={() => setSelectedUserType('company')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  selectedUserType === 'company'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                🏢 企業視点
              </button>
              <button
                onClick={() => setSelectedUserType('cfo')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  selectedUserType === 'cfo'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                👨‍💼 CFO視点
            </button>
            </div>
          </div>

          {/* ジャーニーステップ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {getCurrentJourney().map((step, index) => (
              <div key={step.step} className="relative">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-3">{step.icon}</div>
                  <div className="text-sm font-semibold text-blue-600 mb-2">
                    Step {step.step}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2 text-sm">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-3">
                    {step.description}
                  </p>
                  <Link
                    href={step.path}
                    className="inline-block px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    体験する
                  </Link>
                </div>
                
                {/* 矢印 */}
                {index < getCurrentJourney().length - 1 && (
                  <div className="hidden xl:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-gray-400 text-xl">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 実装済み機能カテゴリ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Object.entries(implementedFeatures).map(([categoryKey, features]) => {
            const categoryNames = {
              core: '🏠 コア機能',
              matching: '🎯 マッチング',
              contract: '📋 契約・支払い',
              admin: '🛠️ 管理機能'
            }
            
            return (
              <div key={categoryKey} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {categoryNames[categoryKey as keyof typeof categoryNames]}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {features.length}機能 - すべて実装完了
                  </p>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {features.map((feature) => (
                    <div key={feature.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">
                              {feature.title}
                            </h4>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {feature.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {feature.description}
                          </p>
                          <p className="text-xs text-blue-600 mb-3">
                            💡 {feature.demo}
                          </p>
                        </div>
                        <Link
                          href={feature.path}
                          className="ml-4 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          確認
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* 特別デモページ */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🎬 特別デモページ</h2>
            <p className="text-gray-600">
              技術的な流れや詳細機能を説明するための専用ページ
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link 
              href="/demo/flows"
              className="p-6 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="font-semibold text-gray-900 mb-2">システムフロー図解</h3>
              <p className="text-sm text-gray-600">
                面談リンク発行と支払い処理の詳細フローを可視化
              </p>
            </Link>
            
            <Link 
              href="/debug/components"
              className="p-6 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
            >
              <div className="text-4xl mb-4">🧩</div>
              <h3 className="font-semibold text-gray-900 mb-2">コンポーネント一覧</h3>
              <p className="text-sm text-gray-600">
                UIコンポーネントの設計・実装状況を確認
              </p>
            </Link>
            
            <Link 
              href="/admin/dashboard"
              className="p-6 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
            >
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">管理画面デモ</h3>
              <p className="text-sm text-gray-600">
                運営管理・分析機能の実装状況を確認
              </p>
            </Link>
          </div>
        </div>

        {/* 技術仕様・設計思想 */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">⚙️ 技術仕様・設計思想</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="bg-white rounded-lg p-6">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold text-gray-900 mb-2">Next.js 14</h3>
              <p className="text-sm text-gray-600">
                App Router、Server Components、最新フレームワーク採用
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-semibold text-gray-900 mb-2">Tailwind CSS</h3>
              <p className="text-sm text-gray-600">
                レスポンシブデザイン、一貫したデザインシステム
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-semibold text-gray-900 mb-2">モバイルファースト</h3>
              <p className="text-sm text-gray-600">
                スマートフォン最適化、タッチ操作対応
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="font-semibold text-gray-900 mb-2">TypeScript</h3>
              <p className="text-sm text-gray-600">
                型安全性確保、開発効率向上、保守性向上
              </p>
            </div>
          </div>
        </div>

        {/* フッター行動促進 */}
        <div className="mt-12 text-center bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🎯 プレゼンテーション推奨順序
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">1. 全体像説明</h3>
              <p className="text-sm text-blue-700">
                この概要ページで機能完成度とユーザージャーニーを説明
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">2. 実際の操作</h3>
              <p className="text-sm text-green-700">
                会員登録→検索→メッセージ→面談→支払いの流れを実演
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">3. 技術詳細</h3>
              <p className="text-sm text-purple-700">
                フロー図解ページで面談リンク・支払い処理の仕組みを説明
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}