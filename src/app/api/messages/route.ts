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

    // 新アーキテクチャ: messages テーブルから直接取得（添付ファイル情報を含む）
    let query = supabaseAdmin
      .from(TABLES.MESSAGES)
      .select(`
        *,
        attachments (
          file_id,
          file_url,
          file_name
        )
      `)
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


    // 🚀 N+1クエリ解決: ユーザー情報をバッチ取得
    const allUserIds = (messages || []).flatMap(m => [m.sender_id, m.receiver_id])
    const userIds = Array.from(new Set(allUserIds))
    
    // ユーザー情報を一括取得
    const [cfoProfiles, bizProfiles] = await Promise.all([
      userIds.length > 0 ? supabaseAdmin
        .from(TABLES.CFO_PROFILES)
        .select('cfo_user_id, cfo_name, cfo_display_name, avatar_url')
        .in('cfo_user_id', userIds) : Promise.resolve({ data: [] }),
      userIds.length > 0 ? supabaseAdmin
        .from(TABLES.BIZ_PROFILES)
        .select('biz_user_id, biz_company_name, avatar_url')
        .in('biz_user_id', userIds) : Promise.resolve({ data: [] })
    ])

    // ユーザー情報をMapに変換（高速検索用）
    const cfoMap = new Map((cfoProfiles.data || []).map(cfo => [
      cfo.cfo_user_id, 
      {
        name: cfo.cfo_display_name || cfo.cfo_name || 'CFO',
        type: 'cfo',
        avatar: cfo.avatar_url || '👤'
      }
    ]))
    
    const bizMap = new Map((bizProfiles.data || []).map(biz => [
      biz.biz_user_id,
      {
        name: biz.biz_company_name || '企業', 
        type: 'company',
        avatar: biz.avatar_url || '🏢'
      }
    ]))

    // メッセージの送信者・受信者情報を追加
    const enrichedMessages = (messages || []).map((message) => {
        // 送信者情報を取得（Mapから高速検索）
        const senderInfo = cfoMap.get(message.sender_id) || bizMap.get(message.sender_id) || 
          { name: '不明', type: 'unknown', avatar: '❓' }

        // 受信者情報を取得（Mapから高速検索）
        const receiverInfo = cfoMap.get(message.receiver_id) || bizMap.get(message.receiver_id) || 
          { name: '不明', type: 'unknown', avatar: '❓' }

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
          
          // 添付ファイル情報
          attachments: message.attachments || [],
          
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


    return NextResponse.json(response)

  } catch (error) {
    console.error('🚨 メッセージ一覧API エラー:', error)
    return NextResponse.json(
      { success: false, error: 'メッセージ一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: 新しいメッセージを送信（新アーキテクチャ: messagesテーブル + ファイル添付対応）
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
    const { receiverId, conversationId, message, msgType = 'chat', attachments = [] } = body

    // conversationIdからreceiverIdを導出
    let targetReceiverId = receiverId
    if (conversationId && !receiverId) {
      const userIds = conversationId.split('_')
      targetReceiverId = userIds[0] === userId ? userIds[1] : userIds[0]
    }

    // 必須フィールドのバリデーション（メッセージまたはファイル添付が必要）
    if (!targetReceiverId || (!message && (!attachments || attachments.length === 0))) {
      return NextResponse.json(
        { success: false, error: '受信者IDとメッセージまたは添付ファイルは必須です' },
        { status: 400 }
      )
    }


    // 新アーキテクチャ: messages テーブルに挿入
    const { data: newMessage, error: insertError } = await supabaseAdmin
      .from(TABLES.MESSAGES)
      .insert({
        sender_id: userId,
        receiver_id: targetReceiverId,
        msg_type: msgType,
        body: message || ''
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

    // ファイル添付がある場合、アップロードと保存処理
    const uploadedAttachments: Array<{
      file_id: number
      file_url: string
      file_name: string
      file_size?: number
    }> = []

    if (attachments && attachments.length > 0) {
      try {
        for (const attachment of attachments) {
          // Base64データをFileオブジェクトに変換
          const buffer = Buffer.from(attachment.data, 'base64')
          const blob = new Blob([buffer], { type: attachment.type })
          const file = new File([blob], attachment.name, { type: attachment.type })

          // storage.tsのuploadFile関数を使用してアップロード
          const { uploadFile } = await import('@/lib/storage')
          const uploadResult = await uploadFile(file, 'ATTACHMENT', userId)

          if (uploadResult.success && uploadResult.url) {
            // attachmentsテーブルに記録
            const { data: attachmentRecord, error: attachmentError } = await supabaseAdmin
              .from('attachments')
              .insert({
                file_url: uploadResult.url,
                file_name: attachment.name,
                msg_id: newMessage.msg_id,
                uploaded_by: userId
              })
              .select()
              .single()

            if (attachmentError) {
              console.error('🚨 添付ファイル記録エラー:', attachmentError)
            } else {
              uploadedAttachments.push({
                file_id: attachmentRecord.file_id,
                file_url: attachmentRecord.file_url,
                file_name: attachmentRecord.file_name || attachment.name,
                file_size: attachment.size
              })
            }
          } else {
            console.error('🚨 ファイルアップロード失敗:', uploadResult.error)
          }
        }
      } catch (error) {
        console.error('🚨 ファイル処理エラー:', error)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: newMessage.msg_id,
        msg_id: newMessage.msg_id,
        sender_id: newMessage.sender_id,
        receiver_id: newMessage.receiver_id,
        body: newMessage.body,
        content: newMessage.body,
        sent_at: newMessage.sent_at,
        sentAt: newMessage.sent_at,
        msg_type: newMessage.msg_type,
        isFromMe: true,
        attachments: uploadedAttachments
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