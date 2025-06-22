'use client'

import Link from 'next/link'

export default function HowToUsePage() {
  const steps = [
    {
      number: '01',
      title: '会員登録',
      description: '企業またはCFOとして無料で会員登録。プロフィールを充実させることで、より良いマッチングが期待できます。',
      image: '📝',
      details: [
        '基本情報の入力',
        'スキル・経験の詳細記載',
        '希望条件の設定',
        'プロフィール写真のアップロード'
      ]
    },
    {
      number: '02', 
      title: '相手を探す',
      description: '豊富な検索機能とフィルターを使って、あなたの条件に合った相手を見つけましょう。',
      image: '🔍',
      details: [
        'キーワード検索',
        'スキル・業界別フィルタ',
        '地域・勤務形態での絞り込み',
        'おすすめ表示機能'
      ]
    },
    {
      number: '03',
      title: 'スカウト・アプローチ',
      description: '気になる相手にスカウトを送信、または気になるボタンでアピール。双方向のマッチングシステムです。',
      image: '🎯',
      details: [
        'スカウトメッセージの送信',
        '気になる機能でアピール',
        '逆スカウトでの提案',
        'マッチング率の向上'
      ]
    },
    {
      number: '04',
      title: 'メッセージ交換',
      description: 'プラットフォーム内のセキュアなメッセージ機能で詳細な相談や条件交渉を行います。',
      image: '💬',
      details: [
        'リアルタイムメッセージ',
        'ファイル・資料の共有',
        '面談日程の調整',
        '条件面談の実施'
      ]
    },
    {
      number: '05',
      title: '面談・契約',
      description: 'オンライン・対面での面談を経て、双方が納得した場合に業務委託契約を締結します。',
      image: '🤝',
      details: [
        'カジュアル面談の実施',
        '詳細条件の最終調整',
        '契約書の作成・締結',
        '業務開始サポート'
      ]
    }
  ]

  const tips = [
    {
      icon: '💡',
      title: 'プロフィールを充実させる',
      description: '詳細な経験・スキル情報を記載することで、マッチング精度が向上します。'
    },
    {
      icon: '⚡',
      title: '積極的にアプローチ',
      description: '気になる相手には積極的にスカウトや気になるボタンでアピールしましょう。'
    },
    {
      icon: '🎨',
      title: '丁寧なメッセージを心がける',
      description: '初回メッセージは相手のプロフィールを読んで、具体的で丁寧な内容にしましょう。'
    },
    {
      icon: '📅',
      title: 'レスポンスは迅速に',
      description: 'メッセージや面談依頼には可能な限り迅速に返答することで信頼関係を築けます。'
    }
  ]

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
              <a href="#" className="text-white font-medium text-sm">使い方</a>
              <Link href="/faq" className="text-gray-300 hover:text-white text-sm">FAQ</Link>
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
            RightArmの使い方
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            5つの簡単なステップで、最適な経営パートナーとの出会いを実現します
          </p>
        </div>
      </section>

      {/* メインステップ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">利用の流れ</h2>
            <p className="text-xl text-gray-600">登録から契約まで、わずか5ステップ</p>
          </div>

          <div className="space-y-20">
            {steps.map((step, index) => (
              <div key={step.number} className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}>
                <div className="w-full md:w-1/2">
                  <div className="text-center md:text-left">
                    <div className="inline-block text-6xl mb-6">{step.image}</div>
                    <div className="flex items-center justify-center md:justify-start mb-4">
                      <span className="text-3xl font-bold text-gray-300 mr-4">STEP</span>
                      <span className="text-4xl font-bold text-gray-900">{step.number}</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">{step.description}</p>
                    
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center justify-center md:justify-start text-gray-700">
                          <span className="text-blue-600 mr-2">✓</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="w-full md:w-1/2">
                  <div className="bg-white rounded-lg shadow-xl p-8 border">
                    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">{step.image}</div>
                        <p className="text-gray-600 font-medium">{step.title}のイメージ</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 成功のコツ */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">成功のコツ</h2>
            <p className="text-xl text-gray-600">より良いマッチングのためのヒント</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {tips.map((tip, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{tip.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{tip.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{tip.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* よくある質問への誘導 */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">まだ不明な点がありますか？</h2>
          <p className="text-xl text-gray-600 mb-8">
            よくある質問やサポートページで詳細をご確認いただけます
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/faq"
              className="bg-gray-900 text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              よくある質問を見る
            </Link>
            <Link 
              href="/contact"
              className="border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-lg font-medium hover:bg-gray-900 hover:text-white transition-colors"
            >
              お問い合わせ
            </Link>
          </div>
        </div>
      </section>

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
                <li><Link href="/faq" className="hover:text-white transition-colors">よくある質問</Link></li>
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