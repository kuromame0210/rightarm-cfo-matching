'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppHeader from '@/components/AppHeader'

export const dynamic = 'force-dynamic'

export default function InterestedPage() {
  const [interestedProfiles, setInterestedProfiles] = useState<string[]>([])
  const [profileDetails, setProfileDetails] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // APIから気になるリストを取得
  const fetchInterestedProfiles = async () => {
    try {
      console.log('気になるリストをAPIから取得中...')
      const response = await fetch('/api/interests', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer development-user-token'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('API気になるリスト:', data)
        if (data.success) {
          const profileIds = data.data.likes.map((item: any) => item.targetId)
          setInterestedProfiles(profileIds)
          console.log('API気になるリスト設定完了:', profileIds)
          return profileIds
        }
      } else {
        // APIが失敗した場合はローカルストレージからフォールバック
        console.log('APIが失敗、ローカルストレージからフォールバック')
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('interested_profiles')
          if (stored) {
            const profileIds = JSON.parse(stored)
            setInterestedProfiles(profileIds)
            console.log('ローカルストレージから取得:', profileIds)
            return profileIds
          }
        }
      }
      return []
    } catch (error) {
      console.error('気になるリストの取得エラー:', error)
      // エラーが発生した場合はローカルストレージからフォールバック
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('interested_profiles')
        if (stored) {
          const profileIds = JSON.parse(stored)
          setInterestedProfiles(profileIds)
          console.log('エラー時ローカルストレージから取得:', profileIds)
          return profileIds
        }
      }
      return []
    }
  }

  // プロフィール詳細を取得
  const fetchProfileDetails = async (profileIds: string[]) => {
    if (profileIds.length === 0) {
      setProfileDetails([])
      return
    }

    try {
      // CFO一覧から気になるプロフィールを取得
      const cfoResponse = await fetch('/api/cfos', {
        headers: {
          'Authorization': 'Bearer development-user-token'
        }
      })
      const cfoData = await cfoResponse.json()
      
      // 企業一覧から気になるプロフィールを取得
      const companyResponse = await fetch('/api/companies', {
        headers: {
          'Authorization': 'Bearer development-user-token'
        }
      })
      const companyData = await companyResponse.json()

      const allProfiles = [
        ...(cfoData.success ? cfoData.data.map((cfo: any) => ({ ...cfo, type: 'cfo' })) : []),
        ...(companyData.success ? companyData.data.map((company: any) => ({ ...company, type: 'company' })) : [])
      ]

      const matchedProfiles = allProfiles.filter(profile => 
        profileIds.includes(profile.id)
      )

      console.log('マッチしたプロフィール:', matchedProfiles)
      setProfileDetails(matchedProfiles)
    } catch (error) {
      console.error('プロフィール詳細取得エラー:', error)
    }
  }

  // 気になるを削除
  const removeInterested = async (profileId: string) => {
    try {
      console.log('気になるを削除中:', profileId)
      
      // APIで削除
      const response = await fetch(`/api/interests?targetUserId=${profileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer development-user-token'
        }
      })
      
      if (response.ok) {
        const newList = interestedProfiles.filter(id => id !== profileId)
        setInterestedProfiles(newList)
        
        // ローカルストレージも更新（フォールバック）
        if (typeof window !== 'undefined') {
          localStorage.setItem('interested_profiles', JSON.stringify(newList))
        }
        
        // 表示リストも更新
        setProfileDetails(prev => prev.filter(profile => profile.id !== profileId))
        console.log('削除完了:', profileId)
      } else {
        throw new Error('削除に失敗しました')
      }
    } catch (error) {
      console.error('気になる削除エラー:', error)
      alert('削除に失敗しました。もう一度お試しください。')
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const profileIds = await fetchInterestedProfiles()
      await fetchProfileDetails(profileIds)
      setLoading(false)
    }
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-24">
      <AppHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/home" className="text-blue-600 hover:text-blue-800 text-sm">
              ← ホームに戻る
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">❤️ 気になるリスト</h1>
          <p className="text-gray-600">
            {interestedProfiles.length}件の気になるプロフィール
          </p>
        </div>

        {/* デバッグ情報 */}
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">デバッグ情報:</h3>
          <p className="text-xs text-yellow-700">
            ローカルストレージのID: {JSON.stringify(interestedProfiles)}
          </p>
          <p className="text-xs text-yellow-700">
            マッチしたプロフィール数: {profileDetails.length}
          </p>
        </div>

        {/* ローディング */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">データを読み込み中...</p>
          </div>
        )}

        {/* 気になるリスト */}
        {!loading && (
          <div className="space-y-4 mb-8 md:mb-20">
            {profileDetails.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💔</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">気になるプロフィールがありません</h3>
                <p className="text-gray-600 mb-4">
                  気になるプロフィールを見つけて「気になる」ボタンを押してみましょう。
                </p>
                <Link 
                  href="/home"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  プロフィールを探す
                </Link>
              </div>
            ) : (
              profileDetails.map((profile) => (
                <div key={profile.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-lg">
                            {profile.type === 'cfo' ? '👨‍💼' : '🏢'}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {profile.name || profile.companyName || 'プロフィール'}
                          </h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            profile.type === 'cfo' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {profile.type === 'cfo' ? 'CFO' : '企業'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        {profile.type === 'cfo' ? (
                          <div>
                            <p className="text-gray-600 text-sm mb-2">{profile.introduction}</p>
                            <div className="flex flex-wrap gap-1">
                              {(profile.skills || []).map((skill: string) => (
                                <span key={skill} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-gray-600 text-sm mb-2">{profile.description}</p>
                            <div className="flex flex-wrap gap-1">
                              {(profile.challenges || []).map((challenge: string) => (
                                <span key={challenge} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded">
                                  {challenge}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3 md:mt-0 flex-wrap">
                      <Link
                        href={profile.type === 'cfo' ? `/cfo/${profile.id}` : `/company/${profile.id}`}
                        className="px-3 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 text-sm"
                      >
                        詳細を見る
                      </Link>
                      <Link
                        href={`/messages?user=${profile.id}`}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        💬 メッセージ
                      </Link>
                      <button
                        onClick={() => removeInterested(profile.id)}
                        className="px-3 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}