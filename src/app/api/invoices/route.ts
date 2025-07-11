// RightArm v3 請求書管理 API Route
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

// 請求書作成用スキーマ
const createInvoiceSchema = z.object({
  contractId: z.string().uuid('有効な契約IDを指定してください'),
  invoiceDate: z.string().datetime('有効な請求日を指定してください'),
  dueDate: z.string().datetime('有効な支払期限を指定してください'),
  workingDays: z.number().min(0, '稼働日数は0日以上である必要があります'),
  workingHours: z.number().min(0, '稼働時間は0時間以上である必要があります').optional(),
  hourlyRate: z.number().min(0, '時給は0円以上である必要があります').optional(),
  amount: z.number().min(0, '請求金額は0円以上である必要があります'),
  description: z.string().optional(),
  notes: z.string().optional(),
})

// 請求書更新用スキーマ (将来のPATCH/PUTメソッドで使用予定)
// const updateInvoiceSchema = createInvoiceSchema.partial().extend({
//   status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional()
// })

// GET: 請求書一覧取得
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
    const contractId = searchParams.get('contractId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

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
      .from(TABLES.INVOICES)
      .select(`
        *,
        ${TABLES.CONTRACTS} (
          id,
          contract_type,
          start_date,
          end_date,
          ${TABLES.COMPANIES} (
            company_name,
            business_name,
            ${TABLES.USERS}!rextrix_companies_user_id_fkey (
              email,
              ${TABLES.USER_PROFILES} (
                display_name
              )
            )
          ),
          ${TABLES.CFOS} (
            specialization,
            ${TABLES.USERS}!rextrix_cfos_user_id_fkey (
              email,
              ${TABLES.USER_PROFILES} (
                display_name,
                nickname
              )
            )
          )
        )
      `)

    // ユーザータイプに応じてフィルタリング
    if (userData.user_type === 'company') {
      // 企業ユーザーは自社の契約に関する請求書のみ表示
      const { data: companyData } = await supabase
        .from(TABLES.COMPANIES)
        .select('id')
        .eq('user_id', userData.id)
        .single()

      if (companyData) {
        query = query.eq(`${TABLES.CONTRACTS}.company_id`, companyData.id)
      }
    } else if (userData.user_type === 'cfo') {
      // CFOユーザーは自分の契約に関する請求書のみ表示
      const { data: cfoData } = await supabase
        .from(TABLES.CFOS)
        .select('id')
        .eq('user_id', userData.id)
        .single()

      if (cfoData) {
        query = query.eq(`${TABLES.CONTRACTS}.cfo_id`, cfoData.id)
      }
    }

    // フィルタリング
    if (status) {
      query = query.eq('status', status)
    }

    if (contractId) {
      query = query.eq('contract_id', contractId)
    }

    if (startDate) {
      query = query.gte('invoice_date', startDate)
    }

    if (endDate) {
      query = query.lte('invoice_date', endDate)
    }

    // ページネーション
    const offset = (page - 1) * limit
    query = query
      .order('invoice_date', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: invoices, error, count } = await query

    if (error) {
      console.error('Invoices fetch error:', error)
      return NextResponse.json(
        { success: false, error: '請求書一覧の取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: invoices || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      }
    })

  } catch (error) {
    console.error('Invoices fetch error:', error)
    return NextResponse.json(
      { success: false, error: '請求書一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: 新規請求書作成
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
    const validatedData = createInvoiceSchema.parse(body)

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

    // 権限チェック（CFOユーザーのみ請求書作成可能）
    if (userData.user_type !== 'cfo') {
      return NextResponse.json(
        { success: false, error: '請求書の作成はCFOユーザーのみ可能です' },
        { status: 403 }
      )
    }

    // 契約の存在確認と権限チェック
    const { data: contractData } = await supabase
      .from(TABLES.CONTRACTS)
      .select(`
        *,
        ${TABLES.CFOS} (
          user_id
        )
      `)
      .eq('id', validatedData.contractId)
      .eq('status', 'active')
      .single()

    if (!contractData) {
      return NextResponse.json(
        { success: false, error: '指定された契約が見つからないか、アクティブではありません' },
        { status: 404 }
      )
    }

    if (contractData.rextrix_cfos?.user_id !== userData.id) {
      return NextResponse.json(
        { success: false, error: 'この契約に対して請求書を作成する権限がありません' },
        { status: 403 }
      )
    }

    // 請求書番号生成（年月-連番形式）
    const invoiceDate = new Date(validatedData.invoiceDate)
    const yearMonth = invoiceDate.toISOString().slice(0, 7).replace('-', '')
    
    const { data: lastInvoice } = await supabase
      .from(TABLES.INVOICES)
      .select('invoice_number')
      .like('invoice_number', `${yearMonth}%`)
      .order('invoice_number', { ascending: false })
      .limit(1)
      .single()

    let invoiceNumber = `${yearMonth}001`
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoice_number.slice(-3))
      invoiceNumber = `${yearMonth}${String(lastNumber + 1).padStart(3, '0')}`
    }

    // プラットフォーム手数料計算 (5%)
    const platformFeeRate = 0.05;
    const consultingFee = validatedData.amount;
    const platformFee = Math.floor(consultingFee * platformFeeRate);
    const totalAmount = consultingFee + platformFee;

    // 請求書作成
    const { data: invoice, error: invoiceError } = await supabase
      .from(TABLES.INVOICES)
      .insert({
        contract_id: validatedData.contractId,
        invoice_number: invoiceNumber,
        invoice_date: validatedData.invoiceDate,
        due_date: validatedData.dueDate,
        period_start: validatedData.invoiceDate,
        period_end: validatedData.dueDate,
        consulting_fee: consultingFee,
        platform_fee_rate: platformFeeRate,
        platform_fee: platformFee,
        total_amount: totalAmount,
        status: 'pending',
      })
      .select()
      .single()

    if (invoiceError) {
      console.error('Invoice creation error:', invoiceError)
      return NextResponse.json(
        { success: false, error: '請求書の作成に失敗しました' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: invoice,
      message: '請求書を作成しました'
    })

  } catch (error) {
    console.error('Invoice creation error:', error)
    
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
      { success: false, error: '請求書の作成に失敗しました' },
      { status: 500 }
    )
  }
}