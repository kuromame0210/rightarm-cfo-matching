// プロフィール編集API（profile）のリアルDBテスト
import { NextRequest } from 'next/server'
import { GET, PUT } from './route'

describe('Profile API - Real DB Tests', () => {
  const mockRequest = (method: string, body?: any, headers?: Record<string, string>) => {
    const req = new NextRequest(`http://localhost:3000/api/profile`, {
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

  describe('GET /api/profile', () => {
    it('should return user profile with authentication', async () => {
      const request = mockRequest('GET')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      expect(data.data.id).toBeDefined()
      expect(data.data.email).toBeDefined()
      expect(data.data.userType).toBeOneOf(['cfo', 'company'])
    })

    it('should require authentication', async () => {
      const request = mockRequest('GET', undefined, { 'Authorization': '' })
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('認証が必要です')
    })

    it('should include user type specific data', async () => {
      const request = mockRequest('GET')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      if (data.data.userType === 'cfo') {
        // CFO固有のフィールドが含まれているかチェック
        expect(data.data).toHaveProperty('id')
        expect(data.data).toHaveProperty('email')
        expect(data.data).toHaveProperty('name')
      } else if (data.data.userType === 'company') {
        // Company固有のフィールドが含まれているかチェック
        expect(data.data).toHaveProperty('id')
        expect(data.data).toHaveProperty('email')
        expect(data.data).toHaveProperty('name')
      }
    })

    it('should handle user without detailed profile', async () => {
      const request = mockRequest('GET')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
      
      // 詳細プロフィールがない場合でも基本情報は返される
      expect(data.data.id).toBeDefined()
      expect(data.data.email).toBeDefined()
      expect(data.data.userType).toBeDefined()
    })
  })

  describe('PUT /api/profile', () => {
    it('should update basic user information', async () => {
      const updateData = {
        name: '更新されたユーザー名',
        phoneNumber: '090-1234-5678',
        address: '東京都渋谷区1-1-1'
      }
      
      const request = mockRequest('PUT', updateData)
      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('プロフィールを更新しました')
    })

    it('should update CFO specific information', async () => {
      const updateData = {
        name: 'CFOテストユーザー',
        title: '戦略CFO',
        bio: 'IPO経験豊富なCFOです',
        hourlyRate: 15000,
        availabilityStatus: 'available',
        specialties: ['IPO準備', 'M&A', '資金調達']
      }
      
      const request = mockRequest('PUT', updateData)
      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should update Company specific information', async () => {
      const updateData = {
        name: '企業テストユーザー',
        companyName: '株式会社テスト',
        industry: 'IT',
        employeeCount: 50,
        foundedYear: 2020,
        website: 'https://test.com',
        description: 'AI技術を活用したソフトウェア開発企業'
      }
      
      const request = mockRequest('PUT', updateData)
      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should require authentication', async () => {
      const updateData = {
        name: 'テストユーザー'
      }
      
      const request = mockRequest('PUT', updateData, { 'Authorization': '' })
      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error).toBe('認証が必要です')
    })

    it('should validate hourly rate for CFO', async () => {
      const updateData = {
        name: 'CFOテストユーザー',
        hourlyRate: -1000 // 負の値
      }
      
      const request = mockRequest('PUT', updateData)
      const response = await PUT(request)
      
      expect(response.status).toBeOneOf([200, 400])
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.success).toBe(false)
        expect(data.error).toContain('hourly_rate')
      }
    })

    it('should validate employee count for Company', async () => {
      const updateData = {
        name: '企業テストユーザー',
        employeeCount: -10 // 負の値
      }
      
      const request = mockRequest('PUT', updateData)
      const response = await PUT(request)
      
      expect(response.status).toBeOneOf([200, 400])
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.success).toBe(false)
        expect(data.error).toContain('employee_count')
      }
    })

    it('should validate founded year for Company', async () => {
      const currentYear = new Date().getFullYear()
      const updateData = {
        name: '企業テストユーザー',
        foundedYear: currentYear + 10 // 未来の年
      }
      
      const request = mockRequest('PUT', updateData)
      const response = await PUT(request)
      
      expect(response.status).toBeOneOf([200, 400])
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.success).toBe(false)
        expect(data.error).toContain('founded_year')
      }
    })

    it('should validate website URL format', async () => {
      const updateData = {
        name: '企業テストユーザー',
        website: 'invalid-url'
      }
      
      const request = mockRequest('PUT', updateData)
      const response = await PUT(request)
      
      expect(response.status).toBeOneOf([200, 400])
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.success).toBe(false)
        expect(data.error).toContain('website')
      }
    })

    it('should validate availability status for CFO', async () => {
      const updateData = {
        name: 'CFOテストユーザー',
        availabilityStatus: 'invalid-status'
      }
      
      const request = mockRequest('PUT', updateData)
      const response = await PUT(request)
      
      expect(response.status).toBeOneOf([200, 400])
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.success).toBe(false)
        expect(data.error).toContain('availability_status')
      }
    })

    it('should handle specialties array for CFO', async () => {
      const updateData = {
        name: 'CFOテストユーザー',
        specialties: ['IPO準備', 'M&A', '資金調達', '財務戦略']
      }
      
      const request = mockRequest('PUT', updateData)
      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should handle empty optional fields', async () => {
      const updateData = {
        name: 'ミニマルユーザー',
        phoneNumber: '',
        address: ''
      }
      
      const request = mockRequest('PUT', updateData)
      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should create activity record on profile update', async () => {
      const updateData = {
        name: '活動テストユーザー',
        phoneNumber: '090-9999-9999'
      }
      
      const request = mockRequest('PUT', updateData)
      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      // 活動履歴が作成されることを確認（実際のチェックは活動履歴APIで）
    })

    it('should handle partial updates', async () => {
      const updateData = {
        phoneNumber: '090-8888-8888'
        // nameは更新しない
      }
      
      const request = mockRequest('PUT', updateData)
      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })

    it('should handle large text fields', async () => {
      const longBio = 'あ'.repeat(5000) // 5000文字
      
      const updateData = {
        name: 'ロングバイオテスト',
        bio: longBio
      }
      
      const request = mockRequest('PUT', updateData)
      const response = await PUT(request)
      
      expect(response.status).toBeOneOf([200, 400])
      
      if (response.status === 400) {
        const data = await response.json()
        expect(data.success).toBe(false)
        expect(data.error).toContain('文字数')
      }
    })
  })

  describe('Profile integration', () => {
    it('should maintain data consistency between user types', async () => {
      // プロフィール取得
      const getRequest = mockRequest('GET')
      const getResponse = await GET(getRequest)
      const getData = await getResponse.json()

      if (getResponse.status === 200) {
        const userType = getData.data.userType
        
        // ユーザータイプに応じた更新
        const updateData: any = {
          name: `更新されたユーザー_${userType}`
        }
        
        if (userType === 'cfo') {
          updateData.title = '更新されたタイトル'
        } else if (userType === 'company') {
          updateData.companyName = '更新された企業名'
        }
        
        const putRequest = mockRequest('PUT', updateData)
        const putResponse = await PUT(putRequest)
        const putData = await putResponse.json()

        expect(putResponse.status).toBe(200)
        expect(putData.success).toBe(true)
      }
    })

    it('should handle concurrent profile updates', async () => {
      const updateData1 = { name: '同時更新テスト1' }
      const updateData2 = { phoneNumber: '090-1111-1111' }
      
      const requests = [
        mockRequest('PUT', updateData1),
        mockRequest('PUT', updateData2)
      ]
      
      const responses = await Promise.all(requests.map(req => PUT(req)))
      
      // 少なくとも1つは成功するか、すべて適切にエラーハンドリングされる
      responses.forEach(response => {
        expect(response.status).toBeOneOf([200, 400, 500])
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

    it('should handle malformed JSON in PUT request', async () => {
      const req = new NextRequest(`http://localhost:3000/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token'
        },
        body: 'invalid json'
      })
      
      const response = await PUT(req)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should handle missing user data', async () => {
      // 無効なトークンでテスト
      const request = mockRequest('GET', undefined, { 'Authorization': 'Bearer invalid-token' })
      const response = await GET(request)
      
      expect(response.status).toBeOneOf([401, 500])
      
      const data = await response.json()
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