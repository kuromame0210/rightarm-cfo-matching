// お気に入り機能のテスト
// Phase 6: Test Strengthening

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useInterests } from '../lib/interests-context'
import { Providers } from '../lib/providers'
import { 
  testDataFactory, 
  mockApiResponse, 
  mockFetch, 
  setupMocks, 
  cleanupMocks 
} from '../lib/test-utils'

// テスト用のコンポーネント
function TestComponent() {
  const { 
    interests, 
    loading, 
    error, 
    isInterested, 
    addInterest, 
    removeInterest, 
    toggleInterest,
    getInterestStats 
  } = useInterests()

  return (
    <div>
      <div data-testid="loading">{loading.toString()}</div>
      <div data-testid="error">{error || 'null'}</div>
      <div data-testid="interests-count">{interests.length}</div>
      <div data-testid="stats">{JSON.stringify(getInterestStats())}</div>
      
      <button 
        data-testid="check-interested"
        onClick={() => {
          const result = isInterested('test-user-1')
          const element = document.getElementById('interested-result')
          if (element) element.textContent = result.toString()
        }}
      >
        Check Interested
      </button>
      
      <button 
        data-testid="add-interest"
        onClick={() => addInterest('test-user-1', 'cfo')}
      >
        Add Interest
      </button>
      
      <button 
        data-testid="remove-interest"
        onClick={() => removeInterest('test-user-1')}
      >
        Remove Interest
      </button>
      
      <button 
        data-testid="toggle-interest"
        onClick={() => toggleInterest('test-user-1', 'cfo')}
      >
        Toggle Interest
      </button>
      
      <div id="interested-result" data-testid="interested-result"></div>
    </div>
  )
}

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <Providers>
      {ui}
    </Providers>
  )
}

describe('InterestsProvider', () => {
  beforeEach(() => {
    setupMocks()
  })

  afterEach(() => {
    cleanupMocks()
  })

  test('初期状態でローディング中になる', async () => {
    // API応答をモック
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse.success([]))
    })

    renderWithProviders(<TestComponent />)
    
    // 初期状態はloading=true
    expect(screen.getByTestId('loading')).toHaveTextContent('true')
    
    // ローディング完了を待つ
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })
  })

  test('APIからお気に入りリストを正常に取得する', async () => {
    const mockInterests = [
      testDataFactory.createInterest({ id: '1', target_user_id: 'user-1' }),
      testDataFactory.createInterest({ id: '2', target_user_id: 'user-2' })
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse.success(mockInterests))
    })

    renderWithProviders(<TestComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('interests-count')).toHaveTextContent('2')
    })

    expect(screen.getByTestId('error')).toHaveTextContent('null')
  })

  test('API エラー時にエラーメッセージが表示される', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve(mockApiResponse.error('API Error'))
    })

    renderWithProviders(<TestComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('API Error')
    })
  })

  test('isInterested が正しく動作する', async () => {
    const mockInterests = [
      testDataFactory.createInterest({ target_user_id: 'test-user-1' })
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse.success(mockInterests))
    })

    renderWithProviders(<TestComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    fireEvent.click(screen.getByTestId('check-interested'))
    
    expect(screen.getByTestId('interested-result')).toHaveTextContent('true')
  })

  test('addInterest が正常に動作する', async () => {
    // 初期データのモック
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse.success([]))
    })

    // addInterest APIのモック
    const newInterest = testDataFactory.createInterest({ 
      id: 'new-interest',
      target_user_id: 'test-user-1' 
    })
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse.success(newInterest))
    })

    renderWithProviders(<TestComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    fireEvent.click(screen.getByTestId('add-interest'))
    
    await waitFor(() => {
      expect(screen.getByTestId('interests-count')).toHaveTextContent('1')
    })
  })

  test('removeInterest が正常に動作する', async () => {
    const mockInterests = [
      testDataFactory.createInterest({ target_user_id: 'test-user-1' })
    ]

    // 初期データのモック
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse.success(mockInterests))
    })

    // removeInterest APIのモック
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse.success(null))
    })

    renderWithProviders(<TestComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('interests-count')).toHaveTextContent('1')
    })

    fireEvent.click(screen.getByTestId('remove-interest'))
    
    await waitFor(() => {
      expect(screen.getByTestId('interests-count')).toHaveTextContent('0')
    })
  })

  test('toggleInterest が正常に動作する（追加）', async () => {
    // 初期データのモック（空）
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse.success([]))
    })

    // toggleInterest APIのモック（追加）
    const newInterest = testDataFactory.createInterest({ 
      target_user_id: 'test-user-1' 
    })
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse.success(newInterest))
    })

    renderWithProviders(<TestComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    fireEvent.click(screen.getByTestId('toggle-interest'))
    
    await waitFor(() => {
      expect(screen.getByTestId('interests-count')).toHaveTextContent('1')
    })
  })

  test('統計情報が正しく計算される', async () => {
    const mockInterests = [
      testDataFactory.createInterest({ target_type: 'cfo' }),
      testDataFactory.createInterest({ target_type: 'cfo' }),
      testDataFactory.createInterest({ target_type: 'company' })
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse.success(mockInterests))
    })

    renderWithProviders(<TestComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    const statsText = screen.getByTestId('stats').textContent
    const stats = JSON.parse(statsText || '{}')
    
    expect(stats.totalCount).toBe(3)
    expect(stats.cfoCount).toBe(2)
    expect(stats.companyCount).toBe(1)
  })

  test('ネットワークエラー時にローカルストレージからフォールバックする', async () => {
    // ローカルストレージにデータを設定
    const localInterests = ['user-1', 'user-2']
    window.localStorage.setItem('rextrix_interested_profiles', JSON.stringify(localInterests))

    // API エラーをシミュレート
    mockFetch.mockRejectedValueOnce(new Error('Network Error'))

    renderWithProviders(<TestComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    })

    // フォールバックデータが読み込まれる
    expect(screen.getByTestId('interests-count')).toHaveTextContent('2')
  })
})

describe('useInterests hook', () => {
  test('InterestsProvider外で使用するとエラーになる', () => {
    // コンソールエラーを抑制
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponent />)
    }).toThrow('useInterests must be used within an InterestsProvider')
    
    consoleError.mockRestore()
  })
})