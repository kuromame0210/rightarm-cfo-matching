'use client'

import { useState } from 'react'
import { Layout } from '@/components/layout/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockApplications, mockCfoProfiles, mockCompanyProfiles, mockUsers } from '@/lib/mock-data'
import { ApplicationType, ApplicationStatus } from '@/types'
import { 
  InboxIcon, 
  PaperAirplaneIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

// Mock current user
const CURRENT_USER_ID = 'user-company-1'
const CURRENT_USER_TYPE = 'company' // This would come from auth context

export default function ScoutPage() {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')

  // Filter applications based on current user
  const receivedApplications = mockApplications.filter(app => {
    if (CURRENT_USER_TYPE === 'company') {
      return app.applicationType === 'scout_cfo' // CFOs scouting this company
    } else {
      return app.applicationType === 'scout_company' // Companies scouting this CFO
    }
  })

  const sentApplications = mockApplications.filter(app => {
    if (CURRENT_USER_TYPE === 'company') {
      return app.applicationType === 'scout_company' // This company scouting CFOs
    } else {
      return app.applicationType === 'scout_cfo' // This CFO scouting companies
    }
  })

  const getProfileInfo = (application: any) => {
    if (CURRENT_USER_TYPE === 'company') {
      // For company user, get CFO info
      const cfoProfile = mockCfoProfiles.find(p => p.id === application.cfoId)
      const user = mockUsers.find(u => u.id === cfoProfile?.userId)
      return { profile: cfoProfile, user, type: 'cfo' }
    } else {
      // For CFO user, get company info
      const companyProfile = mockCompanyProfiles.find(p => p.id === application.companyId)
      const user = mockUsers.find(u => u.id === companyProfile?.userId)
      return { profile: companyProfile, user, type: 'company' }
    }
  }

  const getStatusBadge = (status: ApplicationStatus) => {
    const variants = {
      pending: { variant: 'secondary' as const, text: '確認中', color: 'bg-yellow-100 text-yellow-800' },
      accepted: { variant: 'default' as const, text: '承認済み', color: 'bg-green-100 text-green-800' },
      interviewed: { variant: 'default' as const, text: '面談済み', color: 'bg-blue-100 text-blue-800' },
      rejected: { variant: 'destructive' as const, text: '辞退', color: 'bg-red-100 text-red-800' },
      withdrawn: { variant: 'outline' as const, text: '取下げ', color: 'bg-gray-100 text-gray-800' }
    }
    return variants[status]
  }

  const handleResponse = (applicationId: string, response: 'accept' | 'reject') => {
    // In a real app, this would call an API
    console.log(`${response} application ${applicationId}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes}分前`
    } else if (diffHours < 24) {
      return `${diffHours}時間前`
    } else {
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays}日前`
    }
  }

  const currentApplications = activeTab === 'received' ? receivedApplications : sentApplications

  return (
    <Layout isLoggedIn userType={CURRENT_USER_TYPE}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">スカウト</h1>
          <p className="text-gray-600">
            {CURRENT_USER_TYPE === 'company' 
              ? 'CFOからのスカウトを確認し、送信したスカウトの状況を管理できます'
              : '企業からのスカウトを確認し、送信したスカウトの状況を管理できます'
            }
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'received'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <InboxIcon className="h-4 w-4" />
            受信 ({receivedApplications.length})
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'sent'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <PaperAirplaneIcon className="h-4 w-4" />
            送信 ({sentApplications.length})
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {currentApplications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'received' ? (
                    <InboxIcon className="h-8 w-8 text-gray-400" />
                  ) : (
                    <PaperAirplaneIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'received' 
                    ? 'まだスカウトを受信していません' 
                    : 'まだスカウトを送信していません'
                  }
                </h3>
                <p className="text-gray-500 mb-4">
                  {activeTab === 'received' 
                    ? 'プロフィールを充実させて、スカウトを受け取りやすくしましょう'
                    : '気になる相手を見つけてスカウトを送信してみましょう'
                  }
                </p>
                {activeTab === 'sent' && (
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    {CURRENT_USER_TYPE === 'company' ? 'CFOを探す' : '企業を探す'}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            currentApplications.map((application) => {
              const { profile, user, type } = getProfileInfo(application)
              const statusInfo = getStatusBadge(application.status)

              if (!profile || !user) return null

              const isReceived = activeTab === 'received'
              const canRespond = isReceived && application.status === 'pending'

              return (
                <Card key={application.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Avatar */}
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-semibold text-gray-600">
                            {type === 'cfo' 
                              ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`
                              : profile.companyName?.[0] || ''
                            }
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {type === 'cfo' 
                                ? `${profile.firstName || ''} ${profile.lastName || ''}`
                                : profile.companyName || ''
                              }
                            </h3>
                            <Badge className={statusInfo.color}>
                              {statusInfo.text}
                            </Badge>
                            {application.status === 'pending' && isReceived && (
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                🔥 新着
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 mb-3">
                            {type === 'cfo' ? 'CFO' : '企業'} • {formatDate(application.createdAt)}
                          </p>

                          {application.coverMessage && (
                            <div className="bg-gray-50 p-3 rounded-lg mb-4">
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {application.coverMessage}
                              </p>
                            </div>
                          )}

                          {/* Profile Summary */}
                          <div className="text-sm text-gray-600">
                            {type === 'cfo' ? (
                              <div className="flex items-center gap-4">
                                <span>経験: {profile.yearsExperience || 0}年</span>
                                <span>
                                  レート: ¥{profile.hourlyRateMin?.toLocaleString() || 0}-{profile.hourlyRateMax?.toLocaleString() || 0}/時
                                </span>
                                <span>{profile.locationPrefecture || ''}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-4">
                                <span>{profile.industry || ''}</span>
                                <span>{profile.companySize || ''}</span>
                                <span>{profile.locationPrefecture || ''}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 ml-4">
                        {canRespond ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleResponse(application.id, 'accept')}
                              className="bg-orange-500 hover:bg-orange-600 text-white"
                            >
                              <CheckIcon className="h-4 w-4 mr-1" />
                              承認
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResponse(application.id, 'reject')}
                            >
                              <XMarkIcon className="h-4 w-4 mr-1" />
                              辞退
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            詳細
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>

        {/* Stats Summary */}
        {currentApplications.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">
                {activeTab === 'received' ? '受信統計' : '送信統計'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {currentApplications.filter(app => app.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">確認中</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {currentApplications.filter(app => app.status === 'accepted').length}
                  </div>
                  <div className="text-sm text-gray-600">承認済み</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {currentApplications.filter(app => app.status === 'interviewed').length}
                  </div>
                  <div className="text-sm text-gray-600">面談済み</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {currentApplications.length > 0 
                      ? Math.round((currentApplications.filter(app => app.status === 'accepted').length / currentApplications.length) * 100)
                      : 0
                    }%
                  </div>
                  <div className="text-sm text-gray-600">承認率</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}