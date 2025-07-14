// デバッグ用: データベーステーブル確認API
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(_request: NextRequest) {
  try {
    // 1. rextrix_users テーブルの確認
    const { data: users, error: usersError } = await supabaseAdmin
      .from('rextrix_users')
      .select('id, email, user_type')
      .limit(1)

    // 2. rextrix_interests テーブルの確認
    const { data: interests, error: interestsError } = await supabaseAdmin
      .from('rextrix_interests')
      .select('*')
      .limit(1)

    // 3. rextrix_scouts テーブルの確認
    const { data: scouts, error: scoutsError } = await supabaseAdmin
      .from('rextrix_scouts')
      .select('id, sender_id, recipient_id, title, status, sender_type, recipient_type, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    // 4. 利用可能なテーブル一覧を取得（標準的な方法）
    const { data: allTables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', 'rextrix_%')
      .order('table_name')

    // 5. rextrix_cfos テーブルの構造確認
    const { data: cfosStructure, error: cfosStructureError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'rextrix_cfos')
      .order('ordinal_position')

    // 6. rextrix_user_profiles テーブルの構造確認
    const { data: profilesStructure, error: profilesStructureError } = await supabaseAdmin
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'rextrix_user_profiles')
      .order('ordinal_position')

    return NextResponse.json({
      success: true,
      debug: {
        users: {
          data: users,
          error: usersError,
          exists: !usersError
        },
        interests: {
          data: interests,
          error: interestsError,
          exists: !interestsError
        },
        scouts: {
          data: scouts,
          error: scoutsError,
          exists: !scoutsError
        },
        tables: {
          data: allTables,
          error: tablesError
        },
        cfosStructure: {
          data: cfosStructure,
          error: cfosStructureError
        },
        profilesStructure: {
          data: profilesStructure,
          error: profilesStructureError
        },
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}