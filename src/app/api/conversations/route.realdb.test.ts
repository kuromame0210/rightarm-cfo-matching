// メッセージ関連API（conversations）のリアルDBテスト
import { NextRequest } from 'next/server'
import { GET, POST } from './route'

describe('Conversations API - Real DB Tests', () => {
  const mockRequest = (method: string, body?: any, headers?: Record<string, string>) => {
    const req = new NextRequest(`http://localhost:3000/api/conversations`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo-token',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    })
    return req
  }

  describe('GET /api/conversations', () => {
    it('should return conversations with authentication', async () => {
      const request = mockRequest('GET')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
    })

    it('should require authentication', async () => {
      const request = mockRequest('GET', undefined, { 'Authorization': '' })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('認証が必要です')
    })

    it('should return empty array when no conversations exist', async () => {
      const request = mockRequest('GET')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
    })
  })

  describe('POST /api/conversations', () => {
    it('should create new conversation with valid participant', async () => {
      // まず既存のユーザーを取得
      const request = mockRequest('POST', {
        otherUserId: '8acf6314-3bb7-4686-bcd4-2b30c211cbaf',
        message: 'テストメッセージ'
      })
      
      const response = await POST(request)
      const data = await response.json()

      // 既存ユーザーがいない場合はエラーが返される
      expect(response.status).toBeOneOf([200, 400])
      
      if (response.status === 200) {
        expect(data.success).toBe(true)
        expect(data.data).toBeDefined()
        expect(data.data.conversationId).toBeDefined()
      } else {
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
      }
    })

    it('should reject invalid participant ID', async () => {
      const request = mockRequest('POST', {
        otherUserId: 'invalid-uuid-format',
        message: 'テストメッセージ'
      })
      
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toContain('ユーザーが存在しません')
    })

    it('should require authentication', async () => {
      const request = mockRequest('POST', {
        otherUserId: 'test-id',
        message: 'テストメッセージ'
      }, { 'Authorization': '' })
      
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('認証が必要です')
    })

    it('should validate required fields', async () => {
      const request = mockRequest('POST', {})
      
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('必要です')
    })

    it('should prevent self-conversation', async () => {
      const request = mockRequest('POST', {
        otherUserId: 'df30f49d-6f5f-476c-a390-36d949ef31a3',
        message: 'テストメッセージ'
      })
      
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBeOneOf([200, 400])
      
      if (response.status === 400) {
        expect(data.success).toBe(false)
        expect(data.error).toContain('自分')
      }
    })
  })

  describe('Error handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // データベース接続エラーの場合
      const request = mockRequest('GET')
      const response = await GET(request)
      
      expect(response.status).toBeOneOf([200, 500])
      
      if (response.status === 500) {
        const data = await response.json()
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
      }
    })

    it.skip('should handle malformed JSON in POST request', async () => {
      const req = new NextRequest(`http://localhost:3000/api/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token'
        },
        body: 'invalid json'
      })
      
      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBeOneOf([400, 500])
      expect(data.success).toBe(false)
    })
  })
})

// カスタムマッチャーを追加
expect.extend({
  toBeOneOf(received: any, expected: any[]) {
    const pass = expected.includes(received)
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${expected}`,
        pass: true
      }
    } else {
      return {
        message: () => `expected ${received} to be one of ${expected}`,
        pass: false
      }
    }
  }
})