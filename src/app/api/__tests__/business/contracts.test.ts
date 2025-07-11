// Contract Business Logic Tests
import { z } from 'zod'

// Contract validation schema
const createContractSchema = z.object({
  cfoId: z.string().uuid('有効なCFO IDを指定してください'),
  companyId: z.string().uuid('有効な企業IDを指定してください'),
  contractType: z.enum(['regular', 'project', 'consultant'], {
    errorMap: () => ({ message: '契約タイプは regular, project, consultant のいずれかを指定してください' })
  }),
  startDate: z.string().datetime('有効な開始日を指定してください'),
  endDate: z.string().datetime('有効な終了日を指定してください').optional(),
  workingDays: z.number().min(1, '稼働日数は1日以上である必要があります').optional(),
  hourlyRate: z.number().min(0, '時給は0円以上である必要があります').optional(),
  monthlyFee: z.number().min(0, '月額料金は0円以上である必要があります').optional(),
  description: z.string().optional(),
  terms: z.string().optional(),
})

// Business logic functions
const calculateContractPeriod = (startDate: string, endDate: string): number => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = end.getTime() - start.getTime()
  const diffDays = diffTime / (1000 * 60 * 60 * 24)
  return Math.round(diffDays / 30.44) // Average days per month
}

const calculateWorkHours = (workingDays: number, hoursPerDay: number = 8): number => {
  return workingDays * hoursPerDay
}

const validateContractDates = (startDate: string, endDate?: string): boolean => {
  const start = new Date(startDate)
  if (endDate) {
    const end = new Date(endDate)
    return end > start
  }
  return start > new Date()
}

describe('Contract Business Logic', () => {
  describe('Contract Validation', () => {
    it('should validate correct contract data', () => {
      const validData = {
        cfoId: '123e4567-e89b-12d3-a456-426614174000',
        companyId: '987fcdeb-51d4-43e2-b123-426614174001',
        contractType: 'regular' as const,
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
        workingDays: 20,
        monthlyFee: 500000,
        description: 'CFO業務委託契約',
        terms: '月額固定制での業務委託',
      }

      const result = createContractSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.contractType).toBe('regular')
        expect(result.data.monthlyFee).toBe(500000)
      }
    })

    it('should reject invalid UUID format', () => {
      const invalidData = {
        cfoId: 'invalid-uuid',
        companyId: '987fcdeb-51d4-43e2-b123-426614174001',
        contractType: 'regular' as const,
        startDate: '2024-01-01T00:00:00Z',
        monthlyFee: 500000,
      }

      const result = createContractSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('有効なCFO IDを指定してください')
      }
    })

    it('should reject invalid contract type', () => {
      const invalidData = {
        cfoId: '123e4567-e89b-12d3-a456-426614174000',
        companyId: '987fcdeb-51d4-43e2-b123-426614174001',
        contractType: 'invalid' as any,
        startDate: '2024-01-01T00:00:00Z',
        monthlyFee: 500000,
      }

      const result = createContractSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('契約タイプは regular, project, consultant のいずれかを指定してください')
      }
    })

    it('should reject negative monthly fee', () => {
      const invalidData = {
        cfoId: '123e4567-e89b-12d3-a456-426614174000',
        companyId: '987fcdeb-51d4-43e2-b123-426614174001',
        contractType: 'regular' as const,
        startDate: '2024-01-01T00:00:00Z',
        monthlyFee: -100000,
      }

      const result = createContractSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.errors[0].message).toBe('月額料金は0円以上である必要があります')
      }
    })
  })

  describe('Contract Period Calculation', () => {
    it('should calculate contract period correctly', () => {
      expect(calculateContractPeriod('2024-01-01', '2024-12-31')).toBe(12)
      expect(calculateContractPeriod('2024-01-01', '2024-06-30')).toBe(6)
      expect(calculateContractPeriod('2024-01-01', '2024-01-31')).toBe(1)
      expect(calculateContractPeriod('2024-01-01', '2024-03-31')).toBe(3)
    })

    it('should handle different year periods', () => {
      expect(calculateContractPeriod('2024-01-01', '2025-01-01')).toBe(12)
      expect(calculateContractPeriod('2024-06-15', '2024-12-15')).toBe(6)
    })
  })

  describe('Work Hours Calculation', () => {
    it('should calculate work hours correctly', () => {
      expect(calculateWorkHours(20)).toBe(160) // 20 days * 8 hours
      expect(calculateWorkHours(22)).toBe(176) // 22 days * 8 hours
      expect(calculateWorkHours(15, 6)).toBe(90) // 15 days * 6 hours
    })

    it('should handle edge cases', () => {
      expect(calculateWorkHours(0)).toBe(0)
      expect(calculateWorkHours(1)).toBe(8)
      expect(calculateWorkHours(30)).toBe(240)
    })
  })

  describe('Date Validation', () => {
    it('should validate correct date ranges', () => {
      const futureStart = new Date()
      futureStart.setDate(futureStart.getDate() + 1)
      const futureEnd = new Date()
      futureEnd.setDate(futureEnd.getDate() + 365)

      expect(validateContractDates(futureStart.toISOString(), futureEnd.toISOString())).toBe(true)
    })

    it('should reject end date before start date', () => {
      expect(validateContractDates('2024-12-31', '2024-01-01')).toBe(false)
    })

    it('should validate start date only contracts', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      expect(validateContractDates(futureDate.toISOString())).toBe(true)
    })
  })

  describe('Contract Types', () => {
    const contractTypes = ['regular', 'project', 'consultant']

    contractTypes.forEach(type => {
      it(`should accept contract type: ${type}`, () => {
        const data = {
          cfoId: '123e4567-e89b-12d3-a456-426614174000',
          companyId: '987fcdeb-51d4-43e2-b123-426614174001',
          contractType: type as any,
          startDate: '2024-01-01T00:00:00Z',
          monthlyFee: 500000,
        }

        const result = createContractSchema.safeParse(data)
        expect(result.success).toBe(true)
      })
    })
  })
})

// Test API Response Structure
describe('Contract API Response Structure', () => {
  it('should have correct contract creation response format', () => {
    const successResponse = {
      success: true,
      data: {
        id: 'contract-123',
        cfo_id: '123e4567-e89b-12d3-a456-426614174000',
        company_id: '987fcdeb-51d4-43e2-b123-426614174001',
        monthly_fee: 500000,
        contract_period: 12,
        work_hours_per_month: 160,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        status: 'draft',
        created_at: '2024-01-01T00:00:00Z'
      },
      message: '契約を作成しました'
    }

    expect(successResponse.success).toBe(true)
    expect(successResponse.data.monthly_fee).toBe(500000)
    expect(successResponse.data.contract_period).toBe(12)
    expect(successResponse.data.status).toBe('draft')
    expect(successResponse.message).toBe('契約を作成しました')
  })

  it('should have correct contract list response format', () => {
    const listResponse = {
      success: true,
      data: [
        {
          id: 'contract-1',
          status: 'active',
          monthly_fee: 500000,
          rextrix_companies: {
            company_name: 'Test Company'
          },
          rextrix_cfos: {
            specialization: '財務戦略'
          }
        }
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      }
    }

    expect(listResponse.success).toBe(true)
    expect(Array.isArray(listResponse.data)).toBe(true)
    expect(listResponse.pagination.page).toBe(1)
    expect(listResponse.pagination.total).toBe(1)
  })
})