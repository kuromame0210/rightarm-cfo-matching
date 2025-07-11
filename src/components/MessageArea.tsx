'use client'

import { memo, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  id: number
  senderId: string
  content: string
  timestamp: string
  isFile: boolean
  fileName?: string
}

interface MessageAreaProps {
  messages: Message[]
  messageInput: string
  onMessageInputChange: (value: string) => void
  onSendMessage: () => void
  selectedChat?: {
    name: string
    status: string
    avatar: string
    otherUserId?: string
    otherUserType?: 'cfo' | 'company'
    otherProfileId?: string
  }
}

const MessageArea = memo(({ messages, messageInput, onMessageInputChange, onSendMessage, selectedChat }: MessageAreaProps) => {
  const router = useRouter()
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // デバッグ用：選択された会話の情報をログ出力
  console.log('MessageArea selectedChat:', selectedChat)

  const showToastMessage = (message: string) => {
    console.log('トースト表示:', message)
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
      console.log('トースト非表示')
    }, 3000)
  }

  const handleMeetingSetup = () => {
    console.log('面談設定ボタンがクリックされました')
    showToastMessage('面談設定機能は開発中です')
  }

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
  // v5.1仕様書準拠：4段階ステータス日本語ラベル
  const statusSteps = [
    { id: 'inquiry', label: '気軽の相談', order: 1 },
    { id: 'shortlist', label: '応募・スカウト', order: 2 },
    { id: 'negotiation', label: '条件交渉', order: 3 },
    { id: 'meeting', label: '面談', order: 4 }
  ]

  // 現在のステータスを判定（デモ用：面談調整 = meeting）
  const getCurrentStep = (status: string) => {
    switch (status) {
      case '気軽な相談':
      case '気軽の相談': return 'inquiry'
      case '応募・スカウト': return 'shortlist'
      case '条件交渉': return 'negotiation'
      case '面談調整':
      case '面談': return 'meeting'
      default: return 'inquiry'
    }
  }

  const currentStep = getCurrentStep(selectedChat?.status || '面談')
  const currentStepOrder = statusSteps.find(step => step.id === currentStep)?.order || 1

  const getStepColor = (stepOrder: number, currentOrder: number) => {
    if (stepOrder <= currentOrder) {
      return 'bg-blue-600 text-white border-blue-600'
    }
    return 'bg-gray-200 text-gray-600 border-gray-200'
  }

  const getLineColor = (stepOrder: number, currentOrder: number) => {
    return stepOrder < currentOrder ? 'bg-blue-600' : 'bg-gray-200'
  }

  return (
    <div className="w-full md:w-2/3 flex flex-col flex-1">
      {/* チャットヘッダー */}
      <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col space-y-4">
          {/* 相手情報とボタン */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm md:text-lg">{selectedChat?.avatar || '👤'}</span>
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
                onClick={handleMeetingSetup}
                className="min-h-[44px] px-2 md:px-3 py-1 bg-green-600 text-white rounded text-xs md:text-sm hover:bg-green-700 flex items-center transition-colors"
              >
                面談設定
              </button>
              <button 
                onClick={handleViewProfile}
                className="min-h-[44px] px-2 md:px-3 py-1 bg-gray-600 text-white rounded text-xs md:text-sm hover:bg-gray-700 flex items-center transition-colors"
              >
                プロフィール
              </button>
            </div>
          </div>

          {/* v5.1仕様書準拠：StatusStepper (4段階) */}
          <div className="w-full mt-4">
            <div className="flex items-start justify-between relative pb-6">
              {statusSteps.map((step, index) => (
                <div key={step.id} className="flex items-center justify-center flex-1 relative">
                  {/* ステップ円 */}
                  <div className="relative z-10">
                    <div 
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium transition-colors ${
                        getStepColor(step.order, currentStepOrder)
                      }`}
                    >
                      {step.order}
                    </div>
                  </div>
                  
                  {/* 接続線（最後以外） */}
                  {index < statusSteps.length - 1 && (
                    <div className="absolute top-4 left-1/2 w-full h-0.5 z-0">
                      <div className={`h-full transition-colors ${
                        getLineColor(step.order, currentStepOrder)
                      }`}></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* ステップラベル */}
            <div className="flex justify-between -mt-2">
              {statusSteps.map((step) => (
                <div key={`label-${step.id}`} className="flex-1 text-center px-1">
                  <span className={`text-xs font-medium leading-tight block ${
                    step.order <= currentStepOrder ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* メッセージ履歴 */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-sm lg:max-w-md px-3 md:px-4 py-2 rounded-lg ${
                message.senderId === 'me'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              {message.isFile ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm">📎</span>
                  <span className="text-xs md:text-sm">{message.fileName}</span>
                </div>
              ) : (
                <p className="text-xs md:text-sm">{message.content}</p>
              )}
              <p className={`text-xs mt-1 ${
                message.senderId === 'me' ? 'text-gray-300' : 'text-gray-500'
              }`}>
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
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