'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, User, Building2, Clock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Conversation {
  id: string;
  company_id: string;
  cfo_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  other_user: {
    company_name?: string;
    first_name?: string;
    last_name?: string;
    photo_url?: string;
  };
  latest_message?: {
    message_text: string;
    created_at: string;
    sender_id: string;
  };
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'company' | 'cfo'>('company'); // TODO: 認証から取得
  const router = useRouter();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      // TODO: 実際のAPIコール
      // const response = await fetch('/api/messages/conversations', {
      //   headers: {
      //     'Authorization': `Bearer ${idToken}`
      //   }
      // });
      
      // 開発用モックデータ
      const mockConversations: Conversation[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          company_id: 'sample_company_1',
          cfo_id: 'sample_cfo_1',
          status: 'active',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T14:30:00Z',
          other_user: {
            company_name: 'テクノロジー株式会社',
            photo_url: null
          },
          latest_message: {
            message_text: 'ご提案いただいた資金調達プランについて詳しくお聞かせください。',
            created_at: '2024-01-15T14:30:00Z',
            sender_id: 'sample_company_1'
          }
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          company_id: 'sample_company_2',
          cfo_id: 'sample_cfo_1',
          status: 'active',
          created_at: '2024-01-14T09:00:00Z',
          updated_at: '2024-01-14T16:45:00Z',
          other_user: {
            company_name: 'イノベーション合同会社',
            photo_url: null
          },
          latest_message: {
            message_text: '来週の面談の件、調整可能でしょうか？',
            created_at: '2024-01-14T16:45:00Z',
            sender_id: 'sample_company_2'
          }
        }
      ];

      setConversations(mockConversations);
    } catch (error) {
      console.error('会話一覧の取得に失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('ja-JP', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
    }
  };

  const getDisplayName = (conversation: Conversation) => {
    if (conversation.other_user.company_name) {
      return conversation.other_user.company_name;
    }
    return `${conversation.other_user.first_name || ''} ${conversation.other_user.last_name || ''}`.trim();
  };

  const handleConversationClick = (conversationId: string) => {
    router.push(`/messages/${conversationId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-2">
            <MessageCircle className="h-8 w-8 text-black" />
            <h1 className="text-3xl font-bold text-black">メッセージ</h1>
          </div>
          <p className="text-gray-600">
            {userType === 'company' ? 'CFOとの会話一覧' : '企業との会話一覧'}
          </p>
        </motion.div>

        {/* 会話一覧 */}
        <div className="space-y-4">
          {conversations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center"
            >
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                まだメッセージがありません
              </h3>
              <p className="text-gray-600 mb-6">
                {userType === 'company' 
                  ? 'CFOを検索してメッセージを送ってみましょう' 
                  : '企業からのメッセージをお待ちしています'
                }
              </p>
              <button
                onClick={() => router.push(userType === 'company' ? '/search/cfo' : '/search/company')}
                className="btn-primary"
              >
                {userType === 'company' ? 'CFOを探す' : '企業を探す'}
              </button>
            </motion.div>
          ) : (
            conversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleConversationClick(conversation.id)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-start space-x-4">
                  {/* アバター */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {conversation.other_user.photo_url ? (
                        <img
                          src={conversation.other_user.photo_url}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <>
                          {conversation.other_user.company_name ? (
                            <Building2 className="h-6 w-6 text-gray-500" />
                          ) : (
                            <User className="h-6 w-6 text-gray-500" />
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* メッセージ内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold text-black truncate">
                        {getDisplayName(conversation)}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>
                          {conversation.latest_message 
                            ? formatDate(conversation.latest_message.created_at)
                            : formatDate(conversation.created_at)
                          }
                        </span>
                      </div>
                    </div>
                    
                    {conversation.latest_message && (
                      <p className="text-gray-600 truncate">
                        {conversation.latest_message.message_text}
                      </p>
                    )}
                  </div>

                  {/* 矢印アイコン */}
                  <div className="flex-shrink-0">
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-black transition-colors" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}