// APIクライアントのテスト
// Phase 6: Test Strengthening

import { apiClient, ApiClient, ApiError, api, isSuccessResponse, isErrorResponse } from '../lib/api-client'
import { 
  setupMocks, 
  cleanupMocks, 
  mockFetch, 
  mockApiResponse,
  testDataFactory 
} from '../lib/test-utils'

describe('ApiClient', () => {
  beforeEach(() => {
    setupMocks()
  })

  afterEach(() => {
    cleanupMocks()
  })

  describe('基本的なHTTPメソッド', () => {
    test('GET リクエストが正常に動作する', async () => {
      const mockData = [testDataFactory.createCFO()]
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockApiResponse.success(mockData))
      })

      const result = await apiClient.get('/api/cfos')
      
      expect(mockFetch).toHaveBeenCalledWith('/api/cfos', expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer demo-token'
        })
      }))
      expect(result).toEqual(mockApiResponse.success(mockData))
    })

    test('POST リクエストが正常に動作する', async () => {
      const requestData = { name: 'テストCFO', skills: ['資金調達'] }
      const responseData = testDataFactory.createCFO(requestData)
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockApiResponse.success(responseData))
      })

      const result = await apiClient.post('/api/cfos', requestData)
      
      expect(mockFetch).toHaveBeenCalledWith('/api/cfos', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      }))
      expect(result).toEqual(mockApiResponse.success(responseData))
    })

    test('PUT リクエストが正常に動作する', async () => {
      const updateData = { name: '更新されたCFO' }
      const responseData = testDataFactory.createCFO(updateData)
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockApiResponse.success(responseData))
      })

      const result = await apiClient.put('/api/cfos/1', updateData)
      
      expect(mockFetch).toHaveBeenCalledWith('/api/cfos/1', expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify(updateData)
      }))
      expect(result).toEqual(mockApiResponse.success(responseData))
    })

    test('DELETE リクエストが正常に動作する', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockApiResponse.success(null))
      })

      const result = await apiClient.delete('/api/cfos/1')
      
      expect(mockFetch).toHaveBeenCalledWith('/api/cfos/1', expect.objectContaining({
        method: 'DELETE'
      }))
      expect(result).toEqual(mockApiResponse.success(null))
    })

    test('PATCH リクエストが正常に動作する', async () => {
      const patchData = { rating: 4.9 }
      const responseData = testDataFactory.createCFO(patchData)
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockApiResponse.success(responseData))
      })

      const result = await apiClient.patch('/api/cfos/1', patchData)
      
      expect(mockFetch).toHaveBeenCalledWith('/api/cfos/1', expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(patchData)
      }))
      expect(result).toEqual(mockApiResponse.success(responseData))
    })
  })

  describe('パラメータとクエリ文字列', () => {
    test('GET リクエストでクエリパラメータが正しく追加される', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockApiResponse.success([]))
      })

      await apiClient.get('/api/cfos', { limit: 10, page: 2, active: true })
      
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/cfos?limit=10&page=2&active=true',
        expect.any(Object)
      )
    })

    test('DELETE リクエストでクエリパラメータが正しく追加される', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockApiResponse.success(null))
      })

      await apiClient.delete('/api/interests', { targetUserId: 'user-1' })
      
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/interests?targetUserId=user-1',
        expect.any(Object)
      )
    })

    test('undefined/nullパラメータは除外される', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockApiResponse.success([]))
      })

      await apiClient.get('/api/cfos', { 
        limit: 10, 
        page: undefined, 
        filter: null,
        active: true 
      })
      
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/cfos?limit=10&active=true',
        expect.any(Object)
      )
    })
  })

  describe('認証ヘッダー', () => {
    test('デフォルトで認証ヘッダーが追加される', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockApiResponse.success([]))
      })

      await apiClient.get('/api/cfos')
      
      expect(mockFetch).toHaveBeenCalledWith('/api/cfos', expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer demo-token'
        })
      }))
    })

    test('auth: false で認証ヘッダーが除外される', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockApiResponse.success([]))
      })

      await apiClient.get('/api/public', undefined, { auth: false })
      
      expect(mockFetch).toHaveBeenCalledWith('/api/public', expect.objectContaining({
        headers: expect.not.objectContaining({
          'Authorization': expect.any(String)
        })
      }))
    })
  })

  describe('エラーハンドリング', () => {
    test('APIエラーレスポンスが正しく処理される', async () => {
      const errorResponse = mockApiResponse.error('CFOが見つかりません', 'CFO_NOT_FOUND')
      
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(errorResponse)
      })

      await expect(apiClient.get('/api/cfos/999')).rejects.toThrow(ApiError)
      
      try {
        await apiClient.get('/api/cfos/999')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).status).toBe(404)
        expect((error as ApiError).code).toBe('CFO_NOT_FOUND')
        expect((error as ApiError).message).toBe('CFOが見つかりません')
      }
    })

    test('ネットワークエラーが正しく処理される', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network Error'))

      await expect(apiClient.get('/api/cfos')).rejects.toThrow(ApiError)
      
      try {
        await apiClient.get('/api/cfos')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).status).toBe(0)
        expect((error as ApiError).code).toBe('NETWORK_ERROR')
      }
    })

    test('JSONパースエラーが正しく処理される', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.reject(new Error('Invalid JSON'))
      })

      await expect(apiClient.get('/api/cfos')).rejects.toThrow(ApiError)
      
      try {
        await apiClient.get('/api/cfos')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).code).toBe('PARSE_ERROR')
      }
    })

    test('HTTPエラーが正しく処理される', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Map([['content-type', 'text/plain']]),
        text: () => Promise.resolve('Server Error')
      })

      await expect(apiClient.get('/api/cfos')).rejects.toThrow(ApiError)
      
      try {
        await apiClient.get('/api/cfos')
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError)
        expect((error as ApiError).status).toBe(500)
        expect((error as ApiError).code).toBe('HTTP_ERROR')
      }
    })
  })

  describe('FormData処理', () => {
    test('FormDataが正しく処理される', async () => {
      const formData = new FormData()
      formData.append('name', 'テストCFO')
      formData.append('file', new Blob(['test'], { type: 'text/plain' }))
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockApiResponse.success({ uploaded: true }))
      })

      await apiClient.post('/api/upload', formData)
      
      expect(mockFetch).toHaveBeenCalledWith('/api/upload', expect.objectContaining({
        method: 'POST',
        body: formData,
        headers: expect.not.objectContaining({
          'Content-Type': expect.any(String)
        })
      }))
    })
  })
})

describe('api オブジェクト（タイプセーフAPIクライアント）', () => {
  beforeEach(() => {
    setupMocks()
  })

  afterEach(() => {
    cleanupMocks()
  })

  describe('interests API', () => {
    test('list() が正常に動作する', async () => {
      const mockInterests = [testDataFactory.createInterest()]
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockApiResponse.success(mockInterests))
      })

      const result = await api.interests.list()
      
      expect(mockFetch).toHaveBeenCalledWith('/api/interests', expect.any(Object))
      expect(result).toEqual(mockApiResponse.success(mockInterests))
    })

    test('add() が正常に動作する', async () => {
      const newInterest = testDataFactory.createInterest({ target_user_id: 'user-1' })
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockApiResponse.success(newInterest))
      })

      const result = await api.interests.add('user-1', 'cfo')
      
      expect(mockFetch).toHaveBeenCalledWith('/api/interests', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ targetUserId: 'user-1', targetType: 'cfo' })
      }))
      expect(result).toEqual(mockApiResponse.success(newInterest))
    })

    test('remove() が正常に動作する', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockApiResponse.success(null))
      })

      const result = await api.interests.remove('user-1')
      
      expect(mockFetch).toHaveBeenCalledWith('/api/interests?targetUserId=user-1', expect.objectContaining({
        method: 'DELETE'
      }))
      expect(result).toEqual(mockApiResponse.success(null))
    })
  })

  describe('cfos API', () => {
    test('list() が正常に動作する', async () => {
      const mockCfos = [testDataFactory.createCFO()]
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockApiResponse.success(mockCfos))
      })

      const result = await api.cfos.list({ limit: 10, page: 1 })
      
      expect(mockFetch).toHaveBeenCalledWith('/api/cfos?limit=10&page=1', expect.any(Object))
      expect(result).toEqual(mockApiResponse.success(mockCfos))
    })

    test('get() が正常に動作する', async () => {
      const mockCfo = testDataFactory.createCFO({ id: 'cfo-1' })
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockApiResponse.success(mockCfo))
      })

      const result = await api.cfos.get('cfo-1')
      
      expect(mockFetch).toHaveBeenCalledWith('/api/cfos/cfo-1', expect.any(Object))
      expect(result).toEqual(mockApiResponse.success(mockCfo))
    })
  })

  describe('scouts API', () => {
    test('send() が正常に動作する', async () => {
      const scoutData = {
        recipientId: 'cfo-1',
        title: 'CFO候補のご提案',
        message: 'ぜひお話しさせてください',
        senderType: 'company',
        recipientType: 'cfo',
        urgency: 'high'
      }
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockApiResponse.success({ id: 'scout-1', ...scoutData }))
      })

      const result = await api.scouts.send(scoutData)
      
      expect(mockFetch).toHaveBeenCalledWith('/api/scouts', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(scoutData)
      }))
      expect(result.success).toBe(true)
    })
  })
})

describe('レスポンス型チェック関数', () => {
  test('isSuccessResponse が正しく動作する', () => {
    const successResponse = mockApiResponse.success(['data'])
    const errorResponse = mockApiResponse.error('エラーメッセージ')
    
    expect(isSuccessResponse(successResponse)).toBe(true)
    expect(isSuccessResponse(errorResponse)).toBe(false)
  })

  test('isErrorResponse が正しく動作する', () => {
    const successResponse = mockApiResponse.success(['data'])
    const errorResponse = mockApiResponse.error('エラーメッセージ')
    
    expect(isErrorResponse(successResponse)).toBe(false)
    expect(isErrorResponse(errorResponse)).toBe(true)
  })
})

describe('カスタムApiClientインスタンス', () => {
  test('カスタム設定でApiClientが作成できる', () => {
    const customConfig = {
      baseURL: 'https://api.example.com',
      timeout: 10000,
      defaultHeaders: {
        'X-Custom-Header': 'custom-value'
      }
    }

    const customClient = new ApiClient(customConfig)
    expect(customClient).toBeInstanceOf(ApiClient)
  })

  test('カスタムApiClientでリクエストが実行できる', async () => {
    const customClient = new ApiClient({
      baseURL: 'https://api.example.com'
    })

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'application/json']]),
      json: () => Promise.resolve(mockApiResponse.success([]))
    })

    await customClient.get('/test')
    
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/test',
      expect.any(Object)
    )
  })
})