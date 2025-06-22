'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1)
  const [editingMessage, setEditingMessage] = useState<number | null>(null)
  const [editText, setEditText] = useState('')

  // サンプルメッセージデータ
  const conversations = [
    {
      id: 1,
      cfoName: '田中 太郎',
      lastMessage: 'ありがとうございます。来週の面談の件ですが、火曜日の14時からいかがでしょうか？',
      timestamp: '10分前',
      unread: true,
      avatar: '田'
    },
    {
      id: 2,
      cfoName: '佐藤 花子',
      lastMessage: '財務システムの件で詳細な資料をお送りいたします。ご確認ください。',
      timestamp: '2時間前',
      unread: false,
      avatar: '佐'
    },
    {
      id: 3,
      cfoName: '山田 次郎',
      lastMessage: 'お疲れ様です。管理会計の件でご質問がございます。',
      timestamp: '1日前',
      unread: true,
      avatar: '山'
    }
  ]

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'cfo',
      content: 'はじめまして、田中と申します。貴社の資金調達に関するご相談を拝見いたしました。',
      timestamp: '昨日 15:30',
      edited: false
    },
    {
      id: 2,
      sender: 'company',
      content: 'こんにちは。弊社では現在シリーズAの資金調達を検討しており、CFOの方にアドバイスをいただきたく思っております。',
      timestamp: '昨日 16:15',
      edited: false
    },
    {
      id: 3,
      sender: 'cfo',
      content: '承知いたしました。まずは現在の財務状況と調達目標額について教えていただけますでしょうか？簡単な面談を設定できればと思います。',
      timestamp: '昨日 16:45',
      edited: false
    },
    {
      id: 4,
      sender: 'company',
      content: '面談の件、ぜひお願いします。来週でしたらいつでも調整可能です。',
      timestamp: '今日 9:30',
      edited: false
    },
    {
      id: 5,
      sender: 'cfo',
      content: 'ありがとうございます。来週の面談の件ですが、火曜日の14時からいかがでしょうか？',
      timestamp: '10分前',
      edited: false
    }
  ])

  const [newMessage, setNewMessage] = useState('')

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        sender: 'company',
        content: newMessage,
        timestamp: '今',
        edited: false
      }
      setMessages([...messages, newMsg])
      setNewMessage('')
    }
  }

  const handleEditMessage = (messageId: number) => {
    const message = messages.find(m => m.id === messageId)
    if (message) {
      setEditingMessage(messageId)
      setEditText(message.content)
    }
  }

  const handleSaveEdit = (messageId: number) => {
    setMessages(messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: editText, edited: true }
        : msg
    ))
    setEditingMessage(null)
    setEditText('')
  }

  const handleDeleteMessage = (messageId: number) => {
    if (confirm('このメッセージを削除しますか？')) {
      setMessages(messages.filter(msg => msg.id !== messageId))
    }
  }

  const handleCancelEdit = () => {
    setEditingMessage(null)
    setEditText('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/home" className="md:hidden text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900 tracking-wide">RIGHTARM</h1>
            </div>
            
            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/home" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                CFOを探す
              </Link>
              <Link href="/messages" className="text-gray-900 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                メッセージ
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
              </button>
              
              <Link href="/profile" className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors">
                <span className="text-sm font-medium">企</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[calc(100vh-12rem)]">
          <div className="flex h-full">
            
            {/* 会話リスト */}
            <div className={`${selectedConversation ? 'hidden md:block' : 'block'} w-full md:w-1/3 border-r border-gray-200`}>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">メッセージ</h2>
              </div>
              
              <div className="overflow-y-auto h-full">
                {conversations.map(conversation => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selectedConversation === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold">{conversation.avatar}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-medium text-gray-900">{conversation.cfoName}</h3>
                          <span className="text-xs text-gray-500">{conversation.timestamp}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                        {conversation.unread && (
                          <div className="mt-2">
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* メッセージエリア */}
            <div className={`${selectedConversation ? 'block' : 'hidden md:block'} flex-1 flex flex-col`}>
              {selectedConversation ? (
                <>
                  {/* 会話ヘッダー */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => setSelectedConversation(null)}
                        className="md:hidden text-gray-600 hover:text-gray-900"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold">田</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">田中 太郎</h3>
                        <p className="text-xs text-gray-500">オンライン</p>
                      </div>
                    </div>
                  </div>

                  {/* メッセージ一覧 */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'company' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                          message.sender === 'company' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}>
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold">
                              {message.sender === 'company' ? '企' : '田'}
                            </span>
                          </div>
                          <div className="group relative">
                            {editingMessage === message.id ? (
                              // 編集モード
                              <div className="bg-white border border-gray-300 rounded-lg p-3">
                                <textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
                                  rows={2}
                                />
                                <div className="flex space-x-2 mt-2">
                                  <button
                                    onClick={() => handleSaveEdit(message.id)}
                                    className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                                  >
                                    保存
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                                  >
                                    キャンセル
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // 通常表示モード
                              <>
                                <div className={`px-4 py-2 rounded-lg ${
                                  message.sender === 'company'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }`}>
                                  <p className="text-sm">{message.content}</p>
                                  {message.edited && (
                                    <span className="text-xs opacity-70 italic">(編集済み)</span>
                                  )}
                                </div>
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-xs text-gray-500 px-1">{message.timestamp}</p>
                                  {message.sender === 'company' && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                      <button
                                        onClick={() => handleEditMessage(message.id)}
                                        className="text-xs text-gray-500 hover:text-gray-700 p-1"
                                        title="編集"
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() => handleDeleteMessage(message.id)}
                                        className="text-xs text-gray-500 hover:text-red-600 p-1"
                                        title="削除"
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* メッセージ入力エリア */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-end space-x-3">
                      <div className="flex-1">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="メッセージを入力..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={2}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSendMessage()
                            }
                          }}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          送信
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.991 8.991 0 01-4.683-1.317L3 21l2.317-5.317A8.991 8.991 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">会話を選択してください</h3>
                    <p className="text-gray-500">左側から会話を選択してメッセージを開始できます</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* モバイルフッターナビゲーション */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <Link href="/home" className="flex flex-col items-center py-2 text-gray-600">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs">探す</span>
          </Link>
          <Link href="/messages" className="flex flex-col items-center py-2 text-gray-900">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.991 8.991 0 01-4.683-1.317L3 21l2.317-5.317A8.991 8.991 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
            <span className="text-xs">メッセージ</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}