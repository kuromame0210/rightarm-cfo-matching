import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UserDropdown from '../UserDropdown'

describe('UserDropdown', () => {
  const defaultProps = {
    userName: 'テストユーザー',
    userEmail: 'test@example.com',
    userAvatar: '👤',
    showUserMenu: false,
    onToggleUserMenu: jest.fn(),
    onCloseUserMenu: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('基本表示', () => {
    it('ユーザーボタンが表示される', () => {
      render(<UserDropdown {...defaultProps} />)
      expect(screen.getByText('テストユーザー')).toBeInTheDocument()
      expect(screen.getByText('👤')).toBeInTheDocument()
    })

    it('ユーザーボタンをクリックするとonToggleUserMenuが呼ばれる', async () => {
      const user = userEvent.setup()
      render(<UserDropdown {...defaultProps} />)
      
      const userButton = screen.getByText('テストユーザー').closest('button')
      await user.click(userButton!)
      
      expect(defaultProps.onToggleUserMenu).toHaveBeenCalledTimes(1)
    })

    it('デフォルトプロップスが正しく動作する', () => {
      const minimalProps = {
        showUserMenu: false,
        onToggleUserMenu: jest.fn(),
        onCloseUserMenu: jest.fn(),
      }
      render(<UserDropdown {...minimalProps} />)
      
      expect(screen.getByText('山田さん')).toBeInTheDocument()
      expect(screen.getByText('👤')).toBeInTheDocument()
    })
  })

  describe('ドロップダウンメニュー', () => {
    const propsWithMenuOpen = {
      ...defaultProps,
      showUserMenu: true,
    }

    it('showUserMenuがtrueの時にドロップダウンが表示される', () => {
      render(<UserDropdown {...propsWithMenuOpen} />)
      
      expect(screen.getAllByText('テストユーザー')).toHaveLength(2) // ボタンとメニュー内
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
      expect(screen.getByText('プロフィール編集')).toBeInTheDocument()
      expect(screen.getByText('設定')).toBeInTheDocument()
      expect(screen.getByText('アクティビティ')).toBeInTheDocument()
      expect(screen.getByText('ログアウト')).toBeInTheDocument()
    })

    it('showUserMenuがfalseの時にドロップダウンが非表示になる', () => {
      render(<UserDropdown {...defaultProps} />)
      
      expect(screen.queryByText('test@example.com')).not.toBeInTheDocument()
      expect(screen.queryByText('プロフィール編集')).not.toBeInTheDocument()
    })

    it('メニュー項目に正しいリンクが設定されている', () => {
      render(<UserDropdown {...propsWithMenuOpen} />)
      
      const profileLink = screen.getByText('プロフィール編集').closest('a')
      expect(profileLink).toHaveAttribute('href', '/profile')
      
      const settingsLink = screen.getByText('設定').closest('a')
      expect(settingsLink).toHaveAttribute('href', '/settings')
      
      const activityLink = screen.getByText('アクティビティ').closest('a')
      expect(activityLink).toHaveAttribute('href', '/activity')
      
      const logoutLink = screen.getByText('ログアウト').closest('a')
      expect(logoutLink).toHaveAttribute('href', '/')
    })

    it('メニュー項目をクリックするとonCloseUserMenuが呼ばれる', async () => {
      const user = userEvent.setup()
      render(<UserDropdown {...propsWithMenuOpen} />)
      
      const profileLink = screen.getByText('プロフィール編集')
      await user.click(profileLink)
      
      expect(defaultProps.onCloseUserMenu).toHaveBeenCalledTimes(1)
    })
  })

  describe('外部クリック検知', () => {
    it('メニュー外をクリックするとonCloseUserMenuが呼ばれる', async () => {
      const user = userEvent.setup()
      const propsWithMenuOpen = {
        ...defaultProps,
        showUserMenu: true,
      }
      
      render(
        <div>
          <UserDropdown {...propsWithMenuOpen} />
          <div data-testid="outside">外部要素</div>
        </div>
      )
      
      const outsideElement = screen.getByTestId('outside')
      await user.click(outsideElement)
      
      expect(defaultProps.onCloseUserMenu).toHaveBeenCalledTimes(1)
    })

    it('メニュー内をクリックしてもonCloseUserMenuが呼ばれない', async () => {
      const user = userEvent.setup()
      const propsWithMenuOpen = {
        ...defaultProps,
        showUserMenu: true,
      }
      
      render(<UserDropdown {...propsWithMenuOpen} />)
      
      const menuContainer = screen.getByText('test@example.com').closest('div')
      await user.click(menuContainer!)
      
      expect(defaultProps.onCloseUserMenu).not.toHaveBeenCalled()
    })
  })

  describe('アクセシビリティ', () => {
    it('ユーザーボタンがボタン要素として正しく認識される', () => {
      render(<UserDropdown {...defaultProps} />)
      
      const userButton = screen.getByRole('button')
      expect(userButton).toBeInTheDocument()
      expect(userButton).toHaveTextContent('テストユーザー')
    })

    it('メニュー項目がリンクとして正しく認識される', () => {
      const propsWithMenuOpen = {
        ...defaultProps,
        showUserMenu: true,
      }
      render(<UserDropdown {...propsWithMenuOpen} />)
      
      const links = screen.getAllByRole('link')
      expect(links).toHaveLength(4) // プロフィール編集、設定、アクティビティ、ログアウト
      
      const linkTexts = links.map(link => link.textContent)
      expect(linkTexts).toContain('プロフィール編集')
      expect(linkTexts).toContain('設定')
      expect(linkTexts).toContain('アクティビティ')
      expect(linkTexts).toContain('ログアウト')
    })
  })

  describe('スタイリング', () => {
    it('ユーザーボタンに適切なスタイルクラスが適用されている', () => {
      render(<UserDropdown {...defaultProps} />)
      
      const userButton = screen.getByRole('button')
      expect(userButton).toHaveClass('flex', 'items-center', 'text-gray-700')
    })

    it('ドロップダウンメニューに適切なz-indexが設定されている', () => {
      const propsWithMenuOpen = {
        ...defaultProps,
        showUserMenu: true,
      }
      render(<UserDropdown {...propsWithMenuOpen} />)
      
      const dropdown = document.querySelector('.z-\\[9999\\]')
      expect(dropdown).toBeInTheDocument()
    })

    it('メニュー項目にホバー効果のクラスが設定されている', () => {
      const propsWithMenuOpen = {
        ...defaultProps,
        showUserMenu: true,
      }
      render(<UserDropdown {...propsWithMenuOpen} />)
      
      const profileLink = screen.getByText('プロフィール編集')
      expect(profileLink).toHaveClass('hover:bg-gray-100')
    })
  })
})