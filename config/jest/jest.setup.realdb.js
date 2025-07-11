// Real Database Test Setup for Production Supabase
import { TextEncoder, TextDecoder } from 'util'
import dotenv from 'dotenv'

// Load production environment variables
dotenv.config({ path: '.env.test' })

// Polyfill for Node.js environment
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock Next.js server APIs for Node.js environment
global.Headers = class Headers extends Map {
  constructor(init) {
    super()
    if (init) {
      Object.entries(init).forEach(([key, value]) => {
        this.set(key, value)
      })
    }
  }
  
  get(name) {
    return super.get(name.toLowerCase()) || null
  }
  
  set(name, value) {
    return super.set(name.toLowerCase(), value)
  }
}

global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body
    this.status = init.status || 200
    this.statusText = init.statusText || 'OK'
    this.headers = new Headers(init.headers)
  }
  
  static json(data, init = {}) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers
      }
    })
  }
  
  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body
  }
  
  async text() {
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body)
  }
}

global.URL = global.URL || require('url').URL
global.URLSearchParams = global.URLSearchParams || require('url').URLSearchParams

// Real Request Helper (no mocking)
global.createRealRequest = (url, options = {}) => {
  const parsedUrl = new URL(url)
  return {
    url,
    method: options.method || 'GET',
    headers: new Headers(options.headers || {}),
    nextUrl: {
      searchParams: parsedUrl.searchParams,
      pathname: parsedUrl.pathname,
      href: url
    },
    json: async () => options.body || {},
    text: async () => JSON.stringify(options.body || {}),
    formData: async () => new FormData(),
    cookies: {
      get: () => null,
      set: () => {},
      delete: () => {}
    }
  }
}

// Database Test Utilities
global.DatabaseTestUtils = {
  // Clean up test data
  async cleanupTestData(supabase, tables = []) {
    for (const table of tables) {
      // Delete test data (avoid deleting production data)
      await supabase.from(table).delete().like('email', '%test.com')
    }
  },
  
  // Create test user
  async createTestUser(supabase, userData) {
    const testEmail = `test-${Date.now()}@test.com`
    return await supabase.from('rextrix_users').insert({
      email: testEmail,
      user_type: userData.user_type || 'company',
      status: 'active',
      ...userData
    }).select().single()
  },
  
  // Verify database connection
  async verifyConnection(supabase) {
    try {
      const { data, error } = await supabase.from('rextrix_users').select('count').limit(1)
      return !error
    } catch (e) {
      return false
    }
  }
}

// Console logging for test environment
console.log('🗄️  Real Database Test Environment Initialized')
console.log('📊  Using Production Supabase:', process.env.NEXT_PUBLIC_SUPABASE_URL)