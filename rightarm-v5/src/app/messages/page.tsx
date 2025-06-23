'use client'

import { useState } from 'react'
import { Layout } from '@/components/layout/layout'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { StatusStepper } from '@/components/messaging/status-stepper'
import { mockConversations, mockMessages, mockUsers, mockCfoProfiles, mockCompanyProfiles } from '@/lib/mock-data'
import { ConversationStage } from '@/types'
import { 
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline'

// Mock current user
const CURRENT_USER_ID = 'user-company-1'

export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')

  const userConversations = mockConversations.filter(conv => 
    conv.participant1Id === CURRENT_USER_ID || conv.participant2Id === CURRENT_USER_ID
  )

  const selectedConversation = selectedConversationId 
    ? mockConversations.find(conv => conv.id === selectedConversationId)
    : null

  const selectedMessages = selectedConversationId
    ? mockMessages.filter(msg => msg.conversationId === selectedConversationId)
    : []

  const getOtherParticipant = (conversationId: string) => {
    const conversation = mockConversations.find(conv => conv.id === conversationId)
    if (!conversation) return null

    const otherUserId = conversation.participant1Id === CURRENT_USER_ID 
      ? conversation.participant2Id 
      : conversation.participant1Id

    const user = mockUsers.find(u => u.id === otherUserId)
    if (!user) return null

    if (user.userType === 'cfo') {
      const profile = mockCfoProfiles.find(p => p.userId === user.id)
      return { ...user, profile }
    } else {
      const profile = mockCompanyProfiles.find(p => p.userId === user.id)
      return { ...user, profile }
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversationId) return
    
    // In a real app, this would send the message via API
    console.log('Sending message:', newMessage)
    setNewMessage('')
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes}分前`
    } else if (diffHours < 24) {
      return `${diffHours}時間前`
    } else {
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays}日前`
    }
  }

  return (
    <Layout isLoggedIn userType="company">
      <div className="h-screen flex bg-gray-50">
        {/* Sidebar - Conversation List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-lg font-semibold text-gray-900 mb-3">メッセージ</h1>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="会話を検索..."
                className="pl-10 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {userConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">まだメッセージがありません</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {userConversations.map((conversation) => {
                  const otherParticipant = getOtherParticipant(conversation.id)
                  const lastMessage = mockMessages
                    .filter(msg => msg.conversationId === conversation.id)
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

                  if (!otherParticipant) return null

                  const isSelected = selectedConversationId === conversation.id
                  const hasUnread = lastMessage && !lastMessage.readAt && lastMessage.senderId !== CURRENT_USER_ID

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                        isSelected ? 'bg-orange-50 border-r-2 border-orange-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-gray-600">
                            {otherParticipant.userType === 'cfo' 
                              ? `${otherParticipant.profile?.firstName?.[0] || ''}${otherParticipant.profile?.lastName?.[0] || ''}`
                              : otherParticipant.profile?.companyName?.[0] || ''
                            }
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                              {otherParticipant.userType === 'cfo' 
                                ? `${otherParticipant.profile?.firstName || ''} ${otherParticipant.profile?.lastName || ''}`
                                : otherParticipant.profile?.companyName || ''
                              }
                            </p>
                            {lastMessage && (
                              <span className="text-xs text-gray-500 ml-2">
                                {formatTime(lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          {lastMessage && (
                            <p className={`text-xs truncate mt-1 ${hasUnread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                              {lastMessage.content}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              conversation.stage === 'inquiry' ? 'bg-gray-100 text-gray-600' :
                              conversation.stage === 'shortlist' ? 'bg-blue-100 text-blue-600' :
                              conversation.stage === 'negotiation' ? 'bg-yellow-100 text-yellow-600' :
                              conversation.stage === 'meeting' ? 'bg-purple-100 text-purple-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {conversation.stage === 'inquiry' ? '相談中' :
                               conversation.stage === 'shortlist' ? 'スカウト中' :
                               conversation.stage === 'negotiation' ? '条件交渉中' :
                               conversation.stage === 'meeting' ? '面談予定' :
                               '契約成立'
                              }
                            </span>
                            {hasUnread && (
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {(() => {
                      const otherParticipant = getOtherParticipant(selectedConversation.id)
                      if (!otherParticipant) return null

                      return (
                        <>
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-600">
                              {otherParticipant.userType === 'cfo' 
                                ? `${otherParticipant.profile?.firstName?.[0] || ''}${otherParticipant.profile?.lastName?.[0] || ''}`
                                : otherParticipant.profile?.companyName?.[0] || ''
                              }
                            </span>
                          </div>
                          <div>
                            <h2 className="font-semibold text-gray-900">
                              {otherParticipant.userType === 'cfo' 
                                ? `${otherParticipant.profile?.firstName || ''} ${otherParticipant.profile?.lastName || ''}`
                                : otherParticipant.profile?.companyName || ''
                              }
                            </h2>
                            <p className="text-sm text-gray-500">
                              {otherParticipant.userType === 'cfo' ? 'CFO' : '企業'}
                            </p>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                  <Button variant="outline" size="sm">
                    詳細を見る
                  </Button>
                </div>

                {/* Status Stepper */}
                <div className="mt-4">
                  <StatusStepper currentStage={selectedConversation.stage} />
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedMessages.map((message) => {
                  const isFromCurrentUser = message.senderId === CURRENT_USER_ID

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isFromCurrentUser
                            ? 'bg-orange-500 text-white'
                            : 'bg-white border border-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isFromCurrentUser ? 'text-orange-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-end space-x-2">
                  <Button variant="ghost" size="icon" className="mb-2">
                    <PaperClipIcon className="h-5 w-5" />
                  </Button>
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="メッセージを入力..."
                      rows={1}
                      className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                  </div>
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="mb-2 bg-orange-500 hover:bg-orange-600"
                  >
                    <PaperAirplaneIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            // Empty State
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💬</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  会話を選択してください
                </h3>
                <p className="text-gray-500">
                  左側のリストから会話を選択してメッセージを開始しましょう
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}