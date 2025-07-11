'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

export const dynamic = 'force-dynamic'

export default function MeetingsPage() {
  const [viewType, setViewType] = useState<'list' | 'calendar'>('list')
  const [meetings, setMeetings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 面談一覧を取得
  const fetchMeetings = async () => {
    try {
      console.log('面談一覧を取得中...')
      
      // 開発環境では開発用トークンを使用
      let headers: HeadersInit = {}
      if (process.env.NODE_ENV === 'development') {
        headers = {
          'Authorization': 'Bearer development-user-token'
        }
      }
      
      const response = await fetch('/api/meetings', {
        headers
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('面談一覧:', data)
        if (data.success) {
          setMeetings(data.data)
        }
      } else {
        console.error('面談一覧の取得に失敗しました')
        setMeetings([])
      }
    } catch (error) {
      console.error('面談一覧の取得エラー:', error)
      setMeetings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeetings()
  }, [])

  // APIデータが空の場合のフォールバック用ダミーデータ
  const fallbackMeetings = meetings.length === 0 ? [
    {
      id: 'demo-1',
      with: 'デモ企業A社',
      withType: 'company',
      title: 'CFOポジション面談（デモ）',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 明日
      dateDisplay: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP'),
      time: '14:00-15:00',
      type: 'online',
      status: 'confirmed',
      description: 'デモ用の面談です。実際のデータが登録されると表示されなくなります。',
      meetingUrl: '#',
      avatar: '🏢',
      urgent: false
    }
  ] : meetings

  const displayMeetings = fallbackMeetings

  const upcomingMeetings = displayMeetings.filter(m => 
    new Date(m.date + ' ' + m.time.split('-')[0]) > new Date() && m.status !== 'completed'
  )
  
  const todayMeetings = displayMeetings.filter(m => {
    const today = new Date().toISOString().split('T')[0]
    return m.date === today && m.status !== 'completed'
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
        <AppHeader isLoggedIn={true} />
        <div className="max-w-7xl mx-auto px-2 md:px-4 lg:px-8 py-4 md:py-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">面談一覧を読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return '確定'
      case 'pending': return '調整中'
      case 'completed': return '完了'
      case 'cancelled': return 'キャンセル'
      default: return '不明'
    }
  }

  const getTypeIcon = (type: string) => {
    return type === 'online' ? '💻' : '🏢'
  }

  const getTypeText = (type: string) => {
    return type === 'online' ? 'オンライン' : '対面'
  }

  // 簡易カレンダー表示（今月）
  const renderCalendar = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // 空白の日を追加
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-20 md:h-24"></div>)
    }
    
    // 実際の日付を追加
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayMeetings = displayMeetings.filter(m => m.date === dateStr)
      const isToday = day === today.getDate()
      
      days.push(
        <div key={day} className={`h-20 md:h-24 border border-gray-200 p-1 md:p-2 ${isToday ? 'bg-blue-50' : 'bg-white'}`}>
          <div className={`text-xs md:text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="mt-1 space-y-1">
            {dayMeetings.slice(0, 2).map(meeting => (
              <div key={meeting.id} className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate">
                {meeting.time.split('-')[0]} {meeting.with.length > 10 ? meeting.with.substring(0, 10) + '...' : meeting.with}
              </div>
            ))}
            {dayMeetings.length > 2 && (
              <div className="text-xs text-gray-500">
                +{dayMeetings.length - 2} more
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="mb-4">
          <h3 className="text-lg md:text-xl font-semibold text-gray-900">
            {year}年{month + 1}月
          </h3>
        </div>
        <div className="grid grid-cols-7 gap-0">
          {['日', '月', '火', '水', '木', '金', '土'].map(day => (
            <div key={day} className="h-8 md:h-10 border border-gray-200 bg-gray-50 flex items-center justify-center">
              <span className="text-xs md:text-sm font-medium text-gray-700">{day}</span>
            </div>
          ))}
          {days}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader isLoggedIn={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 mb-6 md:mb-0">
        {/* ページタイトルと切り替えボタン */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8">
          <div className="mb-4 md:mb-0">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">面談予定</h2>
            <p className="text-gray-600 text-sm md:text-base">予定されている面談を管理できます</p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setViewType('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewType === 'list'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              リスト表示
            </button>
            <button
              onClick={() => setViewType('calendar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewType === 'calendar'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              カレンダー表示
            </button>
          </div>
        </div>

        {viewType === 'list' ? (
          <div className="space-y-6 md:space-y-8">
            {/* 今日の面談 */}
            {todayMeetings.length > 0 && (
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">今日の面談</h3>
                <div className="space-y-4">
                  {todayMeetings.map((meeting) => (
                    <div key={meeting.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                        <div className="flex-1 mb-4 md:mb-0">
                          <div className="flex items-start space-x-3">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-lg">
                              {meeting.avatar}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-1">{meeting.title}</h4>
                              <p className="text-gray-700 text-sm md:text-base mb-2">{meeting.with}</p>
                              <p className="text-gray-600 text-sm">{meeting.description}</p>
                              
                              <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-3 text-xs md:text-sm text-gray-600">
                                <span className="flex items-center">
                                  📅 {meeting.dateDisplay}
                                </span>
                                <span className="flex items-center">
                                  🕐 {meeting.time}
                                </span>
                                <span className="flex items-center">
                                  {getTypeIcon(meeting.type)} {getTypeText(meeting.type)}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(meeting.status)}`}>
                                  {getStatusText(meeting.status)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          {meeting.meetingUrl && (
                            <a 
                              href={meeting.meetingUrl}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                            >
                              参加
                            </a>
                          )}
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                            詳細
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 今後の面談 */}
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">今後の面談</h3>
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                      <div className="flex-1 mb-4 md:mb-0">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                            {meeting.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-base md:text-lg font-semibold text-gray-900">{meeting.title}</h4>
                              {meeting.urgent && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                  🔥 緊急
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 text-sm md:text-base mb-2">{meeting.with}</p>
                            <p className="text-gray-600 text-sm">{meeting.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-3 text-xs md:text-sm text-gray-600">
                              <span className="flex items-center">
                                📅 {meeting.dateDisplay}
                              </span>
                              <span className="flex items-center">
                                🕐 {meeting.time}
                              </span>
                              <span className="flex items-center">
                                {getTypeIcon(meeting.type)} {getTypeText(meeting.type)}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(meeting.status)}`}>
                                {getStatusText(meeting.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">
                          変更
                        </button>
                        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-800 transition-colors">
                          詳細
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 完了した面談 */}
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">完了した面談</h3>
              <div className="space-y-4">
                {displayMeetings.filter(m => m.status === 'completed').map((meeting) => (
                  <div key={meeting.id} className="bg-gray-50 rounded-lg border border-gray-200 p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                      <div className="flex-1">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg opacity-60">
                            {meeting.avatar}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base md:text-lg font-semibold text-gray-700 mb-1">{meeting.title}</h4>
                            <p className="text-gray-600 text-sm md:text-base mb-2">{meeting.with}</p>
                            <p className="text-gray-500 text-sm">{meeting.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-3 text-xs md:text-sm text-gray-500">
                              <span className="flex items-center">
                                📅 {meeting.dateDisplay}
                              </span>
                              <span className="flex items-center">
                                🕐 {meeting.time}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(meeting.status)}`}>
                                {getStatusText(meeting.status)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          renderCalendar()
        )}
      </div>
    </div>
  )
}