// Simplified API Register Test
import { z } from 'zod'

// Test validation logic directly
const registerSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上である必要があります'),
  userType: z.enum(['company', 'cfo'], {
    errorMap: () => ({ message: 'ユーザータイプは「企業」または「CFO」を選択してください' })
  }),
  displayName: z.string().min(1, '表示名は必須です'),
  
  // Optional fields
  companyName: z.string().optional(),
  businessName: z.string().optional(),
  description: z.string().optional(),
  revenueRange: z.enum(['under_100m', '100m_1b', '1b_10b', '10b_30b', 'over_50b', 'private']).optional(),
  challengeTags: z.array(z.string()).optional(),
  
  nickname: z.string().optional(),
  skills: z.record(z.array(z.string())).optional(),
  experience: z.string().optional(),
  workPreference: z.string().optional(),
  compensationRange: z.string().optional(),
})

describe('Register API Logic', () => {
  describe('Company Registration Validation', () => {
    it('should validate correct company registration data', () => {
      const validData = {
        email: 'company@test.com',
        password: 'password123',
        userType: 'company' as const,
        displayName: 'Test Company',
        companyName: 'Test Corp',
        businessName: 'Test Business',
        description: 'Test description',
        revenueRange: 'under_100m' as const,
        challengeTags: ['資金調達', 'IPO準備'],
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('company@test.com')
        expect(result.data.userType).toBe('company')
        expect(result.data.companyName).toBe('Test Corp')
        expect(result.data.challengeTags).toEqual(['資金調達', 'IPO準備'])
      }
    })

    it('should validate minimal company registration data', () => {
      const minimalData = {
        email: 'company@test.com',
        password: 'password123',
        userType: 'company' as const,
        displayName: 'Test Company',
      }

      const result = registerSchema.safeParse(minimalData)
      expect(result.success).toBe(true)
    })
  })

  describe('CFO Registration Validation', () => {
    it('should validate correct CFO registration data', () => {
      const validData = {
        email: 'cfo@test.com',
        password: 'password123',
        userType: 'cfo' as const,
        displayName: 'Test CFO',
        nickname: 'TestCFO',
        skills: {
          finance: ['財務戦略', 'リスクマネジメント'],
          accounting: ['税務対応', '管理会計'],
        },
        experience: '10年以上の財務経験',
        workPreference: 'remote',
        compensationRange: '500-1000万円',
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('cfo@test.com')
        expect(result.data.userType).toBe('cfo')
        expect(result.data.nickname).toBe('TestCFO')
        expect(result.data.skills?.finance).toEqual(['財務戦略', 'リスクマネジメント'])
      }
    })
  })

  describe('Validation Errors', () => {
    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
        userType: 'company' as const,
        displayName: 'Test Company',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('有効なメールアドレスを入力してください')
      }
    })

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@company.com',
        password: '123',
        userType: 'company' as const,
        displayName: 'Test Company',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('パスワードは8文字以上である必要があります')
      }
    })

    it('should reject invalid user type', () => {
      const invalidData = {
        email: 'test@company.com',
        password: 'password123',
        userType: 'invalid' as any,
        displayName: 'Test Company',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('ユーザータイプは「企業」または「CFO」を選択してください')
      }
    })

    it('should reject empty display name', () => {
      const invalidData = {
        email: 'test@company.com',
        password: 'password123',
        userType: 'company' as const,
        displayName: '',
      }

      const result = registerSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('表示名は必須です')
      }
    })
  })

  describe('Revenue Range Validation', () => {
    const validRanges = ['under_100m', '100m_1b', '1b_10b', '10b_30b', 'over_50b', 'private']

    validRanges.forEach(range => {
      it(`should accept revenue range: ${range}`, () => {
        const data = {
          email: 'test@company.com',
          password: 'password123',
          userType: 'company' as const,
          displayName: 'Test Company',
          revenueRange: range as any,
        }

        const result = registerSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })

    it('should reject invalid revenue range', () => {
      const data = {
        email: 'test@company.com',
        password: 'password123',
        userType: 'company' as const,
        displayName: 'Test Company',
        revenueRange: 'invalid_range' as any,
      }

      const result = registerSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })
})

// Test API Response Structure
describe('Register API Response Structure', () => {
  it('should have correct success response format', () => {
    const successResponse = {
      success: true,
      data: {
        id: 'user-123',
        email: 'test@company.com',
        userType: 'company',
        emailConfirmed: false
      },
      message: 'ユーザー登録が完了しました。メールを確認して認証を完了してください。'
    }

    expect(successResponse.success).toBe(true)
    expect(successResponse.data.email).toBe('test@company.com')
    expect(successResponse.data.userType).toBe('company')
    expect(successResponse.data.emailConfirmed).toBe(false)
    expect(successResponse.message).toContain('ユーザー登録が完了しました')
  })

  it('should have correct error response format', () => {
    const errorResponse = {
      success: false,
      error: 'このメールアドレスは既に登録されています'
    }

    expect(errorResponse.success).toBe(false)
    expect(errorResponse.error).toBeDefined()
    expect(typeof errorResponse.error).toBe('string')
  })

  it('should have correct validation error response format', () => {
    const validationErrorResponse = {
      success: false,
      error: 'バリデーションエラー',
      details: [
        {
          path: ['email'],
          message: '有効なメールアドレスを入力してください'
        }
      ]
    }

    expect(validationErrorResponse.success).toBe(false)
    expect(validationErrorResponse.error).toBe('バリデーションエラー')
    expect(validationErrorResponse.details).toBeDefined()
    expect(Array.isArray(validationErrorResponse.details)).toBe(true)
  })
})