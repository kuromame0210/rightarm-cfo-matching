'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function Hero() {
  const { user } = useAuth()
  const router = useRouter()

  const handleCFOSearch = () => {
    if (user) {
      router.push('/search')
    } else {
      router.push('/auth/register')
    }
  }

  const handleCompanySearch = () => {
    if (user) {
      router.push('/search/companies')
    } else {
      router.push('/auth/register')
    }
  }

  return (
    <section className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            RightArm
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            — 全国の企業に、"右腕CFO"を届ける —
          </p>
          <p className="text-lg text-gray-500">
            全ての企業に"最適な経営パートナー"が当たり前にいる世界を。
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* 企業向けブロック */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 hover:bg-gray-100 transition-colors">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">企業の方</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center">
                  <div className="bg-gray-200 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">週1日から導入可能</span>
                </div>
                <div className="flex items-center justify-center">
                  <div className="bg-gray-200 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">リモートのみでもOK</span>
                </div>
                <div className="flex items-center justify-center">
                  <div className="bg-gray-200 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">CFOを低コストで導入</span>
                </div>
              </div>

              <button 
                onClick={handleCFOSearch}
                className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                CFOを探す
              </button>
            </div>
          </div>

          {/* CFO向けブロック */}
          <div className="bg-white border border-gray-200 rounded-lg p-8 hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">CFOの方</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-center">
                  <div className="bg-gray-200 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">財務知識で企業を支援</span>
                </div>
                <div className="flex items-center justify-center">
                  <div className="bg-gray-200 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">副業として活動可能</span>
                </div>
                <div className="flex items-center justify-center">
                  <div className="bg-gray-200 rounded-full p-2 mr-3">
                    <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-gray-700">複業で仕事の幅を広げる</span>
                </div>
              </div>

              <button 
                onClick={handleCompanySearch}
                className="w-full border-2 border-gray-900 text-gray-900 py-3 px-6 rounded-lg font-medium hover:bg-gray-900 hover:text-white transition-colors"
              >
                企業を探す
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}