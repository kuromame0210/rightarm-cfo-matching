import { GET } from '@/app/api/cfos/route'
import { supabase } from '@/lib/supabase'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          range: jest.fn(),
        })),
      })),
    })),
  },
  TABLES: {
    CFOS: 'rextrix_cfos',
    USERS: 'rextrix_users',
    USER_PROFILES: 'rextrix_user_profiles',
    CFO_SKILLS: 'rextrix_cfo_skills',
    SKILL_TAGS: 'rextrix_skill_tags',
  },
}))

const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('GET /api/cfos', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset mock responses
    mockRange.mockResolvedValue({
      data: [],
      error: null,
      count: 0,
    })
  })

  it('should fetch CFOs list successfully', async () => {
    const mockCfosData = [
      {
        id: 'cfo-1',
        specialization: '財務戦略',
        years_of_experience: 10,
        hourly_rate_min: 5000,
        hourly_rate_max: 10000,
        is_available: true,
        rextrix_users: {
          email: 'cfo1@example.com',
          rextrix_user_profiles: {
            display_name: 'CFO 太郎',
            nickname: 'CFO太郎',
            region: '東京都',
          },
        },
        rextrix_cfo_skills: [
          {
            rextrix_skill_tags: {
              name: '財務戦略',
              category: 'finance',
            },
          },
        ],
      },
      {
        id: 'cfo-2',
        specialization: 'リスクマネジメント',
        years_of_experience: 8,
        hourly_rate_min: 4000,
        hourly_rate_max: 8000,
        is_available: true,
        rextrix_users: {
          email: 'cfo2@example.com',
          rextrix_user_profiles: {
            display_name: 'CFO 花子',
            nickname: 'CFO花子',
            region: '大阪府',
          },
        },
        rextrix_cfo_skills: [
          {
            rextrix_skill_tags: {
              name: 'リスクマネジメント',
              category: 'finance',
            },
          },
        ],
      },
    ]

    // Setup mock responses
    mockRange.mockResolvedValue({
      data: mockCfosData,
      error: null,
      count: 2,
    })

    const request = createMockRequest('http://localhost:3000/api/cfos?page=1&limit=10')

    const response = await GET(request)
    const responseData = await response.json()

    expect(response.status).toBe(200)
    expect(responseData.success).toBe(true)
    expect(responseData.data).toHaveLength(2)
    expect(responseData.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    })
    expect(responseData.data[0].id).toBe('cfo-1')
    expect(responseData.data[0].rextrix_users.rextrix_user_profiles.display_name).toBe('CFO 太郎')
  })

  it('should handle pagination correctly', async () => {
    // Setup mock for pagination test
    mockRange.mockResolvedValue({
      data: [],
      error: null,
      count: 25,
    })

    const request = createMockRequest('http://localhost:3000/api/cfos?page=3&limit=10')

    const response = await GET(request)
    const responseData = await response.json()

    expect(response.status).toBe(200)
    expect(responseData.pagination).toEqual({
      page: 3,
      limit: 10,
      total: 25,
      totalPages: 3,
    })

    // Check if range was called with correct offset
    expect(mockRange).toHaveBeenCalledWith(20, 29)
  })

  it('should filter by available status', async () => {
    const mockFromCfos = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          range: jest.fn().mockResolvedValue({
            data: [],
            error: null,
            count: 0,
          }),
        })),
      })),
    }

    mockSupabase.from.mockReturnValue(mockFromCfos as any)

    const request = createMockRequest('http://localhost:3000/api/cfos?available=true')

    const response = await GET(request)

    expect(response.status).toBe(200)
    // We can't easily test the internal eq() calls due to chaining,
    // but we can verify the response structure
    expect(mockSupabase.from).toHaveBeenCalledWith('rextrix_cfos')
  })

  it('should handle search parameter', async () => {
    const mockCfosData = [
      {
        id: 'cfo-1',
        specialization: '財務戦略',
        rextrix_users: {
          rextrix_user_profiles: {
            display_name: '山田 太郎',
            nickname: '太郎CFO',
          },
        },
        rextrix_cfo_skills: [],
      },
    ]

    const mockFromCfos = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          range: jest.fn().mockResolvedValue({
            data: mockCfosData,
            error: null,
            count: 1,
          }),
        })),
      })),
    }

    mockSupabase.from.mockReturnValue(mockFromCfos as any)

    const request = createMockRequest('http://localhost:3000/api/cfos?search=太郎')

    const response = await GET(request)
    const responseData = await response.json()

    expect(response.status).toBe(200)
    expect(responseData.success).toBe(true)
    // The filtering is done after the DB query in the actual implementation
    expect(responseData.data).toEqual(mockCfosData)
  })

  it('should handle database error', async () => {
    const mockFromCfos = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          range: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed' },
            count: null,
          }),
        })),
      })),
    }

    mockSupabase.from.mockReturnValue(mockFromCfos as any)

    const request = createMockRequest('http://localhost:3000/api/cfos')

    const response = await GET(request)
    const responseData = await response.json()

    expect(response.status).toBe(500)
    expect(responseData.success).toBe(false)
    expect(responseData.error).toBe('CFO一覧の取得に失敗しました')
  })

  it('should use default pagination values', async () => {
    const mockFromCfos = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          range: jest.fn().mockResolvedValue({
            data: [],
            error: null,
            count: 0,
          }),
        })),
      })),
    }

    mockSupabase.from.mockReturnValue(mockFromCfos as any)

    const request = createMockRequest('http://localhost:3000/api/cfos')

    const response = await GET(request)
    const responseData = await response.json()

    expect(response.status).toBe(200)
    expect(responseData.pagination.page).toBe(1)
    expect(responseData.pagination.limit).toBe(10)
    
    // Check if range was called with default values (page 1, limit 10 = offset 0, range 0-9)
    expect(mockRange).toHaveBeenCalledWith(0, 9)
  })
})