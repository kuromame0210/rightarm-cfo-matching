'use client'

import { memo, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface Message {
  msg_id?: number
  id?: number | string
  sender_id?: string
  receiver_id?: string
  senderId?: string
  receiverId?: string
  msg_type?: 'chat' | 'scout'
  body?: string
  content?: string
  sent_at?: string
  sentAt?: string
  attachments?: Array<{
    file_id: number
    file_url: string
    file_name: string
    file_size?: number
  }>
}

interface MessageAreaProps {
  messages: Message[]
  messageInput: string
  onMessageInputChange: (value: string) => void
  onSendMessage: (attachmentFiles?: File[]) => void
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
  const { data: session } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isUploadingFiles, setIsUploadingFiles] = useState(false)


  const showToastMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 3000)
  }

  // ファイル選択処理
  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      // ファイルサイズとタイプのバリデーション
      const validFiles = files.filter(file => {
        const maxSize = 20 * 1024 * 1024 // 20MB
        if (file.size > maxSize) {
          showToastMessage(`${file.name} は20MBを超えています`)
          return false
        }
        return true
      })
      
      setSelectedFiles(prev => [...prev, ...validFiles])
    }
    // inputをリセット
    if (e.target) {
      e.target.value = ''
    }
  }

  // ファイルを削除
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // メッセージ送信（ファイル添付対応）
  const handleSendMessage = () => {
    if (!messageInput.trim() && selectedFiles.length === 0) {
      return
    }
    
    onSendMessage(selectedFiles)
    setSelectedFiles([]) // ファイル選択をクリア
  }

  // ファイルサイズをフォーマット
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // ファイルアイコンを取得
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'pdf': return '📄'
      case 'doc':
      case 'docx': return '📝'
      case 'xls':
      case 'xlsx': return '📊'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp': return '🖼️'
      default: return '📎'
    }
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
        {Array.isArray(messages) ? messages.map((message, index) => {
          const isCurrentUser = (message.sender_id || message.senderId) === currentUserId
          
          // 送信者名の表示: 自分のメッセージなら表示しない、相手なら会話相手の名前
          const showSenderName = !isCurrentUser && selectedChat?.name
          
          return (
            <div
              key={message.msg_id || message.id || `message-${index}-${message.sent_at}`}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}
            >
              {/* アバター（左側：相手、右側：自分） */}
              {!isCurrentUser && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2 flex-shrink-0 overflow-hidden">
                  {selectedChat?.avatar && (selectedChat.avatar.startsWith('http') || selectedChat.avatar.startsWith('/')) ? (
                    <img 
                      src={selectedChat.avatar} 
                      alt="プロフィール画像"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm">{selectedChat?.avatar || '👤'}</span>
                  )}
                </div>
              )}
              
              <div className={`max-w-xs md:max-w-sm lg:max-w-md ${isCurrentUser ? 'ml-auto' : ''}`}>
                {/* 送信者名（相手のメッセージのみ） */}
                {showSenderName && (
                  <p className="text-xs text-gray-500 mb-1 ml-1">{selectedChat.name}</p>
                )}
                
                <div
                  className={`px-3 md:px-4 py-2 rounded-lg ${
                    isCurrentUser
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-200 text-gray-900 rounded-bl-sm'
                  }`}
                >
                  {/* メッセージテキスト */}
                  {(message.content || message.body) && (
                    <p className="text-xs md:text-sm">{message.content || message.body || ''}</p>
                  )}
                  
                  {/* 添付ファイル表示 */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className={`${(message.content || message.body) ? 'mt-2' : ''} space-y-1`}>
                      {message.attachments.map((attachment, attachIndex) => (
                        <div 
                          key={attachment.file_id || attachIndex}
                          className={`flex items-center space-x-2 p-2 rounded border ${
                            isCurrentUser 
                              ? 'bg-blue-500 border-blue-400' 
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <span className="text-sm">{getFileIcon(attachment.file_name)}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${
                              isCurrentUser ? 'text-blue-100' : 'text-gray-900'
                            }`}>
                              {attachment.file_name}
                            </p>
                            {attachment.file_size && (
                              <p className={`text-xs ${
                                isCurrentUser ? 'text-blue-200' : 'text-gray-500'
                              }`}>
                                {formatFileSize(attachment.file_size)}
                              </p>
                            )}
                          </div>
                          <a
                            href={attachment.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              isCurrentUser 
                                ? 'bg-blue-400 text-white hover:bg-blue-300' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            開く
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className={`text-xs mt-1 ${
                    isCurrentUser ? 'text-blue-100' : 'text-gray-500'
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
              
              {/* 自分のアバター（右側） */}
              {isCurrentUser && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 flex-shrink-0 overflow-hidden">
                  {session?.user?.image && (session.user.image.startsWith('http') || session.user.image.startsWith('/')) ? (
                    <img 
                      src={session.user.image} 
                      alt="自分のプロフィール画像"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm">👤</span>
                  )}
                </div>
              )}
            </div>
          )
        }) : (
          <div className="text-center text-gray-500 py-8">
            <p>メッセージを読み込み中...</p>
          </div>
        )}
      </div>

      {/* メッセージ入力フォーム */}
      <div className="p-3 md:p-4 border-t border-gray-200">
        {/* 選択されたファイルのプレビュー */}
        {selectedFiles.length > 0 && (
          <div className="mb-3 space-y-2">
            <p className="text-xs text-gray-600">添付ファイル:</p>
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                <span className="text-sm">{getFileIcon(file.name)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* ファイル入力（非表示） */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <div className="flex space-x-2">
          <button 
            onClick={handleFileSelect}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-600 hover:text-gray-900 flex-shrink-0 rounded-lg hover:bg-gray-100 transition-colors"
            title="ファイルを添付"
          >
            <span className="text-lg">📎</span>
          </button>
          <input
            type="text"
            value={messageInput}
            onChange={(e) => onMessageInputChange(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm md:text-base"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
          />
          <button 
            onClick={handleSendMessage}
            disabled={!messageInput.trim() && selectedFiles.length === 0}
            className="min-h-[44px] px-3 md:px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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