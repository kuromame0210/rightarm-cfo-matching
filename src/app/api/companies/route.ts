// 企業一覧取得 API Route - 新アーキテクチャ対応版
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // NextAuth.js セッションで認証確認
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    console.log('🏢 企業一覧API - 認証成功:', { userId: session.user.id })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const region = searchParams.get('region')
    const search = searchParams.get('search')

    // 新アーキテクチャ: biz_profiles テーブルを使用
    let query = supabaseAdmin
      .from(TABLES.BIZ_PROFILES)
      .select('*')

    // 地域フィルタリング
    if (region && region !== '全国') {
      query = query.ilike('biz_location', `%${region}%`)
    }

    // 検索フィルタリング
    if (search) {
      query = query.or(`biz_company_name.ilike.%${search}%,biz_raw_profile.ilike.%${search}%`)
    }

    // ページネーション
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: bizProfiles, error, count } = await query

    console.log('🏢 企業一覧取得結果:', {
      table: TABLES.BIZ_PROFILES,
      count: count,
      dataLength: bizProfiles?.length || 0,
      error: error?.message
    })

    if (error) {
      console.error('企業一覧取得エラー:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: '企業一覧の取得に失敗しました',
          debug: { table: TABLES.BIZ_PROFILES, error: error.message }
        },
        { status: 500 }
      )
    }

    // データ変換（フロントエンド互換性のため）
    const companies = (bizProfiles || []).map(profile => ({
      id: profile.biz_user_id,
      userId: profile.biz_user_id,
      companyName: profile.biz_company_name,
      location: profile.biz_location,
      revenueMin: profile.biz_revenue_min,
      revenueMax: profile.biz_revenue_max,
      issues: profile.biz_issues || [],
      description: profile.biz_raw_profile,
      avatarUrl: profile.avatar_url,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      // フロントエンド互換性フィールド
      company_name: profile.biz_company_name,
      business_name: profile.biz_company_name,
      region: profile.biz_location,
      industry: '未設定', // 新アーキテクチャでは業界フィールドなし
      is_recruiting: true, // 全企業が募集中とみなす
      profile_image_url: profile.avatar_url
    }))

    return NextResponse.json({
      success: true,
      data: companies,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      meta: {
        architecture: 'new',
        table: TABLES.BIZ_PROFILES,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('🚨 企業一覧API予期しないエラー:', error)
    return NextResponse.json(
      { success: false, error: '企業一覧の取得中にエラーが発生しました' },
      { status: 500 }
    )
  }
}