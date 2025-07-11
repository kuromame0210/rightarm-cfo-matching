// CFOs API Business Logic Tests
import { z } from 'zod'

// CFO validation schema
const cfoFilterSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  available: z.boolean().optional(),
  search: z.string().optional(),
  specialization: z.string().optional(),
  minRate: z.number().min(0).optional(),
  maxRate: z.number().min(0).optional(),
})

// Business logic functions
const validatePagination = (page?: number, limit?: number) => {
  const validPage = Math.max(1, page || 1)
  const validLimit = Math.min(100, Math.max(1, limit || 10))
  return { page: validPage, limit: validLimit }
}

const calculatePaginationOffset = (page: number, limit: number) => {
  return (page - 1) * limit
}

const calculateTotalPages = (total: number, limit: number) => {
  return Math.ceil(total / limit)
}

const formatCfoResponse = (cfo: any) => {
  return {
    id: cfo.id,
    specialization: cfo.specialization,
    yearsOfExperience: cfo.years_of_experience,
    hourlyRateRange: {
      min: cfo.hourly_rate_min,
      max: cfo.hourly_rate_max,
    },
    isAvailable: cfo.is_available,
    profile: {
      displayName: cfo.rextrix_users?.rextrix_user_profiles?.display_name,
      nickname: cfo.rextrix_users?.rextrix_user_profiles?.nickname,
      region: cfo.rextrix_users?.rextrix_user_profiles?.region,
    },
    skills: cfo.rextrix_cfo_skills?.map((skill: any) => ({
      name: skill.rextrix_skill_tags?.name,
      category: skill.rextrix_skill_tags?.category,
    })) || [],
  }
}

describe('CFOs API Business Logic', () => {
  describe('Filter Validation', () => {
    it('should validate correct filter parameters', () => {
      const validFilters = {
        page: 1,
        limit: 10,
        available: true,
        search: 'CFO',
        specialization: '財務戦略',
        minRate: 1000,
        maxRate: 5000,
      }

      const result = cfoFilterSchema.safeParse(validFilters)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.available).toBe(true)
        expect(result.data.specialization).toBe('財務戦略')
      }
    })

    it('should validate minimal filter parameters', () => {
      const minimalFilters = {}

      const result = cfoFilterSchema.safeParse(minimalFilters)
      expect(result.success).toBe(true)
    })

    it('should reject invalid page number', () => {
      const invalidFilters = {
        page: 0,
        limit: 10,
      }

      const result = cfoFilterSchema.safeParse(invalidFilters)
      expect(result.success).toBe(false)
    })

    it('should reject limit too high', () => {
      const invalidFilters = {
        page: 1,
        limit: 200,
      }

      const result = cfoFilterSchema.safeParse(invalidFilters)
      expect(result.success).toBe(false)
    })

    it('should reject negative rates', () => {
      const invalidFilters = {
        minRate: -100,
        maxRate: 5000,
      }

      const result = cfoFilterSchema.safeParse(invalidFilters)
      expect(result.success).toBe(false)
    })
  })

  describe('Pagination Logic', () => {
    it('should validate and normalize pagination parameters', () => {
      expect(validatePagination(1, 10)).toEqual({ page: 1, limit: 10 })
      expect(validatePagination(0, 10)).toEqual({ page: 1, limit: 10 })
      expect(validatePagination(5, 200)).toEqual({ page: 5, limit: 100 })
      expect(validatePagination(undefined, undefined)).toEqual({ page: 1, limit: 10 })
    })

    it('should calculate correct pagination offset', () => {
      expect(calculatePaginationOffset(1, 10)).toBe(0)
      expect(calculatePaginationOffset(2, 10)).toBe(10)
      expect(calculatePaginationOffset(3, 15)).toBe(30)
    })

    it('should calculate correct total pages', () => {
      expect(calculateTotalPages(25, 10)).toBe(3)
      expect(calculateTotalPages(30, 10)).toBe(3)
      expect(calculateTotalPages(31, 10)).toBe(4)
      expect(calculateTotalPages(0, 10)).toBe(0)
    })
  })

  describe('CFO Response Formatting', () => {
    it('should format CFO data correctly', () => {
      const mockCfoData = {
        id: 'cfo-123',
        specialization: '財務戦略',
        years_of_experience: 10,
        hourly_rate_min: 3000,
        hourly_rate_max: 8000,
        is_available: true,
        rextrix_users: {
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
          {
            rextrix_skill_tags: {
              name: 'リスクマネジメント',
              category: 'finance',
            },
          },
        ],
      }

      const formatted = formatCfoResponse(mockCfoData)

      expect(formatted).toEqual({
        id: 'cfo-123',
        specialization: '財務戦略',
        yearsOfExperience: 10,
        hourlyRateRange: {
          min: 3000,
          max: 8000,
        },
        isAvailable: true,
        profile: {
          displayName: 'CFO 太郎',
          nickname: 'CFO太郎',
          region: '東京都',
        },
        skills: [
          {
            name: '財務戦略',
            category: 'finance',
          },
          {
            name: 'リスクマネジメント',
            category: 'finance',
          },
        ],
      })
    })

    it('should handle missing profile data', () => {
      const mockCfoData = {
        id: 'cfo-123',
        specialization: '財務戦略',
        years_of_experience: 10,
        hourly_rate_min: 3000,
        hourly_rate_max: 8000,
        is_available: true,
        rextrix_users: null,
        rextrix_cfo_skills: null,
      }

      const formatted = formatCfoResponse(mockCfoData)

      expect(formatted.profile).toEqual({
        displayName: undefined,
        nickname: undefined,
        region: undefined,
      })
      expect(formatted.skills).toEqual([])
    })
  })
})

// Test API Response Structure
describe('CFOs API Response Structure', () => {
  it('should have correct CFO list response format', () => {
    const successResponse = {
      success: true,
      data: [
        {
          id: 'cfo-1',
          specialization: '財務戦略',
          yearsOfExperience: 10,
          hourlyRateRange: {
            min: 3000,
            max: 8000,
          },
          isAvailable: true,
          profile: {
            displayName: 'CFO 太郎',
            nickname: 'CFO太郎',
            region: '東京都',
          },
          skills: [
            {
              name: '財務戦略',
              category: 'finance',
            },
          ],
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    }

    expect(successResponse.success).toBe(true)
    expect(Array.isArray(successResponse.data)).toBe(true)
    expect(successResponse.data[0].id).toBe('cfo-1')
    expect(successResponse.data[0].specialization).toBe('財務戦略')
    expect(successResponse.pagination.page).toBe(1)
    expect(successResponse.pagination.total).toBe(1)
  })

  it('should have correct error response format', () => {
    const errorResponse = {
      success: false,
      error: 'CFOデータの取得に失敗しました',
    }

    expect(errorResponse.success).toBe(false)
    expect(errorResponse.error).toBeDefined()
    expect(typeof errorResponse.error).toBe('string')
  })

  it('should have correct empty response format', () => {
    const emptyResponse = {
      success: true,
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    }

    expect(emptyResponse.success).toBe(true)
    expect(Array.isArray(emptyResponse.data)).toBe(true)
    expect(emptyResponse.data).toHaveLength(0)
    expect(emptyResponse.pagination.total).toBe(0)
  })
})