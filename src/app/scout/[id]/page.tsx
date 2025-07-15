'use client'

import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import AppHeader from '@/components/AppHeader'
import { FormModal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'

export const dynamic = 'force-dynamic'

export default function ScoutDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const { data: session, status } = useSession()
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [showDeclineModal, setShowDeclineModal] = useState(false)
  const [replyMessage, setReplyMessage] = useState('')
  const [scoutData, setScoutData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const { showToast } = useToast()

  // スカウト詳細データを取得
  const fetchScoutDetail = useCallback(async () => {
    // 認証が完了してからAPIを呼び出す
    if (status !== 'authenticated' || !session?.user?.id) {
      return
    }

    try {
      console.log('🔍 フロントエンド Debug Info:')
      console.log('- Fetching scout ID:', resolvedParams.id, 'Type:', typeof resolvedParams.id)
      console.log('- Current user ID:', session.user.id)
      
      const response = await fetch(`/api/scouts/${resolvedParams.id}`)
      
      console.log('- GET Response status:', response.status)
      const data = await response.json()
      console.log('- GET Response data:', data)
      
      if (response.ok) {
        if (data.success) {
          setScoutData(data.data)
          console.log('- Scout data loaded:', data.data)
        }
      } else {
        console.error('- GET failed:', data)
        if (response.status === 403) {
          showToastMessage('このスカウトにアクセスする権限がありません', 'error')
          router.push('/scout')
        }
      }
    } catch (error) {
      console.error('スカウト詳細取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }, [resolvedParams.id, status, session?.user?.id, router])

  useEffect(() => {
    fetchScoutDetail()
  }, [resolvedParams.id, fetchScoutDetail])

  // 実際のスカウトデータまたはデフォルト値を使用
  const scoutDetail = scoutData || {
    id: resolvedParams.id,
    title: 'スカウト詳細を読み込み中...',
    message: '',
    status: 'pending'
  }

  // APIデータを表示用にフォーマット
  const formatScoutData = (data: any) => {
    if (!data) return scoutDetail

    return {
      id: data.id,
      title: data.title || 'スカウト',
      message: data.message || 'メッセージがありません',
      from: data.sender_type === 'company' ? data.company_name || 'スカウト送信者' : data.sender_name || 'スカウト送信者',
      fromType: data.sender_type || 'unknown',
      receivedAt: data.sent_at ? new Date(data.sent_at).toLocaleString('ja-JP') : '日時不明',
      status: data.status || 'pending',
      urgency: data.urgency || 'medium',
      compensation: data.compensation || '相談',
      workStyle: data.work_style || '相談',
      startDate: data.start_date || '相談',
      projectDuration: data.duration || '相談'
    }
  }

  const displayScout = formatScoutData(scoutData)

  // 現在のユーザーがスカウトの送信者・受信者のどちらなのかを判定
  const isCurrentUserReceiver = session?.user?.id && scoutData?.receiver_id === session.user.id
  const isCurrentUserSender = session?.user?.id && scoutData?.sender_id === session.user.id

  // デバッグ用ログ
  console.log('🔍 User role check:', {
    currentUserId: session?.user?.id,
    scoutSenderId: scoutData?.sender_id,
    scoutReceiverId: scoutData?.receiver_id,
    isCurrentUserReceiver,
    isCurrentUserSender,
    scoutStatus: displayScout.status
  })

  const showToastMessage = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    showToast(message, type)
  }, [showToast])

  // APIエラーメッセージを取得するヘルパー関数
  const getErrorMessage = (data: any, defaultMessage: string): string => {
    if (typeof data.error === 'string') {
      return data.error
    } else if (data.error?.message) {
      return data.error.message
    } else if (data.message) {
      return data.message
    } else {
      return defaultMessage
    }
  }

  const handleAccept = async () => {
    // 重複処理防止
    if (isProcessing) return
    
    setIsProcessing(true)
    setShowAcceptModal(false)
    
    // タイムアウト設定
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒タイムアウト
    
    // 楽観的更新用のオリジナルデータを保存
    const originalData = scoutData ? { ...scoutData } : null
    
    try {
      // 承諾メッセージを作成
      const acceptMessage = replyMessage.trim() || 'スカウトを承諾いたします。よろしくお願いします。'
      
      // 楽観的更新 - UIを先に更新（正しいディープコピーを作成）
      setScoutData((prev: any) => prev ? { ...prev, status: 'accepted' } : null)
      
      // 新しい統一APIでスカウトを承諾処理
      const response = await fetch(`/api/scouts/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'accepted',
          response_message: acceptMessage
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      const data = await response.json()
      console.log('承諪API レスポンス:', data) // デバッグ用
      
      if (data.success) {
        // 最新のスカウトデータを再取得して確実に同期
        await fetchScoutDetail()
        
        // 成功メッセージを表示
        showToastMessage('スカウトを承諾しました！ メッセージページでやりとりを続けてください。', 'success')
        
        // メッセージページに移動
        setTimeout(() => {
          const senderId = scoutData?.sender_id
          if (senderId) {
            router.push(`/messages?user=${senderId}`)
          } else {
            router.push('/messages')
          }
        }, 2000)
      } else {
        // 楽観的更新をロールバック
        setScoutData(originalData)
        throw new Error(getErrorMessage(data, 'スカウトの承諾に失敗しました'))
      }
    } catch (error) {
      clearTimeout(timeoutId)
      
      // タイムアウトエラーの場合は元のデータに戻す
      if (error instanceof Error && error.name === 'AbortError') {
        setScoutData(originalData)
        showToastMessage('処理がタイムアウトしました。再度お試しください。', 'error')
      } else {
        // その他のエラーも元のデータに戻す
        setScoutData(originalData)
        console.error('スカウト承諾エラー:', error)
        showToastMessage(
          error instanceof Error ? error.message : 'エラーが発生しました。再度お試しください。',
          'error'
        )
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDecline = async () => {
    // 重複処理防止
    if (isProcessing) return
    
    setIsProcessing(true)
    setShowDeclineModal(false)
    
    // タイムアウト設定
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒タイムアウト
    
    // 楽観的更新用のオリジナルデータを保存
    const originalData = scoutData ? { ...scoutData } : null
    
    try {
      // 辞退メッセージを作成
      const declineMessage = replyMessage.trim() || 'スカウトを辞退いたします。'
      
      // 楽観的更新 - UIを先に更新（正しいディープコピーを作成）
      setScoutData((prev: any) => prev ? { ...prev, status: 'declined' } : null)
      
      // 新しい統一APIでスカウトを辞退処理
      const response = await fetch(`/api/scouts/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'declined',
          response_message: declineMessage
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      const data = await response.json()
      console.log('辞退API レスポンス:', data) // デバッグ用
      
      if (data.success) {
        // 最新のスカウトデータを再取得して確実に同期
        await fetchScoutDetail()
        
        // 成功メッセージを表示
        showToastMessage('スカウトを辞退しました。', 'success')
        
        // スカウト一覧に戻る
        setTimeout(() => {
          router.push('/scout')
        }, 2000)
      } else {
        // 楽観的更新をロールバック
        setScoutData(originalData)
        throw new Error(getErrorMessage(data, 'スカウトの辞退に失敗しました'))
      }
    } catch (error) {
      clearTimeout(timeoutId)
      
      // タイムアウトエラーの場合は元のデータに戻す
      if (error instanceof Error && error.name === 'AbortError') {
        setScoutData(originalData)
        showToastMessage('処理がタイムアウトしました。再度お試しください。', 'error')
      } else {
        // その他のエラーも元のデータに戻す
        setScoutData(originalData)
        console.error('スカウト辞退エラー:', error)
        showToastMessage(
          error instanceof Error ? error.message : 'エラーが発生しました。再度お試しください。',
          'error'
        )
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSendMessage = () => {
    // スカウト送信者と受信者を判定
    const senderId = scoutData?.sender_id
    const receiverId = scoutData?.receiver_id
    const currentUserId = session?.user?.id
    
    // 自分が送信者の場合は受信者とメッセージ、自分が受信者の場合は送信者とメッセージ
    const targetUserId = isCurrentUserSender ? receiverId : senderId
    
    if (targetUserId && targetUserId !== currentUserId) {
      router.push(`/messages?user=${targetUserId}`)
    } else {
      console.warn('Invalid message target or trying to message self')
    }
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

  // 認証チェック
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
        <AppHeader isLoggedIn={status === 'authenticated'} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 mb-6 md:mb-0">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {status === 'loading' ? '認証確認中...' : 'スカウト詳細を読み込み中...'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 未認証の場合はログインページにリダイレクト
  if (status === 'unauthenticated') {
    router.push('/auth/login')
    return null
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
                  <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-2 pr-2">{displayScout.title}</h1>
                  <p className="text-gray-600 font-medium text-sm md:text-base">{displayScout.from}</p>
                  <p className="text-xs md:text-sm text-gray-500">{displayScout.receivedAt}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 flex-wrap">
                <span className={`inline-block px-2 py-1 text-white text-xs rounded-full ${getUrgencyColor(displayScout.urgency)}`}>
                  {getUrgencyText(displayScout.urgency)}
                </span>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  displayScout.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  displayScout.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  displayScout.status === 'declined' ? 'bg-red-100 text-red-800' :
                  displayScout.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {displayScout.status === 'pending' ? '返答待ち' :
                   displayScout.status === 'accepted' ? '承諾済み' :
                   displayScout.status === 'declined' ? '辞退済み' :
                   displayScout.status === 'expired' ? '期限切れ' : '不明'}
                </span>
              </div>
            </div>

            {/* 条件概要 */}
            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">報酬</div>
                  <div className="text-xs md:text-sm font-medium text-gray-900">{displayScout.compensation}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">稼働</div>
                  <div className="text-xs md:text-sm font-medium text-gray-900">{displayScout.workStyle}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">開始時期</div>
                  <div className="text-xs md:text-sm font-medium text-gray-900">{displayScout.startDate}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">期間</div>
                  <div className="text-xs md:text-sm font-medium text-gray-900">{displayScout.projectDuration}</div>
                </div>
              </div>
            </div>
          </div>

          {/* スカウトメッセージ */}
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">スカウトメッセージ</h2>
            <div className="bg-gray-50 rounded-lg p-3 md:p-4">
              <p className="text-sm md:text-base text-gray-700 whitespace-pre-line leading-relaxed">{displayScout.message}</p>
            </div>
          </div>

          {/* 送信者情報 */}
          {scoutData && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">送信者情報</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-lg">{scoutData.sender_type === 'company' ? '🏢' : '👤'}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{displayScout.from}</p>
                    <p className="text-sm text-gray-600">{scoutData.sender_type === 'company' ? '企業' : 'CFO'}</p>
                  </div>
                </div>
                {scoutData.sender?.email && (
                  <div className="text-sm text-gray-600">
                    <p>📧 {scoutData.sender.email}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* アクションボタン - 受信者のみ表示 */}
        {displayScout.status === 'pending' && isCurrentUserReceiver && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">このスカウトへの対応</h3>
            {/* 自分自身へのスカウトでない場合のみアクションボタンを表示 */}
            {scoutData?.sender_id !== session?.user?.id ? (
              <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                <button 
                  onClick={() => setShowAcceptModal(true)}
                  disabled={isProcessing}
                  className={`flex-1 min-h-[48px] md:min-h-[44px] px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-center text-sm md:text-base flex items-center justify-center ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isProcessing ? '処理中...' : '✓ 承諾する'}
                </button>
                <button 
                  onClick={() => setShowDeclineModal(true)}
                  disabled={isProcessing}
                  className={`flex-1 min-h-[48px] md:min-h-[44px] px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-center text-sm md:text-base flex items-center justify-center ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isProcessing ? '処理中...' : '✗ 辞退する'}
                </button>
                <button 
                  onClick={handleSendMessage}
                  disabled={isProcessing}
                  className={`flex-1 min-h-[48px] md:min-h-[44px] px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-center text-sm md:text-base flex items-center justify-center ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  💬 質問する
                </button>
              </div>
            ) : (
              /* 自分自身へのスカウトの場合の説明 */
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ℹ️ このスカウトは自分自身に送信されたものです。承諾や辞退は必要ありません。
                </p>
              </div>
            )}
          </div>
        )}

        {/* 送信者（送信済みスカウト）の表示 */}
        {displayScout.status === 'pending' && isCurrentUserSender && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">送信済みスカウト</h3>
            <p className="text-gray-600 mb-4">
              このスカウトは送信済みです。相手からの返答をお待ちください。
            </p>
            {/* 自分自身へのスカウトでない場合のみメッセージボタンを表示 */}
            {scoutData?.receiver_id !== session?.user?.id && (
              <button 
                onClick={handleSendMessage}
                className="w-full min-h-[48px] md:min-h-[44px] px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-center text-sm md:text-base flex items-center justify-center"
              >
                💬 メッセージを送る
              </button>
            )}
            {/* 自分自身へのスカウトの場合の説明 */}
            {scoutData?.receiver_id === session?.user?.id && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ℹ️ このスカウトは自分自身に送信されたものです。
                </p>
              </div>
            )}
          </div>
        )}

        {/* 承諾済みの場合のメッセージボタン */}
        {displayScout.status === 'accepted' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">承諾済みのスカウト</h3>
            <p className="text-gray-600 mb-4">
              {isCurrentUserReceiver 
                ? 'このスカウトは承諾されています。メッセージでやり取りを続けてください。'
                : 'このスカウトは承諾されました。メッセージでやり取りを続けてください。'
              }
            </p>
            {/* 自分自身へのスカウトでない場合のみメッセージボタンを表示 */}
            {((isCurrentUserSender && scoutData?.receiver_id !== session?.user?.id) || 
              (isCurrentUserReceiver && scoutData?.sender_id !== session?.user?.id)) && (
              <button 
                onClick={handleSendMessage}
                className="w-full min-h-[48px] md:min-h-[44px] px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-center text-sm md:text-base flex items-center justify-center"
              >
                💬 メッセージを送る
              </button>
            )}
            {/* 自分自身へのスカウトの場合の説明 */}
            {((isCurrentUserSender && scoutData?.receiver_id === session?.user?.id) || 
              (isCurrentUserReceiver && scoutData?.sender_id === session?.user?.id)) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ℹ️ このスカウトは自分自身に関連するものです。
                </p>
              </div>
            )}
          </div>
        )}

        {/* 辞退済みの場合の表示 */}
        {displayScout.status === 'declined' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">辞退済みのスカウト</h3>
            <p className="text-gray-600 mb-4">
              {isCurrentUserReceiver 
                ? 'このスカウトは辞退されています。'
                : 'このスカウトは辞退されました。'
              }
            </p>
            <div className="flex space-x-4">
              <Link 
                href="/scout"
                className="flex-1 min-h-[48px] md:min-h-[44px] px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium text-center text-sm md:text-base flex items-center justify-center"
              >
                ← スカウト一覧に戻る
              </Link>
            </div>
          </div>
        )}

        {/* 期限切れの場合の表示 */}
        {displayScout.status === 'expired' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">期限切れのスカウト</h3>
            <p className="text-gray-600 mb-4">このスカウトは期限が切れています。</p>
            <div className="flex space-x-4">
              <Link 
                href="/scout"
                className="flex-1 min-h-[48px] md:min-h-[44px] px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium text-center text-sm md:text-base flex items-center justify-center"
              >
                ← スカウト一覧に戻る
              </Link>
            </div>
          </div>
        )}

        {/* アクセス権限がない場合の表示 */}
        {scoutData && !isCurrentUserReceiver && !isCurrentUserSender && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">アクセス権限なし</h3>
            <p className="text-gray-600 mb-4">
              このスカウトにアクセスする権限がありません。
            </p>
            <div className="flex space-x-4">
              <Link 
                href="/scout"
                className="flex-1 min-h-[48px] md:min-h-[44px] px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium text-center text-sm md:text-base flex items-center justify-center"
              >
                ← スカウト一覧に戻る
              </Link>
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
              承諾すると、{displayScout.from}とのメッセージ交換が開始されます。
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
                disabled={isProcessing}
                className={`flex-1 min-h-[44px] px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center justify-center ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                キャンセル
              </button>
              <button 
                onClick={handleAccept}
                disabled={isProcessing}
                className={`flex-1 min-h-[44px] px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isProcessing ? '処理中...' : '承諾する'}
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
                disabled={isProcessing}
                className={`flex-1 min-h-[44px] px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 flex items-center justify-center ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                キャンセル
              </button>
              <button 
                onClick={handleDecline}
                disabled={isProcessing}
                className={`flex-1 min-h-[44px] px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center justify-center ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isProcessing ? '処理中...' : '辞退する'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}