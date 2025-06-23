'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Building2, User } from 'lucide-react'
import Link from 'next/link'

const RegisterPage = () => {
  const [userType, setUserType] = useState<'company' | 'cfo' | null>(null)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <motion.div
        className="max-w-4xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <h1 className="text-3xl md:text-4xl font-thin tracking-[0.2em] uppercase mb-4 text-black">
            会員登録
          </h1>
          <div className="flex items-center justify-center mb-6">
            <div className="w-8 h-px bg-gray-400 mr-4" />
            <p className="text-gray-600 font-light tracking-[0.1em] text-sm">
              アカウント種別を選択してください
            </p>
            <div className="w-8 h-px bg-gray-400 ml-4" />
          </div>
        </motion.div>

        {/* User Type Selection */}
        {!userType && (
          <motion.div
            className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            {/* Company Card */}
            <Link href="/auth/register/company">
              <motion.div
                className="bg-white rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group"
                whileHover={{ scale: 1.02 }}
              >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-black to-gray-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              
              <div className="text-center">
                <motion.div
                  className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  whileHover={{ rotate: 5 }}
                >
                  <Building2 className="w-8 h-8 text-gray-700" />
                </motion.div>
                
                <h3 className="text-xl font-light uppercase tracking-wider mb-4 text-gray-800">
                  企業の方
                </h3>
                
                <div className="space-y-3 mb-6 text-left">
                  {[
                    'CFOを探している',
                    '財務課題を解決したい',
                    '資金調達のサポートが必要'
                  ].map((text, index) => (
                    <div key={text} className="flex items-center text-sm text-gray-600">
                      <span className="text-gray-400 mr-3">▸</span>
                      {text}
                    </div>
                  ))}
                </div>
                
                <button className="btn-primary w-full">
                  企業として登録
                </button>
              </div>
              </motion.div>
            </Link>

            {/* CFO Card */}
            <Link href="/auth/register/cfo">
              <motion.div
                className="bg-white rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden group"
                whileHover={{ scale: 1.02 }}
              >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-black to-gray-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              
              <div className="text-center">
                <motion.div
                  className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  whileHover={{ rotate: -5 }}
                >
                  <User className="w-8 h-8 text-gray-700" />
                </motion.div>
                
                <h3 className="text-xl font-light uppercase tracking-wider mb-4 text-gray-800">
                  CFOの方
                </h3>
                
                <div className="space-y-3 mb-6 text-left">
                  {[
                    '企業を支援したい',
                    '財務知識を活かしたい',
                    '副業として活動したい'
                  ].map((text, index) => (
                    <div key={text} className="flex items-center text-sm text-gray-600">
                      <span className="text-gray-400 mr-3">▸</span>
                      {text}
                    </div>
                  ))}
                </div>
                
                <button className="btn-outline w-full">
                  CFOとして登録
                </button>
              </div>
              </motion.div>
            </Link>
          </motion.div>
        )}

        {/* Registration Form */}
        {userType && (
          <motion.div
            className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-light tracking-wider text-gray-800">
                {userType === 'company' ? '企業登録' : 'CFO登録'}
              </h2>
              <button
                onClick={() => setUserType(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                戻る
              </button>
            </div>

            <form className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    {userType === 'company' ? '会社名' : '氏名'}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder={userType === 'company' ? '株式会社サンプル' : '山田太郎'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="example@company.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    パスワード
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="8文字以上"
                  />
                </div>
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    パスワード確認
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="パスワードを再入力"
                  />
                </div>
              </div>

              {/* Company Specific Fields */}
              {userType === 'company' && (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-light text-gray-700 mb-2">
                        業界
                      </label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all">
                        <option>製造業</option>
                        <option>建設業</option>
                        <option>小売業</option>
                        <option>サービス業</option>
                        <option>IT・通信</option>
                        <option>その他</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-light text-gray-700 mb-2">
                        従業員数
                      </label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all">
                        <option>〜10名</option>
                        <option>11〜50名</option>
                        <option>51〜100名</option>
                        <option>101〜300名</option>
                        <option>300名以上</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-light text-gray-700 mb-2">
                      財務課題（複数選択可）
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['資金調達', '管理会計', 'IPO準備', 'M&A', '補助金申請', '財務分析'].map((item) => (
                        <label key={item} className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* CFO Specific Fields */}
              {userType === 'cfo' && (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-light text-gray-700 mb-2">
                        経験年数
                      </label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all">
                        <option>3年未満</option>
                        <option>3〜5年</option>
                        <option>5〜10年</option>
                        <option>10〜15年</option>
                        <option>15年以上</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-light text-gray-700 mb-2">
                        希望稼働日数
                      </label>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all">
                        <option>週1日</option>
                        <option>週2日</option>
                        <option>週3日</option>
                        <option>週4日以上</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-light text-gray-700 mb-2">
                      専門分野（複数選択可）
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['資金調達', '管理会計', 'IPO準備', 'M&A', '補助金申請', '財務分析'].map((item) => (
                        <label key={item} className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <div className="pt-6">
                <button type="submit" className="btn-primary w-full mb-4">
                  アカウントを作成
                </button>
                
                <p className="text-center text-sm text-gray-600">
                  すでにアカウントをお持ちですか？{' '}
                  <Link href="/auth/login" className="text-black hover:underline">
                    ログイン
                  </Link>
                </p>
              </div>
            </form>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default RegisterPage