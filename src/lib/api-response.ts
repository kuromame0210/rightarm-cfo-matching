// 統一APIレスポンス形式
// Phase 2: API Response Format Standardization

import { NextResponse } from 'next/server'

// 成功レスポンスの型定義
export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  message?: string
  meta?: {
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    stats?: Record<string, any>
    [key: string]: any
  }
}

// エラーレスポンスの型定義
export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code?: string
    details?: any
  }
  debug?: any // 開発環境でのみ含まれる
}

// 成功レスポンス作成ユーティリティ
export function createSuccessResponse<T>(
  data: T,
  options?: {
    message?: string
    meta?: any
    status?: number
  }
): NextResponse {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    ...(options?.message && { message: options.message }),
    ...(options?.meta && { meta: options.meta })
  }

  return NextResponse.json(response, { 
    status: options?.status || 200 
  })
}

// エラーレスポンス作成ユーティリティ
export function createErrorResponse(
  message: string,
  options?: {
    code?: string
    details?: any
    debug?: any
    status?: number
  }
): NextResponse {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      message,
      ...(options?.code && { code: options.code }),
      ...(options?.details && { details: options.details })
    },
    ...(process.env.NODE_ENV === 'development' && options?.debug && { 
      debug: options.debug 
    })
  }

  return NextResponse.json(response, { 
    status: options?.status || 500 
  })
}

// ページネーション付き成功レスポンス
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
  },
  options?: {
    message?: string
    stats?: Record<string, any>
  }
): NextResponse {
  const totalPages = Math.ceil(pagination.total / pagination.limit)
  
  return createSuccessResponse(data, {
    message: options?.message,
    meta: {
      pagination: {
        ...pagination,
        totalPages
      },
      ...(options?.stats && { stats: options.stats })
    }
  })
}

// 統計情報付き成功レスポンス
export function createStatsResponse<T>(
  data: T,
  stats: Record<string, any>,
  options?: {
    message?: string
  }
): NextResponse {
  return createSuccessResponse(data, {
    message: options?.message,
    meta: { stats }
  })
}

// よく使用されるエラーレスポンス
export const CommonErrors = {
  // 認証エラー
  unauthorized: (message = '認証が必要です') =>
    createErrorResponse(message, { 
      code: 'UNAUTHORIZED',
      status: 401 
    }),

  // 権限不足エラー
  forbidden: (message = 'アクセス権限がありません') =>
    createErrorResponse(message, { 
      code: 'FORBIDDEN',
      status: 403 
    }),

  // 不正なリクエスト
  badRequest: (message = '不正なリクエストです', details?: any) =>
    createErrorResponse(message, { 
      code: 'BAD_REQUEST',
      details,
      status: 400 
    }),

  // リソースが見つからない
  notFound: (message = 'リソースが見つかりません') =>
    createErrorResponse(message, { 
      code: 'NOT_FOUND',
      status: 404 
    }),

  // 競合エラー（重複など）
  conflict: (message = '競合が発生しました') =>
    createErrorResponse(message, { 
      code: 'CONFLICT',
      status: 409 
    }),

  // バリデーションエラー
  validation: (message = 'バリデーションエラーが発生しました', details?: any) =>
    createErrorResponse(message, { 
      code: 'VALIDATION_ERROR',
      details,
      status: 422 
    }),

  // 内部サーバーエラー
  internal: (message = '内部サーバーエラーが発生しました', debug?: any) =>
    createErrorResponse(message, { 
      code: 'INTERNAL_ERROR',
      debug,
      status: 500 
    })
} as const

// レスポンス型のタイプガード
export function isSuccessResponse(response: any): response is ApiSuccessResponse {
  return response && typeof response === 'object' && response.success === true
}

export function isErrorResponse(response: any): response is ApiErrorResponse {
  return response && typeof response === 'object' && response.success === false
}

// HTTPステータスコード定数
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  INTERNAL_ERROR: 500
} as const