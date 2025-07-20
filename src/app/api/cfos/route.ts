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

    // 新アーキテクチャ: cfo_profiles テーブルからCFOプロフィールを取得
    // 🚀 最適化: 必要なカラムのみ選択してネットワーク転送量削減
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
        cfo_certifications,
        cfo_working_areas,
        cfo_compensation,
        cfo_introduction,
        cfo_raw_profile,
        avatar_url,
        compensation_type,
        hourly_rate_min,
        hourly_rate_max,
        monthly_fee_min,
        monthly_fee_max,
        weekly_days,
        daily_hours,
        work_styles,
        supported_prefectures,
        cfo_level,
        cfo_experience_years,
        industry_experience,
        company_size_experience,
        project_experience,
        business_trip_level,
        full_remote_available,
        weekly_days_flexible
      `)

    // 🔍 スキル検索（JSONB配列対応）- レガシーデータも含める
    if (skills.length > 0) {
      const skillConditions = skills.map(skill => 
        `cfo_skills.cs.[\"${skill}\"]`
      ).join(',')
      query = query.or(skillConditions)
    }

    // 🔍 キーワード検索（名前・業務のみ）- 補完的
    if (search) {
      query = query.or(`cfo_name.ilike.%${search}%,cfo_possible_tasks.ilike.%${search}%`)
    }

    // 🆕 報酬検索（企業予算視点の正確な判定）
    if (compensationType === 'negotiable') {
      // 応相談のCFO：構造化データ + レガシーテキスト検索
      query = query.or(`compensation_type.eq.negotiable,cfo_compensation.ilike.%応相談%`)
    } else if (compensationType === 'monthly') {
      // 月額制のCFO：企業予算がCFOの希望範囲内にあるかを正確に判定
      
      if (budgetMax !== null) {
        // 企業予算上限内で収まるCFOを検索
        // 条件: 企業予算 >= CFOの下限 AND 企業予算 >= CFOの上限（または上限未設定）
        
        // 構造化データとレガシーデータの条件を分けて処理
        query = query.or(
          `and(compensation_type.eq.monthly,monthly_fee_min.lte.${budgetMax},or(monthly_fee_max.lte.${budgetMax},monthly_fee_max.is.null)),` +
          `and(compensation_type.is.null,cfo_fee_min.lte.${budgetMax},or(cfo_fee_max.lte.${budgetMax},cfo_fee_max.is.null))`
        )
      } 
      
      if (budgetMin !== null) {
        // 企業が最低予算以上出せる場合（現在は使用しない - 250万円以下まで対応）
        query = query.or(
          `and(compensation_type.eq.monthly,monthly_fee_min.gte.${budgetMin}),` +
          `and(compensation_type.is.null,cfo_fee_min.gte.${budgetMin})`
        )
      }
      
      // 予算指定がない場合は月額制CFO全て
      if (budgetMax === null && budgetMin === null) {
        query = query.or(`compensation_type.eq.monthly,compensation_type.is.null`)
      }
    }

    // 🆕 稼働条件検索（選択式優先、テキスト検索は除外）
    if (weeklyDays !== null) {
      query = query.or(`weekly_days.eq.${weeklyDays},weekly_days_flexible.eq.true`)
    }

    // 🆕 地域検索（エリア単位、選択式優先）
    if (regions.length > 0) {
      // エリア検索（選択式データ優先、テキストは補完）
      query = query.or(
        `supported_prefectures.ov.{${regions.join(',')}}` +
        (regions.includes('nationwide') ? ',full_remote_available.eq.true' : '') +
        // エリア名での部分一致検索も追加（テキストデータの補完）
        (regions.includes('kanto') ? ',cfo_location.ilike.%関東%,cfo_location.ilike.%東京%' : '') +
        (regions.includes('kansai') ? ',cfo_location.ilike.%関西%,cfo_location.ilike.%大阪%' : '') +
        (regions.includes('chubu') ? ',cfo_location.ilike.%中部%,cfo_location.ilike.%愛知%' : '')
      )
    }

    // ページネーション
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: cfos, error, count } = await query


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
        // 🆕 構造化データフィールド
        structured: {
          compensationType: cfo.compensation_type || null,
          hourlyRateMin: cfo.hourly_rate_min || null,
          hourlyRateMax: cfo.hourly_rate_max || null,
          monthlyFeeMin: cfo.monthly_fee_min || null,
          monthlyFeeMax: cfo.monthly_fee_max || null,
          weeklyDays: cfo.weekly_days || null,
          dailyHours: cfo.daily_hours || null,
          workStyles: Array.isArray(cfo.work_styles) ? cfo.work_styles : [],
          supportedPrefectures: Array.isArray(cfo.supported_prefectures) ? cfo.supported_prefectures : [],
          cfoLevel: cfo.cfo_level || null,
          experienceYears: cfo.cfo_experience_years || null,
          industryExperience: Array.isArray(cfo.industry_experience) ? cfo.industry_experience : [],
          companySizeExperience: Array.isArray(cfo.company_size_experience) ? cfo.company_size_experience : [],
          projectExperience: Array.isArray(cfo.project_experience) ? cfo.project_experience : [],
          businessTripLevel: cfo.business_trip_level || null,
          fullRemoteAvailable: cfo.full_remote_available || false
        },
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