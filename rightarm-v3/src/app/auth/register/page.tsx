'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function RegisterPageContent() {
  const searchParams = useSearchParams()
  const initialType = searchParams.get('type')
  const [userType, setUserType] = useState<'company' | 'cfo' | null>(
    (initialType === 'company' || initialType === 'cfo') ? initialType : null
  )
  const [selectedRevenue, setSelectedRevenue] = useState('')
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([])
  const [selectedSkills, setSelectedSkills] = useState<{[key: string]: string[]}>({})
  const [expandedSkillCategory, setExpandedSkillCategory] = useState<string | null>(null)

  // v5.1仕様書に基づく推定年商選択肢
  const revenueOptions = [
    { value: 'under_100m', label: '1億円未満' },
    { value: '100m_1b', label: '1〜10億円' },
    { value: '1b_10b', label: '10〜30億円' },
    { value: '10b_30b', label: '30〜50億円' },
    { value: 'over_50b', label: '50億円以上' },
    { value: 'private', label: '非公開' }
  ]

  // v5.1仕様書に基づく財務課題タグ大分類
  const challengeTags = [
    '資金調達', 'IPO準備', '財務DX・システム導入', '事業承継・再生', 
    '組織・ガバナンス', 'M&A関連', '管理会計強化', '補助金活用',
    '銀行融資', '投資家対応', '原価計算', '予実管理', 'その他'
  ]

  // v5.1仕様書に基づく専門スキル大分類6種
  const skillCategories = {
    '資金調達': ['VC調達', '銀行融資', '補助金申請', '投資家対応', 'クラウドファンディング', '社債発行'],
    'IPO・M&A関連': ['IPO準備', 'M&A戦略', '企業価値評価', 'DD対応', 'IR活動', '上場審査対応'],
    '財務DX・システム導入': ['ERP導入', '管理会計システム', 'BI導入', 'API連携', 'RPA導入', 'SaaS選定'],
    '事業承継・再生': ['事業承継計画', '事業再生', 'リストラクチャリング', '組織再編', '後継者育成', '株価算定'],
    '組織・ガバナンス': ['内部統制', 'コンプライアンス', 'リスク管理', 'KPI設計', '予算管理', '取締役会運営'],
    'その他': ['国際税務', '連結決算', 'IFRS', '原価計算', '管理会計', '財務分析']
  }

  // URLパラメータの変更を監視（必要に応じて更新）
  useEffect(() => {
    const type = searchParams.get('type')
    if (type === 'company' || type === 'cfo') {
      setUserType(type)
    }
  }, [searchParams])

  // 財務課題タグの選択/解除
  const toggleChallenge = (challenge: string) => {
    setSelectedChallenges(prev =>
      prev.includes(challenge)
        ? prev.filter(c => c !== challenge)
        : [...prev, challenge]
    )
  }

  // スキル選択/解除
  const toggleSkill = (category: string, skill: string) => {
    setSelectedSkills(prev => {
      const categorySkills = prev[category] || []
      const newCategorySkills = categorySkills.includes(skill)
        ? categorySkills.filter(s => s !== skill)
        : [...categorySkills, skill]
      
      return {
        ...prev,
        [category]: newCategorySkills
      }
    })
  }

  // アコーディオンの開閉
  const toggleSkillCategory = (category: string) => {
    setExpandedSkillCategory(expandedSkillCategory === category ? null : category)
  }

  if (!userType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">RightArm</h1>
            <p className="text-gray-600">会員登録</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setUserType('company')}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center">
                <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl">🏢</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">企業として登録</h3>
                  <p className="text-sm text-gray-600">CFOを探したい企業の方</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setUserType('cfo')}
              className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center">
                <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl">👤</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">CFOとして登録</h3>
                  <p className="text-sm text-gray-600">企業を支援したいCFOの方</p>
                </div>
              </div>
            </button>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              既にアカウントをお持ちの方は{' '}
              <Link href="/auth/login" className="text-gray-900 hover:underline font-medium">
                ログイン
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {userType === 'company' ? '企業登録' : 'CFO登録'}
          </h1>
          <button
            onClick={() => setUserType(null)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← 登録タイプを変更
          </button>
        </div>

        <form className="space-y-6">
          {/* 共通必須項目 */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {userType === 'company' ? '担当者名' : '氏名/ニックネーム'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* 企業側固有項目 */}
          {userType === 'company' && (
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">企業情報</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    会社名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">事業名</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">会社概要</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                {/* v5.1仕様書準拠：推定年商ラジオボタンリスト */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">推定年商</label>
                  <div className="space-y-2">
                    {revenueOptions.map((option) => (
                      <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="revenue"
                          value={option.value}
                          checked={selectedRevenue === option.value}
                          onChange={(e) => setSelectedRevenue(e.target.value)}
                          className="mr-3 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-900">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* v5.1仕様書準拠：財務課題タグ大分類（TagSelector展開式UI） */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    財務課題タグ大分類
                    <span className="text-xs text-gray-500 ml-2">（複数選択可）</span>
                  </label>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex flex-wrap gap-2">
                      {challengeTags.map((challenge) => (
                        <button
                          key={challenge}
                          type="button"
                          onClick={() => toggleChallenge(challenge)}
                          className={`px-3 py-2 rounded-full text-sm border transition-all duration-200 ${
                            selectedChallenges.includes(challenge)
                              ? 'bg-blue-100 text-blue-700 border-blue-300 shadow-sm'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                          }`}
                        >
                          {challenge}
                        </button>
                      ))}
                    </div>
                    {selectedChallenges.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <p className="text-xs text-gray-600">選択中: {selectedChallenges.length}件</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedChallenges.map((challenge) => (
                            <span key={challenge} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {challenge}
                              <button
                                type="button"
                                onClick={() => toggleChallenge(challenge)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CFO側固有項目 */}
          {userType === 'cfo' && (
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">CFO情報</h3>
              <div className="space-y-6">
                {/* v5.1仕様書準拠：専門スキル大分類6種（Accordion-TagSelector） */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    専門スキル大分類
                    <span className="text-xs text-gray-500 ml-2">（カテゴリをクリックして展開）</span>
                  </label>
                  <div className="space-y-2">
                    {Object.entries(skillCategories).map(([category, skills]) => {
                      const isExpanded = expandedSkillCategory === category
                      const selectedCount = (selectedSkills[category] || []).length
                      
                      return (
                        <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* アコーディオンヘッダー */}
                          <button
                            type="button"
                            onClick={() => toggleSkillCategory(category)}
                            className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <span className="font-medium text-gray-900">{category}</span>
                              {selectedCount > 0 && (
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {selectedCount}選択
                                </span>
                              )}
                            </div>
                            <span className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                              ▼
                            </span>
                          </button>
                          
                          {/* アコーディオンコンテンツ */}
                          {isExpanded && (
                            <div className="p-4 bg-white border-t border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {skills.map((skill) => {
                                  const isSelected = (selectedSkills[category] || []).includes(skill)
                                  return (
                                    <label 
                                      key={skill} 
                                      className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                                        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleSkill(category, skill)}
                                        className="mr-3 text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className={`text-sm ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                                        {skill}
                                      </span>
                                    </label>
                                  )
                                })}
                              </div>
                              
                              {/* 選択済みスキル表示 */}
                              {selectedCount > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-xs text-gray-600 mb-2">選択中のスキル:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {(selectedSkills[category] || []).map((skill) => (
                                      <span key={skill} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                        {skill}
                                        <button
                                          type="button"
                                          onClick={() => toggleSkill(category, skill)}
                                          className="ml-1 text-blue-600 hover:text-blue-800"
                                        >
                                          ✕
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* 全体の選択サマリー */}
                  {Object.values(selectedSkills).some(skills => skills.length > 0) && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">選択済みスキル一覧</h4>
                      <div className="text-xs text-blue-800">
                        {Object.entries(selectedSkills).map(([category, skills]) => 
                          skills.length > 0 && (
                            <div key={category} className="mb-1">
                              <strong>{category}:</strong> {skills.join(', ')}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">実績・経歴</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    rows={3}
                    placeholder="過去の実績や経歴をご記入ください"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">稼働希望形態</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent">
                    <option value="">選択してください</option>
                    <option value="weekly">週1日〜</option>
                    <option value="monthly">月1回〜</option>
                    <option value="project">プロジェクト単位</option>
                    <option value="flexible">相談可能</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">希望報酬イメージ</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    placeholder="例：月20万円〜、時給1万円〜"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <Link
              href="/"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
            >
              登録する
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    }>
      <RegisterPageContent />
    </Suspense>
  )
}