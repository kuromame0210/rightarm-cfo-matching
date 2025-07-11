import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// カスタムレンダー関数
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {children}
    </div>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// テスト用のモックデータ
export const mockCFOProfile = {
  id: 1,
  name: 'テストCFO',
  nickname: 'テストニックネーム',
  profileImage: '/test-avatar.jpg',
  photoUrl: '👤',
  skills: ['資金調達', 'IPO準備', '管理会計'],
  experience: 'テストCFOの経歴',
  achievements: [
    'テスト実績1',
    'テスト実績2',
    'テスト実績3',
  ],
  certifications: ['公認会計士', 'CFA'],
  workStyle: 'リモート可・週2日〜',
  workPreference: 'テスト希望',
  compensation: '月100万円〜',
  compensationRange: '月100万円〜150万円',
  introduction: 'テスト自己紹介文',
  hasPhoto: true,
  rating: 4.5,
  reviewCount: 10,
  available: true,
}

export const mockCompanyProfile = {
  id: 1,
  companyName: 'テスト株式会社',
  businessName: 'テスト事業',
  logo: '🏢',
  industry: 'IT・ソフトウェア',
  overview: 'テスト企業の概要',
  revenue: '年商10億円',
  employeeCount: '100名',
  location: '東京都',
  challenges: ['資金調達', 'IPO準備'],
  challengeBackground: 'テスト課題の背景',
  challengeDetails: [
    'テスト課題詳細1',
    'テスト課題詳細2',
  ],
  cfoRequirements: 'テストCFO要件',
  requiredSkills: ['資金調達', 'IPO準備'],
  timeline: '2024年4月〜',
  expectedDuration: '1年間',
  compensation: '月100万円〜',
  workStyle: 'ハイブリッド',
  description: 'テスト企業の説明',
  urgency: 'high',
  rating: 4.2,
  reviewCount: 5,
}

// モック関数のヘルパー
export const createMockCallback = () => jest.fn()

// テスト用のイベントハンドラー
export const mockEventHandlers = {
  onClick: jest.fn(),
  onChange: jest.fn(),
  onSubmit: jest.fn(),
  onToggle: jest.fn(),
}

// ローカルストレージのモック
export const mockLocalStorage = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] || null,
  }
})()

// セッションストレージのモック
export const mockSessionStorage = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] || null,
  }
})()

// Date のモック
export const mockDate = (dateString: string) => {
  const mockDateInstance = new Date(dateString)
  jest.spyOn(global, 'Date').mockImplementation(() => mockDateInstance)
  return mockDateInstance
}

// setTimeout のモック
export const mockTimeout = () => {
  jest.useFakeTimers()
  return {
    advanceTime: (ms: number) => jest.advanceTimersByTime(ms),
    restoreTime: () => jest.useRealTimers(),
  }
}

// フェッチAPIのモック
export const mockFetch = (responseData: any, ok: boolean = true) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 400,
    json: async () => responseData,
    text: async () => JSON.stringify(responseData),
  })
}

// コンソールメソッドのモック
export const mockConsole = () => {
  const originalConsole = { ...console }
  
  beforeAll(() => {
    global.console = {
      ...console,
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
    }
  })

  afterAll(() => {
    global.console = originalConsole
  })
}

// カスタムアサーション
export const expectElementToHaveClasses = (element: HTMLElement, classes: string[]) => {
  classes.forEach(className => {
    expect(element).toHaveClass(className)
  })
}

export const expectElementNotToHaveClasses = (element: HTMLElement, classes: string[]) => {
  classes.forEach(className => {
    expect(element).not.toHaveClass(className)
  })
}