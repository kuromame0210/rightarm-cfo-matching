'use client'

import { useState } from 'react'
import AppHeader from '@/components/AppHeader'
import { useToast } from '@/components/ui/Toast'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface TestResult {
  test: string
  status: 'PASS' | 'FAIL' | 'ERROR'
  result?: any
  error?: string
  duration?: number
}

interface TestSummary {
  total: number
  passed: number
  failed: number
  errors: number
  duration: number
}

export default function ScoutTestPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [testSummary, setTestSummary] = useState<TestSummary | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedTestType, setSelectedTestType] = useState('all')
  const { showToast } = useToast()

  const testTypes = [
    { value: 'all', label: '全テスト実行' },
    { value: 'db', label: 'データベース接続' },
    { value: 'create', label: 'スカウト作成' },
    { value: 'read', label: 'スカウト取得' },
    { value: 'update', label: 'ステータス更新' },
    { value: 'concurrency', label: '競合状態制御' },
    { value: 'integrity', label: 'データ整合性' },
    { value: 'auth', label: 'API認証' }
  ]

  const runTests = async () => {
    setIsRunning(true)
    setTestResults([])
    setTestSummary(null)

    try {
      console.log(`🧪 Running ${selectedTestType} tests...`)
      
      const response = await fetch(`/api/test/scouts?type=${selectedTestType}`, {
        headers: {
          'Authorization': 'Bearer demo-token'
        }
      })

      const data = await response.json()
      
      if (data.success) {
        setTestResults(data.data.results)
        setTestSummary(data.data.summary)
        
        const { passed, failed, errors } = data.data.summary
        if (failed === 0 && errors === 0) {
          showToast(`✅ すべてのテストが成功しました (${passed}/${data.data.summary.total})`, 'success')
        } else {
          showToast(`⚠️ テスト完了: 成功 ${passed}, 失敗 ${failed}, エラー ${errors}`, 'error')
        }
      } else {
        console.error('Test API error:', data)
        showToast('テスト実行に失敗しました', 'error')
      }
    } catch (error) {
      console.error('Test execution error:', error)
      showToast('テスト実行中にエラーが発生しました', 'error')
    } finally {
      setIsRunning(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return 'text-green-600 bg-green-50'
      case 'FAIL': return 'text-red-600 bg-red-50'
      case 'ERROR': return 'text-orange-600 bg-orange-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return '✅'
      case 'FAIL': return '❌'
      case 'ERROR': return '⚠️'
      default: return '❓'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <AppHeader isLoggedIn={true} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            スカウト機能統合テスト
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            スカウト機能の包括的なテストを実行して動作確認を行います
          </p>
        </div>

        {/* テスト設定 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">テスト設定</h2>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                テストタイプ
              </label>
              <select
                value={selectedTestType}
                onChange={(e) => setSelectedTestType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isRunning}
              >
                {testTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={runTests}
                disabled={isRunning}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isRunning
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isRunning ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>実行中...</span>
                  </div>
                ) : (
                  'テスト実行'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* テストサマリー */}
        {testSummary && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">テスト結果サマリー</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{testSummary.total}</div>
                <div className="text-sm text-gray-600">総数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{testSummary.passed}</div>
                <div className="text-sm text-gray-600">成功</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{testSummary.failed}</div>
                <div className="text-sm text-gray-600">失敗</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{testSummary.errors}</div>
                <div className="text-sm text-gray-600">エラー</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{testSummary.duration}ms</div>
                <div className="text-sm text-gray-600">実行時間</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${testSummary.total > 0 ? (testSummary.passed / testSummary.total) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                成功率: {testSummary.total > 0 ? Math.round((testSummary.passed / testSummary.total) * 100) : 0}%
              </div>
            </div>
          </div>
        )}

        {/* テスト結果詳細 */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">テスト結果詳細</h2>
            
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getStatusIcon(result.status)}</span>
                      <div>
                        <h3 className="font-medium">{result.test}</h3>
                        <div className="text-sm opacity-75">
                          実行時間: {result.duration}ms
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(result.status)}`}>
                      {result.status}
                    </span>
                  </div>
                  
                  {result.error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                      <strong>エラー:</strong> {result.error}
                    </div>
                  )}
                  
                  {result.result && (
                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
                      <div className="text-sm font-medium text-gray-700 mb-2">実行結果:</div>
                      <pre className="text-xs text-gray-600 overflow-x-auto">
                        {typeof result.result === 'string' 
                          ? result.result 
                          : JSON.stringify(result.result, null, 2)
                        }
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 手動テスト用ショートカット */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">手動テスト用リンク</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/scout" 
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="text-sm font-medium text-gray-900">スカウト一覧</div>
              <div className="text-xs text-gray-600 mt-1">受信・送信スカウトの確認</div>
            </Link>
            
            <a 
              href="/api/scouts" 
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              target="_blank"
            >
              <div className="text-sm font-medium text-gray-900">スカウトAPI</div>
              <div className="text-xs text-gray-600 mt-1">API直接呼び出しテスト</div>
            </a>
            
            <a 
              href="/messages" 
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
            >
              <div className="text-sm font-medium text-gray-900">メッセージ</div>
              <div className="text-xs text-gray-600 mt-1">承諾後のメッセージ機能</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}