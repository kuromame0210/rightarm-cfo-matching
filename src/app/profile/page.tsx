'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useProfile, useMasterData } from '@/hooks/useProfile'
import AppHeader from '@/components/AppHeader'
import FileUpload from '@/components/FileUpload'

export const dynamic = 'force-dynamic'

// CFOプロフィール用フォームデータ - cfo_data.mdの項目に準拠
const EMPTY_FORM_DATA = {
  // 基本情報
  name: '',
  email: '',
  location: '',
  weeklyAvailability: '',
  // 詳細情報
  career: '',
  skills: [] as string[],
  possibleTasksDetail: '', // 追加: 詳細な業務内容・得意分野
  certifications: [] as string[],
  compensation: '', // 想定報酬（テキスト形式）
  availableAreas: [] as string[],
  introduction: '',
  // 会社情報の4項目（企業ユーザー用）
  companyName: '',
  companyDescription: '',
  revenueRange: '',
  financialChallenges: ''
}

export default function ProfilePage() {
  // 統一フック使用
  const { user, isAuthenticated, isLoading } = useAuth()
  const { data: session } = useSession() // デバッグ用に残す
  const { profile, loading: profileLoading, updateProfile } = useProfile()
  const { availableSkills, locations, workStyles, loading: masterDataLoading } = useMasterData()
  
  // ローカル状態管理（簡略化）
  const [formData, setFormData] = useState(EMPTY_FORM_DATA)
  const [isEditing, setIsEditing] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  

  // 推定年商の選択肢（データベース制約に準拠）
  const [revenueOptions] = useState([
    { value: 'under_100m', label: '1億円未満' },
    { value: '100m_1b', label: '1〜10億円' },
    { value: '1b_10b', label: '10〜30億円' },
    { value: '10b_30b', label: '30〜50億円' },
    { value: 'over_50b', label: '50億円以上' },
    { value: 'private', label: '非公開' }
  ])

  // 年商のvalueからlabelに変換するヘルパー関数
  const getRevenueLabel = (value: string) => {
    const option = revenueOptions.find(opt => opt.value === value)
    return option ? option.label : value // 見つからない場合は元の値を返す（後方互換性）
  }

  // プロフィールデータ初期化（cfo_data.md項目に準拠）
  useEffect(() => {
    if (profile && !profileLoading && user) {
      if (user.userType === 'cfo') {
        const newFormData = {
          // 基本情報
          name: profile.name || user?.name || user?.email?.split('@')[0] || '',
          email: profile.email || user?.email || '',
          location: profile.location || '',
          weeklyAvailability: profile.availability || '',
          // 詳細情報
          career: (() => {
            if (!profile.rawProfile) return '';
            
            // 文字列の場合はそのまま返す
            if (typeof profile.rawProfile === 'string') {
              return profile.rawProfile;
            }
            
            // オブジェクトの場合はexperienceフィールドを取得
            if (typeof profile.rawProfile === 'object' && (profile.rawProfile as any).experience) {
              return (profile.rawProfile as any).experience;
            }
            
            // その他の場合は空文字列
            return '';
          })(),
          skills: profile.skills || [],
          possibleTasksDetail: (profile as any).possibleTasks || '', // 新カラムから取得
          certifications: profile.certifications ? 
            (typeof profile.certifications === 'string' ? (profile.certifications as string).split('\n').filter((c: string) => c.trim()) : profile.certifications) : 
            [],
          compensation: profile.compensation || '', // 想定報酬（テキスト形式）
          availableAreas: (profile as any).workingAreas ? (profile as any).workingAreas.split('\n').filter((a: string) => a.trim()) : [],
          introduction: profile.introduction || '',
          // 企業情報（使用しない）
          companyName: '',
          companyDescription: '',
          revenueRange: '',
          financialChallenges: ''
        }
        setFormData(newFormData)
      } else {
        // 企業ユーザー用の初期化
        let rawProfileData = null;
        
        // rawProfileのJSONデータをパース
        if (profile.rawProfile) {
          try {
            if (typeof profile.rawProfile === 'string') {
              rawProfileData = JSON.parse(profile.rawProfile);
            } else if (typeof profile.rawProfile === 'object') {
              rawProfileData = profile.rawProfile;
            }
          } catch (error) {
            console.error('❌ rawProfile JSON解析エラー:', error);
          }
        }
        
        const newFormData = {
          name: profile.name || user?.name || user?.email?.split('@')[0] || '',
          email: profile.email || user?.email || '',
          location: '',
          weeklyAvailability: '',
          career: '',
          skills: [],
          possibleTasksDetail: '',
          certifications: [],
          compensation: '',
          monthlyFeeMin: '',
          monthlyFeeMax: '',
          availableAreas: [],
          introduction: '',
          companyName: profile.companyName || profile.company || (rawProfileData?.businessName || rawProfileData?.displayName) || '',
          companyDescription: rawProfileData?.description || 
            (rawProfileData && !rawProfileData.description ? '' : profile.description) || '',
          revenueRange: rawProfileData?.revenueRange || profile.revenueRange || '',
          financialChallenges: rawProfileData?.financialChallengesDetail || profile.challengeBackground || ''
        }
        setFormData(newFormData)
      }
      setProfileImageUrl(profile.profileImageUrl || null)
    }
  }, [profile, profileLoading, user])

  // マスターデータ取得は useMasterData フックで統一処理

  const handleInputChange = useCallback((field: string, value: string) => {
    console.log(`📝 INPUT CHANGE: ${field} = "${value}"`)
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      console.log('📋 更新後のフォームデータ:', newData)
      return newData
    })
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

      console.log('🚀 === PROFILE SAVE: 保存ボタン押下 ===')
      console.log('📋 現在のフォームデータ:', JSON.stringify(formData, null, 2))
      console.log('🖼️ プロフィール画像URL:', profileImageUrl)
      console.log('👤 ユーザー情報:', user)
      console.log('🚀 === useProfile フック経由で保存開始 ===')
      console.log('🖼️ 保存前の画像URL:', profileImageUrl)

      // 新しいカラム構造に対応したプロフィール更新
      const result = await updateProfile({
        // CFOプロフィール情報
        name: formData.name,
        location: formData.location,
        weeklyAvailability: formData.weeklyAvailability,
        career: formData.career,
        skills: formData.skills,
        // 新しいカラム構造に対応
        compensation: formData.compensation || '', // 想定報酬（テキスト形式）
        possibleTasks: formData.possibleTasksDetail || '', // 詳細業務テキストを保存
        certifications: Array.isArray(formData.certifications) ? formData.certifications.join('\n') : formData.certifications || '',
        workingAreas: Array.isArray(formData.availableAreas) ? formData.availableAreas.join('\n') : formData.availableAreas || '',
        introduction: formData.introduction,
        avatarUrl: profileImageUrl || undefined,
        // 会社情報の4項目（企業ユーザー用）
        companyName: formData.companyName,
        description: formData.companyDescription,
        revenueRange: formData.revenueRange,
        challengeBackground: formData.financialChallenges
      })

      if (result.success) {
        console.log('🎉 保存成功 - 画面に反映されるはずです')
        console.log('🔄 保存後のプロフィール再取得...')
        setIsEditing(false)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
      } else {
        setError(result.error || 'プロフィールの更新に失敗しました')
        console.error('❌ useProfile 保存失敗:', result.error)
      }
    } catch (error) {
      console.error('Profile update error:', error)
      setError('ネットワークエラーが発生しました')
    } finally {
      setIsSaving(false)
    }
  }, [formData, profileImageUrl, updateProfile])

  // 認証確認
  if (isLoading || profileLoading) {
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
        {/* ページタイトルと編集ボタン */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">プロフィール編集</h2>
              <p className="text-gray-600 text-sm md:text-base">あなたの情報を管理・編集できます</p>
            </div>
            
            {/* 編集ボタン */}
            <div className="flex-shrink-0">
              {!isEditing ? (
                <button 
                  onClick={() => {
                    console.log('✏️ === EDIT BUTTON CLICKED ===')
                    console.log('📋 現在のフォームデータ:', formData)
                    setIsEditing(true)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2 text-sm font-medium"
                >
                  <span>✏️</span>
                  <span>編集する</span>
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button 
                    onClick={() => {
                      setIsEditing(false)
                      setError('')
                    }}
                    disabled={isSaving}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    キャンセル
                  </button>
                  <button 
                    onClick={() => {
                      console.log('🔥 === SAVE BUTTON CLICKED ===')
                      console.log('📝 編集中:', isEditing)
                      console.log('💾 保存中:', isSaving)
                      handleSave()
                    }}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>💾</span>
                    <span>{isSaving ? '保存中...' : '保存する'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
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
                  <p><strong>データロード状態:</strong> {(!isLoading && !profileLoading) ? '完了' : '未完了'}</p>
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
              {user.userType === 'company' ? 
                (formData.companyName || '会社名未設定') : 
                (formData.name || '名前未設定')
              }
            </h3>
            <p className="text-gray-600">
              {user.userType === 'company' ? 
                (formData.revenueRange ? `推定年商：${getRevenueLabel(formData.revenueRange)}` : '年商未設定') :
                (user.userType === 'cfo' ? 'CFO' : '企業ユーザー')
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
          {(!isLoading && !profileLoading) && !formData.name && !isEditing && (
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


          {/* 会社情報（企業ユーザー向け4項目のみ） */}
          {user.userType === 'company' && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center mb-6">
                <h4 className="text-lg font-semibold text-gray-900">🏢 会社情報</h4>
                <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">必須4項目</span>
              </div>
              <div className="space-y-6">
                {/* 1. 会社名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    会社名 <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="例：株式会社ブルーウェーブロボティクス"
                      required
                    />
                  ) : (
                    <p className="text-gray-900 py-2">{formData.companyName || '未設定'}</p>
                  )}
                </div>

                {/* 2. 会社概要 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    会社概要 <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.companyDescription}
                      onChange={(e) => handleInputChange('companyDescription', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="例：兵庫県神戸市に本社を置き、物流倉庫向け自律走行 AGV を設計・製造。サブスクリプションモデルで国内大手 3PL と契約中。"
                      required
                    />
                  ) : (
                    <p className="text-gray-900 py-2 whitespace-pre-wrap">{formData.companyDescription || '未設定'}</p>
                  )}
                </div>

                {/* 3. 推定年商 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    推定年商 <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.revenueRange}
                      onChange={(e) => handleInputChange('revenueRange', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">選択してください</option>
                      {revenueOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900 py-2">{formData.revenueRange ? getRevenueLabel(formData.revenueRange) : '未設定'}</p>
                  )}
                </div>

                {/* 4. 抱えている財務課題 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    抱えている財務課題 <span className="text-red-500">*</span>
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.financialChallenges}
                      onChange={(e) => handleInputChange('financialChallenges', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="例：財務DX・システム導入／予実管理／管理会計強化／資金調達"
                      required
                    />
                  ) : (
                    <p className="text-gray-900 py-2 whitespace-pre-wrap">{formData.financialChallenges || '未設定'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 担当者情報（企業ユーザー向け） */}
          {user.userType === 'company' && (
            <div className="p-6 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">👤 担当者情報</h4>
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">担当者名</label>
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
                  <p className="text-gray-500 text-sm bg-gray-50 px-3 py-2 rounded-lg">
                    {formData.email || '未設定'} <span className="text-xs">（変更不可）</span>
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* CFOプロフィール情報（cfo_data.md項目に準拠） */}
          {user.userType === 'cfo' && (
            <div className="p-6 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">👤 CFOプロフィール情報</h4>
              
              {/* 基本情報 */}
              <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">名前 <span className="text-red-500">*</span></label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="例：佐藤大悟"
                      required
                    />
                  ) : (
                    <p className="text-gray-900">{formData.name || '未設定'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
                  <p className="text-gray-500 text-sm bg-gray-50 px-3 py-2 rounded-lg">
                    {formData.email || '未設定'} <span className="text-xs">（変更不可）</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">居住地 <span className="text-red-500">*</span></label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="例：千葉県千葉市"
                      required
                    />
                  ) : (
                    <p className="text-gray-900">{formData.location || '未設定'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">週の稼働可能時間 <span className="text-red-500">*</span></label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.weeklyAvailability}
                      onChange={(e) => handleInputChange('weeklyAvailability', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="例：応相談（臨機応変に対応致します）"
                      required
                    />
                  ) : (
                    <p className="text-gray-900">{formData.weeklyAvailability || '未設定'}</p>
                  )}
                </div>
              </div>

              {/* 経歴 */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">経歴 <span className="text-red-500">*</span></label>
                {isEditing ? (
                  <textarea
                    value={formData.career}
                    onChange={(e) => handleInputChange('career', e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="例：2001,03 明治大学法学部法律学科卒業\n2001,04 全国共済農業協同組合会　全国本部　事務企画部　入会..."
                    required
                  />
                ) : (
                  <p className="text-gray-900 whitespace-pre-wrap">{formData.career || '未設定'}</p>
                )}
              </div>
            </div>
          )}

          {/* 可能な業務・保有資格・報酬・エリア・紹介文（CFOユーザーのみ） */}
          {user.userType === 'cfo' && (
            <div className="p-6 border-t border-gray-200">
              <div className="space-y-6">
                {/* 可能な業務 */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">💼 可能な業務 <span className="text-red-500">*</span></h4>
                  {isEditing ? (
                    <div className="space-y-4">
                      {/* スキル選択セクション */}
                      <div>
                        <p className="text-sm text-gray-600 mb-3">該当する業務を選択してください</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {availableSkills.map((skill) => (
                            <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={formData.skills.includes(skill)}
                                onChange={() => handleSkillToggle(skill)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{skill}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      {/* 詳細業務テキスト入力セクション */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          詳細な業務内容・得意分野
                        </label>
                        <p className="text-xs text-gray-500 mb-2">
                          上記の選択項目に加えて、具体的な業務内容や得意分野を自由に記述してください
                        </p>
                        <textarea
                          value={formData.possibleTasksDetail || ''}
                          onChange={(e) => handleInputChange('possibleTasksDetail', e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          placeholder="例：海外、英語を絡めた業務全般
・USへの上場希望会社のサポート（投資銀行、弁護士事務所、監査法人ご紹介含む）
・一般には出ていない投資案件の発掘
・不動産コンサルティング、各種ビジネスコンサルティング
・通訳、翻訳（ビジネス通訳、交渉は特に得意としています）"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* スキルタグ表示 */}
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.length > 0 ? (
                          formData.skills.map((skill) => (
                            <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">業務が未設定です</p>
                        )}
                      </div>
                      
                      {/* 詳細業務内容表示 */}
                      {formData.possibleTasksDetail && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">詳細な業務内容・得意分野:</h5>
                          <p className="text-gray-900 text-sm whitespace-pre-wrap">{formData.possibleTasksDetail}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 保有資格 */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">🏅 保有資格</h4>
                  {isEditing ? (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 mb-3">保有資格を入力してください（無しの場合は「特に無し」と記入）</p>
                      <textarea
                        value={formData.certifications.join('\n')}
                        onChange={(e) => {
                          const certifications = e.target.value.split('\n').filter(cert => cert.trim() !== '')
                          setFormData(prev => ({ ...prev, certifications }))
                        }}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="例：中小企業診断士\n日商簿記１級\n特に無し"
                      />
                    </div>
                  ) : (
                    <div>
                      {formData.certifications.length > 0 ? (
                        <ul className="space-y-1">
                          {formData.certifications.map((cert, index) => (
                            <li key={index} className="text-gray-900">・ {cert}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">資格が未設定です</p>
                      )}
                    </div>
                  )}
                </div>

                {/* 想定月額報酬 */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">💰 想定月額報酬 <span className="text-red-500">*</span></h4>
                  {isEditing ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        報酬詳細
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        月額報酬、成果報酬、時給など、ご希望の報酬体系を自由に記述してください
                      </p>
                      <textarea
                        value={formData.compensation || ''}
                        onChange={(e) => handleInputChange('compensation', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="例：月10万円〜、成果報酬応相談
時給5,000円〜
月額30万円〜50万円（稼働時間に応じて調整）"
                        required
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      {formData.compensation ? (
                        <p className="text-gray-900 whitespace-pre-wrap">{formData.compensation}</p>
                      ) : (
                        <p className="text-gray-500 italic">報酬が未設定です</p>
                      )}
                    </div>
                  )}
                </div>

                {/* 対応可能エリア */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">🗺️ 対応可能エリア <span className="text-red-500">*</span></h4>
                  {isEditing ? (
                    <textarea
                      value={formData.availableAreas.join('\n')}
                      onChange={(e) => {
                        const areas = e.target.value.split('\n').filter(area => area.trim() !== '')
                        setFormData(prev => ({ ...prev, availableAreas: areas }))
                      }}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="例：全国リモートOK\n東京近郊は対面可\n案件次第では日本国内、海外への出張可"
                      required
                    />
                  ) : (
                    <div>
                      {formData.availableAreas.length > 0 ? (
                        <ul className="space-y-1">
                          {formData.availableAreas.map((area, index) => (
                            <li key={index} className="text-gray-900">・ {area}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">エリアが未設定です</p>
                      )}
                    </div>
                  )}
                </div>

                {/* 紹介文 */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">📝 紹介文 <span className="text-red-500">*</span></h4>
                  {isEditing ? (
                    <textarea
                      value={formData.introduction}
                      onChange={(e) => handleInputChange('introduction', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="例：M&Aを自身でクロスボーダーを含む2社売却経験。他、2社で資金調達支援を経験。海外を絡ませた案件も得意。特にUSでのIPOサポートはNYの投資銀行と一緒に可能。"
                      required
                    />
                  ) : (
                    <p className="text-gray-900 whitespace-pre-wrap">{formData.introduction || '未設定'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>


      {/* Toast通知 */}
      {showToast && (
        <div className="fixed bottom-4 left-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          プロフィールが更新されました ✓
        </div>
      )}
    </div>
  )
}