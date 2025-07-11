// RightArm v3 個別請求書管理 API Route
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

// 請求書更新用スキーマ
const updateInvoiceSchema = z.object({
  invoiceDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  workingDays: z.number().min(0).optional(),
  workingHours: z.number().min(0).optional(),
  hourlyRate: z.number().min(0).optional(),
  amount: z.number().min(0).optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional()
})

// 支払い記録用スキーマ (将来使用予定)
// const paymentSchema = z.object({
//   paymentDate: z.string().datetime('有効な支払日を指定してください'),
//   paymentMethod: z.enum(['bank_transfer', 'credit_card', 'cash', 'other'], {
//     errorMap: () => ({ message: '支払方法を指定してください' })
//   }),
//   amount: z.number().min(0, '支払金額は0円以上である必要があります'),
//   notes: z.string().optional()
// })

// GET: 請求書詳細取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { id } = await params
    const invoiceId = id

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

    // 請求書詳細取得
    const { data: invoice, error } = await supabase
      .from(TABLES.INVOICES)
      .select(`
        *,
        ${TABLES.CONTRACTS} (
          id,
          contract_type,
          start_date,
          end_date,
          hourly_rate,
          monthly_fee,
          ${TABLES.COMPANIES} (
            id,
            company_name,
            business_name,
            industry,
            region,
            ${TABLES.USERS}!rextrix_companies_user_id_fkey (
              email,
              ${TABLES.USER_PROFILES} (
                display_name,
                phone_number
              )
            )
          ),
          ${TABLES.CFOS} (
            id,
            specialization,
            years_of_experience,
            ${TABLES.USERS}!rextrix_cfos_user_id_fkey (
              email,
              ${TABLES.USER_PROFILES} (
                display_name,
                nickname,
                phone_number
              )
            )
          )
        ),
        ${TABLES.PAYMENTS} (
          id,
          payment_date,
          payment_method,
          amount,
          notes,
          created_at
        )
      `)
      .eq('id', invoiceId)
      .single()

    if (error || !invoice) {
      return NextResponse.json(
        { success: false, error: '請求書が見つかりません' },
        { status: 404 }
      )
    }

    // アクセス権限チェック
    const contract = invoice.rextrix_contracts
    const hasAccess = 
      (userData.user_type === 'company' && 
       contract?.rextrix_companies?.rextrix_users?.some((u: any) => u.id === userData.id)) ||
      (userData.user_type === 'cfo' && 
       contract?.rextrix_cfos?.rextrix_users?.some((u: any) => u.id === userData.id))

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'この請求書にアクセスする権限がありません' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: invoice
    })

  } catch (error) {
    console.error('Invoice detail fetch error:', error)
    return NextResponse.json(
      { success: false, error: '請求書詳細の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// PUT: 請求書更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { id } = await params
    const invoiceId = id
    const body = await request.json()
    const validatedData = updateInvoiceSchema.parse(body)

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

    // 既存請求書取得
    const { data: existingInvoice } = await supabase
      .from(TABLES.INVOICES)
      .select(`
        *,
        ${TABLES.CONTRACTS} (
          ${TABLES.COMPANIES} (
            ${TABLES.USERS}!rextrix_companies_user_id_fkey (id)
          ),
          ${TABLES.CFOS} (
            ${TABLES.USERS}!rextrix_cfos_user_id_fkey (id)
          )
        )
      `)
      .eq('id', invoiceId)
      .single()

    if (!existingInvoice) {
      return NextResponse.json(
        { success: false, error: '請求書が見つかりません' },
        { status: 404 }
      )
    }

    // 権限チェック
    const contract = existingInvoice.rextrix_contracts
    const hasAccess = 
      (userData.user_type === 'company' && 
       contract?.rextrix_companies?.rextrix_users?.some((u: any) => u.id === userData.id)) ||
      (userData.user_type === 'cfo' && 
       contract?.rextrix_cfos?.rextrix_users?.some((u: any) => u.id === userData.id))

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'この請求書を更新する権限がありません' },
        { status: 403 }
      )
    }

    // CFOは draft または sent 状態のみ更新可能
    if (userData.user_type === 'cfo' && 
        !['draft', 'sent'].includes(existingInvoice.status)) {
      return NextResponse.json(
        { success: false, error: 'この状態の請求書は更新できません' },
        { status: 400 }
      )
    }

    // 企業は status のみ更新可能（支払い処理）
    let updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (userData.user_type === 'cfo') {
      updateData = {
        ...updateData,
        invoice_date: validatedData.invoiceDate,
        due_date: validatedData.dueDate,
        working_days: validatedData.workingDays,
        working_hours: validatedData.workingHours,
        hourly_rate: validatedData.hourlyRate,
        amount: validatedData.amount,
        description: validatedData.description,
        notes: validatedData.notes,
        status: validatedData.status,
      }
    } else if (userData.user_type === 'company') {
      // 企業は支払い関連のステータスのみ更新可能
      if (validatedData.status && ['paid', 'overdue'].includes(validatedData.status)) {
        updateData.status = validatedData.status
      }
    }

    // 請求書更新
    const { data: updatedInvoice, error: updateError } = await supabase
      .from(TABLES.INVOICES)
      .update(updateData)
      .eq('id', invoiceId)
      .select()
      .single()

    if (updateError) {
      console.error('Invoice update error:', updateError)
      return NextResponse.json(
        { success: false, error: '請求書の更新に失敗しました' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedInvoice,
      message: '請求書を更新しました'
    })

  } catch (error) {
    console.error('Invoice update error:', error)
    
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
      { success: false, error: '請求書の更新に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE: 請求書削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { id } = await params
    const invoiceId = id

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

    // 既存請求書取得
    const { data: existingInvoice } = await supabase
      .from(TABLES.INVOICES)
      .select(`
        *,
        ${TABLES.CONTRACTS} (
          ${TABLES.CFOS} (
            ${TABLES.USERS}!rextrix_cfos_user_id_fkey (id)
          )
        )
      `)
      .eq('id', invoiceId)
      .single()

    if (!existingInvoice) {
      return NextResponse.json(
        { success: false, error: '請求書が見つかりません' },
        { status: 404 }
      )
    }

    // 権限チェック（CFOのみ削除可能）
    const hasAccess = 
      userData.user_type === 'cfo' && 
      existingInvoice.rextrix_contracts?.rextrix_cfos?.rextrix_users?.some((u: any) => u.id === userData.id)

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: '請求書を削除する権限がありません' },
        { status: 403 }
      )
    }

    // draft 状態のみ削除可能
    if (existingInvoice.status !== 'draft') {
      return NextResponse.json(
        { success: false, error: 'draft 状態の請求書のみ削除できます' },
        { status: 400 }
      )
    }

    // 請求書削除
    const { error: deleteError } = await supabase
      .from(TABLES.INVOICES)
      .delete()
      .eq('id', invoiceId)

    if (deleteError) {
      console.error('Invoice delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: '請求書の削除に失敗しました' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '請求書を削除しました'
    })

  } catch (error) {
    console.error('Invoice delete error:', error)
    return NextResponse.json(
      { success: false, error: '請求書の削除に失敗しました' },
      { status: 500 }
    )
  }
}