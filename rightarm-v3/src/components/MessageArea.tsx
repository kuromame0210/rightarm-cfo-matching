'use client'

import { memo } from 'react'

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
}

const MessageArea = memo(({ messages, messageInput, onMessageInputChange }: MessageAreaProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case '気軽な相談': return 'bg-blue-100 text-blue-800'
      case '応募・スカウト': return 'bg-yellow-100 text-yellow-800'
      case '条件交渉': return 'bg-orange-100 text-orange-800'
      case '面談調整': return 'bg-green-100 text-green-800'
      case '契約検討': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="w-full md:w-2/3 flex flex-col flex-1">
      {/* チャットヘッダー */}
      <div className="p-3 md:p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm md:text-lg">👤</span>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm md:text-base">山田 太郎</h3>
              <span className={`inline-block px-1 md:px-2 py-1 rounded-full text-xs ${getStatusColor('面談調整')}`}>
                面談調整
              </span>
            </div>
          </div>
          <div className="flex space-x-1 md:space-x-2">
            <button className="min-h-[44px] px-2 md:px-3 py-1 bg-green-600 text-white rounded text-xs md:text-sm hover:bg-green-700 flex items-center">
              面談設定
            </button>
            <button className="min-h-[44px] px-2 md:px-3 py-1 bg-gray-600 text-white rounded text-xs md:text-sm hover:bg-gray-700 flex items-center">
              プロフィール
            </button>
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
          <button className="min-h-[44px] px-3 md:px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm md:text-base">
            送信
          </button>
        </div>
      </div>
    </div>
  )
})

MessageArea.displayName = 'MessageArea'

export default MessageArea