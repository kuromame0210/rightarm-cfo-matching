import { POST } from '../../auth/register/route'

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}))

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-123',
  },
})

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
    COMPANIES: 'rextrix_companies',
    CFOS: 'rextrix_cfos',
    CHALLENGE_TAGS: 'rextrix_challenge_tags',
    COMPANY_CHALLENGES: 'rextrix_company_challenges',
    SKILL_TAGS: 'rextrix_skill_tags',
    CFO_SKILLS: 'rextrix_cfo_skills',
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

describe('/api/auth/register - Table-based Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('正常な登録', () => {
    it('CFOユーザーが正常に登録できる', async () => {
      const requestData = {
        email: 'cfo@example.com',
        password: 'password123',
        userType: 'cfo',
        displayName: 'テストCFO',
        nickname: 'CFOテスト',
        skills: {
          finance: ['財務戦略', '予算管理'],
          accounting: ['税務対応'],
        },
        experience: '10年以上の財務経験',
        workPreference: 'weekly',
        compensationRange: '月50万円〜',
      }

      // Mock bcrypt
      mockBcrypt.hash.mockResolvedValue('$2a$12$hashed_password' as never)

      let fromCallCount = 0
      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        fromCallCount++
        
        if (table === 'rextrix_users' && fromCallCount === 1) {
          // 既存ユーザーチェック
          return {
            select: () => ({
              eq: () => ({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'No rows found' },
                }),
              }),
            }),
          } as any
        }
        
        if (table === 'rextrix_users' && fromCallCount === 2) {
          // ユーザー作成
          return {
            insert: () => ({
              select: () => ({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'user-123',
                    email: 'cfo@example.com',
                    user_type: 'cfo',
                    status: 'active',
                  },
                  error: null,
                }),
              }),
            }),
          } as any
        }
        
        if (table === 'rextrix_user_profiles') {
          // プロフィール作成
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          } as any
        }
        
        if (table === 'rextrix_cfos') {
          // CFO作成
          return {
            insert: () => ({
              select: () => ({
                single: jest.fn().mockResolvedValue({
                  data: { id: 'cfo-123' },
                  error: null,
                }),
              }),
            }),
          } as any
        }
        
        if (table === 'rextrix_skill_tags') {
          // スキルタグ検索
          return {
            select: () => ({
              in: jest.fn().mockResolvedValue({
                data: [
                  { id: 'skill-1', name: '財務戦略' },
                  { id: 'skill-2', name: '予算管理' },
                  { id: 'skill-3', name: '税務対応' },
                ],
                error: null,
              }),
            }),
          } as any
        }
        
        if (table === 'rextrix_cfo_skills') {
          // CFOスキル関連付け
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          } as any
        }

        if (table === 'rextrix_users' && fromCallCount === 3) {
          // 最終ユーザーデータ取得
          return {
            select: () => ({
              eq: () => ({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'user-123',
                    email: 'cfo@example.com',
                    user_type: 'cfo',
                    status: 'active',
                    rextrix_user_profiles: {
                      display_name: 'テストCFO',
                      nickname: 'CFOテスト',
                    },
                  },
                  error: null,
                }),
              }),
            }),
          } as any
        }
        
        return {} as any
      })

      const request = createMockRequest(requestData)
      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data.user.email).toBe('cfo@example.com')
      expect(responseData.data.user.userType).toBe('cfo')
      expect(responseData.message).toBe('ユーザー登録が完了しました')
    })

    it('企業ユーザーが正常に登録できる', async () => {
      const requestData = {
        email: 'company@example.com',
        password: 'password123',
        userType: 'company',
        displayName: 'テスト会社',
        companyName: 'テスト株式会社',
        businessName: 'テストビジネス',
        description: 'テスト企業です',
        revenueRange: '100m_1b',
        challengeTags: ['資金調達', 'IPO準備'],
      }

      mockBcrypt.hash.mockResolvedValue('$2a$12$hashed_password' as never)

      let fromCallCount = 0
      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        fromCallCount++
        
        if (table === 'rextrix_users' && fromCallCount === 1) {
          return {
            select: () => ({
              eq: () => ({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: 'No rows found' },
                }),
              }),
            }),
          } as any
        }
        
        if (table === 'rextrix_users' && fromCallCount === 2) {
          return {
            insert: () => ({
              select: () => ({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'user-456',
                    email: 'company@example.com',
                    user_type: 'company',
                    status: 'active',
                  },
                  error: null,
                }),
              }),
            }),
          } as any
        }
        
        if (table === 'rextrix_user_profiles') {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          } as any
        }
        
        if (table === 'rextrix_companies') {
          return {
            insert: () => ({
              select: () => ({
                single: jest.fn().mockResolvedValue({
                  data: { id: 'company-456' },
                  error: null,
                }),
              }),
            }),
          } as any
        }
        
        if (table === 'rextrix_challenge_tags') {
          return {
            select: () => ({
              in: jest.fn().mockResolvedValue({
                data: [
                  { id: 'challenge-1', name: '資金調達' },
                  { id: 'challenge-2', name: 'IPO準備' },
                ],
                error: null,
              }),
            }),
          } as any
        }
        
        if (table === 'rextrix_company_challenges') {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          } as any
        }

        if (table === 'rextrix_users' && fromCallCount === 3) {
          return {
            select: () => ({
              eq: () => ({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'user-456',
                    email: 'company@example.com',
                    user_type: 'company',
                    status: 'active',
                    rextrix_user_profiles: {
                      display_name: 'テスト会社',
                      nickname: null,
                    },
                  },
                  error: null,
                }),
              }),
            }),
          } as any
        }
        
        return {} as any
      })

      const request = createMockRequest(requestData)
      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data.user.email).toBe('company@example.com')
      expect(responseData.data.user.userType).toBe('company')
    })
  })

  describe('バリデーションエラー', () => {
    it('無効なメールアドレスでバリデーションエラーが返される', async () => {
      const requestData = {
        email: 'invalid-email',
        password: '123',
        userType: 'invalid',
        displayName: '',
      }

      const request = createMockRequest(requestData)
      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('バリデーションエラー')
      expect(responseData.details).toBeDefined()
    })

    it('パスワードが短すぎる場合にエラーが返される', async () => {
      const requestData = {
        email: 'test@example.com',
        password: '123',
        userType: 'cfo',
        displayName: 'テスト',
      }

      const request = createMockRequest(requestData)
      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('バリデーションエラー')
    })
  })

  describe('既存ユーザーエラー', () => {
    it('既に存在するメールアドレスでエラーが返される', async () => {
      mockSupabaseAdmin.from.mockImplementation((table: string) => {
        if (table === 'rextrix_users') {
          return {
            select: () => ({
              eq: () => ({
                single: jest.fn().mockResolvedValue({
                  data: { email: 'existing@example.com' },
                  error: null,
                }),
              }),
            }),
          } as any
        }
        return {} as any
      })

      const requestData = {
        email: 'existing@example.com',
        password: 'password123',
        userType: 'cfo',
        displayName: 'テスト',
      }

      const request = createMockRequest(requestData)
      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('このメールアドレスは既に登録されています')
    })
  })

  describe('サーバーエラー', () => {
    it('予期しないエラーで500エラーが返される', async () => {
      mockSupabaseAdmin.from.mockImplementation(() => {
        throw new Error('Database connection failed')
      })

      const requestData = {
        email: 'test@example.com',
        password: 'password123',
        userType: 'cfo',
        displayName: 'テスト',
      }

      const request = createMockRequest(requestData)
      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('登録に失敗しました')
    })
  })
})