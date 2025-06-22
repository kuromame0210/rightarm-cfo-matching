'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            {/* ロゴ */}
            <div className="flex-shrink-0">
              <h1 className="text-lg md:text-xl font-bold text-white tracking-wide">RIGHTARM</h1>
            </div>
            
            {/* ナビゲーション - モバイルでは非表示 */}
            <nav className="hidden lg:flex space-x-6">
              <a href="#" className="text-white font-medium text-sm">ホーム</a>
              <span className="text-gray-500 text-sm cursor-not-allowed">サービス概要</span>
              <span className="text-gray-500 text-sm cursor-not-allowed">使い方</span>
              <span className="text-gray-500 text-sm cursor-not-allowed">FAQ</span>
              <span className="text-gray-500 text-sm cursor-not-allowed">お問い合わせ</span>
            </nav>

            {/* モバイルメニューボタン */}
            <button className="lg:hidden p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        {/* 背景パターン */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-700/20 via-transparent to-transparent"></div>
        </div>
        
        {/* コンテンツ */}
        <div className="relative z-10 flex items-center min-h-screen py-20 md:py-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
            
            {/* メインタイトル */}
            <div className="mb-12 md:mb-16">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-light mb-4 md:mb-6 tracking-[0.1em] md:tracking-[0.2em] text-white">
                RIGHTARM
              </h1>
              <p className="text-sm sm:text-base md:text-xl lg:text-2xl font-light tracking-[0.05em] md:tracking-[0.1em] text-gray-200 px-4">
                — 全国の企業に、"右腕CFO"を届ける —
              </p>
            </div>

            {/* 2つのボタンエリア */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
              
              {/* CFOを探すボタン */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 md:p-8 rounded-xl shadow-2xl hover:bg-white/15 transition-all duration-300 md:hover:scale-105">
                <h2 className="text-xl md:text-2xl font-light mb-4 md:mb-6 tracking-wide text-white">企業の方</h2>
                <div className="space-y-3 md:space-y-4 text-left mb-6 md:mb-8">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-white/60 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="text-white/90 text-sm md:text-base">週1日から導入可能</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-white/60 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="text-white/90 text-sm md:text-base">リモートのみでもok</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-white/60 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="text-white/90 text-sm md:text-base">CFOを低コストで導入</span>
                  </div>
                </div>
                <Link 
                  href="/auth/register?type=company"
                  className="inline-block w-full py-3 md:py-4 px-4 md:px-6 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-all duration-300 tracking-wide shadow-lg hover:shadow-xl text-sm md:text-base"
                >
                  企業として登録
                </Link>
              </div>

              {/* 企業を探すボタン */}
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 md:p-8 rounded-xl shadow-2xl hover:bg-white/15 transition-all duration-300 md:hover:scale-105">
                <h2 className="text-xl md:text-2xl font-light mb-4 md:mb-6 tracking-wide text-white">CFOの方</h2>
                <div className="space-y-3 md:space-y-4 text-left mb-6 md:mb-8">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-white/60 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="text-white/90 text-sm md:text-base">財務知識で企業を支援</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-white/60 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="text-white/90 text-sm md:text-base">副業として活動可能</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-white/60 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="text-white/90 text-sm md:text-base">複業で仕事の幅を広げる</span>
                  </div>
                </div>
                <Link 
                  href="/auth/register?type=cfo"
                  className="inline-block w-full py-3 md:py-4 px-4 md:px-6 border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-gray-900 transition-all duration-300 tracking-wide shadow-lg hover:shadow-xl text-sm md:text-base"
                >
                  CFOとして登録
                </Link>
              </div>
            </div>

            {/* ログイン・登録リンク */}
            <div className="mt-12 md:mt-16">
              <Link 
                href="/auth/login"
                className="text-white/70 hover:text-white underline underline-offset-4 decoration-white/50 hover:decoration-white transition-all duration-300 text-sm md:text-base"
              >
                既にアカウントをお持ちの方はこちら
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-8 md:py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 tracking-wide">RIGHTARM</h3>
              <p className="text-gray-400 text-xs md:text-sm">全国の企業に"右腕CFO"を届ける</p>
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-semibold mb-3 md:mb-4 text-gray-300">サービス</h4>
              <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">CFOを探す</a></li>
                <li><a href="#" className="hover:text-white transition-colors">企業を探す</a></li>
                <li><a href="#" className="hover:text-white transition-colors">料金プラン</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-semibold mb-3 md:mb-4 text-gray-300">サポート</h4>
              <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">よくある質問</a></li>
                <li><a href="#" className="hover:text-white transition-colors">お問い合わせ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">利用規約</a></li>
                <li><a href="#" className="hover:text-white transition-colors">プライバシー</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs md:text-sm font-semibold mb-3 md:mb-4 text-gray-300">会社情報</h4>
              <ul className="space-y-1 md:space-y-2 text-xs md:text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">会社概要</a></li>
                <li><a href="#" className="hover:text-white transition-colors">採用情報</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center">
            <p className="text-gray-400 text-xs md:text-sm">&copy; 2024 RightArm. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}