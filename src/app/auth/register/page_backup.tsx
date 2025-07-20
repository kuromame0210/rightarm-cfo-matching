'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Toast } from '@/components/ui/Toast'
import { EssentialCompensationInput, EssentialAvailabilityInput, EssentialLocationInput } from '@/components/EssentialProfileInputs'

function RegisterPageContent() {
  const searchParams = useSearchParams()
  const initialType = searchParams.get('type')
  const [userType, setUserType] = useState<'company' | 'cfo' | null>(
    (initialType === 'company' || initialType === 'cfo') ? initialType : null
  )
  const [selectedRevenue, setSelectedRevenue] = useState('')
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<{[key: string]: string[]}>({})
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    companyName: '',
    businessName: '',
    description: '',
    financialChallengesDetail: '', // 財務課題詳細テキスト
    nickname: '',
    experience: '',
    workPreference: '',
    compensationRange: '',
    // CFO追加項目（レガシー・任意）
    location: '',
    workingHours: '',
    possibleTasks: '',
    certifications: '',
    monthlyCompensation: '',
    workingArea: '',
    introduction: '',
    // 🆕 CFO構造化必須項目
    compensationType: '',
    monthlyFeeMin: '',
    monthlyFeeMax: '',
    weeklyDays: '',
    weeklyDaysFlexible: false,
    supportedPrefectures: [],
    fullRemoteAvailable: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    isVisible: boolean
  } | null>(null)
  const router = useRouter()
  const { login } = useAuth()

  // トースト表示関数
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setToast({ message, type, isVisible: true })
  }

  const hideToast = () => {
    setToast(prev => prev ? { ...prev, isVisible: false } : null)
  }

  // v5.1仕様書に基づく推定年商選択肢
  const revenueOptions = [
    { value: 'under_100m', label: '1億円未満' },
    { value: '100m_1b', label: '1〜10億円' },
    { value: '1b_10b', label: '10〜30億円' },
    { value: '10b_30b', label: '30〜50億円' },
    { value: 'over_50b', label: '50億円以上' },
    { value: 'private', label: '非公開' }
  ]

  // v5.1仕様書に基づく財務課題タグ大分類
  const challengeTags = [
    '資金調達', 'IPO準備', '財務DX・システム導入', '事業承継・再生', 
    '組織・ガバナンス', 'M&A関連', '管理会計強化', '補助金活用',
    '銀行融資', '投資家対応', '原価計算', '予実管理', 'その他'
  ]

  // v5.1仕様書に基づく専門スキル大分類6種
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // バリデーション
    if (!userType) {
      showToast('ユーザータイプを選択してください', 'warning')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('パスワードが一致しません', 'warning')
      setIsLoading(false)
      return
    }

    try {
      // 空文字を除外するヘルパー関数
      const filterEmptyValues = (obj: Record<string, any>) => {
        const filtered: Record<string, any> = {}
        Object.entries(obj).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            filtered[key] = value
          }
        })
        return filtered
      }

      const baseData = {
        email: formData.email,
        password: formData.password,
        userType,
        displayName: formData.displayName,
      }

      const companyData = userType === 'company' ? filterEmptyValues({
        companyName: formData.companyName,
        businessName: formData.businessName,
        description: formData.description,
        revenueRange: selectedRevenue,
        challengeTags: selectedChallenges,
        financialChallengesDetail: formData.financialChallengesDetail, // 財務課題詳細
      }) : {}

      const cfoData = userType === 'cfo' ? filterEmptyValues({
        nickname: formData.nickname,
        skills: selectedSkills,
        experience: formData.experience,
        workPreference: formData.workPreference,
        compensationRange: formData.compensationRange,
        // 🆕 構造化必須項目（EssentialProfileInputs準拠）
        compensationType: formData.compensationType,
        monthlyFeeMin: formData.monthlyFeeMin,
        monthlyFeeMax: formData.monthlyFeeMax,
        weeklyDays: formData.weeklyDays,
        weeklyDaysFlexible: formData.weeklyDaysFlexible,
        supportedPrefectures: formData.supportedPrefectures,
        fullRemoteAvailable: formData.fullRemoteAvailable,
        // レガシーフィールド（任意）
        location: formData.location,
        workingHours: formData.workingHours,
        possibleTasks: formData.possibleTasks,
        certifications: formData.certifications,
        monthlyCompensation: formData.monthlyCompensation,
        workingArea: formData.workingArea,
        introduction: formData.introduction,
      }) : {}

      const registrationData = {
        ...baseData,
        ...companyData,
        ...cfoData,
        profileImage: profileImage || undefined, // プロフィール画像データを追加
      }

      // デバッグ: 送信データの詳細確認
      console.log('🚀 デバッグモード: 登録データ送信をスキップ')
      console.log('📋 送信予定の登録データ:', registrationData)
      console.log('📊 データ詳細分析:', {
        userType: registrationData.userType,
        email: registrationData.email,
        displayName: registrationData.displayName,
        // 画像関連
        hasProfileImage: !!registrationData.profileImage,
        profileImageType: typeof registrationData.profileImage,
        profileImageLength: registrationData.profileImage?.length,
        profileImagePreview: registrationData.profileImage?.substring(0, 100),
        // CFO固有フィールド
        ...(registrationData.userType === 'cfo' && {
          cfoFields: {
            location: (registrationData as any).location,
            workingHours: (registrationData as any).workingHours,
            possibleTasks: (registrationData as any).possibleTasks?.length + '文字',
            certifications: (registrationData as any).certifications?.length + '文字',
            monthlyCompensation: (registrationData as any).monthlyCompensation?.length + '文字',
            workingArea: (registrationData as any).workingArea?.length + '文字',
            introduction: (registrationData as any).introduction?.length + '文字',
            experience: (registrationData as any).experience?.length + '文字',
            skills: (registrationData as any).skills
          }
        })
      })
      
      // 実際の登録処理を実行
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      })

      const data = await response.json()

      if (data.success) {
        // セッション情報がある場合は自動ログイン
        if (data.data?.session && data.data?.user) {
          login(data.data.session.access_token, data.data.user)
          
          // ダッシュボードにリダイレクト
          setTimeout(() => {
            if (userType === 'company') {
              router.push('/discover/cfos')
            } else {
              router.push('/discover/companies')
            }
          }, 100)
        } else {
          // セッション情報がない場合はログインページに誘導
          showToast(data.message || 'ユーザー登録が完了しました', 'success')
          setTimeout(() => {
            router.push('/auth/login')
          }, 2000)
        }
      } else {
        showToast(data.error || '登録に失敗しました', 'error')
      }
    } catch (error) {
      console.error('Registration error:', error)
      showToast('ネットワークエラーが発生しました', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const skillCategories = {
    '資金調達': ['VC調達', '銀行融資', '補助金申請', '投資家対応', 'クラウドファンディング', '社債発行'],
    'IPO・M&A関連': ['IPO準備', 'M&A戦略', '企業価値評価', 'DD対応', 'IR活動', '上場審査対応'],
    '財務DX・システム導入': ['ERP導入', '管理会計システム', 'BI導入', 'API連携', 'RPA導入', 'SaaS選定'],
    '事業承継・再生': ['事業承継計画', '事業再生', 'リストラクチャリング', '組織再編', '後継者育成', '株価算定'],
    '組織・ガバナンス': ['内部統制', 'コンプライアンス', 'リスク管理', 'KPI設計', '予算管理', '取締役会運営'],
    'その他': ['国際税務', '連結決算', 'IFRS', '原価計算', '管理会計', '財務分析']
  }

  // URLパラメータの変更を監視（必要に応じて更新）
  useEffect(() => {
    const type = searchParams.get('type')
    if (type === 'company' || type === 'cfo') {
      setUserType(type)
    }
  }, [searchParams])

  // 財務課題タグの選択/解除
  const toggleChallenge = (challenge: string) => {
    setSelectedChallenges(prev =>
      prev.includes(challenge)
        ? prev.filter(c => c !== challenge)
        : [...prev, challenge]
    )
  }

  // スキル選択/解除
  const toggleSkill = (category: string, skill: string) => {
    setSelectedSkills(prev => {
      const categorySkills = prev[category] || []
      const newCategorySkills = categorySkills.includes(skill)
        ? categorySkills.filter(s => s !== skill)
        : [...categorySkills, skill]
      
      return {
        ...prev,
        [category]: newCategorySkills
      }
    })
  }


  // プロフィール画像アップロード
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB制限
        showToast('ファイルサイズは5MB以下にしてください', 'warning')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
        setUploadedFile(file)
      }
      reader.readAsDataURL(file)
    }
  }


  if (!userType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">RightArm</h1>
            <p className="text-gray-600">会員登録</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setUserType('company')}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center">
                <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl">🏢</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">企業として登録</h3>
                  <p className="text-sm text-gray-600">CFOを探したい企業の方</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setUserType('cfo')}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center">
                <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">CFOとして登録</h3>
                  <p className="text-sm text-gray-600">企業を支援したいCFOの方</p>
                </div>
              </div>
            </button>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              既にアカウントをお持ちの方は{' '}
              <Link href="/auth/login" className="text-gray-900 hover:underline font-medium">
                ログイン
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {userType === 'company' ? '企業登録' : 'CFO登録'}
          </h1>
          <button
            onClick={() => setUserType(null)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← 登録タイプを変更
          </button>
        </div>

        {/* エラーメッセージ表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          {/* 共通必須項目 */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード確認 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {userType === 'company' ? '企業担当者名' : '氏名'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleInputChange('displayName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* 企業側固有項目 */}
          {userType === 'company' && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">企業情報</h3>
              
              <div className="space-y-4">
                {/* 会社名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    会社名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* 事業名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    事業名・サービス名 <span className="text-gray-500 text-xs">(任意)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="例：AI文書要約サービス、ECプラットフォーム等"
                  />
                </div>

                {/* 推定年商 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    推定年商 <span className="text-gray-500 text-xs">(任意)</span>
                  </label>
                  <select
                    value={selectedRevenue}
                    onChange={(e) => setSelectedRevenue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    {revenueOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 財務課題タグ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    財務課題（複数選択可） <span className="text-gray-500 text-xs">(任意)</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {challengeTags.map((tag) => {
                      const isSelected = selectedChallenges.includes(tag)
                      return (
                        <label 
                          key={tag} 
                          className={`flex items-center p-2 rounded cursor-pointer transition-all border text-sm ${
                            isSelected 
                              ? 'bg-blue-50 border-blue-200 text-blue-900' 
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleChallenge(tag)}
                            className="mr-2 text-blue-600 focus:ring-blue-500 focus:ring-1 w-3 h-3"
                          />
                          <span className={`${isSelected ? 'font-medium' : ''}`}>
                            {tag}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                  
                  {/* 選択サマリー */}
                  {selectedChallenges.length > 0 && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                      <div className="font-medium text-blue-900 mb-1">選択済み課題: {selectedChallenges.length}個</div>
                      <div className="text-blue-800">{selectedChallenges.join(', ')}</div>
                    </div>
                  )}
                </div>

                {/* 会社概要 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    会社概要・事業内容 <span className="text-gray-500 text-xs">(任意)</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    rows={4}
                    placeholder="事業内容や会社の特徴について簡潔にご記入ください"
                  />
                </div>

                {/* 財務課題詳細テキスト入力 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    財務課題の詳細 <span className="text-gray-500 text-xs">(任意)</span>
                  </label>
                  <textarea
                    value={formData.financialChallengesDetail}
                    onChange={(e) => handleInputChange('financialChallengesDetail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    rows={4}
                    placeholder="上記で選択した財務課題について、より詳しい内容や背景、現在の状況などを自由に記述してください"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CFO側固有項目 */}
          {userType === 'cfo' && (
            <div>
              {/* 🎯 基本設定（必須項目） */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  🎯 基本設定（必須項目）
                </h3>
                
                <div className="space-y-6">
                  {/* 報酬設定 */}
                  <EssentialCompensationInput
                    formData={formData}
                    setFormData={setFormData}
                    isEditing={true}
                    required={true}
                  />
                  
                  {/* 稼働条件 */}
                  <EssentialAvailabilityInput
                    formData={formData}
                    setFormData={setFormData}
                    isEditing={true}
                    required={true}
                  />
                  
                  {/* 対応エリア */}
                  <EssentialLocationInput
                    formData={formData}
                    setFormData={setFormData}
                    isEditing={true}
                    required={true}
                  />
                </div>
              </div>

              {/* 📝 詳細情報（任意） */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  📝 詳細情報（任意）
                </h3>
                
                <div className="space-y-4">
                  {/* ニックネーム */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ニックネーム <span className="text-gray-500 text-xs">(任意)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.nickname}
                      onChange={(e) => handleInputChange('nickname', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="例：財務のプロ太郎"
                    />
                  </div>

                  {/* 居住地（レガシー） */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      居住地・拠点（詳細） <span className="text-gray-500 text-xs">(任意)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="例：東京都渋谷区（詳細な住所等）"
                    />
                  </div>

                  {/* 稼働可能時間（レガシー） */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      稼働時間の詳細 <span className="text-gray-500 text-xs">(任意)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.workingHours}
                      onChange={(e) => handleInputChange('workingHours', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      placeholder="例：平日10-18時、土日応相談"
                    />
                  </div>

                  {/* 専門スキル */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      専門スキル大分類
                      <span className="text-xs text-gray-500 ml-2">（複数選択可、任意）</span>
                    </label>
                    <div className="space-y-3">
                      {Object.entries(skillCategories).map(([category, skills]) => {
                        const selectedCount = (selectedSkills[category] || []).length
                        
                        return (
                          <div key={category} className="border border-gray-200 rounded-md p-3 bg-white">
                            {/* カテゴリヘッダー */}
                            <div className="mb-2 flex items-center">
                              <h4 className="font-medium text-gray-900 text-sm">{category}</h4>
                              {selectedCount > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                                  {selectedCount}選択
                                </span>
                              )}
                            </div>
                            
                            {/* スキル選択グリッド */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                              {skills.map((skill) => {
                                const isSelected = (selectedSkills[category] || []).includes(skill)
                                return (
                                  <label 
                                    key={skill} 
                                    className={`flex items-center p-2 rounded cursor-pointer transition-all border text-xs ${
                                      isSelected 
                                        ? 'bg-blue-50 border-blue-200 text-blue-900' 
                                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleSkill(category, skill)}
                                      className="mr-2 text-blue-600 focus:ring-blue-500 focus:ring-1 w-3 h-3"
                                    />
                                    <span className={`${isSelected ? 'font-medium' : ''}`}>
                                      {skill}
                                    </span>
                                  </label>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    
                    {/* 全体の選択サマリー */}
                    {Object.values(selectedSkills).some(skills => skills.length > 0) && (
                      <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                        <div className="font-medium text-blue-900 mb-1">選択済みスキル一覧</div>
                        <div className="text-blue-800">
                          {Object.entries(selectedSkills).map(([category, skills]) => 
                            skills.length > 0 && (
                              <div key={category} className="mb-0.5">
                                <strong>{category}:</strong> {skills.join(', ')}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 経歴 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      経歴 <span className="text-gray-500 text-xs">(任意)</span>
                    </label>
                    <textarea
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      rows={6}
                      placeholder="過去の実績や経歴を詳しくご記入ください（改行可）"
                    />
                  </div>

                  {/* 可能な業務 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      可能な業務 <span className="text-gray-500 text-xs">(任意)</span>
                    </label>
                    <textarea
                      value={formData.possibleTasks}
                      onChange={(e) => handleInputChange('possibleTasks', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      rows={4}
                      placeholder="例：財務戦略策定、資金調達支援、IPO準備、M&Aアドバイザリー等"
                    />
                  </div>

                  {/* 保有資格 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      保有資格 <span className="text-gray-500 text-xs">(任意)</span>
                    </label>
                    <textarea
                      value={formData.certifications}
                      onChange={(e) => handleInputChange('certifications', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      rows={3}
                      placeholder="例：公認会計士、税理士、中小企業診断士、日商簿記1級等"
                    />
                  </div>

                  {/* 想定月額報酬 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      想定月額報酬 <span className="text-gray-500 text-xs">(任意)</span>
                    </label>
                    <textarea
                      value={formData.monthlyCompensation}
                      onChange={(e) => handleInputChange('monthlyCompensation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      rows={3}
                      placeholder="例：月10万円〜、成果報酬応相談、時給1万円〜等"
                    />
                  </div>

                  {/* 対応可能エリア */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      対応可能エリア <span className="text-gray-500 text-xs">(任意)</span>
                    </label>
                    <textarea
                      value={formData.workingArea}
                      onChange={(e) => handleInputChange('workingArea', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      rows={3}
                      placeholder="例：全国リモートOK、東京近郊は対面可、海外出張可等"
                    />
                  </div>

                  {/* 紹介文 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      紹介文 <span className="text-gray-500 text-xs">(任意)</span>
                    </label>
                    <textarea
                      value={formData.introduction}
                      onChange={(e) => handleInputChange('introduction', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      rows={4}
                      placeholder="自己紹介や特徴、強みなどをご記入ください"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <Link
              href="/"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              onClick={handleRegister}
              disabled={isLoading}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '登録中...' : '登録する'}
            </button>
          </div>
        </form>
      </div>
      
      {/* トースト通知 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
      )}
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  )
}