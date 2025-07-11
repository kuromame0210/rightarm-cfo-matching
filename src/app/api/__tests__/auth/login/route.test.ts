import { POST } from '../../../auth/login/route'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  },
}))

import { supabase } from '@/lib/supabase'
const mockSupabase = supabase as jest.Mocked<typeof supabase>

jest.mock('@/lib/constants', () => ({
  TABLES: {
    USERS: 'rextrix_users',
    USER_PROFILES: 'rextrix_user_profiles',
  },
}))

// Note: Using real Zod to avoid instanceof issues

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const createMockRequest = (body: any) => {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as unknown as NextRequest
  }

  describe('正常なログイン', () => {
    it('有効な認証情報でログインできる', async () => {
      const mockAuthData = {
        user: { id: 'user-123', email: 'test@example.com' },
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_at: 1234567890,
          token_type: 'bearer',
        },
      }

      const mockUserData = {
        id: 'rightarm-user-123',
        email: 'test@example.com',
        user_type: 'company',
        status: 'active',
        rextrix_user_profiles: {
          display_name: 'テストユーザー',
          nickname: 'テスト',
        },
      }

      // Mock Supabase responses
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: mockAuthData,
        error: null,
      })

      const selectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: mockUserData,
            error: null,
          }),
        })),
      }))

      const updateMock = jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      }))

      mockSupabase.from.mockReturnValue({
        select: selectMock,
        update: updateMock,
      })

      // Using real Zod validation

      const request = createMockRequest({
        email: 'test@example.com',
        password: 'password123',
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data.user.email).toBe('test@example.com')
      expect(responseData.data.user.userType).toBe('company')
      expect(responseData.data.session.access_token).toBe('mock-access-token')
      expect(responseData.message).toBe('ログインしました')
    })

    it('プロフィール情報が配列の場合も正常に処理される', async () => {
      const mockAuthData = {
        user: { id: 'user-123', email: 'test@example.com' },
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_at: 1234567890,
          token_type: 'bearer',
        },
      }

      const mockUserData = {
        id: 'rightarm-user-123',
        email: 'test@example.com',
        user_type: 'cfo',
        status: 'active',
        rextrix_user_profiles: [
          {
            display_name: 'テストCFO',
            nickname: 'CFOテスト',
          },
        ],
      }

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: mockAuthData,
        error: null,
      })

      const selectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: mockUserData,
            error: null,
          }),
        })),
      }))

      const updateMock = jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      }))

      mockSupabase.from.mockReturnValue({
        select: selectMock,
        update: updateMock,
      })

      const { z } = require('zod')
      z.object().parse.mockReturnValue({
        email: 'test@example.com',
        password: 'password123',
      })

      const request = createMockRequest({
        email: 'test@example.com',
        password: 'password123',
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data.user.displayName).toBe('テストCFO')
      expect(responseData.data.user.userType).toBe('cfo')
    })
  })

  describe('認証エラー', () => {
    it('無効な認証情報でエラーが返される', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' },
      })

      const { z } = require('zod')
      z.object().parse.mockReturnValue({
        email: 'test@example.com',
        password: 'wrongpassword',
      })

      const request = createMockRequest({
        email: 'test@example.com',
        password: 'wrongpassword',
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(401)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('メールアドレスまたはパスワードが間違っています')
    })

    it('メール未確認エラーが適切に処理される', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Email not confirmed' },
      })

      const { z } = require('zod')
      z.object().parse.mockReturnValue({
        email: 'test@example.com',
        password: 'password123',
      })

      const request = createMockRequest({
        email: 'test@example.com',
        password: 'password123',
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(401)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('メールアドレスの確認が完了していません')
    })

    it('リクエスト過多エラーが適切に処理される', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Too many requests' },
      })

      const { z } = require('zod')
      z.object().parse.mockReturnValue({
        email: 'test@example.com',
        password: 'password123',
      })

      const request = createMockRequest({
        email: 'test@example.com',
        password: 'password123',
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(401)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('ログイン試行回数が上限に達しました。しばらく後に再試行してください')
    })

    it('ユーザー情報が取得できない場合', async () => {
      const mockAuthData = {
        user: { id: 'user-123', email: 'test@example.com' },
        session: {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_at: 1234567890,
          token_type: 'bearer',
        },
      }

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: mockAuthData,
        error: null,
      })

      const selectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'User not found' },
          }),
        })),
      }))

      mockSupabase.from.mockReturnValue({
        select: selectMock,
      })

      const { z } = require('zod')
      z.object().parse.mockReturnValue({
        email: 'test@example.com',
        password: 'password123',
      })

      const request = createMockRequest({
        email: 'test@example.com',
        password: 'password123',
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('ユーザー情報の取得に失敗しました')
    })
  })

  describe('アカウント状態チェック', () => {
    it('承認待ちアカウントでエラーが返される', async () => {
      const mockAuthData = {
        user: { id: 'user-123', email: 'test@example.com' },
        session: { access_token: 'mock-token' },
      }

      const mockUserData = {
        id: 'rightarm-user-123',
        email: 'test@example.com',
        user_type: 'company',
        status: 'pending',
        rextrix_user_profiles: null,
      }

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: mockAuthData,
        error: null,
      })

      const selectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: mockUserData,
            error: null,
          }),
        })),
      }))

      mockSupabase.from.mockReturnValue({
        select: selectMock,
      })

      const { z } = require('zod')
      z.object().parse.mockReturnValue({
        email: 'test@example.com',
        password: 'password123',
      })

      const request = createMockRequest({
        email: 'test@example.com',
        password: 'password123',
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(403)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('アカウントが承認待ちです')
    })

    it('停止中アカウントでエラーが返される', async () => {
      const mockAuthData = {
        user: { id: 'user-123', email: 'test@example.com' },
        session: { access_token: 'mock-token' },
      }

      const mockUserData = {
        id: 'rightarm-user-123',
        email: 'test@example.com',
        user_type: 'company',
        status: 'suspended',
        rextrix_user_profiles: null,
      }

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: mockAuthData,
        error: null,
      })

      const selectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: mockUserData,
            error: null,
          }),
        })),
      }))

      mockSupabase.from.mockReturnValue({
        select: selectMock,
      })

      const { z } = require('zod')
      z.object().parse.mockReturnValue({
        email: 'test@example.com',
        password: 'password123',
      })

      const request = createMockRequest({
        email: 'test@example.com',
        password: 'password123',
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(403)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('アカウントが停止されています')
    })
  })

  describe('バリデーションエラー', () => {
    it('無効なメールアドレスでバリデーションエラーが返される', async () => {
      const { z } = require('zod')
      const mockZodError = {
        name: 'ZodError',
        errors: [
          {
            path: ['email'],
            message: '有効なメールアドレスを入力してください',
          },
        ],
      }
      z.object().parse.mockImplementation(() => {
        throw mockZodError
      })

      const request = createMockRequest({
        email: 'invalid-email',
        password: 'password123',
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('バリデーションエラー')
      expect(responseData.details).toEqual(mockZodError.errors)
    })

    it('パスワードが空の場合にバリデーションエラーが返される', async () => {
      const { z } = require('zod')
      const mockZodError = {
        name: 'ZodError',
        errors: [
          {
            path: ['password'],
            message: 'パスワードを入力してください',
          },
        ],
      }
      z.object().parse.mockImplementation(() => {
        throw mockZodError
      })

      const request = createMockRequest({
        email: 'test@example.com',
        password: '',
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('バリデーションエラー')
    })
  })

  describe('サーバーエラー', () => {
    it('予期しないエラーで500エラーが返される', async () => {
      mockSupabase.auth.signInWithPassword.mockRejectedValue(
        new Error('Database connection failed')
      )

      const { z } = require('zod')
      z.object().parse.mockReturnValue({
        email: 'test@example.com',
        password: 'password123',
      })

      const request = createMockRequest({
        email: 'test@example.com',
        password: 'password123',
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('ログインに失敗しました')
    })
  })
})