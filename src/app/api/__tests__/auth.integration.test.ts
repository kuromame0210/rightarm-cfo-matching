import { NextRequest } from 'next/server'
import { POST as LOGIN } from '../auth/login/route'
import { POST as REGISTER } from '../auth/register/route'
import { POST as VALIDATE } from '../auth/validate/route'
import { POST as LOGOUT } from '../auth/logout/route'

// Supabaseのモック
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      getUser: jest.fn(),
      signOut: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      upsert: jest.fn()
    }))
  }
}))

const { supabase } = require('@/lib/supabase')

describe('Auth API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/login', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'password123'
    }

    it('有効な認証情報でログインできる', async () => {
      // Supabase認証のモック
      supabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com'
          },
          session: {
            access_token: 'access-token-123'
          }
        },
        error: null
      })

      // ユーザー情報取得のモック
      const userSelectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: {
              id: 'internal-user-123',
              email: 'test@example.com',
              user_type: 'company',
              status: 'active',
              rextrix_user_profiles: {
                display_name: 'テストユーザー',
                nickname: 'テスト',
                region: '東京都'
              }
            },
            error: null
          })
        }))
      }))
      
      supabase.from.mockReturnValueOnce({
        select: userSelectMock
      })

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(validLoginData)
      })

      const response = await LOGIN(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.session.access_token).toBe('access-token-123')
      expect(data.data.user.email).toBe('test@example.com')
      expect(data.data.user.user_type).toBe('company')
      expect(data.message).toBe('ログインしました')
    })

    it('無効な認証情報の場合、401エラーを返す', async () => {
      supabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' }
      })

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrong-password'
        })
      })

      const response = await LOGIN(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('メールアドレスまたはパスワードが間違っています')
    })

    it('バリデーションエラーの場合、400エラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          password: ''
        })
      })

      const response = await LOGIN(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('バリデーションエラー')
      expect(data.details).toBeDefined()
    })
  })

  describe('POST /api/auth/register', () => {
    const validRegisterData = {
      email: 'newuser@example.com',
      password: 'password123',
      userType: 'company',
      displayName: '新規ユーザー',
      companyName: 'テスト株式会社',
      businessName: 'テスト事業',
      industry: 'IT'
    }

    it('有効なデータで企業ユーザーを登録できる', async () => {
      // Supabase登録のモック
      supabase.auth.signUp.mockResolvedValueOnce({
        data: {
          user: {
            id: 'new-user-123',
            email: 'newuser@example.com',
            email_confirmed_at: new Date().toISOString()
          },
          session: {
            access_token: 'new-access-token'
          }
        },
        error: null
      })

      // ユーザー作成のモック
      const userInsertMock = jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: {
              id: 'new-internal-user-123',
              email: 'newuser@example.com',
              user_type: 'company'
            },
            error: null
          })
        }))
      }))
      supabase.from.mockReturnValueOnce({
        insert: userInsertMock
      })

      // プロフィール作成のモック
      const profileUpsertMock = jest.fn().mockResolvedValueOnce({
        error: null
      })
      supabase.from.mockReturnValueOnce({
        upsert: profileUpsertMock
      })

      // 企業情報作成のモック
      const companyInsertMock = jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: { id: 'new-company-123' },
            error: null
          })
        }))
      }))
      supabase.from.mockReturnValueOnce({
        insert: companyInsertMock
      })

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validRegisterData)
      })

      const response = await REGISTER(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.email).toBe('newuser@example.com')
      expect(data.data.userType).toBe('company')
      expect(data.message).toBe('ユーザー登録が完了しました。メールを確認して認証を完了してください。')
    })

    it('CFOユーザーを登録できる', async () => {
      const cfoRegisterData = {
        email: 'cfo@example.com',
        password: 'password123',
        userType: 'cfo',
        displayName: 'CFOユーザー',
        specialization: '財務戦略',
        yearsOfExperience: 10,
        hourlyRateMin: 5000,
        hourlyRateMax: 8000
      }

      supabase.auth.signUp.mockResolvedValueOnce({
        data: {
          user: {
            id: 'cfo-user-123',
            email: 'cfo@example.com',
            email_confirmed_at: new Date().toISOString()
          },
          session: {
            access_token: 'cfo-access-token'
          }
        },
        error: null
      })

      // ユーザー作成
      const userInsertMock = jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: {
              id: 'cfo-internal-user-123',
              email: 'cfo@example.com',
              user_type: 'cfo'
            },
            error: null
          })
        }))
      }))
      supabase.from.mockReturnValueOnce({
        insert: userInsertMock
      })

      // プロフィール作成
      supabase.from.mockReturnValueOnce({
        upsert: jest.fn().mockResolvedValueOnce({ error: null })
      })

      // CFO情報作成
      const cfoInsertMock = jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: { id: 'new-cfo-123' },
            error: null
          })
        }))
      }))
      supabase.from.mockReturnValueOnce({
        insert: cfoInsertMock
      })

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(cfoRegisterData)
      })

      const response = await REGISTER(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.userType).toBe('cfo')
    })

    it('既存のメールアドレスの場合、409エラーを返す', async () => {
      supabase.auth.signUp.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'User already registered' }
      })

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(validRegisterData)
      })

      const response = await REGISTER(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.success).toBe(false)
      expect(data.error).toBe('このメールアドレスは既に登録されています')
    })

    it('バリデーションエラーの場合、400エラーを返す', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123', // 短すぎるパスワード
        userType: 'invalid', // 無効なユーザータイプ
        displayName: ''
      }

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      })

      const response = await REGISTER(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('バリデーションエラー')
      expect(data.details).toBeDefined()
    })
  })

  describe('POST /api/auth/validate', () => {
    it('有効なトークンを検証できる', async () => {
      supabase.auth.getUser.mockResolvedValueOnce({
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com'
          }
        },
        error: null
      })

      const userSelectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: {
              id: 'internal-user-123',
              user_type: 'company',
              rextrix_user_profiles: [{
                display_name: 'テストユーザー',
                region: '東京都'
              }]
            },
            error: null
          })
        }))
      }))
      
      supabase.from.mockReturnValueOnce({
        select: userSelectMock
      })

      const request = new NextRequest('http://localhost:3000/api/auth/validate', {
        method: 'POST',
        body: JSON.stringify({ token: 'valid-token' })
      })

      const response = await VALIDATE(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.user.email).toBe('test@example.com')
      expect(data.data.user.user_type).toBe('company')
    })

    it('無効なトークンの場合、401エラーを返す', async () => {
      supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Invalid token' }
      })

      const request = new NextRequest('http://localhost:3000/api/auth/validate', {
        method: 'POST',
        body: JSON.stringify({ token: 'invalid-token' })
      })

      const response = await VALIDATE(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('認証ヘッダーが無効です')
    })

    it('トークンが提供されない場合、400エラーを返す', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/validate', {
        method: 'POST',
        body: JSON.stringify({})
      })

      const response = await VALIDATE(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('トークンが見つかりません')
    })
  })

  describe('POST /api/auth/logout', () => {
    it('正常にログアウトできる', async () => {
      supabase.auth.signOut.mockResolvedValueOnce({
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/auth/logout', {
        method: 'POST'
      })

      const response = await LOGOUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('ログアウトしました')
    })

    it('Supabaseエラーが発生した場合でも成功を返す', async () => {
      supabase.auth.signOut.mockResolvedValueOnce({
        error: { message: 'Some error' }
      })

      const request = new NextRequest('http://localhost:3000/api/auth/logout', {
        method: 'POST'
      })

      const response = await LOGOUT(request)
      const data = await response.json()

      // クライアント側のログアウトは成功とする
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })
})