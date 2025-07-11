import { POST } from '@/app/api/auth/register/route'
import { supabase, supabaseAdmin } from '@/lib/supabase'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
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
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
        in: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}))

// Mock constants
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

const mockSupabase = supabase as jest.Mocked<typeof supabase>
const mockSupabaseAdmin = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>

// Helper function to create mock request
function createMockRequest(url: string, options: { method: string; body: any; headers: Record<string, string> }) {
  return new Request(url, {
    method: options.method,
    body: JSON.stringify(options.body),
    headers: options.headers,
  })
}

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should register a new company user successfully', async () => {
    const requestData = {
      email: 'test@company.com',
      password: 'password123',
      userType: 'company',
      displayName: 'Test Company',
      companyName: 'Test Corp',
      businessName: 'Test Business',
      description: 'Test description',
      revenueRange: 'under_100m',
      challengeTags: ['資金調達'],
    }

    // Mock successful auth signup
    mockSupabase.auth.signUp.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@company.com',
          email_confirmed_at: null,
        },
        session: null,
      },
      error: null,
    } as any)

    // Mock existing user check (no user found)
    const mockExistingUserCheck = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: null, // No existing user
            error: null,
          }),
        })),
      })),
    }

    // Mock auth.users table check for retries
    const mockAuthUsersCheck = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { id: 'user-123' },
            error: null,
          }),
        })),
      })),
    }

    // Mock user record creation
    const mockFromUsers = {
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { 
              id: 'rextrix-user-123',
              supabase_auth_id: 'user-123',
              email: 'test@company.com',
              user_type: 'company'
            },
            error: null,
          }),
        })),
      })),
    }

    const mockFromProfiles = {
      insert: jest.fn().mockResolvedValue({ error: null }),
    }

    const mockFromCompanies = {
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { id: 'company-123' },
            error: null,
          }),
        })),
      })),
    }

    const mockFromChallengeTags = {
      select: jest.fn(() => ({
        in: jest.fn().mockResolvedValue({
          data: [{ id: 'tag-1', name: '資金調達' }],
          error: null,
        }),
      })),
    }

    const mockFromCompanyChallenges = {
      insert: jest.fn().mockResolvedValue({ error: null }),
    }

    // Mock final user data fetch with profiles
    const mockUserDataFetch = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'rextrix-user-123',
              email: 'test@company.com',
              user_type: 'company',
              status: 'active',
              rextrix_user_profiles: {
                display_name: 'Test Company'
              }
            },
            error: null,
          }),
        })),
      })),
    }

    let callCount = 0
    mockSupabaseAdmin.from.mockImplementation((table: string) => {
      switch (table) {
        case 'rextrix_users':
          callCount++
          if (callCount === 1) {
            return mockExistingUserCheck as any // First call - existing user check
          } else if (callCount === 2) {
            return mockFromUsers as any // Second call - user creation
          } else {
            return mockUserDataFetch as any // Final call - user data fetch
          }
        case 'auth.users':
          return mockAuthUsersCheck as any
        case 'rextrix_user_profiles':
          return mockFromProfiles as any
        case 'rextrix_companies':
          return mockFromCompanies as any
        case 'rextrix_challenge_tags':
          return mockFromChallengeTags as any
        case 'rextrix_company_challenges':
          return mockFromCompanyChallenges as any
        default:
          return {} as any
      }
    })

    const request = createMockRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: requestData,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(200)
    expect(responseData.success).toBe(true)
    expect(responseData.data.email).toBe('test@company.com')
    expect(responseData.data.userType).toBe('company')
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'test@company.com',
      password: 'password123',
      options: {
        data: {
          user_type: 'company',
          display_name: 'Test Company',
        },
      },
    })
  })

  it('should register a new CFO user successfully', async () => {
    const requestData = {
      email: 'test@cfo.com',
      password: 'password123',
      userType: 'cfo',
      displayName: 'Test CFO',
      nickname: 'TestCFO',
      skills: {
        finance: ['財務戦略', 'リスクマネジメント'],
        accounting: ['税務対応'],
      },
      experience: '10年以上の財務経験',
      workPreference: 'remote',
      compensationRange: '500-1000万円',
    }

    // Mock successful auth signup
    mockSupabase.auth.signUp.mockResolvedValue({
      data: {
        user: {
          id: 'user-456',
          email: 'test@cfo.com',
          email_confirmed_at: null,
        },
        session: null,
      },
      error: null,
    } as any)

    // Mock user record fetch
    const mockFromUsers = {
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { id: 'rightarm-user-456' },
            error: null,
          }),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ error: null }),
      })),
    }

    const mockFromProfiles = {
      insert: jest.fn().mockResolvedValue({ error: null }),
    }

    const mockFromCfos = {
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn().mockResolvedValue({
            data: { id: 'cfo-456' },
            error: null,
          }),
        })),
      })),
    }

    const mockFromSkillTags = {
      select: jest.fn(() => ({
        in: jest.fn().mockResolvedValue({
          data: [
            { id: 'skill-1', name: '財務戦略' },
            { id: 'skill-2', name: 'リスクマネジメント' },
            { id: 'skill-3', name: '税務対応' },
          ],
          error: null,
        }),
      })),
    }

    const mockFromCfoSkills = {
      insert: jest.fn().mockResolvedValue({ error: null }),
    }

    mockSupabase.from.mockImplementation((table: string) => {
      switch (table) {
        case 'rextrix_users':
          return mockFromUsers as any
        case 'rextrix_user_profiles':
          return mockFromProfiles as any
        case 'rextrix_cfos':
          return mockFromCfos as any
        case 'rextrix_skill_tags':
          return mockFromSkillTags as any
        case 'rextrix_cfo_skills':
          return mockFromCfoSkills as any
        default:
          return {} as any
      }
    })

    const request = createMockRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: requestData,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(200)
    expect(responseData.success).toBe(true)
    expect(responseData.data.email).toBe('test@cfo.com')
    expect(responseData.data.userType).toBe('cfo')
  })

  it('should return 400 when email already exists', async () => {
    const requestData = {
      email: 'existing@user.com',
      password: 'password123',
      userType: 'company',
      displayName: 'Test User',
      companyName: 'Test Corp',
    }

    // Mock auth signup error
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'User already registered' },
    } as any)

    const request = createMockRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: requestData,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(400)
    expect(responseData.success).toBe(false)
    expect(responseData.error).toBe('このメールアドレスは既に登録されています')
  })

  it('should return 400 for invalid data', async () => {
    const requestData = {
      email: 'invalid-email',
      password: '123', // Too short
      userType: 'invalid',
      displayName: '',
    }

    const request = createMockRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: requestData,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(400)
    expect(responseData.success).toBe(false)
    expect(responseData.error).toBe('バリデーションエラー')
    expect(responseData.details).toBeDefined()
  })
})