'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import AppHeader from '@/components/AppHeader'
import FileUpload from '@/components/FileUpload'

export const dynamic = 'force-dynamic'

interface Contract {
  id: string
  status: 'active' | 'completed' | 'cancelled' | 'pending' | 'draft'
  monthly_fee: number
  contract_period: number
  start_date: string
  end_date?: string
  created_at: string
  rightarm_companies: {
    company_name: string
    business_name: string
    industry: string
    rightarm_users: {
      email: string
      rightarm_user_profiles: {
        display_name: string
      }[]
    }[]
  }
  rightarm_cfos: {
    specialization?: string
    years_of_experience?: number
    rightarm_users: {
      email: string
      rightarm_user_profiles: {
        display_name: string
        nickname?: string
      }[]
    }[]
  }
}

export default function ContractsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  // 契約データを取得
  const fetchContracts = useCallback(async () => {
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

      const response = await fetch(`/api/contracts?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      const data = await response.json()

      if (data.success) {
        setContracts(data.data)
        setPagination(data.pagination)
      } else {
        setError(data.error || '契約データの取得に失敗しました')
        setContracts([])
      }
    } catch (error) {
      console.error('Contracts fetch error:', error)
      setError('ネットワークエラーが発生しました')
      setContracts([])
    } finally {
      setLoading(false)
    }
  }, [filter, pagination.page])

  // 初回読み込みとフィルター変更時に契約データを取得
  useEffect(() => {
    if (isAuthenticated) {
      fetchContracts()
    }
  }, [isAuthenticated, filter, pagination.page, fetchContracts])

  // 契約ステータスの表示名とスタイル
  const getStatusDisplay = (status: string) => {
    const statusConfig = {
      active: { label: '進行中', className: 'bg-green-100 text-green-800 border-green-200' },
      completed: { label: '完了', className: 'bg-gray-100 text-gray-800 border-gray-200' },
      cancelled: { label: 'キャンセル', className: 'bg-red-100 text-red-800 border-red-200' },
      pending: { label: '保留中', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      draft: { label: '下書き', className: 'bg-blue-100 text-blue-800 border-blue-200' }
    }
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
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
              <h1 className="text-3xl font-bold text-gray-900">契約管理</h1>
              <p className="text-gray-600 mt-2">
                {user.userType === 'company' ? 'CFOとの契約を管理できます' : '企業との契約を確認できます'}
              </p>
            </div>
            {user.userType === 'company' && (
              <Link
                href="/contracts/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                新規契約作成
              </Link>
            )}
          </div>
        </div>

        {/* フィルター */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'すべて' },
              { value: 'active', label: '進行中' },
              { value: 'pending', label: '保留中' },
              { value: 'completed', label: '完了' },
              { value: 'cancelled', label: 'キャンセル' },
              { value: 'draft', label: '下書き' }
            ].map((filterOption: any) => (
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
            <p className="text-gray-600">契約データを読み込み中...</p>
          </div>
        )}

        {/* 契約一覧 */}
        {!loading && (
          <div className="space-y-4">
            {contracts.length > 0 ? (
              contracts.map((contract: any) => {
                const statusDisplay = getStatusDisplay(contract.status)
                const companyProfile = contract.rightarm_companies?.rightarm_users?.[0]?.rightarm_user_profiles?.[0]
                const cfoProfile = contract.rightarm_cfos?.rightarm_users?.[0]?.rightarm_user_profiles?.[0]
                
                return (
                  <div key={contract.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {user.userType === 'company' 
                              ? `${cfoProfile?.display_name || cfoProfile?.nickname || 'CFO'}との契約`
                              : `${contract.rightarm_companies?.company_name || '企業'}との契約`
                            }
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full border ${statusDisplay.className}`}>
                            {statusDisplay.label}
                          </span>
                        </div>
                        
                        {user.userType === 'company' ? (
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>CFO: {cfoProfile?.display_name || cfoProfile?.nickname || '未設定'}</p>
                            {contract.rightarm_cfos?.specialization && (
                              <p>専門分野: {contract.rightarm_cfos.specialization}</p>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>企業: {contract.rightarm_companies?.company_name || '未設定'}</p>
                            <p>事業: {contract.rightarm_companies?.business_name || '未設定'}</p>
                            <p>業界: {contract.rightarm_companies?.industry || '未設定'}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          月額 {contract.monthly_fee?.toLocaleString() || 0}円
                        </p>
                        <p className="text-sm text-gray-600">
                          期間: {contract.contract_period || 0}ヶ月
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        <p>開始日: {new Date(contract.start_date).toLocaleDateString('ja-JP')}</p>
                        {contract.end_date && (
                          <p>終了日: {new Date(contract.end_date).toLocaleDateString('ja-JP')}</p>
                        )}
                        <p>作成日: {new Date(contract.created_at).toLocaleDateString('ja-JP')}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Link
                          href={`/contracts/${contract.id}`}
                          className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                          詳細
                        </Link>
                        {user.userType === 'company' && contract.status === 'draft' && (
                          <Link
                            href={`/contracts/${contract.id}/edit`}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 min-h-[44px] flex items-center justify-center"
                          >
                            編集
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">契約がまだありません</h3>
                <p className="text-gray-600 mb-4">
                  {user.userType === 'company' 
                    ? 'CFOと契約を結んでプロジェクトを開始しましょう'
                    : '企業からの契約をお待ちください'
                  }
                </p>
                {user.userType === 'company' && (
                  <Link
                    href="/discover/cfos"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    CFOを探す
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* ページネーション */}
        {!loading && contracts.length > 0 && pagination.totalPages > 1 && (
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
    </div>
  )
}