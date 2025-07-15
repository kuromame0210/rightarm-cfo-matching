// 個別スカウト取得・更新 API Route
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabase'
import { authOptions } from '@/lib/auth/index'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { TABLES } from '@/lib/constants'

// GET: 個別スカウト詳細を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return createErrorResponse('認証が必要です', { status: 401 })
  }
  
  const user = session.user
  try {
    const resolvedParams = await params
    const scoutId = resolvedParams.id

    console.log('🔍 Scout GET Debug Info:')
    console.log('- Scout ID:', scoutId, 'Type:', typeof scoutId)
    console.log('- User ID:', user.id, 'Type:', typeof user.id)

    // 新アーキテクチャ: messages テーブルから msg_type='scout' で取得
    const { data: scout, error } = await supabaseAdmin
      .from(TABLES.MESSAGES)
      .select('*')
      .eq('msg_id', scoutId)
      .eq('msg_type', 'scout')
      .single()

    console.log('- GET Query result:', scout)
    console.log('- GET Query error:', error)

    if (error) {
      console.error('スカウト取得エラー:', error)
      return createErrorResponse('スカウトが見つかりません', { 
        status: 404,
        debug: {
          scoutId,
          userId: user.id,
          error: error.message
        }
      })
    }

    // アクセス権限をチェック（送信者または受信者のみアクセス可能）
    if (scout.sender_id !== user.id && scout.receiver_id !== user.id) {
      return createErrorResponse('アクセス権限がありません', { status: 403 })
    }

    return createSuccessResponse(scout)
  } catch (error) {
    console.error('API Error:', error)
    return createErrorResponse('サーバーエラーが発生しました', { status: 500 })
  }
}

// PATCH: スカウトのステータスを更新（承諾/辞退）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    return createErrorResponse('認証が必要です', { status: 401 })
  }
  
  const user = session.user
  try {
    const resolvedParams = await params
    const scoutId = resolvedParams.id
    const body = await request.json()
    const { status, response_message } = body

    // バリデーション
    if (!status || !['accepted', 'declined'].includes(status)) {
      return createErrorResponse('有効なステータスを指定してください', { status: 400 })
    }

    // デバッグ情報を追加
    console.log('🔍 Scout PATCH Debug Info:')
    console.log('- Scout ID:', scoutId, 'Type:', typeof scoutId)
    console.log('- User ID:', user.id, 'Type:', typeof user.id)
    console.log('- Status:', status)

    // 新アーキテクチャ: まずスカウトが存在することを確認
    const { data: scoutCheck, error: scoutCheckError } = await supabaseAdmin
      .from(TABLES.MESSAGES)
      .select('*')
      .eq('msg_id', scoutId)
      .eq('msg_type', 'scout')
      .single()

    console.log('- Scout existence check:', scoutCheck)
    console.log('- Scout check error:', scoutCheckError)

    if (scoutCheckError || !scoutCheck) {
      return createErrorResponse('スカウトが見つかりません', { 
        status: 404,
        debug: {
          scoutId,
          userId: user.id,
          scoutCheckError: scoutCheckError?.message
        }
      })
    }

    // 現在のユーザーがスカウトの受信者であることを確認
    if (scoutCheck.receiver_id !== user.id) {
      console.log('- Access denied: User is not the receiver')
      console.log('- Scout sender_id:', scoutCheck.sender_id)
      console.log('- Scout receiver_id:', scoutCheck.receiver_id)
      console.log('- Current user_id:', user.id)
      
      return createErrorResponse('このスカウトに対する承諾・辞退権限がありません', { 
        status: 403,
        debug: {
          scoutId,
          userId: user.id,
          scoutSenderId: scoutCheck.sender_id,
          scoutReceiverId: scoutCheck.receiver_id,
          message: '現在のユーザーはスカウトの受信者ではありません'
        }
      })
    }

    const scout = scoutCheck

    // 新アーキテクチャ: スカウトへの返信を新しいメッセージとして送信
    const responseBody = status === 'accepted' ? 
      `スカウトを承諾しました。${response_message ? `\n\n${response_message}` : ''}` :
      `スカウトをお断りしました。${response_message ? `\n\n${response_message}` : ''}`

    const { data: responseMessage, error: responseError } = await supabaseAdmin
      .from(TABLES.MESSAGES)
      .insert({
        sender_id: user.id,
        receiver_id: scout.sender_id,
        msg_type: 'chat',
        body: responseBody
      })
      .select()
      .single()

    if (responseError) {
      console.error('返信メッセージ送信エラー:', responseError)
      return createErrorResponse('返信の送信に失敗しました', { 
        status: 500,
        debug: {
          responseError: responseError.message,
          scoutId,
          status,
          response_message
        }
      })
    }

    console.log('✅ スカウト返信送信成功:', responseMessage.msg_id)

    return createSuccessResponse(
      { 
        scoutId, 
        status, 
        responseMessageId: responseMessage.msg_id 
      },
      { message: `スカウトを${status === 'accepted' ? '承諾' : '辞退'}しました` }
    )
  } catch (error) {
    console.error('API Error:', error)
    return createErrorResponse('サーバーエラーが発生しました', { status: 500 })
  }
}