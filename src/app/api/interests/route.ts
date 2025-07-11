// 気になる機能 API Route - 統一認証システム対応版
// Phase 2: API Response Format Standardization

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'
import { 
  createSuccessResponse, 
  CommonErrors
} from '@/lib/api-response'
import { requireAuth } from '@/lib/auth/unified-auth'

// GET: 気になるリストを取得
export async function GET(_request: NextRequest) {
  const { user, error } = await requireAuth()
  if (error) {
    return error
  }

  try {
    const { data: interests, error: dbError } = await supabaseAdmin
      .from(TABLES.INTERESTS)
      .select(`
        id,
        target_user_id,
        target_type,
        created_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (dbError) {
      console.error('Interests fetch error:', dbError)
      return CommonErrors.internal('気になるリストの取得に失敗しました', dbError)
    }

    return createSuccessResponse(interests || [], {
      message: `${interests?.length || 0}件の気になるを取得しました`
    })

  } catch (error) {
    console.error('Interests GET error:', error)
    return CommonErrors.internal('気になるリストの取得に失敗しました', error)
  }
}

// POST: 気になるを追加
export async function POST(request: NextRequest) {
  const { user, error } = await requireAuth()
  if (error) {
    return error
  }

  try {
    const body = await request.json()
    const { targetUserId, targetType } = body

      // バリデーション
      if (!targetUserId || !targetType) {
        return CommonErrors.badRequest(
          '必須フィールドが不足しています',
          { 
            required: ['targetUserId', 'targetType'],
            provided: { targetUserId, targetType }
          }
        )
      }

      if (!['cfo', 'company'].includes(targetType)) {
        return CommonErrors.badRequest(
          'targetTypeは "cfo" または "company" である必要があります',
          { providedTargetType: targetType }
        )
      }

    // 自分自身を気になるに追加しようとしていないかチェック
    if (targetUserId === user.id) {
      return CommonErrors.badRequest('自分自身を気になるに追加することはできません')
    }

    console.log('Adding interest:', {
      user_id: user.id,
      target_user_id: targetUserId,
      target_type: targetType
    })

    // 気になるを追加（重複チェック付き）
    const { data: interest, error: dbError } = await supabaseAdmin
      .from(TABLES.INTERESTS)
      .insert({
        user_id: user.id,
        target_user_id: targetUserId,
        target_type: targetType
      })
      .select()
      .single()

    if (dbError) {
      console.error('Interest creation error:', dbError)
      
      // PostgreSQLの一意制約違反エラー
      if (dbError.code === '23505') {
        return CommonErrors.conflict('既に気になるに追加されています')
      }
      
      return CommonErrors.internal('気になるの追加に失敗しました', dbError)
    }

    return createSuccessResponse(interest, {
      message: '気になるに追加しました',
      status: 201
    })

  } catch (error) {
    console.error('Interest POST error:', error)
    return CommonErrors.internal('気になるの追加に失敗しました', error)
  }
}

// DELETE: 気になるを削除
export async function DELETE(request: NextRequest) {
  const { user, error } = await requireAuth()
  if (error) {
    return error
  }

  try {
    const { searchParams } = new URL(request.url)
    const targetUserId = searchParams.get('targetUserId')

    if (!targetUserId) {
      return CommonErrors.badRequest('targetUserIdパラメータが必要です')
    }

    console.log('Removing interest:', {
      user_id: user.id,
      target_user_id: targetUserId
    })

    // 気になるを削除
    const { error: dbError } = await supabaseAdmin
      .from(TABLES.INTERESTS)
      .delete()
      .eq('user_id', user.id)
      .eq('target_user_id', targetUserId)

    if (dbError) {
      console.error('Interest deletion error:', dbError)
      return CommonErrors.internal('気になるの削除に失敗しました', dbError)
    }

    return createSuccessResponse(null, {
      message: '気になるから削除しました'
    })

  } catch (error) {
    console.error('Interest DELETE error:', error)
    return CommonErrors.internal('気になるの削除に失敗しました', error)
  }
}