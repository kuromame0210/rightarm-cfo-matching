'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import AppHeader from '@/components/AppHeader'

export const dynamic = 'force-dynamic'

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  
  // レビュー機能未実装のため一時的に非表示
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="text-6xl mb-4">🚧</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">機能準備中</h1>
          <p className="text-gray-600 mb-6">レビュー機能は現在準備中です。<br />実装が完了次第、ご利用いただけるようになります。</p>
          <button 
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            戻る
          </button>
        </div>
      </div>
    </div>
  )
}