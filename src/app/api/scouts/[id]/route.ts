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

    // スカウト詳細を取得
    const { data: scout, error } = await supabaseAdmin
      .from(TABLES.SCOUTS)
      .select(`
        *,
        sender:sender_id(id, email),
        recipient:recipient_id(id, email)
      `)
      .eq('id', scoutId)
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
    if (scout.sender_id !== user.id && scout.recipient_id !== user.id) {
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

    // スカウトが存在し、現在のユーザーが受信者であることを確認
    const { data: scout, error: fetchError } = await supabaseAdmin
      .from(TABLES.SCOUTS)
      .select('*')
      .eq('id', scoutId)
      .eq('recipient_id', user.id)
      .single()

    console.log('- Query result:', scout)
    console.log('- Query error:', fetchError)

    if (fetchError || !scout) {
      return createErrorResponse('スカウトが見つかりません', { 
        status: 404,
        debug: {
          scoutId,
          userId: user.id,
          fetchError: fetchError?.message
        }
      })
    }

    // ステータスが既に処理済みの場合はエラー
    if (scout.status !== 'pending') {
      return createErrorResponse('このスカウトは既に処理済みです', { status: 400 })
    }

    // スカウトのステータスを更新（楽観的ロック：pending状態のもののみ更新）
    console.log('📝 Updating scout with:', {
      status,
      response_message: response_message || null,
      updated_at: new Date().toISOString()
    })

    const { data: updateResult, error: updateError } = await supabaseAdmin
      .from(TABLES.SCOUTS)
      .update({
        status,
        responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', scoutId)
      .eq('status', 'pending') // 楽観的ロック：pending状態のもののみ更新
      .select()

    console.log('📝 Update result:', updateResult)
    console.log('📝 Update error:', updateError)

    if (updateError) {
      console.error('スカウト更新エラー:', updateError)
      return createErrorResponse('スカウトの更新に失敗しました', { 
        status: 500,
        debug: {
          updateError: updateError.message,
          scoutId,
          status,
          response_message
        }
      })
    }

    // 楽観的ロック：更新されたレコードがない場合は競合状態
    if (!updateResult || updateResult.length === 0) {
      return createErrorResponse('このスカウトは既に他のユーザーによって処理されています', { 
        status: 409,
        debug: {
          scoutId,
          status,
          message: 'Optimistic lock failed - scout already processed'
        }
      })
    }

    // 返信メッセージがある場合は返信テーブルに記録
    if (response_message && response_message.trim()) {
      try {
        console.log('💬 Recording response message:', response_message)
        
        const { data: responseResult, error: responseError } = await supabaseAdmin
          .from(TABLES.SCOUT_RESPONSES)
          .insert({
            scout_id: scoutId,
            responder_id: user.id,
            response_type: status === 'accepted' ? 'accept' : 'decline',
            message: response_message.trim(),
            created_at: new Date().toISOString()
          })
          .select()

        console.log('💬 Response record result:', responseResult)
        console.log('💬 Response record error:', responseError)
      } catch (responseError) {
        console.error('返信記録エラー:', responseError)
        // 返信記録の失敗はメイン処理を阻害しない
      }
    }

    // 承諾時に会話を作成
    if (status === 'accepted') {
      try {
        console.log('💬 Creating conversation between:', scout.sender_id, 'and', user.id)
        
        // 既存の会話をチェック
        const { data: existingConv, error: convCheckError } = await supabaseAdmin
          .from(TABLES.CONVERSATIONS)
          .select('id')
          .or(`and(participant1_id.eq.${scout.sender_id},participant2_id.eq.${user.id}),and(participant1_id.eq.${user.id},participant2_id.eq.${scout.sender_id})`)
          .single()

        console.log('💬 Existing conversation:', existingConv)
        console.log('💬 Conversation check error:', convCheckError)

        if (!existingConv) {
          // 新しい会話を作成
          const { data: newConv, error: convCreateError } = await supabaseAdmin
            .from(TABLES.CONVERSATIONS)
            .insert({
              participant1_id: scout.sender_id,
              participant2_id: user.id,
              last_message_at: new Date().toISOString()
            })
            .select()

          console.log('💬 New conversation created:', newConv)
          console.log('💬 Conversation create error:', convCreateError)
        }
      } catch (convError) {
        console.error('会話作成エラー:', convError)
        // 会話作成の失敗はスカウト承諾処理を阻害しない
      }
    }

    // 活動履歴を記録
    try {
      console.log('📊 Recording activity for user:', user.id)
      
      const { data: activityResult, error: activityError } = await supabaseAdmin
        .from(TABLES.ACTIVITIES)
        .insert({
          user_id: user.id,
          activity_type: `scout_${status}`,
          description: `スカウト${status === 'accepted' ? '承諾' : '辞退'}: ${scout.message?.substring(0, 50)}...`,
          related_id: scoutId,
          created_at: new Date().toISOString()
        })
        .select()

      console.log('📊 Activity result:', activityResult)
      console.log('📊 Activity error:', activityError)
    } catch (activityError) {
      console.error('活動履歴記録エラー:', activityError)
      // 活動履歴の失敗はメイン処理を阻害しない
    }

    return createSuccessResponse(
      { scoutId, status },
      { message: `スカウトを${status === 'accepted' ? '承諾' : '辞退'}しました` }
    )
  } catch (error) {
    console.error('API Error:', error)
    return createErrorResponse('サーバーエラーが発生しました', { status: 500 })
  }
}