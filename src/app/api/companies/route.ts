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
    const search = searchParams.get('search')
    const revenueRange = searchParams.get('revenue_range')

    // 新アーキテクチャ: biz_profiles テーブルを使用
    let query = supabaseAdmin
      .from(TABLES.BIZ_PROFILES)
      .select('*')

    // キーワード検索（会社名・概要）
    if (search) {
      query = query.or(`biz_company_name.ilike.%${search}%,biz_raw_profile.ilike.%${search}%`)
    }

    // 年商範囲フィルタリング（既存のmin/maxカラムを使用）
    if (revenueRange) {
      // 年商範囲の値をパースして数値範囲で検索
      const revenueRangeMap: Record<string, [number, number]> = {
        'under_100m': [0, 100000000],
        '100m_1b': [100000000, 1000000000],
        '1b_10b': [1000000000, 10000000000],
        '10b_30b': [10000000000, 30000000000],
        '30b_50b': [30000000000, 50000000000],
        'over_50b': [50000000000, Number.MAX_SAFE_INTEGER]
      }
      
      const [minRevenue, maxRevenue] = revenueRangeMap[revenueRange] || [0, Number.MAX_SAFE_INTEGER]
      
      // biz_revenue_min/maxカラムでフィルタリング
      query = query
        .gte('biz_revenue_min', minRevenue)
        .lte('biz_revenue_max', maxRevenue)
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

    // JSON文字列を解析するヘルパー関数
    const parseProfileDescription = (rawProfile: string): string => {
      if (!rawProfile) return '会社概要未設定'
      
      // JSON文字列かどうか判定（{で始まる場合）
      if (rawProfile.trim().startsWith('{')) {
        try {
          const jsonData = JSON.parse(rawProfile)
          // descriptionフィールドが存在する場合はそれを使用
          return jsonData.description || jsonData.businessName || rawProfile
        } catch (e) {
          // JSON解析に失敗した場合はそのまま返す
          console.warn('JSON解析失敗:', e instanceof Error ? e.message : String(e))
          return rawProfile
        }
      }
      
      // プレーンテキストの場合はそのまま返す
      return rawProfile
    }

    // データ変換（フロントエンド互換性のため）
    const companies = (bizProfiles || []).map(profile => {
      const parsedDescription = parseProfileDescription(profile.biz_raw_profile)
      
      return {
        id: profile.biz_user_id,
        userId: profile.biz_user_id,
        companyName: profile.biz_company_name,
        location: profile.biz_location,
        revenueMin: profile.biz_revenue_min,
        revenueMax: profile.biz_revenue_max,
        issues: profile.biz_issues || [],
        description: parsedDescription,
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
      }
    })

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