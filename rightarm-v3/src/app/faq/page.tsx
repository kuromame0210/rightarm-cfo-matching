'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function FAQPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'すべて' },
    { id: 'general', name: '基本情報' },
    { id: 'registration', name: '登録・設定' },
    { id: 'matching', name: 'マッチング' },
    { id: 'payment', name: '料金・契約' },
    { id: 'support', name: 'サポート' }
  ]

  const faqs = [
    {
      id: 1,
      category: 'general',
      question: 'RightArmとはどのようなサービスですか？',
      answer: 'RightArmは企業とCFO（最高財務責任者）をマッチングするプラットフォームです。企業は資金調達、IPO準備、財務体制強化などの課題に対して、豊富な経験を持つCFOと出会うことができます。CFO側も副業・複業として複数の企業を支援することが可能です。'
    },
    {
      id: 2,
      category: 'general',
      question: '利用料金はかかりますか？',
      answer: 'RightArmの基本機能（会員登録、プロフィール作成、検索、スカウト、メッセージ交換、面談設定）はすべて無料でご利用いただけます。成約時の手数料や仲介料も一切かかりません。'
    },
    {
      id: 3,
      category: 'registration',
      question: '会員登録に必要な情報を教えてください',
      answer: '基本情報（氏名、メールアドレス、電話番号）、企業情報または個人の経歴、スキル・専門分野、希望条件（勤務形態、報酬、稼働時間等）をご入力いただきます。プロフィール写真の設定も推奨しています。'
    },
    {
      id: 4,
      category: 'registration',
      question: 'プロフィールの公開範囲を設定できますか？',
      answer: 'はい、プロフィールの公開範囲は細かく設定できます。「全ユーザーに公開」「認証済みユーザーのみ」「非公開」から選択でき、連絡先情報や報酬情報の表示・非表示も個別に設定可能です。'
    },
    {
      id: 5,
      category: 'matching',
      question: 'どのようにマッチング相手を探せばよいですか？',
      answer: 'キーワード検索、スキル・業界フィルタ、地域・勤務形態での絞り込み機能をご利用ください。また、AIによるおすすめ表示機能もあります。プロフィールを充実させることで、より精度の高いマッチングが期待できます。'
    },
    {
      id: 6,
      category: 'matching',
      question: 'スカウト機能の使い方を教えてください',
      answer: '気になる相手のプロフィールで「スカウト」ボタンをクリックし、メッセージを添えて送信します。相手が承諾するとメッセージ交換が開始されます。「気になる」ボタンは軽いアピール機能で、お互いに押すとマッチング率が向上します。'
    },
    {
      id: 7,
      category: 'matching',
      question: '逆スカウト機能とは何ですか？',
      answer: 'CFO側から企業に対してアプローチできる機能です。CFOが企業のプロフィールを見て、「この企業をサポートしたい」と思った場合に提案を送ることができます。企業側は受動的にCFOからの提案を受け取れるため、新たな出会いの機会が広がります。'
    },
    {
      id: 8,
      category: 'payment',
      question: '契約や報酬の交渉はどのように行いますか？',
      answer: 'プラットフォーム内のメッセージ機能で条件面談を行い、双方が合意した条件で直接契約を締結していただきます。RightArmは契約書のテンプレートや交渉のガイドラインを提供しますが、最終的な契約内容は当事者間で決定されます。'
    },
    {
      id: 9,
      category: 'payment',
      question: '報酬の相場はどのくらいですか？',
      answer: '経験・スキル・稼働時間により異なりますが、一般的には週1日稼働で月20-50万円、週2-3日で月50-150万円程度が相場です。IPO支援や大型資金調達の場合は成功報酬が追加されることもあります。'
    },
    {
      id: 10,
      category: 'support',
      question: '面談はどのように設定しますか？',
      answer: 'メッセージ画面の「面談設定」ボタンから面談を提案できます。オンライン（Zoom等）または対面での面談が選択でき、日時・アジェンダも含めて調整可能です。面談予定は自動でカレンダーに追加されます。'
    },
    {
      id: 11,
      category: 'support',
      question: 'トラブルが発生した場合はどうすればよいですか？',
      answer: 'ヘルプセンターでよくある問題の解決方法をご確認いただくか、お問い合わせフォームからサポートチームにご連絡ください。緊急時は電話サポート（平日9:00-18:00）もご利用いただけます。'
    },
    {
      id: 12,
      category: 'support',
      question: 'アカウントの削除は可能ですか？',
      answer: 'はい、設定ページから「アカウント削除」を選択していただくことで、いつでもアカウントを削除できます。削除後はすべてのデータが完全に削除され、復旧はできませんのでご注意ください。'
    },
    {
      id: 13,
      category: 'general',
      question: 'セキュリティ面での対策を教えてください',
      answer: 'SSL暗号化通信、二段階認証、定期的なセキュリティ監査を実施しています。個人情報は厳格に管理され、第三者への提供は一切行いません。また、不適切なユーザーに対する通報・ブロック機能も提供しています。'
    },
    {
      id: 14,
      category: 'matching',
      question: 'マッチングが成立しやすくなるコツはありますか？',
      answer: 'プロフィールを詳細に記載し、定期的に更新することが重要です。また、相手のプロフィールをよく読んで具体的なメッセージを送る、レスポンスを迅速にする、実績や事例を具体的に示すことで信頼性が向上します。'
    },
    {
      id: 15,
      category: 'payment',
      question: '契約期間に制限はありますか？',
      answer: '契約期間に制限はありません。短期プロジェクト（数ヶ月）から長期サポート（数年）まで、双方の合意により柔軟に設定できます。また、契約期間中でも条件変更や契約終了は当事者間の合意により可能です。'
    }
  ]

  const filteredFaqs = faqs.filter(faq => 
    selectedCategory === 'all' || faq.category === selectedCategory
  )

  const toggleFaq = (id: number) => {
    setOpenFaq(openFaq === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <div className="flex-shrink-0">
              <Link href="/" className="text-lg md:text-xl font-bold text-white tracking-wide hover:text-gray-300 transition-colors">
                RIGHTARM
              </Link>
            </div>
            
            <nav className="hidden lg:flex space-x-6">
              <Link href="/" className="text-gray-300 hover:text-white text-sm">ホーム</Link>
              <Link href="/about" className="text-gray-300 hover:text-white text-sm">サービス概要</Link>
              <Link href="/how-to-use" className="text-gray-300 hover:text-white text-sm">使い方</Link>
              <a href="#" className="text-white font-medium text-sm">FAQ</a>
              <Link href="/contact" className="text-gray-300 hover:text-white text-sm">お問い合わせ</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/auth/login" className="text-gray-300 hover:text-white text-sm">ログイン</Link>
              <Link href="/auth/register" className="bg-white text-gray-900 px-4 py-2 rounded font-medium hover:bg-gray-100 transition-colors text-sm">
                会員登録
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* 注意書き */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-center">
              <span className="text-orange-500 text-lg mr-2">⚠️</span>
              <p className="text-orange-700 text-sm">
                <strong>注意:</strong> このページはダミーで作成されています。実際の構成・内容についてはすり合わせが必要です。
              </p>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            よくある質問
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            RightArmに関するよくあるご質問にお答えします
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* クイックリンク */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          <Link href="/how-to-use" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
            <div className="text-3xl mb-3">📖</div>
            <div className="text-sm font-medium text-gray-900">使い方ガイド</div>
          </Link>
          <Link href="/contact" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
            <div className="text-3xl mb-3">📞</div>
            <div className="text-sm font-medium text-gray-900">お問い合わせ</div>
          </Link>
          <Link href="/help" className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
            <div className="text-3xl mb-3">💬</div>
            <div className="text-sm font-medium text-gray-900">ヘルプセンター</div>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* カテゴリフィルター */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">カテゴリ</h3>
              <div className="space-y-2">
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
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ一覧 */}
          <div className="w-full md:w-3/4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  よくある質問 ({filteredFaqs.length}件)
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {filteredFaqs.map((faq) => (
                  <div key={faq.id} className="p-6">
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full text-left flex justify-between items-start focus:outline-none group"
                    >
                      <div className="flex-1 pr-4">
                        <h3 className="text-base md:text-lg font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                          {faq.question}
                        </h3>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`transition-transform duration-200 text-gray-500 ${
                          openFaq === faq.id ? 'rotate-180' : ''
                        }`}>
                          ▼
                        </span>
                      </div>
                    </button>
                    
                    {openFaq === faq.id && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </p>
                        
                        <div className="mt-4 flex space-x-2">
                          <button className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                            👍 役に立った
                          </button>
                          <button className="px-3 py-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                            👎 役に立たなかった
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* サポート案内 */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">解決しない場合は</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">📧 メールサポート</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    24時間以内にご返信いたします
                  </p>
                  <Link href="/contact" className="inline-block w-full text-center px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 text-sm transition-colors">
                    メールで問い合わせ
                  </Link>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">💬 チャットサポート</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    平日9:00-18:00（即座に対応）
                  </p>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm transition-colors">
                    チャットを開始
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">今すぐ始めませんか？</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            登録は無料。最適な経営パートナーとの出会いが待っています。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register?type=company"
              className="bg-white text-gray-900 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              企業として登録
            </Link>
            <Link 
              href="/auth/register?type=cfo"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-medium hover:bg-white hover:text-gray-900 transition-colors"
            >
              CFOとして登録
            </Link>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 tracking-wide">RIGHTARM</h3>
              <p className="text-gray-400 text-sm">全国の企業に"右腕CFO"を届ける</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-gray-300">サービス</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/auth/register?type=company" className="hover:text-white transition-colors">CFOを探す</Link></li>
                <li><Link href="/auth/register?type=cfo" className="hover:text-white transition-colors">企業を探す</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-gray-300">サポート</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">よくある質問</a></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">お問い合わせ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-gray-300">会社情報</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">会社概要</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">採用情報</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">&copy; 2024 RightArm. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}