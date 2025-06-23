'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Users, 
  Building2, 
  MoreVertical,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  Calendar,
  Mail,
  Phone,
  MapPin,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  display_name: string;
  email: string;
  user_type: 'company' | 'cfo';
  status: 'active' | 'inactive' | 'banned';
  created_at: string;
  last_active: string;
  profile_completion: number;
  verified: boolean;
  // 企業固有
  company_name?: string;
  industry?: string;
  company_size?: string;
  // CFO固有
  first_name?: string;
  last_name?: string;
  experience_years?: number;
  certifications?: string[];
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<'all' | 'company' | 'cfo'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'banned'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, userTypeFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      // TODO: 実際のAPIコール
      // 開発用モックデータ
      const mockUsers: User[] = [
        {
          id: 'user_1',
          display_name: 'テクノロジー株式会社',
          email: 'contact@tech-corp.com',
          user_type: 'company',
          status: 'active',
          created_at: '2024-01-10T10:00:00Z',
          last_active: '2024-01-15T14:30:00Z',
          profile_completion: 85,
          verified: true,
          company_name: 'テクノロジー株式会社',
          industry: 'IT・Web',
          company_size: 'startup'
        },
        {
          id: 'user_2',
          display_name: '山田太郎',
          email: 'yamada@example.com',
          user_type: 'cfo',
          status: 'active',
          created_at: '2024-01-08T09:00:00Z',
          last_active: '2024-01-15T16:45:00Z',
          profile_completion: 95,
          verified: true,
          first_name: '太郎',
          last_name: '山田',
          experience_years: 12,
          certifications: ['公認会計士', 'MBA']
        },
        {
          id: 'user_3',
          display_name: 'イノベーション合同会社',
          email: 'info@innovation-llc.com',
          user_type: 'company',
          status: 'active',
          created_at: '2024-01-12T11:30:00Z',
          last_active: '2024-01-14T13:20:00Z',
          profile_completion: 60,
          verified: false,
          company_name: 'イノベーション合同会社',
          industry: '製造業',
          company_size: 'medium'
        },
        {
          id: 'user_4',
          display_name: '佐藤花子',
          email: 'satoh@example.com',
          user_type: 'cfo',
          status: 'inactive',
          created_at: '2024-01-05T15:00:00Z',
          last_active: '2024-01-10T10:15:00Z',
          profile_completion: 40,
          verified: false,
          first_name: '花子',
          last_name: '佐藤',
          experience_years: 8,
          certifications: ['公認会計士']
        },
        {
          id: 'user_5',
          display_name: 'スタートアップ株式会社',
          email: 'hello@startup.com',
          user_type: 'company',
          status: 'banned',
          created_at: '2024-01-01T08:00:00Z',
          last_active: '2024-01-03T12:00:00Z',
          profile_completion: 30,
          verified: false,
          company_name: 'スタートアップ株式会社',
          industry: 'IT・Web',
          company_size: 'startup'
        }
      ];

      setUsers(mockUsers);
    } catch (error) {
      console.error('ユーザー取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // 検索フィルター
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.company_name && user.company_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // ユーザータイプフィルター
    if (userTypeFilter !== 'all') {
      filtered = filtered.filter(user => user.user_type === userTypeFilter);
    }

    // ステータスフィルター
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-700 bg-green-100';
      case 'inactive':
        return 'text-gray-700 bg-gray-100';
      case 'banned':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'アクティブ';
      case 'inactive':
        return '非アクティブ';
      case 'banned':
        return 'BANされています';
      default:
        return status;
    }
  };

  const handleUserAction = async (userId: string, action: 'view' | 'edit' | 'ban' | 'activate') => {
    switch (action) {
      case 'view':
        const user = users.find(u => u.id === userId);
        if (user) {
          setSelectedUser(user);
          setShowUserModal(true);
        }
        break;
      case 'edit':
        // TODO: 編集画面への遷移
        console.log('Edit user:', userId);
        break;
      case 'ban':
        // TODO: BANアクション
        console.log('Ban user:', userId);
        break;
      case 'activate':
        // TODO: アクティベーションアクション
        console.log('Activate user:', userId);
        break;
    }
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
              <h1 className="text-2xl font-bold text-black">ユーザー管理</h1>
              <p className="text-gray-600 mt-1">企業・CFOアカウントの管理</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* フィルター・検索 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* 検索 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="ユーザー名、メール、会社名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            {/* フィルター */}
            <div className="flex space-x-4">
              <select
                value={userTypeFilter}
                onChange={(e) => setUserTypeFilter(e.target.value as 'all' | 'company' | 'cfo')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">全てのユーザー</option>
                <option value="company">企業</option>
                <option value="cfo">CFO</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive' | 'banned')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">全てのステータス</option>
                <option value="active">アクティブ</option>
                <option value="inactive">非アクティブ</option>
                <option value="banned">BAN</option>
              </select>
            </div>
          </div>

          {/* 統計情報 */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-blue-600">総ユーザー数</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.user_type === 'company').length}
              </div>
              <div className="text-sm text-green-600">企業</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.user_type === 'cfo').length}
              </div>
              <div className="text-sm text-purple-600">CFO</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {users.filter(u => u.status === 'active').length}
              </div>
              <div className="text-sm text-orange-600">アクティブ</div>
            </div>
          </div>
        </div>

        {/* ユーザー一覧 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-black">
              ユーザー一覧 ({filteredUsers.length}件)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ユーザー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    タイプ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    完了度
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    登録日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    最終アクティブ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          {user.user_type === 'company' ? (
                            <Building2 className="h-5 w-5 text-gray-500" />
                          ) : (
                            <Users className="h-5 w-5 text-gray-500" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                            <span>{user.display_name}</span>
                            {user.verified && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.user_type === 'company' 
                          ? 'text-blue-800 bg-blue-100' 
                          : 'text-purple-800 bg-purple-100'
                      }`}>
                        {user.user_type === 'company' ? '企業' : 'CFO'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {getStatusLabel(user.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${user.profile_completion}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{user.profile_completion}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.last_active)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUserAction(user.id, 'view')}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUserAction(user.id, 'edit')}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {user.status !== 'banned' ? (
                          <button
                            onClick={() => handleUserAction(user.id, 'ban')}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Ban className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUserAction(user.id, 'activate')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ユーザー詳細モーダル */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-black">ユーザー詳細</h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    {selectedUser.user_type === 'company' ? (
                      <Building2 className="h-8 w-8 text-gray-500" />
                    ) : (
                      <Users className="h-8 w-8 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-black flex items-center space-x-2">
                      <span>{selectedUser.display_name}</span>
                      {selectedUser.verified && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </h4>
                    <p className="text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ユーザータイプ</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedUser.user_type === 'company' ? '企業' : 'CFO'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">ステータス</label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.status)}`}>
                      {getStatusLabel(selectedUser.status)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">登録日</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.created_at)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">最終アクティブ</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.last_active)}</p>
                  </div>
                </div>

                {selectedUser.user_type === 'company' && (
                  <div className="border-t pt-4">
                    <h5 className="text-md font-semibold text-black mb-3">企業情報</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">会社名</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.company_name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">業界</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.industry}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">企業規模</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.company_size}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedUser.user_type === 'cfo' && (
                  <div className="border-t pt-4">
                    <h5 className="text-md font-semibold text-black mb-3">CFO情報</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">氏名</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedUser.last_name} {selectedUser.first_name}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">経験年数</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedUser.experience_years}年</p>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">保有資格</label>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {selectedUser.certifications?.map((cert, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}