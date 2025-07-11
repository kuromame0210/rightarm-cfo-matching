import { isProtectedRoute } from '../auth/index'

// NextAuth.js統合後のテスト
// 注意: NextAuth.js統合後は以下の関数は削除されました：
// - getStoredAuth (useSession hook を使用)
// - clearStoredAuth (signOut function を使用)
// - validateToken (NextAuth.js内部で処理)

describe('統合認証システム（NextAuth.js）', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // DEPRECATED: NextAuth.js統合後は以下のテストは無効
  /*
  describe('getStoredAuth', () => {
    // この関数は削除されました - useSession hook を使用してください
  })

  describe('clearStoredAuth', () => {
    // この関数は削除されました - signOut function を使用してください
  })

  describe('validateToken', () => {
    // この関数は削除されました - NextAuth.js内部で処理されます
  })
  */

  describe('isProtectedRoute', () => {
    it('認証が必要なページを正しく判定する', () => {
      expect(isProtectedRoute('/profile')).toBe(true)
      expect(isProtectedRoute('/contracts')).toBe(true)
      expect(isProtectedRoute('/home')).toBe(true)
      expect(isProtectedRoute('/discover')).toBe(true)
      expect(isProtectedRoute('/settings')).toBe(true)
      expect(isProtectedRoute('/meetings')).toBe(true)
      expect(isProtectedRoute('/messages')).toBe(true)
    })

    it('パブリックページを正しく判定する', () => {
      expect(isProtectedRoute('/')).toBe(false)
      expect(isProtectedRoute('/auth/login')).toBe(false)
      expect(isProtectedRoute('/auth/register')).toBe(false)
      expect(isProtectedRoute('/public')).toBe(false)
    })

    it('サブパスでも正しく判定される', () => {
      expect(isProtectedRoute('/contracts/123')).toBe(true)
      expect(isProtectedRoute('/home/dashboard')).toBe(true)
      expect(isProtectedRoute('/profile/edit')).toBe(true)
    })
  })

  // isPublicOnlyRoute 関数は削除済み - middleware.ts で処理されます
})