// マスターデータ: スキル・専門分野 API
import { NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'
import { TABLES } from '@/lib/constants'

// GET: スキル一覧を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const active = searchParams.get('active')

    let query = supabaseAdmin
      .from(TABLES.SKILL_TAGS)
      .select('*')
      .order('name', { ascending: true })

    // カテゴリフィルター
    if (category) {
      query = query.eq('category', category)
    }

    // アクティブフィルター
    if (active !== null) {
      query = query.eq('is_active', active === 'true')
    }

    const { data: skills, error } = await query

    if (error) {
      console.error('Skills fetch error:', error)
      return createErrorResponse('スキル一覧の取得に失敗しました', { status: 500 })
    }

    // カテゴリ別にグループ化
    const groupedSkills = skills?.reduce((acc: any, skill: any) => {
      const category = skill.category || 'その他'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        category: skill.category,
        isActive: skill.is_active,
        displayOrder: skill.display_order || 999
      })
      return acc
    }, {})

    return createSuccessResponse({
      skills: skills?.map((skill: any) => ({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        category: skill.category,
        isActive: skill.is_active,
        displayOrder: skill.display_order || 999
      })) || [],
      grouped: groupedSkills || {},
      categories: Object.keys(groupedSkills || {}).sort()
    })

  } catch (error) {
    console.error('Skills API error:', error)
    return createErrorResponse('スキル一覧の取得中にエラーが発生しました', { status: 500 })
  }
}

// POST: 新しいスキルを追加（管理者用）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, category } = body

    if (!name?.trim()) {
      return createErrorResponse('スキル名は必須です', { status: 400 })
    }

    // 重複チェック
    const { data: existing } = await supabaseAdmin
      .from(TABLES.SKILL_TAGS)
      .select('id')
      .eq('name', name.trim())
      .single()

    if (existing) {
      return createErrorResponse('このスキル名は既に存在します', { status: 409 })
    }

    const { data: skill, error } = await supabaseAdmin
      .from(TABLES.SKILL_TAGS)
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        category: category?.trim() || 'その他',
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Skill creation error:', error)
      return createErrorResponse('スキルの作成に失敗しました', { status: 500 })
    }

    return createSuccessResponse(skill, { message: 'スキルを作成しました' })

  } catch (error) {
    console.error('Skill creation API error:', error)
    return createErrorResponse('スキル作成中にエラーが発生しました', { status: 500 })
  }
}