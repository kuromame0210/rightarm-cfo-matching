import { POST } from '../../auth/login/route'

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

// Mock Supabase Admin
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}))

jest.mock('@/lib/constants', () => ({
  TABLES: {
    USERS: 'rextrix_users',
    USER_PROFILES: 'rextrix_user_profiles',
  },
}))

import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

const mockSupabaseAdmin = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>

const createMockRequest = (body: any) => {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest
}

describe('/api/auth/login - Table-based Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('正常なログイン', () => {
    it('有効な認証情報でログインできる（Company）', async () => {
      const mockUserData = {
        id: 'user-123',
        email: 'company@example.com',
        password_hash: '$2a$12$hashed_password',
        user_type: 'company',
        status: 'active',
        rextrix_user_profiles: {
          display_name: 'テスト会社',
          nickname: null,
        },
      }

      // Mock database query
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

      mockSupabaseAdmin.from.mockReturnValue({
        select: selectMock,
        update: updateMock,
      } as any)

      // Mock password comparison
      mockBcrypt.compare.mockResolvedValue(true as never)

      const request = createMockRequest({
        email: 'company@example.com',
        password: 'password123',
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data.user.email).toBe('company@example.com')
      expect(responseData.data.user.userType).toBe('company')
      expect(responseData.data.user.displayName).toBe('テスト会社')
      expect(responseData.data.token).toBeDefined()
      expect(responseData.message).toBe('ログインしました')
    })

    it('有効な認証情報でログインできる（CFO）', async () => {
      const mockUserData = {
        id: 'user-456',
        email: 'cfo@example.com',
        password_hash: '$2a$12$hashed_password',
        user_type: 'cfo',
        status: 'active',
        rextrix_user_profiles: [
          {
            display_name: 'テストCFO',
            nickname: 'CFOテスト',
          },
        ],
      }

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

      mockSupabaseAdmin.from.mockReturnValue({
        select: selectMock,
        update: updateMock,
      } as any)

      mockBcrypt.compare.mockResolvedValue(true as never)

      const request = createMockRequest({
        email: 'cfo@example.com',
        password: 'password123',
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data.user.email).toBe('cfo@example.com')
      expect(responseData.data.user.userType).toBe('cfo')
      expect(responseData.data.user.displayName).toBe('テストCFO')
    })
  })

  describe('認証エラー', () => {
    it('存在しないユーザーでエラーが返される', async () => {
      const selectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'User not found' },
          }),
        })),
      }))

      mockSupabaseAdmin.from.mockReturnValue({
        select: selectMock,
      } as any)

      const request = createMockRequest({
        email: 'nonexistent@example.com',
        password: 'password123',
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(401)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('メールアドレスまたはパスワードが間違っています')
    })

    it('無効なパスワードでエラーが返される', async () => {
      const mockUserData = {
        id: 'user-123',
        email: 'test@example.com',
        password_hash: '$2a$12$hashed_password',
        user_type: 'company',
        status: 'active',
        rextrix_user_profiles: null,
      }

      const selectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: mockUserData,
            error: null,
          }),
        })),
      }))

      mockSupabaseAdmin.from.mockReturnValue({
        select: selectMock,
      } as any)

      // Mock password comparison failure
      mockBcrypt.compare.mockResolvedValue(false as never)

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
  })

  describe('アカウント状態チェック', () => {
    it('承認待ちアカウントでエラーが返される', async () => {
      const mockUserData = {
        id: 'user-123',
        email: 'test@example.com',
        password_hash: '$2a$12$hashed_password',
        user_type: 'company',
        status: 'pending',
        rextrix_user_profiles: null,
      }

      const selectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: mockUserData,
            error: null,
          }),
        })),
      }))

      mockSupabaseAdmin.from.mockReturnValue({
        select: selectMock,
      } as any)

      mockBcrypt.compare.mockResolvedValue(true as never)

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
      const mockUserData = {
        id: 'user-123',
        email: 'test@example.com',
        password_hash: '$2a$12$hashed_password',
        user_type: 'company',
        status: 'suspended',
        rextrix_user_profiles: null,
      }

      const selectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: mockUserData,
            error: null,
          }),
        })),
      }))

      mockSupabaseAdmin.from.mockReturnValue({
        select: selectMock,
      } as any)

      mockBcrypt.compare.mockResolvedValue(true as never)

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
      const request = createMockRequest({
        email: 'invalid-email',
        password: 'password123',
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('バリデーションエラー')
      expect(responseData.details).toBeDefined()
    })

    it('パスワードが空の場合にバリデーションエラーが返される', async () => {
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
      mockSupabaseAdmin.from.mockImplementation(() => {
        throw new Error('Database connection failed')
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