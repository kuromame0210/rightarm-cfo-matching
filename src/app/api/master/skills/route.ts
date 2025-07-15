// スキルマスターAPI - 新アーキテクチャ対応版（固定リスト提供）
import { NextRequest, NextResponse } from 'next/server'

// 新アーキテクチャ: マスターテーブル廃止、固定リストで提供
const FINANCE_SKILLS = [
  // IPO・上場関連
  'IPO支援', 'IPO準備', '上場準備', '株式公開', '証券会社対応',
  
  // M&A関連  
  'M&A', 'M&Aアドバイザリー', '企業買収', '企業売却', 'PMI', 'DD（デューデリジェンス）',
  
  // 資金調達
  '資金調達', 'VC対応', '銀行折衝', '債務調整', '資本政策', 'エクイティファイナンス',
  
  // 財務戦略
  '財務戦略', '予算管理', '中期計画', '事業計画', '投資計画', 'キャッシュフロー管理',
  
  // 経理・会計
  '財務会計', '管理会計', '税務', '連結決算', '月次決算', '原価計算', '予実管理',
  
  // 内部統制・ガバナンス
  '内部統制', 'SOX法対応', 'ガバナンス', 'リスク管理', 'コンプライアンス', '監査対応',
  
  // IR・開示
  'IR', '決算説明会', '有価証券報告書', '開示業務', '株主対応',
  
  // システム・DX
  '経理システム', 'ERP導入', 'DX推進', 'BIツール', 'システム導入',
  
  // 業界専門
  'SaaS', 'IT', '製造業', '小売', '不動産', 'ヘルスケア', '金融',
  
  // 海外・国際
  '海外展開', '国際税務', 'IFRS', '海外子会社管理', 'クロスボーダーM&A'
];

const BUSINESS_ISSUES = [
  // 資金・資本関連
  'IPO準備', '資金調達', '資本政策', 'VC対応', '銀行との関係改善',
  
  // 財務体制
  '財務体制強化', '管理会計導入', '予算管理', '経理業務効率化', '月次決算早期化',
  
  // 成長・事業拡大  
  '事業拡大', '新規事業', '海外展開', 'M&A検討', '投資判断',
  
  // コスト・収益性
  'コスト削減', 'コスト最適化', '収益性改善', '原価管理', '損益管理',
  
  // 体制・ガバナンス
  '内部統制', 'ガバナンス強化', 'リスク管理', 'コンプライアンス',
  
  // システム・DX
  '経理システム導入', 'DX推進', 'ERPシステム', 'ペーパーレス化',
  
  // 人材・組織
  '経理人材不足', 'CFO人材確保', '財務チーム強化', '経理教育'
];

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 スキルマスターAPI - 新アーキテクチャ版')

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let skills: string[] = []
    let categoryName = ''

    // カテゴリ別にスキルを提供
    switch (category) {
      case 'finance':
      case 'cfo':
        skills = FINANCE_SKILLS
        categoryName = 'CFOスキル'
        break
      case 'business':
      case 'issues':
        skills = BUSINESS_ISSUES  
        categoryName = '企業課題'
        break
      default:
        // 全てのスキルを提供
        skills = [...FINANCE_SKILLS, ...BUSINESS_ISSUES]
        categoryName = '全スキル'
    }

    // API レスポンス形式に変換
    const skillsData = skills.map((skill, index) => ({
      id: index + 1,
      name: skill,
      description: `${skill}に関する専門知識・経験`,
      category: categoryName,
      isActive: true,
      displayOrder: index + 1
    }))

    const response = {
      success: true,
      data: {
        skills: skillsData,
        grouped: {
          [categoryName]: skillsData
        },
        categories: [categoryName],
        meta: {
          architecture: 'new',
          source: 'hardcoded',
          total: skills.length,
          category: category || 'all'
        }
      }
    }

    console.log(`✅ スキル一覧提供: ${skills.length}件 (${categoryName})`)

    return NextResponse.json(response)

  } catch (error) {
    console.error('🚨 スキルマスターAPI エラー:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'スキル一覧の取得中にエラーが発生しました',
        meta: { architecture: 'new', source: 'hardcoded' }
      },
      { status: 500 }
    )
  }
}

// POST: 新アーキテクチャでは不要（固定リストのため）
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      success: false, 
      error: '新アーキテクチャではスキルの動的追加は不要です。固定リストを使用してください。',
      meta: { architecture: 'new', feature: 'disabled' }
    },
    { status: 501 }
  )
}