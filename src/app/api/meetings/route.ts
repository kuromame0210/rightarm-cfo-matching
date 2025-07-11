// 面談管理 API Route
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { supabaseAdmin } from '@/lib/supabase'
import { authOptions } from '@/lib/auth/index'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { TABLES } from '@/lib/constants'

// GET: 面談一覧を取得
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
  }

  console.log('Fetching meetings for user:', session.user.id)

  // ユーザーの面談一覧を取得
  const { data: meetings, error } = await supabaseAdmin
    .from('rextrix_meetings')
    .select(`
      id,
      title,
      description,
      meeting_date,
      start_time,
      end_time,
      meeting_type,
      meeting_url,
      location_address,
      status,
      is_urgent,
      organizer_id,
      participant_id,
      created_at
    `)
    .or(`organizer_id.eq.${session.user.id},participant_id.eq.${session.user.id}`)
    .order('meeting_date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) {
    console.error('Meetings fetch error:', error)
    return createErrorResponse('面談一覧の取得に失敗しました', { status: 500 })
  }

  // 面談データを整形
  const formattedMeetings = (meetings || []).map((meeting: any) => {
    const isOrganizer = meeting.organizer_id === session.user.id
    const otherUserType = isOrganizer ? 'participant' : 'organizer'

    return {
      id: meeting.id,
      with: '面談相手',
      withType: otherUserType === 'organizer' ? 'company' : 'cfo',
      title: meeting.title,
      date: meeting.meeting_date,
      dateDisplay: new Date(meeting.meeting_date).toLocaleDateString('ja-JP'),
      time: `${meeting.start_time.slice(0, 5)}-${meeting.end_time.slice(0, 5)}`,
      type: meeting.meeting_type,
      status: meeting.status,
      description: meeting.description,
      meetingUrl: meeting.meeting_url,
      locationAddress: meeting.location_address,
      avatar: otherUserType === 'organizer' ? '🏢' : '👤',
      urgent: meeting.is_urgent,
      isOrganizer
    }
  })

  return createSuccessResponse(formattedMeetings, {
    message: `${formattedMeetings.length}件の面談を取得しました`
  })
}

// POST: 新しい面談を作成
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
  }

  const body = await request.json()
    const { 
      participantId, 
      title, 
      description, 
      meetingDate, 
      startTime, 
      endTime, 
      meetingType = 'online',
      meetingUrl,
      locationAddress,
      isUrgent = false
    } = body

  // 必須フィールドのバリデーション
  if (!participantId || !title || !meetingDate || !startTime || !endTime) {
    return createErrorResponse('必須フィールドが不足しています', { status: 400 })
  }

  console.log('Creating meeting between:', session.user.id, 'and', participantId)

  // 参加者が存在するかチェック
  const { data: participantExists } = await supabaseAdmin
    .from(TABLES.USERS)
    .select('id')
    .eq('id', participantId)
    .single()

  if (!participantExists) {
    return createErrorResponse('指定された参加者が存在しません', { status: 404 })
  }

  // 面談を作成
  const { data: meeting, error: meetingError } = await supabaseAdmin
    .from('rextrix_meetings')
    .insert({
      organizer_id: session.user.id,
      participant_id: participantId,
      title,
      description,
      meeting_date: meetingDate,
      start_time: startTime,
      end_time: endTime,
      meeting_type: meetingType,
      meeting_url: meetingUrl,
      location_address: locationAddress,
      is_urgent: isUrgent
    })
    .select()
    .single()

  if (meetingError) {
    console.error('Meeting creation error:', meetingError)
    return createErrorResponse('面談の作成に失敗しました', { status: 500, debug: meetingError })
  }

  return createSuccessResponse(
    { meetingId: meeting.id },
    { message: '面談を作成しました' }
  )
}