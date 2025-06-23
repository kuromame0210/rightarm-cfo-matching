export interface SkillCategory {
  id: string
  name: string
  skills: { id: string; name: string }[]
}

export const skillCategories: SkillCategory[] = [
  {
    id: 'fundraising',
    name: '資金調達',
    skills: [
      { id: 'fundraising-general', name: '資金調達' },
      { id: 'bank-loans', name: '銀行融資対応' },
      { id: 'subsidies', name: '補助金・助成金申請' },
      { id: 'vc-equity', name: 'VC・エクイティ調達' },
      { id: 'investor-relations', name: '投資家対応(IR)' },
      { id: 'capital-policy', name: '資本政策設計' },
      { id: 'financial-dd', name: '財務デューデリ' },
      { id: 'cash-flow-plan', name: '資金繰り表作成' },
      { id: 'cash-flow-improvement', name: 'キャッシュフロー改善' }
    ]
  },
  {
    id: 'ipo-ma',
    name: 'IPO・M&A関連',
    skills: [
      { id: 'ipo-support', name: 'IPO準備支援' },
      { id: 'ipo-internal-control', name: 'IPO内部統制' },
      { id: 'ma-sell-side', name: 'M&Aアドバイザリー(売手)' },
      { id: 'ma-buy-side', name: 'M&Aアドバイザリー(買手)' },
      { id: 'valuation', name: 'バリュエーション' },
      { id: 'pmi-support', name: 'PMI支援' }
    ]
  },
  {
    id: 'financial-dx',
    name: '財務DX／システム導入関連',
    skills: [
      { id: 'management-accounting', name: '管理会計構築' },
      { id: 'monthly-closing', name: '月次決算早期化' },
      { id: 'bi-tools', name: 'BIツール導入' },
      { id: 'cost-accounting', name: '原価計算導入' },
      { id: 'cloud-accounting', name: 'クラウド会計導入' },
      { id: 'erp-implementation', name: 'ERP導入' },
      { id: 'financial-dx-promotion', name: '財務DX推進' }
    ]
  },
  {
    id: 'business-succession',
    name: '事業継承・事業再生',
    skills: [
      { id: 'restructuring-plan', name: '再生計画立案' },
      { id: 'cash-flow-reschedule', name: '資金繰り改善(リスケ)' },
      { id: 'business-succession', name: '事業承継支援' }
    ]
  },
  {
    id: 'organization-governance',
    name: '組織・ガバナンス関連',
    skills: [
      { id: 'accounting-organization', name: '経理組織構築' },
      { id: 'internal-control', name: '内部統制構築' },
      { id: 'accounting-policy', name: '会計方針整備' }
    ]
  },
  {
    id: 'others',
    name: 'その他',
    skills: [
      { id: 'part-time-available', name: '週1日対応可' },
      { id: 'remote-work', name: 'フルリモート可' },
      { id: 'performance-based', name: '成果報酬型対応可' }
    ]
  }
]

export const getAllSkills = () => {
  return skillCategories.flatMap(category => 
    category.skills.map(skill => ({
      ...skill,
      categoryId: category.id,
      categoryName: category.name
    }))
  )
}