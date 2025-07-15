// 会話一覧 API Route - 新アーキテクチャ対応版 (messagesテーブルから会話を導出)

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'
import { authOptions } from '@/lib/auth'

// GET: 会話一覧を取得（新アーキテクチャ: messagesテーブルから導出）
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    console.log('💬 会話一覧API - 新アーキテクチャ版')

    const userId = session.user.id

    // 新アーキテクチャ: messages テーブルから会話を導出
    const { data: messages, error: dbError } = await supabaseAdmin
      .from(TABLES.MESSAGES)
      .select('msg_id, sender_id, receiver_id, msg_type, body, sent_at')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('sent_at', { ascending: false })

    if (dbError) {
      console.error('🚨 会話一覧取得エラー:', dbError)
      return NextResponse.json(
        { success: false, error: '会話一覧の取得に失敗しました' },
        { status: 500 }
      )
    }

    console.log(`✅ メッセージ取得成功: ${messages?.length || 0}件`)

    // 会話をユーザーペアごとにグループ化
    const conversationMap = new Map<string, any>()
    
    messages?.forEach(message => {
      // 相手のユーザーIDを特定
      const otherUserId = message.sender_id === userId ? message.receiver_id : message.sender_id
      
      // 会話IDを生成（小さいIDを前に）
      const conversationId = [userId, otherUserId].sort().join('_')
      
      // 既存の会話がない場合、または新しいメッセージの場合
      if (!conversationMap.has(conversationId) || 
          new Date(message.sent_at) > new Date(conversationMap.get(conversationId).last_message_at)) {
        conversationMap.set(conversationId, {
          id: conversationId,
          participant1_id: userId,
          participant2_id: otherUserId,
          last_message_at: message.sent_at,
          otherUserId: otherUserId,
          lastMessage: message.body,
          lastMessageType: message.msg_type
        })
      }
    })

    // 会話リストを配列に変換
    const conversations = Array.from(conversationMap.values())

    // 相手のプロフィール情報を取得
    const enrichedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        let otherUserInfo = { name: '不明', type: 'unknown', avatar: '❓' }
        
        // CFOプロフィールを確認
        const { data: cfoProfile } = await supabaseAdmin
          .from(TABLES.CFO_PROFILES)
          .select('cfo_name, cfo_display_name, avatar_url')
          .eq('cfo_user_id', conversation.otherUserId)
          .single()

        if (cfoProfile) {
          otherUserInfo = {
            name: cfoProfile.cfo_display_name || cfoProfile.cfo_name || 'CFO',
            type: 'cfo',
            avatar: cfoProfile.avatar_url || '👤'
          }
        } else {
          // 企業プロフィールを確認
          const { data: bizProfile } = await supabaseAdmin
            .from(TABLES.BIZ_PROFILES)
            .select('biz_company_name, avatar_url')
            .eq('biz_user_id', conversation.otherUserId)
            .single()

          if (bizProfile) {
            otherUserInfo = {
              name: bizProfile.biz_company_name || '企業',
              type: 'company',
              avatar: bizProfile.avatar_url || '🏢'
            }
          }
        }

        return {
          ...conversation,
          otherUserName: otherUserInfo.name,
          otherUserType: otherUserInfo.type,
          otherUserAvatar: otherUserInfo.avatar,
          created_at: conversation.last_message_at // 互換性のため
        }
      })
    )

    // 最新メッセージの時刻順にソート
    enrichedConversations.sort((a, b) => 
      new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    )

    const response = {
      success: true,
      data: enrichedConversations,
      meta: {
        architecture: 'new',
        derivedFrom: TABLES.MESSAGES,
        conversationCount: enrichedConversations.length
      }
    }

    console.log(`📊 会話一覧: ${enrichedConversations.length}件`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('🚨 会話一覧API エラー:', error)
    return NextResponse.json(
      { success: false, error: '会話一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: 新しい会話を開始（新アーキテクチャ: 最初のメッセージを送信）
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
    const { receiverId, message } = body

    // バリデーション
    if (!receiverId || !message) {
      return NextResponse.json(
        { success: false, error: '受信者IDとメッセージは必須です' },
        { status: 400 }
      )
    }

    // 自分自身に送信しようとしていないかチェック
    if (receiverId === userId) {
      return NextResponse.json(
        { success: false, error: '自分自身にメッセージを送信することはできません' },
        { status: 400 }
      )
    }

    console.log('💬 新規会話作成:', { from: userId, to: receiverId })

    // 新アーキテクチャ: messages テーブルに最初のメッセージを追加
    const { data: newMessage, error: insertError } = await supabaseAdmin
      .from(TABLES.MESSAGES)
      .insert({
        sender_id: userId,
        receiver_id: receiverId,
        msg_type: 'chat',
        body: message
      })
      .select('msg_id, sender_id, receiver_id, msg_type, body, sent_at')
      .single()

    if (insertError) {
      console.error('🚨 メッセージ送信エラー:', insertError)
      return NextResponse.json(
        { success: false, error: 'メッセージの送信に失敗しました' },
        { status: 500 }
      )
    }

    console.log('✅ 新規会話作成成功')

    // 会話IDを生成
    const conversationId = [userId, receiverId].sort().join('_')

    return NextResponse.json({
      success: true,
      data: {
        conversationId: conversationId,
        message: newMessage,
        created_at: newMessage.sent_at
      },
      meta: {
        architecture: 'new',
        table: TABLES.MESSAGES
      }
    })

  } catch (error) {
    console.error('🚨 新規会話作成API エラー:', error)
    return NextResponse.json(
      { success: false, error: '新規会話の作成に失敗しました' },
      { status: 500 }
    )
  }
}