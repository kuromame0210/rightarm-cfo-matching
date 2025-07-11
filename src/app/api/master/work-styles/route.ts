// マスターデータ: 勤務形態 API
import { NextRequest } from 'next/server'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'

// 勤務形態データ
const WORK_STYLES_DATA = [
  {
    id: 'remote',
    name: 'リモート可',
    description: '完全リモートワーク対応',
    category: 'location',
    displayOrder: 1,
    isPopular: true
  },
  {
    id: 'hybrid',
    name: 'ハイブリッド',
    description: 'リモート・出社の組み合わせ',
    category: 'location',
    displayOrder: 2,
    isPopular: true
  },
  {
    id: 'onsite',
    name: '出社必須',
    description: '基本的に出社での勤務',
    category: 'location',
    displayOrder: 3,
    isPopular: false
  },
  
  // 頻度ベース
  {
    id: 'weekly_1',
    name: '週1日〜',
    description: '週1日からの勤務',
    category: 'frequency',
    displayOrder: 10,
    isPopular: true
  },
  {
    id: 'weekly_2',
    name: '週2日〜',
    description: '週2日からの勤務',
    category: 'frequency',
    displayOrder: 11,
    isPopular: true
  },
  {
    id: 'weekly_3',
    name: '週3日〜',
    description: '週3日からの勤務',
    category: 'frequency',
    displayOrder: 12,
    isPopular: true
  },
  {
    id: 'weekly_4',
    name: '週4日〜',
    description: '週4日からの勤務',
    category: 'frequency',
    displayOrder: 13,
    isPopular: false
  },
  {
    id: 'fulltime',
    name: 'フルタイム',
    description: '週5日フルタイム勤務',
    category: 'frequency',
    displayOrder: 14,
    isPopular: true
  },
  
  // 月ベース
  {
    id: 'monthly_1',
    name: '月1回〜',
    description: '月1回からの勤務',
    category: 'frequency',
    displayOrder: 20,
    isPopular: false
  },
  {
    id: 'monthly_2',
    name: '月2回〜',
    description: '月2回からの勤務',
    category: 'frequency',
    displayOrder: 21,
    isPopular: false
  },
  {
    id: 'monthly_4',
    name: '月4回〜',
    description: '月4回からの勤務',
    category: 'frequency',
    displayOrder: 22,
    isPopular: false
  },
  
  // プロジェクトベース
  {
    id: 'project',
    name: 'プロジェクト単位',
    description: 'プロジェクトベースでの参画',
    category: 'project',
    displayOrder: 30,
    isPopular: true
  },
  {
    id: 'consulting',
    name: 'コンサルティング',
    description: 'アドバイザリー・コンサルティング',
    category: 'project',
    displayOrder: 31,
    isPopular: true
  },
  {
    id: 'temporary',
    name: '一時的支援',
    description: '短期間の集中的支援',
    category: 'project',
    displayOrder: 32,
    isPopular: false
  },
  {
    id: 'long_term',
    name: '長期コミット',
    description: '長期的な継続参画',
    category: 'project',
    displayOrder: 33,
    isPopular: true
  },
  
  // 特殊な勤務形態
  {
    id: 'flexible',
    name: 'フレキシブル',
    description: '柔軟な勤務形態で相談可',
    category: 'special',
    displayOrder: 40,
    isPopular: true
  },
  {
    id: 'negotiable',
    name: '応相談',
    description: '勤務形態は相談して決定',
    category: 'special',
    displayOrder: 41,
    isPopular: false
  }
]

// GET: 勤務形態一覧を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') // 'location', 'frequency', 'project', 'special'
    const popular = searchParams.get('popular') === 'true'

    let filteredStyles = WORK_STYLES_DATA

    // カテゴリフィルター
    if (category) {
      filteredStyles = filteredStyles.filter(style => style.category === category)
    }

    // 人気フィルター
    if (popular) {
      filteredStyles = filteredStyles.filter(style => style.isPopular)
    }

    // 表示順でソート
    filteredStyles.sort((a, b) => a.displayOrder - b.displayOrder)

    // カテゴリ別にグループ化
    const grouped = filteredStyles.reduce((acc: any, style) => {
      if (!acc[style.category]) {
        acc[style.category] = []
      }
      acc[style.category].push(style)
      return acc
    }, {})

    return createSuccessResponse({
      workStyles: filteredStyles,
      grouped,
      categories: Object.keys(grouped),
      total: filteredStyles.length
    })

  } catch (error) {
    console.error('Work styles API error:', error)
    return createErrorResponse('勤務形態一覧の取得中にエラーが発生しました', { status: 500 })
  }
}