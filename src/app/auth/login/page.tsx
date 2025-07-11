'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Toast } from '@/components/ui/Toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // NextAuth.jsのログイン関数を使用
      const result = await login(email, password)
      
      if (result.success) {
        showToast('ログインしました', 'success')
        
        // ログイン成功後はホームページにリダイレクト
        setTimeout(() => {
          router.push('/home')
        }, 1500)
      } else {
        showToast(result.error || 'ログインに失敗しました', 'error')
      }
    } catch (error) {
      console.error('Login error:', error)
      showToast('ネットワークエラーが発生しました', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 md:p-8 w-full max-w-md">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 tracking-wide">RIGHTARM</h1>
          <p className="text-gray-600 text-sm md:text-base">ログイン</p>
        </div>

        {/* エラーメッセージ表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 md:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 md:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm md:text-base"
              placeholder="example@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 md:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-sm md:text-base"
              placeholder="パスワードを入力"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2 rounded" 
              />
              <span className="text-xs md:text-sm text-gray-600">ログイン状態を保持</span>
            </label>
            <a href="#" className="text-xs md:text-sm text-gray-600 hover:text-gray-900 hover:underline">
              パスワードを忘れた方
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-900 text-white py-3 md:py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs md:text-sm text-gray-600">
            アカウントをお持ちでない方は{' '}
            <Link href="/auth/register" className="text-gray-900 hover:underline font-medium">
              会員登録
            </Link>
          </p>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-xs md:text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            ホームに戻る
          </Link>
        </div>
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