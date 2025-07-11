// RightArm v3 個別契約管理 API Route
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

// 契約更新用スキーマ
const updateContractSchema = z.object({
  contractType: z.enum(['regular', 'project', 'consultant']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  workingDays: z.number().min(1).optional(),
  hourlyRate: z.number().min(0).optional(),
  monthlyFee: z.number().min(0).optional(),
  description: z.string().optional(),
  terms: z.string().optional(),
  status: z.enum(['active', 'completed', 'cancelled', 'pending']).optional()
})

// GET: 契約詳細取得
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

    const { id: contractId } = await params

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

    // 契約詳細取得
    const { data: contract, error } = await supabase
      .from(TABLES.CONTRACTS)
      .select(`
        *,
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
          hourly_rate_min,
          hourly_rate_max,
          ${TABLES.USERS}!rextrix_cfos_user_id_fkey (
            email,
            ${TABLES.USER_PROFILES} (
              display_name,
              nickname,
              phone_number
            )
          )
        )
      `)
      .eq('id', contractId)
      .single()

    if (error || !contract) {
      return NextResponse.json(
        { success: false, error: '契約が見つかりません' },
        { status: 404 }
      )
    }

    // アクセス権限チェック
    const hasAccess = 
      (userData.user_type === 'company' && 
       contract.rextrix_companies?.rextrix_users?.some((u: any) => u.id === userData.id)) ||
      (userData.user_type === 'cfo' && 
       contract.rextrix_cfos?.rextrix_users?.some((u: any) => u.id === userData.id))

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'この契約にアクセスする権限がありません' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: contract
    })

  } catch (error) {
    console.error('Contract detail fetch error:', error)
    return NextResponse.json(
      { success: false, error: '契約詳細の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// PUT: 契約更新
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

    const { id: contractId } = await params
    const body = await request.json()
    const validatedData = updateContractSchema.parse(body)

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

    // 既存契約取得
    const { data: existingContract } = await supabase
      .from(TABLES.CONTRACTS)
      .select(`
        *,
        ${TABLES.COMPANIES} (
          ${TABLES.USERS}!rextrix_companies_user_id_fkey (id)
        ),
        ${TABLES.CFOS} (
          ${TABLES.USERS}!rextrix_cfos_user_id_fkey (id)
        )
      `)
      .eq('id', contractId)
      .single()

    if (!existingContract) {
      return NextResponse.json(
        { success: false, error: '契約が見つかりません' },
        { status: 404 }
      )
    }

    // 権限チェック（契約当事者のみ更新可能）
    const hasAccess = 
      (userData.user_type === 'company' && 
       existingContract.rextrix_companies?.rextrix_users?.some((u: any) => u.id === userData.id)) ||
      (userData.user_type === 'cfo' && 
       existingContract.rextrix_cfos?.rextrix_users?.some((u: any) => u.id === userData.id))

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: 'この契約を更新する権限がありません' },
        { status: 403 }
      )
    }

    // 契約更新
    const { data: updatedContract, error: updateError } = await supabase
      .from(TABLES.CONTRACTS)
      .update({
        contract_type: validatedData.contractType,
        start_date: validatedData.startDate,
        end_date: validatedData.endDate,
        working_days: validatedData.workingDays,
        hourly_rate: validatedData.hourlyRate,
        monthly_fee: validatedData.monthlyFee,
        description: validatedData.description,
        terms: validatedData.terms,
        status: validatedData.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contractId)
      .select()
      .single()

    if (updateError) {
      console.error('Contract update error:', updateError)
      return NextResponse.json(
        { success: false, error: '契約の更新に失敗しました' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedContract,
      message: '契約を更新しました'
    })

  } catch (error) {
    console.error('Contract update error:', error)
    
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
      { success: false, error: '契約の更新に失敗しました' },
      { status: 500 }
    )
  }
}

// DELETE: 契約削除
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

    const { id: contractId } = await params

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

    // 既存契約取得
    const { data: existingContract } = await supabase
      .from(TABLES.CONTRACTS)
      .select(`
        *,
        ${TABLES.COMPANIES} (
          ${TABLES.USERS}!rextrix_companies_user_id_fkey (id)
        )
      `)
      .eq('id', contractId)
      .single()

    if (!existingContract) {
      return NextResponse.json(
        { success: false, error: '契約が見つかりません' },
        { status: 404 }
      )
    }

    // 権限チェック（企業ユーザーのみ削除可能）
    const hasAccess = 
      userData.user_type === 'company' && 
      existingContract.rextrix_companies?.rextrix_users?.some((u: any) => u.id === userData.id)

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: '契約を削除する権限がありません' },
        { status: 403 }
      )
    }

    // 契約がアクティブでないことを確認
    if (existingContract.status === 'active') {
      return NextResponse.json(
        { success: false, error: 'アクティブな契約は削除できません。まず契約をキャンセルしてください' },
        { status: 400 }
      )
    }

    // 契約削除
    const { error: deleteError } = await supabase
      .from(TABLES.CONTRACTS)
      .delete()
      .eq('id', contractId)

    if (deleteError) {
      console.error('Contract delete error:', deleteError)
      return NextResponse.json(
        { success: false, error: '契約の削除に失敗しました' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '契約を削除しました'
    })

  } catch (error) {
    console.error('Contract delete error:', error)
    return NextResponse.json(
      { success: false, error: '契約の削除に失敗しました' },
      { status: 500 }
    )
  }
}