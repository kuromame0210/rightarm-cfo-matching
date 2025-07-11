import { NextRequest } from 'next/server'
import { GET, POST } from '../contracts/route'
import { GET as GET_DETAIL, PUT, DELETE } from '../contracts/[id]/route'

// Supabaseのモック
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({
            range: jest.fn()
          }))
        })),
        like: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              single: jest.fn()
            }))
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn()
          }))
        }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn()
      }))
    }))
  }
}))

const { supabase } = require('@/lib/supabase')

// テスト用データ
const mockUser = {
  id: 'user-123',
  email: 'test@example.com'
}

const mockUserData = {
  id: 'internal-user-123',
  user_type: 'company'
}

const mockContract = {
  id: 'contract-123',
  status: 'active',
  monthly_fee: 500000,
  contract_period: 12,
  start_date: '2024-01-01T00:00:00Z',
  end_date: '2024-12-31T23:59:59Z',
  created_at: '2024-01-01T00:00:00Z',
  rextrix_companies: {
    company_name: 'テスト株式会社',
    business_name: 'テスト事業',
    industry: 'IT',
    rextrix_users: [{
      email: 'company@test.com',
      rextrix_user_profiles: [{
        display_name: '企業担当者'
      }]
    }]
  },
  rextrix_cfos: {
    specialization: '財務戦略',
    years_of_experience: 10,
    rextrix_users: [{
      email: 'cfo@test.com',
      rextrix_user_profiles: [{
        display_name: 'テストCFO',
        nickname: 'CFO太郎'
      }]
    }]
  }
}

describe('Contracts API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/contracts', () => {
    it('認証なしの場合、401エラーを返す', async () => {
      supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: new Error('Unauthorized')
      })

      const request = new NextRequest('http://localhost:3000/api/contracts')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('認証が必要です')
    })

    it('正常に契約一覧を取得できる', async () => {
      // 認証成功のモック
      supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      // ユーザー情報取得のモック
      const userSelectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: mockUserData,
            error: null
          })
        }))
      }))
      supabase.from.mockReturnValueOnce({
        select: userSelectMock
      })

      // 契約一覧取得のモック
      const contractsQueryMock = {
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              range: jest.fn().mockResolvedValueOnce({
                data: [mockContract],
                error: null,
                count: 1
              })
            }))
          }))
        }))
      }
      supabase.from.mockReturnValueOnce(contractsQueryMock)

      const request = new NextRequest('http://localhost:3000/api/contracts?page=1&limit=10')
      request.headers.set('authorization', 'Bearer valid-token')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual([mockContract])
      expect(data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1
      })
    })

    it('ステータスフィルターが正常に動作する', async () => {
      supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      const userSelectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: mockUserData,
            error: null
          })
        }))
      }))
      supabase.from.mockReturnValueOnce({
        select: userSelectMock
      })

      const eqMock = jest.fn(() => ({
        order: jest.fn(() => ({
          range: jest.fn().mockResolvedValueOnce({
            data: [],
            error: null,
            count: 0
          })
        }))
      }))

      const contractsQueryMock = {
        select: jest.fn(() => ({
          eq: eqMock
        }))
      }
      supabase.from.mockReturnValueOnce(contractsQueryMock)

      const request = new NextRequest('http://localhost:3000/api/contracts?status=active')
      request.headers.set('authorization', 'Bearer valid-token')

      await GET(request)

      // ステータスフィルターが適用されることを確認
      expect(eqMock).toHaveBeenCalledWith('status', 'active')
    })
  })

  describe('POST /api/contracts', () => {
    const validContractData = {
      cfoId: 'cfo-123',
      companyId: 'company-123',
      contractType: 'regular',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      workingDays: 20,
      monthlyFee: 500000
    }

    it('認証なしの場合、401エラーを返す', async () => {
      supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: new Error('Unauthorized')
      })

      const request = new NextRequest('http://localhost:3000/api/contracts', {
        method: 'POST',
        body: JSON.stringify(validContractData)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })

    it('CFOユーザーの場合、403エラーを返す', async () => {
      supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      const userSelectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: { ...mockUserData, user_type: 'cfo' },
            error: null
          })
        }))
      }))
      supabase.from.mockReturnValueOnce({
        select: userSelectMock
      })

      const request = new NextRequest('http://localhost:3000/api/contracts', {
        method: 'POST',
        body: JSON.stringify(validContractData)
      })
      request.headers.set('authorization', 'Bearer valid-token')

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('契約の作成は企業ユーザーのみ可能です')
    })

    it('有効なデータで契約を作成できる', async () => {
      supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      // ユーザー情報取得
      const userSelectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: mockUserData,
            error: null
          })
        }))
      }))
      supabase.from.mockReturnValueOnce({
        select: userSelectMock
      })

      // CFO存在確認
      const cfoSelectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: { id: 'cfo-123' },
            error: null
          })
        }))
      }))
      supabase.from.mockReturnValueOnce({
        select: cfoSelectMock
      })

      // 企業存在確認
      const companySelectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn().mockResolvedValueOnce({
              data: { id: 'company-123' },
              error: null
            })
          }))
        }))
      }))
      supabase.from.mockReturnValueOnce({
        select: companySelectMock
      })

      // 契約作成
      const insertMock = jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: mockContract,
            error: null
          })
        }))
      }))
      supabase.from.mockReturnValueOnce({
        insert: insertMock
      })

      const request = new NextRequest('http://localhost:3000/api/contracts', {
        method: 'POST',
        body: JSON.stringify(validContractData)
      })
      request.headers.set('authorization', 'Bearer valid-token')

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockContract)
      expect(data.message).toBe('契約を作成しました')
    })

    it('バリデーションエラーの場合、400エラーを返す', async () => {
      supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      const userSelectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: mockUserData,
            error: null
          })
        }))
      }))
      supabase.from.mockReturnValueOnce({
        select: userSelectMock
      })

      const invalidData = {
        cfoId: 'invalid-uuid',
        companyId: '',
        monthlyFee: -1000
      }

      const request = new NextRequest('http://localhost:3000/api/contracts', {
        method: 'POST',
        body: JSON.stringify(invalidData)
      })
      request.headers.set('authorization', 'Bearer valid-token')

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('バリデーションエラー')
      expect(data.details).toBeDefined()
    })
  })

  describe('GET /api/contracts/[id]', () => {
    it('契約詳細を正常に取得できる', async () => {
      supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      // ユーザー情報取得
      const userSelectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: mockUserData,
            error: null
          })
        }))
      }))
      supabase.from.mockReturnValueOnce({
        select: userSelectMock
      })

      // 契約詳細取得
      const contractSelectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: mockContract,
            error: null
          })
        }))
      }))
      supabase.from.mockReturnValueOnce({
        select: contractSelectMock
      })

      const request = new NextRequest('http://localhost:3000/api/contracts/contract-123')
      request.headers.set('authorization', 'Bearer valid-token')

      const response = await GET_DETAIL(request, { params: Promise.resolve({ id: 'contract-123' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockContract)
    })

    it('存在しない契約の場合、404エラーを返す', async () => {
      supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      const userSelectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: mockUserData,
            error: null
          })
        }))
      }))
      supabase.from.mockReturnValueOnce({
        select: userSelectMock
      })

      const contractSelectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: null,
            error: new Error('Not found')
          })
        }))
      }))
      supabase.from.mockReturnValueOnce({
        select: contractSelectMock
      })

      const request = new NextRequest('http://localhost:3000/api/contracts/nonexistent')
      request.headers.set('authorization', 'Bearer valid-token')

      const response = await GET_DETAIL(request, { params: Promise.resolve({ id: 'nonexistent' }) })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toBe('契約が見つかりません')
    })
  })

  describe('PUT /api/contracts/[id]', () => {
    const updateData = {
      contractType: 'project',
      monthlyFee: 600000,
      status: 'active'
    }

    it('契約を正常に更新できる', async () => {
      supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      // ユーザー情報取得
      const userSelectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: mockUserData,
            error: null
          })
        }))
      }))
      supabase.from.mockReturnValueOnce({
        select: userSelectMock
      })

      // 既存契約取得
      const existingContractMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: mockContract,
            error: null
          })
        }))
      }))
      supabase.from.mockReturnValueOnce({
        select: existingContractMock
      })

      // 契約更新
      const updateMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn().mockResolvedValueOnce({
              data: { ...mockContract, ...updateData },
              error: null
            })
          }))
        }))
      }))
      supabase.from.mockReturnValueOnce({
        update: updateMock
      })

      const request = new NextRequest('http://localhost:3000/api/contracts/contract-123', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      })
      request.headers.set('authorization', 'Bearer valid-token')

      const response = await PUT(request, { params: Promise.resolve({ id: 'contract-123' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('契約を更新しました')
    })
  })

  describe('DELETE /api/contracts/[id]', () => {
    it('下書きステータスの契約を削除できる', async () => {
      supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      // ユーザー情報取得
      const userSelectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: mockUserData,
            error: null
          })
        }))
      }))
      supabase.from.mockReturnValueOnce({
        select: userSelectMock
      })

      // 既存契約取得（下書きステータス）
      const draftContract = { ...mockContract, status: 'draft' }
      const existingContractMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: draftContract,
            error: null
          })
        }))
      }))
      supabase.from.mockReturnValueOnce({
        select: existingContractMock
      })

      // 契約削除
      const deleteMock = jest.fn(() => ({
        eq: jest.fn().mockResolvedValueOnce({
          error: null
        })
      }))
      supabase.from.mockReturnValueOnce({
        delete: deleteMock
      })

      const request = new NextRequest('http://localhost:3000/api/contracts/contract-123', {
        method: 'DELETE'
      })
      request.headers.set('authorization', 'Bearer valid-token')

      const response = await DELETE(request, { params: Promise.resolve({ id: 'contract-123' }) })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('契約を削除しました')
    })

    it('アクティブな契約は削除できない', async () => {
      supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null
      })

      const userSelectMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: mockUserData,
            error: null
          })
        }))
      }))
      supabase.from.mockReturnValueOnce({
        select: userSelectMock
      })

      // アクティブな契約
      const activeContract = { ...mockContract, status: 'active' }
      const existingContractMock = jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValueOnce({
            data: activeContract,
            error: null
          })
        }))
      }))
      supabase.from.mockReturnValueOnce({
        select: existingContractMock
      })

      const request = new NextRequest('http://localhost:3000/api/contracts/contract-123', {
        method: 'DELETE'
      })
      request.headers.set('authorization', 'Bearer valid-token')

      const response = await DELETE(request, { params: Promise.resolve({ id: 'contract-123' }) })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('アクティブな契約は削除できません。まず契約をキャンセルしてください')
    })
  })
})