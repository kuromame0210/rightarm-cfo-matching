'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import AppHeader from '@/components/AppHeader'

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
  platform_fee_rate: number
  total_amount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  paid_at?: string
  created_at: string
  updated_at: string
  rightarm_contracts: {
    id: string
    monthly_fee: number
    contract_period: number
    rightarm_companies: {
      id: string
      company_name: string
      business_name: string
      industry: string
      region?: string
      rightarm_users: {
        email: string
        rightarm_user_profiles: {
          display_name: string
          phone_number?: string
        }[]
      }[]
    }
    rightarm_cfos: {
      id: string
      specialization?: string
      years_of_experience?: number
      rightarm_users: {
        email: string
        rightarm_user_profiles: {
          display_name: string
          nickname?: string
          phone_number?: string
        }[]
      }[]
    }
  }
  rightarm_payments?: {
    id: string
    payment_date: string
    payment_method: string
    amount: number
    notes?: string
    created_at: string
  }[]
}

export default function InvoiceDetailPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string

  // 請求書詳細を取得
  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`/api/invoices/${invoiceId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setInvoice(data.data)
      } else {
        setError(data.error || '請求書詳細の取得に失敗しました')
      }
    } catch (error) {
      console.error('Invoice fetch error:', error)
      setError('ネットワークエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }, [invoiceId])

  // 請求書削除処理
  const handleDelete = async () => {
    if (!window.confirm('この請求書を削除してもよろしいですか？')) {
      return
    }

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      const data = await response.json()

      if (data.success) {
        router.push('/invoices')
      } else {
        setError(data.error || '請求書の削除に失敗しました')
      }
    } catch (error) {
      console.error('Invoice delete error:', error)
      setError('ネットワークエラーが発生しました')
    }
  }

  // 請求書ステータス更新（送付）
  const handleSendInvoice = async () => {
    if (!window.confirm('この請求書を送付してもよろしいですか？')) {
      return
    }

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          status: 'sent'
        })
      })

      const data = await response.json()

      if (data.success) {
        fetchInvoice() // 再読み込み
      } else {
        setError(data.error || '請求書の送付に失敗しました')
      }
    } catch (error) {
      console.error('Invoice send error:', error)
      setError('ネットワークエラーが発生しました')
    }
  }

  useEffect(() => {
    if (isAuthenticated && invoiceId) {
      fetchInvoice()
    }
  }, [isAuthenticated, invoiceId, fetchInvoice])

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

  // 支払い方法の表示名
  const getPaymentMethodDisplay = (method: string) => {
    const methodMap = {
      bank_transfer: '銀行振込',
      credit_card: 'クレジットカード',
      cash: '現金',
      other: 'その他'
    }
    return methodMap[method as keyof typeof methodMap] || method
  }

  // 支払い遅延の判定
  const isOverdue = (invoice: Invoice) => {
    if (invoice.status === 'paid' || invoice.status === 'cancelled') return false
    return new Date(invoice.due_date) < new Date()
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">請求書詳細を読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
          <div className="mt-4">
            <Link
              href="/invoices"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              請求書一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-600">請求書が見つかりません</p>
          <div className="mt-4">
            <Link
              href="/invoices"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              請求書一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const statusDisplay = getStatusDisplay(invoice.status)
  const companyProfile = invoice.rightarm_contracts?.rightarm_companies?.rightarm_users?.[0]?.rightarm_user_profiles?.[0]
  const cfoProfile = invoice.rightarm_contracts?.rightarm_cfos?.rightarm_users?.[0]?.rightarm_user_profiles?.[0]
  const isInvoiceOverdue = isOverdue(invoice)
  const totalPaid = invoice.rightarm_payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/invoices"
              className="text-gray-600 hover:text-gray-900"
            >
              ← 請求書一覧に戻る
            </Link>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">請求書詳細</h1>
              <div className="flex items-center gap-3">
                <span className="text-xl font-semibold text-gray-700">#{invoice.invoice_number}</span>
                <span className={`px-3 py-1 text-sm rounded-full border ${
                  isInvoiceOverdue && invoice.status === 'sent' 
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : statusDisplay.className
                }`}>
                  {isInvoiceOverdue && invoice.status === 'sent' ? '支払い遅延' : statusDisplay.label}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {user.userType === 'cfo' && invoice.status === 'draft' && (
                <>
                  <Link
                    href={`/invoices/${invoice.id}/edit`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    編集
                  </Link>
                  <button
                    onClick={handleSendInvoice}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    送付
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    削除
                  </button>
                </>
              )}
              {user.userType === 'company' && invoice.status === 'sent' && (
                <Link
                  href={`/invoices/${invoice.id}/payment`}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  支払い処理
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* 請求書情報 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">請求書情報</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* 企業情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">請求先企業</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">企業名:</span>
                  <p className="text-gray-900">{invoice.rightarm_contracts?.rightarm_companies?.company_name || '未設定'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">事業名:</span>
                  <p className="text-gray-900">{invoice.rightarm_contracts?.rightarm_companies?.business_name || '未設定'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">業界:</span>
                  <p className="text-gray-900">{invoice.rightarm_contracts?.rightarm_companies?.industry || '未設定'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">担当者:</span>
                  <p className="text-gray-900">{companyProfile?.display_name || '未設定'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">連絡先:</span>
                  <p className="text-gray-900">{invoice.rightarm_contracts?.rightarm_companies?.rightarm_users?.[0]?.email || '未設定'}</p>
                </div>
              </div>
            </div>

            {/* CFO情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">請求元CFO</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">氏名:</span>
                  <p className="text-gray-900">{cfoProfile?.display_name || cfoProfile?.nickname || '未設定'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">専門分野:</span>
                  <p className="text-gray-900">{invoice.rightarm_contracts?.rightarm_cfos?.specialization || '未設定'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">経験年数:</span>
                  <p className="text-gray-900">{invoice.rightarm_contracts?.rightarm_cfos?.years_of_experience ? `${invoice.rightarm_contracts.rightarm_cfos.years_of_experience}年` : '未設定'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">連絡先:</span>
                  <p className="text-gray-900">{invoice.rightarm_contracts?.rightarm_cfos?.rightarm_users?.[0]?.email || '未設定'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 請求内容 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">請求内容</h2>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <span className="text-sm font-medium text-gray-700">請求日:</span>
                <p className="text-gray-900">{new Date(invoice.invoice_date).toLocaleDateString('ja-JP')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">支払期限:</span>
                <p className="text-gray-900">{new Date(invoice.due_date).toLocaleDateString('ja-JP')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">対象期間:</span>
                <p className="text-gray-900">
                  {new Date(invoice.period_start).toLocaleDateString('ja-JP')} - {new Date(invoice.period_end).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>

            {/* 金額詳細 */}
            <div className="border-t pt-4 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">金額詳細</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">コンサルティング料:</span>
                  <span className="text-xl font-semibold text-gray-900">
                    {invoice.consulting_fee?.toLocaleString() || 0}円
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">プラットフォーム手数料 ({(invoice.platform_fee_rate * 100).toFixed(1)}%):</span>
                  <span className="text-gray-900">
                    {invoice.platform_fee?.toLocaleString() || 0}円
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">合計金額:</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {invoice.total_amount?.toLocaleString() || 0}円
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 支払い履歴 */}
        {invoice.rightarm_payments && invoice.rightarm_payments.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">支払い履歴</h2>
            
            <div className="space-y-3">
              {invoice.rightarm_payments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {payment.amount.toLocaleString()}円
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(payment.payment_date).toLocaleDateString('ja-JP')} - {getPaymentMethodDisplay(payment.payment_method)}
                    </p>
                    {payment.notes && (
                      <p className="text-sm text-gray-500 mt-1">{payment.notes}</p>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(payment.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              ))}
              
              <div className="border-t pt-3 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">支払い済み合計:</span>
                  <span className="text-lg font-semibold text-green-600">
                    {totalPaid.toLocaleString()}円
                  </span>
                </div>
                {totalPaid < invoice.total_amount && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium text-gray-900">残額:</span>
                    <span className="text-lg font-semibold text-red-600">
                      {(invoice.total_amount - totalPaid).toLocaleString()}円
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex justify-between items-center">
          <Link
            href="/invoices"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            請求書一覧に戻る
          </Link>
          
          <div className="flex gap-2">
            {user.userType === 'company' && invoice.status === 'sent' && totalPaid < invoice.total_amount && (
              <Link
                href={`/invoices/${invoice.id}/payment`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                支払い処理
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}