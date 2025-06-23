'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState<'company' | 'cfo'>('company')

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
        className="max-w-md w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <h1 className="text-3xl font-thin tracking-[0.2em] uppercase mb-4 text-black">
            ログイン
          </h1>
          <div className="flex items-center justify-center mb-6">
            <div className="w-8 h-px bg-gray-400 mr-4" />
            <p className="text-gray-600 font-light tracking-[0.1em] text-sm">
              アカウントにサインイン
            </p>
            <div className="w-8 h-px bg-gray-400 ml-4" />
          </div>
        </motion.div>

        {/* Login Form */}
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8"
          variants={itemVariants}
        >
          {/* User Type Toggle */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setUserType('company')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                userType === 'company'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              企業
            </button>
            <button
              onClick={() => setUserType('cfo')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                userType === 'cfo'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              CFO
            </button>
          </div>

          <form className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                placeholder="example@company.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-light text-gray-700 mb-2">
                パスワード
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all pr-12"
                  placeholder="パスワードを入力"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="ml-2 text-sm text-gray-600">ログイン状態を保持</span>
              </label>
              <Link 
                href="/auth/forgot-password" 
                className="text-sm text-black hover:underline"
              >
                パスワードを忘れた方
              </Link>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="btn-primary w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ログイン
            </motion.button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">または</span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                アカウントをお持ちでない方は{' '}
                <Link href="/auth/register" className="text-black hover:underline font-medium">
                  こちらから登録
                </Link>
              </p>
            </div>
          </form>
        </motion.div>

        {/* Back to Home */}
        <motion.div 
          className="text-center mt-8"
          variants={itemVariants}
        >
          <Link 
            href="/" 
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← トップページに戻る
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default LoginPage