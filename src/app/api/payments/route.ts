// RightArm v3 支払い記録 API Route
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

// 支払い記録作成用スキーマ
const createPaymentSchema = z.object({
  invoiceId: z.string().uuid('有効な請求書IDを指定してください'),
  paymentDate: z.string().datetime('有効な支払日を指定してください'),
  paymentMethod: z.enum(['bank_transfer', 'credit_card', 'cash', 'other'], {
    errorMap: () => ({ message: '支払方法を指定してください' })
  }),
  amount: z.number().min(0, '支払金額は0円以上である必要があります'),
  notes: z.string().optional()
})

// POST: 支払い記録作成
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
    const validatedData = createPaymentSchema.parse(body)

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

    // 権限チェック（企業ユーザーのみ支払い記録作成可能）
    if (userData.user_type !== 'company') {
      return NextResponse.json(
        { success: false, error: '支払い記録の作成は企業ユーザーのみ可能です' },
        { status: 403 }
      )
    }

    // 請求書の存在確認と権限チェック
    const { data: invoiceData } = await supabase
      .from(TABLES.INVOICES)
      .select(`
        *,
        ${TABLES.CONTRACTS} (
          ${TABLES.COMPANIES} (
            user_id
          )
        )
      `)
      .eq('id', validatedData.invoiceId)
      .single()

    if (!invoiceData) {
      return NextResponse.json(
        { success: false, error: '指定された請求書が見つかりません' },
        { status: 404 }
      )
    }

    if (invoiceData.rextrix_contracts?.rextrix_companies?.user_id !== userData.id) {
      return NextResponse.json(
        { success: false, error: 'この請求書に対して支払いを記録する権限がありません' },
        { status: 403 }
      )
    }

    // 請求書が sent 状態でない場合はエラー
    if (invoiceData.status !== 'sent') {
      return NextResponse.json(
        { success: false, error: '送付済みの請求書のみ支払い可能です' },
        { status: 400 }
      )
    }

    // 既存の支払い記録を確認
    const { data: existingPayments } = await supabase
      .from(TABLES.PAYMENTS)
      .select('amount')
      .eq('invoice_id', validatedData.invoiceId)

    const totalPaid = existingPayments?.reduce((sum, payment) => sum + payment.amount, 0) || 0
    const newTotal = totalPaid + validatedData.amount

    // 支払い総額が請求金額を超えないかチェック
    if (newTotal > invoiceData.amount) {
      return NextResponse.json(
        { 
          success: false, 
          error: `支払い金額が請求金額を超えています。請求額: ${invoiceData.amount.toLocaleString()}円、既払い額: ${totalPaid.toLocaleString()}円` 
        },
        { status: 400 }
      )
    }

    // 支払い記録作成
    const { data: payment, error: paymentError } = await supabase
      .from(TABLES.PAYMENTS)
      .insert({
        invoice_id: validatedData.invoiceId,
        payment_date: validatedData.paymentDate,
        payment_method: validatedData.paymentMethod,
        amount: validatedData.amount,
        notes: validatedData.notes,
        created_by: userData.id,
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Payment creation error:', paymentError)
      return NextResponse.json(
        { success: false, error: '支払い記録の作成に失敗しました' },
        { status: 400 }
      )
    }

    // 請求書のステータス更新
    let newInvoiceStatus = invoiceData.status
    if (newTotal >= invoiceData.amount) {
      newInvoiceStatus = 'paid'
    }

    await supabase
      .from(TABLES.INVOICES)
      .update({ 
        status: newInvoiceStatus,
        paid_at: newInvoiceStatus === 'paid' ? new Date().toISOString() : null
      })
      .eq('id', validatedData.invoiceId)

    return NextResponse.json({
      success: true,
      data: {
        payment,
        invoiceStatus: newInvoiceStatus,
        totalPaid: newTotal,
        remainingAmount: invoiceData.amount - newTotal
      },
      message: '支払いを記録しました'
    })

  } catch (error) {
    console.error('Payment creation error:', error)
    
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
      { success: false, error: '支払い記録の作成に失敗しました' },
      { status: 500 }
    )
  }
}

// GET: 支払い記録一覧取得
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
    const invoiceId = searchParams.get('invoiceId')
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
      .from(TABLES.PAYMENTS)
      .select(`
        *,
        ${TABLES.INVOICES} (
          id,
          invoice_number,
          amount,
          ${TABLES.CONTRACTS} (
            ${TABLES.COMPANIES} (
              company_name,
              ${TABLES.USERS}!rextrix_companies_user_id_fkey (
                email,
                ${TABLES.USER_PROFILES} (
                  display_name
                )
              )
            ),
            ${TABLES.CFOS} (
              ${TABLES.USERS}!rextrix_cfos_user_id_fkey (
                email,
                ${TABLES.USER_PROFILES} (
                  display_name,
                  nickname
                )
              )
            )
          )
        )
      `)

    // ユーザータイプに応じてフィルタリング
    if (userData.user_type === 'company') {
      // 企業ユーザーは自社の支払い記録のみ表示
      const { data: companyData } = await supabase
        .from(TABLES.COMPANIES)
        .select('id')
        .eq('user_id', userData.id)
        .single()

      if (companyData) {
        query = query.eq(`${TABLES.INVOICES}.${TABLES.CONTRACTS}.company_id`, companyData.id)
      }
    } else if (userData.user_type === 'cfo') {
      // CFOユーザーは自分の契約に関する支払い記録のみ表示
      const { data: cfoData } = await supabase
        .from(TABLES.CFOS)
        .select('id')
        .eq('user_id', userData.id)
        .single()

      if (cfoData) {
        query = query.eq(`${TABLES.INVOICES}.${TABLES.CONTRACTS}.cfo_id`, cfoData.id)
      }
    }

    // フィルタリング
    if (invoiceId) {
      query = query.eq('invoice_id', invoiceId)
    }

    if (startDate) {
      query = query.gte('payment_date', startDate)
    }

    if (endDate) {
      query = query.lte('payment_date', endDate)
    }

    // ページネーション
    const offset = (page - 1) * limit
    query = query
      .order('payment_date', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: payments, error, count } = await query

    if (error) {
      console.error('Payments fetch error:', error)
      return NextResponse.json(
        { success: false, error: '支払い記録一覧の取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: payments || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      }
    })

  } catch (error) {
    console.error('Payments fetch error:', error)
    return NextResponse.json(
      { success: false, error: '支払い記録一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}