import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useAuth } from '@/lib/hooks/useAuth'
import ContractsPage from '../contracts/page'

// 統一認証システムのモック
jest.mock('@/lib/hooks/useAuth')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// AppHeaderのモック
jest.mock('@/components/AppHeader', () => {
  return function MockAppHeader() {
    return <header data-testid="app-header">App Header</header>
  }
})

// fetchのモック
global.fetch = jest.fn()

const mockContracts = [
  {
    id: '1',
    status: 'active',
    monthly_fee: 500000,
    contract_period: 12,
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    created_at: '2024-01-01T00:00:00Z',
    rightarm_companies: {
      company_name: 'テスト株式会社',
      business_name: 'テスト事業',
      industry: 'IT',
      rightarm_users: [{
        email: 'company@test.com',
        rightarm_user_profiles: [{
          display_name: '企業担当者'
        }]
      }]
    },
    rightarm_cfos: {
      specialization: '財務戦略',
      years_of_experience: 10,
      rightarm_users: [{
        email: 'cfo@test.com',
        rightarm_user_profiles: [{
          display_name: 'テストCFO',
          nickname: 'CFO太郎'
        }]
      }]
    }
  },
  {
    id: '2',
    status: 'draft',
    monthly_fee: 300000,
    contract_period: 6,
    start_date: '2024-02-01',
    created_at: '2024-02-01T00:00:00Z',
    rightarm_companies: {
      company_name: 'サンプル企業',
      business_name: 'サンプル事業',
      industry: '製造業',
      rightarm_users: [{
        email: 'sample@test.com',
        rightarm_user_profiles: [{
          display_name: 'サンプル担当者'
        }]
      }]
    },
    rightarm_cfos: {
      specialization: 'コスト管理',
      years_of_experience: 8,
      rightarm_users: [{
        email: 'cfo2@test.com',
        rightarm_user_profiles: [{
          display_name: 'サンプルCFO'
        }]
      }]
    }
  }
]

describe('ContractsPage', () => {
  const mockCompanyUser = {
    id: '1',
    email: 'company@test.com',
    user_type: 'company' as const,
    profile: {
      display_name: '企業ユーザー',
      region: '東京都'
    }
  }

  const mockCfoUser = {
    id: '2',
    email: 'cfo@test.com',
    user_type: 'cfo' as const,
    profile: {
      display_name: 'CFOユーザー',
      region: '大阪府'
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
  })

  it('認証されていない場合、認証が必要ですメッセージが表示される', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      userType: 'company',
      status: 'active'
    })

    render(<ContractsPage />)

    expect(screen.getByText('認証が必要です')).toBeInTheDocument()
  })

  it('ローディング中はスピナーが表示される', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: jest.fn(),
      logout: jest.fn(),
      userType: 'company',
      status: 'active'
    })

    render(<ContractsPage />)

    expect(screen.getByRole('status', { name: /loading/i })).toBeInTheDocument()
  })

  it('企業ユーザーの場合、新規契約作成ボタンが表示される', async () => {
    mockUseAuth.mockReturnValue({
      user: mockCompanyUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      userType: 'company',
      status: 'active'
    })

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: mockContracts,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      })
    })

    render(<ContractsPage />)

    await waitFor(() => {
      expect(screen.getByText('新規契約作成')).toBeInTheDocument()
    })

    const createButton = screen.getByText('新規契約作成')
    expect(createButton.closest('a')).toHaveAttribute('href', '/contracts/new')
  })

  it('CFOユーザーの場合、新規契約作成ボタンが表示されない', async () => {
    mockUseAuth.mockReturnValue({
      user: mockCfoUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      userType: 'company',
      status: 'active'
    })

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: mockContracts,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      })
    })

    render(<ContractsPage />)

    await waitFor(() => {
      expect(screen.queryByText('新規契約作成')).not.toBeInTheDocument()
    })
  })

  it('契約一覧が正しく表示される', async () => {
    mockUseAuth.mockReturnValue({
      user: mockCompanyUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      userType: 'company',
      status: 'active'
    })

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: mockContracts,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      })
    })

    render(<ContractsPage />)

    await waitFor(() => {
      expect(screen.getByText('テストCFOとの契約')).toBeInTheDocument()
      expect(screen.getByText('サンプルCFOとの契約')).toBeInTheDocument()
    })

    // 金額が正しく表示される
    expect(screen.getByText('月額 500,000円')).toBeInTheDocument()
    expect(screen.getByText('月額 300,000円')).toBeInTheDocument()

    // ステータスが表示される
    expect(screen.getByText('進行中')).toBeInTheDocument()
    expect(screen.getByText('下書き')).toBeInTheDocument()
  })

  it('フィルター機能が正常に動作する', async () => {
    mockUseAuth.mockReturnValue({
      user: mockCompanyUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      userType: 'company',
      status: 'active'
    })

    ;(fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        success: true,
        data: mockContracts,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      })
    })

    render(<ContractsPage />)

    await waitFor(() => {
      expect(screen.getByText('すべて')).toBeInTheDocument()
    })

    // 進行中フィルターをクリック
    const activeFilter = screen.getByText('進行中')
    fireEvent.click(activeFilter)

    // APIが適切なパラメータで呼ばれることを確認
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=active'),
        expect.any(Object)
      )
    })
  })

  it('契約がない場合、適切なメッセージが表示される', async () => {
    mockUseAuth.mockReturnValue({
      user: mockCompanyUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      userType: 'company',
      status: 'active'
    })

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      })
    })

    render(<ContractsPage />)

    await waitFor(() => {
      expect(screen.getByText('契約がまだありません')).toBeInTheDocument()
      expect(screen.getByText('CFOと契約を結んでプロジェクトを開始しましょう')).toBeInTheDocument()
    })

    // CFOを探すリンクが表示される
    const exploreCfoLink = screen.getByText('CFOを探す')
    expect(exploreCfoLink.closest('a')).toHaveAttribute('href', '/discover/cfos')
  })

  it('エラーが発生した場合、エラーメッセージが表示される', async () => {
    mockUseAuth.mockReturnValue({
      user: mockCompanyUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      userType: 'company',
      status: 'active'
    })

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: false,
        error: 'データの取得に失敗しました'
      })
    })

    render(<ContractsPage />)

    await waitFor(() => {
      expect(screen.getByText('データの取得に失敗しました')).toBeInTheDocument()
    })
  })

  it('ネットワークエラーが発生した場合、適切なエラーメッセージが表示される', async () => {
    mockUseAuth.mockReturnValue({
      user: mockCompanyUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      userType: 'company',
      status: 'active'
    })

    ;(fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    render(<ContractsPage />)

    await waitFor(() => {
      expect(screen.getByText('ネットワークエラーが発生しました')).toBeInTheDocument()
    })
  })

  it('ページネーション機能が正常に動作する', async () => {
    mockUseAuth.mockReturnValue({
      user: mockCompanyUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      userType: 'company',
      status: 'active'
    })

    ;(fetch as jest.Mock).mockResolvedValue({
      json: async () => ({
        success: true,
        data: mockContracts,
        pagination: { page: 1, limit: 10, total: 25, totalPages: 3 }
      })
    })

    render(<ContractsPage />)

    await waitFor(() => {
      expect(screen.getByText('1 / 3')).toBeInTheDocument()
    })

    // 次へボタンをクリック
    const nextButton = screen.getByText('次へ')
    fireEvent.click(nextButton)

    // 2ページ目のAPIが呼ばれることを確認
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Object)
      )
    })
  })

  it('契約詳細リンクが正しく設定される', async () => {
    mockUseAuth.mockReturnValue({
      user: mockCompanyUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      userType: 'company',
      status: 'active'
    })

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: mockContracts,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      })
    })

    render(<ContractsPage />)

    await waitFor(() => {
      const detailButtons = screen.getAllByText('詳細')
      expect(detailButtons[0].closest('a')).toHaveAttribute('href', '/contracts/1')
      expect(detailButtons[1].closest('a')).toHaveAttribute('href', '/contracts/2')
    })
  })

  it('下書きステータスの契約で編集ボタンが表示される（企業ユーザーのみ）', async () => {
    mockUseAuth.mockReturnValue({
      user: mockCompanyUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      userType: 'company',
      status: 'active'
    })

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => ({
        success: true,
        data: mockContracts,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      })
    })

    render(<ContractsPage />)

    await waitFor(() => {
      const editButton = screen.getByText('編集')
      expect(editButton.closest('a')).toHaveAttribute('href', '/contracts/2/edit')
    })
  })
})