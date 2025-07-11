// 統一APIクライアント
// Phase 4: API Client Standardization

import { ApiSuccessResponse, ApiErrorResponse } from './api-response'
import { Session } from 'next-auth'

// APIクライアント設定の型定義
interface ApiClientConfig {
  baseURL?: string
  timeout?: number
  defaultHeaders?: Record<string, string>
  onRequestStart?: (config: RequestConfig) => void
  onRequestEnd?: (config: RequestConfig, response: any) => void
  onError?: (error: ApiError) => void
}

// リクエスト設定の型定義
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  timeout?: number
  auth?: boolean // 自動認証ヘッダー追加
}

// APIエラーの型定義
class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// レスポンス型の定義
type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

class ApiClient {
  private config: Required<ApiClientConfig>
  private session: Session | null = null

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      baseURL: '',
      timeout: 30000,
      defaultHeaders: {
        'Content-Type': 'application/json'
      },
      onRequestStart: () => {},
      onRequestEnd: () => {},
      onError: () => {},
      ...config
    }
  }

  // セッション情報を更新
  updateSession(session: Session | null): void {
    this.session = session
  }

  // 認証状態を取得
  private getAuthToken(): string | null {
    // セッション情報から認証状態を判定
    if (this.session?.user) {
      return 'session-authenticated'
    }
    
    return null
  }

  // リクエストヘッダーを構築
  private buildHeaders(config: RequestConfig): Record<string, string> {
    const headers = {
      ...this.config.defaultHeaders,
      ...config.headers
    }

    // NextAuth.js セッションベースの認証
    if (config.auth !== false) {
      const token = this.getAuthToken()
      if (token) {
        // NextAuth.js セッションが存在する場合は認証済みとしてマーク
        headers['X-Auth-Type'] = 'nextauth-session'
      }
      // 注意：NextAuth.jsはhttpOnlyクッキーを使用するため、
      // クライアントサイドでセッション検出できない場合があります。
      // サーバー側で適切に認証チェックされているため、警告は不要です。
    }

    return headers
  }

  // レスポンスを処理
  private async processResponse<T>(response: Response): Promise<T> {
    let data: any

    try {
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }
    } catch (error) {
      throw new ApiError(
        response.status,
        'PARSE_ERROR',
        'レスポンスの解析に失敗しました',
        error
      )
    }

    if (!response.ok) {
      // 統一エラーレスポンス形式の処理
      if (data && typeof data === 'object' && data.success === false) {
        throw new ApiError(
          response.status,
          data.error?.code || 'API_ERROR',
          data.error?.message || 'APIエラーが発生しました',
          data.error?.details
        )
      } else {
        throw new ApiError(
          response.status,
          'HTTP_ERROR',
          `HTTPエラー: ${response.status} ${response.statusText}`,
          data
        )
      }
    }

    return data
  }

  // 基本リクエストメソッド
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`
    const headers = this.buildHeaders(config)
    
    const requestConfig: RequestInit = {
      method: config.method || 'GET',
      headers,
      credentials: 'include', // NextAuth.jsクッキーを含める
      signal: AbortSignal.timeout(config.timeout || this.config.timeout)
    }

    // bodyがある場合の処理
    if (config.body !== undefined) {
      if (config.body instanceof FormData) {
        requestConfig.body = config.body
        // FormDataの場合はContent-Typeを削除（ブラウザが自動設定）
        delete (requestConfig.headers as any)['Content-Type']
      } else if (typeof config.body === 'object') {
        requestConfig.body = JSON.stringify(config.body)
      } else {
        requestConfig.body = config.body
      }
    }

    this.config.onRequestStart({ ...config, method: config.method || 'GET' })

    try {
      const response = await fetch(url, requestConfig)
      const data = await this.processResponse<T>(response)
      
      this.config.onRequestEnd({ ...config, method: config.method || 'GET' }, data)
      return data
    } catch (error) {
      if (error instanceof ApiError) {
        this.config.onError(error)
        throw error
      }
      
      // その他のエラー（ネットワークエラーなど）
      const apiError = new ApiError(
        0,
        'NETWORK_ERROR',
        'ネットワークエラーが発生しました',
        error
      )
      this.config.onError(apiError)
      throw apiError
    }
  }

  // GET リクエスト
  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    config: Omit<RequestConfig, 'method' | 'body'> = {}
  ): Promise<T> {
    let url = endpoint
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const query = searchParams.toString()
      if (query) {
        url += `?${query}`
      }
    }

    return this.request<T>(url, { ...config, method: 'GET' })
  }

  // POST リクエスト
  async post<T>(
    endpoint: string,
    body?: any,
    config: Omit<RequestConfig, 'method'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body })
  }

  // PUT リクエスト
  async put<T>(
    endpoint: string,
    body?: any,
    config: Omit<RequestConfig, 'method'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body })
  }

  // DELETE リクエスト
  async delete<T>(
    endpoint: string,
    params?: Record<string, any>,
    config: Omit<RequestConfig, 'method' | 'body'> = {}
  ): Promise<T> {
    let url = endpoint
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const query = searchParams.toString()
      if (query) {
        url += `?${query}`
      }
    }

    return this.request<T>(url, { ...config, method: 'DELETE' })
  }

  // PATCH リクエスト
  async patch<T>(
    endpoint: string,
    body?: any,
    config: Omit<RequestConfig, 'method'> = {}
  ): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body })
  }
}

// デフォルトのAPIクライアントインスタンス
export const apiClient = new ApiClient({
  baseURL: '',
  defaultHeaders: {
    'Content-Type': 'application/json'
  },
  onRequestStart: () => {},
  onRequestEnd: () => {},
  onError: (error) => {
    // エラー時のみログ出力
    console.error(`❌ API Error: ${error.status} ${error.code}`, error.message)
  }
})

// APIクライアントクラスをエクスポート（カスタム設定用）
export { ApiClient, ApiError }

// タイプセーフなAPIクライアント関数群
export const api = {
  // お気に入り関連
  interests: {
    list: (): Promise<ApiResponse<any[]>> => 
      apiClient.get('/api/interests'),
    
    add: (targetUserId: string, targetType: 'cfo' | 'company'): Promise<ApiResponse<any>> =>
      apiClient.post('/api/interests', { targetUserId, targetType }),
    
    remove: (targetUserId: string): Promise<ApiResponse<any>> =>
      apiClient.delete('/api/interests', { targetUserId })
  },

  // CFO関連
  cfos: {
    list: (params?: { limit?: number; page?: number }): Promise<ApiResponse<any[]>> =>
      apiClient.get('/api/cfos', params),
    
    get: (id: string): Promise<ApiResponse<any>> =>
      apiClient.get(`/api/cfos/${id}`),
  },

  // 企業関連
  companies: {
    list: (params?: { limit?: number; page?: number }): Promise<ApiResponse<any[]>> =>
      apiClient.get('/api/companies', params),
    
    get: (id: string): Promise<ApiResponse<any>> =>
      apiClient.get(`/api/companies/${id}`),
  },

  // スカウト関連
  scouts: {
    list: (params?: { type?: 'received' | 'sent' }): Promise<ApiResponse<any>> =>
      apiClient.get('/api/scouts', params),
    
    send: (data: {
      recipientId: string
      title: string
      message: string
      senderType: string
      recipientType: string
      urgency?: string
    }): Promise<ApiResponse<any>> =>
      apiClient.post('/api/scouts', data),
  },

  // プロフィール関連
  profile: {
    get: (): Promise<ApiResponse<any>> =>
      apiClient.get('/api/profile'),
    
    update: (data: any): Promise<ApiResponse<any>> =>
      apiClient.put('/api/profile', data),
  }
}

// レスポンス型チェック用ヘルパー
export function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiSuccessResponse<T> {
  return response.success === true
}

export function isErrorResponse(response: ApiResponse): response is ApiErrorResponse {
  return response.success === false
}