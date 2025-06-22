'use client'

import { memo, useCallback } from 'react'
import Link from 'next/link'

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
  }
  type: 'received' | 'sent'
}

const ScoutCard = memo(({ scout, type }: ScoutCardProps) => {
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

  const displayName = type === 'received' ? scout.from : scout.to
  const displayDate = type === 'received' ? scout.receivedAt : scout.sentAt

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex items-start space-x-3">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
            <span className="text-lg md:text-2xl">{scout.avatar}</span>
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
            <div className="flex space-x-2">
              <button className="flex-1 md:flex-none min-h-[44px] px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm flex items-center justify-center">
                承諾
              </button>
              <button className="flex-1 md:flex-none min-h-[44px] px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm flex items-center justify-center">
                辞退
              </button>
              <Link href={`/scout/${scout.id}`} className="flex-1 md:flex-none min-h-[44px] px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm flex items-center justify-center">
                詳細
              </Link>
            </div>
          )}
          
          {scout.status === 'accepted' && (
            <div className="flex space-x-2">
              <Link href="/messages" className="flex-1 md:flex-none min-h-[44px] px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center justify-center">
                メッセージを送る
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

ScoutCard.displayName = 'ScoutCard'

export default ScoutCard