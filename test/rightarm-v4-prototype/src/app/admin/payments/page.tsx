'use client'

import { useState } from 'react'
import Link from 'next/link'

interface PaymentRecord {
  id: number
  contractId: string
  companyName: string
  cfoName: string
  amount: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  dueDate: string
  paidDate: string | null
  paymentMethod: string
  adminNotes: string
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([
    {
      id: 1,
      contractId: 'CTR-2024-001',
      companyName: '株式会社テックイノベーション',
      cfoName: '田中 太郎',
      amount: 1500000,
      status: 'pending',
      dueDate: '2024-02-15',
      paidDate: null,
      paymentMethod: '銀行振込',
      adminNotes: ''
    },
    {
      id: 2,
      contractId: 'CTR-2024-002',
      companyName: '株式会社グロースパートナーズ',
      cfoName: '佐藤 花子',
      amount: 800000,
      status: 'overdue',
      dueDate: '2024-01-30',
      paidDate: null,
      paymentMethod: '銀行振込',
      adminNotes: '督促メール送信済み (2024-02-05)'
    },
    {
      id: 3,
      contractId: 'CTR-2024-003',
      companyName: '株式会社スマートソリューション',
      cfoName: '山田 次郎',
      amount: 2000000,
      status: 'paid',
      dueDate: '2024-01-15',
      paidDate: '2024-01-12',
      paymentMethod: '銀行振込',
      adminNotes: '期日前支払い完了'
    },
    {
      id: 4,
      contractId: 'CTR-2024-004',
      companyName: '株式会社フューチャーテック',
      cfoName: '鈴木 明子',
      amount: 1200000,
      status: 'pending',
      dueDate: '2024-02-20',
      paidDate: null,
      paymentMethod: '銀行振込',
      adminNotes: ''
    },
    {
      id: 5,
      contractId: 'CTR-2024-005',
      companyName: '株式会社ビジネスソリューション',
      cfoName: '高橋 和夫',
      amount: 900000,
      status: 'cancelled',
      dueDate: '2024-01-25',
      paidDate: null,
      paymentMethod: '銀行振込',
      adminNotes: '契約キャンセルのため支払い無効'
    }
  ])

  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null)
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '支払い待ち'
      case 'paid': return '支払い済み'
      case 'overdue': return '支払い遅延'
      case 'cancelled': return 'キャンセル'
      default: return status
    }
  }

  const filteredPayments = payments.filter(payment => {
    if (filterStatus === 'all') return true
    return payment.status === filterStatus
  })

  const handleStatusUpdate = (paymentId: number, newStatus: PaymentRecord['status']) => {
    setPayments(payments.map(payment => 
      payment.id === paymentId 
        ? { 
            ...payment, 
            status: newStatus,
            paidDate: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : payment.paidDate
          }
        : payment
    ))
    setShowUpdateModal(false)
    setSelectedPayment(null)
  }

  const handleNotesUpdate = (paymentId: number, notes: string) => {
    setPayments(payments.map(payment => 
      payment.id === paymentId 
        ? { ...payment, adminNotes: notes }
        : payment
    ))
  }

  const overdueDays = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = today.getTime() - due.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900 tracking-wide">RIGHTARM</h1>
              <span className="text-sm text-gray-600 bg-red-100 px-2 py-1 rounded">管理画面</span>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                ダッシュボード
              </Link>
              <Link href="/admin/users" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                ユーザー管理
              </Link>
              <Link href="/admin/contracts" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                契約管理
              </Link>
              <Link href="/admin/payments" className="text-gray-900 hover:text-gray-700 px-3 py-2 text-sm font-medium">
                支払い管理
              </Link>
              <Link href="/admin/reviews" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                レビュー管理
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">5</span>
              </button>
              
              <div className="w-8 h-8 bg-red-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">管</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ページヘッダー */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">支払い管理</h2>
          <p className="text-gray-600">契約に基づく支払い状況の確認と更新を行えます</p>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{payments.filter(p => p.status === 'pending').length}</div>
              <div className="text-sm text-gray-600">支払い待ち</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{payments.filter(p => p.status === 'overdue').length}</div>
              <div className="text-sm text-gray-600">支払い遅延</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{payments.filter(p => p.status === 'paid').length}</div>
              <div className="text-sm text-gray-600">支払い済み</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                ¥{payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">月間売上</div>
            </div>
          </div>
        </div>

        {/* フィルターとテーブル */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">支払い一覧</h3>
              <div className="flex space-x-3">
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="all">すべて</option>
                  <option value="pending">支払い待ち</option>
                  <option value="overdue">支払い遅延</option>
                  <option value="paid">支払い済み</option>
                  <option value="cancelled">キャンセル</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    契約ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    企業名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CFO名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    金額
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    支払期日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.contractId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.companyName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.cfoName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ¥{payment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        {payment.dueDate}
                        {payment.status === 'overdue' && (
                          <div className="text-xs text-red-600">
                            {overdueDays(payment.dueDate)}日遅延
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment)
                          setShowUpdateModal(true)
                        }}
                        className="text-red-600 hover:text-red-900 mr-3"
                      >
                        更新
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        詳細
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 更新モーダル */}
      {showUpdateModal && selectedPayment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                支払いステータス更新
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {selectedPayment.companyName} - {selectedPayment.contractId}
                </p>
                <p className="text-sm text-gray-600">
                  金額: ¥{selectedPayment.amount.toLocaleString()}
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新しいステータス
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  defaultValue={selectedPayment.status}
                  onChange={(e) => {
                    // ここで一時的に値を保存
                  }}
                  id="status-select"
                >
                  <option value="pending">支払い待ち</option>
                  <option value="paid">支払い済み</option>
                  <option value="overdue">支払い遅延</option>
                  <option value="cancelled">キャンセル</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  管理者メモ
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  defaultValue={selectedPayment.adminNotes}
                  placeholder="更新理由や備考を入力..."
                  id="notes-textarea"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const statusSelect = document.getElementById('status-select') as HTMLSelectElement
                    const notesTextarea = document.getElementById('notes-textarea') as HTMLTextAreaElement
                    handleStatusUpdate(selectedPayment.id, statusSelect.value as PaymentRecord['status'])
                    handleNotesUpdate(selectedPayment.id, notesTextarea.value)
                  }}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500"
                >
                  更新
                </button>
                <button
                  onClick={() => {
                    setShowUpdateModal(false)
                    setSelectedPayment(null)
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}