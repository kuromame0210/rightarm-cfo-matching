// 気になる機能 API Route Tests
import { GET, POST, DELETE } from '@/app/api/interests/route'
import { supabaseAdmin } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'
import { createMockRequest, setupTestEnv } from '../utils/test-setup'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  },
}))

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}))

const mockSupabaseAdmin = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>
const jwt = require('jsonwebtoken')

describe('/api/interests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupTestEnv()
  })

  describe('GET /api/interests', () => {
    it('should get interests list successfully with demo token', async () => {
      const mockUserData = { id: 'user-1', email: 'test@example.com' }
      const mockInterestsData = [
        {
          id: 'interest-1',
          target_user_id: 'cfo-1',
          target_type: 'cfo',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'interest-2',
          target_user_id: 'company-1',
          target_type: 'company',
          created_at: '2024-01-02T00:00:00Z',
        },
      ]

      // Mock user lookup for demo token
      const mockFromUsers = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: mockUserData,
              error: null,
            }),
          })),
        })),
      }

      // Mock interests lookup
      const mockFromInterests = {
        select: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({
            data: mockInterestsData,
            error: null,
          }),
        })),
      }

      mockSupabaseAdmin.from
        .mockReturnValueOnce(mockFromUsers as any) // First call for user lookup
        .mockReturnValueOnce(mockFromInterests as any) // Second call for interests

      const request = createMockRequest('http://localhost:3000/api/interests', {
        method: 'GET',
        headers: {
          'authorization': 'Bearer demo-token',
        },
      })

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(mockInterestsData)
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith(TABLES.USERS)
      expect(mockSupabaseAdmin.from).toHaveBeenCalledWith(TABLES.INTERESTS)
    })

    it('should get interests list successfully with JWT token', async () => {
      const mockUserData = { id: 'user-1', email: 'jwt@example.com' }
      const mockInterestsData = []

      jwt.verify.mockReturnValue({ email: 'jwt@example.com' })

      const mockFromUsers = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: mockUserData,
              error: null,
            }),
          })),
        })),
      }

      const mockFromInterests = {
        select: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({
            data: mockInterestsData,
            error: null,
          }),
        })),
      }

      mockSupabaseAdmin.from
        .mockReturnValueOnce(mockFromUsers as any)
        .mockReturnValueOnce(mockFromInterests as any)

      const request = createMockRequest('http://localhost:3000/api/interests', {
        method: 'GET',
        headers: {
          'authorization': 'Bearer jwt-token-here',
        },
      })

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(mockInterestsData)
    })

    it('should return 401 without authorization header', async () => {
      const request = createMockRequest('http://localhost:3000/api/interests', {
        method: 'GET',
      })

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(401)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('認証が必要です')
    })

    it('should return 404 when user not found', async () => {
      const mockFromUsers = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          })),
        })),
      }

      mockSupabaseAdmin.from.mockReturnValue(mockFromUsers as any)

      const request = createMockRequest('http://localhost:3000/api/interests', {
        method: 'GET',
        headers: {
          'authorization': 'Bearer demo-token',
        },
      })

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('ユーザーが見つかりません')
    })

    it('should handle database error when fetching interests', async () => {
      const mockUserData = { id: 'user-1', email: 'test@example.com' }

      const mockFromUsers = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: mockUserData,
              error: null,
            }),
          })),
        })),
      }

      const mockFromInterests = {
        select: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        })),
      }

      mockSupabaseAdmin.from
        .mockReturnValueOnce(mockFromUsers as any)
        .mockReturnValueOnce(mockFromInterests as any)

      const request = createMockRequest('http://localhost:3000/api/interests', {
        method: 'GET',
        headers: {
          'authorization': 'Bearer demo-token',
        },
      })

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('気になるリストの取得に失敗しました')
    })
  })

  describe('POST /api/interests', () => {
    it('should add interest successfully', async () => {
      const mockUserData = { id: 'user-1', email: 'test@example.com' }
      const mockInterestData = {
        id: 'interest-1',
        user_id: 'user-1',
        target_user_id: 'cfo-1',
        target_type: 'cfo',
        created_at: '2024-01-01T00:00:00Z',
      }

      const mockFromUsers = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: mockUserData,
              error: null,
            }),
          })),
        })),
      }

      const mockFromInterests = {
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: mockInterestData,
              error: null,
            }),
          })),
        })),
      }

      mockSupabaseAdmin.from
        .mockReturnValueOnce(mockFromUsers as any)
        .mockReturnValueOnce(mockFromInterests as any)

      const request = createMockRequest('http://localhost:3000/api/interests', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer demo-token',
          'content-type': 'application/json',
        },
        body: {
          targetUserId: 'cfo-1',
          targetType: 'cfo',
        },
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(mockInterestData)
      expect(responseData.message).toBe('気になるに追加しました')
    })

    it('should return 400 when required fields are missing', async () => {
      const request = createMockRequest('http://localhost:3000/api/interests', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer demo-token',
          'content-type': 'application/json',
        },
        body: {
          targetUserId: 'cfo-1',
          // targetType is missing
        },
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('targetUserIdとtargetTypeが必要です')
    })

    it('should return 409 when interest already exists', async () => {
      const mockUserData = { id: 'user-1', email: 'test@example.com' }

      const mockFromUsers = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: mockUserData,
              error: null,
            }),
          })),
        })),
      }

      const mockFromInterests = {
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: '23505', message: 'duplicate key' },
            }),
          })),
        })),
      }

      mockSupabaseAdmin.from
        .mockReturnValueOnce(mockFromUsers as any)
        .mockReturnValueOnce(mockFromInterests as any)

      const request = createMockRequest('http://localhost:3000/api/interests', {
        method: 'POST',
        headers: {
          'authorization': 'Bearer demo-token',
          'content-type': 'application/json',
        },
        body: {
          targetUserId: 'cfo-1',
          targetType: 'cfo',
        },
      })

      const response = await POST(request)
      const responseData = await response.json()

      expect(response.status).toBe(409)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('既に気になるに追加されています')
    })
  })

  describe('DELETE /api/interests', () => {
    it('should delete interest successfully', async () => {
      const mockUserData = { id: 'user-1', email: 'test@example.com' }

      const mockFromUsers = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: mockUserData,
              error: null,
            }),
          })),
        })),
      }

      const mockFromInterests = {
        delete: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        })),
      }

      mockSupabaseAdmin.from
        .mockReturnValueOnce(mockFromUsers as any)
        .mockReturnValueOnce(mockFromInterests as any)

      const request = createMockRequest(
        'http://localhost:3000/api/interests?targetUserId=cfo-1',
        {
          method: 'DELETE',
          headers: {
            'authorization': 'Bearer demo-token',
          },
        }
      )

      const response = await DELETE(request)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.success).toBe(true)
      expect(responseData.message).toBe('気になるから削除しました')
    })

    it('should return 400 when targetUserId is missing', async () => {
      const request = createMockRequest('http://localhost:3000/api/interests', {
        method: 'DELETE',
        headers: {
          'authorization': 'Bearer demo-token',
        },
      })

      const response = await DELETE(request)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('targetUserIdが必要です')
    })

    it('should handle database error when deleting interest', async () => {
      const mockUserData = { id: 'user-1', email: 'test@example.com' }

      const mockFromUsers = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValue({
              data: mockUserData,
              error: null,
            }),
          })),
        })),
      }

      const mockFromInterests = {
        delete: jest.fn(() => ({
          eq: jest.fn().mockResolvedValue({
            error: { message: 'Database error' },
          }),
        })),
      }

      mockSupabaseAdmin.from
        .mockReturnValueOnce(mockFromUsers as any)
        .mockReturnValueOnce(mockFromInterests as any)

      const request = createMockRequest(
        'http://localhost:3000/api/interests?targetUserId=cfo-1',
        {
          method: 'DELETE',
          headers: {
            'authorization': 'Bearer demo-token',
          },
        }
      )

      const response = await DELETE(request)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('気になるの削除に失敗しました')
    })
  })

  describe('Authentication', () => {
    it('should handle invalid JWT token', async () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const request = createMockRequest('http://localhost:3000/api/interests', {
        method: 'GET',
        headers: {
          'authorization': 'Bearer invalid-jwt-token',
        },
      })

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(401)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('認証が必要です')
    })

    it('should handle malformed authorization header', async () => {
      const request = createMockRequest('http://localhost:3000/api/interests', {
        method: 'GET',
        headers: {
          'authorization': 'InvalidFormat',
        },
      })

      const response = await GET(request)
      const responseData = await response.json()

      expect(response.status).toBe(401)
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('認証が必要です')
    })
  })
})