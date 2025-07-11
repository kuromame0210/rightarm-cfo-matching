import { GET, POST } from '@/app/api/contracts/route'
import { supabase } from '@/lib/supabase'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
          order: jest.fn(() => ({
            range: jest.fn(),
          })),
          range: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
  TABLES: {
    CONTRACTS: 'rextrix_contracts',
    USERS: 'rextrix_users',
    COMPANIES: 'rextrix_companies',
    CFOS: 'rextrix_cfos',
    USER_PROFILES: 'rextrix_user_profiles',
  },
}))

const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('GET /api/contracts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch contracts for authenticated company user', async () => {
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'auth-user-123' } },
      error: null,
    } as any)

    // Mock user data
    const mockUserData = {
      id: 'user-123',
      user_type: 'company',
    }

    const mockContractsData = [
      {
        id: 'contract-1',
        status: 'active',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        monthly_fee: 500000,
        rextrix_companies: {
          company_name: 'Test Company',
          business_name: 'Test Business',
          industry: 'IT',
          rextrix_users: {
            email: 'company@test.com',
            rextrix_user_profiles: {
              display_name: 'Test Company',
            },
          },
        },
        rextrix_cfos: {
          specialization: '財務戦略',
          years_of_experience: 10,
          hourly_rate_min: 5000,
          hourly_rate_max: 10000,
          rextrix_users: {
            email: 'cfo@test.com',
            rextrix_user_profiles: {
              display_name: 'Test CFO',
              nickname: 'CFO太郎',
            },
          },
        },
      },
    ]

    // Mock database calls
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

    const mockFromContracts = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn().mockResolvedValue({
              data: mockContractsData,
              error: null,
              count: 1,
            }),
          })),
        })),
      })),
    }

    mockSupabase.from.mockImplementation((table: string) => {
      switch (table) {
        case 'rextrix_users':
          return mockFromUsers as any
        case 'rextrix_contracts':
          return mockFromContracts as any
        default:
          return {} as any
      }
    })

    const request = createMockRequest('http://localhost:3000/api/contracts', {
      headers: {
        authorization: 'Bearer valid-token',
      },
    })

    const response = await GET(request)
    const responseData = await response.json()

    expect(response.status).toBe(200)
    expect(responseData.success).toBe(true)
    expect(responseData.data).toHaveLength(1)
    expect(responseData.data[0].id).toBe('contract-1')
    expect(responseData.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    })
  })

  it('should return 401 for unauthenticated request', async () => {
    const request = createMockRequest('http://localhost:3000/api/contracts')

    const response = await GET(request)
    const responseData = await response.json()

    expect(response.status).toBe(401)
    expect(responseData.success).toBe(false)
    expect(responseData.error).toBe('認証が必要です')
  })

  it('should handle database error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'auth-user-123' } },
      error: null,
    } as any)

    const mockFromUsers = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { id: 'user-123', user_type: 'company' },
            error: null,
          }),
        })),
      })),
    }

    const mockFromContracts = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            range: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
              count: null,
            }),
          })),
        })),
      })),
    }

    mockSupabase.from.mockImplementation((table: string) => {
      switch (table) {
        case 'rextrix_users':
          return mockFromUsers as any
        case 'rextrix_contracts':
          return mockFromContracts as any
        default:
          return {} as any
      }
    })

    const request = createMockRequest('http://localhost:3000/api/contracts', {
      headers: {
        authorization: 'Bearer valid-token',
      },
    })

    const response = await GET(request)
    const responseData = await response.json()

    expect(response.status).toBe(500)
    expect(responseData.success).toBe(false)
    expect(responseData.error).toBe('契約一覧の取得に失敗しました')
  })
})

describe('POST /api/contracts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a new contract successfully', async () => {
    const requestData = {
      cfoId: '123e4567-e89b-12d3-a456-426614174000',
      companyId: '987fcdeb-51d4-43e2-b123-426614174001',
      contractType: 'regular',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-12-31T23:59:59Z',
      monthlyFee: 500000,
      workingDays: 20,
      description: 'Test contract description',
      terms: 'Test contract terms',
    }

    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'auth-user-123' } },
      error: null,
    } as any)

    const mockUserData = { id: 'user-123', user_type: 'company' }
    const mockCfoExists = { id: '123e4567-e89b-12d3-a456-426614174000' }
    const mockCompanyExists = { id: '987fcdeb-51d4-43e2-b123-426614174001' }
    const mockCreatedContract = {
      id: 'contract-456',
      ...requestData,
      status: 'draft',
      created_at: '2024-01-01T00:00:00Z',
    }

    // Mock database calls
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

    const mockFromCfos = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: mockCfoExists,
            error: null,
          }),
        })),
      })),
    }

    const mockFromCompanies = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: mockCompanyExists,
            error: null,
          }),
        })),
      })),
    }

    const mockFromContracts = {
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: mockCreatedContract,
            error: null,
          }),
        })),
      })),
    }

    mockSupabase.from.mockImplementation((table: string) => {
      switch (table) {
        case 'rextrix_users':
          return mockFromUsers as any
        case 'rextrix_cfos':
          return mockFromCfos as any
        case 'rextrix_companies':
          return mockFromCompanies as any
        case 'rextrix_contracts':
          return mockFromContracts as any
        default:
          return {} as any
      }
    })

    const request = createMockRequest('http://localhost:3000/api/contracts', {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
      body: requestData,
    })

    const response = await POST(request)
    const responseData = await response.json()

    // Debug: Log the actual response
    if (response.status !== 200) {
      console.log('Contract creation failed:', responseData)
    }

    expect(response.status).toBe(200)
    expect(responseData.success).toBe(true)
    expect(responseData.data.id).toBe('contract-456')
    expect(responseData.message).toBe('契約を作成しました')
  })

  it('should return 401 for unauthenticated request', async () => {
    const requestData = {
      cfoId: '123e4567-e89b-12d3-a456-426614174000',
      companyId: '987fcdeb-51d4-43e2-b123-426614174001',
      contractType: 'regular',
      startDate: '2024-01-01T00:00:00Z',
      monthlyFee: 500000,
    }

    const request = createMockRequest('http://localhost:3000/api/contracts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestData,
    })

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(401)
    expect(responseData.success).toBe(false)
    expect(responseData.error).toBe('認証が必要です')
  })

  it('should return 403 for non-company user', async () => {
    const requestData = {
      cfoId: '123e4567-e89b-12d3-a456-426614174000',
      companyId: '987fcdeb-51d4-43e2-b123-426614174001',
      contractType: 'regular',
      startDate: '2024-01-01T00:00:00Z',
      monthlyFee: 500000,
    }

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'auth-user-123' } },
      error: null,
    } as any)

    const mockFromUsers = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { id: 'user-123', user_type: 'cfo' },
            error: null,
          }),
        })),
      })),
    }

    mockSupabase.from.mockReturnValue(mockFromUsers as any)

    const request = createMockRequest('http://localhost:3000/api/contracts', {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
      body: requestData,
    })

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(403)
    expect(responseData.success).toBe(false)
    expect(responseData.error).toBe('契約の作成は企業ユーザーのみ可能です')
  })

  it('should return 400 for invalid data', async () => {
    const requestData = {
      cfoId: 'invalid-id',
      companyId: 'company-123',
      contractType: 'invalid-type',
      startDate: 'invalid-date',
      monthlyFee: -1000,
    }

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'auth-user-123' } },
      error: null,
    } as any)

    const request = createMockRequest('http://localhost:3000/api/contracts', {
      method: 'POST',
      headers: {
        authorization: 'Bearer valid-token',
        'Content-Type': 'application/json',
      },
      body: requestData,
    })

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(400)
    expect(responseData.success).toBe(false)
    expect(responseData.error).toBe('バリデーションエラー')
    expect(responseData.details).toBeDefined()
  })
})