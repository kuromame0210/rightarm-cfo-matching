'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Download,
  Filter,
  Calendar,
  Search
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FinanceStats {
  totalRevenue: number;
  monthlyRevenue: number;
  basicFees: number;
  monthlyFees: number;
  successFees: number;
  pendingPayments: number;
  overduePayments: number;
}

interface Transaction {
  id: string;
  type: 'basic_fee' | 'monthly_fee' | 'success_fee';
  amount: number;
  status: 'completed' | 'pending' | 'overdue' | 'failed';
  company_name: string;
  cfo_name: string;
  description: string;
  due_date: string;
  paid_date?: string;
  invoice_id: string;
}

interface SuccessFee {
  id: string;
  type: 'funding' | 'subsidy' | 'transfer' | 'exit';
  amount: number;
  percentage: number;
  total_value: number;
  status: 'pending_approval' | 'approved' | 'paid' | 'disputed';
  company_name: string;
  cfo_name: string;
  description: string;
  submitted_date: string;
  evidence_documents: string[];
}

export default function FinanceManagement() {
  const [stats, setStats] = useState<FinanceStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    basicFees: 0,
    monthlyFees: 0,
    successFees: 0,
    pendingPayments: 0,
    overduePayments: 0
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [successFees, setSuccessFees] = useState<SuccessFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transactions' | 'success_fees'>('transactions');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      // TODO: 実際のAPIコール
      // 開発用モックデータ
      const mockStats: FinanceStats = {
        totalRevenue: 45680000,
        monthlyRevenue: 8340000,
        basicFees: 2100000,
        monthlyFees: 4590000,
        successFees: 1650000,
        pendingPayments: 1230000,
        overduePayments: 340000
      };

      const mockTransactions: Transaction[] = [
        {
          id: 'txn_1',
          type: 'basic_fee',
          amount: 300000,
          status: 'completed',
          company_name: 'テクノロジー株式会社',
          cfo_name: '山田太郎',
          description: '基本手数料 (月額50万円 × 12ヶ月 × 5%)',
          due_date: '2024-01-31T00:00:00Z',
          paid_date: '2024-01-28T14:30:00Z',
          invoice_id: 'INV-2024-001'
        },
        {
          id: 'txn_2',
          type: 'monthly_fee',
          amount: 15000,
          status: 'pending',
          company_name: 'イノベーション合同会社',
          cfo_name: '佐藤花子',
          description: '月次手数料 (月額50万円 × 3%)',
          due_date: '2024-02-01T00:00:00Z',
          invoice_id: 'INV-2024-002'
        },
        {
          id: 'txn_3',
          type: 'monthly_fee',
          amount: 12000,
          status: 'overdue',
          company_name: 'スタートアップ株式会社',
          cfo_name: '田中一郎',
          description: '月次手数料 (月額40万円 × 3%)',
          due_date: '2024-01-15T00:00:00Z',
          invoice_id: 'INV-2024-003'
        }
      ];

      const mockSuccessFees: SuccessFee[] = [
        {
          id: 'sf_1',
          type: 'funding',
          amount: 3000000,
          percentage: 3,
          total_value: 100000000,
          status: 'pending_approval',
          company_name: 'テクノロジー株式会社',
          cfo_name: '山田太郎',
          description: '銀行融資成功 (1億円 × 3%)',
          submitted_date: '2024-01-15T10:00:00Z',
          evidence_documents: ['loan_agreement.pdf', 'bank_statement.pdf']
        },
        {
          id: 'sf_2',
          type: 'subsidy',
          amount: 1000000,
          percentage: 5,
          total_value: 20000000,
          status: 'approved',
          company_name: 'イノベーション合同会社',
          cfo_name: '佐藤花子',
          description: '補助金獲得 (2,000万円 × 5%)',
          submitted_date: '2024-01-10T14:00:00Z',
          evidence_documents: ['subsidy_notification.pdf']
        }
      ];

      setStats(mockStats);
      setTransactions(mockTransactions);
      setSuccessFees(mockSuccessFees);
    } catch (error) {
      console.error('財務データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'paid':
      case 'approved':
        return 'text-green-700 bg-green-100';
      case 'pending':
      case 'pending_approval':
        return 'text-yellow-700 bg-yellow-100';
      case 'overdue':
        return 'text-red-700 bg-red-100';
      case 'failed':
      case 'disputed':
        return 'text-red-700 bg-red-100';
      default:
        return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'completed': '完了',
      'pending': '未払い',
      'overdue': '期限超過',
      'failed': '失敗',
      'pending_approval': '承認待ち',
      'approved': '承認済み',
      'paid': '支払済み',
      'disputed': '異議申立て'
    };
    return labels[status] || status;
  };

  const getTransactionTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'basic_fee': '基本手数料',
      'monthly_fee': '月次手数料',
      'success_fee': '成果報酬'
    };
    return labels[type] || type;
  };

  const getSuccessFeeTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'funding': '融資成功',
      'subsidy': '補助金獲得',
      'transfer': 'フルタイム転籍',
      'exit': 'EXIT支援'
    };
    return labels[type] || type;
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      transaction.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.cfo_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.invoice_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredSuccessFees = successFees.filter(fee => {
    const matchesStatus = statusFilter === 'all' || fee.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      fee.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fee.cfo_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
              <h1 className="text-2xl font-bold text-black">財務管理</h1>
              <p className="text-gray-600 mt-1">手数料・決済・収益の管理</p>
            </div>

            <div className="ml-auto">
              <button className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                <Download className="h-4 w-4" />
                <span>レポート出力</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 財務統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">総売上</p>
                <p className="text-2xl font-bold text-black">{formatCurrency(stats.totalRevenue)}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+15% 前月比</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
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
                <p className="text-sm text-gray-600 mb-1">月次売上</p>
                <p className="text-2xl font-bold text-black">{formatCurrency(stats.monthlyRevenue)}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-600">+8% 前月比</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
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
                <p className="text-sm text-gray-600 mb-1">未収金</p>
                <p className="text-2xl font-bold text-black">{formatCurrency(stats.pendingPayments)}</p>
                <div className="flex items-center mt-2">
                  <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-xs text-yellow-600">要回収</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
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
                <p className="text-sm text-gray-600 mb-1">期限超過</p>
                <p className="text-2xl font-bold text-black">{formatCurrency(stats.overduePayments)}</p>
                <div className="flex items-center mt-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-xs text-red-600">要対応</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'transactions'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                取引履歴
              </button>
              <button
                onClick={() => setActiveTab('success_fees')}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === 'success_fees'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                成果報酬
              </button>
            </nav>
          </div>

          {/* フィルター・検索 */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="企業名、CFO名、請求書IDで検索..."
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
                  {activeTab === 'transactions' ? (
                    <>
                      <option value="completed">完了</option>
                      <option value="pending">未払い</option>
                      <option value="overdue">期限超過</option>
                      <option value="failed">失敗</option>
                    </>
                  ) : (
                    <>
                      <option value="pending_approval">承認待ち</option>
                      <option value="approved">承認済み</option>
                      <option value="paid">支払済み</option>
                      <option value="disputed">異議申立て</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* 取引履歴タブ */}
          {activeTab === 'transactions' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      請求書ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      種別
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      企業/CFO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      金額
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      期限日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction, index) => (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-black">{transaction.invoice_id}</div>
                        <div className="text-sm text-gray-500">{transaction.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {getTransactionTypeLabel(transaction.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{transaction.company_name}</div>
                        <div className="text-sm text-gray-500">{transaction.cfo_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-black">{formatCurrency(transaction.amount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.due_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                          {getStatusLabel(transaction.status)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 成果報酬タブ */}
          {activeTab === 'success_fees' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      種別
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      企業/CFO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      対象金額
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      手数料率
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      手数料額
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      申請日
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSuccessFees.map((fee, index) => (
                    <motion.tr
                      key={fee.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {getSuccessFeeTypeLabel(fee.type)}
                        </span>
                        <div className="text-sm text-gray-500 mt-1">{fee.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{fee.company_name}</div>
                        <div className="text-sm text-gray-500">{fee.cfo_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-black">{formatCurrency(fee.total_value)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{fee.percentage}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-green-600">{formatCurrency(fee.amount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(fee.submitted_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(fee.status)}`}>
                          {getStatusLabel(fee.status)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}