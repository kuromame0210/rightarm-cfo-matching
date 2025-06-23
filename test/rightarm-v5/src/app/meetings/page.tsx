'use client'

import { useState } from 'react'
import { Layout } from '@/components/layout/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockMeetings, mockUsers, mockCfoProfiles, mockCompanyProfiles } from '@/lib/mock-data'
import { MeetingStatus } from '@/types'
import { 
  CalendarDaysIcon,
  ClockIcon,
  VideoCameraIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

// Mock current user
const CURRENT_USER_ID = 'user-company-1'
const CURRENT_USER_TYPE = 'company'

export default function MeetingsPage() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])

  // Filter meetings for current user
  const userMeetings = mockMeetings.filter(meeting => 
    meeting.organizerId === CURRENT_USER_ID || meeting.participantId === CURRENT_USER_ID
  )

  const upcomingMeetings = userMeetings.filter(meeting => 
    meeting.status === 'scheduled' && new Date(meeting.scheduledAt) > new Date()
  ).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  const pastMeetings = userMeetings.filter(meeting => 
    meeting.status === 'completed' || new Date(meeting.scheduledAt) < new Date()
  ).sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())

  const getOtherParticipant = (meeting: any) => {
    const otherUserId = meeting.organizerId === CURRENT_USER_ID 
      ? meeting.participantId 
      : meeting.organizerId

    const user = mockUsers.find(u => u.id === otherUserId)
    if (!user) return null

    if (user.userType === 'cfo') {
      const profile = mockCfoProfiles.find(p => p.userId === user.id)
      return { ...user, profile, type: 'cfo' }
    } else {
      const profile = mockCompanyProfiles.find(p => p.userId === user.id)
      return { ...user, profile, type: 'company' }
    }
  }

  const getStatusBadge = (status: MeetingStatus, scheduledAt: string) => {
    const meetingDate = new Date(scheduledAt)
    const now = new Date()
    
    if (status === 'completed') {
      return { variant: 'default' as const, text: '完了', color: 'bg-green-100 text-green-800' }
    } else if (status === 'cancelled') {
      return { variant: 'destructive' as const, text: 'キャンセル', color: 'bg-red-100 text-red-800' }
    } else if (meetingDate < now) {
      return { variant: 'secondary' as const, text: '未完了', color: 'bg-yellow-100 text-yellow-800' }
    } else {
      const timeDiff = meetingDate.getTime() - now.getTime()
      const hoursUntil = Math.floor(timeDiff / (1000 * 60 * 60))
      
      if (hoursUntil <= 2) {
        return { variant: 'default' as const, text: '間もなく開始', color: 'bg-orange-100 text-orange-800' }
      } else {
        return { variant: 'outline' as const, text: '予定', color: 'bg-blue-100 text-blue-800' }
      }
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('ja-JP', { 
        month: 'short', 
        day: 'numeric',
        weekday: 'short'
      }),
      time: date.toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  const handleMeetingAction = (meetingId: string, action: 'complete' | 'cancel' | 'reschedule') => {
    // In a real app, this would call an API
    console.log(`${action} meeting ${meetingId}`)
  }

  return (
    <Layout isLoggedIn userType={CURRENT_USER_TYPE}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">面談管理</h1>
            <p className="text-gray-600">
              予定されている面談と過去の面談履歴を管理できます
            </p>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600">
            <PlusIcon className="h-4 w-4 mr-2" />
            新しい面談を設定
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upcoming Meetings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Meetings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDaysIcon className="h-5 w-5" />
                  予定されている面談 ({upcomingMeetings.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingMeetings.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarDaysIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      予定されている面談はありません
                    </h3>
                    <p className="text-gray-500 mb-4">
                      新しい面談を設定して、候補者との関係を深めましょう
                    </p>
                  </div>
                ) : (
                  upcomingMeetings.map((meeting) => {
                    const otherParticipant = getOtherParticipant(meeting)
                    const statusInfo = getStatusBadge(meeting.status, meeting.scheduledAt)
                    const dateTime = formatDateTime(meeting.scheduledAt)

                    if (!otherParticipant) return null

                    return (
                      <div key={meeting.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            {/* Avatar */}
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-lg font-semibold text-gray-600">
                                {otherParticipant.type === 'cfo' 
                                  ? `${otherParticipant.profile?.firstName?.[0] || ''}${otherParticipant.profile?.lastName?.[0] || ''}`
                                  : otherParticipant.profile?.companyName?.[0] || ''
                                }
                              </span>
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900">
                                  {otherParticipant.type === 'cfo' 
                                    ? `${otherParticipant.profile?.firstName || ''} ${otherParticipant.profile?.lastName || ''}`
                                    : otherParticipant.profile?.companyName || ''
                                  }
                                </h3>
                                <Badge className={statusInfo.color}>
                                  {statusInfo.text}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-1">
                                  <CalendarDaysIcon className="h-4 w-4" />
                                  <span>{dateTime.date}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <ClockIcon className="h-4 w-4" />
                                  <span>{dateTime.time} ({meeting.durationMinutes}分)</span>
                                </div>
                              </div>

                              {meeting.meetingUrl && (
                                <div className="flex items-center gap-2 text-sm">
                                  <VideoCameraIcon className="h-4 w-4 text-blue-500" />
                                  <a 
                                    href={meeting.meetingUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:text-blue-700 underline"
                                  >
                                    ミーティングに参加
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2 ml-4">
                            <Button
                              size="sm"
                              onClick={() => handleMeetingAction(meeting.id, 'complete')}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <CheckIcon className="h-4 w-4 mr-1" />
                              完了
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMeetingAction(meeting.id, 'reschedule')}
                            >
                              再調整
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMeetingAction(meeting.id, 'cancel')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XMarkIcon className="h-4 w-4 mr-1" />
                              キャンセル
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>

            {/* Past Meetings */}
            <Card>
              <CardHeader>
                <CardTitle>過去の面談履歴 ({pastMeetings.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pastMeetings.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500">過去の面談履歴がありません</p>
                  </div>
                ) : (
                  pastMeetings.slice(0, 5).map((meeting) => {
                    const otherParticipant = getOtherParticipant(meeting)
                    const statusInfo = getStatusBadge(meeting.status, meeting.scheduledAt)
                    const dateTime = formatDateTime(meeting.scheduledAt)

                    if (!otherParticipant) return null

                    return (
                      <div key={meeting.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-gray-600">
                              {otherParticipant.type === 'cfo' 
                                ? `${otherParticipant.profile?.firstName?.[0] || ''}${otherParticipant.profile?.lastName?.[0] || ''}`
                                : otherParticipant.profile?.companyName?.[0] || ''
                              }
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {otherParticipant.type === 'cfo' 
                                ? `${otherParticipant.profile?.firstName || ''} ${otherParticipant.profile?.lastName || ''}`
                                : otherParticipant.profile?.companyName || ''
                              }
                            </p>
                            <p className="text-sm text-gray-500">
                              {dateTime.date} {dateTime.time}
                            </p>
                          </div>
                        </div>
                        <Badge className={statusInfo.color}>
                          {statusInfo.text}
                        </Badge>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats & Calendar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>面談統計</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {upcomingMeetings.length}
                    </div>
                    <div className="text-sm text-gray-600">予定された面談</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {pastMeetings.filter(m => m.status === 'completed').length}
                    </div>
                    <div className="text-sm text-gray-600">完了した面談</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {pastMeetings.length > 0 
                        ? Math.round((pastMeetings.filter(m => m.status === 'completed').length / pastMeetings.length) * 100)
                        : 0
                      }%
                    </div>
                    <div className="text-sm text-gray-600">完了率</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>クイックアクション</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  新しい面談を設定
                </Button>
                <Button variant="outline" className="w-full">
                  <CalendarDaysIcon className="h-4 w-4 mr-2" />
                  カレンダーで確認
                </Button>
                <Button variant="outline" className="w-full">
                  設定・通知
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">💡 面談のコツ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>• 事前に質問リストを準備しましょう</p>
                  <p>• 互いの期待値を明確にしましょう</p>
                  <p>• 具体的な案件について話し合いましょう</p>
                  <p>• 次のステップを明確にしましょう</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}