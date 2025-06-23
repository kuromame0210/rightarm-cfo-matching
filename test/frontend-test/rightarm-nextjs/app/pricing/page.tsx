'use client';

import { motion } from 'framer-motion';
import { 
  Check, 
  Star, 
  TrendingUp, 
  DollarSign,
  Calculator,
  ArrowRight,
  Shield,
  Users,
  Zap,
  Info
} from 'lucide-react';

export default function PricingPage() {
  const baseFees = [
    {
      type: '基本手数料',
      rate: '5%',
      description: '顧問料 × 稼働月数 × 5%',
      details: '契約成立時のみ発生する初期手数料',
      example: '月額50万円 × 12ヶ月 × 5% = 30万円'
    },
    {
      type: '月次手数料',
      rate: '3%',
      description: '毎月の顧問料 × 3%',
      details: '継続的なプラットフォーム利用料',
      example: '月額50万円 × 3% = 1.5万円/月'
    }
  ];

  const successFees = [
    {
      service: '融資成功',
      rate: '3%',
      description: '融資額の3%',
      minFee: '最低10万円',
      example: '1億円融資 → 300万円'
    },
    {
      service: '補助金獲得',
      rate: '5%',
      description: '補助金額の5%',
      minFee: '最低5万円',
      example: '2,000万円補助金 → 100万円'
    },
    {
      service: 'フルタイム転籍',
      rate: '20%',
      description: '年収の20%',
      minFee: '最低50万円',
      example: '年収1,000万円 → 200万円'
    },
    {
      service: 'EXIT支援',
      rate: '5-10%',
      description: 'EXIT価額の5-10%',
      minFee: '最低100万円',
      example: '10億円EXIT → 5,000万円〜1億円'
    }
  ];

  const comparisonData = [
    {
      category: '従来の人材紹介',
      initialCost: '年収の30-35%',
      monthlyCost: 'なし',
      successFee: 'なし',
      totalExample: '年収800万円 → 240-280万円'
    },
    {
      category: 'RightArm',
      initialCost: '5%',
      monthlyCost: '3%',
      successFee: '成果連動',
      totalExample: '年収800万円相当 → 初年度約70万円'
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'スカウト・面談まで完全無料',
      description: 'マッチングから面談まで一切費用はかかりません'
    },
    {
      icon: Users,
      title: '双方向マッチング',
      description: '企業・CFO双方からアプローチ可能'
    },
    {
      icon: Zap,
      title: '成果連動型',
      description: '実際の成果に応じた明確な料金体系'
    },
    {
      icon: TrendingUp,
      title: '段階的料金設定',
      description: '企業の成長に合わせた柔軟な料金体系'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ヘロセクション */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-bold text-black mb-6">
              透明で公正な料金体系
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              RightArmは成果連動型の料金体系で、企業の成長を支援します。
              スカウト・面談まで完全無料、契約成立時のみ手数料が発生します。
            </p>
            <div className="flex items-center justify-center space-x-2 text-green-600 font-semibold">
              <Check className="h-5 w-5" />
              <span>スカウト・面談まで完全無料</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 基本料金 */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-black mb-6">基本料金体系</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              明確でシンプルな料金設定。契約成立時のみ発生する成果連動型です。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {baseFees.map((fee, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-8 border-2 border-gray-200 hover:border-black transition-colors"
              >
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-black mb-2">{fee.rate}</div>
                  <div className="text-xl font-semibold text-gray-800 mb-2">{fee.type}</div>
                  <div className="text-gray-600">{fee.description}</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">詳細</div>
                      <div className="text-sm text-gray-600">{fee.details}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Calculator className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">計算例</div>
                      <div className="text-sm text-gray-600">{fee.example}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 料金比較 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-50 rounded-xl p-8"
          >
            <h3 className="text-2xl font-bold text-black mb-6 text-center">従来サービスとの比較</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">サービス</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">初期費用</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">月次費用</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">成果報酬</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">総コスト例</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((item, index) => (
                    <tr key={index} className={`border-b border-gray-200 ${index === 1 ? 'bg-green-50' : ''}`}>
                      <td className="py-4 px-4 font-medium text-gray-900">{item.category}</td>
                      <td className="py-4 px-4 text-gray-700">{item.initialCost}</td>
                      <td className="py-4 px-4 text-gray-700">{item.monthlyCost}</td>
                      <td className="py-4 px-4 text-gray-700">{item.successFee}</td>
                      <td className="py-4 px-4 font-semibold text-gray-900">{item.totalExample}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 成果報酬 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-black mb-6">成果報酬型料金</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              CFOの実際の成果に応じた追加報酬。企業の成長を直接支援した場合のみ発生します。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {successFees.map((fee, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="text-center mb-4">
                  <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-black mb-1">{fee.service}</h3>
                  <div className="text-2xl font-bold text-green-600">{fee.rate}</div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="text-gray-600">{fee.description}</div>
                  <div className="text-gray-500">{fee.minFee}</div>
                  <div className="font-medium text-gray-900 mt-3">計算例:</div>
                  <div className="text-green-600 font-medium">{fee.example}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* メリット */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-black mb-6">RightArmを選ぶメリット</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              従来の人材紹介サービスにはない、透明性と成果連動型の料金体系をご提供します。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-6 p-6 bg-white rounded-xl border border-gray-200"
              >
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-black mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 注意事項 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-xl p-8 border border-gray-200"
          >
            <h3 className="text-2xl font-bold text-black mb-6">料金に関する注意事項</h3>
            <div className="space-y-4 text-gray-700">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
                <p>手数料は全て税別表示です。別途消費税が加算されます。</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
                <p>成果報酬は該当する成果が発生した場合のみお支払いいただきます。</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
                <p>契約期間中の月次手数料は前払いとなります。</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-black rounded-full mt-2 flex-shrink-0"></div>
                <p>詳細な料金体系については、契約前に個別にご説明いたします。</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              まずは無料でスカウトを始めませんか？
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              料金は契約成立時のみ。スカウト・面談まで完全無料でお試しいただけます。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth/register/company"
                className="bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
              >
                <span>無料で企業登録</span>
                <ArrowRight className="h-5 w-5" />
              </a>
              <a
                href="/contact"
                className="border border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-colors flex items-center justify-center space-x-2"
              >
                <span>詳細を相談する</span>
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}