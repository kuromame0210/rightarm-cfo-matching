'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, User, Briefcase, Target, Award } from 'lucide-react'
import Link from 'next/link'

const CFORegisterPage = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Experience
    experience: '',
    previousRole: '',
    education: '',
    certifications: [],
    
    // Step 3: Expertise & Preferences
    specialties: [],
    industries: [],
    availability: '',
    workStyle: '',
    
    // Step 4: Rates & Profile
    hourlyRate: '',
    monthlyRate: '',
    successFeeRate: '',
    bio: '',
    achievements: ''
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

  const handleArrayToggle = (field: string, item: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }))
  }

  const specialtyOptions = ['資金調達', 'IPO準備', 'M&A', '管理会計', '財務分析', '事業承継', '補助金申請', 'コスト削減', '内部統制', 'KPI設計']
  const industryOptions = ['IT・テクノロジー', '製造業', '建設業', '小売・EC', 'バイオ・医療', '金融・保険', 'サービス業', 'その他']
  const certificationOptions = ['公認会計士', '税理士', 'CFO認定', 'MBA', 'CPA', 'その他']

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return User
      case 2: return Briefcase
      case 3: return Target
      case 4: return Award
      default: return User
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
              <User className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h2 className="text-2xl font-light tracking-wider text-gray-900 mb-2">基本情報</h2>
              <p className="text-gray-600">まずは基本的な情報をお聞かせください</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">お名前 *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="山田 太郎"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス *</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="example@email.com"
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
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h2 className="text-2xl font-light tracking-wider text-gray-900 mb-2">経歴・資格</h2>
              <p className="text-gray-600">あなたの経験と資格について教えてください</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">経験年数 *</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                  >
                    <option value="">選択してください</option>
                    <option value="3-5">3-5年</option>
                    <option value="5-10">5-10年</option>
                    <option value="10-15">10-15年</option>
                    <option value="15+">15年以上</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">直近の役職 *</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    value={formData.previousRole}
                    onChange={(e) => handleInputChange('previousRole', e.target.value)}
                  >
                    <option value="">選択してください</option>
                    <option value="cfo">CFO</option>
                    <option value="finance-director">財務部長</option>
                    <option value="controller">コントローラー</option>
                    <option value="accountant">公認会計士</option>
                    <option value="consultant">コンサルタント</option>
                    <option value="banker">銀行員</option>
                    <option value="other">その他</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">最終学歴</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="○○大学 経済学部 など"
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">保有資格（複数選択可）</label>
                <div className="grid grid-cols-2 gap-3">
                  {certificationOptions.map((cert) => (
                    <label key={cert} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        className="mr-3 rounded border-gray-300 text-black focus:ring-black"
                        checked={formData.certifications.includes(cert)}
                        onChange={() => handleArrayToggle('certifications', cert)}
                      />
                      <span className="text-sm text-gray-700">{cert}</span>
                    </label>
                  ))}
                </div>
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
              <h2 className="text-2xl font-light tracking-wider text-gray-900 mb-2">専門性・希望条件</h2>
              <p className="text-gray-600">得意分野と働き方の希望をお聞かせください</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">専門分野（複数選択可）*</label>
                <div className="grid grid-cols-2 gap-3">
                  {specialtyOptions.map((specialty) => (
                    <label key={specialty} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        className="mr-3 rounded border-gray-300 text-black focus:ring-black"
                        checked={formData.specialties.includes(specialty)}
                        onChange={() => handleArrayToggle('specialties', specialty)}
                      />
                      <span className="text-sm text-gray-700">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">得意業界（複数選択可）</label>
                <div className="grid grid-cols-2 gap-3">
                  {industryOptions.map((industry) => (
                    <label key={industry} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        className="mr-3 rounded border-gray-300 text-black focus:ring-black"
                        checked={formData.industries.includes(industry)}
                        onChange={() => handleArrayToggle('industries', industry)}
                      />
                      <span className="text-sm text-gray-700">{industry}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">希望稼働日数 *</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    value={formData.availability}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                  >
                    <option value="">選択してください</option>
                    <option value="1">週1日</option>
                    <option value="2">週2日</option>
                    <option value="3">週3日</option>
                    <option value="4+">週4日以上</option>
                    <option value="flexible">柔軟に対応</option>
                  </select>
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
                    <option value="hybrid">リモート+定期出社</option>
                    <option value="on-site">出社メイン</option>
                    <option value="flexible">柔軟に対応</option>
                  </select>
                </div>
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
              <Award className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h2 className="text-2xl font-light tracking-wider text-gray-900 mb-2">料金・プロフィール</h2>
              <p className="text-gray-600">料金設定とプロフィールの仕上げ</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">時間単価</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="5,000円/時"
                    value={formData.hourlyRate}
                    onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">月額料金 *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="80万円/月"
                    value={formData.monthlyRate}
                    onChange={(e) => handleInputChange('monthlyRate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">成功報酬率</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="3%"
                    value={formData.successFeeRate}
                    onChange={(e) => handleInputChange('successFeeRate', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">自己紹介 *</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="あなたの経験、強み、提供できる価値について簡潔にご記入ください"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">主な実績・成果</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  placeholder="具体的な実績や成果があればご記入ください（例：IPO支援3社、資金調達総額50億円など）"
                  value={formData.achievements}
                  onChange={(e) => handleInputChange('achievements', e.target.value)}
                />
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">入力内容の確認</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">お名前:</span> {formData.fullName}</p>
                  <p><span className="font-medium">経験年数:</span> {formData.experience}</p>
                  <p><span className="font-medium">専門分野:</span> {formData.specialties.join(', ')}</p>
                  <p><span className="font-medium">希望稼働:</span> {formData.availability}</p>
                  <p><span className="font-medium">月額料金:</span> {formData.monthlyRate}</p>
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
            <h1 className="text-2xl font-thin tracking-wide text-gray-900">CFO登録</h1>
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

export default CFORegisterPage