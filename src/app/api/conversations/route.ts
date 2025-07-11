// 会話管理 API Route
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'

import { supabaseAdmin } from '@/lib/supabase'
import { authOptions } from '@/lib/auth/index'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { TABLES } from '@/lib/constants'

// GET: 会話一覧を取得
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return createErrorResponse('認証が必要です', { status: 401 })
    }

    const userId = session.user.id
    console.log('Fetching conversations for user:', userId)

    // 現在のユーザーのタイプを判定
    const { data: currentUserCfo } = await supabaseAdmin
      .from(TABLES.CFOS)
      .select('id')
      .eq('user_id', userId)
      .single()

    const { data: currentUserCompany } = await supabaseAdmin
      .from(TABLES.COMPANIES)
      .select('id')
      .eq('user_id', userId)
      .single()

    const currentUserType = currentUserCfo ? 'cfo' : (currentUserCompany ? 'company' : 'unknown')
    console.log('Current user type:', currentUserType)

    // ユーザーの会話一覧を取得（外部キー名を修正）
    const { data: conversations, error } = await supabaseAdmin
      .from(TABLES.CONVERSATIONS)
      .select(`
        id,
        participant1_id,
        participant2_id,
        last_message_at,
        created_at
      `)
      .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false })

    if (error) {
      console.error('Conversations fetch error:', error)
      return createErrorResponse('会話一覧の取得に失敗しました', { status: 500 })
    }

    // 会話相手の情報を含めて整形
    const formattedConversations = await Promise.all(
      (conversations || []).map(async (conv: any) => {
        const otherUserId = conv.participant1_id === userId ? conv.participant2_id : conv.participant1_id
        
        // 会話相手のユーザー情報を別途取得
        const { data: otherUser } = await supabaseAdmin
          .from(TABLES.USERS)
          .select('id, email')
          .eq('id', otherUserId)
          .single()

        // プロフィール情報も取得（CFOまたは企業）
        let profileName = otherUser?.email || '不明なユーザー'
        let userType: 'cfo' | 'company' | 'unknown' = 'unknown'
        let profileId: string | null = null
        
        // CFOプロフィールを確認
        const { data: cfoProfile, error: cfoError } = await supabaseAdmin
          .from(TABLES.CFOS)
          .select('id, user_id')
          .eq('user_id', otherUserId)
          .single()


        if (cfoProfile && !cfoError) {
          // ユーザープロフィールから表示名を取得
          const { data: userProfile } = await supabaseAdmin
            .from('rextrix_user_profiles')
            .select('display_name, nickname')
            .eq('user_id', otherUserId)
            .single()

          profileName = userProfile?.display_name || userProfile?.nickname || otherUser?.email || 'CFO'
          userType = 'cfo'
          profileId = cfoProfile.id
        } else {
          // 企業プロフィールを確認
          const { data: companyProfile, error: companyError } = await supabaseAdmin
            .from(TABLES.COMPANIES)
            .select('id, company_name')
            .eq('user_id', otherUserId)
            .single()


          if (companyProfile && !companyError) {
            profileName = companyProfile.company_name || otherUser?.email || '企業'
            userType = 'company'
            profileId = companyProfile.id
          }
        }

        // 企業ユーザーの場合、CFOとの会話のみ許可
        if (currentUserType === 'company' && userType !== 'cfo') {
          return null // フィルタリングで除外
        }
        
        // CFOユーザーの場合、企業との会話のみ許可
        if (currentUserType === 'cfo' && userType !== 'company') {
          return null // フィルタリングで除外
        }
        
        // 最新メッセージを取得
        const { data: lastMessage } = await supabaseAdmin
          .from(TABLES.MESSAGES)
          .select('content, sent_at')
          .eq('conversation_id', conv.id)
          .order('sent_at', { ascending: false })
          .limit(1)
          .single()
        
        // 未読メッセージ数を取得
        const { count: unreadCount } = await supabaseAdmin
          .from(TABLES.MESSAGES)
          .select('id', { count: 'exact' })
          .eq('conversation_id', conv.id)
          .neq('sender_id', userId)
          .eq('is_read', false)

        return {
          id: conv.id,
          otherUserId: otherUserId,
          otherUserType: userType,
          otherProfileId: profileId,
          name: profileName,
          lastMessage: lastMessage?.content || 'メッセージがありません',
          timestamp: lastMessage?.sent_at || conv.created_at,
          unreadCount: unreadCount || 0,
          status: '進行中',
          avatar: ''
        }
      })
    )

    // nullの要素を除外
    const filteredConversations = formattedConversations.filter(conv => conv !== null)
    
    return createSuccessResponse(filteredConversations, {
      message: `${filteredConversations.length}件の会話を取得しました`
    })
  } catch (error) {
    console.error('Conversations GET error:', error)
    return createErrorResponse('会話一覧の取得に失敗しました', { status: 500 })
  }
}

// POST: 新しい会話を作成
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return createErrorResponse('認証が必要です', { status: 401 })
    }

    const userId = session.user.id
    let body

    try {
      body = await request.json()
    } catch (error) {
      // JSON パースエラーの場合
      if (error instanceof SyntaxError) {
        return createErrorResponse('Invalid JSON format', { status: 400 })
      }
      throw error
    }

    const { otherUserId, message, additionalMessage } = body

    if (!otherUserId) {
      return createErrorResponse('相手のユーザーIDが必要です', { status: 400 })
    }

    console.log('Creating conversation between:', userId, 'and', otherUserId)

    // 相手ユーザーが存在するかチェック
    // まず直接ユーザーテーブルで確認
    let { data: otherUserExists } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('id')
      .eq('id', otherUserId)
      .single()

    let actualUserId = otherUserId

    // 直接見つからない場合、CFOプロフィールテーブルを確認
    if (!otherUserExists) {
      const { data: cfoProfile } = await supabaseAdmin
        .from(TABLES.CFOS)
        .select('user_id')
        .eq('id', otherUserId)
        .single()

      if (cfoProfile?.user_id) {
        actualUserId = cfoProfile.user_id
        // 実際のユーザーIDで再確認
        const { data: actualUser } = await supabaseAdmin
          .from(TABLES.USERS)
          .select('id')
          .eq('id', actualUserId)
          .single()
        otherUserExists = actualUser
      }
    }

    // 企業プロフィールテーブルも確認
    if (!otherUserExists) {
      const { data: companyProfile } = await supabaseAdmin
        .from(TABLES.COMPANIES)
        .select('user_id')
        .eq('id', otherUserId)
        .single()

      if (companyProfile?.user_id) {
        actualUserId = companyProfile.user_id
        // 実際のユーザーIDで再確認
        const { data: actualUser } = await supabaseAdmin
          .from(TABLES.USERS)
          .select('id')
          .eq('id', actualUserId)
          .single()
        otherUserExists = actualUser
      }
    }

      if (!otherUserExists) {
        return createErrorResponse('指定されたユーザーが存在しません', { status: 404 })
      }

    // 既存の会話があるかチェック（実際のユーザーIDを使用）
    const { data: existingConv } = await supabaseAdmin
      .from(TABLES.CONVERSATIONS)
      .select('id')
      .or(`and(participant1_id.eq.${userId},participant2_id.eq.${actualUserId}),and(participant1_id.eq.${actualUserId},participant2_id.eq.${userId})`)
      .single()

    let conversationId = existingConv?.id

    if (!existingConv) {
      // 新しい会話を作成（実際のユーザーIDを使用）
      const { data: newConv, error: convError } = await supabaseAdmin
        .from(TABLES.CONVERSATIONS)
        .insert({
          participant1_id: userId,
          participant2_id: actualUserId,
          last_message_at: new Date().toISOString()
        })
        .select()
        .single()

        if (convError) {
          console.error('Conversation creation error:', convError)
          return createErrorResponse('会話の作成に失敗しました', { status: 500 })
        }

      conversationId = newConv.id
    }

    // 初期メッセージがある場合は送信
    if (message && message.trim()) {
      const { error: messageError } = await supabaseAdmin
        .from(TABLES.MESSAGES)
        .insert({
          conversation_id: conversationId,
          sender_id: userId,
          content: message.trim(),
          sent_at: new Date().toISOString()
        })

      if (messageError) {
        console.error('Initial message creation error:', messageError)
      }

      // 追加メッセージがある場合は送信
      if (additionalMessage && additionalMessage.trim()) {
        const { error: additionalMessageError } = await supabaseAdmin
          .from(TABLES.MESSAGES)
          .insert({
            conversation_id: conversationId,
            sender_id: userId,
            content: additionalMessage.trim(),
            sent_at: new Date(Date.now() + 1000).toISOString() // 1秒後のタイムスタンプ
          })

        if (additionalMessageError) {
          console.error('Additional message creation error:', additionalMessageError)
        }
      }

      // 会話の最終メッセージ時刻を更新
      await supabaseAdmin
        .from(TABLES.CONVERSATIONS)
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId)
    }

    return createSuccessResponse(
      { conversationId },
      { message: '会話を作成しました' }
    )

  } catch (error) {
    console.error('Conversation POST error:', error)
    
    return createErrorResponse('会話の作成に失敗しました', { 
      status: 500,
      details: error instanceof Error ? error.message : String(error) 
    })
  }
}