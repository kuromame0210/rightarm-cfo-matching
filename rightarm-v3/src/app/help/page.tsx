'use client'

import { useState } from 'react'
import Link from 'next/link'
import UserDropdown from '@/components/UserDropdown'

export default function HelpPage() {
  const [selectedCategory, setSelectedCategory] = useState('getting-started')
  const [searchQuery, setSearchQuery] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const categories = [
    { id: 'getting-started', name: '使い方・基本操作', icon: '🚀' },
    { id: 'profile', name: 'プロフィール・設定', icon: '👤' },
    { id: 'scout', name: 'スカウト・マッチング', icon: '🎯' },
    { id: 'messages', name: 'メッセージ・面談', icon: '💬' },
    { id: 'payment', name: '料金・支払い', icon: '💰' },
    { id: 'account', name: 'アカウント・セキュリティ', icon: '🔒' }
  ]

  const faqs = [
    {
      id: 1,
      category: 'getting-started',
      question: 'RightArmの基本的な使い方を教えてください',
      answer: 'RightArmは企業とCFOをマッチングするプラットフォームです。1)プロフィールを登録、2)気になる相手を探す、3)スカウト機能で連絡、4)メッセージで詳細を相談、5)面談を設定、という流れで利用します。',
      tags: ['基本操作', '使い方']
    },
    {
      id: 2,
      category: 'getting-started',
      question: '登録後、最初に何をすればよいですか？',
      answer: 'まずプロフィールを充実させることをお勧めします。スキル、経験、希望条件を詳しく入力することで、より適切なマッチングが期待できます。プロフィール完成度が高いほど、スカウトを受け取りやすくなります。',
      tags: ['登録', 'プロフィール']
    },
    {
      id: 3,
      category: 'profile',
      question: 'プロフィールの公開範囲を設定できますか？',
      answer: '設定ページでプロフィールの公開範囲を調整できます。「すべてのユーザーに公開」「認証済みユーザーのみ」「非公開」から選択可能です。また、連絡先情報や報酬情報の表示・非表示も個別に設定できます。',
      tags: ['プライバシー', '公開設定']
    },
    {
      id: 4,
      category: 'scout',
      question: 'スカウト機能の使い方を教えてください',
      answer: 'ホーム画面で気になる相手のプロフィールカードの「スカウト」ボタンをクリックします。メッセージを入力して送信すると、相手に通知が届きます。相手が承諾すると、メッセージでやり取りが開始できます。',
      tags: ['スカウト', 'マッチング']
    },
    {
      id: 5,
      category: 'scout',
      question: '「気になる」機能は何ですか？',
      answer: '「気になる」は興味を示す軽いアクションです。相手に通知は送られませんが、お互いに「気になる」をつけるとマッチング率が上がります。まずは気軽に「気になる」から始めてみてください。',
      tags: ['気になる', 'マッチング']
    },
    {
      id: 6,
      category: 'messages',
      question: 'メッセージのやり取りで注意点はありますか？',
      answer: '相手のプロフィールを読んで、具体的で丁寧なメッセージを心がけてください。初回メッセージでは自己紹介と興味を持った理由を明記することをお勧めします。ファイル添付機能も活用できます。',
      tags: ['メッセージ', 'コミュニケーション']
    },
    {
      id: 7,
      category: 'messages',
      question: '面談の設定方法を教えてください',
      answer: 'メッセージ画面の「面談設定」ボタンから面談を提案できます。日時、形式（オンライン・対面）、アジェンダを含めて提案しましょう。相手が承諾すると面談予定に自動で追加されます。',
      tags: ['面談', 'スケジュール']
    },
    {
      id: 8,
      category: 'payment',
      question: '利用料金はかかりますか？',
      answer: 'RightArmの基本機能（プロフィール登録、検索、スカウト、メッセージ、面談設定）はすべて無料でご利用いただけます。成約時の手数料もございません。',
      tags: ['料金', '無料']
    },
    {
      id: 9,
      category: 'account',
      question: 'アカウントのセキュリティを強化したいです',
      answer: '設定画面で二段階認証を有効にできます。また、定期的なパスワード変更、ログイン履歴の確認をお勧めします。不審なアクティビティを発見した場合は、すぐにサポートにご連絡ください。',
      tags: ['セキュリティ', '二段階認証']
    }
  ]

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <div className="flex items-center">
              <Link href="/home" className="text-lg md:text-xl font-bold text-gray-900 tracking-wide hover:text-gray-700 transition-colors">
                RIGHTARM
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-6 lg:space-x-8 h-full">
              <Link href="/home" className="text-gray-700 hover:text-gray-900 text-sm flex items-center">ホーム</Link>
              <Link href="/scout" className="text-gray-700 hover:text-gray-900 text-sm flex items-center">スカウト</Link>
              <Link href="/messages" className="text-gray-700 hover:text-gray-900 text-sm flex items-center">メッセージ</Link>
              <Link href="/meetings" className="text-gray-700 hover:text-gray-900 text-sm flex items-center">面談予定</Link>
            </nav>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <button className="p-2 text-gray-700 hover:text-gray-900">
                <span className="sr-only">通知</span>
                <span className="text-lg">🔔</span>
              </button>
              <UserDropdown />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* ページタイトル */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">ヘルプセンター</h2>
          <p className="text-gray-600 text-sm md:text-base mb-6">よくある質問や使い方ガイドをご確認いただけます</p>
          
          {/* 検索バー */}
          <div className="max-w-lg mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="質問や機能名で検索..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 text-center"
            />
          </div>
        </div>

        {/* クイックアクセス */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Link href="#getting-started" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">📚</div>
            <div className="text-sm font-medium text-gray-900">使い方ガイド</div>
          </Link>
          <Link href="#contact" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">📞</div>
            <div className="text-sm font-medium text-gray-900">お問い合わせ</div>
          </Link>
          <Link href="#video" className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">🎥</div>
            <div className="text-sm font-medium text-gray-900">動画チュートリアル</div>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* カテゴリサイドバー */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">カテゴリ</h3>
              <nav className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">📋</span>
                  すべて
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* FAQ一覧 */}
          <div className="w-full md:w-3/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  よくある質問 ({filteredFaqs.length}件)
                </h3>
              </div>
              
              {filteredFaqs.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredFaqs.map((faq) => (
                    <div key={faq.id} className="p-4 md:p-6">
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full text-left flex justify-between items-start focus:outline-none"
                      >
                        <div className="flex-1">
                          <h4 className="text-sm md:text-base font-medium text-gray-900 mb-2">
                            {faq.question}
                          </h4>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {faq.tags.map((tag) => (
                              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className={`transition-transform duration-200 ${
                            openFaq === faq.id ? 'rotate-180' : ''
                          }`}>
                            ▼
                          </span>
                        </div>
                      </button>
                      
                      {openFaq === faq.id && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                            {faq.answer}
                          </p>
                          
                          <div className="mt-4 flex space-x-2">
                            <button className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50">
                              👍 役に立った
                            </button>
                            <button className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50">
                              👎 役に立たなかった
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <p className="text-gray-500 mb-2">該当する質問が見つかりませんでした</p>
                  <p className="text-sm text-gray-400 mb-4">別のキーワードで検索するか、お問い合わせください</p>
                  <button className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm">
                    お問い合わせ
                  </button>
                </div>
              )}
            </div>

            {/* お問い合わせセクション */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">解決しない場合は</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">📧 メールサポート</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    24時間以内にご返信いたします
                  </p>
                  <button className="w-full px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm">
                    メールで問い合わせ
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">💬 チャットサポート</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    平日9:00-18:00（即座に対応）
                  </p>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">
                    チャットを開始
                  </button>
                </div>
              </div>
            </div>

            {/* 関連リンク */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">関連リンク</h3>
              <div className="space-y-3">
                <Link href="/about" className="block text-sm text-blue-600 hover:text-blue-800">
                  📖 RightArmについて
                </Link>
                <Link href="/terms" className="block text-sm text-blue-600 hover:text-blue-800">
                  📜 利用規約
                </Link>
                <Link href="/privacy" className="block text-sm text-blue-600 hover:text-blue-800">
                  🔒 プライバシーポリシー
                </Link>
                <Link href="/contact" className="block text-sm text-blue-600 hover:text-blue-800">
                  📞 お問い合わせ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}