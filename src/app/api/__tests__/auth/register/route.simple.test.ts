import { POST } from '@/app/api/auth/register/route'
// Removed utility imports that don't exist

// Setup test environment
// setupTestEnv()

// Mock Supabase
// const mockSupabase = createMockSupabaseClient()
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
    },
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
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

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return validation error for invalid email', async () => {
    const requestData = {
      email: 'invalid-email',
      password: '123',
      userType: 'invalid',
      displayName: '',
    }

    const request = createMockRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: requestData,
    })

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(400)
    expect(responseData.success).toBe(false)
    expect(responseData.error).toBe('バリデーションエラー')
  })

  it('should handle Supabase auth error', async () => {
    const requestData = {
      email: 'test@example.com',
      password: 'password123',
      userType: 'company',
      displayName: 'Test User',
      companyName: 'Test Corp',
    }

    // Mock auth signup error
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'User already registered' },
    })

    const request = createMockRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: requestData,
    })

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(400)
    expect(responseData.success).toBe(false)
    expect(responseData.error).toBe('このメールアドレスは既に登録されています')
  })

  it('should successfully register a company user', async () => {
    const requestData = {
      email: 'company@test.com',
      password: 'password123',
      userType: 'company',
      displayName: 'Test Company',
      companyName: 'Test Corp',
    }

    // Mock successful auth signup
    mockSupabase.auth.signUp.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'company@test.com',
          email_confirmed_at: null,
        },
        session: null,
      },
      error: null,
    })

    // Mock database operations
    const mockFromUsers = mockSupabase.from('rextrix_users')
    mockFromUsers.select().eq().single.mockResolvedValue({
      data: { id: 'rextrix-user-123' },
      error: null,
    })
    mockFromUsers.update().eq.mockResolvedValue({ error: null })

    const mockFromProfiles = mockSupabase.from('rextrix_user_profiles')
    mockFromProfiles.insert.mockResolvedValue({ error: null })

    const mockFromCompanies = mockSupabase.from('rextrix_companies')
    mockFromCompanies.insert().select().single.mockResolvedValue({
      data: { id: 'company-123' },
      error: null,
    })

    const request = createMockRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: requestData,
    })

    const response = await POST(request)
    const responseData = await response.json()

    expect(response.status).toBe(200)
    expect(responseData.success).toBe(true)
    expect(responseData.data.email).toBe('company@test.com')
    expect(responseData.data.userType).toBe('company')
  })
})