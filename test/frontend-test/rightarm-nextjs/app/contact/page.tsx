'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle,
  Clock,
  MessageCircle,
  Users,
  Building2
} from 'lucide-react';

interface ContactForm {
  name: string;
  email: string;
  company: string;
  userType: 'company' | 'cfo' | 'other';
  category: string;
  subject: string;
  message: string;
}

const inquiryCategories = [
  'サービスについて',
  '料金・プランについて',
  'マッチングについて',
  '技術的な問題',
  'アカウント・登録について',
  'その他'
];

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    company: '',
    userType: 'company',
    category: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: 実際のAPIコール
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(form)
      // });

      // 開発用の遅延
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsSubmitted(true);
    } catch (error) {
      console.error('送信エラー:', error);
      alert('送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'メール',
      value: 'support@rightarm.jp',
      description: '24時間受付'
    },
    {
      icon: Phone,
      title: '電話',
      value: '03-1234-5678',
      description: '平日 9:00-18:00'
    },
    {
      icon: MapPin,
      title: '所在地',
      value: '東京都渋谷区',
      description: '詳細はお問い合わせください'
    }
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center"
        >
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-black mb-4">
            お問い合わせありがとうございます
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            お問い合わせを受付いたしました。通常1営業日以内にご返信いたします。
            お急ぎの場合は、お電話にてお問い合わせください。
          </p>
          <div className="space-y-3">
            <a
              href="/"
              className="block w-full btn-primary"
            >
              ホームに戻る
            </a>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setForm({
                  name: '',
                  email: '',
                  company: '',
                  userType: 'company',
                  category: '',
                  subject: '',
                  message: ''
                });
              }}
              className="block w-full btn-outline"
            >
              別のお問い合わせ
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘロセクション */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-bold text-black mb-6">
              お問い合わせ
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              RightArmに関するご質問やご相談がございましたら、
              お気軽にお問い合わせください。専門スタッフが丁寧にお答えいたします。
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* お問い合わせフォーム */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
              >
                <h2 className="text-2xl font-bold text-black mb-6">お問い合わせフォーム</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* ユーザータイプ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      お立場 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'company', label: '企業', icon: Building2 },
                        { value: 'cfo', label: 'CFO', icon: Users },
                        { value: 'other', label: 'その他', icon: MessageCircle }
                      ].map((option) => (
                        <label
                          key={option.value}
                          className={`flex items-center justify-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                            form.userType === option.value
                              ? 'border-black bg-black text-white'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <input
                            type="radio"
                            name="userType"
                            value={option.value}
                            checked={form.userType === option.value}
                            onChange={(e) => handleInputChange('userType', e.target.value as 'company' | 'cfo' | 'other')}
                            className="sr-only"
                          />
                          <option.icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* お名前 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        お名前 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="山田太郎"
                      />
                    </div>

                    {/* メールアドレス */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        メールアドレス <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="example@company.com"
                      />
                    </div>
                  </div>

                  {/* 会社名・組織名 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      会社名・組織名
                    </label>
                    <input
                      type="text"
                      value={form.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="株式会社◯◯"
                    />
                  </div>

                  {/* お問い合わせカテゴリ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      お問い合わせカテゴリ <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="">選択してください</option>
                      {inquiryCategories.map((category) => (
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
                      value={form.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
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
                      value={form.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="お問い合わせ内容を詳しくご記入ください..."
                    />
                  </div>

                  {/* 送信ボタン */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                    <span>{isSubmitting ? '送信中...' : '送信する'}</span>
                  </button>
                </form>
              </motion.div>
            </div>

            {/* サイドバー */}
            <div className="lg:col-span-1 space-y-6">
              {/* 連絡先情報 */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-black mb-4">連絡先情報</h3>
                <div className="space-y-4">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <info.icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{info.title}</div>
                        <div className="text-black font-semibold">{info.value}</div>
                        <div className="text-sm text-gray-500">{info.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* 営業時間 */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-black mb-4 flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>営業時間</span>
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">平日</span>
                    <span className="font-medium text-black">9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">土日祝</span>
                    <span className="font-medium text-red-600">休業</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      メールでのお問い合わせは24時間受け付けております。
                      通常1営業日以内にご返信いたします。
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* よくある質問 */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gray-50 rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold text-black mb-3">
                  お問い合わせ前に
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  よくある質問もご確認ください。
                  お探しの回答が見つかるかもしれません。
                </p>
                <a
                  href="/faq"
                  className="text-sm font-medium text-black hover:underline"
                >
                  よくある質問を見る →
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}