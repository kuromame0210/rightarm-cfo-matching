// 活動履歴管理 API Route - 統一認証システム
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
// import { TABLES } from '@/lib/constants' // 将来使用予定
import { requireAuth } from '@/lib/auth/unified-auth'

// GET: 活動履歴一覧を取得
export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError || !user) {
      return authError || NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const unreadOnly = searchParams.get('unread') === 'true'
    const type = searchParams.get('type')

    console.log('Fetching activities for user:', user.id)

    let query = supabaseAdmin
      .from('rextrix_activities')
      .select(`
        id,
        activity_type,
        title,
        description,
        related_user_id,
        related_entity_type,
        related_entity_id,
        metadata,
        is_read,
        created_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    if (type) {
      query = query.eq('activity_type', type)
    }

    const { data: activities, error: queryError } = await query
      .range(offset, offset + limit - 1)

    if (queryError) {
      console.error('Activities fetch error:', queryError)
      return NextResponse.json(
        { success: false, error: '活動履歴の取得に失敗しました' },
        { status: 500 }
      )
    }

    // 活動データを整形
    const formattedActivities = (activities || []).map((activity: any) => {
      const metadata = activity.metadata || {}
      
      return {
        id: activity.id,
        type: activity.activity_type,
        activity_type: activity.activity_type,
        title: activity.title,
        description: activity.description,
        from: metadata.company_name || activity.related_user?.email || '不明',
        timestamp: new Date(activity.created_at).toLocaleString('ja-JP'),
        status: activity.is_read ? 'read' : 'unread',
        icon: getActivityIcon(activity.activity_type),
        color: getActivityColor(activity.activity_type),
        metadata: metadata,
        created_at: activity.created_at
      }
    })

    // 統計情報も取得
    const { count: totalCount } = await supabaseAdmin
      .from('rextrix_activities')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)

    const { count: unreadCount } = await supabaseAdmin
      .from('rextrix_activities')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_read', false)

    // 今週の活動数
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const { count: weeklyCount } = await supabaseAdmin
      .from('rextrix_activities')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .gte('created_at', oneWeekAgo.toISOString())

    return NextResponse.json({
      success: true,
      activities: formattedActivities,
      statistics: {
        total: totalCount || 0,
        unread: unreadCount || 0,
        weekly: weeklyCount || 0,
        byType: []
      }
    })

  } catch (error) {
    console.error('Activities GET error:', error)
    return NextResponse.json(
      { success: false, error: '活動履歴の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: 新しい活動を記録
export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await requireAuth()
    if (authError || !user) {
      return authError || NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      activityType, 
      title, 
      description, 
      relatedUserId,
      relatedEntityType,
      relatedEntityId,
      metadata 
    } = body

    // 必須フィールドのバリデーション
    if (!activityType || !title) {
      return NextResponse.json(
        { success: false, error: '活動タイプとタイトルは必須です' },
        { status: 400 }
      )
    }

    console.log('Creating activity for user:', user.id)

    // 活動を作成
    const { data: activity, error: activityError } = await supabaseAdmin
      .from('rextrix_activities')
      .insert({
        user_id: user.id,
        activity_type: activityType,
        title,
        description,
        related_user_id: relatedUserId,
        related_entity_type: relatedEntityType,
        related_entity_id: relatedEntityId,
        metadata
      })
      .select()
      .single()

    if (activityError) {
      console.error('Activity creation error:', activityError)
      return NextResponse.json(
        { success: false, error: '活動の記録に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      activity: {
        id: activity.id,
        activity_type: activity.activity_type,
        title: activity.title,
        description: activity.description,
        metadata: activity.metadata,
        created_at: activity.created_at
      },
      message: '活動を記録しました'
    })

  } catch (error) {
    console.error('Activity POST error:', error)
    return NextResponse.json(
      { success: false, error: '活動の記録に失敗しました' },
      { status: 500 }
    )
  }
}

// ヘルパー関数: 活動タイプに応じたアイコンを取得
function getActivityIcon(activityType: string): string {
  switch (activityType) {
    case 'scout_received': return '📨'
    case 'scout_sent': return '📤'
    case 'interest_added': return '⭐'
    case 'interest_received': return '💫'
    case 'meeting_scheduled': return '📅'
    case 'meeting_completed': return '✅'
    case 'meeting_cancelled': return '❌'
    case 'message_sent': return '💬'
    case 'message_received': return '💭'
    case 'profile_updated': return '👤'
    case 'contract_created': return '📋'
    case 'contract_signed': return '✍️'
    case 'payment_completed': return '💰'
    default: return '📝'
  }
}

// ヘルパー関数: 活動タイプに応じた色を取得
function getActivityColor(activityType: string): string {
  switch (activityType) {
    case 'scout_received':
    case 'interest_received':
      return 'bg-blue-50 border-blue-200'
    case 'scout_sent':
    case 'interest_added':
      return 'bg-green-50 border-green-200'
    case 'meeting_scheduled':
    case 'meeting_completed':
      return 'bg-purple-50 border-purple-200'
    case 'meeting_cancelled':
      return 'bg-red-50 border-red-200'
    case 'message_sent':
    case 'message_received':
      return 'bg-yellow-50 border-yellow-200'
    case 'contract_created':
    case 'contract_signed':
      return 'bg-indigo-50 border-indigo-200'
    case 'payment_completed':
      return 'bg-emerald-50 border-emerald-200'
    default:
      return 'bg-gray-50 border-gray-200'
  }
}