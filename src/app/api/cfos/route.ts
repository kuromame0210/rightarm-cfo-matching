// RightArm v3 CFO一覧取得 API Route - 統一認証システム
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
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
    // const region = searchParams.get('region') // 将来のフィルタリング用
    // const skills = searchParams.get('skills')?.split(',') // 将来のフィルタリング用
    // const search = searchParams.get('search') // 将来の検索用
    const available = searchParams.get('available')

    // 新アーキテクチャ: cfo_profiles テーブルからCFOプロフィールを取得
    const query = supabaseAdmin
      .from(TABLES.CFO_PROFILES)
      .select('*')

    // 新アーキテクチャでは is_available フィールドはないため、フィルタリングを削除
    // available フィルタリングは現在無効化

    // シンプルなフィルタリングのみ
    // if (available === 'true') {
    //   query = query.eq('is_available', true)
    // }

    // 簡易クエリ実行（ページネーション一時的に無効化）
    const { data: cfos, error, count } = await query

    // デバッグ情報を追加
    console.log('CFO API Debug:', {
      table: TABLES.CFO_PROFILES,
      count: count,
      dataLength: cfos?.length || 0,
      error: error,
      actualData: cfos?.map(cfo => ({
        id: cfo.cfo_user_id,
        user_id: cfo.cfo_user_id,
        keys: Object.keys(cfo)
      }))
    })

    if (error) {
      console.error('CFOs fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'CFO一覧の取得に失敗しました', debug: { table: TABLES.CFO_PROFILES, error } },
        { status: 500 }
      )
    }

    // 新アーキテクチャ: cfo_profiles テーブルからデータを取得（設計書準拠）
    const transformedCFOs = (cfos || []).map((cfo: any) => {
      return {
        id: cfo.cfo_user_id,
        name: cfo.cfo_name || 'CFO',
        displayName: cfo.cfo_display_name || cfo.cfo_name || 'CFO',
        location: cfo.cfo_location || '',
        availability: cfo.cfo_availability || '',
        skills: Array.isArray(cfo.cfo_skills) ? cfo.cfo_skills : [],
        possibleTasks: cfo.cfo_possible_tasks || '',
        certifications: cfo.cfo_certifications || '',
        workingAreas: cfo.cfo_working_areas || '',
        compensation: cfo.cfo_compensation || '',
        introduction: cfo.cfo_introduction || '',
        rawProfile: cfo.cfo_raw_profile || '',
        avatarUrl: cfo.avatar_url || '',
        photoUrl: cfo.avatar_url || '👨‍💼',
        // 後方互換性のための追加フィールド
        experience: cfo.cfo_raw_profile || '',
        region: cfo.cfo_location || ''
      }
    })

    return NextResponse.json({
      success: true,
      data: transformedCFOs,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      }
    })

  } catch (error) {
    console.error('CFOs fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'CFO一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}