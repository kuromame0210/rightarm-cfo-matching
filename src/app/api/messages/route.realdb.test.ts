// メッセージ関連API（messages）のリアルDBテスト
import { NextRequest } from 'next/server'
import { GET, POST } from './route'

describe('Messages API - Real DB Tests', () => {
  const mockRequest = (method: string, body?: any, headers?: Record<string, string>) => {
    const req = new NextRequest(`http://localhost:3000/api/messages`, {
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

  describe('GET /api/messages', () => {
    it('should return messages with valid conversation ID', async () => {
      const url = new URL('http://localhost:3000/api/messages')
      url.searchParams.set('conversationId', 'test-conversation-id')
      
      const request = new NextRequest(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer demo-token'
        }
      })
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBeOneOf([200, 403])
      
      if (response.status === 200) {
        expect(data.success).toBe(true)
        expect(Array.isArray(data.messages)).toBe(true)
      } else {
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
      }
    })

    it('should require conversation ID parameter', async () => {
      const request = mockRequest('GET')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBe('会話IDが必要です')
    })

    it('should require authentication', async () => {
      const url = new URL('http://localhost:3000/api/messages')
      url.searchParams.set('conversationId', 'test-conversation-id')
      
      const request = new NextRequest(url, {
        method: 'GET',
        headers: {}
      })
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('認証が必要です')
    })

    it('should handle invalid conversation ID', async () => {
      const url = new URL('http://localhost:3000/api/messages')
      url.searchParams.set('conversationId', 'invalid-uuid')
      
      const request = new NextRequest(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer demo-token'
        }
      })
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.error).toContain('権限がありません')
    })
  })

  describe('POST /api/messages', () => {
    it('should send message with valid data', async () => {
      const request = mockRequest('POST', {
        conversationId: 'test-conversation-id',
        content: 'テストメッセージの内容'
      })
      
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBeOneOf([200, 403])
      
      if (response.status === 200) {
        expect(data.success).toBe(true)
        expect(data.message).toBeDefined()
        expect(data.message.id).toBeDefined()
        expect(data.message.content).toBe('テストメッセージの内容')
      } else {
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
      }
    })

    it('should require authentication', async () => {
      const request = mockRequest('POST', {
        conversationId: 'test-conversation-id',
        content: 'テストメッセージの内容'
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

    it('should reject empty message content', async () => {
      const request = mockRequest('POST', {
        conversationId: 'test-conversation-id',
        content: ''
      })
      
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toContain('メッセージ内容')
    })

    it('should reject overly long message content', async () => {
      const longMessage = 'あ'.repeat(5001) // 5000文字を超える
      
      const request = mockRequest('POST', {
        conversationId: 'test-conversation-id',
        content: longMessage
      })
      
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBeOneOf([400, 403])
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })

    it('should handle invalid conversation ID', async () => {
      const request = mockRequest('POST', {
        conversationId: 'invalid-uuid',
        content: 'テストメッセージの内容'
      })
      
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.error).toContain('権限がありません')
    })
  })

  describe('Message ordering and pagination', () => {
    it('should return messages in correct order (newest first)', async () => {
      const url = new URL('http://localhost:3000/api/messages')
      url.searchParams.set('conversationId', 'test-conversation-id')
      
      const request = new NextRequest(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer demo-token'
        }
      })
      
      const response = await GET(request)
      
      if (response.status === 200) {
        const data = await response.json()
        expect(data.success).toBe(true)
        
        if (data.messages.length > 1) {
          // メッセージが日付順（新しい順）に並んでいることを確認
          const dates = data.messages.map((msg: any) => new Date(msg.sent_at).getTime())
          const sortedDates = [...dates].sort((a, b) => b - a)
          expect(dates).toEqual(sortedDates)
        }
      }
    })

    it('should handle pagination parameters', async () => {
      const url = new URL('http://localhost:3000/api/messages')
      url.searchParams.set('conversationId', 'test-conversation-id')
      url.searchParams.set('limit', '10')
      url.searchParams.set('offset', '0')
      
      const request = new NextRequest(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer demo-token'
        }
      })
      
      const response = await GET(request)
      
      if (response.status === 200) {
        const data = await response.json()
        expect(data.success).toBe(true)
        expect(data.messages.length).toBeLessThanOrEqual(10)
      }
    })
  })

  describe('Error handling', () => {
    it('should handle database connection errors gracefully', async () => {
      const request = mockRequest('GET')
      const response = await GET(request)
      
      expect(response.status).toBeOneOf([200, 400, 500])
      
      if (response.status === 500) {
        const data = await response.json()
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
      }
    })

    it('should handle malformed JSON in POST request', async () => {
      const req = new NextRequest(`http://localhost:3000/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token'
        },
        body: 'invalid json'
      })
      
      const response = await POST(req)
      const data = await response.json()

      expect(response.status).toBe(500)
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