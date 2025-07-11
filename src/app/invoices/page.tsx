'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import AppHeader from '@/components/AppHeader'
import FileUpload from '@/components/FileUpload'

export const dynamic = 'force-dynamic'

interface Invoice {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string
  period_start: string
  period_end: string
  consulting_fee: number
  platform_fee: number
  total_amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  paid_at?: string
  created_at: string
  rightarm_contracts: {
    id: string
    rightarm_companies: {
      company_name: string
      business_name: string
      rightarm_users: {
        email: string
        rightarm_user_profiles: {
          display_name: string
        }[]
      }[]
    }
    rightarm_cfos: {
      specialization?: string
      rightarm_users: {
        email: string
        rightarm_user_profiles: {
          display_name: string
          nickname?: string
        }[]
      }[]
    }
  }
  rightarm_payments?: {
    id: string
    payment_date: string
    amount: number
  }[]
}

export default function InvoicesPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [showToast, setShowToast] = useState(false)
  const [uploadingInvoiceId, setUploadingInvoiceId] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // 請求書データを取得
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (filter !== 'all') {
        params.append('status', filter)
      }

      const response = await fetch(`/api/invoices?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setInvoices(data.data)
        setPagination(data.pagination)
      } else {
        setError(data.error || '請求書データの取得に失敗しました')
        setInvoices([])
      }
    } catch (error) {
      console.error('Invoices fetch error:', error)
      setError('ネットワークエラーが発生しました')
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }, [filter, pagination.page])

  // 初回読み込みとフィルター変更時に請求書データを取得
  useEffect(() => {
    if (isAuthenticated) {
      fetchInvoices()
    }
  }, [isAuthenticated, filter, pagination.page, fetchInvoices])

  // 請求書ステータスの表示名とスタイル
  const getStatusDisplay = (status: string) => {
    const statusConfig = {
      draft: { label: '下書き', className: 'bg-gray-100 text-gray-800 border-gray-200' },
      sent: { label: '送付済み', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      paid: { label: '支払い済み', className: 'bg-green-100 text-green-800 border-green-200' },
      overdue: { label: '支払い遅延', className: 'bg-red-100 text-red-800 border-red-200' },
      cancelled: { label: 'キャンセル', className: 'bg-gray-100 text-gray-800 border-gray-200' }
    }
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
  }

  // 支払い遅延の判定
  const isOverdue = (invoice: Invoice) => {
    if (invoice.status === 'paid' || invoice.status === 'cancelled') return false
    return new Date(invoice.due_date) < new Date()
  }

  // ファイルアップロード成功時の処理
  const handleFileUpload = (url: string, filePath: string, invoiceId: string, fileType: 'invoice' | 'payment') => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
    setUploadingInvoiceId(null)
    // 請求書リストを再取得して最新状態に更新
    fetchInvoices()
  }

  // ファイルアップロードエラー時の処理
  const handleUploadError = (error: string) => {
    setError(error)
    setUploadingInvoiceId(null)
  }

  // 認証確認
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">認証が必要です</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">請求書管理</h1>
              <p className="text-gray-600 mt-2">
                {user.userType === 'company' 
                  ? 'CFOからの請求書を確認・支払いできます' 
                  : '企業への請求書を作成・管理できます'
                }
              </p>
            </div>
            {user.userType === 'cfo' && (
              <Link
                href="/invoices/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                新規請求書作成
              </Link>
            )}
          </div>
        </div>

        {/* フィルター */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'すべて' },
              { value: 'draft', label: '下書き' },
              { value: 'sent', label: '送付済み' },
              { value: 'paid', label: '支払い済み' },
              { value: 'overdue', label: '支払い遅延' },
              { value: 'cancelled', label: 'キャンセル' }
            ].map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  filter === filterOption.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* ローディング表示 */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">請求書データを読み込み中...</p>
          </div>
        )}

        {/* 請求書一覧 */}
        {!loading && (
          <div className="space-y-4">
            {invoices.length > 0 ? (
              invoices.map((invoice) => {
                const statusDisplay = getStatusDisplay(invoice.status)
                const companyProfile = invoice.rightarm_contracts?.rightarm_companies?.rightarm_users?.[0]?.rightarm_user_profiles?.[0]
                const cfoProfile = invoice.rightarm_contracts?.rightarm_cfos?.rightarm_users?.[0]?.rightarm_user_profiles?.[0]
                const isInvoiceOverdue = isOverdue(invoice)
                
                return (
                  <div key={invoice.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            請求書 #{invoice.invoice_number}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full border ${
                            isInvoiceOverdue && invoice.status === 'sent' 
                              ? 'bg-red-100 text-red-800 border-red-200'
                              : statusDisplay.className
                          }`}>
                            {isInvoiceOverdue && invoice.status === 'sent' ? '支払い遅延' : statusDisplay.label}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex gap-6">
                            <p>請求日: {new Date(invoice.invoice_date).toLocaleDateString('ja-JP')}</p>
                            <p>支払期限: {new Date(invoice.due_date).toLocaleDateString('ja-JP')}</p>
                          </div>
                          <div className="flex gap-6">
                            {user.userType === 'company' ? (
                              <p>CFO: {cfoProfile?.display_name || cfoProfile?.nickname || '未設定'}</p>
                            ) : (
                              <p>企業: {invoice.rightarm_contracts?.rightarm_companies?.company_name || '未設定'}</p>
                            )}
                            <p>対象期間: {new Date(invoice.period_start).toLocaleDateString('ja-JP')} - {new Date(invoice.period_end).toLocaleDateString('ja-JP')}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">コンサルティング料</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {invoice.consulting_fee?.toLocaleString() || 0}円
                          </p>
                          <p className="text-xs text-gray-500">
                            プラットフォーム手数料: {invoice.platform_fee?.toLocaleString() || 0}円
                          </p>
                          <p className="text-sm font-semibold text-gray-900 border-t pt-1">
                            合計: {invoice.total_amount?.toLocaleString() || 0}円
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        <p>作成日: {new Date(invoice.created_at).toLocaleDateString('ja-JP')}</p>
                        {invoice.paid_at && (
                          <p>支払日: {new Date(invoice.paid_at).toLocaleDateString('ja-JP')}</p>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          詳細
                        </Link>
                        
                        {user.userType === 'cfo' && invoice.status === 'draft' && (
                          <Link
                            href={`/invoices/${invoice.id}/edit`}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            編集
                          </Link>
                        )}
                        
                        {user.userType === 'company' && invoice.status === 'sent' && (
                          <Link
                            href={`/invoices/${invoice.id}/payment`}
                            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                          >
                            支払い
                          </Link>
                        )}

                        {/* ファイルアップロードボタン */}
                        {user.userType === 'cfo' && (invoice.status === 'draft' || invoice.status === 'sent') && (
                          <button
                            onClick={() => setUploadingInvoiceId(uploadingInvoiceId === invoice.id ? null : invoice.id)}
                            className="px-4 py-2 text-sm border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50"
                          >
                            📄 請求書PDF
                          </button>
                        )}

                        {user.userType === 'company' && invoice.status === 'paid' && (
                          <button
                            onClick={() => setUploadingInvoiceId(uploadingInvoiceId === invoice.id ? null : invoice.id)}
                            className="px-4 py-2 text-sm border border-green-300 text-green-700 rounded-lg hover:bg-green-50"
                          >
                            📄 支払証明
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ファイルアップロードエリア */}
                    {uploadingInvoiceId === invoice.id && (
                      <div className="mt-4 p-4 bg-gray-50 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          {user.userType === 'cfo' ? '請求書PDFをアップロード' : '支払い証明書をアップロード'}
                        </h4>
                        <FileUpload
                          fileType={user.userType === 'cfo' ? 'INVOICE_PDF' : 'PAYMENT_PROOF'}
                          userId={user.id}
                          onUploadSuccess={(url, filePath) => handleFileUpload(url, filePath, invoice.id, user.userType === 'cfo' ? 'invoice' : 'payment')}
                          onUploadError={handleUploadError}
                          multiple={false}
                          maxFiles={1}
                        />
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">請求書がまだありません</h3>
                <p className="text-gray-600 mb-4">
                  {user.userType === 'company' 
                    ? 'CFOからの請求書をお待ちください' 
                    : '契約に基づいて請求書を作成しましょう'
                  }
                </p>
                {user.userType === 'cfo' && (
                  <Link
                    href="/contracts"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    契約を確認
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* ページネーション */}
        {!loading && invoices.length > 0 && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                前へ
              </button>
              
              <span className="px-3 py-2 text-sm text-gray-600">
                {pagination.page} / {pagination.totalPages}
              </span>
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                次へ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Toast通知 */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          ファイルがアップロードされました ✓
        </div>
      )}
    </div>
  )
}