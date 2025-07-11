'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import AppHeader from '@/components/AppHeader'
import FileUpload from '@/components/FileUpload'

export const dynamic = 'force-dynamic'

// 空の初期データ - 実際のユーザー情報で上書きされる
const EMPTY_FORM_DATA = {
  name: '',
  email: '',
  phone: '',
  company: '',
  position: '',
  bio: '',
  skills: [] as string[],
  experience: '',
  workStyle: '',
  compensation: '',
  location: '',
  availability: ''
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const user = session?.user
  const isAuthenticated = !!session?.user
  const isLoading = status === 'loading'
  const [formData, setFormData] = useState(EMPTY_FORM_DATA)
  const [isEditing, setIsEditing] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [userDataLoaded, setUserDataLoaded] = useState(false)
  
  // マスターデータの状態管理
  const [availableSkills, setAvailableSkills] = useState<string[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [workStyles, setWorkStyles] = useState<any[]>([])
  const [experienceLevels, setExperienceLevels] = useState<string[]>([])
  const [availabilityOptions, setAvailabilityOptions] = useState<string[]>([])
  const [masterDataLoading, setMasterDataLoading] = useState(true)

  // ユーザー情報を初期化
  useEffect(() => {
    if (user && !userDataLoaded) {
      setFormData({
        name: user.name || user.email?.split('@')[0] || '',
        email: user.email || '',
        phone: '',
        company: '',
        position: '',
        bio: '',
        skills: [],
        experience: '',
        workStyle: '',
        compensation: '',
        location: '',
        availability: ''
      })
      setProfileImageUrl(null)
      setUserDataLoaded(true)
    }
  }, [user, userDataLoaded])

  // マスターデータ取得
  const fetchMasterData = async () => {
    try {
      setMasterDataLoading(true)
      
      // 並列でマスターデータを取得
      const [skillsRes, regionsRes, workStylesRes] = await Promise.all([
        fetch('/api/master/skills?category=finance'),
        fetch('/api/master/regions?popular=true'), 
        fetch('/api/master/work-styles?popular=true')
      ])

      if (skillsRes.ok) {
        const skillsData = await skillsRes.json()
        if (skillsData.success) {
          // スキル名を抽出
          const skills = skillsData.data.skills?.map((skill: any) => skill.name) || []
          setAvailableSkills(skills)
        }
      }

      if (regionsRes.ok) {
        const regionsData = await regionsRes.json()
        if (regionsData.success) {
          setLocations(regionsData.data.regions || [])
        }
      }

      if (workStylesRes.ok) {
        const workStylesData = await workStylesRes.json()
        if (workStylesData.success) {
          setWorkStyles(workStylesData.data.workStyles || [])
        }
      }

      // 固定オプション（将来的にはマスターデータ化）
      setExperienceLevels(['3年未満', '3-5年', '5-10年', '10-15年', '15年以上'])
      setAvailabilityOptions(['即座に対応可能', '1ヶ月後', '2-3ヶ月後', '半年後', '相談により調整可能'])

    } catch (error) {
      console.error('Master data fetch error:', error)
    } finally {
      setMasterDataLoading(false)
    }
  }

  useEffect(() => {
    // マスターデータを取得
    fetchMasterData()
  }, [])

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSkillToggle = useCallback((skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s: string) => s !== skill)
        : [...prev.skills, skill]
    }))
  }, [])

  const handleProfileImageUpload = useCallback((url: string, filePath: string) => {
    setProfileImageUrl(url)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }, [])

  const handleUploadError = useCallback((error: string) => {
    setError(error)
  }, [])

  const handleSave = useCallback(async () => {
    try {
      setIsSaving(true)
      setError('')

      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          displayName: formData.name,
          phoneNumber: formData.phone,
          company: formData.company,
          position: formData.position,
          region: formData.location,
          bio: formData.bio,
          skills: formData.skills,
          experience: formData.experience,
          workPreference: formData.workStyle,
          compensationRange: formData.compensation,
          availability: formData.availability,
          profileImageUrl: profileImageUrl // 画像URLを追加
        })
      })

      const data = await response.json()

      if (data.success) {
        setIsEditing(false)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
        // セッション情報は自動更新されるため手動更新不要
      } else {
        setError(data.error || 'プロフィールの更新に失敗しました')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      setError('ネットワークエラーが発生しました')
    } finally {
      setIsSaving(false)
    }
  }, [formData])

  // 認証確認
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">ユーザー情報を読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">認証が必要です</h2>
          <p className="text-gray-600 mb-4">プロフィール編集にはログインが必要です</p>
          <Link href="/auth/login" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            ログインページへ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 mb-6 md:mb-0">
        {/* ページタイトル */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">プロフィール編集</h2>
          <p className="text-gray-600 text-sm md:text-base">あなたの情報を管理・編集できます</p>
          
          {/* デバッグ情報 - 開発時のみ表示 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
              <details>
                <summary className="cursor-pointer text-yellow-800 font-medium">デバッグ情報 (開発時のみ)</summary>
                <div className="mt-2 space-y-1 text-yellow-700">
                  <p><strong>ユーザーID:</strong> {user?.id || 'なし'}</p>
                  <p><strong>ユーザータイプ:</strong> {user?.userType || 'なし'}</p>
                  <p><strong>メールアドレス:</strong> {user?.email || 'なし'}</p>
                  <p><strong>プロフィール名:</strong> {user?.name || 'なし'}</p>
                  <p><strong>データロード状態:</strong> {userDataLoaded ? '完了' : '未完了'}</p>
                  <p><strong>認証状態:</strong> {isAuthenticated ? '認証済み' : '未認証'}</p>
                </div>
              </details>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* プロフィール画像エリア */}
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 md:p-8 text-center">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
              {profileImageUrl ? (
                <Image 
                  src={profileImageUrl} 
                  alt="プロフィール画像" 
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  unoptimized={true}
                />
              ) : (
                <span className="text-3xl md:text-4xl">👤</span>
              )}
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
              {formData.name || '名前未設定'}
            </h3>
            <p className="text-gray-600">
              {formData.position && formData.company ? 
                `${formData.position} at ${formData.company}` : 
                user.userType === 'cfo' ? 'CFO' : '企業ユーザー'
              }
            </p>
            {isEditing && user && (
              <div className="mt-4 max-w-xs mx-auto">
                <FileUpload
                  fileType="PROFILE_IMAGE"
                  userId={user.id}
                  onUploadSuccess={handleProfileImageUpload}
                  onUploadError={handleUploadError}
                  currentFileUrl={profileImageUrl || undefined}
                  className="text-sm"
                />
              </div>
            )}
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* プロフィール未完成の警告 */}
          {userDataLoaded && !formData.name && !isEditing && (
            <div className="mx-6 mt-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-start space-x-2">
                <span className="text-blue-500">ℹ️</span>
                <div>
                  <p className="font-medium">プロフィールを完成させましょう</p>
                  <p className="mt-1">プロフィール情報を入力して、より良いマッチングを実現しましょう。</p>
                </div>
              </div>
            </div>
          )}

          {/* 編集ボタン */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-end">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm"
              >
                編集する
              </button>
            ) : (
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    setIsEditing(false)
                    setError('')
                  }}
                  disabled={isSaving}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm disabled:opacity-50"
                >
                  キャンセル
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm disabled:opacity-50"
                >
                  {isSaving ? '保存中...' : '保存'}
                </button>
              </div>
            )}
          </div>

          {/* 基本情報 */}
          <div className="p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h4>
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">氏名</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.name || '未設定'}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.email || '未設定'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">電話番号</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.phone || '未設定'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">現在の会社</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.company || '未設定'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">役職</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  />
                ) : (
                  <p className="text-gray-900">{formData.position || '未設定'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">所在地</label>
                {isEditing ? (
                  <select
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                    disabled={masterDataLoading}
                  >
                    <option value="">選択してください</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.name}>{location.name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{formData.location || '未設定'}</p>
                )}
              </div>
            </div>

            {/* 自己紹介 */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">自己紹介</label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 resize-none"
                  placeholder="あなたの経験やスキルについて教えてください..."
                />
              ) : (
                <p className="text-gray-900">{formData.bio || '未設定'}</p>
              )}
            </div>
          </div>

          {/* 専門スキル */}
          <div className="p-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">専門スキル</h4>
            {isEditing ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-3">該当するスキルを選択してください</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableSkills.map((skill) => (
                    <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.skills.includes(skill)}
                        onChange={() => handleSkillToggle(skill)}
                        className="rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                      />
                      <span className="text-sm text-gray-700">{skill}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {formData.skills.length > 0 ? (
                  formData.skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-full">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500 italic">スキルが未設定です</p>
                )}
              </div>
            )}
          </div>

          {/* 勤務条件 */}
          <div className="p-6 border-t border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">勤務条件</h4>
            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">経験年数</label>
                {isEditing ? (
                  <select
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                    disabled={masterDataLoading}
                  >
                    <option value="">選択してください</option>
                    {experienceLevels.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{formData.experience || '未設定'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">稼働形態</label>
                {isEditing ? (
                  <select
                    value={formData.workStyle}
                    onChange={(e) => handleInputChange('workStyle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                    disabled={masterDataLoading}
                  >
                    <option value="">選択してください</option>
                    {workStyles.map((style) => (
                      <option key={style.id} value={style.name}>{style.name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{formData.workStyle || '未設定'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">希望報酬</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.compensation}
                    onChange={(e) => handleInputChange('compensation', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                    placeholder="例：月80万円〜"
                  />
                ) : (
                  <p className="text-gray-900">{formData.compensation || '未設定'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">対応可能時期</label>
                {isEditing ? (
                  <select
                    value={formData.availability}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                    disabled={masterDataLoading}
                  >
                    <option value="">選択してください</option>
                    {availabilityOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-900">{formData.availability || '未設定'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast通知 */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          プロフィールが更新されました ✓
        </div>
      )}
    </div>
  )
}