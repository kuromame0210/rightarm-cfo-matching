// テスト支援ユーティリティ
// Phase 6: Test Strengthening

import React, { ReactElement } from 'react'
import { render, RenderOptions, RenderResult } from '@testing-library/react'
// AuthProvider は NextAuth.js のSessionProviderに統合されました
import { InterestsProvider } from './interests-context'
import { Providers } from './providers'

// Jest mock function type
interface JestMockFn {
  (): any
}

// Declare global jest type
declare global {
  const jest: any
}

// Mock jest functions when jest is not available
const mockFn = (): JestMockFn => (() => {}) as any

// カスタムレンダー関数
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // プロバイダーのモック設定
  authProviderProps?: {
    initialUser?: any
    initialIsAuthenticated?: boolean
  }
  // 特定のプロバイダーを除外
  excludeProviders?: ('auth' | 'interests')[]
}

// 全プロバイダーでラップするレンダー
export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult {
  const { excludeProviders = [], ...renderOptions } = options

  function AllTheProviders({ children }: { children: React.ReactNode }) {
    if (excludeProviders.includes('auth') && excludeProviders.includes('interests')) {
      return <>{children}</>
    }
    
    if (excludeProviders.includes('auth')) {
      return <InterestsProvider>{children}</InterestsProvider>
    }
    
    if (excludeProviders.includes('interests')) {
      return <Providers>{children}</Providers>
    }
    
    return <Providers>{children}</Providers>
  }

  return render(ui, { wrapper: AllTheProviders, ...renderOptions })
}

// APIクライアントのモック
export const mockApiClient = {
  interests: {
    list: typeof jest !== 'undefined' ? jest.fn() : mockFn(),
    add: typeof jest !== 'undefined' ? jest.fn() : mockFn(),
    remove: typeof jest !== 'undefined' ? jest.fn() : mockFn()
  },
  cfos: {
    list: typeof jest !== 'undefined' ? jest.fn() : mockFn(),
    get: typeof jest !== 'undefined' ? jest.fn() : mockFn()
  },
  companies: {
    list: typeof jest !== 'undefined' ? jest.fn() : mockFn(),
    get: typeof jest !== 'undefined' ? jest.fn() : mockFn()
  },
  scouts: {
    list: typeof jest !== 'undefined' ? jest.fn() : mockFn(),
    send: typeof jest !== 'undefined' ? jest.fn() : mockFn()
  },
  profile: {
    get: typeof jest !== 'undefined' ? jest.fn() : mockFn(),
    update: typeof jest !== 'undefined' ? jest.fn() : mockFn()
  }
}

// 認証コンテキストのモック
export const mockAuthContext = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    userType: 'company' as const,
    displayName: 'テストユーザー'
  },
  isAuthenticated: true,
  userProfile: null,
  login: typeof jest !== 'undefined' ? jest.fn() : mockFn(),
  logout: typeof jest !== 'undefined' ? jest.fn() : mockFn(),
  updateProfile: typeof jest !== 'undefined' ? jest.fn() : mockFn()
}

// お気に入りコンテキストのモック
export const mockInterestsContext = {
  interests: [],
  loading: false,
  error: null,
  isInterested: typeof jest !== 'undefined' ? jest.fn(() => false) : mockFn(),
  addInterest: typeof jest !== 'undefined' ? jest.fn(() => Promise.resolve(true)) : mockFn(),
  removeInterest: typeof jest !== 'undefined' ? jest.fn(() => Promise.resolve(true)) : mockFn(),
  toggleInterest: typeof jest !== 'undefined' ? jest.fn(() => Promise.resolve(true)) : mockFn(),
  refetchInterests: typeof jest !== 'undefined' ? jest.fn(() => Promise.resolve()) : mockFn(),
  getInterestStats: typeof jest !== 'undefined' ? jest.fn(() => ({
    totalCount: 0,
    cfoCount: 0,
    companyCount: 0
  })) : mockFn()
}

// テストデータファクトリー
export const testDataFactory = {
  // CFOテストデータ
  createCFO: (overrides: Partial<any> = {}) => ({
    id: 'cfo-test-1',
    name: 'テストCFO',
    nickname: 'テストニックネーム',
    photoUrl: '👤',
    experience: '10年以上の経験',
    skills: ['資金調達', 'IPO準備'],
    achievements: ['IPO成功', '100億円調達'],
    certifications: ['公認会計士'],
    workStyle: 'リモート可',
    compensationRange: '100-200万円',
    introduction: 'CFOとしての経験が豊富です',
    rating: 4.8,
    reviewCount: 15,
    available: true,
    ...overrides
  }),

  // 企業テストデータ
  createCompany: (overrides: Partial<any> = {}) => ({
    id: 'company-test-1',
    companyName: 'テスト株式会社',
    businessName: 'テスト事業',
    logo: '🏢',
    industry: 'IT・Web',
    overview: '革新的なサービスを提供する企業',
    revenue: '10億円〜',
    employeeCount: '50-100名',
    location: '東京',
    challenges: ['資金調達', 'IPO準備'],
    challengeBackground: '成長資金が必要',
    cfoRequirements: '経験豊富なCFOを求める',
    timeline: '2024年〜',
    compensation: '相談可能',
    urgency: 'medium' as const,
    rating: 4.2,
    reviewCount: 8,
    ...overrides
  }),

  // お気に入りテストデータ
  createInterest: (overrides: Partial<any> = {}) => ({
    id: 'interest-test-1',
    target_user_id: 'target-user-1',
    target_type: 'cfo' as const,
    created_at: new Date().toISOString(),
    ...overrides
  }),

  // ユーザーテストデータ
  createUser: (overrides: Partial<any> = {}) => ({
    id: 'user-test-1',
    email: 'test@example.com',
    userType: 'company' as const,
    displayName: 'テストユーザー',
    emailVerified: true,
    ...overrides
  })
}

// テスト用のイベントモック
export const mockEvent = {
  click: (target?: Partial<EventTarget>) => ({
    currentTarget: {
      getBoundingClientRect: () => ({
        left: 100,
        top: 100,
        width: 50,
        height: 30
      }),
      ...target
    },
    preventDefault: typeof jest !== 'undefined' ? jest.fn() : mockFn(),
    stopPropagation: typeof jest !== 'undefined' ? jest.fn() : mockFn()
  }),

  input: (value: string) => ({
    target: {
      value
    },
    preventDefault: typeof jest !== 'undefined' ? jest.fn() : mockFn()
  })
}

// APIレスポンスのモック
export const mockApiResponse = {
  success: <T,>(data: T, message?: string) => ({
    success: true as const,
    data,
    ...(message && { message })
  }),

  error: (message: string, code?: string, details?: any) => ({
    success: false as const,
    error: {
      message,
      ...(code && { code }),
      ...(details && { details })
    }
  }),

  paginated: <T,>(data: T[], pagination: any) => ({
    success: true as const,
    data,
    meta: {
      pagination
    }
  })
}

// ローカルストレージのモック
export const mockLocalStorage = {
  data: {} as Record<string, string>,
  
  getItem: typeof jest !== 'undefined' ? jest.fn((key: string) => mockLocalStorage.data[key] || null) : mockFn(),
  setItem: typeof jest !== 'undefined' ? jest.fn((key: string, value: string) => {
    mockLocalStorage.data[key] = value
  }) : mockFn(),
  removeItem: typeof jest !== 'undefined' ? jest.fn((key: string) => {
    delete mockLocalStorage.data[key]
  }) : mockFn(),
  clear: typeof jest !== 'undefined' ? jest.fn(() => {
    mockLocalStorage.data = {}
  }) : mockFn()
}

// フェッチのモック
export const mockFetch = typeof jest !== 'undefined' ? jest.fn() : mockFn()

// セットアップ関数
export function setupMocks() {
  // localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage
  })

  // fetch
  global.fetch = mockFetch

  // console.log/error を抑制（テスト時）
  if (process.env.NODE_ENV === 'test' && typeof jest !== 'undefined') {
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  }
}

// クリーンアップ関数
export function cleanupMocks() {
  if (typeof jest !== 'undefined') {
    jest.clearAllMocks()
    mockFetch.mockReset()
  }
  mockLocalStorage.clear()
}

// テスト用のカスタムフック
export function useTestPerformance() {
  const measurements: Record<string, number[]> = {}
  
  return {
    start: (label: string) => {
      const startTime = performance.now()
      return () => {
        const duration = performance.now() - startTime
        if (!measurements[label]) {
          measurements[label] = []
        }
        measurements[label].push(duration)
        return duration
      }
    },
    getMeasurements: () => measurements,
    clear: () => {
      Object.keys(measurements).forEach(key => {
        delete measurements[key]
      })
    }
  }
}

// 非同期テスト用のヘルパー
export async function waitForAsyncOperation(
  operation: () => Promise<any>,
  timeout = 5000
): Promise<any> {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    try {
      return await operation()
    } catch (error) {
      // 短時間待ってリトライ
      await new Promise(resolve => setTimeout(resolve, 10))
    }
  }
  
  throw new Error(`Operation timed out after ${timeout}ms`)
}

// テスト環境かどうかの判定
export const isTestEnvironment = () => {
  return process.env.NODE_ENV === 'test' || 
         process.env.JEST_WORKER_ID !== undefined
}

// デバッグ用の情報出力
export function debugTestState(label: string, state: any) {
  if (!isTestEnvironment()) {
    console.log(`[DEBUG ${label}]:`, state)
  }
}