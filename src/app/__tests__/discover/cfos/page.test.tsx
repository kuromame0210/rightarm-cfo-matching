import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DiscoverCFOsPage from '../../../discover/cfos/page'

// Mock AppHeader component
jest.mock('@/components/AppHeader', () => {
  return function MockAppHeader({ isLoggedIn }: { isLoggedIn: boolean }) {
    return <div data-testid="app-header">AppHeader - LoggedIn: {isLoggedIn.toString()}</div>
  }
})

describe('DiscoverCFOsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('基本表示', () => {
    it('ページタイトルが表示される', () => {
      render(<DiscoverCFOsPage />)
      expect(screen.getByText('CFO検索')).toBeInTheDocument()
      expect(screen.getByText('あなたの企業に最適なCFOを見つけましょう')).toBeInTheDocument()
    })

    it('AppHeaderが表示される', () => {
      render(<DiscoverCFOsPage />)
      expect(screen.getByTestId('app-header')).toBeInTheDocument()
      expect(screen.getByTestId('app-header')).toHaveTextContent('LoggedIn: true')
    })

    it('検索・絞り込みサイドバーが表示される', () => {
      render(<DiscoverCFOsPage />)
      expect(screen.getByText('検索・絞り込み')).toBeInTheDocument()
      expect(screen.getByText('キーワード検索')).toBeInTheDocument()
      expect(screen.getByText('専門スキル')).toBeInTheDocument()
    })

    it('CFOプロフィール一覧が表示される', () => {
      render(<DiscoverCFOsPage />)
      expect(screen.getByText('募集中のCFO一覧')).toBeInTheDocument()
      expect(screen.getByText('田中 康平')).toBeInTheDocument()
      expect(screen.getByText('鈴木 美咲')).toBeInTheDocument()
    })

    it('検索結果数が表示される', () => {
      render(<DiscoverCFOsPage />)
      expect(screen.getByText(/件見つかりました/)).toBeInTheDocument()
    })
  })

  describe('検索機能', () => {
    it('キーワード検索ができる', async () => {
      const user = userEvent.setup()
      render(<DiscoverCFOsPage />)
      
      const searchInput = screen.getByPlaceholderText('CFOの名前やスキルで検索')
      await user.type(searchInput, '田中')
      
      expect(searchInput).toHaveValue('田中')
    })

    it('専門スキルフィルターが選択できる', async () => {
      const user = userEvent.setup()
      render(<DiscoverCFOsPage />)
      
      const skillButton = screen.getByText('資金調達')
      await user.click(skillButton)
      
      expect(skillButton).toHaveClass('bg-blue-50', 'text-blue-700')
    })

    it('地域フィルターが変更できる', async () => {
      const user = userEvent.setup()
      render(<DiscoverCFOsPage />)
      
      const regionSelect = screen.getByDisplayValue('全国')
      await user.selectOptions(regionSelect, '東京')
      
      expect(regionSelect).toHaveValue('東京')
    })

    it('検索ボタンをクリックすると検索が実行される', async () => {
      const user = userEvent.setup()
      render(<DiscoverCFOsPage />)
      
      const searchButton = screen.getByText('検索')
      await user.click(searchButton)
      
      expect(screen.getByText('検索中...')).toBeInTheDocument()
    })

    it('リセットボタンで条件がクリアされる', async () => {
      const user = userEvent.setup()
      render(<DiscoverCFOsPage />)
      
      // 検索条件を設定
      const searchInput = screen.getByPlaceholderText('CFOの名前やスキルで検索')
      await user.type(searchInput, '田中')
      
      const skillButton = screen.getByText('資金調達')
      await user.click(skillButton)
      
      // リセット
      const resetButton = screen.getByText('条件をリセット')
      await user.click(resetButton)
      
      expect(searchInput).toHaveValue('')
      expect(skillButton).not.toHaveClass('bg-blue-50')
    })
  })

  describe('並び替え機能', () => {
    it('並び替えオプションが表示される', () => {
      render(<DiscoverCFOsPage />)
      
      const sortSelect = screen.getByDisplayValue('新着順')
      expect(sortSelect).toBeInTheDocument()
    })

    it('並び替えオプションを変更できる', async () => {
      const user = userEvent.setup()
      render(<DiscoverCFOsPage />)
      
      const sortSelect = screen.getByDisplayValue('新着順')
      await user.selectOptions(sortSelect, 'rating')
      
      expect(sortSelect).toHaveValue('rating')
    })

    it('評価順で並び替えができる', async () => {
      const user = userEvent.setup()
      render(<DiscoverCFOsPage />)
      
      const sortSelect = screen.getByDisplayValue('新着順')
      await user.selectOptions(sortSelect, 'rating')
      
      // 4.9の評価を持つ田中康平が最初に表示されることを確認
      const cfoCards = screen.getAllByText(/戦略CFO|みさきCFO|M&A佐藤/)
      expect(cfoCards[0]).toHaveTextContent('戦略CFO田中')
    })
  })

  describe('CFOプロフィールカード', () => {
    it('CFOの基本情報が表示される', () => {
      render(<DiscoverCFOsPage />)
      
      expect(screen.getByText('田中 康平')).toBeInTheDocument()
      expect(screen.getByText('戦略CFO田中')).toBeInTheDocument()
      expect(screen.getByText('月100万円〜')).toBeInTheDocument()
      expect(screen.getByText('リモート可・週2日〜')).toBeInTheDocument()
    })

    it('専門スキルタグが表示される', () => {
      render(<DiscoverCFOsPage />)
      
      expect(screen.getByText('資金調達')).toBeInTheDocument()
      expect(screen.getByText('IPO・M&A関連')).toBeInTheDocument()
      expect(screen.getByText('組織・ガバナンス')).toBeInTheDocument()
    })

    it('実績・経歴が表示される', () => {
      render(<DiscoverCFOsPage />)
      
      expect(screen.getByText('大手証券会社で15年勤務後、5社のIPOをリード。累計調達額200億円以上の実績')).toBeInTheDocument()
    })

    it('保有資格が表示される', () => {
      render(<DiscoverCFOsPage />)
      
      expect(screen.getByText('公認会計士')).toBeInTheDocument()
      expect(screen.getByText('CFA')).toBeInTheDocument()
      expect(screen.getByText('MBA(ファイナンス)')).toBeInTheDocument()
    })

    it('評価とレビュー数が表示される', () => {
      render(<DiscoverCFOsPage />)
      
      expect(screen.getByText('4.9')).toBeInTheDocument()
      expect(screen.getByText('(12件)')).toBeInTheDocument()
    })

    it('対応可能ステータスが表示される', () => {
      render(<DiscoverCFOsPage />)
      
      expect(screen.getAllByText('対応可能')).toHaveLength(7) // 8名中7名が対応可能
      expect(screen.getByText('満員')).toBeInTheDocument()
    })
  })

  describe('アクション機能', () => {
    it('詳細ボタンが正しいリンクになっている', () => {
      render(<DiscoverCFOsPage />)
      
      const detailLinks = screen.getAllByText('📋 詳細へ')
      expect(detailLinks[0].closest('a')).toHaveAttribute('href', '/cfo/1')
    })

    it('気になるボタンをクリックすると状態が変わる', async () => {
      const user = userEvent.setup()
      render(<DiscoverCFOsPage />)
      
      const interestedButtons = screen.getAllByText('🤍 気になる')
      await user.click(interestedButtons[0])
      
      expect(screen.getByText('❤️ 気になる')).toBeInTheDocument()
    })

    it('スカウトボタンをクリックするとモーダルが表示される', async () => {
      const user = userEvent.setup()
      render(<DiscoverCFOsPage />)
      
      const scoutButtons = screen.getAllByText('スカウト')
      await user.click(scoutButtons[0])
      
      expect(screen.getByText('🎯 スカウト送信')).toBeInTheDocument()
    })

    it('対応不可CFOのスカウトボタンが無効になっている', () => {
      render(<DiscoverCFOsPage />)
      
      const unavailableButton = screen.getByText('対応不可')
      expect(unavailableButton).toBeDisabled()
    })
  })

  describe('スカウトモーダル', () => {
    it('スカウトモーダルにCFO情報が表示される', async () => {
      const user = userEvent.setup()
      render(<DiscoverCFOsPage />)
      
      const scoutButtons = screen.getAllByText('スカウト')
      await user.click(scoutButtons[0])
      
      expect(screen.getByText('田中 康平')).toBeInTheDocument()
      expect(screen.getByText('戦略CFO田中')).toBeInTheDocument()
      expect(screen.getByText('このCFOにスカウトを送信しますか？')).toBeInTheDocument()
    })

    it('スカウトメッセージを入力できる', async () => {
      const user = userEvent.setup()
      render(<DiscoverCFOsPage />)
      
      const scoutButtons = screen.getAllByText('スカウト')
      await user.click(scoutButtons[0])
      
      const textarea = screen.getByPlaceholderText('スカウトメッセージを入力してください...')
      await user.type(textarea, 'ぜひお話しさせてください')
      
      expect(textarea).toHaveValue('ぜひお話しさせてください')
    })

    it('スカウト送信ができる', async () => {
      const user = userEvent.setup()
      render(<DiscoverCFOsPage />)
      
      const scoutButtons = screen.getAllByText('スカウト')
      await user.click(scoutButtons[0])
      
      const sendButton = screen.getByText('送信')
      await user.click(sendButton)
      
      expect(screen.queryByText('🎯 スカウト送信')).not.toBeInTheDocument()
    })
  })

  describe('フィルタリング機能', () => {
    it('選択されたスキルが表示される', async () => {
      const user = userEvent.setup()
      render(<DiscoverCFOsPage />)
      
      const skillButton = screen.getByText('資金調達')
      await user.click(skillButton)
      
      // 選択中のスキル表示エリアに表示される
      const selectedSkills = screen.getAllByText('資金調達')
      expect(selectedSkills.length).toBeGreaterThan(1) // ボタンと選択中エリアの両方
    })

    it('選択されたスキルを削除できる', async () => {
      const user = userEvent.setup()
      render(<DiscoverCFOsPage />)
      
      const skillButton = screen.getByText('資金調達')
      await user.click(skillButton)
      
      // 選択中のスキルエリアで削除ボタンをクリック
      const removeButtons = screen.getAllByText('✕')
      await user.click(removeButtons[0])
      
      expect(skillButton).not.toHaveClass('bg-blue-50')
    })

    it('検索結果が0件の場合の表示', async () => {
      const user = userEvent.setup()
      render(<DiscoverCFOsPage />)
      
      // 存在しないキーワードで検索
      const searchInput = screen.getByPlaceholderText('CFOの名前やスキルで検索')
      await user.type(searchInput, 'NotFoundKeyword')
      
      await waitFor(() => {
        expect(screen.getByText('該当するCFOが見つかりませんでした')).toBeInTheDocument()
        expect(screen.getByText('検索条件を変更してお試しください')).toBeInTheDocument()
      })
    })
  })

  describe('モバイル対応', () => {
    it('モバイル用絞り込みボタンが表示される', () => {
      render(<DiscoverCFOsPage />)
      
      const mobileFilterButton = screen.getByText('絞り込み設定 ▼')
      expect(mobileFilterButton).toBeInTheDocument()
    })

    it('モバイル絞り込みパネルを開閉できる', async () => {
      const user = userEvent.setup()
      render(<DiscoverCFOsPage />)
      
      const filterButton = screen.getByText('絞り込み設定 ▼')
      await user.click(filterButton)
      
      expect(screen.getByText('絞り込み設定 ▲')).toBeInTheDocument()
    })

    it('モバイル用検索バーが表示される', () => {
      render(<DiscoverCFOsPage />)
      
      const mobileSearchInputs = screen.getAllByPlaceholderText('CFOの名前やスキルで検索')
      expect(mobileSearchInputs.length).toBeGreaterThan(1) // PC用とモバイル用
    })
  })

  describe('トースト通知', () => {
    it('検索完了時にトースト通知が表示される', async () => {
      const user = userEvent.setup()
      render(<DiscoverCFOsPage />)
      
      const searchButton = screen.getByText('検索')
      await user.click(searchButton)
      
      await waitFor(() => {
        expect(screen.getByText('検索が完了しました')).toBeInTheDocument()
      })
    })

    it('リセット時にトースト通知が表示される', async () => {
      const user = userEvent.setup()
      render(<DiscoverCFOsPage />)
      
      const resetButton = screen.getByText('条件をリセット')
      await user.click(resetButton)
      
      expect(screen.getByText('検索条件をリセットしました')).toBeInTheDocument()
    })

    it('気になる追加時にトースト通知が表示される', async () => {
      const user = userEvent.setup()
      render(<DiscoverCFOsPage />)
      
      const interestedButton = screen.getAllByText('🤍 気になる')[0]
      await user.click(interestedButton)
      
      expect(screen.getByText('気になるに追加しました ❤️')).toBeInTheDocument()
    })

    it('スカウト送信時にトースト通知が表示される', async () => {
      const user = userEvent.setup()
      render(<DiscoverCFOsPage />)
      
      const scoutButton = screen.getAllByText('スカウト')[0]
      await user.click(scoutButton)
      
      const sendButton = screen.getByText('送信')
      await user.click(sendButton)
      
      expect(screen.getByText('田中 康平さんにスカウトを送信しました')).toBeInTheDocument()
    })
  })
})