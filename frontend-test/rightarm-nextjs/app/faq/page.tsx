'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, HelpCircle, Users, DollarSign, Shield, Settings } from 'lucide-react';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const faqData: FAQ[] = [
  // サービス基本
  {
    id: '1',
    category: 'サービス基本',
    question: 'RightArmとはどのようなサービスですか？',
    answer: 'RightArmは、企業とCFO（最高財務責任者）をマッチングするプラットフォームです。週1日から導入可能で、企業の財務戦略をサポートする経験豊富なCFOと出会うことができます。'
  },
  {
    id: '2',
    category: 'サービス基本',
    question: '他の人材紹介サービスとの違いは何ですか？',
    answer: '従来の人材紹介とは異なり、企業とCFOが直接やり取りできるプラットフォーム型のサービスです。スカウト・面談まで完全無料で、成果連動型の料金体系を採用しています。'
  },
  {
    id: '3',
    category: 'サービス基本',
    question: 'どのような企業が利用していますか？',
    answer: 'スタートアップから上場企業まで、幅広い規模の企業にご利用いただいています。特に、資金調達やIPO準備、M&A、管理会計の構築などの課題を抱える企業に多くご利用いただいています。'
  },

  // 料金・契約
  {
    id: '4',
    category: '料金・契約',
    question: '料金体系を教えてください',
    answer: '基本手数料（顧問料×稼働月数×5%）と月次手数料（毎月の顧問料×3%）の2つの料金体系があります。スカウト・面談まで完全無料で、契約成立時のみ手数料が発生します。'
  },
  {
    id: '5',
    category: '料金・契約',
    question: '最低契約期間はありますか？',
    answer: '最低契約期間は3ヶ月からとなっています。企業とCFOの双方が合意すれば、より長期間の契約も可能です。'
  },
  {
    id: '6',
    category: '料金・契約',
    question: '成果報酬型の料金はどのようなものですか？',
    answer: '融資成功時3%、補助金獲得時5%、フルタイム転籍時年収の20%、EXIT支援時5-10%の成果報酬があります。これらは該当する成果が発生した場合のみお支払いいただきます。'
  },

  // マッチング
  {
    id: '7',
    category: 'マッチング',
    question: 'どのようにCFOとマッチングしますか？',
    answer: '企業の業界、課題、予算などの条件をもとに、最適なCFOをプラットフォームが提案します。また、企業からCFOへ、CFOから企業へ、双方向でスカウトを送ることも可能です。'
  },
  {
    id: '8',
    category: 'マッチング',
    question: 'マッチング成功率はどのくらいですか？',
    answer: '現在のマッチング成功率は約95%です。詳細なプロフィール情報と高精度なマッチングアルゴリズムにより、高い成功率を実現しています。'
  },
  {
    id: '9',
    category: 'マッチング',
    question: '地方の企業でも利用できますか？',
    answer: 'はい、全国どこからでもご利用いただけます。多くのCFOがリモートワークに対応しており、オンラインでの業務支援が可能です。'
  },

  // CFO関連
  {
    id: '10',
    category: 'CFO関連',
    question: '登録しているCFOの経歴はどのようなものですか？',
    answer: '上場企業での財務責任者経験、公認会計士、MBA取得者など、豊富な実務経験を持つCFOが登録しています。IPO支援、M&A、資金調達などの専門分野を持つCFOが多数在籍しています。'
  },
  {
    id: '11',
    category: 'CFO関連',
    question: 'CFOはどのようなサポートを提供しますか？',
    answer: '資金調達・融資支援、IPO準備、M&Aアドバイザリー、管理会計構築、投資家対応、財務戦略立案、内部統制構築、ERP・システム導入支援など、幅広い財務・経営支援を提供します。'
  },
  {
    id: '12',
    category: 'CFO関連',
    question: 'CFOの稼働形態はどのようなものですか？',
    answer: '週1日から週5日まで、企業のニーズに応じて柔軟に対応可能です。多くのCFOがリモートワークに対応しており、必要に応じて出社での対応も可能です。'
  },

  // セキュリティ
  {
    id: '13',
    category: 'セキュリティ',
    question: '情報セキュリティはどのように保護されていますか？',
    answer: 'SSL暗号化通信、定期的なセキュリティ監査、個人情報保護体制の構築など、厳格なセキュリティ対策を実施しています。また、CFOには秘密保持契約の締結を義務付けています。'
  },
  {
    id: '14',
    category: 'セキュリティ',
    question: '個人情報はどのように管理されていますか？',
    answer: '個人情報保護法に基づき、適切な管理体制を構築しています。情報の利用目的を明確にし、必要最小限の範囲でのみ利用いたします。'
  },

  // その他
  {
    id: '15',
    category: 'その他',
    question: 'サポート体制はどのようになっていますか？',
    answer: '専任のカスタマーサクセスチームが、マッチングから契約まで全面的にサポートします。また、契約後も定期的なフォローアップを実施しています。'
  },
  {
    id: '16',
    category: 'その他',
    question: '解約はいつでも可能ですか？',
    answer: '最低契約期間終了後は、1ヶ月前の事前通知により解約可能です。解約時の違約金等は発生いたしません。'
  }
];

const categories = [
  { id: 'all', name: '全て', icon: HelpCircle },
  { id: 'サービス基本', name: 'サービス基本', icon: Settings },
  { id: '料金・契約', name: '料金・契約', icon: DollarSign },
  { id: 'マッチング', name: 'マッチング', icon: Users },
  { id: 'CFO関連', name: 'CFO関連', icon: Users },
  { id: 'セキュリティ', name: 'セキュリティ', icon: Shield },
  { id: 'その他', name: 'その他', icon: HelpCircle }
];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

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
              よくある質問
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              RightArmのサービスについて、よくお寄せいただくご質問にお答えします。
              お探しの質問が見つからない場合は、お気軽にお問い合わせください。
            </p>

            {/* 検索ボックス */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="質問を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* カテゴリサイドバー */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8"
              >
                <h3 className="text-lg font-semibold text-black mb-4">カテゴリ</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-black text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <category.icon className="h-4 w-4" />
                      <span className="text-sm">{category.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* FAQ一覧 */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {filteredFAQs.length === 0 ? (
                  <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
                    <HelpCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      該当する質問が見つかりませんでした
                    </h3>
                    <p className="text-gray-600 mb-6">
                      検索キーワードやカテゴリを変更してお試しください。
                    </p>
                    <a
                      href="/contact"
                      className="btn-primary inline-flex"
                    >
                      お問い合わせ
                    </a>
                  </div>
                ) : (
                  filteredFAQs.map((faq, index) => (
                    <motion.div
                      key={faq.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(faq.id)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="text-sm text-gray-500 mb-1">{faq.category}</div>
                          <h3 className="text-lg font-semibold text-black">{faq.question}</h3>
                        </div>
                        <ChevronDown
                          className={`h-5 w-5 text-gray-400 transition-transform ${
                            openItems.includes(faq.id) ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      
                      <AnimatePresence>
                        {openItems.includes(faq.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-4 border-t border-gray-100">
                              <p className="text-gray-700 leading-relaxed pt-4">
                                {faq.answer}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* お問い合わせCTA */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">
              まだ疑問が解決しませんか？
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              お気軽にお問い合わせください。専門スタッフが丁寧にお答えいたします。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                お問い合わせ
              </a>
              <a
                href="/auth/register"
                className="border border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-colors"
              >
                無料で始める
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}