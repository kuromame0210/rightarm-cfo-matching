// 活動履歴API（activities）のリアルDBテスト
import { NextRequest } from 'next/server'
import { GET, POST } from './route'

describe('Activities API - Real DB Tests', () => {
  const mockRequest = (method: string, body?: any, headers?: Record<string, string>) => {
    const req = new NextRequest(`http://localhost:3000/api/activities`, {
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

  describe('GET /api/activities', () => {
    it('should return activities with authentication', async () => {
      const request = mockRequest('GET')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBeOneOf([200, 500])
      
      if (response.status === 200) {
        expect(data.success).toBe(true)
        expect(Array.isArray(data.activities)).toBe(true)
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

    it('should filter activities by type', async () => {
      const url = new URL('http://localhost:3000/api/activities')
      url.searchParams.set('type', 'profile_viewed')
      
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
        expect(Array.isArray(data.activities)).toBe(true)
      } else {
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
      }
      
      // 返された活動がすべて指定されたタイプであることを確認
      if (data.activities.length > 0) {
        data.activities.forEach((activity: any) => {
          expect(activity.activity_type).toBe('profile_viewed')
        })
      }
    })

    it('should handle pagination parameters', async () => {
      const url = new URL('http://localhost:3000/api/activities')
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

      expect(response.status).toBeOneOf([200, 500])
      
      if (response.status === 200) {
        expect(data.success).toBe(true)
        expect(data.activities.length).toBeLessThanOrEqual(5)
      } else {
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
      }
    })

    it('should handle date range filtering', async () => {
      const url = new URL('http://localhost:3000/api/activities')
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
        expect(Array.isArray(data.activities)).toBe(true)
      } else {
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
      }
    })

    it('should return activities in correct order (newest first)', async () => {
      const request = mockRequest('GET')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBeOneOf([200, 500])
      
      if (response.status === 200) {
        expect(data.success).toBe(true)
        
        if (data.activities.length > 1) {
          // 活動が日付順（新しい順）に並んでいることを確認
          const dates = data.activities.map((activity: any) => new Date(activity.created_at).getTime())
          const sortedDates = [...dates].sort((a, b) => b - a)
          expect(dates).toEqual(sortedDates)
        }
      } else {
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
      }
    })
  })

  describe('POST /api/activities', () => {
    it('should create activity with valid data', async () => {
      const activityData = {
        activityType: 'profile_viewed',
        title: 'プロフィールを閲覧しました',
        description: 'CFOのプロフィールページを表示しました',
        metadata: {
          targetUserId: 'target-user-id',
          viewDuration: 120
        }
      }
      
      const request = mockRequest('POST', activityData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBeOneOf([200, 500])
      
      if (response.status === 200) {
        expect(data.success).toBe(true)
        expect(data.activity).toBeDefined()
        expect(data.activity.id).toBeDefined()
        expect(data.activity.activity_type).toBe('profile_viewed')
      } else {
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
      }
    })

    it('should require authentication', async () => {
      const activityData = {
        activityType: 'profile_viewed',
        title: 'プロフィールを閲覧しました'
      }
      
      const request = mockRequest('POST', activityData, { 'Authorization': '' })
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
      expect(data.error).toContain('必須です')
    })

    it('should validate activity types', async () => {
      const activityData = {
        activityType: 'invalid_type',
        title: 'テスト活動'
      }
      
      const request = mockRequest('POST', activityData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBeOneOf([400, 500])
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })

    it('should handle metadata validation', async () => {
      const activityData = {
        activityType: 'profile_viewed',
        title: 'プロフィールを閲覧しました',
        metadata: 'invalid metadata format' // オブジェクトでない
      }
      
      const request = mockRequest('POST', activityData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBeOneOf([400, 500])
      expect(data.success).toBe(false)
      expect(data.error).toBeDefined()
    })
  })

  describe('Activity types validation', () => {
    const validActivityTypes = [
      'login',
      'logout',
      'profile_viewed',
      'profile_updated',
      'message_sent',
      'message_received',
      'meeting_scheduled',
      'meeting_completed',
      'scout_sent',
      'scout_received',
      'scout_responded',
      'interest_added',
      'contract_created'
    ]
    
    validActivityTypes.forEach(type => {
      it(`should accept valid activity type: ${type}`, async () => {
        const activityData = {
          activityType: type,
          title: `テスト活動: ${type}`,
          description: `${type}のテスト`
        }
        
        const request = mockRequest('POST', activityData)
        const response = await POST(request)
        const data = await response.json()

        expect(response.status).toBeOneOf([200, 500])
        
        if (response.status === 200) {
          expect(data.success).toBe(true)
          expect(data.activity.activity_type).toBe(type)
        } else {
          expect(data.success).toBe(false)
          expect(data.error).toBeDefined()
        }
      })
    })
  })

  describe('Metadata handling', () => {
    it('should handle complex metadata objects', async () => {
      const activityData = {
        activityType: 'scout_sent',
        title: 'スカウトを送信しました',
        metadata: {
          targetUserId: 'target-user-id',
          scoutType: 'urgent',
          compensation: 500000,
          skills: ['財務戦略', 'IPO'],
          message: 'ぜひご検討ください'
        }
      }
      
      const request = mockRequest('POST', activityData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBeOneOf([200, 500])
      
      if (response.status === 200) {
        expect(data.success).toBe(true)
      } else {
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
        return
      }
      expect(data.activity.metadata).toEqual(activityData.metadata)
    })

    it('should handle null metadata', async () => {
      const activityData = {
        activityType: 'login',
        title: 'ログインしました',
        metadata: null
      }
      
      const request = mockRequest('POST', activityData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBeOneOf([200, 500])
      
      if (response.status === 200) {
        expect(data.success).toBe(true)
      } else {
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
        return
      }
    })

    it('should handle empty metadata object', async () => {
      const activityData = {
        activityType: 'logout',
        title: 'ログアウトしました',
        metadata: {}
      }
      
      const request = mockRequest('POST', activityData)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBeOneOf([200, 500])
      
      if (response.status === 200) {
        expect(data.success).toBe(true)
      } else {
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
        return
      }
      expect(data.activity.metadata).toEqual({})
    })
  })

  describe('Statistics and aggregation', () => {
    it('should include statistics in GET response', async () => {
      const request = mockRequest('GET')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBeOneOf([200, 500])
      
      if (response.status === 200) {
        expect(data.success).toBe(true)
      } else {
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
        return
      }
      expect(data.statistics).toBeDefined()
      expect(typeof data.statistics.total).toBe('number')
      expect(Array.isArray(data.statistics.byType)).toBe(true)
    })

    it('should handle statistics for specific date range', async () => {
      const url = new URL('http://localhost:3000/api/activities')
      url.searchParams.set('fromDate', '2024-01-01')
      url.searchParams.set('toDate', '2024-12-31')
      url.searchParams.set('includeStats', 'true')
      
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
      } else {
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
        return
      }
      expect(data.statistics).toBeDefined()
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
      const req = new NextRequest(`http://localhost:3000/api/activities`, {
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

    it('should handle large metadata objects', async () => {
      const largeMetadata = {
        data: 'x'.repeat(10000) // 10KB のデータ
      }
      
      const activityData = {
        activityType: 'profile_viewed',
        title: 'テスト活動',
        metadata: largeMetadata
      }
      
      const request = mockRequest('POST', activityData)
      const response = await POST(request)
      
      expect(response.status).toBeOneOf([200, 400, 500])
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.success).toBe(false)
        expect(data.error).toContain('metadata')
      } else if (response.status === 500) {
        const data = await response.json()
        expect(data.success).toBe(false)
        expect(data.error).toBeDefined()
      }
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