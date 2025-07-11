// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// カスタムコマンドの型定義
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * ユーザーとしてログインする
       * @param userType - 'company' または 'cfo'
       * @param userData - ユーザー情報
       */
      login(userType: 'company' | 'cfo', userData?: any): Chainable<void>
      
      /**
       * ログアウトする
       */
      logout(): Chainable<void>
      
      /**
       * APIレスポンスをモックする
       * @param method - HTTPメソッド
       * @param url - APIのURL
       * @param response - レスポンスデータ
       */
      mockApiResponse(method: string, url: string, response: any): Chainable<void>
    }
  }
}