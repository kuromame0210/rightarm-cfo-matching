// プロフィール管理 API Route - 統一認証システム
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'
import { requireAuth } from '@/lib/auth/unified-auth'

// GET: ユーザープロフィールを取得
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError || !user) {
      return authError || NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    console.log('Fetching profile for user:', user.id)

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

    // ユーザープロフィール情報を取得
    const { data: profileData, error: profileDataError } = await supabaseAdmin
      .from('rextrix_user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // ユーザータイプに応じて詳細プロフィールを取得
    let detailedProfile = null
    let profileError = null

    if (userProfile.user_type === 'cfo') {
      const { data, error } = await supabaseAdmin
        .from(TABLES.CFOS)
        .select('*')
        .eq('user_id', user.id)
        .single()
      detailedProfile = data
      profileError = error
    } else if (userProfile.user_type === 'company') {
      const { data, error } = await supabaseAdmin
        .from(TABLES.COMPANIES)
        .select('*')
        .eq('user_id', user.id)
        .single()
      detailedProfile = data
      profileError = error
    }

    // プロフィールデータを統合
    const profile = {
      id: userProfile.id,
      email: userProfile.email,
      userType: userProfile.user_type,
      name: profileData?.display_name || '',
      phoneNumber: profileData?.phone_number || '',
      region: profileData?.region || '',
      introduction: profileData?.introduction || '',
      profileImageUrl: userProfile.profile_image_url,
      status: userProfile.status,
      createdAt: userProfile.created_at,
      ...detailedProfile
    }

    return NextResponse.json({
      success: true,
      data: profile
    })

  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json(
      { success: false, error: 'プロフィールの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// PUT: ユーザープロフィールを更新
export async function PUT(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError || !user) {
      return authError || NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'リクエストボディの形式が正しくありません' },
        { status: 400 }
      )
    }
    const { 
      name,
      phoneNumber,
      address,
      profileImageUrl,
      // CFO固有フィールド
      title,
      bio,
      experience,
      specialties,
      certifications,
      education,
      languages,
      hourlyRate,
      availabilityStatus,
      preferredWorkStyle,
      // Company固有フィールド
      companyName,
      industry,
      employeeCount,
      foundedYear,
      website,
      description,
      businessModel,
      fundingStage,
      challenges
    } = body

    console.log('Updating profile for user:', user.id)

    // ユーザープロフィール情報を更新（display_nameが必須なので、nameが空の場合はデフォルト値を設定）
    const { error: profileUpdateError } = await supabaseAdmin
      .from('rextrix_user_profiles')
      .upsert({
        user_id: user.id,
        display_name: name || 'ユーザー',
        phone_number: phoneNumber,
        region: address,
        introduction: bio,
        updated_at: new Date().toISOString()
      })

    if (profileUpdateError) {
      console.error('Profile update error:', profileUpdateError)
      return NextResponse.json(
        { success: false, error: 'プロフィール情報の更新に失敗しました' },
        { status: 500 }
      )
    }

    // ユーザーの基本情報を更新（プロフィール画像のみ）
    const { error: userUpdateError } = await supabaseAdmin
      .from(TABLES.USERS)
      .update({
        profile_image_url: profileImageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (userUpdateError) {
      console.error('User update error:', userUpdateError)
      return NextResponse.json(
        { success: false, error: 'ユーザー情報の更新に失敗しました' },
        { status: 500 }
      )
    }

    // ユーザータイプを取得
    const { data: userData } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('user_type')
      .eq('id', user.id)
      .single()

    // タイプ別の詳細プロフィールを更新
    if (userData?.user_type === 'cfo') {
      const { error: cfoUpdateError } = await supabaseAdmin
        .from(TABLES.CFOS)
        .upsert({
          user_id: user.id,
          experience_years: experience || null,
          experience_summary: bio || null,
          certifications: certifications || [],
          is_available: availabilityStatus === 'available',
          updated_at: new Date().toISOString()
        })

      if (cfoUpdateError) {
        console.error('CFO profile update error:', cfoUpdateError)
        return NextResponse.json(
          { success: false, error: 'CFOプロフィールの更新に失敗しました' },
          { status: 500 }
        )
      }
    } else if (userData?.user_type === 'company') {
      const { error: companyUpdateError } = await supabaseAdmin
        .from(TABLES.COMPANIES)
        .upsert({
          user_id: user.id,
          company_name: companyName,
          industry,
          employee_count: employeeCount,
          founded_year: foundedYear,
          website,
          description,
          business_model: businessModel,
          funding_stage: fundingStage,
          challenges,
          updated_at: new Date().toISOString()
        })

      if (companyUpdateError) {
        console.error('Company profile update error:', companyUpdateError)
        return NextResponse.json(
          { success: false, error: '企業プロフィールの更新に失敗しました' },
          { status: 500 }
        )
      }
    }

    // 活動履歴に記録
    await supabaseAdmin
      .from(TABLES.ACTIVITIES)
      .insert({
        user_id: user.id,
        activity_type: 'profile_updated',
        title: 'プロフィールを更新しました',
        description: 'プロフィール情報を最新の内容に更新しました',
        metadata: { 
          updated_fields: Object.keys(body),
          user_type: userData?.user_type 
        }
      })

    return NextResponse.json({
      success: true,
      message: 'プロフィールを更新しました'
    })

  } catch (error) {
    console.error('Profile PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'プロフィールの更新に失敗しました' },
      { status: 500 }
    )
  }
}