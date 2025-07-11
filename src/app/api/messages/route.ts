// メッセージ管理 API Route
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { supabaseAdmin } from '@/lib/supabase'
import { authOptions } from '@/lib/auth/index'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { TABLES } from '@/lib/constants'

// GET: 特定の会話のメッセージ一覧を取得
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return createErrorResponse('認証が必要です', { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return createErrorResponse('会話IDが必要です', { status: 400 })
    }

    console.log('Fetching messages for conversation:', conversationId)

    // 会話の参加者であることを確認
    const { data: conversation } = await supabaseAdmin
      .from(TABLES.CONVERSATIONS)
      .select('participant1_id, participant2_id')
      .eq('id', conversationId)
      .single()

    if (!conversation || (conversation.participant1_id !== userId && conversation.participant2_id !== userId)) {
      return createErrorResponse('この会話にアクセスする権限がありません', { status: 403 })
    }

    // メッセージ一覧を取得
    const { data: messages, error } = await supabaseAdmin
      .from(TABLES.MESSAGES)
      .select(`
        id,
        sender_id,
        content,
        message_type,
        is_read,
        sent_at,
        file_name
      `)
      .eq('conversation_id', conversationId)
      .order('sent_at', { ascending: true })

    if (error) {
      console.error('Messages fetch error:', error)
      return createErrorResponse('メッセージの取得に失敗しました', { status: 500 })
    }

    // メッセージを読了状態に更新（相手のメッセージのみ）
    await supabaseAdmin
      .from(TABLES.MESSAGES)
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false)

    // メッセージを整形
    const formattedMessages = (messages || []).map((msg: any) => ({
      id: msg.id,
      senderId: msg.sender_id,
      content: msg.content,
      timestamp: msg.sent_at,
      isFile: msg.message_type === 'file',
      fileName: msg.message_type === 'file' ? msg.file_name : undefined,
      isOwnMessage: msg.sender_id === userId
    }))

    return createSuccessResponse(formattedMessages)
  } catch (error) {
    console.error('Messages GET error:', error)
    return createErrorResponse('メッセージの取得に失敗しました', { status: 500 })
  }
}

// POST: 新しいメッセージを送信
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return createErrorResponse('認証が必要です', { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { conversationId, content, messageType = 'text' } = body

    if (!conversationId || !content?.trim()) {
      return createErrorResponse('会話IDとメッセージ内容が必要です', { status: 400 })
    }

    console.log('Sending message to conversation:', conversationId)

    // 会話の参加者であることを確認
    const { data: conversation } = await supabaseAdmin
      .from(TABLES.CONVERSATIONS)
      .select('participant1_id, participant2_id')
      .eq('id', conversationId)
      .single()

    if (!conversation || (conversation.participant1_id !== userId && conversation.participant2_id !== userId)) {
      return createErrorResponse('この会話にメッセージを送信する権限がありません', { status: 403 })
    }

    const now = new Date().toISOString()

    // メッセージを作成
    const { data: message, error: messageError } = await supabaseAdmin
      .from(TABLES.MESSAGES)
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        content: content.trim(),
        message_type: messageType,
        sent_at: now
      })
      .select()
      .single()

    if (messageError) {
      console.error('Message creation error:', messageError)
      return createErrorResponse('メッセージの送信に失敗しました', { status: 500 })
    }

    // 会話の最終メッセージ時刻を更新
    const { error: updateError } = await supabaseAdmin
      .from(TABLES.CONVERSATIONS)
      .update({ last_message_at: now })
      .eq('id', conversationId)

    if (updateError) {
      console.error('Conversation update error:', updateError)
    }

    return createSuccessResponse({
      id: message.id,
      senderId: message.sender_id,
      content: message.content,
      timestamp: message.sent_at,
      isFile: message.message_type === 'file',
      isOwnMessage: true
    }, { message: 'メッセージを送信しました' })
  } catch (error) {
    console.error('Messages POST error:', error)
    return createErrorResponse('メッセージの送信に失敗しました', { status: 500 })
  }
}