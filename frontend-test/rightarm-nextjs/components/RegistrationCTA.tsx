'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Users, Award, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const RegistrationCTA = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  }

  const stats = [
    { icon: Users, value: '500+', label: '登録CFO数' },
    { icon: TrendingUp, value: '85%', label: 'マッチング成功率' },
    { icon: Award, value: '12日', label: '平均マッチング期間' }
  ]

  const challengeRoutes = [
    {
      title: '資金調達でお困りの方',
      description: '銀行融資・VC調達の経験豊富なCFOが支援',
      color: 'from-blue-500 to-blue-600',
      href: '/auth/register/company'
    },
    {
      title: 'IPO準備を始めたい方',
      description: 'IPO経験者が上場準備をトータルサポート',
      color: 'from-purple-500 to-purple-600',
      href: '/auth/register/company'
    },
    {
      title: '管理会計を強化したい方',
      description: '月次決算・KPI設計で経営の見える化を実現',
      color: 'from-green-500 to-green-600',
      href: '/auth/register/company'
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/10 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '10%', left: '20%' }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Header */}
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <h2 className="text-3xl md:text-4xl font-thin tracking-[0.2em] uppercase mb-6">
              今すぐ始めませんか？
            </h2>
            <div className="flex items-center justify-center mb-8">
              <div className="w-12 h-px bg-white mr-4" />
              <p className="text-gray-300 font-light tracking-[0.1em] text-lg">
                完全無料で利用開始
              </p>
              <div className="w-12 h-px bg-white ml-4" />
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid md:grid-cols-3 gap-8 mb-16"
            variants={itemVariants}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center p-6 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <stat.icon className="w-8 h-8 mx-auto mb-4 text-blue-400" />
                <div className="text-3xl font-light mb-2">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Challenge-based CTAs */}
          <motion.div 
            className="grid lg:grid-cols-3 gap-6 mb-16"
            variants={itemVariants}
          >
            {challengeRoutes.map((route, index) => (
              <Link key={index} href={route.href}>
                <motion.div
                  className={`bg-gradient-to-br ${route.color} p-6 rounded-lg cursor-pointer group relative overflow-hidden`}
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <h3 className="text-lg font-medium mb-3">{route.title}</h3>
                    <p className="text-sm text-white/90 mb-4">{route.description}</p>
                    <div className="flex items-center text-sm font-medium">
                      <span>無料で相談開始</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>

          {/* Main CTA Buttons */}
          <motion.div 
            className="flex flex-col md:flex-row gap-6 justify-center items-center"
            variants={itemVariants}
          >
            <Link href="/auth/register/company">
              <motion.button
                className="bg-white text-black px-8 py-4 font-medium tracking-wider hover:bg-gray-100 transition-colors duration-300 rounded-lg group flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Users className="w-5 h-5 mr-3" />
                企業として登録
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>

            <Link href="/auth/register/cfo">
              <motion.button
                className="border-2 border-white text-white px-8 py-4 font-medium tracking-wider hover:bg-white hover:text-black transition-colors duration-300 rounded-lg group flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Award className="w-5 h-5 mr-3" />
                CFOとして登録
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            className="text-center mt-12 pt-8 border-t border-white/20"
            variants={itemVariants}
          >
            <p className="text-gray-400 text-sm mb-4">
              ✓ 完全無料でスタート　✓ 契約まで費用なし　✓ 面談も無料
            </p>
            <p className="text-gray-500 text-xs">
              利用規約・プライバシーポリシーに同意の上、ご登録ください
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default RegistrationCTA