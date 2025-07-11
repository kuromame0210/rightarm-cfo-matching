// RightArm v3 企業一覧取得 API Route - 統一認証システム
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'
import { requireAuth } from '@/lib/auth/unified-auth'

export async function GET(request: NextRequest) {
  // 認証必須のエンドポイント
  const { error: authError } = await requireAuth()
  if (authError) {
    return authError
  }
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const region = searchParams.get('region')
    const industry = searchParams.get('industry')
    // const challenges = searchParams.get('challenges')?.split(',') // 将来のフィルタリング用
    const search = searchParams.get('search')

    // クエリ構築開始 - シンプル化して外部キーエラーを回避
    let query = supabase
      .from(TABLES.COMPANIES)
      .select(`
        *
      `)
      .eq('is_recruiting', true)

    // フィルタリング
    if (region && region !== '全国') {
      query = query.eq('region', region)
    }

    if (industry) {
      query = query.eq('industry', industry)
    }

    if (search) {
      query = query.or(`company_name.ilike.%${search}%,business_name.ilike.%${search}%`)
    }

    // ページネーション
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: companies, error, count } = await query

    // デバッグ情報を追加
    console.log('Companies API Debug:', {
      table: TABLES.COMPANIES,
      count: count,
      dataLength: companies?.length || 0,
      error: error
    })

    if (error) {
      console.error('Companies fetch error:', error)
      return NextResponse.json(
        { success: false, error: '企業一覧の取得に失敗しました', debug: { table: TABLES.COMPANIES, error } },
        { status: 500 }
      )
    }

    // シンプルなレスポンス処理
    const filteredCompanies = companies || []

    return NextResponse.json({
      success: true,
      data: filteredCompanies,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      }
    })

  } catch (error) {
    console.error('Companies fetch error:', error)
    return NextResponse.json(
      { success: false, error: '企業一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}