// メッセージ管理API - 新アーキテクチャ対応版
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'
import { authOptions } from '@/lib/auth'

// GET: メッセージ一覧を取得（新アーキテクチャ: messagesテーブル）
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    console.log('💬 メッセージ一覧API - 新アーキテクチャ版')

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const otherUserId = searchParams.get('otherUserId') // 特定ユーザーとの会話
    const conversationId = searchParams.get('conversationId') // 会話ID（user1_user2形式）
    const msgType = searchParams.get('type') // 'chat' または 'scout' または 'conversations'
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // conversationIdから相手ユーザーIDを導出
    let targetUserId = otherUserId
    if (conversationId && !otherUserId) {
      const userIds = conversationId.split('_')
      targetUserId = userIds[0] === userId ? userIds[1] : userIds[0]
    }

    // 新アーキテクチャ: messages テーブルから直接取得
    let query = supabaseAdmin
      .from(TABLES.MESSAGES)
      .select('*')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('sent_at', { ascending: false })
      .limit(limit)

    // 特定ユーザーとの会話を取得
    if (targetUserId) {
      query = query.or(
        `and(sender_id.eq.${userId},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${userId})`
      )
    }

    // メッセージタイプフィルター
    if (msgType && msgType !== 'conversations') {
      query = query.eq('msg_type', msgType)
    }

    const { data: messages, error } = await query

    if (error) {
      console.error('🚨 メッセージ取得エラー:', error)
      return NextResponse.json(
        { success: false, error: 'メッセージ一覧の取得に失敗しました' },
        { status: 500 }
      )
    }

    console.log(`✅ メッセージ取得成功: ${messages?.length || 0}件`)

    // 会話一覧形式での取得要求の場合
    if (msgType === 'conversations') {
      // 会話をグループ化（相手ユーザーごと）
      const conversations: Record<string, any> = {}
      
      for (const message of messages || []) {
        const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id
        
        if (!conversations[otherUserId]) {
          conversations[otherUserId] = {
            id: otherUserId, // 会話IDとして相手のユーザーIDを使用
            otherUserId,
            messages: [],
            lastMessage: null,
            unreadCount: 0
          }
        }
        
        conversations[otherUserId].messages.push(message)
        
        // 最新メッセージを設定
        if (!conversations[otherUserId].lastMessage || 
            new Date(message.sent_at) > new Date(conversations[otherUserId].lastMessage.sent_at)) {
          conversations[otherUserId].lastMessage = {
            content: message.body,
            sent_at: message.sent_at
          }
        }
        
        // 未読カウント（受信メッセージかつ未読）
        if (message.receiver_id === userId) {
          conversations[otherUserId].unreadCount++
        }
      }
      
      // 会話相手の詳細情報を取得
      const enrichedConversations = await Promise.all(
        Object.values(conversations).map(async (conv: any) => {
          // 相手ユーザーの情報を取得
          let otherUserName = '不明'
          let otherUserType = 'unknown'
          let otherProfileId = null
          
          // CFOプロフィールを確認
          const { data: cfoProfile } = await supabaseAdmin
            .from(TABLES.CFO_PROFILES)
            .select('cfo_name, cfo_display_name, avatar_url')
            .eq('cfo_user_id', conv.otherUserId)
            .single()

          if (cfoProfile) {
            otherUserName = cfoProfile.cfo_display_name || cfoProfile.cfo_name || 'CFO'
            otherUserType = 'cfo'
            otherProfileId = conv.otherUserId
          } else {
            // 企業プロフィールを確認
            const { data: bizProfile } = await supabaseAdmin
              .from(TABLES.BIZ_PROFILES)
              .select('biz_company_name, avatar_url')
              .eq('biz_user_id', conv.otherUserId)
              .single()

            if (bizProfile) {
              otherUserName = bizProfile.biz_company_name || '企業'
              otherUserType = 'company'
              otherProfileId = conv.otherUserId
            }
          }
          
          return {
            id: conv.id,
            otherUserId: conv.otherUserId,
            otherUserType,
            otherProfileId,
            name: otherUserName,
            lastMessage: conv.lastMessage?.content || '',
            timestamp: conv.lastMessage?.sent_at || '',
            unreadCount: conv.unreadCount,
            status: '進行中',
            avatar: otherUserType === 'cfo' ? '👤' : '🏢'
          }
        })
      )
      
      return NextResponse.json({
        success: true,
        data: enrichedConversations.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
        meta: {
          architecture: 'new',
          table: TABLES.MESSAGES,
          mode: 'conversations',
          total: enrichedConversations.length
        }
      })
    }

    console.log(`✅ メッセージ取得成功: ${messages?.length || 0}件`)

    // メッセージの送信者・受信者情報を追加
    const enrichedMessages = await Promise.all(
      (messages || []).map(async (message) => {
        // 送信者情報を取得
        let senderInfo = { name: '不明', type: 'unknown', avatar: '❓' }
        
        // CFOプロフィールを確認
        const { data: cfoProfile } = await supabaseAdmin
          .from(TABLES.CFO_PROFILES)
          .select('cfo_name, cfo_display_name, avatar_url')
          .eq('cfo_user_id', message.sender_id)
          .single()

        if (cfoProfile) {
          senderInfo = {
            name: cfoProfile.cfo_display_name || cfoProfile.cfo_name || 'CFO',
            type: 'cfo',
            avatar: cfoProfile.avatar_url || '👤'
          }
        } else {
          // 企業プロフィールを確認
          const { data: bizProfile } = await supabaseAdmin
            .from(TABLES.BIZ_PROFILES)
            .select('biz_company_name, avatar_url')
            .eq('biz_user_id', message.sender_id)
            .single()

          if (bizProfile) {
            senderInfo = {
              name: bizProfile.biz_company_name || '企業',
              type: 'company',
              avatar: bizProfile.avatar_url || '🏢'
            }
          }
        }

        // 受信者情報を取得
        let receiverInfo = { name: '不明', type: 'unknown', avatar: '❓' }
        
        const { data: receiverCfoProfile } = await supabaseAdmin
          .from(TABLES.CFO_PROFILES)
          .select('cfo_name, cfo_display_name, avatar_url')
          .eq('cfo_user_id', message.receiver_id)
          .single()

        if (receiverCfoProfile) {
          receiverInfo = {
            name: receiverCfoProfile.cfo_display_name || receiverCfoProfile.cfo_name || 'CFO',
            type: 'cfo',
            avatar: receiverCfoProfile.avatar_url || '👤'
          }
        } else {
          const { data: receiverBizProfile } = await supabaseAdmin
            .from(TABLES.BIZ_PROFILES)
            .select('biz_company_name, avatar_url')
            .eq('biz_user_id', message.receiver_id)
            .single()

          if (receiverBizProfile) {
            receiverInfo = {
              name: receiverBizProfile.biz_company_name || '企業',
              type: 'company',
              avatar: receiverBizProfile.avatar_url || '🏢'
            }
          }
        }

        const isFromMe = message.sender_id === userId
        const otherUser = isFromMe ? receiverInfo : senderInfo

        return {
          id: message.msg_id,
          senderId: message.sender_id,
          receiverId: message.receiver_id,
          content: message.body,
          message: message.body, // 互換性
          messageType: message.msg_type,
          sentAt: message.sent_at,
          isFromMe,
          
          // 表示用情報
          senderName: senderInfo.name,
          senderType: senderInfo.type,
          senderAvatar: senderInfo.avatar,
          
          receiverName: receiverInfo.name,
          receiverType: receiverInfo.type,
          receiverAvatar: receiverInfo.avatar,
          
          // 相手方情報（会話リスト用）
          otherUserName: otherUser.name,
          otherUserType: otherUser.type,
          otherUserAvatar: otherUser.avatar,
          otherUserId: isFromMe ? message.receiver_id : message.sender_id,
          
          // 新アーキテクチャメタ情報
          meta: {
            architecture: 'new',
            table: TABLES.MESSAGES
          }
        }
      })
    )

    // 会話をグループ化（otherUserIdごと）
    const conversations: Record<string, any> = {}
    enrichedMessages.forEach(msg => {
      const key = msg.otherUserId
      if (!conversations[key]) {
        conversations[key] = {
          otherUserId: msg.otherUserId,
          otherUserName: msg.otherUserName,
          otherUserType: msg.otherUserType,
          otherUserAvatar: msg.otherUserAvatar,
          lastMessage: msg,
          messages: [],
          unreadCount: 0
        }
      }
      conversations[key].messages.push(msg)
      
      // 最新メッセージで上書き（既にsent_atでソート済み）
      if (new Date(msg.sentAt) > new Date(conversations[key].lastMessage.sentAt)) {
        conversations[key].lastMessage = msg
      }
    })

    const response = {
      success: true,
      data: {
        messages: enrichedMessages,
        conversations: Object.values(conversations),
        total: enrichedMessages.length
      },
      meta: {
        architecture: 'new',
        table: TABLES.MESSAGES,
        filters: {
          otherUserId,
          msgType,
          limit
        }
      }
    }

    console.log(`📊 メッセージ統計: ${enrichedMessages.length}件, 会話数: ${Object.keys(conversations).length}`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('🚨 メッセージ一覧API エラー:', error)
    return NextResponse.json(
      { success: false, error: 'メッセージ一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: 新しいメッセージを送信（新アーキテクチャ: messagesテーブル）
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const body = await request.json()
    const { receiverId, conversationId, message, msgType = 'chat' } = body

    // conversationIdからreceiverIdを導出
    let targetReceiverId = receiverId
    if (conversationId && !receiverId) {
      const userIds = conversationId.split('_')
      targetReceiverId = userIds[0] === userId ? userIds[1] : userIds[0]
    }

    // 必須フィールドのバリデーション
    if (!targetReceiverId || !message) {
      return NextResponse.json(
        { success: false, error: '受信者IDとメッセージは必須です' },
        { status: 400 }
      )
    }

    console.log('💬 メッセージ送信:', { from: userId, to: targetReceiverId, type: msgType })

    // 新アーキテクチャ: messages テーブルに挿入
    const { data: newMessage, error: insertError } = await supabaseAdmin
      .from(TABLES.MESSAGES)
      .insert({
        sender_id: userId,
        receiver_id: targetReceiverId,
        msg_type: msgType,
        body: message
      })
      .select()
      .single()

    if (insertError) {
      console.error('🚨 メッセージ送信エラー:', insertError)
      return NextResponse.json(
        { success: false, error: 'メッセージの送信に失敗しました' },
        { status: 500 }
      )
    }

    console.log('✅ メッセージ送信成功:', newMessage.msg_id)

    return NextResponse.json({
      success: true,
      data: {
        messageId: newMessage.msg_id,
        message: 'メッセージを送信しました'
      },
      meta: {
        architecture: 'new',
        table: TABLES.MESSAGES
      }
    })

  } catch (error) {
    console.error('🚨 メッセージ送信API エラー:', error)
    return NextResponse.json(
      { success: false, error: 'メッセージの送信に失敗しました' },
      { status: 500 }
    )
  }
}