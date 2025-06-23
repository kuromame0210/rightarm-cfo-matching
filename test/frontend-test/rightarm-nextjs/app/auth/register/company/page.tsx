'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Building2, Users, DollarSign, Target } from 'lucide-react'
import Link from 'next/link'

const CompanyRegisterPage = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Company Details
    industry: '',
    employeeCount: '',
    revenue: '',
    location: '',
    website: '',
    
    // Step 3: Challenges & Needs
    challenges: [],
    urgency: '',
    budget: '',
    workStyle: '',
    
    // Step 4: Additional Info
    description: '',
    expectations: ''
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  }

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleChallengeToggle = (challenge: string) => {
    setFormData(prev => ({
      ...prev,
      challenges: prev.challenges.includes(challenge)
        ? prev.challenges.filter(c => c !== challenge)
        : [...prev.challenges, challenge]
    }))
  }

  const challengeOptions = ['資金調達', 'IPO準備', 'M&A', '管理会計', '財務分析', '事業承継', '補助金申請', 'コスト削減']

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return Building2
      case 2: return Users
      case 3: return Target
      case 4: return DollarSign
      default: return Building2
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h2 className="text-2xl font-light tracking-wider text-gray-900 mb-2">基本情報</h2>
              <p className="text-gray-600">まずは基本的な情報をお聞かせください</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">会社名 *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="株式会社サンプル"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス *</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="example@company.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">パスワード *</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="8文字以上"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">パスワード確認 *</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="パスワードを再入力"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            key="step2"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h2 className="text-2xl font-light tracking-wider text-gray-900 mb-2">企業詳細</h2>
              <p className="text-gray-600">あなたの会社について詳しく教えてください</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">業界 *</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                  >
                    <option value="">選択してください</option>
                    <option value="manufacturing">製造業</option>
                    <option value="construction">建設業</option>
                    <option value="retail">小売業</option>
                    <option value="it">IT・通信</option>
                    <option value="finance">金融・保険</option>
                    <option value="service">サービス業</option>
                    <option value="other">その他</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">従業員数 *</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    value={formData.employeeCount}
                    onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                  >
                    <option value="">選択してください</option>
                    <option value="1-10">1-10名</option>
                    <option value="11-50">11-50名</option>
                    <option value="51-100">51-100名</option>
                    <option value="101-300">101-300名</option>
                    <option value="300+">300名以上</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">年商</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    value={formData.revenue}
                    onChange={(e) => handleInputChange('revenue', e.target.value)}
                  >
                    <option value="">選択してください</option>
                    <option value="under-1">1億円未満</option>
                    <option value="1-5">1-5億円</option>
                    <option value="5-10">5-10億円</option>
                    <option value="10-50">10-50億円</option>
                    <option value="50+">50億円以上</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">所在地 *</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  >
                    <option value="">選択してください</option>
                    <option value="tokyo">東京都</option>
                    <option value="osaka">大阪府</option>
                    <option value="aichi">愛知県</option>
                    <option value="kanagawa">神奈川県</option>
                    <option value="other">その他</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Webサイト</label>
                <input
                  type="url"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="https://www.company.com"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            key="step3"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <Target className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h2 className="text-2xl font-light tracking-wider text-gray-900 mb-2">課題・ニーズ</h2>
              <p className="text-gray-600">どのような支援をお求めですか？</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">解決したい課題（複数選択可）*</label>
                <div className="grid grid-cols-2 gap-3">
                  {challengeOptions.map((challenge) => (
                    <label key={challenge} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        className="mr-3 rounded border-gray-300 text-black focus:ring-black"
                        checked={formData.challenges.includes(challenge)}
                        onChange={() => handleChallengeToggle(challenge)}
                      />
                      <span className="text-sm text-gray-700">{challenge}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">緊急度 *</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    value={formData.urgency}
                    onChange={(e) => handleInputChange('urgency', e.target.value)}
                  >
                    <option value="">選択してください</option>
                    <option value="urgent">急募（1ヶ月以内）</option>
                    <option value="soon">なるべく早く（3ヶ月以内）</option>
                    <option value="normal">通常（6ヶ月以内）</option>
                    <option value="flexible">時期は柔軟</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">予算 *</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                  >
                    <option value="">選択してください</option>
                    <option value="under-50">月50万円以下</option>
                    <option value="50-100">月50-100万円</option>
                    <option value="100-150">月100-150万円</option>
                    <option value="150+">月150万円以上</option>
                    <option value="negotiable">要相談</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">希望する働き方 *</label>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  value={formData.workStyle}
                  onChange={(e) => handleInputChange('workStyle', e.target.value)}
                >
                  <option value="">選択してください</option>
                  <option value="remote">完全リモート</option>
                  <option value="hybrid">リモート+月数回出社</option>
                  <option value="on-site">出社メイン</option>
                  <option value="flexible">柔軟に対応</option>
                </select>
              </div>
            </div>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            key="step4"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h2 className="text-2xl font-light tracking-wider text-gray-900 mb-2">最終確認</h2>
              <p className="text-gray-600">追加情報とプロフィールの確認</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">会社について</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="事業内容や会社の特徴について簡潔にご記入ください"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CFOに期待すること</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="どのような支援や成果を期待されているかお聞かせください"
                  value={formData.expectations}
                  onChange={(e) => handleInputChange('expectations', e.target.value)}
                />
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">入力内容の確認</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">会社名:</span> {formData.companyName}</p>
                  <p><span className="font-medium">業界:</span> {formData.industry}</p>
                  <p><span className="font-medium">従業員数:</span> {formData.employeeCount}</p>
                  <p><span className="font-medium">課題:</span> {formData.challenges.join(', ')}</p>
                  <p><span className="font-medium">予算:</span> {formData.budget}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <motion.div
        className="max-w-2xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Progress Bar */}
        <motion.div className="mb-8" variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-thin tracking-wide text-gray-900">企業登録</h1>
            <span className="text-sm text-gray-600">ステップ {currentStep} / {totalSteps}</span>
          </div>
          
          <div className="flex items-center">
            {[...Array(totalSteps)].map((_, index) => {
              const step = index + 1
              const StepIcon = getStepIcon(step)
              const isActive = step <= currentStep
              const isCurrent = step === currentStep
              
              return (
                <div key={step} className="flex items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isActive ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-black/20' : ''}`}>
                    <StepIcon className="w-5 h-5" />
                  </div>
                  {index < totalSteps - 1 && (
                    <div className={`flex-1 h-1 mx-2 transition-all ${
                      step < currentStep ? 'bg-black' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Form Content */}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 mb-8"
          variants={itemVariants}
        >
          {renderStep()}
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div 
          className="flex justify-between items-center"
          variants={itemVariants}
        >
          {currentStep > 1 ? (
            <motion.button
              onClick={prevStep}
              className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              前へ
            </motion.button>
          ) : (
            <Link href="/auth/register">
              <motion.button
                className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                戻る
              </motion.button>
            </Link>
          )}

          {currentStep < totalSteps ? (
            <motion.button
              onClick={nextStep}
              className="flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              次へ
              <ChevronRight className="w-4 h-4 ml-2" />
            </motion.button>
          ) : (
            <motion.button
              className="flex items-center px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              登録完了
              <ChevronRight className="w-4 h-4 ml-2" />
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default CompanyRegisterPage