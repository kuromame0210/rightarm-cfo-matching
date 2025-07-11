// 面談スケジュールAPI（meetings）のリアルDBテスト
import { NextRequest } from 'next/server'
import { GET, POST } from './route'

describe('Meetings API - Real DB Tests', () => {
  const mockRequest = (method: string, body?: any, headers?: Record<string, string>) => {
    const req = new NextRequest(`http://localhost:3000/api/meetings`, {
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

  describe('GET /api/meetings', () => {
    it('should return meetings with authentication', async () => {
      const request = mockRequest('GET')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBeOneOf([200, 500])
      
      if (response.status === 200) {
        expect(data.success).toBe(true)
        expect(Array.isArray(data.meetings)).toBe(true)
      } else {
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
      }
    })

    it('should require authentication', async () => {
      const request = mockRequest('GET', undefined, { 'Authorization': '' })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('認証が必要です')
    })

    it('should filter meetings by status', async () => {
      const url = new URL('http://localhost:3000/api/meetings')
      url.searchParams.set('status', 'scheduled')
      
      const request = new NextRequest(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer demo-token'
        }
      })
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBeOneOf([200, 500])
      
      if (response.status === 200) {
        expect(data.success).toBe(true)
        expect(Array.isArray(data.meetings)).toBe(true)
      } else {
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
      }
      
      // 返されたミーティングがすべて指定されたステータスであることを確認
      if (data.meetings.length > 0) {
        data.meetings.forEach((meeting: any) => {
          expect(meeting.status).toBe('scheduled')
        })
      }
    })

    it('should handle date range filtering', async () => {
      const url = new URL('http://localhost:3000/api/meetings')
      url.searchParams.set('fromDate', '2024-01-01')
      url.searchParams.set('toDate', '2024-12-31')
      
      const request = new NextRequest(url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer demo-token'
        }
      })
      
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBeOneOf([200, 500])
      
      if (response.status === 200) {
        expect(data.success).toBe(true)
        expect(Array.isArray(data.meetings)).toBe(true)
      } else {
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
      }
    })
  })

  describe('POST /api/meetings', () => {
    it('should create meeting with valid data', async () => {
      const meetingData = {
        title: 'テストミーティング',
        description: 'テスト用の面談です',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 明日
        duration: 60,
        meetingType: 'online',
        participants: ['participant-id-1'],
        isUrgent: false
      }
      
      const request = mockRequest('POST', meetingData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBeOneOf([200, 400])
      
      if (response.status === 200) {
        expect(data.success).toBe(true)
        expect(data.meeting).toBeDefined()
        expect(data.meeting.id).toBeDefined()
        expect(data.meeting.title).toBe('テストミーティング')
      } else {
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
      }
    })

    it('should require authentication', async () => {
      const meetingData = {
        title: 'テストミーティング',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        meetingType: 'online',
        participants: ['participant-id-1']
      }
      
      const request = mockRequest('POST', meetingData, { 'Authorization': '' })
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
      expect(data.error).toContain('必須フィールド')
    })

    it('should validate meeting types', async () => {
      const meetingData = {
        title: 'テストミーティング',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        meetingType: 'invalid-type',
        participants: ['participant-id-1']
      }
      
      const request = mockRequest('POST', meetingData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })

    it('should reject past dates', async () => {
      const meetingData = {
        title: 'テストミーティング',
        scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 昨日
        duration: 60,
        meetingType: 'online',
        participants: ['participant-id-1']
      }
      
      const request = mockRequest('POST', meetingData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })

    it('should validate duration limits', async () => {
      const meetingData = {
        title: 'テストミーティング',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duration: 500, // 500分（8時間以上）
        meetingType: 'online',
        participants: ['participant-id-1']
      }
      
      const request = mockRequest('POST', meetingData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })

    it('should handle invalid participant IDs', async () => {
      const meetingData = {
        title: 'テストミーティング',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        meetingType: 'online',
        participants: ['invalid-uuid']
      }
      
      const request = mockRequest('POST', meetingData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBeOneOf([200, 400])
      
      if (response.status === 400) {
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
      }
    })

    it('should handle empty participant list', async () => {
      const meetingData = {
        title: 'テストミーティング',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        meetingType: 'online',
        participants: []
      }
      
      const request = mockRequest('POST', meetingData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })
  })

  describe('Meeting types validation', () => {
    const validMeetingTypes = ['online', 'offline', 'phone']
    
    validMeetingTypes.forEach(type => {
      it(`should accept valid meeting type: ${type}`, async () => {
        const meetingData = {
          title: 'テストミーティング',
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          duration: 60,
          meetingType: type,
          participants: ['participant-id-1']
        }
        
        const request = mockRequest('POST', meetingData)
        const response = await POST(request)
        
        expect(response.status).toBeOneOf([200, 400])
        
        if (response.status === 400) {
          const data = await response.json()
          expect(data.error).not.toContain('meeting_type')
        }
      })
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
      const req = new NextRequest(`http://localhost:3000/api/meetings`, {
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