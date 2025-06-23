'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Building2,
  ArrowLeft,
  Search,
  Filter,
  Mail,
  Phone,
  ExternalLink,
  Flag,
  MessageCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SupportStats {
  totalTickets: number;
  openTickets: number;
  pendingTickets: number;
  resolvedTickets: number;
  avgResponseTime: number;
  satisfaction: number;
}

interface SupportTicket {
  id: string;
  ticket_number: string;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'resolved' | 'closed';
  user_name: string;
  user_email: string;
  user_type: 'company' | 'cfo' | 'other';
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  message_count: number;
  last_response: string;
}

interface TicketMessage {
  id: string;
  sender: 'user' | 'admin';
  sender_name: string;
  message: string;
  timestamp: string;
  attachments?: string[];
}

export default function SupportManagement() {
  const [stats, setStats] = useState<SupportStats>({
    totalTickets: 0,
    openTickets: 0,
    pendingTickets: 0,
    resolvedTickets: 0,
    avgResponseTime: 0,
    satisfaction: 0
  });
  
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [newResponse, setNewResponse] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchSupportData();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  const fetchSupportData = async () => {
    try {
      // TODO: 実際のAPIコール
      // 開発用モックデータ
      const mockStats: SupportStats = {
        totalTickets: 234,
        openTickets: 23,
        pendingTickets: 8,
        resolvedTickets: 203,
        avgResponseTime: 4.2,
        satisfaction: 4.6
      };

      const mockTickets: SupportTicket[] = [
        {
          id: 'ticket_1',
          ticket_number: 'SUP-2024-001',
          subject: 'ログインができない問題',
          category: 'アカウント・登録について',
          priority: 'high',
          status: 'open',
          user_name: '山田太郎',
          user_email: 'yamada@example.com',
          user_type: 'cfo',
          created_at: '2024-01-15T09:00:00Z',
          updated_at: '2024-01-15T14:30:00Z',
          assigned_to: '管理者A',
          message_count: 3,
          last_response: '2024-01-15T14:30:00Z'
        },
        {
          id: 'ticket_2',
          ticket_number: 'SUP-2024-002',
          subject: 'メッセージ機能の不具合',
          category: '技術的な問題',
          priority: 'medium',
          status: 'pending',
          user_name: 'テクノロジー株式会社',
          user_email: 'contact@tech-corp.com',
          user_type: 'company',
          created_at: '2024-01-14T15:30:00Z',
          updated_at: '2024-01-15T10:15:00Z',
          assigned_to: '管理者B',
          message_count: 5,
          last_response: '2024-01-15T10:15:00Z'
        },
        {
          id: 'ticket_3',
          ticket_number: 'SUP-2024-003',
          subject: '料金体系についての質問',
          category: '料金・プランについて',
          priority: 'low',
          status: 'resolved',
          user_name: '佐藤花子',
          user_email: 'satoh@example.com',
          user_type: 'cfo',
          created_at: '2024-01-13T11:00:00Z',
          updated_at: '2024-01-14T16:45:00Z',
          assigned_to: '管理者A',
          message_count: 4,
          last_response: '2024-01-14T16:45:00Z'
        },
        {
          id: 'ticket_4',
          ticket_number: 'SUP-2024-004',
          subject: 'プロフィール画像のアップロードエラー',
          category: '技術的な問題',
          priority: 'urgent',
          status: 'open',
          user_name: 'イノベーション合同会社',
          user_email: 'info@innovation-llc.com',
          user_type: 'company',
          created_at: '2024-01-15T16:00:00Z',
          updated_at: '2024-01-15T16:00:00Z',
          message_count: 1,
          last_response: '2024-01-15T16:00:00Z'
        }
      ];

      setStats(mockStats);
      setTickets(mockTickets);
    } catch (error) {
      console.error('サポートデータ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketMessages = async (ticketId: string) => {
    // TODO: 実際のAPIコール
    const mockMessages: TicketMessage[] = [
      {
        id: 'msg_1',
        sender: 'user',
        sender_name: '山田太郎',
        message: 'ログイン画面でメールアドレスとパスワードを入力しても、「認証に失敗しました」というエラーが表示され、ログインできません。パスワードリセットも試しましたが改善されません。',
        timestamp: '2024-01-15T09:00:00Z'
      },
      {
        id: 'msg_2',
        sender: 'admin',
        sender_name: '管理者A',
        message: 'お問い合わせありがとうございます。ログインの件について確認させていただきます。まず、ブラウザのキャッシュをクリアして再度お試しいただけますでしょうか。',
        timestamp: '2024-01-15T10:30:00Z'
      },
      {
        id: 'msg_3',
        sender: 'user',
        sender_name: '山田太郎',
        message: 'キャッシュクリアを試しましたが、同じエラーが発生します。Chrome、Safari両方で試しましたが結果は同じでした。',
        timestamp: '2024-01-15T14:30:00Z'
      }
    ];
    setTicketMessages(mockMessages);
  };

  const filterTickets = () => {
    let filtered = tickets;

    // 検索フィルター
    if (searchQuery) {
      filtered = filtered.filter(ticket => 
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.user_email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // ステータスフィルター
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    // 優先度フィルター
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    // カテゴリフィルター
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.category === categoryFilter);
    }

    setFilteredTickets(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-700 bg-red-100 border-red-300';
      case 'high':
        return 'text-orange-700 bg-orange-100 border-orange-300';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'low':
        return 'text-green-700 bg-green-100 border-green-300';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-blue-700 bg-blue-100';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100';
      case 'resolved':
        return 'text-green-700 bg-green-100';
      case 'closed':
        return 'text-gray-700 bg-gray-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getPriorityLabel = (priority: string) => {
    const labels: { [key: string]: string } = {
      'urgent': '緊急',
      'high': '高',
      'medium': '中',
      'low': '低'
    };
    return labels[priority] || priority;
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'open': 'オープン',
      'pending': '保留',
      'resolved': '解決済み',
      'closed': 'クローズ'
    };
    return labels[status] || status;
  };

  const handleTicketClick = async (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    await fetchTicketMessages(ticket.id);
    setShowTicketModal(true);
  };

  const handleSendResponse = async () => {
    if (!newResponse.trim() || !selectedTicket) return;

    // TODO: 実際のAPIコール
    const newMessage: TicketMessage = {
      id: `msg_${Date.now()}`,
      sender: 'admin',
      sender_name: '管理者',
      message: newResponse.trim(),
      timestamp: new Date().toISOString()
    };

    setTicketMessages(prev => [...prev, newMessage]);
    setNewResponse('');
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
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            
            <div>
              <h1 className="text-2xl font-bold text-black">サポート管理</h1>
              <p className="text-gray-600 mt-1">お問い合わせ・チケット管理</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* サポート統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">総チケット数</p>
                <p className="text-2xl font-bold text-black">{stats.totalTickets}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">オープン</p>
                <p className="text-2xl font-bold text-blue-600">{stats.openTickets}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">保留中</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingTickets}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">解決済み</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolvedTickets}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">平均応答時間</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgResponseTime}h</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">満足度</p>
                <p className="text-2xl font-bold text-orange-600">{stats.satisfaction}/5</p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-500" />
            </div>
          </motion.div>
        </div>

        {/* フィルター・検索 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="チケット番号、件名、ユーザー名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div className="flex space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">全てのステータス</option>
                <option value="open">オープン</option>
                <option value="pending">保留</option>
                <option value="resolved">解決済み</option>
                <option value="closed">クローズ</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">全ての優先度</option>
                <option value="urgent">緊急</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">全てのカテゴリ</option>
                <option value="サービスについて">サービスについて</option>
                <option value="料金・プランについて">料金・プランについて</option>
                <option value="マッチングについて">マッチングについて</option>
                <option value="技術的な問題">技術的な問題</option>
                <option value="アカウント・登録について">アカウント・登録について</option>
                <option value="その他">その他</option>
              </select>
            </div>
          </div>
        </div>

        {/* チケット一覧 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-black">
              サポートチケット ({filteredTickets.length}件)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    チケット番号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    件名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ユーザー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    優先度
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    担当者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    更新日
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.map((ticket, index) => (
                  <motion.tr
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleTicketClick(ticket)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-blue-600">{ticket.ticket_number}</div>
                      <div className="text-sm text-gray-500">{ticket.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{ticket.subject}</div>
                      <div className="text-sm text-gray-500">{ticket.message_count} メッセージ</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          {ticket.user_type === 'company' ? (
                            <Building2 className="h-4 w-4 text-gray-500" />
                          ) : (
                            <User className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{ticket.user_name}</div>
                          <div className="text-sm text-gray-500">{ticket.user_email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(ticket.priority)}`}>
                        {getPriorityLabel(ticket.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                        {getStatusLabel(ticket.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ticket.assigned_to || '未割当'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(ticket.updated_at)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* チケット詳細モーダル */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* ヘッダー */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-black">{selectedTicket.ticket_number}</h3>
                <p className="text-sm text-gray-600">{selectedTicket.subject}</p>
              </div>
              <button
                onClick={() => setShowTicketModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {/* チケット情報 */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">ユーザー:</span>
                  <div className="mt-1">{selectedTicket.user_name}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">優先度:</span>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(selectedTicket.priority)}`}>
                      {getPriorityLabel(selectedTicket.priority)}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">ステータス:</span>
                  <div className="mt-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedTicket.status)}`}>
                      {getStatusLabel(selectedTicket.status)}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">担当者:</span>
                  <div className="mt-1">{selectedTicket.assigned_to || '未割当'}</div>
                </div>
              </div>
            </div>

            {/* メッセージ一覧 */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {ticketMessages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-3xl ${message.sender === 'admin' ? 'order-2' : 'order-1'}`}>
                      <div className={`rounded-lg p-4 ${
                        message.sender === 'admin'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{message.sender_name}</span>
                          <span className={`text-xs ${message.sender === 'admin' ? 'text-blue-100' : 'text-gray-500'}`}>
                            {formatDate(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 返信フォーム */}
            <div className="p-6 border-t border-gray-200">
              <div className="flex space-x-4">
                <textarea
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  placeholder="返信を入力..."
                  rows={3}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                />
                <button
                  onClick={handleSendResponse}
                  disabled={!newResponse.trim()}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  送信
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}