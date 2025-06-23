'use client'

import { useState } from 'react'
import AppHeader from '@/components/AppHeader'
import ChatList from '@/components/ChatList'
import MessageArea from '@/components/MessageArea'

// v5.1仕様書準拠：4段階ステータス日本語ラベル
const CHAT_LIST = [
  {
    id: 1,
    name: '山田 太郎（CFO）',
    lastMessage: 'ありがとうございます。来週の面談楽しみにしております。',
    timestamp: '2時間前',
    unreadCount: 2,
    status: '面談',
    avatar: '👤'
  },
  {
    id: 2,
    name: '株式会社テックスタート',
    lastMessage: '資金調達の件でご相談があります。',
    timestamp: '1日前',
    unreadCount: 0,
    status: '条件交渉',
    avatar: '🏢'
  },
  {
    id: 3,
    name: '田中 花子（CFO）',
    lastMessage: '管理会計システムの導入についてお話しましょう。',
    timestamp: '3日前',
    unreadCount: 1,
    status: '応募・スカウト',
    avatar: '👤'
  },
  {
    id: 4,
    name: '佐藤 次郎（CFO）',
    lastMessage: 'M&Aについて気軽にご相談いただければと思います。',
    timestamp: '5日前',
    unreadCount: 0,
    status: '気軽の相談',
    avatar: '👤'
  }
]

const MESSAGES = [
  {
    id: 1,
    senderId: 'other',
    content: 'はじめまして。IPO準備についてお手伝いできればと思い、スカウトさせていただきました。',
    timestamp: '10:30',
    isFile: false
  },
  {
    id: 2,
    senderId: 'me',
    content: 'ご連絡ありがとうございます。ぜひ詳しくお話を聞かせていただければと思います。',
    timestamp: '10:45',
    isFile: false
  },
  {
    id: 3,
    senderId: 'other',
    content: '私は過去10社のIPO支援実績があります。こちらに実績資料を添付いたします。',
    timestamp: '11:00',
    isFile: true,
    fileName: 'IPO実績資料.pdf'
  },
  {
    id: 4,
    senderId: 'me',
    content: '資料拝見いたします。来週お時間いただいて、オンライン面談は可能でしょうか？',
    timestamp: '14:20',
    isFile: false
  },
  {
    id: 5,
    senderId: 'other',
    content: 'ありがとうございます。来週の面談楽しみにしております。',
    timestamp: '14:25',
    isFile: false
  }
]

export default function MessagesPage() {
  const [selectedChatId, setSelectedChatId] = useState(1)
  const [messageInput, setMessageInput] = useState('')
  
  const selectedChat = CHAT_LIST.find(chat => chat.id === selectedChatId) || CHAT_LIST[0]
  const [showChatList, setShowChatList] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader isLoggedIn={true} />

      <div className="max-w-7xl mx-auto px-2 md:px-4 lg:px-8 py-2 md:py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)] flex flex-col md:flex-row">
          
          {/* モバイル: チャットリスト表示切り替え */}
          <div className="md:hidden border-b border-gray-200 p-3 md:p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">メッセージ</h2>
              <button 
                onClick={() => setShowChatList(!showChatList)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                {showChatList ? 'チャットを表示' : 'リストを表示'}
              </button>
            </div>
          </div>

          {/* モバイル: 条件付き表示 */}
          <div className="md:hidden flex flex-col flex-1">
            {showChatList ? (
              <div className="flex-1 flex flex-col">
                <ChatList 
                  chatList={CHAT_LIST} 
                  selectedChat={selectedChatId} 
                  onSelectChat={(id) => {
                    setSelectedChatId(id)
                    setShowChatList(false)
                  }} 
                />
              </div>
            ) : (
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
                  messages={MESSAGES} 
                  messageInput={messageInput} 
                  onMessageInputChange={setMessageInput}
                  selectedChat={selectedChat}
                />
              </div>
            )}
          </div>

          {/* デスクトップ: 従来の並列表示 */}
          <div className="hidden md:flex md:flex-1">
            <ChatList 
              chatList={CHAT_LIST} 
              selectedChat={selectedChatId} 
              onSelectChat={setSelectedChatId} 
            />
            <MessageArea 
              messages={MESSAGES} 
              messageInput={messageInput} 
              onMessageInputChange={setMessageInput}
              selectedChat={selectedChat}
            />
          </div>
        </div>
      </div>
    </div>
  )
}