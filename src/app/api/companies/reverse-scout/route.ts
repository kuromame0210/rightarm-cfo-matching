// リバーススカウト用企業一覧 API
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { supabaseAdmin } from '@/lib/supabase'
import { authOptions } from '@/lib/auth/index'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { TABLES } from '@/lib/constants'

// GET: リバーススカウト用企業一覧を取得
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const industry = searchParams.get('industry')
    const stage = searchParams.get('stage')
    const region = searchParams.get('region')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 企業とその課題データを取得
    let query = supabaseAdmin
      .from(TABLES.COMPANIES)
      .select(`
        id,
        company_name,
        description,
        industry,
        company_size,
        founding_year,
        location,
        website_url,
        company_stage,
        logo_url,
        created_at,
        updated_at,
        challenges:rextrix_company_challenges(
          id,
          title,
          description,
          challenge_type,
          priority,
          budget,
          timeline,
          required_skills,
          work_style,
          compensation_min,
          compensation_max,
          is_active
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // フィルター適用
    if (industry) {
      query = query.eq('industry', industry)
    }
    if (stage) {
      query = query.eq('company_stage', stage)
    }
    if (region) {
      query = query.eq('location', region)
    }

    // ページネーション
    query = query.range(offset, offset + limit - 1)

    const { data: companies, error } = await query

    if (error) {
      console.error('Companies fetch error:', error)
      return createErrorResponse('企業一覧の取得に失敗しました', { status: 500 })
    }

    // データを整形
    const formattedCompanies = companies?.map((company: any) => ({
      id: company.id,
      name: company.company_name,
      logoUrl: company.logo_url || '🏢',
      industry: company.industry,
      stage: company.company_stage,
      employeeCount: company.company_size,
      region: company.location,
      foundedYear: company.founding_year,
      description: company.description,
      website: company.website_url,
      
      // 課題データを整形
      challenges: company.challenges
        ?.filter((c: any) => c.is_active)
        ?.map((challenge: any) => ({
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          type: challenge.challenge_type,
          priority: challenge.priority,
          budget: challenge.budget,
          timeline: challenge.timeline,
          requiredSkills: challenge.required_skills || [],
          workStyle: challenge.work_style,
          compensation: {
            min: challenge.compensation_min,
            max: challenge.compensation_max
          }
        })) || [],

      // 表示用データ
      challengeDescription: company.challenges?.[0]?.description || '財務・経営課題の解決をサポートするCFOを求めています',
      challengeTags: company.challenges
        ?.flatMap((c: any) => c.required_skills || [])
        ?.slice(0, 3) || ['財務戦略', '事業計画', '資金調達'],
      
      // 条件まとめ
      requirements: {
        experience: '財務・経営企画経験3年以上',
        skills: company.challenges?.[0]?.required_skills || ['財務分析', '事業計画', '資金調達'],
        workStyle: company.challenges?.[0]?.work_style || '週2-3日・リモート可',
        commitment: '中長期コミット希望'
      },
      
      compensation: company.challenges?.[0]?.compensation_min && company.challenges?.[0]?.compensation_max 
        ? `月${company.challenges[0].compensation_min}万円〜${company.challenges[0].compensation_max}万円`
        : '応相談',
      
      benefits: ['ストックオプション', 'リモート可', '副業OK'],
      cultureKeywords: ['成長志向', 'データドリブン', 'チャレンジ歓迎']
    }))

    // 総数を取得（フィルター条件適用）
    let countQuery = supabaseAdmin
      .from(TABLES.COMPANIES)
      .select('id', { count: 'exact' })
      .eq('is_active', true)

    if (industry) countQuery = countQuery.eq('industry', industry)
    if (stage) countQuery = countQuery.eq('company_stage', stage)
    if (region) countQuery = countQuery.eq('location', region)

    const { count } = await countQuery

    return createSuccessResponse({
      companies: formattedCompanies || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasNext: (count || 0) > offset + limit
      }
    })

  } catch (error) {
    console.error('Reverse scout companies API error:', error)
    return createErrorResponse('企業データの取得中にエラーが発生しました', { status: 500 })
  }
}