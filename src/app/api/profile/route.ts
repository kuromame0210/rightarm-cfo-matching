// プロフィール管理 API Route - 統一認証システム
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'
import { requireAuth } from '@/lib/auth/unified-auth'

// GET: ユーザープロフィールを取得
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 === API GET /profile: リクエスト開始 ===')
    console.log('🕐 タイムスタンプ:', new Date().toISOString())
    console.log('🍪 クッキー情報:', request.headers.get('cookie'))
    
    const { user, error: authError } = await requireAuth()
    if (authError || !user) {
      console.log('❌ API GET /profile: 認証失敗')
      return authError || NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }
    
    console.log('✅ API GET /profile: 認証成功', { userId: user.id, email: user.email })

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

    // ユーザープロフィール情報を取得（ユニーク制約により単一レコード保証）
    const { data: profileData, error: profileDataError } = await supabaseAdmin
      .from(TABLES.USER_PROFILES)
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
      address: profileData?.region || '',
      introduction: profileData?.introduction || '',
      profileImageUrl: userProfile.profile_image_url,
      status: userProfile.status,
      createdAt: userProfile.created_at,
      // CFO固有フィールドのマッピング
      ...(userProfile.user_type === 'cfo' && detailedProfile ? {
        title: detailedProfile.title || '',
        bio: detailedProfile.experience_summary || '',
        experience: detailedProfile.experience_years || null,
        specialties: detailedProfile.specialties || [],
        certifications: detailedProfile.certifications || [],
        hourlyRate: detailedProfile.hourly_rate || null,
        availabilityStatus: detailedProfile.is_available ? 'available' : 'unavailable'
      } : {}),
      // Company固有フィールドのマッピング
      ...(userProfile.user_type === 'company' && detailedProfile ? {
        companyName: detailedProfile.company_name || '',
        industry: detailedProfile.industry || '',
        employeeCount: detailedProfile.employee_count || null,
        foundedYear: detailedProfile.founded_year || null,
        website: detailedProfile.website || '',
        description: detailedProfile.description || ''
      } : {})
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
    console.log('🔍 === API PUT /profile: リクエスト開始 ===')
    console.log('🕐 タイムスタンプ:', new Date().toISOString())
    console.log('🌐 リクエストURL:', request.url)
    console.log('📋 リクエストヘッダー:', Object.fromEntries(request.headers.entries()))
    console.log('🍪 クッキー情報:', request.headers.get('cookie'))
    
    const { user, error: authError } = await requireAuth()
    if (authError || !user) {
      console.log('❌ API PUT /profile: 認証失敗')
      console.log('🚨 認証エラー詳細:', authError)
      return authError || NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }
    
    console.log('✅ API PUT /profile: 認証成功', { userId: user.id, email: user.email })

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
      displayName, // page.tsxからの互換性
      phoneNumber,
      phone, // page.tsxからの互換性
      address,
      region, // 互換性
      location, // page.tsxからの互換性
      profileImageUrl,
      // CFO固有フィールド
      title,
      bio,
      introduction, // 互換性
      experience,
      specialties,
      certifications,
      education,
      languages,
      hourlyRate,
      availabilityStatus,
      preferredWorkStyle,
      workPreference, // page.tsxからの互換性
      // Company固有フィールド
      companyName,
      company, // 互換性
      industry,
      employeeCount,
      foundedYear,
      website,
      description,
      businessModel,
      fundingStage,
      challenges,
      // その他の互換性フィールド
      skills,
      workStyle,
      compensation,
      compensationRange,
      availability,
      position
    } = body

    console.log('🔄 === プロフィール更新開始 ===')
    console.log('👤 更新対象ユーザー:', user.id, user.email, user.userType)
    console.log('📝 受信データ:', JSON.stringify(body, null, 2))
    
    // フィールドマッピングの詳細ログ
    console.log('🗺️ フィールドマッピング詳細:')
    console.log('  - name:', name, '→ display_name')
    console.log('  - phoneNumber:', phoneNumber, '→ phone_number') 
    console.log('  - address:', address, '→ region')
    console.log('  - bio:', bio, '→ introduction')
    console.log('  - profileImageUrl:', profileImageUrl, '→ profile_image_url')

    // フィールドマッピング統一処理
    console.log('🔀 フィールドマッピング統一処理開始')
    const finalName = name || displayName || 'ユーザー'
    const finalPhone = phoneNumber || phone || null
    const finalRegion = address || region || location || null
    const finalBio = bio || introduction || null
    const finalCompany = companyName || company || null
    const finalWorkPreference = workPreference || workStyle || null
    const finalCompensation = compensationRange || compensation || null
    
    // experience の年数処理（選択肢からの数値変換）
    const experienceYears = experience ? parseInt(experience.toString()) : null

    console.log('🗺️ 統一されたフィールド:')
    console.log('  - 名前:', finalName)
    console.log('  - 電話:', finalPhone)
    console.log('  - 地域:', finalRegion)
    console.log('  - 自己紹介:', finalBio)
    console.log('  - 会社:', finalCompany)
    console.log('  - 働き方:', finalWorkPreference)
    console.log('  - 報酬:', finalCompensation)
    console.log('  - 経験年数:', `"${experience}" → ${experienceYears}年`)

    // ユーザープロフィール情報を更新（display_nameが必須なので、nameが空の場合はデフォルト値を設定）
    console.log('💾 Step 1: rextrix_user_profiles テーブル更新開始')
    const userProfileData = {
      user_id: user.id,
      display_name: finalName,
      phone_number: finalPhone,
      region: finalRegion,
      introduction: finalBio,
      work_preference: finalWorkPreference,
      compensation_range: finalCompensation,
      company: finalCompany,
      position: position || null,
      experience: experienceYears,
      availability: availability || null,
      updated_at: new Date().toISOString()
    }
    console.log('📊 保存データ:', userProfileData)
    
    // upsert（user_idユニーク制約対応）
    const { error: profileUpdateError } = await supabaseAdmin
      .from(TABLES.USER_PROFILES)
      .upsert(userProfileData, {
        onConflict: 'user_id'
      })

    if (profileUpdateError) {
      console.error('❌ Step 1 失敗: rextrix_user_profiles 更新エラー:', profileUpdateError)
      return NextResponse.json(
        { success: false, error: 'プロフィール情報の更新に失敗しました', details: profileUpdateError },
        { status: 500 }
      )
    } else {
      console.log('✅ Step 1 成功: rextrix_user_profiles 更新完了')
    }

    // ユーザーの基本情報を更新（プロフィール画像のみ）
    console.log('💾 Step 2: rextrix_users テーブル更新開始')
    const userUpdateData = {
      profile_image_url: profileImageUrl,
      updated_at: new Date().toISOString()
    }
    console.log('📊 保存データ:', userUpdateData)
    
    const { error: userUpdateError } = await supabaseAdmin
      .from(TABLES.USERS)
      .update(userUpdateData)
      .eq('id', user.id)

    if (userUpdateError) {
      console.error('❌ Step 2 失敗: rextrix_users 更新エラー:', userUpdateError)
      return NextResponse.json(
        { success: false, error: 'ユーザー情報の更新に失敗しました', details: userUpdateError },
        { status: 500 }
      )
    } else {
      console.log('✅ Step 2 成功: rextrix_users 更新完了')
    }

    // ユーザータイプを取得
    console.log('🔍 ユーザータイプ確認中...')
    const { data: userData } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('user_type')
      .eq('id', user.id)
      .single()
    
    console.log('👥 ユーザータイプ:', userData?.user_type)

    // タイプ別の詳細プロフィールを更新
    if (userData?.user_type === 'cfo') {
      console.log('💾 Step 3: rextrix_cfos テーブル更新開始')
      // CFO specialties統一処理
      const finalSpecialties = specialties || skills || []
      console.log('🎯 CFO専用フィールド統一:')
      console.log('  - specialties/skills:', finalSpecialties)
      console.log('  - title:', title)
      console.log('  - bio → experience_summary:', finalBio)

      const cfoUpdateData = {
        user_id: user.id,
        title: title || null,
        experience_years: experience || null,
        experience_summary: finalBio,
        specialties: finalSpecialties,
        certifications: certifications || [],
        hourly_rate: hourlyRate || null,
        is_available: availabilityStatus === 'available' || availabilityStatus !== 'unavailable',
        updated_at: new Date().toISOString()
      }
      console.log('📊 CFO保存データ:', cfoUpdateData)
      console.log('🗺️ CFOフィールドマッピング:')
      console.log('  - title:', title, '→ title')
      console.log('  - bio:', bio, '→ experience_summary (重要!)')
      console.log('  - experience:', experience, '→ experience_years')
      console.log('  - hourlyRate:', hourlyRate, '→ hourly_rate')
      console.log('  - availabilityStatus:', availabilityStatus, '→ is_available')
      
      const { error: cfoUpdateError } = await supabaseAdmin
        .from(TABLES.CFOS)
        .upsert(cfoUpdateData)

      if (cfoUpdateError) {
        console.error('❌ Step 3 失敗: rextrix_cfos 更新エラー:', cfoUpdateError)
        return NextResponse.json(
          { success: false, error: 'CFOプロフィールの更新に失敗しました', details: cfoUpdateError },
          { status: 500 }
        )
      } else {
        console.log('✅ Step 3 成功: rextrix_cfos 更新完了')
      }
    } else if (userData?.user_type === 'company') {
      console.log('💾 Step 3: rextrix_companies テーブル更新開始')
      const companyUpdateData = {
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
      }
      console.log('📊 Company保存データ:', companyUpdateData)
      console.log('🗺️ Companyフィールドマッピング:')
      console.log('  - companyName:', companyName, '→ company_name')
      console.log('  - description:', description, '→ description')
      console.log('  - industry:', industry, '→ industry')
      
      const { error: companyUpdateError } = await supabaseAdmin
        .from(TABLES.COMPANIES)
        .upsert(companyUpdateData)

      if (companyUpdateError) {
        console.error('❌ Step 3 失敗: rextrix_companies 更新エラー:', companyUpdateError)
        return NextResponse.json(
          { success: false, error: '企業プロフィールの更新に失敗しました', details: companyUpdateError },
          { status: 500 }
        )
      } else {
        console.log('✅ Step 3 成功: rextrix_companies 更新完了')
      }
    } else {
      console.log('⚠️ Step 3 スキップ: 不明なユーザータイプまたはCFO/Company以外')
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

    console.log('🎉 === プロフィール更新完了 ===')
    console.log('✅ 全ての更新処理が正常に完了しました')
    console.log('📝 更新されたフィールド:', Object.keys(body))
    console.log('🔍 最終保存データ確認 - display_name:', finalName)
    
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