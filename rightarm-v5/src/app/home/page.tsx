'use client'

import { Layout } from '@/components/layout/layout'
import { ProfileCard } from '@/components/profile/profile-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockCfoProfiles, mockCompanyProfiles, mockApplications, mockMeetings } from '@/lib/mock-data'
import Link from 'next/link'
import { 
  PlusIcon, 
  ChatBubbleLeftRightIcon, 
  CalendarDaysIcon,
  ChartBarIcon,
  BellIcon
} from '@heroicons/react/24/outline'

// Mock user type - in real app this would come from auth context
const CURRENT_USER_TYPE = 'company' // or 'cfo'

export default function HomePage() {
  const recommendedProfiles = CURRENT_USER_TYPE === 'company' 
    ? mockCfoProfiles.slice(0, 3)
    : mockCompanyProfiles.slice(0, 3)

  const recentApplications = mockApplications.slice(0, 3)
  const upcomingMeetings = mockMeetings.filter(m => m.status === 'scheduled').slice(0, 2)

  const stats = {
    totalApplications: mockApplications.length,
    activeConversations: 5,
    completedMeetings: 3,
    responseRate: 85
  }

  return (
    <Layout isLoggedIn userType={CURRENT_USER_TYPE}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            おかえりなさい！
          </h1>
          <p className="text-gray-600">
            {CURRENT_USER_TYPE === 'company' 
              ? '理想のCFOとの出会いを見つけましょう'
              : '新しいビジネスチャンスを探してみましょう'
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href={CURRENT_USER_TYPE === 'company' ? '/discover/cfos' : '/discover/companies'}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <PlusIcon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">
                  {CURRENT_USER_TYPE === 'company' ? 'CFO検索' : '企業検索'}
                </p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/messages">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <ChatBubbleLeftRightIcon className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium">メッセージ</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/meetings">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <CalendarDaysIcon className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-medium">面談管理</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/scout">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <BellIcon className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <p className="text-sm font-medium">スカウト</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5" />
                  活動統計
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalApplications}</div>
                    <div className="text-sm text-gray-600">
                      {CURRENT_USER_TYPE === 'company' ? '送信スカウト' : '受信スカウト'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.activeConversations}</div>
                    <div className="text-sm text-gray-600">進行中の会話</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.completedMeetings}</div>
                    <div className="text-sm text-gray-600">完了した面談</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.responseRate}%</div>
                    <div className="text-sm text-gray-600">返信率</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommended Profiles */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {CURRENT_USER_TYPE === 'company' ? 'おすすめのCFO' : 'おすすめの企業'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {recommendedProfiles.map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      variant={CURRENT_USER_TYPE === 'company' ? 'cfo' : 'company'}
                      showScoutButton={false}
                    />
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" asChild>
                    <Link href={CURRENT_USER_TYPE === 'company' ? '/discover/cfos' : '/discover/companies'}>
                      もっと見る
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Applications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">最近のスカウト</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentApplications.map((application) => (
                  <div key={application.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {application.applicationType === 'scout_company' ? 'CFOへスカウト' : '企業へ逆スカウト'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(application.createdAt).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        application.status === 'accepted' ? 'default' :
                        application.status === 'pending' ? 'secondary' : 'outline'
                      }
                      className="text-xs"
                    >
                      {
                        application.status === 'accepted' ? '承認済み' :
                        application.status === 'pending' ? '待機中' :
                        application.status === 'rejected' ? '不採用' : application.status
                      }
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/scout">すべて見る</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Meetings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">予定されている面談</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingMeetings.length > 0 ? (
                  <>
                    {upcomingMeetings.map((meeting) => (
                      <div key={meeting.id} className="p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-sm text-blue-900">
                          面談予定
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          {new Date(meeting.scheduledAt).toLocaleString('ja-JP')}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          {meeting.durationMinutes}分間
                        </p>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href="/meetings">すべて見る</Link>
                    </Button>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4">
                    予定されている面談はありません
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">💡 ヒント</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-blue-800">
                  {CURRENT_USER_TYPE === 'company' ? (
                    <>
                      <p>• プロフィールを充実させると、より多くのCFOからの注目を集められます</p>
                      <p>• スカウトメッセージは具体的な課題を書くと返信率が上がります</p>
                      <p>• 面談では事前に質問リストを準備しましょう</p>
                    </>
                  ) : (
                    <>
                      <p>• スキルタグを追加して、より多くの企業に見つけてもらいましょう</p>
                      <p>• プロフィールの経験談を充実させると信頼度が上がります</p>
                      <p>• 逆スカウトで積極的にアプローチしてみましょう</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}