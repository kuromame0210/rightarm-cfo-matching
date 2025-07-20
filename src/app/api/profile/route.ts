// プロフィール管理 API Route - 新アーキテクチャ対応版
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET: ユーザープロフィールを取得
export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 9)
  try {
    console.log(`🔍 === API[${requestId}] GET /profile: リクエスト開始 ===`)
    console.log(`🕐 API[${requestId}] タイムスタンプ:`, new Date().toISOString())
    console.log(`🔗 API[${requestId}] Request URL:`, request.url)
    console.log(`🍪 API[${requestId}] Request headers:`, {
      cookie: request.headers.get('cookie') ? 'Present' : 'None',
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer')
    })
    
    // NextAuth.js セッションで認証確認
    console.log(`🔐 API[${requestId}] Checking NextAuth session...`)
    const session = await getServerSession(authOptions)
    
    console.log(`🔐 API[${requestId}] Session result:`, {
      hasSession: !!session,
      hasUser: !!session?.user,
      hasUserId: !!session?.user?.id,
      userEmail: session?.user?.email || 'none',
      userType: session?.user?.userType || 'none',
      sessionKeys: session ? Object.keys(session) : []
    })
    
    if (!session?.user?.id) {
      console.log(`❌ API[${requestId}] GET /profile: 認証失敗 - セッションまたはユーザーIDなし`)
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    console.log(`✅ API[${requestId}] GET /profile: 認証成功`, { 
      userId: session.user.id, 
      email: session.user.email,
      userType: session.user.userType 
    })

    const userId = session.user.id

    // ユーザータイプに応じてプロフィールを取得
    let profile = null
    let profileError = null

    console.log(`📊 API[${requestId}] Starting database query for userType: ${session.user.userType}`)

    if (session.user.userType === 'cfo') {
      // CFOプロフィールを取得
      console.log(`🔍 API[${requestId}] Querying CFO profile for userId: ${userId}`)
      const { data, error } = await supabaseAdmin
        .from(TABLES.CFO_PROFILES)
        .select('*')
        .eq('cfo_user_id', userId)
        .single()
      
      console.log(`📊 API[${requestId}] CFO query result:`, {
        hasData: !!data,
        hasError: !!error,
        errorCode: error?.code,
        errorMessage: error?.message,
        dataKeys: data ? Object.keys(data) : []
      })
      
      if (data) {
        profile = {
          id: userId,
          email: session.user.email,
          userType: 'cfo',
          name: data.cfo_display_name || data.cfo_name || session.user.email?.split('@')[0] || 'CFOユーザー',
          location: data.cfo_location || '',
          availability: data.cfo_availability || '',
          feeMin: data.cfo_fee_min ? Math.floor(Number(data.cfo_fee_min) / 10000) : null, // 円を万円に変換
          feeMax: data.cfo_fee_max ? Math.floor(Number(data.cfo_fee_max) / 10000) : null,
          skills: data.cfo_skills || [],
          rawProfile: data.cfo_raw_profile || '',
          // 新しいカラムから直接データを取得
          compensation: data.cfo_compensation || '',
          possibleTasks: data.cfo_possible_tasks || '',
          certifications: data.cfo_certifications || '',
          workingAreas: data.cfo_working_areas || '',
          introduction: data.cfo_introduction || '',
          avatarUrl: data.avatar_url || '',
          // 🆕 構造化フィールドの取得を追加
          compensationType: data.compensation_type || '',
          monthlyFeeMin: data.monthly_fee_min || '',
          monthlyFeeMax: data.monthly_fee_max || '',
          weeklyDays: data.weekly_days || '',
          weeklyDaysFlexible: data.weekly_days_flexible || false,
          supportedPrefectures: data.supported_prefectures || [],
          fullRemoteAvailable: data.full_remote_available || false,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        }
      }
      profileError = error
    } else if (session.user.userType === 'company') {
      // 企業プロフィールを取得
      console.log(`🔍 API[${requestId}] Querying company profile for userId: ${userId}`)
      const { data, error } = await supabaseAdmin
        .from(TABLES.BIZ_PROFILES)
        .select('*')
        .eq('biz_user_id', userId)
        .single()
      
      console.log(`📊 API[${requestId}] Company query result:`, {
        hasData: !!data,
        hasError: !!error,
        errorCode: error?.code,
        errorMessage: error?.message,
        dataKeys: data ? Object.keys(data) : []
      })
      
      if (data) {
        profile = {
          id: userId,
          email: session.user.email,
          userType: 'company',
          name: data.biz_company_name || session.user.email?.split('@')[0] || '企業ユーザー',
          companyName: data.biz_company_name || '',
          location: data.biz_location || '',
          revenueMin: data.biz_revenue_min,
          revenueMax: data.biz_revenue_max,
          issues: data.biz_issues || [],
          // 企業の4項目に対応（カラムが存在しない場合は既存データから生成）
          description: data.biz_description || String(data.biz_raw_profile || '').substring(0, 500) || '',
          revenueRange: data.biz_revenue_range || (data.biz_revenue_min && data.biz_revenue_max ? 
            `${data.biz_revenue_min}円 〜 ${data.biz_revenue_max}円` : ''),
          challengeBackground: data.biz_challenge_background || (data.biz_issues && Array.isArray(data.biz_issues) && data.biz_issues.length > 0 ? 
            `主要課題: ${data.biz_issues.join(', ')}` : ''),
          rawProfile: data.biz_raw_profile || '',
          avatarUrl: data.avatar_url || '',
          createdAt: data.created_at,
          updatedAt: data.updated_at
        }
      }
      profileError = error
    }

    if (profileError) {
      console.error(`❌ API[${requestId}] Supabase Profile fetch error:`, {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
        userId: userId,
        userType: session.user.userType,
        table: session.user.userType === 'cfo' ? TABLES.CFO_PROFILES : TABLES.BIZ_PROFILES,
        timestamp: new Date().toISOString()
      })
      
      // Supabaseエラーの詳細をクライアントに返す（開発環境のみ）
      const errorDetail = process.env.NODE_ENV === 'development' ? 
        `${profileError.message} (${profileError.code})` : 
        'プロフィール情報の取得に失敗しました'
      
      return NextResponse.json(
        { success: false, error: errorDetail, debugInfo: process.env.NODE_ENV === 'development' ? profileError : undefined },
        { status: 500 }
      )
    }

    if (!profile) {
      console.log(`⚠️ API[${requestId}] Profile not found, returning default profile`)
      // プロフィールが存在しない場合のデフォルト値
      profile = {
        id: userId,
        email: session.user.email,
        userType: session.user.userType,
        name: session.user.email?.split('@')[0] || 'ユーザー',
        hasProfile: false
      }
    } else {
      (profile as any).hasProfile = true
    }

    console.log(`✅ API[${requestId}] GET /profile: プロフィール取得成功`, {
      userId: profile.id,
      userType: profile.userType,
      hasProfile: profile.hasProfile
    })

    return NextResponse.json({
      success: true,
      profile
    })

  } catch (error) {
    console.error(`❌ API[${requestId}] GET /profile: 予期しないエラー`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    })
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

// PUT: プロフィールを更新
export async function PUT(request: NextRequest) {
  try {
    // NextAuth.js セッションで認証確認
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const body = await request.json()

    let updateResult = null
    let updateError = null

    if (session.user.userType === 'cfo') {
      // CFOプロフィールの更新（新しいカラム構造対応）
      const updateData = {
        cfo_name: body.name,
        cfo_display_name: body.name,
        cfo_location: body.location,
        cfo_availability: body.weeklyAvailability || body.availability,
        cfo_fee_min: body.monthlyFeeMin ? parseInt(body.monthlyFeeMin) * 10000 : null, // 万円を円に変換
        cfo_fee_max: body.monthlyFeeMax === '成果報酬応相談' ? null : (body.monthlyFeeMax && !isNaN(parseInt(body.monthlyFeeMax)) ? parseInt(body.monthlyFeeMax) * 10000 : null),
        cfo_skills: body.skills || [],
        cfo_raw_profile: body.career || body.rawProfile || '',
        // 新しいカラムに直接保存
        cfo_compensation: body.compensation || '',
        cfo_possible_tasks: body.possibleTasks || '',
        cfo_certifications: body.certifications || '',
        cfo_working_areas: body.workingAreas || '',
        cfo_introduction: body.introduction || '',
        avatar_url: body.avatarUrl,
        // 🆕 構造化フィールドの保存を追加
        compensation_type: body.compensationType || null,
        monthly_fee_min: body.monthlyFeeMin || null,
        monthly_fee_max: body.monthlyFeeMax || null,
        weekly_days: body.weeklyDays || null,
        weekly_days_flexible: body.weeklyDaysFlexible || false,
        supported_prefectures: body.supportedPrefectures || [],
        full_remote_available: body.fullRemoteAvailable || false,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabaseAdmin
        .from(TABLES.CFO_PROFILES)
        .upsert({
          cfo_user_id: userId,
          ...updateData
        })
        .select()
        .single()

      updateResult = data
      updateError = error

    } else if (session.user.userType === 'company') {
      // 企業プロフィールの更新
      
      // 企業の4項目データを biz_raw_profile に JSON 形式で保存
      const businessData = {
        businessName: body.companyName || body.name,
        displayName: body.companyName || body.name,
        description: body.description || '',
        revenueRange: body.revenueRange || '',
        financialChallengesDetail: body.challengeBackground || ''
      }
      
      const updateData = {
        biz_company_name: body.companyName || body.name,
        biz_location: body.location,
        biz_revenue_min: body.revenueMin ? parseInt(body.revenueMin) : null,
        biz_revenue_max: body.revenueMax ? parseInt(body.revenueMax) : null,
        biz_issues: body.issues || [],
        // 企業の4項目を JSON として biz_raw_profile に保存
        biz_raw_profile: JSON.stringify(businessData),
        avatar_url: body.avatarUrl,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabaseAdmin
        .from(TABLES.BIZ_PROFILES)
        .upsert({
          biz_user_id: userId,
          ...updateData
        })
        .select()
        .single()

      updateResult = data
      updateError = error
    }

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'プロフィール更新に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'プロフィールが更新されました',
      profile: updateResult
    })

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}