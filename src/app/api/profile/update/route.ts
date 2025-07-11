// Rextrix プロフィール更新 API Route - NextAuth.js統一版
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'

export async function PUT(request: NextRequest) {
  try {
    // NextAuth.jsセッション確認
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const userEmail = session.user.email

    // リクエストボディを取得
    const body = await request.json()
    const {
      displayName,
      nickname,
      region,
      bio,
      skills,
      experience,
      workPreference,
      compensationRange,
      profileImageUrl
    } = body

    // バリデーション
    if (!displayName?.trim()) {
      return NextResponse.json(
        { success: false, error: '表示名は必須です' },
        { status: 400 }
      )
    }

    // ユーザー情報を取得
    const { data: userData, error: userError } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('id, user_type')
      .eq('email', userEmail)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, error: 'ユーザー情報が見つかりません' },
        { status: 404 }
      )
    }

    // プロフィール画像URLがある場合はユーザーテーブルを更新
    if (profileImageUrl) {
      const { error: userUpdateError } = await supabaseAdmin
        .from(TABLES.USERS)
        .update({
          profile_image_url: profileImageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.id)

      if (userUpdateError) {
        console.error('User profile image update error:', userUpdateError)
      }
    }

    // プロフィール情報を更新
    const { error: profileError } = await supabaseAdmin
      .from(TABLES.USER_PROFILES)
      .upsert({
        user_id: userData.id,
        display_name: displayName.trim(),
        nickname: nickname?.trim() || null,
        region: region || null,
        introduction: bio?.trim() || null,
        updated_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('Profile update error:', profileError)
      return NextResponse.json(
        { success: false, error: 'プロフィール情報の更新に失敗しました' },
        { status: 500 }
      )
    }

    // CFOの場合は追加情報も更新
    if (userData.user_type === 'cfo') {
      const { error: cfoError } = await supabaseAdmin
        .from(TABLES.CFOS)
        .upsert({
          user_id: userData.id,
          experience_summary: experience || null,
          updated_at: new Date().toISOString()
        })

      // user_profilesテーブルのwork_preferenceとcompensation_rangeも更新
      await supabaseAdmin
        .from(TABLES.USER_PROFILES)
        .update({
          work_preference: workPreference || null,
          compensation_range: compensationRange || null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userData.id)

      if (cfoError) {
        console.error('CFO profile update error:', cfoError)
        // CFO情報の更新は失敗してもプロフィール更新は成功とする
      }
    }

    return NextResponse.json({
      success: true,
      message: 'プロフィールを更新しました'
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { success: false, error: 'プロフィール更新中にエラーが発生しました' },
      { status: 500 }
    )
  }
}