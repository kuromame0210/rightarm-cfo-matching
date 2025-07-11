// スカウト管理 API Route
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { supabaseAdmin } from '@/lib/supabase'
import { authOptions } from '@/lib/auth/index'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { TABLES } from '@/lib/constants'

// GET: スカウト一覧を取得
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return createErrorResponse('認証が必要です', { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'received' or 'sent'
    const status = searchParams.get('status')
    const urgency = searchParams.get('urgency')
    const limit = parseInt(searchParams.get('limit') || '20')

    console.log('Fetching scouts for user:', userId, 'type:', type)

    // まず統計用に全データを取得
    const { data: allScouts, error: allError } = await supabaseAdmin
      .from('rextrix_scouts')
      .select(`
        id,
        sender_id,
        recipient_id,
        status,
        is_read
      `)
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)

    if (allError) {
      console.error('Stats fetch error:', allError)
      return createErrorResponse('スカウト統計の取得に失敗しました', { status: 500 })
    }

    // 統計計算（自分自身へのスカウトを除外）
    const allReceivedScouts = (allScouts || []).filter(s => 
      s.recipient_id === userId && s.sender_id !== userId
    )
    const allSentScouts = (allScouts || []).filter(s => 
      s.sender_id === userId && s.recipient_id !== userId
    )
    const pendingReceivedScouts = allReceivedScouts.filter(s => s.status === 'pending')
    const unreadReceivedScouts = allReceivedScouts.filter(s => !s.is_read)

    // 表示用データクエリ
    let displayQuery = supabaseAdmin
      .from('rextrix_scouts')
      .select(`
        id,
        title,
        message,
        sender_id,
        recipient_id,
        sender_type,
        recipient_type,
        status,
        urgency,
        compensation,
        work_style,
        project_duration,
        required_skills,
        preferred_experience,
        deadline,
        metadata,
        is_read,
        created_at,
        sender:rextrix_users!rextrix_scouts_sender_id_fkey1(id, email),
        recipient:rextrix_users!rextrix_scouts_recipient_id_fkey1(id, email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    // フィルタリング（自分自身へのスカウトを除外）
    if (type === 'received') {
      displayQuery = displayQuery
        .eq('recipient_id', userId)
        .neq('sender_id', userId)
    } else if (type === 'sent') {
      displayQuery = displayQuery
        .eq('sender_id', userId)
        .neq('recipient_id', userId)
    } else {
      // 両方取得（自分自身へのスカウトを除外）
      displayQuery = displayQuery
        .or(`and(sender_id.eq.${userId},recipient_id.neq.${userId}),and(recipient_id.eq.${userId},sender_id.neq.${userId})`)
    }

    if (status) {
      displayQuery = displayQuery.eq('status', status)
    }

    if (urgency) {
      displayQuery = displayQuery.eq('urgency', urgency)
    }

    const { data: scouts, error } = await displayQuery

    if (error) {
      console.error('Scouts fetch error:', error)
      return createErrorResponse('スカウト一覧の取得に失敗しました', { status: 500 })
    }

    console.log(`Fetched ${scouts?.length || 0} scouts for user ${userId}, type: ${type}`)
    console.log('Raw scouts data:', scouts)

    // スカウトデータを整形
    const formattedScouts = (scouts || []).map((scout: any) => {
      const isReceived = scout.recipient_id === userId
      const otherUser = isReceived ? scout.sender : scout.recipient
      const metadata = scout.metadata || {}

      return {
        id: scout.id,
        from: metadata.company_name || otherUser?.email || '不明',
        to: isReceived ? 'あなた' : (metadata.target_company || otherUser?.email || '不明'),
        fromType: scout.sender_type,
        toType: scout.recipient_type,
        title: scout.title,
        message: scout.message,
        receivedAt: isReceived ? new Date(scout.created_at).toLocaleDateString('ja-JP') : null,
        sentAt: !isReceived ? new Date(scout.created_at).toLocaleDateString('ja-JP') : null,
        status: scout.status,
        urgency: scout.urgency,
        compensation: scout.compensation,
        workStyle: scout.work_style,
        projectDuration: scout.project_duration,
        requiredSkills: scout.required_skills,
        preferredExperience: scout.preferred_experience,
        deadline: scout.deadline,
        avatar: scout.sender_type === 'company' ? '🏢' : '👤',
        isReceived,
        isRead: scout.is_read,
        senderUserId: scout.sender_id,
        recipientUserId: scout.recipient_id,
        metadata
      }
    })

    // 表示用データの分類
    const receivedScouts = formattedScouts.filter(s => s.isReceived)
    const sentScouts = formattedScouts.filter(s => !s.isReceived)

    return createSuccessResponse({
      received: type === 'sent' ? [] : receivedScouts,
      sent: type === 'received' ? [] : sentScouts,
      all: type ? formattedScouts : []
    }, {
      message: `${formattedScouts.length}件のスカウトを取得しました`,
      meta: {
        stats: {
          receivedCount: allReceivedScouts.length,
          sentCount: allSentScouts.length,
          pendingCount: pendingReceivedScouts.length,
          unreadCount: unreadReceivedScouts.length
        }
      }
    })
  } catch (error) {
    console.error('Scouts GET error:', error)
    return createErrorResponse('スカウト一覧の取得に失敗しました', { status: 500 })
  }
}

// POST: 新しいスカウトを送信
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return createErrorResponse('認証が必要です', { status: 401 })
    }

    const userId = session.user.id
    const body = await request.json()
    const { 
      recipientId,
      title,
      message,
      senderType,
      recipientType,
      urgency = 'normal',
      compensation,
      workStyle,
      projectDuration,
      requiredSkills,
      preferredExperience,
      deadline,
      metadata
    } = body

    // 必須フィールドのバリデーション
    if (!recipientId || !title || !message || !senderType || !recipientType) {
      return createErrorResponse('必須フィールドが不足しています', { status: 400 })
    }

    console.log('Creating scout from:', userId, 'to:', recipientId)
    console.log('Request body:', { recipientId, title, message, senderType, recipientType })

    // recipientIdがuser_idかプロフィールIDかを判定し、実際のuser_idを取得
    let actualRecipientId = recipientId
    
    // まずrextrix_usersテーブルで直接チェック
    const { data: directUser } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('id')
      .eq('id', recipientId)
      .single()

    if (!directUser) {
      // 直接見つからない場合、CFOまたは企業プロフィールIDと仮定してuser_idを取得
      console.log('Direct user not found, checking profile tables for:', recipientId)
      
      // CFOプロフィールテーブルをチェック
      const { data: cfoProfile } = await supabaseAdmin
        .from(TABLES.CFOS)
        .select('user_id')
        .eq('id', recipientId)
        .single()

      if (cfoProfile) {
        actualRecipientId = cfoProfile.user_id
        console.log('Found CFO profile, user_id:', actualRecipientId)
      } else {
        // 企業プロフィールテーブルをチェック
        const { data: companyProfile } = await supabaseAdmin
          .from(TABLES.COMPANIES)
          .select('user_id')
          .eq('id', recipientId)
          .single()

        if (companyProfile) {
          actualRecipientId = companyProfile.user_id
          console.log('Found company profile, user_id:', actualRecipientId)
        }
      }
    }

    // 最終的なuser_idの存在確認
    const { data: finalRecipient } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('id')
      .eq('id', actualRecipientId)
      .single()

    if (!finalRecipient) {
      return createErrorResponse('指定された受信者が存在しません', { status: 404 })
    }

    console.log('Final scout data to insert:', {
      sender_id: userId,
      recipient_id: actualRecipientId,
      title,
      sender_type: senderType,
      recipient_type: recipientType
    })

    // スカウトを作成
    const { data: scout, error: scoutError } = await supabaseAdmin
      .from('rextrix_scouts')
      .insert({
        sender_id: userId,
        recipient_id: actualRecipientId,
        title,
        message,
        sender_type: senderType,
        recipient_type: recipientType,
        urgency,
        compensation,
        work_style: workStyle,
        project_duration: projectDuration,
        required_skills: requiredSkills,
        preferred_experience: preferredExperience,
        deadline,
        metadata
      })
      .select()
      .single()

    if (scoutError) {
      console.error('Scout creation error:', scoutError)
      return createErrorResponse('スカウトの送信に失敗しました', { status: 500 })
    }

    console.log('Scout created successfully:', scout)

    // 活動履歴を記録（送信者）
    await supabaseAdmin
      .from(TABLES.ACTIVITIES)
      .insert({
        user_id: userId,
        activity_type: 'scout_sent',
        title: 'スカウトを送信しました',
        description: `${title}のスカウトを送信しました`,
        related_user_id: actualRecipientId,
        related_entity_type: 'scout',
        related_entity_id: scout.id,
        metadata: { scout_title: title, urgency }
      })

    // 活動履歴を記録（受信者）
    await supabaseAdmin
      .from(TABLES.ACTIVITIES)
      .insert({
        user_id: actualRecipientId,
        activity_type: 'scout_received',
        title: '新しいスカウトを受信',
        description: `${title}のスカウトが届きました`,
        related_user_id: userId,
        related_entity_type: 'scout',
        related_entity_id: scout.id,
        metadata: { scout_title: title, urgency }
      })

    return createSuccessResponse(
      { scoutId: scout.id },
      { message: 'スカウトを送信しました' }
    )
  } catch (error) {
    console.error('Scouts POST error:', error)
    return createErrorResponse('スカウトの送信に失敗しました', { status: 500 })
  }
}