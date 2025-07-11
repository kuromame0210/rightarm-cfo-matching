'use client'

import { useAuth } from '@/lib/hooks/useAuth'

interface LoginStatusProps {
  showUsername?: boolean
  showUserType?: boolean
  showDebugInfo?: boolean
  size?: 'small' | 'medium' | 'large'
  variant?: 'badge' | 'pill' | 'minimal'
}

export default function LoginStatus({ 
  showUsername = true, 
  showUserType = true, 
  showDebugInfo = false,
  size = 'medium',
  variant = 'pill'
}: LoginStatusProps) {
  const { user, isAuthenticated } = useAuth()
  
  const actualUserName = user?.name || user?.email || 'ユーザー'
  const userType = user?.userType || 'company'

  // サイズによるクラス
  const sizeClasses = {
    small: 'text-xs px-2 py-1 gap-1',
    medium: 'text-sm px-3 py-1.5 gap-2',
    large: 'text-base px-4 py-2 gap-3'
  }

  // バリアントによるスタイル
  const variantClasses = {
    badge: 'rounded-md border',
    pill: 'rounded-full border',
    minimal: 'rounded border-0 bg-transparent'
  }

  // ログイン状態による色
  const statusClasses = isAuthenticated 
    ? 'bg-green-50 border-green-200 text-green-700'
    : 'bg-gray-50 border-gray-200 text-gray-600'

  const dotColor = isAuthenticated ? 'text-green-500' : 'text-gray-400'

  return (
    <div className={`
      flex items-center font-medium
      ${sizeClasses[size]} 
      ${variantClasses[variant]} 
      ${statusClasses}
    `}>
      {/* ステータスドット */}
      <span className={`${dotColor} ${size === 'small' ? 'text-xs' : 'text-sm'}`}>●</span>
      
      {/* ログイン状態テキスト */}
      <span className="font-medium">
        {isAuthenticated ? 'ログイン中' : '未ログイン'}
      </span>

      {/* ユーザータイプバッジ */}
      {isAuthenticated && showUserType && (
        <span className={`
          px-2 py-0.5 rounded text-white font-medium
          ${size === 'small' ? 'text-xs px-1.5' : 'text-xs px-2'}
          ${userType === 'cfo' ? 'bg-blue-600' : 'bg-purple-600'}
        `}>
          {userType === 'cfo' ? 'CFO' : '企業'}
        </span>
      )}

      {/* ユーザー名 */}
      {isAuthenticated && showUsername && (
        <span className={`
          truncate
          ${size === 'small' ? 'max-w-[60px]' : size === 'medium' ? 'max-w-[100px]' : 'max-w-[150px]'}
        `} title={actualUserName}>
          {actualUserName}
        </span>
      )}

      {/* デバッグ情報 */}
      {isAuthenticated && showDebugInfo && process.env.NODE_ENV === 'development' && user?.id && (
        <span className={`
          font-mono bg-green-100 rounded px-1
          ${size === 'small' ? 'text-xs' : 'text-xs'}
        `} title={user.id}>
          ID:{user.id.slice(-6)}
        </span>
      )}
    </div>
  )
}

// レスポンシブ対応のログイン状態コンポーネント
export function ResponsiveLoginStatus() {
  return (
    <>
      {/* PC版 */}
      <div className="hidden lg:block">
        <LoginStatus 
          size="medium" 
          variant="pill" 
          showUsername={true} 
          showUserType={true} 
          showDebugInfo={true} 
        />
      </div>
      
      {/* タブレット版 */}
      <div className="hidden md:block lg:hidden">
        <LoginStatus 
          size="small" 
          variant="pill" 
          showUsername={false} 
          showUserType={true} 
          showDebugInfo={false} 
        />
      </div>
      
      {/* モバイル版 */}
      <div className="block md:hidden">
        <LoginStatus 
          size="small" 
          variant="badge" 
          showUsername={false} 
          showUserType={true} 
          showDebugInfo={false} 
        />
      </div>
    </>
  )
}