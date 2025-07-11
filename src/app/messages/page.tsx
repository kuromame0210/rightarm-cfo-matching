'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import AppHeader from '@/components/AppHeader'
import ChatList from '@/components/ChatList'
import MessageArea from '@/components/MessageArea'
import Loading, { InlineLoading } from '@/components/Loading'
import { useAuth } from '@/lib/hooks/useAuth'

export const dynamic = 'force-dynamic'

function MessagesContent() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const targetUserId = searchParams.get('user')
  const scoutId = searchParams.get('scoutId')
  
  const [chatList, setChatList] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [creatingConversation, setCreatingConversation] = useState(false)
  const [conversationInitialized, setConversationInitialized] = useState(false)
  const [showChatList, setShowChatList] = useState(true)
  const [scoutProcessed, setScoutProcessed] = useState(false)
  const [targetUserName, setTargetUserName] = useState<string | null>(null)
  
  const selectedChat = chatList.find(chat => chat.id === selectedChatId) || 
    (targetUserId ? {
      id: 0,
      name: targetUserName || '読み込み中...',
      otherUserId: targetUserId,
      otherUserType: undefined,
      otherProfileId: undefined,
      lastMessage: '',
      timestamp: '',
      unreadCount: 0,
      status: '新規',
      avatar: '👤'
    } : null)

  // 会話一覧を取得
  const fetchConversations = useCallback(async (preserveSelection = false) => {
    if (!isAuthenticated) {
      console.log('ユーザーが認証されていません')
      setLoading(false)
      return
    }

    try {
      console.log('会話一覧を取得中...')
      const response = await fetch('/api/conversations')
      
      console.log('会話一覧API レスポンス status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('会話一覧:', data)
        console.log('会話一覧の詳細データ:', JSON.stringify(data.data, null, 2))
        if (data.success) {
          setChatList(data.data || [])
          
          // preserveSelectionがtrueの場合は選択状態を保持
          if (preserveSelection) {
            return
          }
          
          // URLパラメータで指定されたユーザーとの会話を選択
          if (targetUserId && data.data && data.data.length > 0) {
            const targetConversation = data.data.find((conv: any) => 
              conv.otherUserId === targetUserId
            )
            console.log('ターゲット会話:', targetConversation)
            if (targetConversation) {
              setSelectedChatId(targetConversation.id.toString())
            }
          } else if (data.data && data.data.length > 0) {
            // 最初の会話を選択（preserveSelectionがfalseの場合のみ）
            console.log('最初の会話を選択:', data.data[0])
            setSelectedChatId(data.data[0].id.toString())
          }
        }
      } else {
        // エラーログは残すが、ユーザーにはエラーを表示しない（データが0件の場合は正常）
        console.error('会話一覧の取得に失敗しました')
        setChatList([])
      }
    } catch (error) {
      console.error('会話一覧の取得エラー:', error)
      setChatList([])
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, targetUserId]) // selectedChatIdを依存配列から除去

  // 特定の会話のメッセージを取得
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      console.log('メッセージを取得中:', conversationId)
      const response = await fetch(`/api/messages?conversationId=${conversationId}`)
      
      console.log('メッセージAPI レスポンス status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('メッセージ:', data)
        if (data.success) {
          setMessages(data.data)
        } else {
          console.error('メッセージAPI success=false:', data)
          setMessages([])
        }
      } else {
        console.error('メッセージの取得に失敗しました (status:', response.status, ')')
        const errorData = await response.json().catch(() => null)
        console.error('エラーレスポンス:', errorData)
        setMessages([])
      }
    } catch (error) {
      console.error('メッセージの取得エラー:', error)
      setMessages([])
    }
  }, [])

  // メッセージ送信
  const sendMessage = async () => {
    if (!messageInput.trim()) return

    // 既存の会話がある場合は通常のメッセージ送信
    if (selectedChatId) {
      try {
        console.log('メッセージ送信中:', messageInput)
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            conversationId: selectedChatId,
            content: messageInput.trim()
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          console.log('メッセージ送信成功:', data)
          if (data.success) {
            // メッセージリストに新しいメッセージを追加
            setMessages(prev => [...prev, data.data])
            setMessageInput('')
            
            // 会話一覧を更新
            fetchConversations(true)
          }
        } else {
          console.error('メッセージの送信に失敗しました')
        }
      } catch (error) {
        console.error('メッセージの送信エラー:', error)
      }
    } 
    // 新規会話の場合は会話を作成してからメッセージ送信
    else if (targetUserId) {
      await createConversation(targetUserId, messageInput.trim())
      setMessageInput('')
    }
  }

  // 新しい会話を作成
  const createConversation = useCallback(async (userId?: string, initialMessage?: string) => {
    const userIdToUse = userId || targetUserId
    if (!userIdToUse || creatingConversation) return

    // 既に同じユーザーとの会話作成中なら重複実行を防ぐ
    const existingConversation = chatList.find(chat => chat.otherUserId === userIdToUse)
    if (existingConversation) {
      setSelectedChatId(existingConversation.id)
      setShowChatList(false)
      return
    }

    setCreatingConversation(true)
    try {
      console.log('新しい会話を作成中:', userIdToUse)
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          otherUserId: userIdToUse,
          message: initialMessage || ''
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('会話作成成功:', data)
        if (data.success) {
          // 会話一覧を再取得して新しい会話を選択
          await fetchConversations(false)
          // 新しく作成された会話を自動選択
          const newConversationId = data.data.conversationId
          if (newConversationId) {
            setSelectedChatId(newConversationId)
            setShowChatList(false) // モバイルでチャット画面を表示
          }
        }
      } else if (response.status === 404) {
        // 指定されたユーザーが存在しない場合はエラーを表示せず、静かに処理
        console.log('指定されたユーザーが存在しません:', userIdToUse)
        if (userId) {
          alert('指定されたユーザーが存在しません')
        }
      } else {
        const errorData = await response.json()
        console.error('会話の作成に失敗しました:', errorData.error)
        // 実際のエラーの場合のみアラート表示
        if (response.status !== 404) {
          alert(`会話の作成に失敗しました: ${errorData.error}`)
        }
      }
    } catch (error) {
      console.error('会話の作成エラー:', error)
    } finally {
      setCreatingConversation(false)
    }
  }, [targetUserId, creatingConversation, chatList, fetchConversations])

  // スカウト内容を会話に追加する関数
  const addScoutMessageToConversation = useCallback(async (conversationId: string) => {
    if (!scoutId || scoutProcessed) return

    try {
      // スカウト詳細を取得
      const scoutResponse = await fetch(`/api/scouts/${scoutId}`)
      
      if (scoutResponse.ok) {
        const scoutData = await scoutResponse.json()
        if (scoutData.success) {
          const scout = scoutData.data
          const scoutMessageText = `【スカウト】${scout.title || 'スカウト'}\n\n${scout.message || ''}`
          
          // スカウトメッセージを会話に追加
          const messageResponse = await fetch('/api/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              conversationId,
              content: scoutMessageText
            })
          })
          
          if (messageResponse.ok) {
            setScoutProcessed(true)
            // メッセージを再取得して更新
            await fetchMessages(conversationId)
          }
        }
      }
    } catch (error) {
      console.error('スカウトメッセージ追加エラー:', error)
    }
  }, [scoutId, scoutProcessed, fetchMessages, targetUserId])

  // ターゲットユーザーの名前を取得
  const fetchTargetUserName = async (userId: string) => {
    try {
      // CFOプロフィールを確認
      const cfoResponse = await fetch(`/api/cfos/${userId}`)
      if (cfoResponse.ok) {
        const cfoData = await cfoResponse.json()
        if (cfoData.success) {
          setTargetUserName(cfoData.data.name)
          return
        }
      }

      // 企業プロフィールを確認
      const companyResponse = await fetch(`/api/companies/${userId}`)
      if (companyResponse.ok) {
        const companyData = await companyResponse.json()
        if (companyData.success) {
          setTargetUserName(companyData.data.company_name)
          return
        }
      }

      // どちらでもない場合はメールアドレスを取得
      setTargetUserName('ユーザー')
    } catch (error) {
      console.error('ユーザー名取得エラー:', error)
      setTargetUserName('ユーザー')
    }
  }

  useEffect(() => {
    if (isAuthenticated === false) {
      // 未認証の場合はログインページにリダイレクト
      router.push('/auth/login')
      return
    }
    
    if (isAuthenticated) {
      fetchConversations(false)
    }
  }, [isAuthenticated, router]) // fetchConversationsを依存配列から除去

  // URLパラメータのユーザーIDが変わったら初期化フラグをリセット
  useEffect(() => {
    setConversationInitialized(false)
    if (targetUserId) {
      setTargetUserName(null) // 名前をリセット
      fetchTargetUserName(targetUserId) // 新しい名前を取得
    }
  }, [targetUserId])

  useEffect(() => {
    if (selectedChatId) {
      console.log('selectedChatId変更:', selectedChatId)
      console.log('現在のselectedChat:', selectedChat)
      fetchMessages(selectedChatId)
      // スカウトIDがある場合は、スカウト内容を会話に追加
      if (scoutId && !scoutProcessed) {
        addScoutMessageToConversation(selectedChatId)
      }
      // メッセージを取得した後、会話一覧を再取得して未読カウントを更新
      setTimeout(() => {
        fetchConversations(true) // 選択状態を保持
      }, 500)
    }
  }, [selectedChatId, scoutId, scoutProcessed]) // 依存配列を最小限に

  useEffect(() => {
    // URLパラメータでユーザーIDが指定されている場合、会話を作成または選択
    if (targetUserId && !loading && !creatingConversation && !conversationInitialized) {
      const existingConversation = chatList.find(chat => chat.otherUserId === targetUserId)
      if (existingConversation) {
        // 既存の会話がある場合は即座に選択
        setSelectedChatId(existingConversation.id)
        setShowChatList(false) // モバイルでチャット画面を表示
        setConversationInitialized(true)
      } else if (chatList.length > 0 && !chatList.some(chat => chat.otherUserId === targetUserId)) {
        // 会話リストが読み込まれていて、対象ユーザーとの会話がない場合のみ新規作成
        createConversation(targetUserId, '')
        setConversationInitialized(true)
      }
    }
  }, [targetUserId, chatList, loading, creatingConversation, conversationInitialized, createConversation])

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
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader />

      <div className="max-w-7xl mx-auto px-2 md:px-4 lg:px-8 py-2 md:py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)] flex flex-col md:flex-row">
          
          {/* 会話作成中のローディングオーバーレイ */}
          {creatingConversation && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
              <Loading size="lg" text="会話を作成中..." />
            </div>
          )}
          
          {/* モバイル: チャットリスト表示切り替え */}
          <div className="md:hidden border-b border-gray-200 p-3 md:p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">メッセージ</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowChatList(!showChatList)}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  {showChatList ? 'チャットを表示' : 'リストを表示'}
                </button>
              </div>
            </div>
          </div>

          {/* モバイル: 条件付き表示 */}
          <div className="md:hidden flex flex-col flex-1">
            {showChatList ? (
              <div className="flex-1 flex flex-col">
                <ChatList 
                  chatList={chatList} 
                  selectedChat={selectedChatId || ''} 
                  onSelectChat={(id) => {
                    setSelectedChatId(id)
                    setShowChatList(false)
                  }}
                  loading={loading}
                />
              </div>
            ) : selectedChatId || targetUserId ? (
              <div className="flex-1 flex flex-col">
                <div className="border-b border-gray-200 p-3 bg-gray-50">
                  <button 
                    onClick={() => setShowChatList(true)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    ← チャット一覧に戻る
                  </button>
                </div>
                <MessageArea 
                  messages={messages} 
                  messageInput={messageInput} 
                  onMessageInputChange={setMessageInput}
                  onSendMessage={sendMessage}
                  selectedChat={selectedChat}
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500">
                <div className="space-y-4">
                  <div className="text-4xl">💬</div>
                  <h3 className="text-lg font-medium">メッセージを選択してください</h3>
                  <p className="text-sm">プロフィールページからメッセージを開始できます</p>
                </div>
              </div>
            )}
          </div>

          {/* デスクトップ: 従来の並列表示 */}
          <div className="hidden md:flex md:flex-1">
            <ChatList 
              chatList={chatList} 
              selectedChat={selectedChatId || ''} 
              onSelectChat={(id) => setSelectedChatId(id)}
              loading={loading}
            />
            {selectedChatId || targetUserId ? (
              <MessageArea 
                messages={messages} 
                messageInput={messageInput} 
                onMessageInputChange={setMessageInput}
                onSendMessage={sendMessage}
                selectedChat={selectedChat}
              />
            ) : (
              <div className="w-2/3 flex flex-col items-center justify-center text-center text-gray-500">
                <div className="space-y-4">
                  <div className="text-4xl">💬</div>
                  <h3 className="text-lg font-medium">メッセージを選択してください</h3>
                  <p className="text-sm">左側のリストから会話を選択してください</p>
                  <p className="text-sm">プロフィールページからメッセージを開始できます</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MessagesContent />
    </Suspense>
  )
}