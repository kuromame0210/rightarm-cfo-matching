// APIレスポンス形式のテスト
// Phase 6: Test Strengthening

import { NextResponse } from 'next/server'
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  createStatsResponse,
  CommonErrors,
  isSuccessResponse,
  isErrorResponse,
  HttpStatus,
  ApiSuccessResponse,
  ApiErrorResponse
} from '../lib/api-response'
import { setupMocks, cleanupMocks, testDataFactory } from '../lib/test-utils'

// NextResponseのモック
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200,
      data
    }))
  }
}))

const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>

describe('APIレスポンス形式ユーティリティ', () => {
  beforeEach(() => {
    setupMocks()
    jest.clearAllMocks()
  })

  afterEach(() => {
    cleanupMocks()
  })

  describe('createSuccessResponse', () => {
    test('基本的な成功レスポンスが作成される', () => {
      const data = [testDataFactory.createCFO()]
      createSuccessResponse(data)

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data
        },
        { status: 200 }
      )
    })

    test('メッセージ付き成功レスポンスが作成される', () => {
      const data = { id: 1, name: 'Test' }
      const message = '正常に作成されました'
      
      createSuccessResponse(data, { message })

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data,
          message
        },
        { status: 200 }
      )
    })

    test('メタデータ付き成功レスポンスが作成される', () => {
      const data = [1, 2, 3]
      const meta = { 
        stats: { total: 3, average: 2 },
        timestamp: '2024-01-01T00:00:00Z'
      }
      
      createSuccessResponse(data, { meta, status: 201 })

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data,
          meta
        },
        { status: 201 }
      )
    })

    test('すべてのオプション付き成功レスポンスが作成される', () => {
      const data = testDataFactory.createCompany()
      const options = {
        message: '企業が正常に作成されました',
        meta: { createdBy: 'admin' },
        status: 201
      }
      
      createSuccessResponse(data, options)

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data,
          message: options.message,
          meta: options.meta
        },
        { status: 201 }
      )
    })
  })

  describe('createErrorResponse', () => {
    test('基本的なエラーレスポンスが作成される', () => {
      const message = 'エラーが発生しました'
      
      createErrorResponse(message)

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: { message }
        },
        { status: 500 }
      )
    })

    test('コード付きエラーレスポンスが作成される', () => {
      const message = 'バリデーションエラー'
      const code = 'VALIDATION_ERROR'
      
      createErrorResponse(message, { code, status: 422 })

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: { message, code }
        },
        { status: 422 }
      )
    })

    test('詳細付きエラーレスポンスが作成される', () => {
      const message = 'フィールドエラー'
      const details = {
        field: 'email',
        reason: 'invalid format'
      }
      
      createErrorResponse(message, { details })

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: { message, details }
        },
        { status: 500 }
      )
    })

    test('開発環境でデバッグ情報が含まれる', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'

      const message = 'デバッグエラー'
      const debug = { stack: 'Error stack trace' }
      
      createErrorResponse(message, { debug })

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: { message },
          debug
        },
        { status: 500 }
      )

      process.env.NODE_ENV = originalEnv
    })

    test('本番環境でデバッグ情報が除外される', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const message = 'プロダクションエラー'
      const debug = { stack: 'Error stack trace' }
      
      createErrorResponse(message, { debug })

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: { message }
        },
        { status: 500 }
      )

      process.env.NODE_ENV = originalEnv
    })
  })

  describe('createPaginatedResponse', () => {
    test('ページネーション付きレスポンスが作成される', () => {
      const data = [
        testDataFactory.createCFO({ id: '1' }),
        testDataFactory.createCFO({ id: '2' })
      ]
      const pagination = {
        page: 1,
        limit: 2,
        total: 10
      }
      
      createPaginatedResponse(data, pagination)

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data,
          meta: {
            pagination: {
              page: 1,
              limit: 2,
              total: 10,
              totalPages: 5
            }
          }
        },
        { status: 200 }
      )
    })

    test('統計情報付きページネーションレスポンスが作成される', () => {
      const data = [testDataFactory.createCompany()]
      const pagination = { page: 2, limit: 5, total: 23 }
      const stats = { activeCount: 18, inactiveCount: 5 }
      
      createPaginatedResponse(data, pagination, { stats })

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data,
          meta: {
            pagination: {
              page: 2,
              limit: 5,
              total: 23,
              totalPages: 5
            },
            stats
          }
        },
        { status: 200 }
      )
    })

    test('totalPages が正しく計算される', () => {
      const data: any[] = []
      
      // 端数なしのケース
      createPaginatedResponse(data, { page: 1, limit: 10, total: 50 })
      expect(mockNextResponse.json).toHaveBeenLastCalledWith(
        expect.objectContaining({
          meta: expect.objectContaining({
            pagination: expect.objectContaining({
              totalPages: 5
            })
          })
        }),
        expect.any(Object)
      )

      // 端数ありのケース
      createPaginatedResponse(data, { page: 1, limit: 10, total: 53 })
      expect(mockNextResponse.json).toHaveBeenLastCalledWith(
        expect.objectContaining({
          meta: expect.objectContaining({
            pagination: expect.objectContaining({
              totalPages: 6
            })
          })
        }),
        expect.any(Object)
      )
    })
  })

  describe('createStatsResponse', () => {
    test('統計情報付きレスポンスが作成される', () => {
      const data = { summary: 'test' }
      const stats = {
        userCount: 100,
        activeUsers: 85,
        conversionRate: 0.15
      }
      
      createStatsResponse(data, stats)

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data,
          meta: { stats }
        },
        { status: 200 }
      )
    })

    test('メッセージ付き統計情報レスポンスが作成される', () => {
      const data = testDataFactory.createUser()
      const stats = { loginCount: 10 }
      const message = '統計情報を取得しました'
      
      createStatsResponse(data, stats, { message })

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data,
          message,
          meta: { stats }
        },
        { status: 200 }
      )
    })
  })

  describe('CommonErrors', () => {
    test('unauthorized エラーが正しく作成される', () => {
      CommonErrors.unauthorized()

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: '認証が必要です',
            code: 'UNAUTHORIZED'
          }
        },
        { status: 401 }
      )
    })

    test('カスタムメッセージでunauthorized エラーが作成される', () => {
      const customMessage = 'ログインしてください'
      CommonErrors.unauthorized(customMessage)

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: customMessage,
            code: 'UNAUTHORIZED'
          }
        },
        { status: 401 }
      )
    })

    test('forbidden エラーが正しく作成される', () => {
      CommonErrors.forbidden()

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: 'アクセス権限がありません',
            code: 'FORBIDDEN'
          }
        },
        { status: 403 }
      )
    })

    test('badRequest エラーが詳細付きで作成される', () => {
      const message = '必須フィールドが不足しています'
      const details = { missingFields: ['name', 'email'] }
      
      CommonErrors.badRequest(message, details)

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message,
            code: 'BAD_REQUEST',
            details
          }
        },
        { status: 400 }
      )
    })

    test('notFound エラーが正しく作成される', () => {
      CommonErrors.notFound()

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: 'リソースが見つかりません',
            code: 'NOT_FOUND'
          }
        },
        { status: 404 }
      )
    })

    test('conflict エラーが正しく作成される', () => {
      CommonErrors.conflict('メールアドレスが既に使用されています')

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: 'メールアドレスが既に使用されています',
            code: 'CONFLICT'
          }
        },
        { status: 409 }
      )
    })

    test('validation エラーが詳細付きで作成される', () => {
      const details = {
        email: ['有効なメールアドレスを入力してください'],
        password: ['8文字以上である必要があります']
      }
      
      CommonErrors.validation('バリデーションエラー', details)

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: 'バリデーションエラー',
            code: 'VALIDATION_ERROR',
            details
          }
        },
        { status: 422 }
      )
    })

    test('internal エラーがデバッグ情報付きで作成される', () => {
      const debug = { errorId: 'err_123', timestamp: '2024-01-01T00:00:00Z' }
      
      CommonErrors.internal('データベース接続エラー', debug)

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          error: {
            message: 'データベース接続エラー',
            code: 'INTERNAL_ERROR'
          },
          debug
        },
        { status: 500 }
      )
    })
  })

  describe('レスポンス型チェック関数', () => {
    describe('isSuccessResponse', () => {
      test('成功レスポンスで true を返す', () => {
        const successResponse: ApiSuccessResponse = {
          success: true,
          data: { test: 'data' }
        }
        
        expect(isSuccessResponse(successResponse)).toBe(true)
      })

      test('エラーレスポンスで false を返す', () => {
        const errorResponse: ApiErrorResponse = {
          success: false,
          error: { message: 'エラー' }
        }
        
        expect(isSuccessResponse(errorResponse)).toBe(false)
      })

      test('不正な形式で false を返す', () => {
        expect(isSuccessResponse(null)).toBe(false)
        expect(isSuccessResponse(undefined)).toBe(false)
        expect(isSuccessResponse('string')).toBe(false)
        expect(isSuccessResponse({})).toBe(false)
        expect(isSuccessResponse({ success: 'true' })).toBe(false)
      })
    })

    describe('isErrorResponse', () => {
      test('エラーレスポンスで true を返す', () => {
        const errorResponse: ApiErrorResponse = {
          success: false,
          error: { message: 'エラー' }
        }
        
        expect(isErrorResponse(errorResponse)).toBe(true)
      })

      test('成功レスポンスで false を返す', () => {
        const successResponse: ApiSuccessResponse = {
          success: true,
          data: { test: 'data' }
        }
        
        expect(isErrorResponse(successResponse)).toBe(false)
      })

      test('不正な形式で false を返す', () => {
        expect(isErrorResponse(null)).toBe(false)
        expect(isErrorResponse(undefined)).toBe(false)
        expect(isErrorResponse('string')).toBe(false)
        expect(isErrorResponse({})).toBe(false)
        expect(isErrorResponse({ success: 'false' })).toBe(false)
      })
    })
  })

  describe('HttpStatus 定数', () => {
    test('HTTPステータスコードが正しく定義されている', () => {
      expect(HttpStatus.OK).toBe(200)
      expect(HttpStatus.CREATED).toBe(201)
      expect(HttpStatus.BAD_REQUEST).toBe(400)
      expect(HttpStatus.UNAUTHORIZED).toBe(401)
      expect(HttpStatus.FORBIDDEN).toBe(403)
      expect(HttpStatus.NOT_FOUND).toBe(404)
      expect(HttpStatus.CONFLICT).toBe(409)
      expect(HttpStatus.VALIDATION_ERROR).toBe(422)
      expect(HttpStatus.INTERNAL_ERROR).toBe(500)
    })
  })

  describe('型定義の整合性', () => {
    test('ApiSuccessResponse の型が正しく定義されている', () => {
      const response: ApiSuccessResponse<string> = {
        success: true,
        data: 'test'
      }
      
      expect(response.success).toBe(true)
      expect(response.data).toBe('test')
    })

    test('ApiErrorResponse の型が正しく定義されている', () => {
      const response: ApiErrorResponse = {
        success: false,
        error: {
          message: 'テストエラー',
          code: 'TEST_ERROR',
          details: { field: 'test' }
        },
        debug: { trace: 'test trace' }
      }
      
      expect(response.success).toBe(false)
      expect(response.error.message).toBe('テストエラー')
      expect(response.error.code).toBe('TEST_ERROR')
    })

    test('メタデータ型が正しく定義されている', () => {
      const response: ApiSuccessResponse<any[]> = {
        success: true,
        data: [],
        meta: {
          pagination: {
            page: 1,
            limit: 10,
            total: 100,
            totalPages: 10
          },
          stats: {
            count: 100,
            average: 50
          },
          customField: 'custom value'
        }
      }
      
      expect(response.meta?.pagination?.page).toBe(1)
      expect(response.meta?.stats?.count).toBe(100)
      expect(response.meta?.customField).toBe('custom value')
    })
  })
})