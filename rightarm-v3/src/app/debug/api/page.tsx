'use client'

import { useState } from 'react'
import AppHeader from '@/components/AppHeader'

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  description: string
  status: 'active' | 'deprecated' | 'planned'
  responseTime?: number
  lastChecked?: string
  headers?: Record<string, string>
  body?: any
  response?: any
}

const API_ENDPOINTS: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/api/user/profile',
    description: 'ユーザープロフィール情報を取得',
    status: 'active',
    responseTime: 120,
    lastChecked: '2024-01-15 10:30',
    response: {
      id: 1,
      name: '山田太郎',
      email: 'yamada@example.com',
      avatar: '👤'
    }
  },
  {
    method: 'POST',
    path: '/api/auth/login',
    description: 'ユーザーログイン',
    status: 'active',
    responseTime: 85,
    lastChecked: '2024-01-15 10:25',
    body: {
      email: 'user@example.com',
      password: '********'
    },
    response: {
      token: 'jwt_token_here',
      user: { id: 1, name: '山田太郎' }
    }
  },
  {
    method: 'GET',
    path: '/api/scouts',
    description: 'スカウト一覧を取得',
    status: 'active',
    responseTime: 200,
    lastChecked: '2024-01-15 10:20',
    response: {
      scouts: [
        {
          id: 1,
          from: '株式会社ABC',
          title: 'CFO募集',
          status: 'pending'
        }
      ],
      total: 15
    }
  },
  {
    method: 'POST',
    path: '/api/scouts',
    description: '新しいスカウトを送信',
    status: 'active',
    responseTime: 150,
    lastChecked: '2024-01-15 10:15',
    body: {
      to: 'company@example.com',
      title: 'CFOとしてのご協力',
      message: 'メッセージ内容'
    },
    response: {
      id: 2,
      status: 'sent'
    }
  },
  {
    method: 'GET',
    path: '/api/messages',
    description: 'メッセージ一覧を取得',
    status: 'active',
    responseTime: 95,
    lastChecked: '2024-01-15 10:10',
    response: {
      messages: [
        {
          id: 1,
          from: 'user1',
          content: 'こんにちは',
          timestamp: '2024-01-15T10:00:00Z'
        }
      ]
    }
  },
  {
    method: 'POST',
    path: '/api/messages',
    description: '新しいメッセージを送信',
    status: 'active',
    responseTime: 110,
    lastChecked: '2024-01-15 10:05',
    body: {
      to: 'user2',
      content: 'メッセージ内容'
    },
    response: {
      id: 3,
      status: 'sent'
    }
  },
  {
    method: 'GET',
    path: '/api/meetings',
    description: '面談予定一覧を取得',
    status: 'active',
    responseTime: 140,
    lastChecked: '2024-01-15 10:00',
    response: {
      meetings: [
        {
          id: 1,
          title: '面談',
          datetime: '2024-01-20T14:00:00Z',
          participants: ['user1', 'user2']
        }
      ]
    }
  },
  {
    method: 'PUT',
    path: '/api/user/profile',
    description: 'ユーザープロフィールを更新',
    status: 'planned',
    body: {
      name: '新しい名前',
      bio: '自己紹介文'
    }
  },
  {
    method: 'DELETE',
    path: '/api/scouts/:id',
    description: 'スカウトを削除',
    status: 'deprecated'
  }
]

export default function ApiDebugPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [filter, setFilter] = useState<string>('all')

  const handleTestEndpoint = async (endpoint: ApiEndpoint) => {
    setIsLoading(true)
    setTestResult(null)
    
    // ダミーテスト実行
    setTimeout(() => {
      const mockResult = {
        status: Math.random() > 0.1 ? 'success' : 'error',
        statusCode: Math.random() > 0.1 ? 200 : 500,
        responseTime: Math.floor(Math.random() * 300) + 50,
        data: endpoint.response || { message: 'Test response' },
        timestamp: new Date().toISOString()
      }
      setTestResult(mockResult)
      setIsLoading(false)
    }, 1000 + Math.random() * 2000)
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800'
      case 'POST': return 'bg-blue-100 text-blue-800'
      case 'PUT': return 'bg-yellow-100 text-yellow-800'
      case 'DELETE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'deprecated': return 'bg-red-100 text-red-800'
      case 'planned': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredEndpoints = API_ENDPOINTS.filter(endpoint => {
    if (filter === 'all') return true
    return endpoint.status === filter
  })

  const activeCount = API_ENDPOINTS.filter(e => e.status === 'active').length
  const deprecatedCount = API_ENDPOINTS.filter(e => e.status === 'deprecated').length
  const plannedCount = API_ENDPOINTS.filter(e => e.status === 'planned').length
  const avgResponseTime = API_ENDPOINTS
    .filter(e => e.responseTime)
    .reduce((sum, e) => sum + (e.responseTime || 0), 0) / API_ENDPOINTS.filter(e => e.responseTime).length

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">🔌 API テスト</h1>
            <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
              デバッグ専用
            </span>
          </div>
          <p className="text-gray-600">
            APIエンドポイントのテストと監視を行います
          </p>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <div className="text-sm text-gray-600">アクティブ</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-red-600">{deprecatedCount}</div>
            <div className="text-sm text-gray-600">非推奨</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-600">{plannedCount}</div>
            <div className="text-sm text-gray-600">計画中</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{avgResponseTime.toFixed(0)}ms</div>
            <div className="text-sm text-gray-600">平均応答時間</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* エンドポイント一覧 */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">エンドポイント一覧</h3>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md"
                >
                  <option value="all">すべて</option>
                  <option value="active">アクティブ</option>
                  <option value="deprecated">非推奨</option>
                  <option value="planned">計画中</option>
                </select>
              </div>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {filteredEndpoints.map((endpoint, index) => (
                <div
                  key={index}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedEndpoint === endpoint ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => setSelectedEndpoint(endpoint)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 text-xs rounded ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${getStatusColor(endpoint.status)}`}>
                      {endpoint.status}
                    </span>
                    {endpoint.responseTime && (
                      <span className="text-xs text-gray-500">{endpoint.responseTime}ms</span>
                    )}
                  </div>
                  <div className="font-mono text-sm text-gray-900 mb-1">{endpoint.path}</div>
                  <div className="text-sm text-gray-600">{endpoint.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* エンドポイント詳細 */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">エンドポイント詳細</h3>
            </div>
            <div className="p-6">
              {selectedEndpoint ? (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 text-sm rounded ${getMethodColor(selectedEndpoint.method)}`}>
                      {selectedEndpoint.method}
                    </span>
                    <span className="font-mono text-lg text-gray-900">{selectedEndpoint.path}</span>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{selectedEndpoint.description}</p>

                  {selectedEndpoint.body && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">リクエストボディ</h4>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                        {JSON.stringify(selectedEndpoint.body, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedEndpoint.response && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">レスポンス例</h4>
                      <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                        {JSON.stringify(selectedEndpoint.response, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedEndpoint.status === 'active' && (
                    <button
                      onClick={() => handleTestEndpoint(selectedEndpoint)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? 'テスト中...' : 'テスト実行'}
                    </button>
                  )}

                  {selectedEndpoint.lastChecked && (
                    <div className="mt-4 text-sm text-gray-500">
                      最終チェック: {selectedEndpoint.lastChecked}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  エンドポイントを選択してください
                </div>
              )}
            </div>
          </div>
        </div>

        {/* テスト結果 */}
        {testResult && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">テスト結果</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${testResult.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {testResult.status === 'success' ? '成功' : '失敗'}
                </div>
                <div className="text-sm text-gray-600">ステータス</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{testResult.statusCode}</div>
                <div className="text-sm text-gray-600">ステータスコード</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{testResult.responseTime}ms</div>
                <div className="text-sm text-gray-600">応答時間</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">レスポンスデータ</h4>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              実行時刻: {new Date(testResult.timestamp).toLocaleString()}
            </div>
          </div>
        )}

        {/* API仕様書 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">API 仕様書</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🔐 認証</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• JWT トークンを使用</li>
                <li>• Authorizationヘッダーにセット</li>
                <li>• トークンの有効期限: 24時間</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">📝 エラーハンドリング</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 400: バリデーションエラー</li>
                <li>• 401: 認証エラー</li>
                <li>• 500: サーバーエラー</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">📊 レート制限</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 1分間に100リクエスト</li>
                <li>• 制限を超えた場合は429エラー</li>
                <li>• Retry-After ヘッダーを参照</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">🔍 バージョニング</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 現在のバージョン: v1</li>
                <li>• URLにバージョンを含める</li>
                <li>• 下位互換性を維持</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}