import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useAuth } from '@/lib/hooks/useAuth'
import AppHeader from '../AppHeader'

// 統一認証システムのモック
jest.mock('@/lib/hooks/useAuth')
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

// UserDropdownのモック
jest.mock('../UserDropdown', () => {
  return function MockUserDropdown({ 
    user, 
    isUserMenuOpen, 
    onToggleUserMenu, 
    onCloseUserMenu, 
    onLogout 
  }: any) {
    return (
      <div data-testid="user-dropdown">
        <button 
          onClick={onToggleUserMenu}
          data-testid="user-menu-toggle"
        >
          {user?.name || user?.email || 'User'}
        </button>
        {isUserMenuOpen && (
          <div data-testid="user-menu">
            <button onClick={onLogout} data-testid="logout-button">
              ログアウト
            </button>
          </div>
        )}
      </div>
    )
  }
})

describe('AppHeader', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    userType: 'company' as const,
    status: 'active',
    name: 'テストユーザー'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('認証されていない場合、ログインボタンが表示される', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      userType: null,
      status: null,
      login: jest.fn(),
      logout: jest.fn()
    })

    render(<AppHeader />)

    expect(screen.getByText('ログイン')).toBeInTheDocument()
    expect(screen.getByText('会員登録')).toBeInTheDocument()
    expect(screen.queryByTestId('user-dropdown')).not.toBeInTheDocument()
  })

  it('認証されている場合、ユーザードロップダウンが表示される', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      userType: 'company',
      status: 'active',
      login: jest.fn(),
      logout: jest.fn()
    })

    render(<AppHeader />)

    expect(screen.getByTestId('user-dropdown')).toBeInTheDocument()
    expect(screen.getByText('テストユーザー')).toBeInTheDocument()
    expect(screen.queryByText('ログイン')).not.toBeInTheDocument()
  })

  it('企業ユーザーの場合、適切なナビゲーションリンクが表示される', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      userType: 'company',
      status: 'active'
    })

    render(<AppHeader />)

    expect(screen.getByText('CFOを探す')).toBeInTheDocument()
    expect(screen.getByText('契約管理')).toBeInTheDocument()
    expect(screen.getByText('請求書')).toBeInTheDocument()
  })

  it('CFOユーザーの場合、適切なナビゲーションリンクが表示される', () => {
    const cfoUser = {
      ...mockUser,
      userType: 'cfo' as const
    }

    mockUseAuth.mockReturnValue({
      user: cfoUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      userType: 'cfo',
      status: 'active'
    })

    render(<AppHeader />)

    expect(screen.getByText('企業を探す')).toBeInTheDocument()
    expect(screen.getByText('契約管理')).toBeInTheDocument()
    expect(screen.getByText('請求書')).toBeInTheDocument()
  })

  it('ロゴクリックでホームページに遷移する', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      userType: 'company',
      status: 'active'
    })

    render(<AppHeader />)

    const logoLink = screen.getByText('RIGHTARM').closest('a')
    expect(logoLink).toHaveAttribute('href', '/home')
  })

  it('ユーザーメニューの開閉が正常に動作する', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      userType: 'company',
      status: 'active'
    })

    render(<AppHeader />)

    // 初期状態ではメニューが閉じている
    expect(screen.queryByTestId('user-menu')).not.toBeInTheDocument()

    // メニューを開く
    fireEvent.click(screen.getByTestId('user-menu-toggle'))
    await waitFor(() => {
      expect(screen.getByTestId('user-menu')).toBeInTheDocument()
    })

    // ログアウトボタンが表示される
    expect(screen.getByTestId('logout-button')).toBeInTheDocument()
  })

  it('ログアウト機能が正常に動作する', async () => {
    const mockLogout = jest.fn()
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: mockLogout,
      userType: 'company',
      status: 'active'
    })

    render(<AppHeader />)

    // メニューを開いてログアウトボタンをクリック
    fireEvent.click(screen.getByTestId('user-menu-toggle'))
    await waitFor(() => {
      expect(screen.getByTestId('user-menu')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('logout-button'))
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  it('ローディング中は適切に表示される', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: jest.fn(),
      logout: jest.fn(),
      userType: null,
      status: null
    })

    render(<AppHeader />)

    // ローディング中でもヘッダーは表示される
    expect(screen.getByText('RIGHTARM')).toBeInTheDocument()
  })

  it('認証されている場合、適切なナビゲーションが表示される', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      login: jest.fn(),
      logout: jest.fn(),
      userType: 'company',
      status: 'active'
    })

    render(<AppHeader />)

    // デスクトップ用ナビゲーションの確認
    expect(screen.getByText('企業を探す')).toBeInTheDocument()
    expect(screen.getByText('CFOを探す')).toBeInTheDocument()
    expect(screen.getByText('契約管理')).toBeInTheDocument()
    expect(screen.getByText('請求書')).toBeInTheDocument()

    // モバイル用ナビゲーションの確認
    expect(screen.getByText('ホーム')).toBeInTheDocument()
    expect(screen.getByText('スカウト')).toBeInTheDocument()
    expect(screen.getByText('メッセージ')).toBeInTheDocument()
    expect(screen.getByText('面談予定')).toBeInTheDocument()
  })
})