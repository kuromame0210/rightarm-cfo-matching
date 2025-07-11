// スカウトデータベース確認用API
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'

export async function GET(_request: NextRequest) {
  try {
    // 1. 全スカウトを確認
    const { data: allScouts, error: scoutsError } = await supabaseAdmin
      .from(TABLES.SCOUTS)
      .select(`
        id,
        sender_id,
        recipient_id,
        title,
        message,
        status,
        sender_type,
        recipient_type,
        created_at,
        sender:sender_id(id, email, user_type),
        recipient:recipient_id(id, email, user_type)
      `)
      .order('created_at', { ascending: false })
      .limit(20)

    // 2. 現在のdemo-tokenユーザーを確認
    const { data: currentUser, error: userError } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('id, email, user_type')
      .eq('id', 'f3e021ee-13f4-469c-a350-49838c4543ae')
      .single()

    // 3. 全ユーザーを確認
    const { data: allUsers, error: usersError } = await supabaseAdmin
      .from(TABLES.USERS)
      .select('id, email, user_type')
      .limit(10)

    // 4. 統計情報を計算
    const stats = {
      totalScouts: allScouts?.length || 0,
      pendingScouts: allScouts?.filter(s => s.status === 'pending').length || 0,
      acceptedScouts: allScouts?.filter(s => s.status === 'accepted').length || 0,
      scoutsByType: {
        company_to_cfo: allScouts?.filter(s => s.sender_type === 'company' && s.recipient_type === 'cfo').length || 0,
        cfo_to_company: allScouts?.filter(s => s.sender_type === 'cfo' && s.recipient_type === 'company').length || 0
      }
    }

    // 5. 現在のユーザーに関連するスカウト
    const currentUserScouts = {
      received: allScouts?.filter(s => s.recipient_id === 'f3e021ee-13f4-469c-a350-49838c4543ae') || [],
      sent: allScouts?.filter(s => s.sender_id === 'f3e021ee-13f4-469c-a350-49838c4543ae') || []
    }

    return NextResponse.json({
      success: true,
      data: {
        currentUser,
        allScouts,
        allUsers,
        stats,
        currentUserScouts,
        errors: {
          scoutsError,
          userError,
          usersError
        }
      }
    })

  } catch (error) {
    console.error('Debug scouts API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}