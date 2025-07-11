'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
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
  work_hours_per_month?: number
  start_date: string
  end_date?: string
  created_at: string
  updated_at: string
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
    hourly_rate_min?: number
    hourly_rate_max?: number
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

export default function ContractDetailPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [documents, setDocuments] = useState<string[]>([])
  const [showToast, setShowToast] = useState(false)
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
        setContract(data.data)
        setDocuments(data.data.document_urls || [])
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

  useEffect(() => {
    if (isAuthenticated && contractId) {
      fetchContract()
    }
  }, [isAuthenticated, contractId, fetchContract])

  // ファイルアップロード成功時の処理
  const handleDocumentUpload = (url: string, filePath: string) => {
    setDocuments(prev => [...prev, url])
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // ファイルアップロードエラー時の処理
  const handleUploadError = (error: string) => {
    setError(error)
  }

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

  // 契約削除処理
  const handleDelete = async () => {
    if (!window.confirm('この契約を削除してもよろしいですか？')) {
      return
    }

    try {
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      })

      const data = await response.json()

      if (data.success) {
        router.push('/contracts')
      } else {
        setError(data.error || '契約の削除に失敗しました')
      }
    } catch (error) {
      console.error('Contract delete error:', error)
      setError('ネットワークエラーが発生しました')
    }
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
            <p className="text-gray-600">契約詳細を読み込み中...</p>
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

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-600">契約が見つかりません</p>
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

  const statusDisplay = getStatusDisplay(contract.status)
  const companyProfile = contract.rightarm_companies?.rightarm_users?.[0]?.rightarm_user_profiles?.[0]
  const cfoProfile = contract.rightarm_cfos?.rightarm_users?.[0]?.rightarm_user_profiles?.[0]

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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">契約詳細</h1>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-sm rounded-full border ${statusDisplay.className}`}>
                  {statusDisplay.label}
                </span>
                <span className="text-gray-600">
                  作成日: {new Date(contract.created_at).toLocaleDateString('ja-JP')}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {user.userType === 'company' && contract.status === 'draft' && (
                <Link
                  href={`/contracts/${contract.id}/edit`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  編集
                </Link>
              )}
              {user.userType === 'company' && contract.status !== 'active' && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  削除
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 契約詳細 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">契約情報</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* 企業情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">企業情報</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">企業名:</span>
                  <p className="text-gray-900">{contract.rightarm_companies?.company_name || '未設定'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">事業名:</span>
                  <p className="text-gray-900">{contract.rightarm_companies?.business_name || '未設定'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">業界:</span>
                  <p className="text-gray-900">{contract.rightarm_companies?.industry || '未設定'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">地域:</span>
                  <p className="text-gray-900">{contract.rightarm_companies?.region || '未設定'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">担当者:</span>
                  <p className="text-gray-900">{companyProfile?.display_name || '未設定'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">連絡先:</span>
                  <p className="text-gray-900">{contract.rightarm_companies?.rightarm_users?.[0]?.email || '未設定'}</p>
                </div>
                {companyProfile?.phone_number && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">電話番号:</span>
                    <p className="text-gray-900">{companyProfile.phone_number}</p>
                  </div>
                )}
              </div>
            </div>

            {/* CFO情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">CFO情報</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">氏名:</span>
                  <p className="text-gray-900">{cfoProfile?.display_name || cfoProfile?.nickname || '未設定'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">専門分野:</span>
                  <p className="text-gray-900">{contract.rightarm_cfos?.specialization || '未設定'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">経験年数:</span>
                  <p className="text-gray-900">{contract.rightarm_cfos?.years_of_experience ? `${contract.rightarm_cfos.years_of_experience}年` : '未設定'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">時給レンジ:</span>
                  <p className="text-gray-900">
                    {contract.rightarm_cfos?.hourly_rate_min && contract.rightarm_cfos?.hourly_rate_max
                      ? `${contract.rightarm_cfos.hourly_rate_min.toLocaleString()}円 - ${contract.rightarm_cfos.hourly_rate_max.toLocaleString()}円`
                      : '未設定'
                    }
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">連絡先:</span>
                  <p className="text-gray-900">{contract.rightarm_cfos?.rightarm_users?.[0]?.email || '未設定'}</p>
                </div>
                {cfoProfile?.phone_number && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">電話番号:</span>
                    <p className="text-gray-900">{cfoProfile.phone_number}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 契約条件 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">契約条件</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <span className="text-sm font-medium text-gray-700">月額料金:</span>
              <p className="text-2xl font-bold text-gray-900">{contract.monthly_fee?.toLocaleString() || 0}円</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">契約期間:</span>
              <p className="text-xl font-semibold text-gray-900">{contract.contract_period || 0}ヶ月</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">月次稼働時間:</span>
              <p className="text-xl font-semibold text-gray-900">
                {contract.work_hours_per_month ? `${contract.work_hours_per_month}時間` : '未設定'}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700">開始日:</span>
              <p className="text-xl font-semibold text-gray-900">
                {new Date(contract.start_date).toLocaleDateString('ja-JP')}
              </p>
            </div>
            {contract.end_date && (
              <div>
                <span className="text-sm font-medium text-gray-700">終了日:</span>
                <p className="text-xl font-semibold text-gray-900">
                  {new Date(contract.end_date).toLocaleDateString('ja-JP')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 契約書類 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">契約書類</h2>
          
          {/* エラーメッセージ */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* 既存の書類一覧 */}
          {documents.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">アップロード済み書類</h3>
              <div className="grid gap-3">
                {documents.map((docUrl, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                        <span className="text-blue-600">📄</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">契約書 {index + 1}</p>
                        <p className="text-sm text-gray-600">PDF ファイル</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        表示
                      </a>
                      <a
                        href={docUrl}
                        download
                        className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                      >
                        ダウンロード
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ファイルアップロード */}
          {user && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {documents.length > 0 ? '追加書類をアップロード' : '契約書をアップロード'}
              </h3>
              <FileUpload
                fileType="CONTRACT_DOCUMENT"
                userId={user.id}
                onUploadSuccess={handleDocumentUpload}
                onUploadError={handleUploadError}
                multiple={true}
                maxFiles={5}
              />
              <p className="mt-2 text-xs text-gray-500">
                PDF、Word文書（.doc, .docx）形式に対応。最大10MB、5ファイルまで。
              </p>
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex justify-between items-center">
          <Link
            href="/contracts"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            契約一覧に戻る
          </Link>
          
          <div className="flex gap-2">
            {contract.status === 'active' && (
              <Link
                href={`/contracts/${contract.id}/invoice`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                請求書を確認
              </Link>
            )}
          </div>
        </div>
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