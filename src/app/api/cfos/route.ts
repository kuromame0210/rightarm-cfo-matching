// RightArm v3 CFO一覧取得 API Route - NextAuth統一認証システム
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // NextAuth.js統一認証チェック
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // 🔍 必要最小限の検索パラメータ
    const skills = searchParams.get('skills')?.split(',').filter(Boolean) || []
    const search = searchParams.get('search') || ''
    
    // 🆕 報酬関連（プロフィール編集設計に合わせた検索）
    const compensationType = searchParams.get('compensationType') || ''
    const budgetMin = searchParams.get('budgetMin') ? parseInt(searchParams.get('budgetMin')!) : null
    const budgetMax = searchParams.get('budgetMax') ? parseInt(searchParams.get('budgetMax')!) : null
    
    // 🆕 稼働条件（選択式優先）
    const weeklyDays = searchParams.get('weeklyDays') ? parseInt(searchParams.get('weeklyDays')!) : null
    
    // 🆕 地域対応（エリア単位）
    const regions = searchParams.get('regions')?.split(',').filter(Boolean) || []

    // 基本的なフィールドのみで動作確認
    let query = supabaseAdmin
      .from(TABLES.CFO_PROFILES)
      .select(`
        cfo_user_id,
        cfo_name,
        cfo_display_name,
        cfo_location,
        cfo_availability,
        cfo_skills,
        cfo_possible_tasks,
        cfo_compensation,
        cfo_introduction,
        avatar_url
      `)

    // 基本的な検索のみ（複雑な条件は一時的に無効化）
    if (search) {
      query = query.or(`cfo_name.ilike.%${search}%,cfo_possible_tasks.ilike.%${search}%`)
    }

    // ページネーション
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: cfos, error } = await query


    if (error) {
      console.error('CFOs fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'CFO一覧の取得に失敗しました', debug: { table: TABLES.CFO_PROFILES, error } },
        { status: 500 }
      )
    }

    // 基本的なデータ変換のみ
    const transformedCFOs = (cfos || []).map((cfo: any) => {
      return {
        id: cfo.cfo_user_id,
        name: cfo.cfo_name || 'CFO',
        displayName: cfo.cfo_display_name || cfo.cfo_name || 'CFO',
        location: cfo.cfo_location || '',
        availability: cfo.cfo_availability || '',
        skills: Array.isArray(cfo.cfo_skills) ? cfo.cfo_skills : [],
        possibleTasks: cfo.cfo_possible_tasks || '',
        compensation: cfo.cfo_compensation || '',
        introduction: cfo.cfo_introduction || '',
        avatarUrl: cfo.avatar_url || '',
        photoUrl: cfo.avatar_url || '👨‍💼',
        // 後方互換性
        experience: cfo.cfo_introduction || '',
        region: cfo.cfo_location || ''
      }
    })

    return NextResponse.json({
      success: true,
      data: transformedCFOs,
      pagination: {
        page,
        limit,
        total: transformedCFOs.length,
        totalPages: Math.ceil(transformedCFOs.length / limit),
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