describe('認証フロー', () => {
  beforeEach(() => {
    // テスト前にLocalStorageをクリア
    cy.clearLocalStorage()
    cy.clearCookies()
  })

  it('ログインページにアクセスできる', () => {
    cy.visit('/auth/login')
    cy.get('h1').should('contain', 'ログイン')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('contain', 'ログイン')
  })

  it('新規登録ページにアクセスできる', () => {
    cy.visit('/auth/register')
    cy.get('h1').should('contain', '新規会員登録')
    
    // フォーム要素の存在確認
    cy.get('input[name="email"]').should('be.visible')
    cy.get('input[name="password"]').should('be.visible')
    cy.get('select[name="userType"]').should('be.visible')
    cy.get('input[name="displayName"]').should('be.visible')
    cy.get('button[type="submit"]').should('contain', '登録')
  })

  it('ログインフォームのバリデーション', () => {
    cy.visit('/auth/login')
    
    // 空のフォーム送信
    cy.get('button[type="submit"]').click()
    
    // エラーメッセージの確認
    cy.get('input[type="email"]:invalid').should('exist')
    cy.get('input[type="password"]:invalid').should('exist')
  })

  it('新規登録フォームのバリデーション', () => {
    cy.visit('/auth/register')
    
    // 無効なメールアドレス
    cy.get('input[name="email"]').type('invalid-email')
    cy.get('input[name="password"]').type('123') // 短すぎるパスワード
    cy.get('button[type="submit"]').click()
    
    // バリデーションエラーの確認
    cy.get('.text-red-600').should('be.visible')
  })

  it('企業ユーザー登録フロー', () => {
    cy.visit('/auth/register')
    
    // 企業ユーザーの登録フォーム入力
    cy.get('input[name="email"]').type('test-company@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('select[name="userType"]').select('company')
    cy.get('input[name="displayName"]').type('テスト企業担当者')
    
    // 企業固有フィールドの表示確認
    cy.get('input[name="companyName"]').should('be.visible').type('テスト株式会社')
    cy.get('input[name="businessName"]').should('be.visible').type('テスト事業')
    cy.get('select[name="industry"]').should('be.visible').select('IT')
    
    // フォーム送信（実際のAPIコールは行わない）
    cy.get('button[type="submit"]').should('not.be.disabled')
  })

  it('CFOユーザー登録フロー', () => {
    cy.visit('/auth/register')
    
    // CFOユーザーの登録フォーム入力
    cy.get('input[name="email"]').type('test-cfo@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('select[name="userType"]').select('cfo')
    cy.get('input[name="displayName"]').type('テストCFO')
    
    // CFO固有フィールドの表示確認
    cy.get('input[name="specialization"]').should('be.visible').type('財務戦略')
    cy.get('input[name="yearsOfExperience"]').should('be.visible').type('10')
    cy.get('input[name="hourlyRateMin"]').should('be.visible').type('5000')
    cy.get('input[name="hourlyRateMax"]').should('be.visible').type('8000')
    
    // フォーム送信（実際のAPIコールは行わない）
    cy.get('button[type="submit"]').should('not.be.disabled')
  })

  it('ログイン後のリダイレクト', () => {
    // 認証が必要なページにアクセス
    cy.visit('/contracts')
    
    // ログインページにリダイレクトされることを確認
    cy.url().should('include', '/auth/login')
    
    // ログイン後は元のページにリダイレクトされることを確認するため
    // URLパラメータにリダイレクト先が含まれていることを確認
    cy.url().should('include', 'redirect')
  })

  it('認証されていないユーザーの保護されたページアクセス', () => {
    const protectedPages = [
      '/home',
      '/profile',
      '/contracts',
      '/invoices'
    ]

    protectedPages.forEach(page => {
      cy.visit(page)
      // ログインページにリダイレクトされるか、認証エラーが表示される
      cy.url().should('satisfy', (url) => {
        return url.includes('/auth/login') || url === page
      })
    })
  })

  it('ナビゲーションバーの状態変化', () => {
    // 未認証時のナビゲーション
    cy.visit('/')
    cy.get('header').should('contain', 'ログイン')
    cy.get('header').should('contain', '会員登録')
    
    // 認証後のナビゲーション（モック）
    // 実際の認証をシミュレートするためLocalStorageを設定
    cy.window().then((window) => {
      window.localStorage.setItem('auth_token', 'mock-token')
      window.localStorage.setItem('auth_user', JSON.stringify({
        id: '1',
        email: 'test@example.com',
        user_type: 'company',
        profile: { display_name: 'テストユーザー' }
      }))
    })
    
    cy.reload()
    
    // 認証後のUIの確認
    cy.get('header').should('not.contain', 'ログイン')
    cy.get('header').should('contain', 'CFOを探す')
    cy.get('header').should('contain', '契約管理')
  })
})