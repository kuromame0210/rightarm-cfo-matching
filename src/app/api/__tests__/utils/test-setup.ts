// API Test Setup Utilities
import { NextRequest } from 'next/server'

// Mock Supabase client for API tests
export const createMockSupabaseClient = () => ({
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        range: jest.fn(),
        order: jest.fn(() => ({
          range: jest.fn(),
        })),
      })),
      in: jest.fn(),
      like: jest.fn(),
      or: jest.fn(),
      gte: jest.fn(),
      lte: jest.fn(),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(),
    })),
  })),
})

// Create mock NextRequest
export const createMockRequest = (
  url: string, 
  options: {
    method?: string
    headers?: Record<string, string>
    body?: any
  } = {}
) => {
  const { method = 'GET', headers = {}, body } = options
  
  // Create a basic request object that works with our tests
  const request = {
    url,
    method,
    headers: {
      get: (name: string) => headers[name.toLowerCase()] || null,
    },
    json: async () => body,
  }
  
  return request as any as NextRequest
}

// Mock environment variables for tests
export const setupTestEnv = () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
  process.env.NEXTAUTH_SECRET = 'test-secret'
}

// Helper function to extract missing references
export const createMockRange = () => jest.fn().mockResolvedValue({
  data: [],
  error: null,
  count: 0,
})

// Helper for API tests
export const mockRange = createMockRange()