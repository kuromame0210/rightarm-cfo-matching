// 統一認証システム - NextAuth.js専用型定義
// レガシー認証システムの型定義は削除済み

// 一般的な認証データ型（NextAuth.jsに依存しない）
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  user_type: 'cfo' | 'company'
  display_name?: string
}

// API Response型（NextAuth.jsセッション情報と互換性保持）
export interface AuthResponse {
  success: boolean
  data?: {
    user: {
      id: string
      email: string
      userType: 'company' | 'cfo'
      status: string
      name: string
    }
    token?: string
  }
  message?: string
  error?: string
}

// 将来的な拡張用（現在は使用しない）
export interface AuthContextType {
  user: {
    id: string
    email: string
    userType: 'company' | 'cfo'
    status: string
    name: string
  } | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<AuthResponse>
  logout: () => void
}