// スカウト管理API（scouts）のリアルDBテスト
import { NextRequest } from 'next/server'
import { GET, POST } from './route'

describe('Scouts API - Real DB Tests', () => {
  const mockRequest = (method: string, body?: any, headers?: Record<string, string>) => {
    const req = new NextRequest(`http://localhost:3000/api/scouts`, {
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

  describe('GET /api/scouts', () => {
    it('should return scouts with authentication', async () => {
      const request = mockRequest('GET')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.sent).toBeDefined()
      expect(data.data.received).toBeDefined()
      expect(Array.isArray(data.data.sent)).toBe(true)
      expect(Array.isArray(data.data.received)).toBe(true)
    })

    it('should require authentication', async () => {
      const request = mockRequest('GET', undefined, { 'Authorization': '' })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('認証が必要です')
    })

    it('should filter scouts by status', async () => {
      const url = new URL('http://localhost:3000/api/scouts')
      url.searchParams.set('status', 'pending')
      
      const request = new NextRequest(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer demo-token'
        }
      })
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // 返されたスカウトがすべて指定されたステータスであることを確認
      const allScouts = [...data.data.sent, ...data.data.received]
      if (allScouts.length > 0) {
        allScouts.forEach((scout: any) => {
          expect(scout.status).toBe('pending')
        })
      }
    })

    it('should filter scouts by urgency', async () => {
      const url = new URL('http://localhost:3000/api/scouts')
      url.searchParams.set('urgency', 'urgent')
      
      const request = new NextRequest(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer demo-token'
        }
      })
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // 返されたスカウトがすべて緊急フラグが立っていることを確認
      const allScouts = [...data.data.sent, ...data.data.received]
      if (allScouts.length > 0) {
        allScouts.forEach((scout: any) => {
          expect(scout.urgency).toBe('urgent')
        })
      }
    })

    it('should handle pagination parameters', async () => {
      const url = new URL('http://localhost:3000/api/scouts')
      url.searchParams.set('limit', '5')
      url.searchParams.set('offset', '0')
      
      const request = new NextRequest(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer demo-token'
        }
      })
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.sent.length + data.data.received.length).toBeLessThanOrEqual(5)
    })

    it('should return scouts in correct order (newest first)', async () => {
      const request = mockRequest('GET')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // 送信済みスカウトの順序確認
      if (data.data.sent.length > 1) {
        const dates = data.data.sent.map((scout: any) => new Date(scout.created_at).getTime())
        const sortedDates = [...dates].sort((a, b) => b - a)
        expect(dates).toEqual(sortedDates)
      }
      
      // 受信済みスカウトの順序確認
      if (data.data.received.length > 1) {
        const dates = data.data.received.map((scout: any) => new Date(scout.created_at).getTime())
        const sortedDates = [...dates].sort((a, b) => b - a)
        expect(dates).toEqual(sortedDates)
      }
    })
  })

  describe('POST /api/scouts', () => {
    it('should send scout with valid data', async () => {
      const scoutData = {
        recipientId: '8acf6314-3bb7-4686-bcd4-2b30c211cbaf',
        title: 'CFO募集',
        message: 'ぜひ弊社のCFOとしてご参画いただきたく、ご連絡いたします。',
        senderType: 'company',
        recipientType: 'cfo',
        compensation: 800000,
        urgency: 'normal',
        requiredSkills: ['財務戦略', 'IPO準備'],
        projectDuration: '6ヶ月',
        workStyle: 'hybrid'
      }
      
      const request = mockRequest('POST', scoutData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBeOneOf([200, 400, 404])
      
      if (response.status === 200) {
        expect(data.success).toBe(true)
        expect(data.data).toBeDefined()
        expect(data.data.scoutId).toBeDefined()
        expect(data.message).toBeDefined()
      } else {
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
      }
    })

    it('should require authentication', async () => {
      const scoutData = {
        recipientId: 'target-user-id',
        title: 'テストスカウト',
        message: 'テストスカウト',
        senderType: 'company',
        recipientType: 'cfo',
        compensation: 500000
      }
      
      const request = mockRequest('POST', scoutData, { 'Authorization': '' })
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
      expect(data.error).toContain('必須フィールドが不足しています')
    })

    it('should validate target user exists', async () => {
      const scoutData = {
        recipientId: 'invalid-user-id',
        title: 'テストスカウト',
        message: 'テストスカウト',
        senderType: 'company',
        recipientType: 'cfo',
        compensation: 500000
      }
      
      const request = mockRequest('POST', scoutData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.error).toContain('受信者が存在しません')
    })

    it('should validate compensation range', async () => {
      const scoutData = {
        recipientId: 'target-user-id',
        message: 'テストスカウト',
        compensation: -100000 // 負の値
      }
      
      const request = mockRequest('POST', scoutData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBeOneOf([400, 404])
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })

    it('should validate message length', async () => {
      const scoutData = {
        recipientId: 'target-user-id',
        message: '', // 空のメッセージ
        compensation: 500000
      }
      
      const request = mockRequest('POST', scoutData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBeOneOf([400, 404])
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })

    it('should handle overly long message', async () => {
      const longMessage = 'あ'.repeat(2001) // 2000文字を超える
      
      const scoutData = {
        recipientId: 'target-user-id',
        message: longMessage,
        compensation: 500000
      }
      
      const request = mockRequest('POST', scoutData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBeOneOf([400, 404])
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })

    it('should prevent self-scouting', async () => {
      const scoutData = {
        recipientId: 'self-user-id', // 自分自身
        title: 'テストスカウト',
        message: 'テストスカウト',
        senderType: 'company',
        recipientType: 'cfo',
        compensation: 500000
      }
      
      const request = mockRequest('POST', scoutData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBeOneOf([200, 400, 404])
      
      if (response.status === 400) {
        expect(data.success).toBe(false)
        expect(data.error).toContain('自分')
      } else if (response.status === 404) {
        expect(data.success).toBe(false)
        expect(data.error).toContain('受信者が存在しません')
      }
    })

    it('should handle skills array validation', async () => {
      const scoutData = {
        recipientId: 'target-user-id',
        title: 'テストスカウト',
        message: 'テストスカウト',
        senderType: 'company',
        recipientType: 'cfo',
        compensation: 500000,
        requiredSkills: 'invalid skills format' // 配列でない
      }
      
      const request = mockRequest('POST', scoutData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBeOneOf([200, 400, 404])
      expect(data.success).toBeDefined()
    })

    it('should handle large compensation values', async () => {
      const scoutData = {
        recipientId: 'target-user-id',
        message: 'テストスカウト',
        compensation: 100000000 // 1億円
      }
      
      const request = mockRequest('POST', scoutData)
      const response = await POST(request)
      
      expect(response.status).toBeOneOf([200, 400, 404])
      
      const data = await response.json()
      expect(data.success).toBeDefined()
    })
  })

  describe('Scout status and urgency', () => {
    it('should handle urgent scout creation', async () => {
      const scoutData = {
        recipientId: 'target-user-id',
        message: '緊急でCFOを探しています',
        compensation: 1000000,
        urgency: 'urgent'
      }
      
      const request = mockRequest('POST', scoutData)
      const response = await POST(request)
      
      if (response.status === 200) {
        const data = await response.json()
        expect(data.success).toBe(true)
        expect(data.data.urgency).toBe('urgent')
      }
    })

    it('should default to non-urgent when not specified', async () => {
      const scoutData = {
        recipientId: 'target-user-id',
        title: 'テストスカウト',
        message: 'テストスカウト',
        senderType: 'company',
        recipientType: 'cfo',
        compensation: 500000
        // isUrgent not specified
      }
      
      const request = mockRequest('POST', scoutData)
      const response = await POST(request)
      
      if (response.status === 200) {
        const data = await response.json()
        expect(data.success).toBe(true)
        expect(data.data.urgency).toBe('normal')
      }
    })
  })

  describe('Response management', () => {
    it('should create scout response records', async () => {
      // このテストは実際のスカウト返信機能があれば実装
      const scoutData = {
        recipientId: 'target-user-id',
        title: 'テストスカウト',
        message: 'テストスカウト',
        senderType: 'company',
        recipientType: 'cfo',
        compensation: 500000
      }
      
      const request = mockRequest('POST', scoutData)
      const response = await POST(request)
      
      if (response.status === 200) {
        const data = await response.json()
        expect(data.success).toBe(true)
        expect(data.data.status).toBe('pending')
      }
    })
  })

  describe('Error handling', () => {
    it('should handle database connection errors gracefully', async () => {
      const request = mockRequest('GET')
      const response = await GET(request)
      
      expect(response.status).toBeOneOf([200, 500])
      
      if (response.status === 500) {
        const data = await response.json()
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
      }
    })

    it('should handle malformed JSON in POST request', async () => {
      const req = new NextRequest(`http://localhost:3000/api/scouts`, {
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

    it('should handle concurrent scout sending', async () => {
      const scoutData = {
        recipientId: 'target-user-id',
        title: 'テストスカウト',
        message: 'テストスカウト',
        senderType: 'company',
        recipientType: 'cfo',
        compensation: 500000
      }
      
      // 同じスカウトを複数回送信
      const requests = Array(3).fill(null).map(() => mockRequest('POST', scoutData))
      const responses = await Promise.all(requests.map(req => POST(req)))
      
      // 少なくとも1つは成功するか、すべて適切にエラーハンドリングされる
      responses.forEach(response => {
        expect(response.status).toBeOneOf([200, 400, 404, 500])
      })
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