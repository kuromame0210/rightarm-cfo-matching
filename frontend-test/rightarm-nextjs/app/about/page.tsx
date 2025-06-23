'use client';

import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  Shield, 
  Globe, 
  Heart,
  CheckCircle,
  ArrowRight,
  Target,
  Lightbulb,
  Award
} from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: Users,
      title: '双方向マッチング',
      description: '企業からCFOへ、CFOから企業へ、お互いにスカウトできる双方向マッチングシステム'
    },
    {
      icon: TrendingUp,
      title: '週1日から導入可能',
      description: '月10万円から始められる低コストでの導入で、企業の成長段階に応じて柔軟に調整'
    },
    {
      icon: Shield,
      title: '厳選されたCFO陣',
      description: '経験豊富で実績のあるCFOのみが登録。上場企業経験者多数'
    },
    {
      icon: Globe,
      title: 'フルリモート対応',
      description: '全国どこからでも、リモートワークで最適なCFOサービスを提供'
    }
  ];

  const stats = [
    { number: '1,000+', label: '登録CFO数', description: '経験豊富なCFO陣' },
    { number: '500+', label: '導入企業数', description: 'スタートアップから上場企業まで' },
    { number: '95%', label: 'マッチング成功率', description: '高精度なマッチング' },
    { number: '200億円+', label: '調達支援実績', description: '累計資金調達額' }
  ];

  const cfoServices = [
    '資金調達・融資支援',
    'IPO準備サポート',
    'M&Aアドバイザリー',
    '管理会計構築',
    '投資家対応',
    '財務戦略立案',
    '内部統制構築',
    'ERP・システム導入'
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ヘロセクション */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-6">
              経営に自由な出会いを
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              RightArmは、全国の中小企業に"経営の右腕"を届けるCFOマッチングプラットフォームです。
              週1日から導入可能で、企業の成長を支える最適なCFOと出会えます。
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-black mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-gray-800 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ミッション・ビジョン */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-4xl font-bold text-black mb-8">
                私たちのミッション
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-2">Mission</h3>
                    <p className="text-gray-700 leading-relaxed">
                      全国の中小企業に、"経営の右腕"を届ける
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-2">Vision</h3>
                    <p className="text-gray-700 leading-relaxed">
                      全ての企業に"最適な経営パートナー"が当たり前にいる世界を
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-black mb-2">Value</h3>
                    <p className="text-gray-700 leading-relaxed">
                      経営に自由な出会いを提供し、企業とCFOの最適なマッチングを実現
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-black mb-6">なぜRightArmなのか</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">従来の人材紹介会社の高額な紹介料を削減</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">企業とCFOが直接やり取りできるプラットフォーム</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">週1日から始められる柔軟な契約形態</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">全国対応・フルリモートワーク可能</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">スカウト・面談まで完全無料</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 主要機能 */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-black mb-6">
              RightArmの特徴
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              企業とCFOの双方にとって最適なマッチングを実現する、革新的な機能をご紹介します。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CFOサービス領域 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-black mb-6">
              CFOが提供するサービス
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              経験豊富なCFOが、企業の成長段階に応じて幅広い財務・経営支援を提供します。
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {cfoServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg p-6 text-center border border-gray-200 hover:border-black transition-colors"
              >
                <Award className="h-8 w-8 text-black mx-auto mb-3" />
                <h3 className="font-semibold text-black">{service}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA セクション */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              あなたに最適なCFOを見つけませんか？
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              週1日・月10万円から始められる、新しいCFOサービス。
              今すぐ無料で登録して、経営の右腕を見つけましょう。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth/register/company"
                className="bg-white text-black px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
              >
                <span>企業として登録</span>
                <ArrowRight className="h-5 w-5" />
              </a>
              <a
                href="/auth/register/cfo"
                className="border border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-black transition-colors flex items-center justify-center space-x-2"
              >
                <span>CFOとして登録</span>
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}