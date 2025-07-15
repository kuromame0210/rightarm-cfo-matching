'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AppHeader from '@/components/AppHeader'
import ScoutCard from '@/components/ScoutCard'
import { useAuth } from '@/lib/hooks/useAuth'
import Loading from '@/components/Loading'

export const dynamic = 'force-dynamic'

export default function ScoutPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')
  const [receivedScouts, setReceivedScouts] = useState<any[]>([])
  const [sentScouts, setSentScouts] = useState<any[]>([])
  const [stats, setStats] = useState({ receivedCount: 0, sentCount: 0, pendingCount: 0, unreadCount: 0 })
  const [loading, setLoading] = useState(true)

  // スカウト一覧を取得
  const fetchScouts = async (type: 'received' | 'sent') => {
    try {
      console.log(`${type}スカウト一覧を取得中...`)
      const response = await fetch(`/api/scouts?type=${type}&limit=50`)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`${type}スカウト一覧:`, data)
        if (data.success) {
          if (type === 'received') {
            setReceivedScouts(data.data.received)
          } else {
            setSentScouts(data.data.sent)
          }
          // 統計情報をmetaから取得
          if (data.meta?.stats) {
            setStats(data.meta.stats)
          }
        }
      } else {
        console.error(`${type}スカウト一覧の取得に失敗しました`)
      }
    } catch (error) {
      console.error(`${type}スカウト一覧の取得エラー:`, error)
    }
  }

  const fetchAllScouts = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('ユーザーが認証されていません')
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // 受信スカウトを取得
      const receivedResponse = await fetch(`/api/scouts?type=received&limit=50`)
      
      let combinedStats = { receivedCount: 0, sentCount: 0, pendingCount: 0, unreadCount: 0 }

      if (receivedResponse.ok) {
        const receivedData = await receivedResponse.json()
        console.log('受信スカウト一覧:', receivedData)
        if (receivedData.success) {
          setReceivedScouts(receivedData.data.received || [])
          console.log('受信スカウト件数:', receivedData.data.received?.length || 0)
          // 受信統計情報を統合
          if (receivedData.meta?.stats) {
            combinedStats = {
              ...combinedStats,
              receivedCount: receivedData.meta.stats.receivedCount || 0,
              pendingCount: receivedData.meta.stats.pendingCount || 0,
              unreadCount: receivedData.meta.stats.unreadCount || 0
            }
          }
        }
      } else {
        console.error('受信スカウト取得失敗:', receivedResponse.status, await receivedResponse.text())
      }

      // 送信スカウトを取得
      const sentResponse = await fetch(`/api/scouts?type=sent&limit=50`)
      
      if (sentResponse.ok) {
        const sentData = await sentResponse.json()
        console.log('送信スカウト一覧:', sentData)
        if (sentData.success) {
          setSentScouts(sentData.data.sent || [])
          console.log('送信スカウト件数:', sentData.data.sent?.length || 0)
          // 送信統計情報を統合
          if (sentData.meta?.stats) {
            combinedStats = {
              ...combinedStats,
              sentCount: sentData.meta.stats.sentCount || 0
            }
          }
        }
      } else {
        console.error('送信スカウト取得失敗:', sentResponse.status, await sentResponse.text())
      }

      // 統合された統計情報を設定
      console.log('📊 Combined stats:', combinedStats)
      setStats(combinedStats)
    } catch (error) {
      console.error('スカウト一覧の取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated === false) {
      // 未認証の場合はログインページにリダイレクト
      router.push('/auth/login')
      return
    }
    
    if (isAuthenticated) {
      fetchAllScouts()
    }
  }, [isAuthenticated, router, fetchAllScouts])

  // スカウトステータス更新後のコールバック
  const handleStatusUpdate = (scoutId: number, newStatus: string) => {
    // 受信スカウトのステータスを更新
    setReceivedScouts(prevScouts => 
      prevScouts.map(scout => 
        scout.id === scoutId 
          ? { ...scout, status: newStatus }
          : scout
      )
    )
    
    // 統計情報を更新
    setStats(prevStats => ({
      ...prevStats,
      pendingCount: prevStats.pendingCount - 1
    }))
  }

  // 認証状態が不明の間はローディング画面を表示
  if (isAuthenticated === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading size="lg" text="認証状態を確認中..." />
      </div>
    )
  }

  // 未認証の場合は何も表示しない（リダイレクト処理中）
  if (isAuthenticated === false) {
    return null
  }

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
                受信したスカウト ({stats.receivedCount})
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`min-h-[44px] py-2 px-2 md:px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sent'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                送信したスカウト ({stats.sentCount})
              </button>
            </nav>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">スカウト一覧を読み込み中...</p>
          </div>
        ) : (
          <>
            {/* スカウトリスト */}
            <div className="space-y-4 md:space-y-6">
              {activeTab === 'received' ? (
                receivedScouts.map((scout) => (
                  <ScoutCard 
                    key={scout.id} 
                    scout={scout} 
                    type={scout.isReceived ? "received" : "sent"} 
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))
              ) : (
                sentScouts.map((scout) => (
                  <ScoutCard 
                    key={scout.id} 
                    scout={scout} 
                    type={scout.isSent ? "sent" : "received"} 
                  />
                ))
              )}
            </div>

            {/* 空の状態 */}
            {((activeTab === 'received' && receivedScouts.length === 0) || 
              (activeTab === 'sent' && sentScouts.length === 0)) && (
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
          </>
        )}
      </div>
    </div>
  )
}