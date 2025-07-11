'use client'

import { useState } from 'react'
import AppHeader from '@/components/AppHeader'
import { useAuth } from '@/lib/hooks/useAuth'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function ScoutTestPage() {
  const { user, isAuthenticated } = useAuth()
  const [testResults, setTestResults] = useState<any[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (test: string, status: 'PASS' | 'FAIL' | 'ERROR', details: any) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      details: typeof details === 'string' ? details : JSON.stringify(details, null, 2),
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const testScoutAPI = async () => {
    addResult('スカウト送信API テスト', 'PASS', 'テスト開始')
    
    const testData = {
      recipientId: 'test-recipient-id',
      recipientType: 'cfo',
      senderType: 'company',
      title: 'テストスカウト',
      message: 'これはテスト用のスカウトメッセージです。'
    }

    try {
      console.log('🎯 スカウト送信API テスト開始:', testData)
      
      const response = await fetch('/api/scouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      })

      const data = await response.json()
      
      console.log('📥 API レスポンス:', { status: response.status, data })
      
      if (response.ok && data.success) {
        addResult('スカウト送信API', 'PASS', `成功: スカウトID ${data.data?.scoutId}`)
      } else {
        addResult('スカウト送信API', 'FAIL', `失敗: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ スカウト送信API エラー:', error)
      addResult('スカウト送信API', 'ERROR', `ネットワークエラー: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const testScoutListAPI = async () => {
    try {
      console.log('📋 スカウト一覧API テスト開始')
      
      const response = await fetch('/api/scouts?type=received&limit=5')
      const data = await response.json()
      
      console.log('📥 スカウト一覧レスポンス:', { status: response.status, data })
      
      if (response.ok && data.success) {
        addResult('スカウト一覧API', 'PASS', `成功: ${data.data.received?.length || 0}件の受信スカウト`)
      } else {
        addResult('スカウト一覧API', 'FAIL', `失敗: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ スカウト一覧API エラー:', error)
      addResult('スカウト一覧API', 'ERROR', `ネットワークエラー: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const testAuthStatus = () => {
    addResult('認証状態確認', isAuthenticated ? 'PASS' : 'FAIL', {
      isAuthenticated,
      userType: user?.userType,
      userId: user?.id
    })
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setTestResults([])
    
    console.log('🚀 スカウト機能テスト開始')
    
    // 認証状態確認
    testAuthStatus()
    
    // API テスト
    await testScoutAPI()
    await testScoutListAPI()
    
    console.log('✅ テスト完了')
    setIsRunning(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          スカウト機能デバッグテスト
        </h1>
        
        {/* 認証状態表示 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">現在の認証状態</h2>
          <div className="space-y-2 text-sm">
            <div>認証状態: {isAuthenticated ? '✅ ログイン中' : '❌ 未ログイン'}</div>
            <div>ユーザータイプ: {user?.userType || '不明'}</div>
            <div>ユーザーID: {user?.id || '不明'}</div>
          </div>
        </div>

        {/* テスト実行ボタン */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className={`px-6 py-3 rounded-lg font-medium ${
              isRunning
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isRunning ? '実行中...' : 'スカウト機能テスト実行'}
          </button>
        </div>

        {/* テスト結果 */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">テスト結果</h2>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className={`border rounded-lg p-4 ${
                  result.status === 'PASS' ? 'border-green-200 bg-green-50' :
                  result.status === 'FAIL' ? 'border-red-200 bg-red-50' :
                  'border-orange-200 bg-orange-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{result.test}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        result.status === 'PASS' ? 'bg-green-100 text-green-800' :
                        result.status === 'FAIL' ? 'bg-red-100 text-red-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {result.status}
                      </span>
                      <span className="text-xs text-gray-500">{result.timestamp}</span>
                    </div>
                  </div>
                  <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">
                    {result.details}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 手動テスト用リンク */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">手動テスト用リンク</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              href="/scout" 
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="font-medium text-gray-900">スカウト一覧</div>
              <div className="text-sm text-gray-600 mt-1">受信・送信スカウトの確認</div>
            </Link>
            
            <a 
              href="/discover/cfos" 
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="font-medium text-gray-900">CFO検索</div>
              <div className="text-sm text-gray-600 mt-1">スカウト送信機能のテスト</div>
            </a>
            
            <a 
              href="/api/scouts?type=received" 
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              target="_blank"
            >
              <div className="font-medium text-gray-900">受信スカウトAPI</div>
              <div className="text-sm text-gray-600 mt-1">API直接呼び出し</div>
            </a>
            
            <a 
              href="/api/scouts?type=sent" 
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              target="_blank"
            >
              <div className="font-medium text-gray-900">送信スカウトAPI</div>
              <div className="text-sm text-gray-600 mt-1">API直接呼び出し</div>
            </a>
          </div>
        </div>

        {/* デバッグ情報 */}
        <div className="bg-gray-100 rounded-lg p-4 mt-6">
          <h3 className="font-semibold text-gray-900 mb-2">デバッグ情報</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div>• ブラウザのコンソールでより詳細なログを確認できます</div>
            <div>• Network タブでAPIリクエスト/レスポンスを確認できます</div>
            <div>• スカウト送信にはログインが必要です</div>
          </div>
        </div>
      </div>
    </div>
  )
}