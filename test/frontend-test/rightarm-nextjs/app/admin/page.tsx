'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Building2, 
  MessageSquare, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Activity,
  Shield,
  Settings
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalCFOs: number;
  activeConversations: number;
  monthlyRevenue: number;
  monthlyMatches: number;
  conversionRate: number;
  activeIssues: number;
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'contract_created' | 'payment_received' | 'support_ticket';
  description: string;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high';
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCompanies: 0,
    totalCFOs: 0,
    activeConversations: 0,
    monthlyRevenue: 0,
    monthlyMatches: 0,
    conversionRate: 0,
    activeIssues: 0
  });
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // TODO: 実際のAPIコール
      // 開発用モックデータ
      const mockStats: DashboardStats = {
        totalUsers: 1547,
        totalCompanies: 523,
        totalCFOs: 1024,
        activeConversations: 342,
        monthlyRevenue: 15680000,
        monthlyMatches: 89,
        conversionRate: 23.4,
        activeIssues: 7
      };

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'user_registration',
          description: '新規企業登録: テクノロジー株式会社',
          timestamp: '2024-01-15T14:30:00Z'
        },
        {
          id: '2',
          type: 'contract_created',
          description: 'CFO契約成立: 山田太郎 CFO ↔ イノベーション株式会社',
          timestamp: '2024-01-15T13:45:00Z'
        },
        {
          id: '3',
          type: 'payment_received',
          description: '月次手数料受領: ¥150,000 - 株式会社ABC',
          timestamp: '2024-01-15T12:20:00Z'
        },
        {
          id: '4',
          type: 'support_ticket',
          description: 'サポートチケット: ログイン問題の報告',
          timestamp: '2024-01-15T11:15:00Z',
          severity: 'medium'
        },
        {
          id: '5',
          type: 'user_registration',
          description: '新規CFO登録: 佐藤花子（公認会計士）',
          timestamp: '2024-01-15T10:30:00Z'
        }
      ];

      setStats(mockStats);
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('ダッシュボードデータ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      notation: 'compact'
    }).format(amount);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return Users;
      case 'contract_created':
        return CheckCircle;
      case 'payment_received':
        return DollarSign;
      case 'support_ticket':
        return AlertCircle;
      default:
        return Activity;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-orange-600 bg-orange-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const statCards = [
    {
      title: '総ユーザー数',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: '登録企業数',
      value: stats.totalCompanies.toLocaleString(),
      icon: Building2,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: '登録CFO数',
      value: stats.totalCFOs.toLocaleString(),
      icon: Users,
      color: 'bg-purple-500',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'アクティブ会話',
      value: stats.activeConversations.toLocaleString(),
      icon: MessageSquare,
      color: 'bg-indigo-500',
      change: '+23%',
      changeType: 'positive'
    },
    {
      title: '月次売上',
      value: formatCurrency(stats.monthlyRevenue),
      icon: DollarSign,
      color: 'bg-emerald-500',
      change: '+18%',
      changeType: 'positive'
    },
    {
      title: '月次マッチング',
      value: stats.monthlyMatches.toLocaleString(),
      icon: TrendingUp,
      color: 'bg-orange-500',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: '成約率',
      value: `${stats.conversionRate}%`,
      icon: BarChart3,
      color: 'bg-cyan-500',
      change: '+2.1%',
      changeType: 'positive'
    },
    {
      title: '未解決課題',
      value: stats.activeIssues.toLocaleString(),
      icon: AlertCircle,
      color: 'bg-red-500',
      change: '-3',
      changeType: 'negative'
    }
  ];

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-black">管理者ダッシュボード</h1>
              <p className="text-gray-600 mt-1">RightArm プラットフォーム管理</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>最終更新: {formatTime(new Date().toISOString())}</span>
              </div>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                <Settings className="h-4 w-4" />
                <span>設定</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-2xl font-bold text-black">{card.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      card.changeType === 'positive' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                    }`}>
                      {card.change}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">前月比</span>
                  </div>
                </div>
                
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${card.color}`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 最近のアクティビティ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-black">最近のアクティビティ</h2>
              <button className="text-sm text-blue-600 hover:text-blue-800">
                すべて表示
              </button>
            </div>
            
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const IconComponent = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getSeverityColor(activity.severity)}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-black font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500">{formatTime(activity.timestamp)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* クイックアクション */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <h2 className="text-lg font-semibold text-black mb-6">クイックアクション</h2>
            
            <div className="space-y-3">
              <a
                href="/admin/users"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Users className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">ユーザー管理</span>
              </a>
              
              <a
                href="/admin/contracts"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CheckCircle className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">契約管理</span>
              </a>
              
              <a
                href="/admin/finance"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <DollarSign className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">財務管理</span>
              </a>
              
              <a
                href="/admin/support"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <AlertCircle className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">サポート</span>
              </a>
              
              <a
                href="/admin/analytics"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BarChart3 className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">分析レポート</span>
              </a>
              
              <a
                href="/admin/security"
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Shield className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">セキュリティ</span>
              </a>
            </div>
          </motion.div>
        </div>

        {/* システム状態 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-black mb-6">システム状態</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">API サーバー</p>
                <p className="text-xs text-gray-500">正常動作中</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">データベース</p>
                <p className="text-xs text-gray-500">正常動作中</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="text-sm font-medium text-gray-900">決済システム</p>
                <p className="text-xs text-gray-500">メンテナンス中</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}