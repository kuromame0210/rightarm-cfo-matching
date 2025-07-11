'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import AppHeader from '@/components/AppHeader'

export const dynamic = 'force-dynamic'

interface CFO {
  id: string
  specialization?: string
  years_of_experience?: number
  hourly_rate_min?: number
  hourly_rate_max?: number
  rightarm_users: {
    email: string
    rightarm_user_profiles: {
      display_name: string
      nickname?: string
    }[]
  }[]
}

interface Company {
  id: string
  company_name: string
  business_name: string
}

interface FormData {
  cfoId: string
  companyId: string
  monthly_fee: number
  contract_period: number
  work_hours_per_month: number
  start_date: string
  end_date: string
}

function NewContractPageContent() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [cfos, setCfos] = useState<CFO[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCfo, setSelectedCfo] = useState<CFO | null>(null)
  const [formData, setFormData] = useState<FormData>({
    cfoId: '',
    companyId: '',
    monthly_fee: 500000,
    contract_period: 12,
    work_hours_per_month: 80,
    start_date: '',
    end_date: ''
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedCfoId = searchParams.get('cfoId')

  // CFO一覧を取得
  const fetchCfos = useCallback(async () => {
    try {
      const response = await fetch('/api/cfos', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setCfos(data.data)
        
        // 事前選択されたCFOがある場合
        if (preselectedCfoId) {
          const preselected = data.data.find((cfo: CFO) => cfo.id === preselectedCfoId)
          if (preselected) {
            setSelectedCfo(preselected)
            setFormData(prev => ({ ...prev, cfoId: preselected.id }))
          }
        }
      }
    } catch (error) {
      console.error('CFOs fetch error:', error)
    }
  }, [])

  // 企業一覧を取得
  const fetchCompanies = useCallback(async () => {
    try {
      const response = await fetch('/api/companies/my', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      const data = await response.json()
      if (data.success && data.data.length > 0) {
        setCompanies(data.data)
        // 最初の企業を自動選択
        setFormData(prev => ({ ...prev, companyId: data.data[0].id }))
      }
    } catch (error) {
      console.error('Companies fetch error:', error)
    }
  }, [])

  // 契約作成処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.cfoId || !formData.companyId || !formData.monthly_fee || !formData.start_date) {
      setError('必須項目を入力してください')
      return
    }

    try {
      setSaving(true)
      setError('')

      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          cfoId: formData.cfoId,
          companyId: formData.companyId,
          contractType: 'regular',
          startDate: new Date(formData.start_date).toISOString(),
          endDate: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
          workingDays: Math.round(formData.work_hours_per_month / 8),
          monthlyFee: formData.monthly_fee
        })
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/contracts/${data.data.id}`)
      } else {
        setError(data.error || '契約の作成に失敗しました')
      }
    } catch (error) {
      console.error('Contract creation error:', error)
      setError('ネットワークエラーが発生しました')
    } finally {
      setSaving(false)
    }
  }

  // CFO選択時の処理
  const handleCfoSelect = (cfoId: string) => {
    const cfo = cfos.find(c => c.id === cfoId)
    setSelectedCfo(cfo || null)
    setFormData(prev => ({ ...prev, cfoId }))
    
    // CFOの料金レンジから初期値を設定
    if (cfo?.hourly_rate_min && cfo?.hourly_rate_max) {
      const avgRate = (cfo.hourly_rate_min + cfo.hourly_rate_max) / 2
      const suggestedMonthly = Math.round(avgRate * formData.work_hours_per_month)
      setFormData(prev => ({ ...prev, monthly_fee: suggestedMonthly }))
    }
  }

  useEffect(() => {
    if (isAuthenticated && user?.userType === 'company') {
      setLoading(true)
      Promise.all([fetchCfos(), fetchCompanies()])
        .finally(() => setLoading(false))
    }
  }, [isAuthenticated, user, fetchCfos, fetchCompanies])

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

  // 企業ユーザーのみ契約作成可能
  if (user.userType !== 'company') {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            契約の作成は企業ユーザーのみ可能です
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
            <p className="text-gray-600">データを読み込み中...</p>
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
              href="/contracts"
              className="text-gray-600 hover:text-gray-900"
            >
              ← 契約一覧に戻る
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">新規契約作成</h1>
          <p className="text-gray-600 mt-2">CFOとの契約を作成します</p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* CFO選択 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">CFO選択</h2>
            
            {cfos.length > 0 ? (
              <div className="space-y-3">
                {cfos.map((cfo) => {
                  const profile = cfo.rightarm_users[0]?.rightarm_user_profiles[0]
                  return (
                    <label key={cfo.id} className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="cfo"
                        value={cfo.id}
                        checked={formData.cfoId === cfo.id}
                        onChange={() => handleCfoSelect(cfo.id)}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900">
                            {profile?.display_name || profile?.nickname || 'CFO'}
                          </h3>
                          {cfo.hourly_rate_min && cfo.hourly_rate_max && (
                            <span className="text-sm text-gray-600">
                              時給 {cfo.hourly_rate_min.toLocaleString()}円 - {cfo.hourly_rate_max.toLocaleString()}円
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {cfo.specialization && <span>専門: {cfo.specialization}</span>}
                          {cfo.years_of_experience && (
                            <span className="ml-4">経験: {cfo.years_of_experience}年</span>
                          )}
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">利用可能なCFOが見つかりません</p>
                <Link
                  href="/discover/cfos"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  CFOを探す
                </Link>
              </div>
            )}
          </div>

          {/* 企業選択 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">契約企業</h2>
            
            {companies.length > 0 ? (
              <select
                value={formData.companyId}
                onChange={(e) => setFormData(prev => ({ ...prev, companyId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.company_name} - {company.business_name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600">企業情報が見つかりません</p>
              </div>
            )}
          </div>

          {/* 契約条件 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                {selectedCfo?.hourly_rate_min && selectedCfo?.hourly_rate_max && (
                  <p className="text-xs text-gray-500 mt-1">
                    推奨: {Math.round((selectedCfo.hourly_rate_min + selectedCfo.hourly_rate_max) / 2 * formData.work_hours_per_month).toLocaleString()}円
                  </p>
                )}
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

              <div></div>

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
          </div>

          {/* アクションボタン */}
          <div className="flex justify-between items-center">
            <Link
              href="/contracts"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </Link>
            
            <button
              type="submit"
              disabled={saving || !formData.cfoId || !formData.companyId}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '作成中...' : '契約を作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function NewContractPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <NewContractPageContent />
    </Suspense>
  )
}