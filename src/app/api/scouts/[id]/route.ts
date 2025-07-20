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

    // 新アーキテクチャ: messages テーブルから msg_type='scout' で取得
    const { data: scout, error } = await supabaseAdmin
      .from(TABLES.MESSAGES)
      .select('*')
      .eq('msg_id', scoutId)
      .eq('msg_type', 'scout')
      .single()

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

    // 送信者情報を取得
    let senderInfo = null
    if (scout.sender_id) {
      // CFOプロフィールを確認
      const { data: cfoProfile } = await supabaseAdmin
        .from(TABLES.CFO_PROFILES)
        .select('cfo_name, cfo_display_name, avatar_url')
        .eq('cfo_user_id', scout.sender_id)
        .single()

      if (cfoProfile) {
        senderInfo = {
          name: cfoProfile.cfo_name || cfoProfile.cfo_display_name || 'CFO',
          type: 'cfo',
          avatar: cfoProfile.avatar_url || '👤'
        }
      } else {
        // 企業プロフィールを確認
        const { data: bizProfile } = await supabaseAdmin
          .from(TABLES.BIZ_PROFILES)
          .select('biz_company_name, avatar_url')
          .eq('biz_user_id', scout.sender_id)
          .single()

        if (bizProfile) {
          senderInfo = {
            name: bizProfile.biz_company_name || '企業',
            type: 'company',
            avatar: bizProfile.avatar_url || '🏢'
          }
        }
      }
    }

    // 受信者情報を取得
    let receiverInfo = null
    if (scout.receiver_id) {
      // CFOプロフィールを確認
      const { data: cfoProfile } = await supabaseAdmin
        .from(TABLES.CFO_PROFILES)
        .select('cfo_name, cfo_display_name, avatar_url')
        .eq('cfo_user_id', scout.receiver_id)
        .single()

      if (cfoProfile) {
        receiverInfo = {
          name: cfoProfile.cfo_name || cfoProfile.cfo_display_name || 'CFO',
          type: 'cfo',
          avatar: cfoProfile.avatar_url || '👤'
        }
      } else {
        // 企業プロフィールを確認  
        const { data: bizProfile } = await supabaseAdmin
          .from(TABLES.BIZ_PROFILES)
          .select('biz_company_name, avatar_url')
          .eq('biz_user_id', scout.receiver_id)
          .single()

        if (bizProfile) {
          receiverInfo = {
            name: bizProfile.biz_company_name || '企業',
            type: 'company',
            avatar: bizProfile.avatar_url || '🏢'
          }
        }
      }
    }

    // スカウト後の返信を確認してステータスを判断
    let status = 'pending'
    const { data: responses } = await supabaseAdmin
      .from(TABLES.MESSAGES)
      .select('body, sent_at')
      .eq('sender_id', scout.receiver_id)
      .eq('receiver_id', scout.sender_id)
      .eq('msg_type', 'chat')
      .gt('sent_at', scout.sent_at)
      .order('sent_at', { ascending: false })
    
    if (responses && responses.length > 0) {
      // 承諾メッセージを優先して検索（一度承諾されたら確定）
      let hasAccepted = false
      let hasDeclined = false
      
      for (const response of responses) {
        const body = response.body?.toLowerCase() || ''
        if (body.includes('スカウトを承諾しました') || body.includes('スカウトを承諾')) {
          hasAccepted = true
          status = 'accepted'
          console.log(`✅ ステータス判定成功: ${status}`)
          // 承諾が見つかったら即座に確定
          break
        } else if (body.includes('スカウトをお断りしました') || body.includes('スカウトを辞退')) {
          hasDeclined = true
          status = 'declined'
          console.log(`✅ ステータス判定成功: ${status}`)
        }
      }
      
      // 承諾がない場合のみ辞退状態を適用
      if (!hasAccepted && hasDeclined) {
        status = 'declined'
      }
    }

    // 整形されたデータを返す
    const enrichedScout = {
      ...scout,
      // 送信者情報
      sender_name: senderInfo?.name || 'スカウト送信者',
      sender_type: senderInfo?.type || 'unknown',
      sender_avatar: senderInfo?.avatar || '❓',
      // 受信者情報
      receiver_name: receiverInfo?.name || 'スカウト受信者',
      receiver_type: receiverInfo?.type || 'unknown',
      receiver_avatar: receiverInfo?.avatar || '❓',
      // 企業名（後方互換性のため）
      company_name: senderInfo?.type === 'company' ? senderInfo.name : receiverInfo?.type === 'company' ? receiverInfo.name : '企業',
      // ステータス
      status: status,
      // 表示用フィールド
      title: scout.body?.split('\n')[0] || 'スカウト',
      message: scout.body || 'メッセージがありません'
    }

    return createSuccessResponse(enrichedScout)
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

    // 新アーキテクチャ: まずスカウトが存在することを確認
    const { data: scoutCheck, error: scoutCheckError } = await supabaseAdmin
      .from(TABLES.MESSAGES)
      .select('*')
      .eq('msg_id', scoutId)
      .eq('msg_type', 'scout')
      .single()

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