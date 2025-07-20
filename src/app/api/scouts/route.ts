// スカウト管理API - 新アーキテクチャ対応版 (messages.msg_type='scout')
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'
import { authOptions } from '@/lib/auth'

// GET: スカウト一覧を取得（新アーキテクチャ: messagesテーブルのmsg_type='scout'）
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'received' or 'sent'
    const limit = parseInt(searchParams.get('limit') || '20')

    // 新アーキテクチャ: messages テーブルで msg_type='scout' を取得
    let query = supabaseAdmin
      .from(TABLES.MESSAGES)
      .select('*')
      .eq('msg_type', 'scout')
      .order('sent_at', { ascending: false })
      .limit(limit)

    // フィルタリング
    if (type === 'received') {
      query = query.eq('receiver_id', userId)
    } else if (type === 'sent') {
      query = query.eq('sender_id', userId)
    } else {
      // 両方取得
      query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    }

    const { data: scoutMessages, error } = await query

    if (error) {
      console.error('🚨 スカウト取得エラー:', error)
      return NextResponse.json(
        { success: false, error: 'スカウト一覧の取得に失敗しました' },
        { status: 500 }
      )
    }

    // 送信者・受信者の詳細情報を取得
    const enrichedScouts = await Promise.all(
      (scoutMessages || []).map(async (scout) => {
        const isReceived = scout.receiver_id === userId
        
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
        let responseMessage = null
        
        // スカウト後の返信メッセージを確認（最新の返信を取得）
        const { data: responses } = await supabaseAdmin
          .from(TABLES.MESSAGES)
          .select('body, sent_at')
          .eq('sender_id', String(scout.receiver_id))
          .eq('receiver_id', String(scout.sender_id))
          .eq('msg_type', 'chat')
          .gt('sent_at', String(scout.sent_at))
          .order('sent_at', { ascending: false })
        
        if (responses && responses.length > 0) {
          // 承諾メッセージを優先して検索（一度承諾されたら確定）
          let hasAccepted = false
          let hasDeclined = false
          
          for (const response of responses) {
            const body = String(response.body || '').toLowerCase()
            if (body.includes('スカウトを承諾しました') || body.includes('スカウトを承諾')) {
              hasAccepted = true
              status = 'accepted'
              responseMessage = response.body
              // 承諾が見つかったら即座に確定
              break
            } else if (body.includes('スカウトをお断りしました') || body.includes('スカウトを辞退')) {
              hasDeclined = true
              status = 'declined'
              responseMessage = response.body
            }
          }
          
          // 承諾がない場合のみ辞退状態を適用
          if (!hasAccepted && hasDeclined) {
            status = 'declined'
          }
        }

        return {
          id: scout.msg_id,
          senderId: scout.sender_id,
          receiverId: scout.receiver_id,
          message: scout.body,
          sentAt: scout.sent_at,
          isReceived,
          isSent: !isReceived,
          
          // 送信者情報
          from: senderInfo?.name || '不明',
          fromType: senderInfo?.type || 'unknown',
          fromAvatar: senderInfo?.avatar || '❓',
          senderUserId: scout.sender_id,
          
          // 受信者情報  
          to: receiverInfo?.name || '不明',
          toType: receiverInfo?.type || 'unknown',
          toAvatar: receiverInfo?.avatar || '❓',
          recipientUserId: scout.receiver_id,
          
          // 表示用フィールド
          title: `${senderInfo?.name || '不明'}からのスカウト`,
          status: status, // 返信メッセージから判断
          urgency: 'normal', // 新アーキテクチャでは緊急度なし
          responseMessage,
          
          // UIで必要な追加フィールド
          receivedAt: isReceived ? scout.sent_at : null,
          avatar: isReceived ? senderInfo?.avatar || '❓' : receiverInfo?.avatar || '❓',
          
          // 新アーキテクチャメタ情報
          meta: {
            architecture: 'new',
            table: TABLES.MESSAGES,
            msg_type: 'scout'
          }
        }
      })
    )

    // 受信・送信別に分類
    const receivedScouts = enrichedScouts.filter(s => s.isReceived)
    const sentScouts = enrichedScouts.filter(s => s.isSent)

    const response = {
      success: true,
      data: {
        received: type === 'sent' ? [] : receivedScouts,
        sent: type === 'received' ? [] : sentScouts,
        all: enrichedScouts
      },
      meta: {
        architecture: 'new',
        table: TABLES.MESSAGES,
        total: enrichedScouts.length,
        stats: {
          receivedCount: receivedScouts.length,
          sentCount: sentScouts.length,
          totalCount: enrichedScouts.length
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('🚨 スカウト一覧API エラー:', error)
    return NextResponse.json(
      { success: false, error: 'スカウト一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: 新しいスカウトを送信（新アーキテクチャ: messagesテーブルにmsg_type='scout'で挿入）
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
    const { receiverId, recipientId, message, title } = body

    // receiverId と recipientId の両方をサポート（互換性のため）
    const targetReceiverId = receiverId || recipientId

    // 必須フィールドのバリデーション
    if (!targetReceiverId || !message) {
      return NextResponse.json(
        { success: false, error: '受信者IDとメッセージは必須です' },
        { status: 400 }
      )
    }

    // 新アーキテクチャ: messages テーブルに msg_type='scout' で挿入
    const { data: scoutMessage, error: insertError } = await supabaseAdmin
      .from(TABLES.MESSAGES)
      .insert({
        sender_id: userId,
        receiver_id: targetReceiverId,
        msg_type: 'scout',
        body: message
      })
      .select()
      .single()

    if (insertError) {
      console.error('🚨 スカウト送信エラー:', insertError)
      return NextResponse.json(
        { success: false, error: 'スカウトの送信に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        scoutId: scoutMessage.msg_id,
        message: 'スカウトを送信しました'
      },
      meta: {
        architecture: 'new',
        table: TABLES.MESSAGES,
        msg_type: 'scout'
      }
    })

  } catch (error) {
    console.error('🚨 スカウト送信API エラー:', error)
    return NextResponse.json(
      { success: false, error: 'スカウトの送信に失敗しました' },
      { status: 500 }
    )
  }
}