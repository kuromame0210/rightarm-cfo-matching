'use client'

import { memo, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  msg_id?: number
  id?: number | string
  sender_id: string
  receiver_id: string
  msg_type?: 'chat' | 'scout'
  body: string
  content?: string
  sent_at: string
  sentAt?: string
}

interface MessageAreaProps {
  messages: Message[]
  messageInput: string
  onMessageInputChange: (value: string) => void
  onSendMessage: () => void
  currentUserId?: string
  selectedChat?: {
    name: string
    status: string
    avatar: string
    otherUserId?: string
    otherUserType?: 'cfo' | 'company'
    otherProfileId?: string
  }
}

const MessageArea = memo(({ messages, messageInput, onMessageInputChange, onSendMessage, currentUserId, selectedChat }: MessageAreaProps) => {
  const router = useRouter()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // デバッグ用：選択された会話の情報をログ出力
  console.log('MessageArea selectedChat:', selectedChat)
  console.log('MessageArea messages:', messages)
  console.log('MessageArea messages sample:', messages?.[0])

  const showToastMessage = (message: string) => {
    console.log('トースト表示:', message)
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
      console.log('トースト非表示')
    }, 3000)
  }

  // 一時的にコメントアウト - 面談設定機能
  // const handleMeetingSetup = () => {
  //   console.log('面談設定ボタンがクリックされました')
  //   showToastMessage('面談設定機能は開発中です')
  // }

  const handleViewProfile = () => {
    if (!selectedChat?.otherProfileId && !selectedChat?.otherUserId) {
      showToastMessage('プロフィール情報が取得できません')
      return
    }

    // プロフィールIDまたはユーザーIDを使用
    const profileId = selectedChat.otherProfileId || selectedChat.otherUserId

    // ユーザータイプが不明の場合は警告を表示
    if (!selectedChat.otherUserType || (selectedChat.otherUserType !== 'company' && selectedChat.otherUserType !== 'cfo')) {
      showToastMessage('プロフィール情報を特定できません。しばらく待ってから再試行してください。')
      return
    }

    // ユーザータイプに基づいて適切なプロフィールページに遷移
    // 注意: otherUserTypeは会話相手のタイプ（CFO or 企業）を示す
    if (selectedChat.otherUserType === 'cfo') {
      router.push(`/cfo/${profileId}`)
    } else if (selectedChat.otherUserType === 'company') {
      router.push(`/company/${profileId}`)
    } else {
      // フォールバック: 名前や表示情報からCFOかどうかを判定
      // CFOの特徴的な情報（@example.com、戦略CFO等）をチェック
      if (selectedChat.name.includes('CFO') || 
          selectedChat.name.includes('cfo') ||
          selectedChat.name.includes('@example.com') ||
          selectedChat.name.includes('戦略')) {
        router.push(`/cfo/${profileId}`)
      } else {
        router.push(`/company/${profileId}`)
      }
    }
  }
  // 一時的にコメントアウト - ステータス管理機能
  // const statusSteps = [
  //   { id: 'inquiry', label: '気軽の相談', order: 1 },
  //   { id: 'shortlist', label: '応募・スカウト', order: 2 },
  //   { id: 'negotiation', label: '条件交渉', order: 3 },
  //   { id: 'meeting', label: '面談', order: 4 }
  // ]

  // const getCurrentStep = (status: string) => {
  //   switch (status) {
  //     case '気軽な相談':
  //     case '気軽の相談': return 'inquiry'
  //     case '応募・スカウト': return 'shortlist'
  //     case '条件交渉': return 'negotiation'
  //     case '面談調整':
  //     case '面談': return 'meeting'
  //     default: return 'inquiry'
  //   }
  // }

  // const currentStep = getCurrentStep(selectedChat?.status || '面談')
  // const currentStepOrder = statusSteps.find(step => step.id === currentStep)?.order || 1

  // const getStepColor = (stepOrder: number, currentOrder: number) => {
  //   if (stepOrder <= currentOrder) {
  //     return 'bg-blue-600 text-white border-blue-600'
  //   }
  //   return 'bg-gray-200 text-gray-600 border-gray-200'
  // }

  // const getLineColor = (stepOrder: number, currentOrder: number) => {
  //   return stepOrder < currentOrder ? 'bg-blue-600' : 'bg-gray-200'
  // }

  return (
    <div className="w-full md:w-2/3 flex flex-col flex-1">
      {/* チャットヘッダー */}
      <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col space-y-4">
          {/* 相手情報とボタン */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {selectedChat?.avatar && selectedChat.avatar.startsWith('http') ? (
                  <img 
                    src={selectedChat.avatar} 
                    alt={`${selectedChat.name}のプロフィール画像`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm md:text-lg">{selectedChat?.avatar || '👤'}</span>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm md:text-base">{selectedChat?.name || 'ユーザー'}</h3>
                <span className="text-xs text-gray-500">
                  {selectedChat?.otherUserType === 'cfo' ? 'CFO' : 
                   selectedChat?.otherUserType === 'company' ? '企業' : ''}
                </span>
              </div>
            </div>
            <div className="flex space-x-1 md:space-x-2">
              <button 
                onClick={handleViewProfile}
                className="min-h-[44px] px-2 md:px-3 py-1 bg-gray-600 text-white rounded text-xs md:text-sm hover:bg-gray-700 flex items-center transition-colors"
              >
                プロフィール
              </button>
            </div>
          </div>

          {/* v5.1仕様書準拠：StatusStepper (4段階) - 一時的に非表示 */}
        </div>
      </div>

      {/* メッセージ履歴 */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
        {Array.isArray(messages) ? messages.map((message, index) => (
          <div
            key={message.msg_id || message.id || `message-${index}-${message.sent_at}`}
            className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-sm lg:max-w-md px-3 md:px-4 py-2 rounded-lg ${
                message.sender_id === currentUserId
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p className="text-xs md:text-sm">{message.body || message.content || ''}</p>
              <p className={`text-xs mt-1 ${
                message.sender_id === currentUserId ? 'text-gray-300' : 'text-gray-500'
              }`}>
                {(() => {
                  const timestamp = message.sent_at || message.sentAt
                  if (!timestamp) return '送信中...'
                  
                  const date = new Date(timestamp)
                  if (isNaN(date.getTime())) return '送信中...'
                  
                  // 今日の場合は時刻のみ、それ以外は日付も表示
                  const now = new Date()
                  const isToday = date.toDateString() === now.toDateString()
                  
                  if (isToday) {
                    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
                  } else {
                    return date.toLocaleString('ja-JP', { 
                      month: 'numeric', 
                      day: 'numeric',
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })
                  }
                })()}
              </p>
            </div>
          </div>
        )) : (
          <div className="text-center text-gray-500 py-8">
            <p>メッセージを読み込み中...</p>
          </div>
        )}
      </div>

      {/* メッセージ入力フォーム */}
      <div className="p-3 md:p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 hover:text-gray-900 flex-shrink-0 rounded-lg hover:bg-gray-100">
            <span className="text-lg">📎</span>
          </button>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => onMessageInputChange(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm md:text-base"
          />
          <button 
            onClick={onSendMessage}
            className="min-h-[44px] px-3 md:px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm md:text-base"
          >
            送信
          </button>
        </div>
      </div>

      {/* Toast通知 */}
      {showToast && (
        <div className="fixed bottom-20 md:bottom-4 right-4 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg z-[9999] transition-all duration-300 ease-in-out transform translate-y-0 opacity-100">
          <div className="flex items-center space-x-2">
            <span className="text-sm">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  )
})

MessageArea.displayName = 'MessageArea'

export default MessageArea