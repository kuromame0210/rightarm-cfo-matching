// 個別企業取得 API Route
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { TABLES } from '@/lib/constants'

// GET: 企業詳細を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const companyId = resolvedParams.id

    console.log('Fetching company details for ID:', companyId)

    // 企業詳細を取得
    const { data: company, error } = await supabaseAdmin
      .from(TABLES.COMPANIES)
      .select('*')
      .eq('id', companyId)
      .single()

    if (error) {
      console.error('Company fetch error:', error)
      return NextResponse.json(
        { success: false, error: '企業が見つかりません' },
        { status: 404 }
      )
    }

    if (!company) {
      return NextResponse.json(
        { success: false, error: '企業が見つかりません' },
        { status: 404 }
      )
    }

    console.log('Company found:', company)

    return NextResponse.json({
      success: true,
      data: company
    })

  } catch (error) {
    console.error('Company details fetch error:', error)
    return NextResponse.json(
      { success: false, error: '企業詳細の取得に失敗しました' },
      { status: 500 }
    )
  }
}