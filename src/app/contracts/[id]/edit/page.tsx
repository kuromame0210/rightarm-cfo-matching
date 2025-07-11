'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import AppHeader from '@/components/AppHeader'

export const dynamic = 'force-dynamic'

interface Contract {
  id: string
  status: 'active' | 'completed' | 'cancelled' | 'pending' | 'draft'
  monthly_fee: number
  contract_period: number
  work_hours_per_month?: number
  start_date: string
  end_date?: string
  created_at: string
  updated_at: string
  rightarm_companies: {
    company_name: string
    business_name: string
  }
  rightarm_cfos: {
    specialization?: string
    years_of_experience?: number
    rightarm_users: {
      rightarm_user_profiles: {
        display_name: string
        nickname?: string
      }[]
    }[]
  }
}

interface FormData {
  monthly_fee: number
  contract_period: number
  work_hours_per_month: number
  start_date: string
  end_date: string
  status: 'active' | 'completed' | 'cancelled' | 'pending' | 'draft'
}

export default function ContractEditPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [contract, setContract] = useState<Contract | null>(null)
  const [formData, setFormData] = useState<FormData>({
    monthly_fee: 0,
    contract_period: 12,
    work_hours_per_month: 0,
    start_date: '',
    end_date: '',
    status: 'draft'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const params = useParams()
  const router = useRouter()
  const contractId = params.id as string

  // 契約詳細を取得
  const fetchContract = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(`/api/contracts/${contractId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      const data = await response.json()

      if (data.success) {
        const contractData = data.data
        setContract(contractData)
        setFormData({
          monthly_fee: contractData.monthly_fee || 0,
          contract_period: contractData.contract_period || 12,
          work_hours_per_month: contractData.work_hours_per_month || 0,
          start_date: contractData.start_date ? new Date(contractData.start_date).toISOString().split('T')[0] : '',
          end_date: contractData.end_date ? new Date(contractData.end_date).toISOString().split('T')[0] : '',
          status: contractData.status
        })
      } else {
        setError(data.error || '契約詳細の取得に失敗しました')
      }
    } catch (error) {
      console.error('Contract fetch error:', error)
      setError('ネットワークエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }, [contractId])

  // 契約更新処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.monthly_fee || !formData.contract_period || !formData.start_date) {
      setError('必須項目を入力してください')
      return
    }

    try {
      setSaving(true)
      setError('')

      const response = await fetch(`/api/contracts/${contractId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          monthlyFee: formData.monthly_fee,
          contractType: 'regular',
          startDate: new Date(formData.start_date).toISOString(),
          endDate: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
          workingDays: Math.round(formData.work_hours_per_month / 8),
          status: formData.status
        })
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/contracts/${contractId}`)
      } else {
        setError(data.error || '契約の更新に失敗しました')
      }
    } catch (error) {
      console.error('Contract update error:', error)
      setError('ネットワークエラーが発生しました')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && contractId) {
      fetchContract()
    }
  }, [isAuthenticated, contractId, fetchContract])

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

  // 企業ユーザーのみ編集可能
  if (user.userType !== 'company') {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            契約の編集は企業ユーザーのみ可能です
          </div>
          <div className="mt-4">
            <Link
              href="/contracts"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              契約一覧に戻る
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
            <p className="text-gray-600">契約情報を読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !contract) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
          <div className="mt-4">
            <Link
              href="/contracts"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              契約一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const cfoProfile = contract?.rightarm_cfos?.rightarm_users?.[0]?.rightarm_user_profiles?.[0]

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ページヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href={`/contracts/${contractId}`}
              className="text-gray-600 hover:text-gray-900"
            >
              ← 契約詳細に戻る
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">契約編集</h1>
          {contract && (
            <p className="text-gray-600 mt-2">
              {cfoProfile?.display_name || cfoProfile?.nickname || 'CFO'}との契約を編集
            </p>
          )}
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 契約編集フォーム */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">契約条件</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* 月額料金 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                月額料金 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={formData.monthly_fee}
                  onChange={(e) => setFormData(prev => ({ ...prev, monthly_fee: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="500000"
                  required
                />
                <span className="absolute right-3 top-2 text-gray-500">円</span>
              </div>
            </div>

            {/* 契約期間 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                契約期間 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.contract_period}
                  onChange={(e) => setFormData(prev => ({ ...prev, contract_period: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <span className="absolute right-3 top-2 text-gray-500">ヶ月</span>
              </div>
            </div>

            {/* 月次稼働時間 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                月次稼働時間
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="200"
                  value={formData.work_hours_per_month}
                  onChange={(e) => setFormData(prev => ({ ...prev, work_hours_per_month: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="80"
                />
                <span className="absolute right-3 top-2 text-gray-500">時間</span>
              </div>
            </div>

            {/* 契約ステータス */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                契約ステータス
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">下書き</option>
                <option value="pending">保留中</option>
                <option value="active">進行中</option>
                <option value="completed">完了</option>
                <option value="cancelled">キャンセル</option>
              </select>
            </div>

            {/* 開始日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                契約開始日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* 終了日 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                契約終了日
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                min={formData.start_date}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">空欄の場合は契約期間から自動計算されます</p>
            </div>
          </div>

          {/* 契約相手情報（参考表示） */}
          {contract && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">契約相手情報</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">企業名:</span>
                    <span className="ml-2 text-gray-900">{contract.rightarm_companies?.company_name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">事業名:</span>
                    <span className="ml-2 text-gray-900">{contract.rightarm_companies?.business_name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">CFO:</span>
                    <span className="ml-2 text-gray-900">{cfoProfile?.display_name || cfoProfile?.nickname}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">専門分野:</span>
                    <span className="ml-2 text-gray-900">{contract.rightarm_cfos?.specialization || '未設定'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <Link
              href={`/contracts/${contractId}`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </Link>
            
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '更新中...' : '契約を更新'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}