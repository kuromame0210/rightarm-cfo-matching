'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Layout } from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SkillCategorySelector } from '@/components/forms/skill-category-selector'
import { UserType } from '@/types'

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState<UserType>('cfo')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Basic Info
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // CFO Profile
  const [cfoData, setCfoData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    bio: '',
    locationPrefecture: '',
    locationCity: '',
    yearsExperience: '',
    hourlyRateMin: '',
    hourlyRateMax: '',
    selectedSkills: [] as string[]
  })

  // Company Profile
  const [companyData, setCompanyData] = useState({
    companyName: '',
    companyDescription: '',
    industry: '',
    companySize: '',
    revenueRange: '',
    locationPrefecture: '',
    locationCity: '',
    websiteUrl: '',
    establishedYear: '',
    challenges: '',
    challengeBackground: '',
    cfoRequirements: '',
    desiredTimeframe: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step === 1) {
      if (password !== confirmPassword) {
        alert('パスワードが一致しません')
        return
      }
      setStep(2)
      return
    }
    
    setIsLoading(true)
    
    // Simulate registration - in real app, this would call an API
    setTimeout(() => {
      setIsLoading(false)
      // For demo purposes, redirect to home page
      router.push('/home')
    }, 1000)
  }

  const prefectures = [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ]

  const revenueRanges = [
    '1億円未満',
    '1~10億円',
    '10~30億円',
    '30~50億円',
    '50億円以上',
    '非公開'
  ]

  const companySizes = [
    '1-10名',
    '11-50名',
    '51-100名',
    '101-500名',
    '501-1000名',
    '1000名以上'
  ]

  const industries = [
    'IT・ソフトウェア',
    'フィンテック',
    '製造業',
    'バイオテクノロジー',
    'ヘルスケア',
    'eコマース',
    'SaaS',
    'AI・機械学習',
    'ゲーム',
    'メディア・エンターテイメント',
    '不動産',
    '教育',
    '人材',
    'マーケティング',
    'コンサルティング',
    '金融',
    '小売',
    'その他'
  ]

  if (step === 1) {
    return (
      <Layout showBottomNav={false}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div>
              <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
                新規アカウント作成
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                または{' '}
                <Link
                  href="/auth/login"
                  className="font-medium text-orange-600 hover:text-orange-500"
                >
                  既存のアカウントでログイン
                </Link>
              </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* User Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    登録タイプ
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setUserType('cfo')}
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        userType === 'cfo'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-2xl mb-2">👤</div>
                      <div className="font-medium">CFO</div>
                      <div className="text-xs text-gray-500">個人として登録</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType('company')}
                      className={`p-4 border-2 rounded-lg text-center transition-colors ${
                        userType === 'company'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-2xl mb-2">🏢</div>
                      <div className="font-medium">企業</div>
                      <div className="text-xs text-gray-500">法人として登録</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="sr-only">
                    メールアドレス
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                    placeholder="メールアドレス"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    パスワード
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                    placeholder="パスワード（8文字以上）"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="sr-only">
                    パスワード確認
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                    placeholder="パスワード確認"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="agree-terms"
                  name="agree-terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                  <Link href="/terms" className="text-orange-600 hover:text-orange-500">
                    利用規約
                  </Link>
                  および
                  <Link href="/privacy" className="text-orange-600 hover:text-orange-500">
                    プライバシーポリシー
                  </Link>
                  に同意します
                </label>
              </div>

              <div>
                <Button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  次へ進む
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    )
  }

  // Step 2: Profile Information
  return (
    <Layout showBottomNav={false}>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              プロフィール情報の入力
            </h2>
            <p className="mt-2 text-gray-600">
              {userType === 'cfo' ? 'CFOとしてのプロフィールを入力してください' : '企業情報を入力してください'}
            </p>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {userType === 'cfo' ? (
                  // CFO Profile Form
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          姓 <span className="text-red-500">*</span>
                        </label>
                        <Input
                          required
                          value={cfoData.lastName}
                          onChange={(e) => setCfoData(prev => ({ ...prev, lastName: e.target.value }))}
                          placeholder="田中"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          名 <span className="text-red-500">*</span>
                        </label>
                        <Input
                          required
                          value={cfoData.firstName}
                          onChange={(e) => setCfoData(prev => ({ ...prev, firstName: e.target.value }))}
                          placeholder="太郎"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        表示名・ニックネーム
                      </label>
                      <Input
                        value={cfoData.displayName}
                        onChange={(e) => setCfoData(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="田中太郎"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          都道府県
                        </label>
                        <select
                          value={cfoData.locationPrefecture}
                          onChange={(e) => setCfoData(prev => ({ ...prev, locationPrefecture: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                          <option value="">選択してください</option>
                          {prefectures.map(prefecture => (
                            <option key={prefecture} value={prefecture}>
                              {prefecture}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          市区町村
                        </label>
                        <Input
                          value={cfoData.locationCity}
                          onChange={(e) => setCfoData(prev => ({ ...prev, locationCity: e.target.value }))}
                          placeholder="渋谷区"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          経験年数
                        </label>
                        <Input
                          type="number"
                          value={cfoData.yearsExperience}
                          onChange={(e) => setCfoData(prev => ({ ...prev, yearsExperience: e.target.value }))}
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          希望時給（最低）
                        </label>
                        <Input
                          type="number"
                          value={cfoData.hourlyRateMin}
                          onChange={(e) => setCfoData(prev => ({ ...prev, hourlyRateMin: e.target.value }))}
                          placeholder="5000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          希望時給（最高）
                        </label>
                        <Input
                          type="number"
                          value={cfoData.hourlyRateMax}
                          onChange={(e) => setCfoData(prev => ({ ...prev, hourlyRateMax: e.target.value }))}
                          placeholder="15000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        自己紹介・経歴
                      </label>
                      <textarea
                        value={cfoData.bio}
                        onChange={(e) => setCfoData(prev => ({ ...prev, bio: e.target.value }))}
                        rows={4}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="これまでの経歴やスキル、得意分野について記載してください..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        専門スキル・対応可能業務
                      </label>
                      <SkillCategorySelector
                        selectedSkills={cfoData.selectedSkills}
                        onChange={(skills) => setCfoData(prev => ({ ...prev, selectedSkills: skills }))}
                      />
                    </div>
                  </>
                ) : (
                  // Company Profile Form
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        会社名 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        required
                        value={companyData.companyName}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, companyName: e.target.value }))}
                        placeholder="株式会社〇〇"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        事業概要
                      </label>
                      <textarea
                        value={companyData.companyDescription}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, companyDescription: e.target.value }))}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="どのような事業を行っているかを記載してください..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          業界
                        </label>
                        <select
                          value={companyData.industry}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, industry: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                          <option value="">選択してください</option>
                          {industries.map(industry => (
                            <option key={industry} value={industry}>
                              {industry}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          従業員数
                        </label>
                        <select
                          value={companyData.companySize}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, companySize: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                          <option value="">選択してください</option>
                          {companySizes.map(size => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        推定年商
                      </label>
                      <select
                        value={companyData.revenueRange}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, revenueRange: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="">選択してください</option>
                        {revenueRanges.map(range => (
                          <option key={range} value={range}>
                            {range}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          都道府県
                        </label>
                        <select
                          value={companyData.locationPrefecture}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, locationPrefecture: e.target.value }))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                          <option value="">選択してください</option>
                          {prefectures.map(prefecture => (
                            <option key={prefecture} value={prefecture}>
                              {prefecture}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          市区町村
                        </label>
                        <Input
                          value={companyData.locationCity}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, locationCity: e.target.value }))}
                          placeholder="渋谷区"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ウェブサイトURL
                        </label>
                        <Input
                          type="url"
                          value={companyData.websiteUrl}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                          placeholder="https://example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          設立年
                        </label>
                        <Input
                          type="number"
                          value={companyData.establishedYear}
                          onChange={(e) => setCompanyData(prev => ({ ...prev, establishedYear: e.target.value }))}
                          placeholder="2020"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        抱えている財務課題
                      </label>
                      <textarea
                        value={companyData.challenges}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, challenges: e.target.value }))}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="現在抱えている財務に関する課題について記載してください..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        課題の背景や状況
                      </label>
                      <textarea
                        value={companyData.challengeBackground}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, challengeBackground: e.target.value }))}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="課題が生まれた背景や現在の状況について記載してください..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CFOに求めたいこと
                      </label>
                      <textarea
                        value={companyData.cfoRequirements}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, cfoRequirements: e.target.value }))}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="CFOに期待する業務や成果について記載してください..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        希望時期
                      </label>
                      <Input
                        value={companyData.desiredTimeframe}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, desiredTimeframe: e.target.value }))}
                        placeholder="できるだけ早く、1ヶ月以内、3ヶ月以内など"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    戻る
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                    disabled={isLoading}
                  >
                    {isLoading ? '登録中...' : '登録完了'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}