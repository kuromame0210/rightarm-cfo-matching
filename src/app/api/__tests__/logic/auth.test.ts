// Authentication Logic Tests
import { z } from 'zod'

// Test validation schemas
const registerSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上である必要があります'),
  userType: z.enum(['company', 'cfo'], {
    errorMap: () => ({ message: 'ユーザータイプは「企業」または「CFO」を選択してください' })
  }),
  displayName: z.string().min(1, '表示名は必須です'),
})

const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
})

describe('Authentication Validation Logic', () => {
  describe('Register Schema Validation', () => {
    it('should validate correct company registration data', () => {
      const validData = {
        email: 'company@test.com',
        password: 'password123',
        userType: 'company' as const,
        displayName: 'Test Company',
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('company@test.com')
        expect(result.data.userType).toBe('company')
      }
    })

    it('should validate correct CFO registration data', () => {
      const validData = {
        email: 'cfo@test.com',
        password: 'password123',
        userType: 'cfo' as const,
        displayName: 'Test CFO',
      }

      const result = registerSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('cfo@test.com')
        expect(result.data.userType).toBe('cfo')
      }
    })

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

  describe('Login Schema Validation', () => {
    it('should validate correct login data', () => {
      const validData = {
        email: 'user@test.com',
        password: 'password123',
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.email).toBe('user@test.com')
        expect(result.data.password).toBe('password123')
      }
    })

    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('有効なメールアドレスを入力してください')
      }
    })

    it('should reject empty password', () => {
      const invalidData = {
        email: 'user@test.com',
        password: '',
      }

      const result = loginSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('パスワードを入力してください')
      }
    })
  })
})

// Business Logic Tests
describe('Authentication Business Logic', () => {
  describe('Error Message Mapping', () => {
    it('should map Supabase auth errors to Japanese messages', () => {
      const mapAuthError = (error: string): string => {
        let errorMessage = 'ログインに失敗しました'
        if (error.includes('Invalid login credentials')) {
          errorMessage = 'メールアドレスまたはパスワードが間違っています'
        } else if (error.includes('Email not confirmed')) {
          errorMessage = 'メールアドレスの確認が完了していません'
        } else if (error.includes('Too many requests')) {
          errorMessage = 'ログイン試行回数が上限に達しました。しばらく後に再試行してください'
        }
        return errorMessage
      }

      expect(mapAuthError('Invalid login credentials')).toBe('メールアドレスまたはパスワードが間違っています')
      expect(mapAuthError('Email not confirmed')).toBe('メールアドレスの確認が完了していません')
      expect(mapAuthError('Too many requests')).toBe('ログイン試行回数が上限に達しました。しばらく後に再試行してください')
      expect(mapAuthError('Unknown error')).toBe('ログインに失敗しました')
    })
  })

  describe('Account Status Check', () => {
    it('should return correct status messages', () => {
      const getStatusMessage = (status: string): string => {
        switch (status) {
          case 'pending':
            return 'アカウントが承認待ちです'
          case 'suspended':
            return 'アカウントが停止されています'
          case 'inactive':
            return 'アカウントが無効化されています'
          default:
            return 'アカウントが無効です'
        }
      }

      expect(getStatusMessage('pending')).toBe('アカウントが承認待ちです')
      expect(getStatusMessage('suspended')).toBe('アカウントが停止されています')
      expect(getStatusMessage('inactive')).toBe('アカウントが無効化されています')
      expect(getStatusMessage('unknown')).toBe('アカウントが無効です')
    })
  })

  describe('Platform Fee Calculation', () => {
    it('should calculate platform fee correctly', () => {
      const calculatePlatformFee = (consultingFee: number, rate: number = 0.05): number => {
        return Math.floor(consultingFee * rate)
      }

      expect(calculatePlatformFee(1000000)).toBe(50000) // 100万円の5%
      expect(calculatePlatformFee(500000)).toBe(25000)  // 50万円の5%
      expect(calculatePlatformFee(1000000, 0.1)).toBe(100000) // 10%の場合
    })
  })

  describe('Contract Period Calculation', () => {
    it('should calculate contract period in months', () => {
      const calculateContractPeriod = (startDate: string, endDate: string): number => {
        const start = new Date(startDate)
        const end = new Date(endDate)
        const diffTime = end.getTime() - start.getTime()
        const diffDays = diffTime / (1000 * 60 * 60 * 24)
        return Math.round(diffDays / 30.44) // Average days per month
      }

      expect(calculateContractPeriod('2024-01-01', '2024-12-31')).toBe(12)
      expect(calculateContractPeriod('2024-01-01', '2024-06-30')).toBe(6)
      expect(calculateContractPeriod('2024-01-01', '2024-01-31')).toBe(1)
    })
  })
})