// API Test Setup for Node.js environment
import { TextEncoder, TextDecoder } from 'util'

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

// Create mock request helper instead of trying to mock NextRequest
global.createMockRequest = (url, options = {}) => {
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
    json: jest.fn().mockResolvedValue(options.body || {}),
    text: jest.fn().mockResolvedValue(JSON.stringify(options.body || {})),
    formData: jest.fn().mockResolvedValue(new FormData()),
    cookies: {
      get: jest.fn().mockReturnValue(null),
      set: jest.fn(),
      delete: jest.fn()
    }
  }
}

// Mock NextResponse helper
global.createMockResponse = {
  json: (data, init = {}) => ({
    json: () => Promise.resolve(data),
    status: init.status || 200,
    headers: new Headers(init.headers || {})
  })
}

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
}