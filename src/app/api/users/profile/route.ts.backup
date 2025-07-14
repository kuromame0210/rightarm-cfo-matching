// RightArm v3 ユーザープロフィール API Route
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

// 認証チェック用ヘルパー関数（テーブルベース認証）
async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'fallback-secret') as any
    return { email: decoded.email }
  } catch (error) {
    return null
  }
}

// プロフィール更新用スキーマ
const updateProfileSchema = z.object({
  displayName: z.string().min(1, '表示名は必須です').optional(),
  nickname: z.string().optional(),
  introduction: z.string().optional(),
  phoneNumber: z.string().optional(),
  region: z.string().optional(),
  workPreference: z.string().optional(),
  compensationRange: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  availability: z.string().optional(),
})

// GET: プロフィール取得
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    // ユーザー基本情報取得
    const { data: userData, error: userError } = await supabaseAdmin
      .from(TABLES.USERS)
      .select(`
        id,
        email,
        user_type,
        status,
        profile_image_url,
        created_at,
        ${TABLES.USER_PROFILES} (
          display_name,
          nickname,
          introduction,
          phone_number,
          region,
          work_preference,
          compensation_range
        )
      `)
      .eq('email', user.email)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, error: 'ユーザー情報の取得に失敗しました' },
        { status: 404 }
      )
    }

    // ユーザータイプ別の詳細情報取得
    let detailData = null
    if (userData.user_type === 'company') {
      const { data: companyData } = await supabaseAdmin
        .from(TABLES.COMPANIES)
        .select(`
          *,
          ${TABLES.COMPANY_CHALLENGES} (
            ${TABLES.CHALLENGE_TAGS} (
              name
            )
          )
        `)
        .eq('user_id', userData.id)
        .single()
      
      detailData = companyData
    } else if (userData.user_type === 'cfo') {
      const { data: cfoData } = await supabaseAdmin
        .from(TABLES.CFOS)
        .select(`
          *,
          ${TABLES.CFO_SKILLS} (
            ${TABLES.SKILL_TAGS} (
              name,
              category
            )
          )
        `)
        .eq('user_id', userData.id)
        .single()
      
      detailData = cfoData
    }

    return NextResponse.json({
      success: true,
      data: {
        ...userData,
        details: detailData,
      }
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'プロフィール取得に失敗しました' },
      { status: 500 }
    )
  }
}

// PUT: プロフィール更新
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // ユーザーIDを取得
    const { data: userData } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('id')
      .eq('email', user.email)
      .single()

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'ユーザーが見つかりません' },
        { status: 404 }
      )
    }

    // プロフィール更新
    const { error: profileError } = await supabaseAdmin
      .from(TABLES.USER_PROFILES)
      .update({
        display_name: validatedData.displayName,
        nickname: validatedData.nickname,
        introduction: validatedData.introduction || validatedData.bio,
        phone_number: validatedData.phoneNumber,
        region: validatedData.region,
        work_preference: validatedData.workPreference,
        compensation_range: validatedData.compensationRange,
        company: validatedData.company,
        position: validatedData.position,
        experience: validatedData.experience,
        availability: validatedData.availability,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userData.id)

    if (profileError) {
      console.error('Profile update error:', profileError)
      return NextResponse.json(
        { success: false, error: 'プロフィール更新に失敗しました' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'プロフィールを更新しました'
    })

  } catch (error) {
    console.error('Profile update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'バリデーションエラー',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'プロフィール更新に失敗しました' },
      { status: 500 }
    )
  }
}