/// <reference types="cypress" />

// カスタムコマンドの実装

Cypress.Commands.add('login', (userType: 'company' | 'cfo', userData?: any) => {
  const defaultUserData = {
    company: {
      id: '1',
      email: 'company@example.com',
      user_type: 'company',
      profile: {
        display_name: '企業ユーザー',
        region: '東京都'
      }
    },
    cfo: {
      id: '2',
      email: 'cfo@example.com',
      user_type: 'cfo',
      profile: {
        display_name: 'CFOユーザー',
        region: '大阪府'
      }
    }
  }

  const user = userData || defaultUserData[userType]
  
  cy.window().then((window) => {
    window.localStorage.setItem('auth_token', `mock-${userType}-token`)
    window.localStorage.setItem('auth_user', JSON.stringify(user))
  })
})

Cypress.Commands.add('logout', () => {
  cy.window().then((window) => {
    window.localStorage.removeItem('auth_token')
    window.localStorage.removeItem('auth_user')
  })
  cy.clearCookies()
})

Cypress.Commands.add('mockApiResponse', (method: string, url: string, response: any) => {
  cy.intercept(method as any, url, {
    statusCode: 200,
    body: response
  })
})

// APIのモックデータ
export const mockData = {
  contracts: {
    active: {
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
  },
  cfos: [
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
  ],
  invoices: [
    {
      id: 'invoice-1',
      invoice_number: '202401001',
      invoice_date: '2024-01-01',
      due_date: '2024-01-31',
      consulting_fee: 500000,
      platform_fee: 25000,
      total_amount: 525000,
      status: 'sent',
      rightarm_contracts: {
        rightarm_companies: {
          company_name: 'テスト株式会社'
        },
        rightarm_cfos: {
          rightarm_users: [{
            rightarm_user_profiles: [{
              display_name: 'テストCFO'
            }]
          }]
        }
      }
    }
  ]
}