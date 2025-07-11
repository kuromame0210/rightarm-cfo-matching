'use client'

import { memo } from 'react'
import Loading from '@/components/Loading'

interface Chat {
  id: string
  name: string
  lastMessage: string
  timestamp: string
  unreadCount: number
  status: string
  avatar: string
}

interface ChatListProps {
  chatList: Chat[]
  selectedChat: string
  onSelectChat: (id: string) => void
  loading?: boolean
}

const ChatList = memo(({ chatList, selectedChat, onSelectChat, loading = false }: ChatListProps) => {
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

  const getItemClassName = (chat: Chat) => {
    const baseClasses = 'p-3 md:p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50'
    const selectedClasses = 'bg-blue-100 border-l-4 border-l-blue-500 shadow-sm'
    const isSelected = selectedChat === chat.id
    
    return `${baseClasses} ${isSelected ? selectedClasses : ''}`
  }

  return (
    <div className="w-full md:w-1/3 md:border-r border-gray-200 flex-shrink-0 flex flex-col">
      <div className="hidden md:block p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">メッセージ</h2>
        </div>
      </div>
      <div className="overflow-y-auto flex-1 md:h-full">
        {loading ? (
          <div className="p-4">
            <Loading size="sm" text="会話を読み込み中..." />
          </div>
        ) : chatList.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p className="mb-4">まだメッセージがありません</p>
            <p className="text-xs">プロフィールページからメッセージを開始できます</p>
          </div>
        ) : (
          chatList.map((chat) => (
          <div
            key={chat.id}
            onClick={() => {
              console.log('ChatList: 選択された会話:', chat)
              onSelectChat(chat.id)
            }}
            className={getItemClassName(chat)}
          >
            <div className="flex items-start space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm md:text-lg">{chat.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-xs md:text-sm font-medium text-gray-900 truncate">
                    {chat.name}
                  </p>
                  <div className="flex items-center space-x-1 md:space-x-2">
                    {chat.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full min-w-[20px] min-h-[20px] w-5 h-5 flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">{chat.timestamp}</span>
                  </div>
                </div>
                <div className="mb-1 md:mb-2">
                  <span className={`inline-block px-1 md:px-2 py-1 rounded-full text-xs ${getStatusColor(chat.status)}`}>
                    {chat.status}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-gray-600 truncate">{chat.lastMessage}</p>
              </div>
            </div>
          </div>
        )))}
      </div>
    </div>
  )
})

ChatList.displayName = 'ChatList'

export default ChatList