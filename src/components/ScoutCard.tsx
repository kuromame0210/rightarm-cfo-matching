'use client'

import { memo, useCallback, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useToast } from '@/components/ui/Toast'

interface ScoutCardProps {
  scout: {
    id: number
    from?: string
    to?: string
    fromType?: string
    toType?: string
    title: string
    message: string
    receivedAt?: string
    sentAt?: string
    status: string
    urgency?: string
    compensation?: string
    workStyle?: string
    avatar: string
    senderUserId?: string
    recipientUserId?: string
  }
  type: 'received' | 'sent'
  onStatusUpdate?: (scoutId: number, newStatus: string) => void
}

const ScoutCard = memo(({ scout, type, onStatusUpdate }: ScoutCardProps) => {
  const router = useRouter()
  const { showToast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'declined': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }, [])

  const getStatusText = useCallback((status: string) => {
    switch (status) {
      case 'pending': return '返答待ち'
      case 'accepted': return '承諾済み'
      case 'declined': return '辞退済み'
      default: return '不明'
    }
  }, [])

  const getUrgencyColor = useCallback((urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-orange-500'
      case 'low': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }, [])

  const { data: session } = useSession()

  // スカウトのステータス更新処理
  const handleStatusUpdate = useCallback(async (newStatus: 'accepted' | 'declined', responseMessage?: string) => {
    if (isUpdating) return
    
    if (!session) {
      showToast('認証が必要です', 'error')
      return
    }
    
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/scouts/${scout.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          response_message: responseMessage
        })
      })

      const data = await response.json()
      
      if (data.success) {
        showToast(data.message, 'success')
        onStatusUpdate?.(scout.id, newStatus)
      } else {
        throw new Error(data.error || '更新に失敗しました')
      }
    } catch (error) {
      console.error('ステータス更新エラー:', error)
      showToast(
        error instanceof Error ? error.message : 'ステータスの更新に失敗しました',
        'error'
      )
    } finally {
      setIsUpdating(false)
    }
  }, [scout.id, isUpdating, session, showToast, onStatusUpdate])

  const handleAccept = useCallback(() => {
    handleStatusUpdate('accepted')
  }, [handleStatusUpdate])

  const handleDecline = useCallback(() => {
    handleStatusUpdate('declined')
  }, [handleStatusUpdate])

  const displayName = type === 'received' ? scout.from : scout.to
  const displayDate = type === 'received' ? scout.receivedAt : scout.sentAt
  
  // メッセージ相手のユーザーIDを取得
  const messageTargetUserId = type === 'received' ? scout.senderUserId : scout.recipientUserId

  const handleSendMessage = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const targetUrl = messageTargetUserId ? `/messages?user=${messageTargetUserId}&scoutId=${scout.id}` : '/messages'
    router.push(targetUrl)
  }, [router, messageTargetUserId, scout.id])

  return (
    <Link href={`/scout/${scout.id}`} className="block">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
            {scout.avatar && (scout.avatar.startsWith('http') || scout.avatar.startsWith('/')) ? (
              <img 
                src={scout.avatar} 
                alt={displayName || 'Avatar'} 
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  // 画像読み込みエラー時のフォールバック
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  if (target.nextElementSibling) {
                    (target.nextElementSibling as HTMLElement).style.display = 'block'
                  }
                }}
              />
            ) : null}
            <span 
              className={`text-lg md:text-2xl ${(scout.avatar && (scout.avatar.startsWith('http') || scout.avatar.startsWith('/'))) ? 'hidden' : 'block'}`}
            >
              {(!scout.avatar || (!scout.avatar.startsWith('http') && !scout.avatar.startsWith('/'))) 
                ? (scout.avatar || '👤') 
                : '👤'
              }
            </span>
          </div>
          <div className="flex-1 md:hidden">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-gray-900">{displayName}</h3>
              {scout.urgency === 'high' && (
                <div className={`w-2 h-2 rounded-full ${getUrgencyColor(scout.urgency)}`}></div>
              )}
            </div>
            <p className="text-sm text-gray-600">{scout.title}</p>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
            <div className="hidden md:block">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">{displayName}</h3>
                {scout.urgency === 'high' && (
                  <div className={`w-2 h-2 rounded-full ${getUrgencyColor(scout.urgency)}`}></div>
                )}
              </div>
              <p className="text-gray-600 text-sm md:text-base">{scout.title}</p>
            </div>
            <div className="flex flex-col items-start md:items-end space-y-2">
              <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(scout.status)}`}>
                {getStatusText(scout.status)}
              </span>
              <span className="text-xs text-gray-500">{displayDate}</span>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 md:line-clamp-none">{scout.message}</p>
          
          {type === 'received' && scout.compensation && scout.workStyle && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 text-sm text-gray-600 mb-4">
              <div><strong>報酬:</strong> {scout.compensation}</div>
              <div><strong>稼働:</strong> {scout.workStyle}</div>
            </div>
          )}

          {scout.status === 'pending' && type === 'received' && (
            <div className="flex space-x-2" onClick={(e) => e.preventDefault()}>
              <button 
                onClick={handleAccept}
                disabled={isUpdating}
                className="flex-1 md:flex-none min-h-[44px] px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? '処理中...' : '承諾'}
              </button>
              <button 
                onClick={handleDecline}
                disabled={isUpdating}
                className="flex-1 md:flex-none min-h-[44px] px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? '処理中...' : '辞退'}
              </button>
            </div>
          )}
          
          {scout.status === 'accepted' && (
            <div className="flex space-x-2" onClick={(e) => e.preventDefault()}>
              <button 
                onClick={handleSendMessage}
                className="flex-1 md:flex-none min-h-[44px] px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center justify-center transition-colors"
              >
                メッセージを送る
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </Link>
  )
})

ScoutCard.displayName = 'ScoutCard'

export default ScoutCard