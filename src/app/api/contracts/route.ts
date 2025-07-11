// RightArm v3 契約管理 API Route
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'
import { z } from 'zod'

// 認証チェック用ヘルパー関数
async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    return null
  }

  return user
}

// 契約作成用スキーマ
const createContractSchema = z.object({
  cfoId: z.string().uuid('有効なCFO IDを指定してください'),
  companyId: z.string().uuid('有効な企業IDを指定してください'),
  contractType: z.enum(['regular', 'project', 'consultant'], {
    errorMap: () => ({ message: '契約タイプは regular, project, consultant のいずれかを指定してください' })
  }),
  startDate: z.string().datetime('有効な開始日を指定してください'),
  endDate: z.string().datetime('有効な終了日を指定してください').optional(),
  workingDays: z.number().min(1, '稼働日数は1日以上である必要があります').optional(),
  hourlyRate: z.number().min(0, '時給は0円以上である必要があります').optional(),
  monthlyFee: z.number().min(0, '月額料金は0円以上である必要があります').optional(),
  description: z.string().optional(),
  terms: z.string().optional(),
})

// 契約更新用スキーマ (将来のPATCH/PUTメソッド用)
// const updateContractSchema = createContractSchema.partial().extend({
//   status: z.enum(['active', 'completed', 'cancelled', 'pending']).optional()
// })

// GET: 契約一覧取得
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const userType = searchParams.get('userType') // 'company' or 'cfo'

    // ユーザー情報取得
    const { data: userData } = await supabase
      .from(TABLES.USERS)
      .select('id, user_type')
      .eq('supabase_auth_id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'ユーザー情報が見つかりません' },
        { status: 404 }
      )
    }

    // クエリ構築
    let query = supabase
      .from(TABLES.CONTRACTS)
      .select(`
        *,
        ${TABLES.COMPANIES} (
          company_name,
          business_name,
          industry,
          ${TABLES.USERS}!rextrix_companies_user_id_fkey (
            email,
            ${TABLES.USER_PROFILES} (
              display_name
            )
          )
        ),
        ${TABLES.CFOS} (
          specialization,
          years_of_experience,
          hourly_rate_min,
          hourly_rate_max,
          ${TABLES.USERS}!rextrix_cfos_user_id_fkey (
            email,
            ${TABLES.USER_PROFILES} (
              display_name,
              nickname
            )
          )
        )
      `)

    // ユーザータイプに応じてフィルタリング
    if (userData.user_type === 'company') {
      query = query.eq('company_id', userData.id)
    } else if (userData.user_type === 'cfo') {
      query = query.eq('cfo_id', userData.id)
    } else {
      // 管理者の場合は全ての契約を表示
      if (userType === 'company') {
        const { data: companyData } = await supabase
          .from(TABLES.COMPANIES)
          .select('id')
          .eq('user_id', userData.id)
          .single()
        if (companyData) {
          query = query.eq('company_id', companyData.id)
        }
      } else if (userType === 'cfo') {
        const { data: cfoData } = await supabase
          .from(TABLES.CFOS)
          .select('id')
          .eq('user_id', userData.id)
          .single()
        if (cfoData) {
          query = query.eq('cfo_id', cfoData.id)
        }
      }
    }

    // ステータスフィルタ
    if (status) {
      query = query.eq('status', status)
    }

    // ページネーション
    const offset = (page - 1) * limit
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: contracts, error, count } = await query

    if (error) {
      console.error('Contracts fetch error:', error)
      return NextResponse.json(
        { success: false, error: '契約一覧の取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: contracts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      }
    })

  } catch (error) {
    console.error('Contracts fetch error:', error)
    return NextResponse.json(
      { success: false, error: '契約一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: 新規契約作成
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createContractSchema.parse(body)

    // ユーザー情報取得
    const { data: userData } = await supabase
      .from(TABLES.USERS)
      .select('id, user_type')
      .eq('supabase_auth_id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'ユーザー情報が見つかりません' },
        { status: 404 }
      )
    }

    // 権限チェック（企業ユーザーのみ契約作成可能）
    if (userData.user_type !== 'company') {
      return NextResponse.json(
        { success: false, error: '契約の作成は企業ユーザーのみ可能です' },
        { status: 403 }
      )
    }

    // CFOと企業の存在確認
    const { data: cfoExists } = await supabase
      .from(TABLES.CFOS)
      .select('id')
      .eq('id', validatedData.cfoId)
      .single()

    const { data: companyExists } = await supabase
      .from(TABLES.COMPANIES)
      .select('id')
      .eq('id', validatedData.companyId)
      .eq('user_id', userData.id)
      .single()

    if (!cfoExists) {
      return NextResponse.json(
        { success: false, error: '指定されたCFOが見つかりません' },
        { status: 404 }
      )
    }

    if (!companyExists) {
      return NextResponse.json(
        { success: false, error: '指定された企業が見つからないか、権限がありません' },
        { status: 404 }
      )
    }

    // 契約作成
    const { data: contract, error: contractError } = await supabase
      .from(TABLES.CONTRACTS)
      .insert({
        cfo_id: validatedData.cfoId,
        company_id: validatedData.companyId,
        monthly_fee: validatedData.monthlyFee || 0,
        contract_period: validatedData.endDate ? 
          Math.round((new Date(validatedData.endDate).getTime() - new Date(validatedData.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44)) : 12,
        work_hours_per_month: validatedData.workingDays ? validatedData.workingDays * 8 : null,
        start_date: validatedData.startDate,
        end_date: validatedData.endDate,
        status: 'draft',
      })
      .select()
      .single()

    if (contractError) {
      console.error('Contract creation error:', contractError)
      return NextResponse.json(
        { success: false, error: '契約の作成に失敗しました' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: contract,
      message: '契約を作成しました'
    })

  } catch (error) {
    console.error('Contract creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'バリデーションエラー',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: '契約の作成に失敗しました' },
      { status: 500 }
    )
  }
}