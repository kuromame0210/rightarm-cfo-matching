describe('契約管理フロー', () => {
  beforeEach(() => {
    // 認証ユーザーとしてセットアップ
    cy.window().then((window) => {
      window.localStorage.setItem('auth_token', 'mock-company-token')
      window.localStorage.setItem('auth_user', JSON.stringify({
        id: '1',
        email: 'company@example.com',
        user_type: 'company',
        profile: { display_name: '企業ユーザー' }
      }))
    })

    // API呼び出しをモック
    cy.intercept('GET', '/api/contracts*', {
      statusCode: 200,
      body: {
        success: true,
        data: [
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
          }
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      }
    }).as('getContracts')
  })

  it('契約一覧ページを表示できる', () => {
    cy.visit('/contracts')
    cy.wait('@getContracts')
    
    // ページタイトルの確認
    cy.get('h1').should('contain', '契約管理')
    
    // 企業ユーザー向けの説明文
    cy.get('p').should('contain', 'CFOとの契約を管理できます')
    
    // 新規契約作成ボタンの存在確認
    cy.get('a[href="/contracts/new"]').should('contain', '新規契約作成')
  })

  it('契約フィルターが機能する', () => {
    cy.visit('/contracts')
    cy.wait('@getContracts')
    
    // フィルターボタンの存在確認
    cy.get('button').should('contain', 'すべて')
    cy.get('button').should('contain', '進行中')
    cy.get('button').should('contain', '保留中')
    cy.get('button').should('contain', '完了')
    cy.get('button').should('contain', 'キャンセル')
    cy.get('button').should('contain', '下書き')
    
    // アクティブフィルターをクリック
    cy.intercept('GET', '/api/contracts*status=active*', {
      statusCode: 200,
      body: {
        success: true,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      }
    }).as('getActiveContracts')
    
    cy.get('button').contains('進行中').click()
    cy.wait('@getActiveContracts')
  })

  it('契約カードの情報が正しく表示される', () => {
    cy.visit('/contracts')
    cy.wait('@getContracts')
    
    // 契約カードの情報確認
    cy.get('.bg-white').should('contain', 'テストCFOとの契約')
    cy.get('.bg-white').should('contain', '月額 500,000円')
    cy.get('.bg-white').should('contain', '期間: 12ヶ月')
    cy.get('.bg-white').should('contain', '進行中')
    cy.get('.bg-white').should('contain', '財務戦略')
    
    // アクションボタンの確認
    cy.get('a[href="/contracts/1"]').should('contain', '詳細')
  })

  it('新規契約作成ページにアクセスできる', () => {
    // CFO一覧API のモック
    cy.intercept('GET', '/api/cfos', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: 'cfo-1',
            specialization: '財務戦略',
            years_of_experience: 10,
            hourly_rate_min: 5000,
            hourly_rate_max: 8000,
            rightarm_users: [{
              email: 'cfo@test.com',
              rightarm_user_profiles: [{
                display_name: 'テストCFO'
              }]
            }]
          }
        ]
      }
    }).as('getCfos')

    // 企業一覧API のモック
    cy.intercept('GET', '/api/companies/my', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: 'company-1',
            company_name: 'テスト株式会社',
            business_name: 'テスト事業'
          }
        ]
      }
    }).as('getMyCompanies')

    cy.visit('/contracts/new')
    cy.wait('@getCfos')
    cy.wait('@getMyCompanies')
    
    // ページタイトルの確認
    cy.get('h1').should('contain', '新規契約作成')
    
    // CFO選択セクション
    cy.get('h2').should('contain', 'CFO選択')
    cy.get('input[type="radio"]').should('exist')
    
    // 契約条件セクション
    cy.get('h2').should('contain', '契約条件')
    cy.get('input[name="monthly_fee"]').should('be.visible')
    cy.get('input[name="contract_period"]').should('be.visible')
    cy.get('input[name="start_date"]').should('be.visible')
  })

  it('契約作成フォームの入力と送信', () => {
    // 事前のAPI設定
    cy.intercept('GET', '/api/cfos', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: 'cfo-1',
            specialization: '財務戦略',
            years_of_experience: 10,
            hourly_rate_min: 5000,
            hourly_rate_max: 8000,
            rightarm_users: [{
              email: 'cfo@test.com',
              rightarm_user_profiles: [{
                display_name: 'テストCFO'
              }]
            }]
          }
        ]
      }
    }).as('getCfos')

    cy.intercept('GET', '/api/companies/my', {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            id: 'company-1',
            company_name: 'テスト株式会社',
            business_name: 'テスト事業'
          }
        ]
      }
    }).as('getMyCompanies')

    // 契約作成API のモック
    cy.intercept('POST', '/api/contracts', {
      statusCode: 200,
      body: {
        success: true,
        data: { id: 'new-contract-1' },
        message: '契約を作成しました'
      }
    }).as('createContract')

    cy.visit('/contracts/new')
    cy.wait('@getCfos')
    cy.wait('@getMyCompanies')
    
    // CFOを選択
    cy.get('input[type="radio"]').first().check()
    
    // 契約条件を入力
    cy.get('input[type="number"]').first().clear().type('600000') // 月額料金
    cy.get('input[type="number"]').eq(1).clear().type('24') // 契約期間
    cy.get('input[type="date"]').first().type('2024-01-01') // 開始日
    
    // フォーム送信
    cy.get('button[type="submit"]').click()
    cy.wait('@createContract')
    
    // 成功後のリダイレクト確認
    cy.url().should('include', '/contracts/new-contract-1')
  })

  it('契約詳細ページを表示できる', () => {
    // 契約詳細API のモック
    cy.intercept('GET', '/api/contracts/1', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          id: '1',
          status: 'active',
          monthly_fee: 500000,
          contract_period: 12,
          work_hours_per_month: 160,
          start_date: '2024-01-01T00:00:00Z',
          end_date: '2024-12-31T23:59:59Z',
          created_at: '2024-01-01T00:00:00Z',
          rightarm_companies: {
            company_name: 'テスト株式会社',
            business_name: 'テスト事業',
            industry: 'IT',
            rightarm_users: [{
              email: 'company@test.com',
              rightarm_user_profiles: [{
                display_name: '企業担当者',
                phone_number: '090-1234-5678'
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
                nickname: 'CFO太郎',
                phone_number: '090-8765-4321'
              }]
            }]
          }
        }
      }
    }).as('getContractDetail')

    cy.visit('/contracts/1')
    cy.wait('@getContractDetail')
    
    // ページタイトルの確認
    cy.get('h1').should('contain', '契約詳細')
    
    // 契約情報の確認
    cy.get('h2').should('contain', '契約情報')
    cy.get('body').should('contain', 'テスト株式会社')
    cy.get('body').should('contain', 'テストCFO')
    cy.get('body').should('contain', '500,000円')
    cy.get('body').should('contain', '12ヶ月')
    cy.get('body').should('contain', '160時間')
  })

  it('CFOユーザーの場合は新規契約作成ボタンが表示されない', () => {
    // CFOユーザーとしてセットアップ
    cy.window().then((window) => {
      window.localStorage.setItem('auth_user', JSON.stringify({
        id: '2',
        email: 'cfo@example.com',
        user_type: 'cfo',
        profile: { display_name: 'CFOユーザー' }
      }))
    })

    cy.visit('/contracts')
    cy.wait('@getContracts')
    
    // 新規契約作成ボタンが表示されないことを確認
    cy.get('a[href="/contracts/new"]').should('not.exist')
    
    // CFOユーザー向けの説明文
    cy.get('p').should('contain', '企業との契約を確認できます')
  })
})