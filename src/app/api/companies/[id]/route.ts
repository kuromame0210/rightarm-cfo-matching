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

    // 新アーキテクチャ: biz_profiles テーブルから企業詳細を取得
    const { data: company, error } = await supabaseAdmin
      .from(TABLES.BIZ_PROFILES)
      .select('*')
      .eq('biz_user_id', companyId)
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

    // JSON文字列を解析するヘルパー関数
    const parseProfileDescription = (rawProfile: string): string => {
      if (!rawProfile) return '会社概要未設定'
      
      // JSON文字列かどうか判定（{で始まる場合）
      if (rawProfile.trim().startsWith('{')) {
        try {
          const jsonData = JSON.parse(rawProfile)
          // descriptionフィールドが存在する場合はそれを使用
          return jsonData.description || jsonData.businessName || rawProfile
        } catch (e) {
          // JSON解析に失敗した場合はそのまま返す
          console.warn('JSON解析失敗:', e instanceof Error ? e.message : String(e))
          return rawProfile
        }
      }
      
      // プレーンテキストの場合はそのまま返す
      return rawProfile
    }

    // データ変換（フロントエンド互換性のため）
    const formattedCompany = {
      ...company,
      // 解析された説明文で上書き
      biz_raw_profile: parseProfileDescription(company.biz_raw_profile)
    }

    return NextResponse.json({
      success: true,
      data: formattedCompany
    })

  } catch (error) {
    console.error('Company details fetch error:', error)
    return NextResponse.json(
      { success: false, error: '企業詳細の取得に失敗しました' },
      { status: 500 }
    )
  }
}