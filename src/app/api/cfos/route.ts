// RightArm v3 CFO一覧取得 API Route - 統一認証システム
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'
import { requireAuth } from '@/lib/auth/unified-auth'

export async function GET(request: NextRequest) {
  // 認証必須のエンドポイント
  const { error: authError } = await requireAuth()
  if (authError) {
    return authError
  }
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    // const region = searchParams.get('region') // 将来のフィルタリング用
    // const skills = searchParams.get('skills')?.split(',') // 将来のフィルタリング用
    // const search = searchParams.get('search') // 将来の検索用
    const available = searchParams.get('available')

    // シンプルなクエリから開始
    let query = supabaseAdmin
      .from(TABLES.CFOS)
      .select('*')

    // フィルタリング
    if (available === 'true') {
      query = query.eq('is_available', true)
    }

    // シンプルなフィルタリングのみ
    // if (available === 'true') {
    //   query = query.eq('is_available', true)
    // }

    // 簡易クエリ実行（ページネーション一時的に無効化）
    const { data: cfos, error, count } = await query

    // デバッグ情報を追加
    console.log('CFO API Debug:', {
      table: TABLES.CFOS,
      count: count,
      dataLength: cfos?.length || 0,
      error: error,
      actualData: cfos?.map(cfo => ({
        id: cfo.id,
        user_id: cfo.user_id,
        keys: Object.keys(cfo)
      }))
    })

    if (error) {
      console.error('CFOs fetch error:', error)
      return NextResponse.json(
        { success: false, error: 'CFO一覧の取得に失敗しました', debug: { table: TABLES.CFOS, error } },
        { status: 500 }
      )
    }

    // 新しいテーブル構造から詳細情報を取得
    const transformedCFOs = await Promise.all((cfos || []).map(async (cfo: any) => {
      // CFO詳細プロフィール情報を取得
      const { data: cfoProfile, error: cfoProfileError } = await supabaseAdmin
        .from('rextrix_cfo_profiles')
        .select('*')
        .eq('cfo_id', cfo.id)
        .single()
      
      console.log(`CFO Profile Debug for ID ${cfo.id}:`, { 
        cfoProfile, 
        cfoProfileError,
        user_id: cfo.user_id 
      })

      // CFO提供可能業務を取得
      const { data: cfoServices } = await supabaseAdmin
        .from('rextrix_cfo_services')
        .select('*')
        .eq('cfo_id', cfo.id)
        .order('sort_order')

      // CFO保有資格を取得
      const { data: cfoCertifications } = await supabaseAdmin
        .from('rextrix_cfo_certifications')
        .select('*')
        .eq('cfo_id', cfo.id)
        .eq('is_active', true)
        .order('sort_order')

      // CFO職歴を取得
      const { data: cfoWorkHistory } = await supabaseAdmin
        .from('rextrix_cfo_work_history')
        .select('*')
        .eq('cfo_id', cfo.id)
        .order('sort_order')

      // データ整形
      const skills = (cfoServices || []).map(service => service.service_name)
      const certifications = (cfoCertifications || []).map(cert => cert.certification_name)
      const workHistory = (cfoWorkHistory || []).map(work => ({
        period: work.end_year ? `${work.start_year}年${work.start_month}月〜${work.end_year}年${work.end_month}月` : `${work.start_year}年${work.start_month}月〜現在`,
        company: work.company_name,
        position: work.position,
        description: work.description
      }))

      // フォールバック: プロフィールがない場合は既存のuser_profilesから取得
      let fallbackName = 'CFO'
      let fallbackNickname = ''
      
      console.log(`Fallback check for CFO ${cfo.id}:`, {
        has_full_name: !!cfoProfile?.full_name,
        has_display_name: !!cfoProfile?.display_name,
        cfoProfile_keys: cfoProfile ? Object.keys(cfoProfile) : 'null'
      })
      
      if (!cfoProfile?.full_name && !cfoProfile?.display_name) {
        const { data: userProfile, error: userProfileError } = await supabaseAdmin
          .from('rextrix_user_profiles')
          .select('display_name, nickname')
          .eq('user_id', cfo.user_id)
          .single()
        
        console.log(`User Profile Fallback for user_id ${cfo.user_id}:`, { 
          userProfile, 
          userProfileError 
        })
        
        fallbackName = userProfile?.display_name || userProfile?.nickname || 'CFO'
        fallbackNickname = userProfile?.nickname || ''
      }

      const finalName = cfoProfile?.full_name || cfoProfile?.display_name || fallbackName
      const finalNickname = cfoProfile?.nickname || fallbackNickname
      
      console.log(`Final name result for CFO ${cfo.id}:`, {
        finalName,
        finalNickname,
        source: cfoProfile?.full_name ? 'full_name' : 
                cfoProfile?.display_name ? 'display_name' : 'fallback'
      })

      return {
        id: cfo.id,
        name: finalName,
        nickname: finalNickname,
        skills: skills.length > 0 ? skills : ['財務戦略', '資金調達', 'IPO支援', 'M&A', '経営企画'],
        experience: cfo.experience_summary || '',
        achievements: cfoProfile?.achievements || cfo.achievements || [],
        certifications: certifications.length > 0 ? certifications : ['公認会計士'],
        workPreference: cfoProfile?.work_style_preference || 'リモート可',
        compensationRange: cfoProfile?.fee_structure || '応相談',
        introduction: cfoProfile?.introduction || cfo.experience_summary || '経験豊富なCFOです',
        region: cfoProfile?.residence_prefecture ? `${cfoProfile.residence_prefecture}${cfoProfile.residence_city || ''}` : '東京',
        weeklyHours: cfoProfile?.weekly_available_hours || '応相談',
        availableAreas: cfoProfile?.available_areas || ['全国'],
        internationalAvailable: cfoProfile?.international_available || false,
        remoteWorkAvailable: cfoProfile?.remote_work_available || true,
        rating: cfo.rating || 4.5,
        reviewCount: cfo.review_count || 0,
        available: cfo.is_available || false,
        profileImage: '/default-avatar.png',
        photoUrl: '👨‍💼',
        workHistory: workHistory,
        detailedServices: cfoServices || [],
        detailedCertifications: cfoCertifications || []
      }
    }))

    return NextResponse.json({
      success: true,
      data: transformedCFOs,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      }
    })

  } catch (error) {
    console.error('CFOs fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'CFO一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}