'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, User, Building2, Calendar, Clock } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_text: string;
  message_type: 'text' | 'system' | 'meeting_request';
  metadata?: any;
  created_at: string;
  sender: {
    display_name: string;
    photo_url?: string;
    user_type: 'company' | 'cfo';
  };
}

interface ConversationInfo {
  id: string;
  other_user: {
    display_name: string;
    company_name?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
    user_type: 'company' | 'cfo';
  };
}

export default function ConversationPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationInfo, setConversationInfo] = useState<ConversationInfo | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('sample_cfo_1'); // TODO: 認証から取得
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();
  const conversationId = params.conversationId as string;

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      fetchConversationInfo();
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      // TODO: 実際のAPIコール
      // const response = await fetch(`/api/messages/${conversationId}`, {
      //   headers: {
      //     'Authorization': `Bearer ${idToken}`
      //   }
      // });
      
      // 開発用モックデータ
      const mockMessages: Message[] = [
        {
          id: 'msg_1',
          conversation_id: conversationId,
          sender_id: 'sample_company_1',
          message_text: 'はじめまして。弊社の資金調達についてご相談したいと思います。',
          message_type: 'text',
          created_at: '2024-01-15T10:00:00Z',
          sender: {
            display_name: 'テクノロジー株式会社',
            user_type: 'company'
          }
        },
        {
          id: 'msg_2',
          conversation_id: conversationId,
          sender_id: 'sample_cfo_1',
          message_text: 'こんにちは！喜んでお手伝いさせていただきます。どのような資金調達をお考えでしょうか？',
          message_type: 'text',
          created_at: '2024-01-15T10:05:00Z',
          sender: {
            display_name: '山田 太郎',
            user_type: 'cfo'
          }
        },
        {
          id: 'msg_3',
          conversation_id: conversationId,
          sender_id: 'sample_company_1',
          message_text: 'シリーズAの資金調達を検討しており、5億円程度の調達を予定しています。投資家との交渉や資料作成についてサポートいただけますでしょうか。',
          message_type: 'text',
          created_at: '2024-01-15T10:15:00Z',
          sender: {
            display_name: 'テクノロジー株式会社',
            user_type: 'company'
          }
        },
        {
          id: 'msg_4',
          conversation_id: conversationId,
          sender_id: 'sample_cfo_1',
          message_text: 'シリーズAで5億円の調達ですね。私は類似案件の経験があります。まずは事業計画書と財務データを確認させていただき、その後面談でより詳しくお話しできればと思います。来週でお時間はいかがでしょうか？',
          message_type: 'text',
          created_at: '2024-01-15T10:30:00Z',
          sender: {
            display_name: '山田 太郎',
            user_type: 'cfo'
          }
        }
      ];

      setMessages(mockMessages);
    } catch (error) {
      console.error('メッセージの取得に失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationInfo = async () => {
    // TODO: 実際のAPIコール
    // 開発用モックデータ
    setConversationInfo({
      id: conversationId,
      other_user: {
        display_name: 'テクノロジー株式会社',
        company_name: 'テクノロジー株式会社',
        user_type: 'company'
      }
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      // 楽観的更新
      const tempMessage: Message = {
        id: `temp_${Date.now()}`,
        conversation_id: conversationId,
        sender_id: currentUserId,
        message_text: messageText,
        message_type: 'text',
        created_at: new Date().toISOString(),
        sender: {
          display_name: '山田 太郎', // TODO: 認証ユーザー情報から取得
          user_type: 'cfo'
        }
      };

      setMessages(prev => [...prev, tempMessage]);

      // TODO: 実際のAPIコール
      // const response = await fetch(`/api/messages/${conversationId}`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${idToken}`
      //   },
      //   body: JSON.stringify({
      //     message_text: messageText
      //   })
      // });

      // if (!response.ok) {
      //   throw new Error('メッセージの送信に失敗しました');
      // }

      // const result = await response.json();
      // 実際のレスポンスでtempMessageを置き換える
      
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      // エラー時は楽観的更新を取り消し
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp_')));
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '今日';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨日';
    } else {
      return date.toLocaleDateString('ja-JP', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const shouldShowDateSeparator = (currentMessage: Message, previousMessage?: Message) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.created_at).toDateString();
    const previousDate = new Date(previousMessage.created_at).toDateString();
    
    return currentDate !== previousDate;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              {conversationInfo?.other_user.photo_url ? (
                <img
                  src={conversationInfo.other_user.photo_url}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <>
                  {conversationInfo?.other_user.user_type === 'company' ? (
                    <Building2 className="h-5 w-5 text-gray-500" />
                  ) : (
                    <User className="h-5 w-5 text-gray-500" />
                  )}
                </>
              )}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-black">
                {conversationInfo?.other_user.display_name}
              </h1>
              <p className="text-sm text-green-600">オンライン</p>
            </div>
          </div>

          <div className="ml-auto">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">面談を予約</span>
            </button>
          </div>
        </div>
      </div>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence>
            {messages.map((message, index) => (
              <div key={message.id}>
                {/* 日付セパレーター */}
                {shouldShowDateSeparator(message, messages[index - 1]) && (
                  <div className="flex justify-center mb-4">
                    <span className="bg-gray-200 text-gray-600 text-sm px-3 py-1 rounded-full">
                      {getMessageDate(message.created_at)}
                    </span>
                  </div>
                )}

                {/* メッセージ */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${message.sender_id === currentUserId ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-lg px-4 py-3 ${
                        message.sender_id === currentUserId
                          ? 'bg-black text-white'
                          : 'bg-white text-black border border-gray-200'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.message_text}</p>
                    </div>
                    <div className={`flex items-center mt-1 space-x-1 ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {formatMessageTime(message.created_at)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* メッセージ入力 */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="メッセージを入力..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className={`p-3 rounded-lg transition-colors ${
                newMessage.trim() && !sending
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {sending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}