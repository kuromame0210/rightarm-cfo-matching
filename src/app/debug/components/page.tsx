'use client'

import { useState, useEffect } from 'react'
import AppHeader from '@/components/AppHeader'
// Remove unused import - apiCall was part of legacy auth system

export const dynamic = 'force-dynamic'
import UserDropdown from '@/components/UserDropdown'
import ScoutCard from '@/components/ScoutCard'
import ChatList from '@/components/ChatList'
import MessageArea from '@/components/MessageArea'
import LoginStatus from '@/components/LoginStatus'
import StatusCard from '@/components/StatusCard'

interface ComponentDemo {
  name: string
  description: string
  category: string
  component: React.ReactNode
}

export default function ComponentsDebugPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sampleScout, setSampleScout] = useState<any>(null)
  const [sampleCompany, setSampleCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // 実際のデータベースからサンプルデータを取得
  useEffect(() => {
    const loadSampleData = async () => {
      try {
        // 実際のCompanyデータを取得（1件目をサンプルとして使用）
        const response = await fetch('/api/companies?limit=1')
        const companyResponse = await response.json()
        
        if (companyResponse.success && companyResponse.data.length > 0) {
          const company = companyResponse.data[0]
          setSampleCompany(company)
          
          // 実際のデータベースデータを使用してScoutオブジェクトを作成
          setSampleScout({
            id: 1,
            from: company.companyName || '株式会社サンプル',
            title: 'CFO募集のご相談',
            message: `${company.companyName}にて、財務戦略をリードしていただけるCFOを募集しております。`,
            receivedAt: new Date().toLocaleDateString('ja-JP'),
            status: 'pending',
            urgency: 'high',
            compensation: company.compensationOffer || '月80万円〜',
            workStyle: company.workStyle || '週2-3日',
            avatar: '🏢'
          })
        }
      } catch (error) {
        console.error('サンプルデータの取得エラー:', error)
        // フォールバック: 従来のダミーデータ
        setSampleScout({
          id: 1,
          from: '株式会社テストカンパニー',
          title: 'CFO募集のご相談',
          message: 'この度、弊社のCFOとしてご協力いただけないでしょうか。',
          receivedAt: '2024年1月15日',
          status: 'pending',
          urgency: 'high',
          compensation: '月80万円〜',
          workStyle: '週2-3日',
          avatar: '🏢'
        })
      } finally {
        setLoading(false)
      }
    }
    
    loadSampleData()
  }, [])

  // 実際のデータベースから取得したサンプルデータを使用
  const sampleChatList = [
    {
      id: '1',
      name: sampleCompany?.companyName || '山田 太郎',
      lastMessage: 'ありがとうございます。',
      timestamp: '2時間前',
      unreadCount: 2,
      status: '面談調整',
      avatar: sampleCompany ? '🏢' : '👤'
    },
    {
      id: '2',
      name: sampleCompany?.companyName || '株式会社ABC',
      lastMessage: '資料をお送りします。',
      timestamp: '1日前',
      unreadCount: 0,
      status: '条件交渉',
      avatar: '🏢'
    }
  ]

  const sampleMessages = [
    {
      id: 1,
      senderId: 'other',
      content: `${sampleCompany?.companyName || '企業'}からの初回メッセージです。よろしくお願いします。`,
      timestamp: '10:30',
      isFile: false
    },
    {
      id: 2,
      senderId: 'me',
      content: 'こちらこそ、よろしくお願いします。',
      timestamp: '10:45',
      isFile: false
    }
  ]

  const componentDemos: ComponentDemo[] = [
    {
      name: 'AppHeader',
      description: 'アプリケーションのヘッダーコンポーネント',
      category: 'layout',
      component: (
        <div className="border rounded-lg overflow-hidden">
          <AppHeader userName="テストユーザー" />
        </div>
      )
    },
    {
      name: 'LoginStatus',
      description: 'ログイン状態表示コンポーネント（各種サイズ・バリアント）',
      category: 'status',
      component: (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">サイズバリエーション</h4>
            <div className="space-y-2">
              <LoginStatus size="small" variant="pill" showUsername={true} showUserType={true} />
              <LoginStatus size="medium" variant="pill" showUsername={true} showUserType={true} />
              <LoginStatus size="large" variant="pill" showUsername={true} showUserType={true} />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">スタイルバリエーション</h4>
            <div className="space-y-2">
              <LoginStatus variant="badge" showUsername={true} showUserType={true} />
              <LoginStatus variant="pill" showUsername={true} showUserType={true} />
              <LoginStatus variant="minimal" showUsername={true} showUserType={true} />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">表示オプション</h4>
            <div className="space-y-2">
              <LoginStatus showUsername={false} showUserType={true} />
              <LoginStatus showUsername={true} showUserType={false} />
              <LoginStatus showUsername={true} showUserType={true} showDebugInfo={true} />
            </div>
          </div>
        </div>
      )
    },
    {
      name: 'StatusCard',
      description: 'システム状態を表示するカードコンポーネント',
      category: 'status',
      component: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatusCard title="ログイン状態" />
          <StatusCard title="システム状態" showConnectionStatus={true} />
        </div>
      )
    },
    {
      name: 'UserDropdown',
      description: 'ユーザーメニューのドロップダウン',
      category: 'ui',
      component: (
        <div className="p-4 border rounded-lg bg-gray-50">
          <UserDropdown 
            userName="テストユーザー"
            userEmail="test@example.com"
            showUserMenu={true}
            onToggleUserMenu={() => {}}
            onCloseUserMenu={() => {}}
          />
        </div>
      )
    },
    {
      name: 'ScoutCard',
      description: 'スカウト情報を表示するカード',
      category: 'card',
      component: (
        <div className="max-w-2xl">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">サンプルデータを読み込み中...</div>
            </div>
          ) : (
            <ScoutCard scout={sampleScout} type="received" />
          )}
        </div>
      )
    },
    {
      name: 'ChatList',
      description: 'チャット一覧コンポーネント',
      category: 'messaging',
      component: (
        <div className="h-64 border rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">サンプルデータを読み込み中...</div>
            </div>
          ) : (
            <ChatList 
              chatList={sampleChatList}
              selectedChat={'1'}
              onSelectChat={() => {}}
            />
          )}
        </div>
      )
    },
    {
      name: 'MessageArea',
      description: 'メッセージ表示エリア',
      category: 'messaging',
      component: (
        <div className="h-96 border rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">サンプルデータを読み込み中...</div>
            </div>
          ) : (
            <MessageArea 
              messages={sampleMessages}
              messageInput=""
              onMessageInputChange={() => {}}
              onSendMessage={() => {}}
            />
          )}
        </div>
      )
    }
  ]

  const categories = ['all', 'layout', 'ui', 'card', 'messaging', 'form', 'status']
  const filteredComponents = componentDemos.filter(demo => 
    selectedCategory === 'all' || demo.category === selectedCategory
  )

  // ステータス情報
  const statusInfo = [
    {
      name: 'Total Components',
      value: componentDemos.length,
      color: 'text-blue-600'
    },
    {
      name: 'Layout Components',
      value: componentDemos.filter(c => c.category === 'layout').length,
      color: 'text-green-600'
    },
    {
      name: 'UI Components',
      value: componentDemos.filter(c => c.category === 'ui').length,
      color: 'text-purple-600'
    },
    {
      name: 'Card Components',
      value: componentDemos.filter(c => c.category === 'card').length,
      color: 'text-orange-600'
    },
    {
      name: 'Status Components',
      value: componentDemos.filter(c => c.category === 'status').length,
      color: 'text-indigo-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">🧩 コンポーネント</h1>
            <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
              デバッグ専用
            </span>
          </div>
          <p className="text-gray-600">
            アプリケーションで使用されているUIコンポーネントの一覧とプレビュー
          </p>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {statusInfo.map((info) => (
            <div key={info.name} className="bg-white p-6 rounded-lg shadow-sm border">
              <div className={`text-2xl font-bold ${info.color}`}>{info.value}</div>
              <div className="text-sm text-gray-600">{info.name}</div>
            </div>
          ))}
        </div>

        {/* カテゴリーフィルター */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">カテゴリー</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm rounded-md ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'すべて' :
                 category === 'layout' ? 'レイアウト' :
                 category === 'ui' ? 'UI' :
                 category === 'card' ? 'カード' :
                 category === 'messaging' ? 'メッセージ' :
                 category === 'form' ? 'フォーム' :
                 category === 'status' ? 'ステータス' : category}
              </button>
            ))}
          </div>
        </div>

        {/* コンポーネント一覧 */}
        <div className="space-y-8">
          {filteredComponents.map((demo) => (
            <div key={demo.name} className="bg-white rounded-lg shadow-sm border">
              {/* コンポーネント情報 */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{demo.name}</h3>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {demo.category}
                  </span>
                </div>
                <p className="text-gray-600">{demo.description}</p>
              </div>

              {/* コンポーネントプレビュー */}
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">プレビュー</h4>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-300">
                  {demo.component}
                </div>
              </div>

              {/* 使用例 */}
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">使用例</h4>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono">
                  <div>import {demo.name} from &apos;@/components/{demo.name}&apos;</div>
                  <div className="mt-2">
                    &lt;{demo.name} 
                    {demo.name === 'AppHeader' && ' userName="ユーザー名" /&gt;'}
                    {demo.name === 'UserDropdown' && ' userName="ユーザー名" onToggleUserMenu={() =&gt; {}} /&gt;'}
                    {demo.name === 'ScoutCard' && ' scout={scoutData} type="received" /'}
                    {demo.name === 'ChatList' && ' chatList={chatData} selectedChat={1} /'}
                    {demo.name === 'MessageArea' && ' messages={messageData} /'}
                    &gt;
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* コンポーネント設計ガイドライン */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">設計ガイドライン</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">📏 サイズ・スペーシング</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 一貫したパディング: 4, 6, 8, 12, 16, 24px</li>
                <li>• レスポンシブデザイン: モバイルファーストアプローチ</li>
                <li>• アイコンサイズ: 16px, 20px, 24px</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🎨 カラーパレット</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• プライマリ: gray-900, blue-600</li>
                <li>• セカンダリ: gray-600, gray-500</li>
                <li>• ステータス: green, yellow, red</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">⚡ パフォーマンス</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• React.memo を使用した最適化</li>
                <li>• useCallback でイベントハンドラー最適化</li>
                <li>• 適切なpropsの型定義</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">♿ アクセシビリティ</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• セマンティックなHTML要素</li>
                <li>• キーボードナビゲーション対応</li>
                <li>• 適切なコントラスト比</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}