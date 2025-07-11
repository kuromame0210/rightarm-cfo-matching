import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomePage from '../../home/page'

// Mock AppHeader component
jest.mock('@/components/AppHeader', () => {
  return function MockAppHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
    return <div data-testid="app-header">AppHeader - LoggedIn: {isLoggedIn.toString()}</div>
  }
})

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('基本表示', () => {
    it('AppHeaderが表示される', () => {
      render(<HomePage />)
      expect(screen.getByTestId('app-header')).toBeInTheDocument()
      expect(screen.getByTestId('app-header')).toHaveTextContent('LoggedIn: true')
    })

    it('メインタイトルが表示される', () => {
      render(<HomePage />)
      expect(screen.getByText('募集中のCFO一覧')).toBeInTheDocument()
    })

    it('検索・絞り込みサイドバーが表示される', () => {
      render(<HomePage />)
      expect(screen.getByText('検索・絞り込み')).toBeInTheDocument()
      expect(screen.getByText('キーワード検索')).toBeInTheDocument()
      expect(screen.getByText('専門スキル')).toBeInTheDocument()
    })

    it('CFOプロフィールカードが表示される', () => {
      render(<HomePage />)
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
      expect(screen.getByText('田中 花子')).toBeInTheDocument()
      expect(screen.getByText('佐藤 次郎')).toBeInTheDocument()
    })
  })

  describe('検索機能', () => {
    it('キーワード検索フィールドに入力できる', async () => {
      const user = userEvent.setup()
      render(<HomePage />)
      
      const searchInput = screen.getByPlaceholderText('CFOの名前やスキル')
      await user.type(searchInput, '山田')
      
      expect(searchInput).toHaveValue('山田')
    })

    it('スキルフィルターが選択できる', async () => {
      const user = userEvent.setup()
      render(<HomePage />)
      
      const skillCheckbox = screen.getByRole('checkbox', { name: '資金調達' })
      await user.click(skillCheckbox)
      
      expect(skillCheckbox).toBeChecked()
    })

    it('地域フィルターが変更できる', async () => {
      const user = userEvent.setup()
      render(<HomePage />)
      
      const regionSelect = screen.getByRole('combobox', { name: /地域/ })
      await user.selectOptions(regionSelect, '東京')
      
      expect(regionSelect).toHaveValue('東京')
    })
  })

  describe('CFOプロフィールカード', () => {
    it('CFOの基本情報が表示される', () => {
      render(<HomePage />)
      
      // 山田太郎のプロフィール確認
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
      expect(screen.getByText('戦略CFO山田')).toBeInTheDocument()
      expect(screen.getByText('大手証券会社で15年勤務後、5社のIPOをリード。累計調達額200億円以上の実績')).toBeInTheDocument()
      expect(screen.getByText('月100万円〜150万円')).toBeInTheDocument()
    })

    it('スキルタグが表示される', () => {
      render(<HomePage />)
      
      expect(screen.getByText('資金調達')).toBeInTheDocument()
      expect(screen.getByText('IPO準備')).toBeInTheDocument()
      expect(screen.getByText('銀行融資')).toBeInTheDocument()
      expect(screen.getByText('投資家対応')).toBeInTheDocument()
    })

    it('実績リストが表示される', () => {
      render(<HomePage />)
      
      expect(screen.getByText('シリーズA〜C資金調達支援：15社')).toBeInTheDocument()
      expect(screen.getByText('IPO実行支援：5社（マザーズ3社、プライム2社）')).toBeInTheDocument()
    })

    it('保有資格が表示される', () => {
      render(<HomePage />)
      
      expect(screen.getByText('公認会計士')).toBeInTheDocument()
      expect(screen.getByText('CFA')).toBeInTheDocument()
      expect(screen.getByText('MBA(ファイナンス)')).toBeInTheDocument()
    })

    it('対応可能/満員ステータスが表示される', () => {
      render(<HomePage />)
      
      const availableStatus = screen.getAllByText('対応可能')
      const unavailableStatus = screen.getAllByText('満員')
      
      expect(availableStatus.length).toBeGreaterThan(0)
      expect(unavailableStatus.length).toBeGreaterThan(0)
    })
  })

  describe('アクション機能', () => {
    it('詳細ボタンが正しいリンクになっている', () => {
      render(<HomePage />)
      
      const detailLinks = screen.getAllByText('📋 詳細へ')
      expect(detailLinks[0].closest('a')).toHaveAttribute('href', '/cfo/1')
      expect(detailLinks[1].closest('a')).toHaveAttribute('href', '/cfo/2')
    })

    it('気になるボタンをクリックすると状態が変わる', async () => {
      const user = userEvent.setup()
      render(<HomePage />)
      
      const interestedButtons = screen.getAllByText('🤍 気になる')
      const firstButton = interestedButtons[0]
      
      await user.click(firstButton)
      
      expect(screen.getByText('❤️ 気になる')).toBeInTheDocument()
    })

    it('スカウトボタンをクリックするとモーダルが表示される', async () => {
      const user = userEvent.setup()
      render(<HomePage />)
      
      const scoutButtons = screen.getAllByText('スカウト')
      const firstButton = scoutButtons[0]
      
      await user.click(firstButton)
      
      expect(screen.getByText('🎯 スカウト送信')).toBeInTheDocument()
      expect(screen.getByText('このCFOにスカウトを送信しますか？')).toBeInTheDocument()
    })

    it('対応不可CFOのスカウトボタンが無効になっている', () => {
      render(<HomePage />)
      
      const unavailableButtons = screen.getAllByText('対応不可')
      expect(unavailableButtons[0]).toBeDisabled()
    })
  })

  describe('スカウトモーダル', () => {
    it('スカウトモーダルを開いてキャンセルできる', async () => {
      const user = userEvent.setup()
      render(<HomePage />)
      
      // スカウトボタンをクリック
      const scoutButtons = screen.getAllByText('スカウト')
      await user.click(scoutButtons[0])
      
      expect(screen.getByText('🎯 スカウト送信')).toBeInTheDocument()
      
      // キャンセルボタンをクリック
      const cancelButton = screen.getByText('キャンセル')
      await user.click(cancelButton)
      
      expect(screen.queryByText('🎯 スカウト送信')).not.toBeInTheDocument()
    })

    it('スカウトメッセージを入力して送信できる', async () => {
      const user = userEvent.setup()
      render(<HomePage />)
      
      // スカウトボタンをクリック
      const scoutButtons = screen.getAllByText('スカウト')
      await user.click(scoutButtons[0])
      
      // メッセージ入力
      const messageTextarea = screen.getByPlaceholderText('スカウトメッセージを入力してください...')
      await user.type(messageTextarea, 'テストメッセージ')
      
      expect(messageTextarea).toHaveValue('テストメッセージ')
      
      // 送信ボタンをクリック
      const sendButton = screen.getByText('送信')
      await user.click(sendButton)
      
      // モーダルが閉じる
      expect(screen.queryByText('🎯 スカウト送信')).not.toBeInTheDocument()
    })

    it('モーダルのXボタンで閉じることができる', async () => {
      const user = userEvent.setup()
      render(<HomePage />)
      
      // スカウトボタンをクリック
      const scoutButtons = screen.getAllByText('スカウト')
      await user.click(scoutButtons[0])
      
      expect(screen.getByText('🎯 スカウト送信')).toBeInTheDocument()
      
      // Xボタンをクリック
      const closeButton = screen.getByText('✕')
      await user.click(closeButton)
      
      expect(screen.queryByText('🎯 スカウト送信')).not.toBeInTheDocument()
    })
  })

  describe('モバイル対応', () => {
    it('モバイル用検索バーが存在する', () => {
      render(<HomePage />)
      
      // モバイル用検索バーは md:hidden クラスで非表示
      const mobileSearchBars = screen.getAllByPlaceholderText('CFOの名前やスキル')
      expect(mobileSearchBars.length).toBeGreaterThan(1) // PC用とモバイル用
    })

    it('モバイル用絞り込みボタンが存在する', () => {
      render(<HomePage />)
      
      const filterButton = screen.getByText('絞り込み設定 ▼')
      expect(filterButton).toBeInTheDocument()
    })

    it('モバイル用絞り込みボタンをクリックするとパネルが表示される', async () => {
      const user = userEvent.setup()
      render(<HomePage />)
      
      const filterButton = screen.getByText('絞り込み設定 ▼')
      await user.click(filterButton)
      
      expect(screen.getByText('絞り込み設定 ▲')).toBeInTheDocument()
    })
  })

  describe('トースト通知', () => {
    it('気になるボタンをクリックするとトースト通知が表示される', async () => {
      const user = userEvent.setup()
      render(<HomePage />)
      
      const interestedButtons = screen.getAllByText('🤍 気になる')
      await user.click(interestedButtons[0])
      
      expect(screen.getByText('気になるに追加しました ❤️')).toBeInTheDocument()
    })

    it('スカウト送信後にトースト通知が表示される', async () => {
      const user = userEvent.setup()
      render(<HomePage />)
      
      // スカウトボタンをクリック
      const scoutButtons = screen.getAllByText('スカウト')
      await user.click(scoutButtons[0])
      
      // 送信ボタンをクリック
      const sendButton = screen.getByText('送信')
      await user.click(sendButton)
      
      expect(screen.getByText('山田 太郎さんにスカウトを送信しました')).toBeInTheDocument()
    })
  })

  describe('データの整合性', () => {
    it('プロフィール数が正しく表示される', () => {
      render(<HomePage />)
      
      expect(screen.getByText('3件見つかりました')).toBeInTheDocument()
    })

    it('各CFOの評価とレビュー数が表示される', () => {
      render(<HomePage />)
      
      expect(screen.getByText('4.9')).toBeInTheDocument()
      expect(screen.getByText('(12件)')).toBeInTheDocument()
      expect(screen.getByText('4.7')).toBeInTheDocument()
      expect(screen.getByText('(8件)')).toBeInTheDocument()
    })
  })
})