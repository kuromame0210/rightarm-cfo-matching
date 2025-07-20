// RightArm v3 CFO詳細取得 API Route
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'
import { authOptions } from '@/lib/auth/index'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
  }

  try {
    const { id: cfoId } = await params

    if (!cfoId) {
      return NextResponse.json(
        { success: false, error: 'CFO IDが指定されていません' },
        { status: 400 }
      )
    }

    // 新アーキテクチャ: cfo_profiles テーブルからCFO情報を取得
    const { data: cfo, error: cfoError } = await supabaseAdmin
      .from(TABLES.CFO_PROFILES)
      .select('*')
      .eq('cfo_user_id', cfoId)
      .single()

    if (cfoError || !cfo) {
      console.error('CFO not found:', cfoError)
      return NextResponse.json(
        { success: false, error: 'CFOが見つかりません' },
        { status: 404 }
      )
    }

    // 統合テーブルには全データが含まれているため、追加クエリ不要

    // 新アーキテクチャ: messages テーブルでスカウト状態を確認
    const { data: existingScout } = await supabaseAdmin
      .from(TABLES.MESSAGES)
      .select('msg_id, body, sent_at')
      .eq('sender_id', session.user.id)
      .eq('receiver_id', cfo?.cfo_user_id || cfoId)
      .eq('msg_type', 'scout')
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    // 新アーキテクチャ: likes テーブルでいいね状態を確認
    const { data: existingLike } = await supabaseAdmin
      .from(TABLES.LIKES)
      .select('created_at')
      .eq('liker_id', session.user.id)
      .eq('target_id', cfo?.cfo_user_id || cfoId)
      .maybeSingle()

    // スカウト状態の判定（新アーキテクチャ対応）
    let scoutStatus = 'not_sent' // 未送信
    let scoutStatusText = 'スカウト可能'
    
    if (existingScout) {
      scoutStatus = 'sent'
      scoutStatusText = 'スカウト送信済み'
    }

    // 設計書準拠のCFOデータ整形（TEXT中心・JSONB配列対応）
    const transformedCFO = {
      id: cfo.cfo_user_id,
      userId: cfo.cfo_user_id,
      // 基本情報
      name: cfo.cfo_display_name || cfo.cfo_name || 'CFO',
      displayName: cfo.cfo_display_name || cfo.cfo_name || 'CFO',
      location: cfo.cfo_location || '',
      avatarUrl: cfo.avatar_url || '',
      photoUrl: cfo.avatar_url || '👨‍💼',
      // 専門分野（JSONB配列）
      skills: Array.isArray(cfo.cfo_skills) ? cfo.cfo_skills : [],
      // TEXT中心の詳細情報
      possibleTasks: cfo.cfo_possible_tasks || '',
      certifications: cfo.cfo_certifications || '',
      workingAreas: cfo.cfo_working_areas || '',
      compensation: cfo.cfo_compensation || '',
      availability: cfo.cfo_availability || '',
      introduction: cfo.cfo_introduction || '',
      rawProfile: cfo.cfo_raw_profile || '',
      // 🆕 構造化フィールド
      structured: {
        compensationType: cfo.compensation_type || null,
        monthlyFeeMin: cfo.monthly_fee_min || null,
        monthlyFeeMax: cfo.monthly_fee_max || null,
        hourlyRateMin: cfo.hourly_rate_min || null,
        hourlyRateMax: cfo.hourly_rate_max || null,
        weeklyDays: cfo.weekly_days || null,
        weeklyDaysFlexible: cfo.weekly_days_flexible || false,
        dailyHours: cfo.daily_hours || null,
        dailyHoursFlexible: cfo.daily_hours_flexible || false,
        supportedPrefectures: Array.isArray(cfo.supported_prefectures) ? cfo.supported_prefectures : [],
        fullRemoteAvailable: cfo.full_remote_available || false,
        preferredTimeSlots: Array.isArray(cfo.preferred_time_slots) ? cfo.preferred_time_slots : [],
        workStyles: Array.isArray(cfo.work_styles) ? cfo.work_styles : [],
        businessTripLevel: cfo.business_trip_level || null,
        cfoExperienceYears: cfo.cfo_experience_years || null,
        cfoLevel: cfo.cfo_level || null,
        industryExperience: Array.isArray(cfo.industry_experience) ? cfo.industry_experience : [],
        companySizeExperience: Array.isArray(cfo.company_size_experience) ? cfo.company_size_experience : [],
        projectExperience: Array.isArray(cfo.project_experience) ? cfo.project_experience : []
      },
      // システム情報（lastLoginは削除 - 実データなし）
      createdAt: cfo.created_at,
      updatedAt: cfo.updated_at,
      // インタラクション状態
      scoutStatus: scoutStatus,
      scoutStatusText: scoutStatusText,
      canSendScout: scoutStatus === 'not_sent',
      existingScoutId: existingScout?.msg_id || null,
      isLiked: !!existingLike
    }

    return NextResponse.json({
      success: true,
      data: transformedCFO
    })

  } catch (error) {
    console.error('CFO detail fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'CFO詳細の取得に失敗しました' },
      { status: 500 }
    )
  }
}