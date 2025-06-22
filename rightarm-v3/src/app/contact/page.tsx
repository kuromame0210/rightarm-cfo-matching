'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    category: '',
    subject: '',
    message: '',
    userType: ''
  })
  const [showToast, setShowToast] = useState(false)

  const categories = [
    '一般的なお問い合わせ',
    'サービスについて',
    '技術的な問題',
    'アカウント・登録について',
    'マッチングについて',
    '契約・料金について',
    'パートナーシップ・提携',
    'メディア・取材',
    'その他'
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // フォーム送信処理（実際はAPIコール）
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
    
    // フォームリセット
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      category: '',
      subject: '',
      message: '',
      userType: ''
    })
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
              <Link href="/faq" className="text-gray-300 hover:text-white text-sm">FAQ</Link>
              <a href="#" className="text-white font-medium text-sm">お問い合わせ</a>
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
            お問い合わせ
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            ご質問やご相談がございましたら、お気軽にお問い合わせください
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* お問い合わせ方法 */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">お問い合わせ方法</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <span className="text-lg mr-2">📧</span>
                    メールサポート
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">24時間以内にご返信</p>
                  <p className="text-sm text-blue-600">support@rightarm.jp</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <span className="text-lg mr-2">💬</span>
                    チャットサポート
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">平日9:00-18:00</p>
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    チャットを開始
                  </button>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <span className="text-lg mr-2">📞</span>
                    電話サポート
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">平日10:00-17:00</p>
                  <p className="text-sm text-gray-900">03-1234-5678</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <span className="text-lg mr-2">🏢</span>
                    オフィス
                  </h3>
                  <p className="text-sm text-gray-600">
                    〒150-0001<br />
                    東京都渋谷区神宮前1-1-1<br />
                    RightArmビル 5F
                  </p>
                </div>
              </div>
            </div>

            {/* よくある質問への誘導 */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h3 className="font-medium text-gray-900 mb-3">お問い合わせ前に</h3>
              <p className="text-sm text-gray-600 mb-4">
                よくある質問で解決するかもしれません
              </p>
              <Link 
                href="/faq"
                className="inline-block w-full text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition-colors"
              >
                FAQを確認する
              </Link>
            </div>
          </div>

          {/* お問い合わせフォーム */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">お問い合わせフォーム</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 基本情報 */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      お名前 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="山田 太郎"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      メールアドレス <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="yamada@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      会社名・組織名
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="株式会社サンプル"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      電話番号
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="090-1234-5678"
                    />
                  </div>
                </div>

                {/* お客様の立場 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    お客様の立場
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['企業', 'CFO', 'その他', '未定'].map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="radio"
                          name="userType"
                          value={type}
                          checked={formData.userType === type}
                          onChange={(e) => handleInputChange('userType', e.target.value)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* お問い合わせカテゴリ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    お問い合わせカテゴリ <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">選択してください</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 件名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    件名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="お問い合わせの件名を入力してください"
                  />
                </div>

                {/* メッセージ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    お問い合わせ内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="詳細なお問い合わせ内容をご記入ください"
                  />
                </div>

                {/* プライバシーポリシー */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      required
                      className="mt-1 mr-3"
                    />
                    <span className="text-sm text-gray-700">
                      <Link href="/privacy" className="text-blue-600 hover:text-blue-800">プライバシーポリシー</Link>
                      および
                      <Link href="/terms" className="text-blue-600 hover:text-blue-800">利用規約</Link>
                      に同意します
                    </span>
                  </label>
                </div>

                {/* 送信ボタン */}
                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  お問い合わせを送信
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* 営業時間・注意事項 */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">営業時間・注意事項</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">営業時間</h4>
              <ul className="space-y-1">
                <li>• メールサポート: 24時間受付（返信は24時間以内）</li>
                <li>• チャットサポート: 平日9:00-18:00</li>
                <li>• 電話サポート: 平日10:00-17:00</li>
                <li>• 土日祝日: メールサポートのみ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">注意事項</h4>
              <ul className="space-y-1">
                <li>• お急ぎの場合は電話でお問い合わせください</li>
                <li>• 技術的な問題は詳細をお書きください</li>
                <li>• 営業・勧誘のご連絡はお断りしています</li>
                <li>• 回答にお時間をいただく場合があります</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Toast通知 */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          お問い合わせを送信しました。ご返信をお待ちください。
        </div>
      )}

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
                <li><a href="#" className="hover:text-white transition-colors">お問い合わせ</a></li>
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