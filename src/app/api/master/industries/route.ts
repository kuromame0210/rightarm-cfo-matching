// マスターデータ: 業界 API
import { NextRequest } from 'next/server'
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response'

// 業界データ
const INDUSTRIES_DATA = [
  // IT・テクノロジー
  {
    id: 'saas',
    name: 'SaaS・IT',
    description: 'ソフトウェア・アズ・ア・サービス、ITサービス',
    category: 'technology',
    displayOrder: 1,
    isPopular: true
  },
  {
    id: 'fintech',
    name: 'フィンテック',
    description: '金融テクノロジー、デジタル金融サービス',
    category: 'technology',
    displayOrder: 2,
    isPopular: true
  },
  {
    id: 'edtech',
    name: 'エドテック',
    description: '教育テクノロジー、e-learning',
    category: 'technology',
    displayOrder: 3,
    isPopular: false
  },
  {
    id: 'healthtech',
    name: 'ヘルステック',
    description: '医療・ヘルスケアテクノロジー',
    category: 'technology',
    displayOrder: 4,
    isPopular: true
  },
  {
    id: 'proptech',
    name: 'プロップテック',
    description: '不動産テクノロジー',
    category: 'technology',
    displayOrder: 5,
    isPopular: false
  },
  {
    id: 'agritech',
    name: 'アグリテック',
    description: '農業テクノロジー',
    category: 'technology',
    displayOrder: 6,
    isPopular: false
  },
  
  // エネルギー・環境
  {
    id: 'renewable_energy',
    name: '再生エネルギー',
    description: '太陽光、風力、水力等の再生可能エネルギー',
    category: 'energy',
    displayOrder: 10,
    isPopular: true
  },
  {
    id: 'cleantech',
    name: 'クリーンテック',
    description: '環境技術、サステナビリティ',
    category: 'energy',
    displayOrder: 11,
    isPopular: false
  },
  {
    id: 'carbon_neutral',
    name: 'カーボンニュートラル',
    description: '脱炭素、CO2削減技術',
    category: 'energy',
    displayOrder: 12,
    isPopular: false
  },
  
  // ライフスタイル・消費者向け
  {
    id: 'foodtech',
    name: 'フードテック',
    description: '食品技術、代替食品、農業イノベーション',
    category: 'lifestyle',
    displayOrder: 20,
    isPopular: true
  },
  {
    id: 'fashion',
    name: 'ファッション',
    description: 'アパレル、ファッションテック',
    category: 'lifestyle',
    displayOrder: 21,
    isPopular: false
  },
  {
    id: 'beauty',
    name: 'ビューティー',
    description: '化粧品、美容サービス',
    category: 'lifestyle',
    displayOrder: 22,
    isPopular: false
  },
  {
    id: 'travel',
    name: 'トラベル',
    description: '旅行、観光、ホスピタリティ',
    category: 'lifestyle',
    displayOrder: 23,
    isPopular: false
  },
  
  // エンターテインメント・メディア
  {
    id: 'entertainment',
    name: 'エンタメ',
    description: 'エンターテインメント、ゲーム、コンテンツ',
    category: 'media',
    displayOrder: 30,
    isPopular: true
  },
  {
    id: 'media',
    name: 'メディア',
    description: 'デジタルメディア、コンテンツ配信',
    category: 'media',
    displayOrder: 31,
    isPopular: false
  },
  {
    id: 'sports',
    name: 'スポーツ',
    description: 'スポーツ関連事業、フィットネス',
    category: 'media',
    displayOrder: 32,
    isPopular: false
  },
  
  // 小売・EC
  {
    id: 'ecommerce',
    name: 'EC・小売',
    description: 'Eコマース、オンライン小売',
    category: 'retail',
    displayOrder: 40,
    isPopular: true
  },
  {
    id: 'd2c',
    name: 'D2C',
    description: 'Direct to Consumer、直販ブランド',
    category: 'retail',
    displayOrder: 41,
    isPopular: true
  },
  {
    id: 'marketplace',
    name: 'マーケットプレイス',
    description: 'オンラインマーケットプレイス、プラットフォーム',
    category: 'retail',
    displayOrder: 42,
    isPopular: false
  },
  
  // 製造・インダストリー
  {
    id: 'manufacturing',
    name: '製造業',
    description: '製造業、ものづくり',
    category: 'industrial',
    displayOrder: 50,
    isPopular: false
  },
  {
    id: 'automotive',
    name: '自動車',
    description: '自動車、モビリティ',
    category: 'industrial',
    displayOrder: 51,
    isPopular: false
  },
  {
    id: 'logistics',
    name: '物流',
    description: '物流、配送、サプライチェーン',
    category: 'industrial',
    displayOrder: 52,
    isPopular: false
  },
  
  // 従来型産業
  {
    id: 'finance',
    name: '金融',
    description: '銀行、証券、保険等の従来型金融',
    category: 'traditional',
    displayOrder: 60,
    isPopular: false
  },
  {
    id: 'real_estate',
    name: '不動産',
    description: '不動産開発、管理、仲介',
    category: 'traditional',
    displayOrder: 61,
    isPopular: false
  },
  {
    id: 'consulting',
    name: 'コンサルティング',
    description: '経営コンサルティング、専門サービス',
    category: 'traditional',
    displayOrder: 62,
    isPopular: false
  },
  {
    id: 'education',
    name: '教育',
    description: '教育機関、研修サービス',
    category: 'traditional',
    displayOrder: 63,
    isPopular: false
  },
  {
    id: 'healthcare',
    name: 'ヘルスケア',
    description: '医療、介護、健康サービス',
    category: 'traditional',
    displayOrder: 64,
    isPopular: true
  },
  
  // その他
  {
    id: 'other',
    name: 'その他',
    description: '上記に該当しない業界',
    category: 'other',
    displayOrder: 99,
    isPopular: false
  }
]

// GET: 業界一覧を取得
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') // 'technology', 'energy', 'lifestyle', etc.
    const popular = searchParams.get('popular') === 'true'

    let filteredIndustries = INDUSTRIES_DATA

    // カテゴリフィルター
    if (category) {
      filteredIndustries = filteredIndustries.filter(industry => industry.category === category)
    }

    // 人気フィルター
    if (popular) {
      filteredIndustries = filteredIndustries.filter(industry => industry.isPopular)
    }

    // 表示順でソート
    filteredIndustries.sort((a, b) => a.displayOrder - b.displayOrder)

    // カテゴリ別にグループ化
    const grouped = filteredIndustries.reduce((acc: any, industry) => {
      if (!acc[industry.category]) {
        acc[industry.category] = []
      }
      acc[industry.category].push(industry)
      return acc
    }, {})

    // カテゴリ名のマッピング
    const categoryNames = {
      technology: 'IT・テクノロジー',
      energy: 'エネルギー・環境',
      lifestyle: 'ライフスタイル・消費者向け',
      media: 'エンターテインメント・メディア',
      retail: '小売・EC',
      industrial: '製造・インダストリー',
      traditional: '従来型産業',
      other: 'その他'
    }

    return createSuccessResponse({
      industries: filteredIndustries,
      grouped,
      categories: Object.keys(grouped),
      categoryNames,
      total: filteredIndustries.length
    })

  } catch (error) {
    console.error('Industries API error:', error)
    return createErrorResponse('業界一覧の取得中にエラーが発生しました', { status: 500 })
  }
}