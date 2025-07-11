'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import LoginStatus from './LoginStatus'

interface StatusCardProps {
  title?: string
  showConnectionStatus?: boolean
  className?: string
}

export default function StatusCard({ 
  title = "システム状態", 
  showConnectionStatus = true,
  className = ""
}: StatusCardProps) {
  const { user, isAuthenticated, isLoading } = useAuth()

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-3">{title}</h3>
      
      <div className="space-y-3">
        {/* ログイン状態 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">ログイン状態:</span>
          <LoginStatus 
            size="small" 
            variant="badge" 
            showUsername={false} 
            showUserType={true}
          />
        </div>

        {/* ユーザー情報 */}
        {isAuthenticated && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">ユーザー名:</span>
            <span className="text-sm font-medium text-gray-900">
              {user?.name || user?.email || 'ユーザー'}
            </span>
          </div>
        )}

        {/* ユーザータイプ */}
        {isAuthenticated && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">アカウント種別:</span>
            <span className={`text-sm font-medium ${
              user?.userType === 'cfo' ? 'text-blue-600' : 'text-purple-600'
            }`}>
              {user?.userType === 'cfo' ? 'CFO' : '企業'}
            </span>
          </div>
        )}

        {/* 接続状態 */}
        {showConnectionStatus && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">接続状態:</span>
            <div className="flex items-center gap-1">
              <span className="text-green-500 text-xs">●</span>
              <span className="text-sm text-green-600">オンライン</span>
            </div>
          </div>
        )}

        {/* 読み込み状態 */}
        {isLoading && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">読み込み中...</span>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* デバッグ情報 */}
        {process.env.NODE_ENV === 'development' && isAuthenticated && user?.id && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-500">User ID:</span>
            <span className="text-xs font-mono text-gray-600" title={user.id}>
              {user.id.slice(-8)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}