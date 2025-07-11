// RightArm v3 CFO詳細取得 API Route
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'
import { authOptions } from '@/lib/auth/index'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
  }

  try {
    const { id: cfoId } = await params

    if (!cfoId) {
      return NextResponse.json(
        { success: false, error: 'CFO IDが指定されていません' },
        { status: 400 }
      )
    }

    // CFO基本情報を取得
    const { data: cfo, error: cfoError } = await supabaseAdmin
      .from(TABLES.CFOS)
      .select('*')
      .eq('id', cfoId)
      .single()

    if (cfoError || !cfo) {
      console.error('CFO not found:', cfoError)
      return NextResponse.json(
        { success: false, error: 'CFOが見つかりません' },
        { status: 404 }
      )
    }

    // CFO詳細プロフィール情報を取得
    const { data: cfoProfile } = await supabaseAdmin
      .from('rextrix_cfo_profiles')
      .select('*')
      .eq('cfo_id', cfo.id)
      .single()

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

    // ユーザープロフィール情報を取得（フォールバック用）
    let fallbackName = 'CFO'
    let fallbackNickname = ''
    
    if (!cfoProfile?.full_name && !cfoProfile?.display_name) {
      const { data: userProfile } = await supabaseAdmin
        .from('rextrix_user_profiles')
        .select('display_name, nickname')
        .eq('user_id', cfo.user_id)
        .single()
      
      fallbackName = userProfile?.display_name || userProfile?.nickname || 'CFO'
      fallbackNickname = userProfile?.nickname || ''
    }

    // 現在のユーザーがこのCFOに送信したスカウト状態を確認
    const { data: existingScout } = await supabaseAdmin
      .from('rextrix_scouts')
      .select('id, status, created_at')
      .eq('sender_id', session.user.id)
      .eq('recipient_id', cfo.user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // スカウト状態の判定
    let scoutStatus = 'not_sent' // 未送信
    let scoutStatusText = 'スカウト可能'
    
    if (existingScout) {
      scoutStatus = existingScout.status
      switch (existingScout.status) {
        case 'pending':
          scoutStatusText = 'スカウト送信済み（返答待ち）'
          break
        case 'accepted':
          scoutStatusText = 'スカウト承諾済み'
          break
        case 'rejected':
          scoutStatusText = 'スカウト辞退済み'
          break
        case 'withdrawn':
          scoutStatusText = 'スカウト取り消し済み'
          break
        default:
          scoutStatusText = 'スカウト可能'
      }
    }

    // データ整形
    const skills = (cfoServices || []).map(service => service.service_name)
    const certifications = (cfoCertifications || []).map(cert => cert.certification_name)
    const workHistory = (cfoWorkHistory || []).map(work => ({
      period: work.end_year ? `${work.start_year}年${work.start_month}月〜${work.end_year}年${work.end_month}月` : `${work.start_year}年${work.start_month}月〜現在`,
      company: work.company_name,
      position: work.position,
      description: work.description
    }))

    const finalName = cfoProfile?.full_name || cfoProfile?.display_name || fallbackName
    const finalNickname = cfoProfile?.nickname || fallbackNickname

    const transformedCFO = {
      id: cfo.id,
      name: finalName,
      nickname: finalNickname,
      skills: skills.length > 0 ? skills : ['財務戦略', '資金調達', 'IPO支援', 'M&A', '経営企画'],
      experience: cfo.experience_summary || cfoProfile?.introduction || '',
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
      detailedCertifications: cfoCertifications || [],
      // CFO詳細ページ用の追加フィールド
      specialties: (cfoServices || []).filter(s => s.speciality).map(s => ({
        area: s.service_name,
        detail: s.service_description || '専門分野です'
      })),
      detailedExperience: workHistory.map(w => `${w.period}: ${w.company} - ${w.position}`),
      pastProjects: workHistory.map(w => ({
        company: w.company,
        period: w.period,
        description: w.description || '業務内容詳細',
        results: ['成果1', '成果2'] // 実際のデータがあれば置き換え
      })),
      workPreferences: {
        location: cfoProfile?.remote_work_available ? ['リモート可', '全国'] : ['要相談'],
        schedule: cfoProfile?.work_style_preference || '相談可能',
        duration: '相談可能',
        startDate: '相談可能'
      },
      education: ['学歴情報'], // 実際のデータがあれば置き換え
      languages: ['日本語'],
      availability: cfo.is_available ? 'すぐに開始可能' : '現在満員',
      lastLogin: new Date().toLocaleDateString('ja-JP'),
      // スカウト状態
      scoutStatus: scoutStatus,
      scoutStatusText: scoutStatusText,
      canSendScout: scoutStatus === 'not_sent' || scoutStatus === 'rejected',
      existingScoutId: existingScout?.id || null
    }

    return NextResponse.json({
      success: true,
      data: transformedCFO
    })

  } catch (error) {
    console.error('CFO detail fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'CFO詳細の取得に失敗しました' },
      { status: 500 }
    )
  }
}