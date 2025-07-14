// 最適化プロフィール管理 API Route - 統合テーブル + JSONB対応
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'
import { requireAuth } from '@/lib/auth/unified-auth'

// JSONB フィールドのデフォルト値
const DEFAULT_LOCATION_DATA = {
  address: null,
  prefecture: null,
  region: null,
  remote_available: true,
  onsite_available: false,
  service_areas: [],
  travel_time_max: null,
  additional_cost: null
}

const DEFAULT_AVAILABILITY = {
  days_per_week: null,
  hours_per_day: null,
  start_time: null,
  end_time: null,
  total_hours_per_week: null,
  flexible_schedule: false,
  preferred_days: [],
  available_from: null,
  notes: null
}

const DEFAULT_COMPENSATION = {
  primary_type: 'hourly',
  hourly_rate: { min: null, max: null },
  monthly_rate: { min: null, max: null },
  project_rate: { min: null, max: null },
  performance_bonus_available: false,
  negotiable: true,
  currency: 'JPY',
  payment_terms: null,
  notes: null
}

// GET: ユーザープロフィールを取得（最適化版）
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 === API GET /profile-v2: リクエスト開始 ===')
    console.log('🕐 タイムスタンプ:', new Date().toISOString())
    
    const { user, error: authError } = await requireAuth()
    if (authError || !user) {
      console.log('❌ API GET /profile-v2: 認証失敗')
      return authError || NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }
    
    console.log('✅ API GET /profile-v2: 認証成功', { userId: user.id, email: user.email })

    // ユーザーの基本情報を取得
    const { data: userProfile, error: userError } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('*')
      .eq('id', user.id)
      .single()

    if (userError) {
      console.error('User profile fetch error:', userError)
      return NextResponse.json(
        { success: false, error: 'ユーザー情報の取得に失敗しました' },
        { status: 500 }
      )
    }

    // 最適化されたプロフィールテーブルから取得
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('rextrix_profiles_v2')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // プロフィールが存在しない場合は空のプロフィールを返す
    if (profileError && profileError.code === 'PGRST116') {
      console.log('⚠️ プロフィールが見つかりません - 新規作成が必要')
      return NextResponse.json({
        success: true,
        data: {
          id: userProfile.id,
          email: userProfile.email,
          userType: userProfile.user_type || 'cfo',
          name: userProfile.name || '',
          phoneNumber: '',
          address: '',
          introduction: '',
          profileImageUrl: userProfile.profile_image_url,
          status: userProfile.status,
          createdAt: userProfile.created_at,
          isNewProfile: true
        }
      })
    }

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { success: false, error: 'プロフィール情報の取得に失敗しました' },
        { status: 500 }
      )
    }

    // JSONBフィールドを安全に取得
    const locationData = profileData.location_data || DEFAULT_LOCATION_DATA
    const availability = profileData.availability || DEFAULT_AVAILABILITY
    const compensation = profileData.compensation || DEFAULT_COMPENSATION
    const workExperiences = profileData.work_experiences || []
    const certifications = profileData.certifications || []

    // プロフィールデータを統合（後方互換性を保持）
    const profile = {
      id: profileData.id,
      email: profileData.email || userProfile.email,
      userType: profileData.profile_type,
      name: profileData.display_name || '',
      phoneNumber: profileData.phone_number || '',
      address: locationData.address || locationData.prefecture || '',
      introduction: profileData.description || '',
      profileImageUrl: profileData.profile_image_url || userProfile.profile_image_url,
      status: profileData.status,
      createdAt: profileData.created_at,
      
      // 地域・エリア情報
      prefecture: locationData.prefecture,
      region: locationData.region,
      remoteAvailable: locationData.remote_available,
      onsiteAvailable: locationData.onsite_available,
      serviceAreas: locationData.service_areas,
      
      // CFO固有フィールド
      ...(profileData.profile_type === 'cfo' ? {
        title: profileData.specialization || '',
        bio: profileData.achievement_summary || profileData.description || '',
        experience: profileData.experience_years || null,
        totalExperience: profileData.years_of_total_experience || null,
        specialties: Array.isArray(profileData.specialization) 
          ? profileData.specialization 
          : profileData.specialization ? [profileData.specialization] : [],
        certifications: certifications,
        workExperiences: workExperiences,
        linkedinUrl: profileData.linkedin_url,
        clientMessage: profileData.client_message,
        consultationApproach: profileData.consultation_approach,
        
        // 稼働条件
        daysPerWeek: availability.days_per_week,
        hoursPerDay: availability.hours_per_day,
        totalHoursPerWeek: availability.total_hours_per_week,
        flexibleSchedule: availability.flexible_schedule,
        preferredDays: availability.preferred_days,
        availableFrom: availability.available_from,
        
        // 報酬設定
        hourlyRate: compensation.hourly_rate?.min || null,
        hourlyRateMax: compensation.hourly_rate?.max || null,
        monthlyRate: compensation.monthly_rate?.min || null,
        projectRate: compensation.project_rate?.min || null,
        performanceBonusAvailable: compensation.performance_bonus_available,
        negotiable: compensation.negotiable,
        paymentTerms: compensation.payment_terms,
        compensationType: compensation.primary_type,
        
        availabilityStatus: profileData.is_available ? 'available' : 'unavailable'
      } : {}),
      
      // Company固有フィールド
      ...(profileData.profile_type === 'company' ? {
        companyName: profileData.company_name || '',
        industry: profileData.industry || '',
        companySize: profileData.company_size || '',
        employeeCount: profileData.employee_count || null,
        annualRevenue: profileData.annual_revenue || null,
        website: profileData.website_url || '',
        description: profileData.description || '',
        businessChallenges: profileData.business_challenges || []
      } : {}),
      
      // 共通フィールド
      workPreference: profileData.work_preference || 'hybrid',
      isActive: profileData.is_active,
      isAvailable: profileData.is_available
    }

    return NextResponse.json({
      success: true,
      data: profile
    })

  } catch (error) {
    console.error('Profile GET v2 error:', error)
    return NextResponse.json(
      { success: false, error: 'プロフィールの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// PUT: ユーザープロフィールを更新（最適化版）
export async function PUT(request: NextRequest) {
  try {
    console.log('🔍 === API PUT /profile-v2: リクエスト開始 ===')
    console.log('🕐 タイムスタンプ:', new Date().toISOString())
    
    const { user, error: authError } = await requireAuth()
    if (authError || !user) {
      console.log('❌ API PUT /profile-v2: 認証失敗')
      return authError || NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }
    
    console.log('✅ API PUT /profile-v2: 認証成功', { userId: user.id, email: user.email })

    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'リクエストボディの形式が正しくありません' },
        { status: 400 }
      )
    }

    console.log('📝 受信データ:', JSON.stringify(body, null, 2))

    // ユーザータイプを確認
    const { data: userData } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('user_type')
      .eq('id', user.id)
      .single()

    const userType = userData?.user_type || 'cfo'
    console.log('👥 ユーザータイプ:', userType)

    // フィールドマッピング統一処理（後方互換性）
    const {
      name, displayName,
      phoneNumber, phone,
      address, region, location, prefecture,
      introduction, bio, description,
      profileImageUrl,
      
      // CFO固有フィールド
      title, specialization,
      experience, experienceYears,
      totalExperience, yearsOfTotalExperience,
      specialties, skills,
      certifications,
      workExperiences,
      linkedinUrl,
      clientMessage,
      consultationApproach,
      
      // 稼働条件
      daysPerWeek, hoursPerDay, totalHoursPerWeek,
      flexibleSchedule, preferredDays, availableFrom,
      availability, availabilityNotes,
      
      // 報酬設定
      hourlyRate, hourlyRateMin, hourlyRateMax,
      monthlyRate, monthlyRateMin, monthlyRateMax,
      projectRate,
      performanceBonusAvailable,
      negotiable, compensationType,
      paymentTerms, compensationNotes,
      compensation, compensationRange,
      
      // エリア・地域
      remoteAvailable, onsiteAvailable,
      serviceAreas,
      
      // 企業固有フィールド
      companyName, company,
      industry,
      companySize, employeeCount, annualRevenue,
      website, websiteUrl,
      businessChallenges,
      
      // ステータス
      availabilityStatus,
      workPreference, workStyle,
      isActive, isAvailable
    } = body

    // 統一されたフィールド値
    const finalName = name || displayName || 'ユーザー'
    const finalPhone = phoneNumber || phone || null
    const finalDescription = description || bio || introduction || null
    const finalCompanyName = companyName || company || null
    const finalSpecialization = specialization || title || null
    const finalWebsite = website || websiteUrl || null

    // JSONB構造の構築
    const locationData = {
      ...DEFAULT_LOCATION_DATA,
      address: address || location || null,
      prefecture: prefecture || region || null,
      region: region || prefecture || null,
      remote_available: remoteAvailable !== undefined ? remoteAvailable : true,
      onsite_available: onsiteAvailable !== undefined ? onsiteAvailable : false,
      service_areas: Array.isArray(serviceAreas) ? serviceAreas : []
    }

    const availabilityData = {
      ...DEFAULT_AVAILABILITY,
      days_per_week: daysPerWeek || null,
      hours_per_day: hoursPerDay || null,
      total_hours_per_week: totalHoursPerWeek || null,
      flexible_schedule: flexibleSchedule || false,
      preferred_days: Array.isArray(preferredDays) ? preferredDays : [],
      available_from: availableFrom || null,
      notes: availabilityNotes || null
    }

    const compensationData = {
      ...DEFAULT_COMPENSATION,
      primary_type: compensationType || 'hourly',
      hourly_rate: {
        min: hourlyRateMin || hourlyRate || null,
        max: hourlyRateMax || hourlyRate || null
      },
      monthly_rate: {
        min: monthlyRateMin || monthlyRate || null,
        max: monthlyRateMax || monthlyRate || null
      },
      project_rate: {
        min: projectRate || null,
        max: projectRate || null
      },
      performance_bonus_available: performanceBonusAvailable || false,
      negotiable: negotiable !== undefined ? negotiable : true,
      payment_terms: paymentTerms || null,
      notes: compensationNotes || compensationRange || compensation || null
    }

    // プロフィールデータの構築
    const profileData = {
      user_id: user.id,
      profile_type: userType,
      display_name: finalName,
      email: user.email,
      phone_number: finalPhone,
      profile_image_url: profileImageUrl,
      description: finalDescription,
      location_data: locationData,
      is_active: isActive !== undefined ? isActive : true,
      is_available: isAvailable !== undefined ? isAvailable : (availabilityStatus !== 'unavailable'),
      work_preference: workPreference || workStyle || 'hybrid',
      status: 'active',
      updated_at: new Date().toISOString()
    }

    // CFO専用フィールド
    if (userType === 'cfo') {
      Object.assign(profileData, {
        experience_years: parseInt(experience?.toString()) || experienceYears || null,
        years_of_total_experience: totalExperience || yearsOfTotalExperience || null,
        specialization: finalSpecialization,
        achievement_summary: finalDescription,
        linkedin_url: linkedinUrl,
        client_message: clientMessage,
        consultation_approach: consultationApproach,
        work_experiences: Array.isArray(workExperiences) ? workExperiences : [],
        certifications: Array.isArray(certifications) ? certifications : [],
        availability: availabilityData,
        compensation: compensationData
      })
    }

    // 企業専用フィールド
    if (userType === 'company') {
      Object.assign(profileData, {
        company_name: finalCompanyName,
        industry: industry,
        company_size: companySize,
        employee_count: employeeCount,
        annual_revenue: annualRevenue,
        website_url: finalWebsite,
        business_challenges: Array.isArray(businessChallenges) ? businessChallenges : []
      })
    }

    console.log('💾 最適化プロフィール更新開始')
    console.log('📊 保存データ:', JSON.stringify(profileData, null, 2))

    // upsert（user_id + profile_typeユニーク制約対応）
    const { error: profileUpdateError } = await supabaseAdmin
      .from('rextrix_profiles_v2')
      .upsert(profileData, {
        onConflict: 'user_id,profile_type'
      })

    if (profileUpdateError) {
      console.error('❌ rextrix_profiles_v2 更新エラー:', profileUpdateError)
      return NextResponse.json(
        { success: false, error: 'プロフィール情報の更新に失敗しました', details: profileUpdateError },
        { status: 500 }
      )
    }

    console.log('✅ rextrix_profiles_v2 更新完了')

    // ユーザーテーブルのプロフィール画像も更新
    if (profileImageUrl) {
      await supabaseAdmin
        .from(TABLES.USERS)
        .update({
          profile_image_url: profileImageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
    }

    // 活動履歴に記録
    await supabaseAdmin
      .from(TABLES.ACTIVITIES)
      .insert({
        user_id: user.id,
        activity_type: 'profile_updated',
        title: 'プロフィールを更新しました（最適化版）',
        description: '最適化されたプロフィール情報を更新しました',
        metadata: { 
          updated_fields: Object.keys(body),
          user_type: userType,
          schema_version: 'v2'
        }
      })

    console.log('🎉 === プロフィール更新完了（最適化版） ===')
    console.log('✅ 統合テーブル + JSONB活用による更新処理が正常に完了しました')
    
    return NextResponse.json({
      success: true,
      message: 'プロフィールを更新しました（最適化版）'
    })

  } catch (error) {
    console.error('Profile PUT v2 error:', error)
    return NextResponse.json(
      { success: false, error: 'プロフィールの更新に失敗しました' },
      { status: 500 }
    )
  }
}