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
  consulting_fee: number
  platform_fee: number
  total_amount: number
  status: string
  rightarm_contracts: {
    rightarm_companies: {
      company_name: string
    }
    rightarm_cfos: {
      rightarm_users: {
        rightarm_user_profiles: {
          display_name: string
          nickname?: string
        }[]
      }[]
    }
  }
  rightarm_payments?: {
    id: string
    amount: number
    payment_date: string
    payment_method: string
  }[]
}

interface PaymentFormData {
  paymentDate: string
  paymentMethod: 'bank_transfer' | 'credit_card' | 'cash' | 'other'
  amount: number
  notes: string
}

export default function InvoicePaymentPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [formData, setFormData] = useState<PaymentFormData>({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    amount: 0,
    notes: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
        const invoiceData = data.data
        setInvoice(invoiceData)
        
        // 既存の支払い額を計算
        const totalPaid = invoiceData.rightarm_payments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0
        const remainingAmount = invoiceData.total_amount - totalPaid
        
        // 残額を初期値として設定
        setFormData(prev => ({ ...prev, amount: remainingAmount }))
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

  // 支払い処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.amount || formData.amount <= 0) {
      setError('支払い金額を入力してください')
      return
    }

    if (!formData.paymentDate) {
      setError('支払い日を選択してください')
      return
    }

    try {
      setSaving(true)
      setError('')

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          invoiceId: invoiceId,
          paymentDate: new Date(formData.paymentDate).toISOString(),
          paymentMethod: formData.paymentMethod,
          amount: formData.amount,
          notes: formData.notes
        })
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/invoices/${invoiceId}`)
      } else {
        setError(data.error || '支払い処理に失敗しました')
      }
    } catch (error) {
      console.error('Payment error:', error)
      setError('ネットワークエラーが発生しました')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && invoiceId) {
      fetchInvoice()
    }
  }, [isAuthenticated, invoiceId, fetchInvoice])

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

  // 企業ユーザーのみ支払い可能
  if (user.userType !== 'company') {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            支払い処理は企業ユーザーのみ可能です
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">請求書情報を読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !invoice) {
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

  const cfoProfile = invoice.rightarm_contracts?.rightarm_cfos?.rightarm_users?.[0]?.rightarm_user_profiles?.[0]
  const totalPaid = invoice.rightarm_payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0
  const remainingAmount = invoice.total_amount - totalPaid

  // 既に全額支払い済みの場合
  if (remainingAmount <= 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            この請求書は既に全額支払い済みです
          </div>
          <div className="mt-4">
            <Link
              href={`/invoices/${invoiceId}`}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              請求書詳細に戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/invoices/${invoiceId}`}
              className="text-gray-600 hover:text-gray-900"
            >
              ← 請求書詳細に戻る
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">支払い処理</h1>
          <p className="text-gray-600 mt-2">
            請求書 #{invoice.invoice_number} の支払いを行います
          </p>
        </div>

        {/* 請求書サマリー */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">請求書サマリー</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">CFO:</span>
                <p className="text-gray-900">{cfoProfile?.display_name || cfoProfile?.nickname || '未設定'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">請求日:</span>
                <p className="text-gray-900">{new Date(invoice.invoice_date).toLocaleDateString('ja-JP')}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">支払期限:</span>
                <p className="text-gray-900">{new Date(invoice.due_date).toLocaleDateString('ja-JP')}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-700">請求総額:</span>
                <p className="text-xl font-semibold text-gray-900">{invoice.total_amount.toLocaleString()}円</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">支払い済み:</span>
                <p className="text-lg font-medium text-green-600">{totalPaid.toLocaleString()}円</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">残額:</span>
                <p className="text-xl font-bold text-red-600">{remainingAmount.toLocaleString()}円</p>
              </div>
            </div>
          </div>
        </div>

        {/* 既存の支払い履歴 */}
        {invoice.rightarm_payments && invoice.rightarm_payments.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">支払い履歴</h2>
            
            <div className="space-y-2">
              {invoice.rightarm_payments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">
                      {payment.amount.toLocaleString()}円
                    </span>
                    <span className="text-sm text-gray-600 ml-2">
                      ({getPaymentMethodDisplay(payment.payment_method)})
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(payment.payment_date).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 支払いフォーム */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">支払い情報</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* 支払い金額 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                支払い金額 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={remainingAmount}
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <span className="absolute right-3 top-2 text-gray-500">円</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                最大支払い可能額: {remainingAmount.toLocaleString()}円
              </p>
            </div>

            {/* 支払い日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                支払い日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* 支払い方法 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                支払い方法 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="bank_transfer">銀行振込</option>
                <option value="credit_card">クレジットカード</option>
                <option value="cash">現金</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div></div>

            {/* 備考 */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                備考
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="支払いに関する備考があれば入力してください"
              />
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <Link
              href={`/invoices/${invoiceId}`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </Link>
            
            <button
              type="submit"
              disabled={saving || formData.amount <= 0 || formData.amount > remainingAmount}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '処理中...' : `${formData.amount.toLocaleString()}円を支払う`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}