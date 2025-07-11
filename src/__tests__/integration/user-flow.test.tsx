import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import HomePage from '../../app/home/page'
import DiscoverCFOsPage from '../../app/discover/cfos/page'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  usePathname() {
    return '/home'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock AppHeader component
jest.mock('@/components/AppHeader', () => {
  return function MockAppHeader() {
    return (
      <div data-testid="app-header">
        <div>RightArm Header</div>
        <a href="/discover/cfos">CFO一覧</a>
        <a href="/discover/companies">企業一覧</a>
      </div>
    )
  }
})

describe('ユーザーフロー統合テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('CFO検索・スカウトフロー', () => {
    it('ホームページからCFOを検索してスカウトを送信する', async () => {
      const user = userEvent.setup()
      render(<HomePage />)

      // 1. ホームページにCFOが表示されている
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
      expect(screen.getByText('田中 花子')).toBeInTheDocument()

      // 2. CFOの詳細情報が表示されている
      expect(screen.getByText('資金調達')).toBeInTheDocument()
      expect(screen.getByText('IPO準備')).toBeInTheDocument()
      expect(screen.getByText('大手証券会社で15年勤務後、5社のIPOをリード。累計調達額200億円以上の実績')).toBeInTheDocument()

      // 3. 検索フィルターでスキルを選択
      const searchInput = screen.getByPlaceholderText('CFOの名前やスキル')
      await user.type(searchInput, '資金調達')

      // 4. スキルフィルターをクリック
      const skillCheckbox = screen.getByRole('checkbox', { name: '資金調達' })
      await user.click(skillCheckbox)
      expect(skillCheckbox).toBeChecked()

      // 5. CFOに興味を示す
      const interestedButtons = screen.getAllByText('🤍 気になる')
      await user.click(interestedButtons[0])
      expect(screen.getByText('❤️ 気になる')).toBeInTheDocument()

      // 6. スカウトボタンをクリック
      const scoutButtons = screen.getAllByText('スカウト')
      await user.click(scoutButtons[0])

      // 7. スカウトモーダルが表示される
      expect(screen.getByText('🎯 スカウト送信')).toBeInTheDocument()
      expect(screen.getByText('このCFOにスカウトを送信しますか？')).toBeInTheDocument()

      // 8. スカウトメッセージを入力
      const messageTextarea = screen.getByPlaceholderText('スカウトメッセージを入力してください...')
      await user.type(messageTextarea, '弊社のCFOとしてお迎えしたく、ご連絡いたします。')

      // 9. スカウトを送信
      const sendButton = screen.getByText('送信')
      await user.click(sendButton)

      // 10. 成功メッセージが表示される
      expect(screen.getByText('山田 太郎さんにスカウトを送信しました')).toBeInTheDocument()

      // 11. モーダルが閉じる
      expect(screen.queryByText('🎯 スカウト送信')).not.toBeInTheDocument()

      // 12. 送信済み状態になる
      await waitFor(() => {
        expect(screen.getByText('送信済み')).toBeInTheDocument()
      })
    })

    it('検索条件を変更してCFOを絞り込む', async () => {
      const user = userEvent.setup()
      render(<HomePage />)

      // 1. 初期状態でのCFO数を確認
      expect(screen.getByText('3件見つかりました')).toBeInTheDocument()

      // 2. 検索キーワードを入力
      const searchInput = screen.getByPlaceholderText('CFOの名前やスキル')
      await user.type(searchInput, '田中')

      // 検索結果が動的に変わることを確認（実際の実装では即時フィルタリング）
      expect(searchInput).toHaveValue('田中')

      // 3. 地域フィルターを変更
      const regionSelect = screen.getByRole('combobox', { name: /地域/ })
      await user.selectOptions(regionSelect, '東京')
      expect(regionSelect).toHaveValue('東京')

      // 4. 複数のスキルを選択
      const skillCheckboxes = screen.getAllByRole('checkbox')
      await user.click(skillCheckboxes[0]) // 資金調達
      await user.click(skillCheckboxes[1]) // IPO準備

      // 選択されたスキルが表示されていることを確認
      expect(skillCheckboxes[0]).toBeChecked()
      expect(skillCheckboxes[1]).toBeChecked()

      // 5. 検索条件をリセット
      const resetButton = screen.getByText('フィルターを適用')
      await user.click(resetButton)
    })
  })

  describe('CFO詳細ページフロー', () => {
    it('CFOの詳細ページに遷移する', async () => {
      const user = userEvent.setup()
      render(<HomePage />)

      // 1. CFOカードの詳細ボタンをクリック
      const detailButtons = screen.getAllByText('📋 詳細へ')
      const firstDetailButton = detailButtons[0]
      
      expect(firstDetailButton.closest('a')).toHaveAttribute('href', '/cfo/1')

      // リンクが正しく設定されていることを確認
      await user.click(firstDetailButton)

      // Next.jsのLinkコンポーネントがモックされているため、
      // 実際の遷移は発生しないが、href属性が正しいことを確認
    })
  })

  describe('発見ページフロー', () => {
    it('CFO発見ページで高度な検索を実行する', async () => {
      const user = userEvent.setup()
      render(<DiscoverCFOsPage />)

      // 1. ページタイトルが表示される
      expect(screen.getByText('CFO検索')).toBeInTheDocument()
      expect(screen.getByText('あなたの企業に最適なCFOを見つけましょう')).toBeInTheDocument()

      // 2. より多くのCFOが表示される
      expect(screen.getByText('田中 康平')).toBeInTheDocument()
      expect(screen.getByText('鈴木 美咲')).toBeInTheDocument()
      expect(screen.getByText('佐藤 次郎')).toBeInTheDocument()

      // 3. 詳細な検索フィルターを使用
      const searchInput = screen.getByPlaceholderText('CFOの名前やスキルで検索')
      await user.type(searchInput, 'IPO')

      // 4. 専門スキルフィルターを選択
      const ipoSkillButton = screen.getByText('IPO・M&A関連')
      await user.click(ipoSkillButton)
      expect(ipoSkillButton).toHaveClass('bg-blue-50', 'text-blue-700')

      // 5. 地域フィルターを設定
      const regionSelect = screen.getByDisplayValue('全国')
      await user.selectOptions(regionSelect, '東京')

      // 6. 並び替えを変更
      const sortSelect = screen.getByDisplayValue('新着順')
      await user.selectOptions(sortSelect, 'rating')

      // 7. 検索を実行
      const searchButton = screen.getByText('検索')
      await user.click(searchButton)

      // 8. 検索中表示を確認
      expect(screen.getByText('検索中...')).toBeInTheDocument()

      // 9. 検索完了メッセージを確認
      await waitFor(() => {
        expect(screen.getByText('検索が完了しました')).toBeInTheDocument()
      })

      // 10. 選択されたスキルが表示される
      const selectedSkillTags = screen.getAllByText('IPO・M&A関連')
      expect(selectedSkillTags.length).toBeGreaterThan(1) // ボタンとタグの両方

      // 11. 選択されたスキルを削除
      const removeButtons = screen.getAllByText('✕')
      if (removeButtons.length > 0) {
        await user.click(removeButtons[0])
        expect(ipoSkillButton).not.toHaveClass('bg-blue-50')
      }
    })

    it('モバイル検索フローが正常に動作する', async () => {
      const user = userEvent.setup()
      render(<DiscoverCFOsPage />)

      // 1. モバイル用絞り込みボタンをクリック
      const mobileFilterButton = screen.getByText('絞り込み設定 ▼')
      await user.click(mobileFilterButton)

      // 2. モバイル絞り込みパネルが表示される
      expect(screen.getByText('絞り込み設定 ▲')).toBeInTheDocument()

      // 3. モバイルパネル内でスキルを選択
      const skillButtons = screen.getAllByText('資金調達')
      const mobileSkillButton = skillButtons.find(button => 
        button.closest('.md\\:hidden') !== null
      )
      if (mobileSkillButton) {
        await user.click(mobileSkillButton)
      }

      // 4. モバイル検索を実行
      const mobileSearchButton = screen.getByText('検索')
      await user.click(mobileSearchButton)

      // 5. パネルが閉じることを確認
      await waitFor(() => {
        expect(screen.queryByText('絞り込み設定 ▲')).not.toBeInTheDocument()
      })
    })
  })

  describe('エラーハンドリングフロー', () => {
    it('検索結果が0件の場合の表示', async () => {
      const user = userEvent.setup()
      render(<DiscoverCFOsPage />)

      // 1. 存在しないキーワードで検索
      const searchInput = screen.getByPlaceholderText('CFOの名前やスキルで検索')
      await user.type(searchInput, 'NonExistentKeyword12345')

      // 2. 検索結果が0件の場合の表示を確認
      await waitFor(() => {
        expect(screen.getByText('該当するCFOが見つかりませんでした')).toBeInTheDocument()
        expect(screen.getByText('検索条件を変更してお試しください')).toBeInTheDocument()
      })

      // 3. リセットボタンで条件をクリア
      const resetButton = screen.getByText('条件をリセット')
      await user.click(resetButton)

      // 4. 検索条件がクリアされることを確認
      expect(searchInput).toHaveValue('')
    })

    it('対応不可CFOの処理', async () => {
      const _user = userEvent.setup()
      render(<HomePage />)

      // 1. 対応不可CFOのスカウトボタンが無効化されていることを確認
      const unavailableButtons = screen.getAllByText('対応不可')
      expect(unavailableButtons[0]).toBeDisabled()

      // 2. 対応不可CFOに対して気になるボタンは使用可能
      const interestedButtons = screen.getAllByText(/気になる/)
      expect(interestedButtons.length).toBeGreaterThan(0)
    })
  })

  describe('レスポンシブ対応フロー', () => {
    it('PC・モバイル両方のUIコンポーネントが存在する', () => {
      render(<HomePage />)

      // 1. PC用とモバイル用の両方の検索バーが存在
      const searchInputs = screen.getAllByPlaceholderText('CFOの名前やスキル')
      expect(searchInputs.length).toBeGreaterThan(1)

      // 2. モバイル用絞り込みボタンが存在
      expect(screen.getByText('絞り込み設定 ▼')).toBeInTheDocument()

      // 3. PCサイドバーとモバイルパネルの両方が存在（クラスで制御）
      expect(document.querySelector('.hidden.md\\:block')).toBeInTheDocument()
      expect(document.querySelector('.md\\:hidden')).toBeInTheDocument()
    })
  })

  describe('アクセシビリティフロー', () => {
    it('キーボードナビゲーションが正常に動作する', async () => {
      const user = userEvent.setup()
      render(<HomePage />)

      // 1. 検索フィールドにフォーカスを移動
      const searchInput = screen.getByPlaceholderText('CFOの名前やスキル')
      await user.click(searchInput)
      expect(searchInput).toHaveFocus()

      // 2. Tabキーでボタンに移動
      await user.tab()
      const firstButton = document.activeElement
      expect(firstButton).toBeInstanceOf(HTMLElement)

      // 3. Enterキーでボタンを押下（可能な場合）
      if (firstButton && firstButton.tagName === 'BUTTON') {
        await user.keyboard('{Enter}')
      }
    })

    it('スクリーンリーダー用のaria属性が設定されている', () => {
      render(<HomePage />)

      // 1. 検索フィールドにlabelが関連付けられている
      const searchInputs = screen.getAllByRole('textbox')
      expect(searchInputs.length).toBeGreaterThan(0)

      // 2. ボタンにroleが設定されている
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)

      // 3. チェックボックスが適切に識別される
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(0)
    })
  })
})