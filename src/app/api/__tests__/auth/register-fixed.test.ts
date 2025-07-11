import { POST } from '@/app/api/auth/register/route'

// Mock all dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
    },
  },
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

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-123',
  },
})

import { supabase, supabaseAdmin } from '@/lib/supabase'

const mockSupabase = supabase as jest.Mocked<typeof supabase>
const mockSupabaseAdmin = supabaseAdmin as jest.Mocked<typeof supabaseAdmin>

function createMockRequest(url: string, options: { method: string; body: any; headers: Record<string, string> }) {
  return new Request(url, {
    method: options.method,
    body: JSON.stringify(options.body),
    headers: options.headers,
  })
}

describe('POST /api/auth/register - Fixed Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should register a CFO user successfully', async () => {
    const requestData = {
      email: 'test@cfo.com',
      password: 'password123',
      userType: 'cfo',
      displayName: 'Test CFO',
      nickname: 'TestCFO',
      skills: {
        finance: ['財務戦略'],
      },
      experience: '10年以上の財務経験',
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

    // Mock supabaseAdmin.from calls
    let fromCallCount = 0
    mockSupabaseAdmin.from.mockImplementation((table: string) => {
      fromCallCount++
      
      if (table === 'rextrix_users' && fromCallCount === 1) {
        // First call - check existing user
        return {
          select: () => ({
            eq: () => ({
              single: jest.fn().mockResolvedValue({
                data: null, // No existing user
                error: null,
              }),
            }),
          }),
        } as any
      }
      
      if (table === 'auth.users') {
        // Auth user existence check
        return {
          select: () => ({
            eq: () => ({
              single: jest.fn().mockResolvedValue({
                data: { id: 'user-456' },
                error: null,
              }),
            }),
          }),
        } as any
      }
      
      if (table === 'rextrix_users' && fromCallCount > 1) {
        if (fromCallCount === 2) {
          // User creation
          return {
            insert: () => ({
              select: () => ({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'rextrix-user-456',
                    supabase_auth_id: 'user-456',
                    email: 'test@cfo.com',
                    user_type: 'cfo',
                  },
                  error: null,
                }),
              }),
            }),
          } as any
        } else {
          // Final user data fetch
          return {
            select: () => ({
              eq: () => ({
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'rextrix-user-456',
                    email: 'test@cfo.com',
                    user_type: 'cfo',
                    status: 'active',
                    rextrix_user_profiles: {
                      display_name: 'Test CFO',
                      nickname: 'TestCFO',
                    },
                  },
                  error: null,
                }),
              }),
            }),
          } as any
        }
      }
      
      if (table === 'rextrix_user_profiles') {
        // Profile creation
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
        } as any
      }
      
      if (table === 'rextrix_cfos') {
        // CFO creation
        return {
          insert: () => ({
            select: () => ({
              single: jest.fn().mockResolvedValue({
                data: { id: 'cfo-456' },
                error: null,
              }),
            }),
          }),
        } as any
      }
      
      if (table === 'rextrix_skill_tags') {
        // Skill tags fetch
        return {
          select: () => ({
            in: jest.fn().mockResolvedValue({
              data: [{ id: 'skill-1', name: '財務戦略' }],
              error: null,
            }),
          }),
        } as any
      }
      
      if (table === 'rextrix_cfo_skills') {
        // CFO skills creation
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
        } as any
      }
      
      // Default fallback
      return {
        select: () => ({}),
        insert: () => ({}),
        update: () => ({}),
      } as any
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

    console.log('Response status:', response.status)
    console.log('Response data:', responseData)

    expect(response.status).toBe(200)
    expect(responseData.success).toBe(true)
    expect(responseData.message).toContain('ユーザー登録が完了しました')
  })

  it('should return validation error for invalid data', async () => {
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