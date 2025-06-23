'use client'

import { motion } from 'framer-motion'
import { Search, MessageSquare, Calendar, TrendingUp, Users, DollarSign, Bell, Settings } from 'lucide-react'
import Link from 'next/link'

const CompanyDashboard = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  }

  const stats = [
    { label: 'スカウト送信', value: '12', icon: Users, color: 'text-blue-600' },
    { label: '返信率', value: '67%', icon: MessageSquare, color: 'text-green-600' },
    { label: '面談予定', value: '3', icon: Calendar, color: 'text-purple-600' },
    { label: '今月の費用', value: '¥0', icon: DollarSign, color: 'text-gray-600' }
  ]

  const recentActivity = [
    { type: 'match', message: '山田CFOからメッセージが届きました', time: '2時間前' },
    { type: 'interview', message: '田中CFOとの面談が予定されました', time: '5時間前' },
    { type: 'scout', message: '佐藤CFOにスカウトを送信しました', time: '1日前' },
    { type: 'profile', message: 'プロフィールが更新されました', time: '2日前' }
  ]

  const recommendedCFOs = [
    { name: '山田 太郎', specialty: '資金調達・IPO準備', experience: '15年', rate: '月80万円〜', image: '/placeholder-user.jpg' },
    { name: '田中 花子', specialty: '管理会計・財務分析', experience: '12年', rate: '月60万円〜', image: '/placeholder-user.jpg' },
    { name: '佐藤 次郎', specialty: 'M&A・事業再生', experience: '18年', rate: '月100万円〜', image: '/placeholder-user.jpg' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div className="mb-8" variants={itemVariants}>
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h1 className="text-3xl font-thin tracking-wide text-gray-900 mb-2">
                  企業ダッシュボード
                </h1>
                <p className="text-gray-600">株式会社サンプル様</p>
              </div>
              <div className="flex gap-4 mt-4 md:mt-0">
                <Link href="/dashboard/company/profile">
                  <motion.button
                    className="btn-outline px-6 py-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    設定
                  </motion.button>
                </Link>
                <Link href="/search/cfo">
                  <motion.button
                    className="btn-primary px-6 py-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    CFOを探す
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={itemVariants}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-light text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <motion.div 
              className="lg:col-span-2 bg-white rounded-lg shadow-md p-6"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light text-gray-900">最近の活動</h2>
                <Bell className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-gray-900 text-sm">{activity.message}</p>
                      <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <Link href="/dashboard/company/activity" className="text-sm text-black hover:underline">
                  すべての活動を見る →
                </Link>
              </div>
            </motion.div>

            {/* Recommended CFOs */}
            <motion.div 
              className="bg-white rounded-lg shadow-md p-6"
              variants={itemVariants}
            >
              <h2 className="text-xl font-light text-gray-900 mb-6">おすすめのCFO</h2>
              
              <div className="space-y-4">
                {recommendedCFOs.map((cfo, index) => (
                  <motion.div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{cfo.name}</h3>
                        <p className="text-xs text-gray-600 mt-1">{cfo.specialty}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">経験: {cfo.experience}</span>
                          <span className="text-xs font-medium text-gray-900">{cfo.rate}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex gap-2">
                      <button className="flex-1 text-xs py-1 px-2 border border-gray-300 rounded hover:bg-gray-50">
                        詳細
                      </button>
                      <button className="flex-1 text-xs py-1 px-2 bg-black text-white rounded hover:bg-gray-800">
                        スカウト
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t">
                <Link href="/search/cfo" className="text-sm text-black hover:underline">
                  もっとCFOを見る →
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div 
            className="mt-8 bg-gradient-to-r from-gray-900 to-black rounded-lg p-8 text-white"
            variants={itemVariants}
          >
            <h2 className="text-2xl font-light mb-6">クイックアクション</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/search/cfo">
                <motion.div
                  className="bg-white/10 rounded-lg p-6 hover:bg-white/20 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  <Search className="w-8 h-8 mb-4" />
                  <h3 className="text-lg font-medium mb-2">CFOを探す</h3>
                  <p className="text-sm text-gray-300">条件に合うCFOを検索</p>
                </motion.div>
              </Link>
              
              <Link href="/dashboard/company/messages">
                <motion.div
                  className="bg-white/10 rounded-lg p-6 hover:bg-white/20 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  <MessageSquare className="w-8 h-8 mb-4" />
                  <h3 className="text-lg font-medium mb-2">メッセージ</h3>
                  <p className="text-sm text-gray-300">CFOとのやり取り</p>
                </motion.div>
              </Link>
              
              <Link href="/dashboard/company/interviews">
                <motion.div
                  className="bg-white/10 rounded-lg p-6 hover:bg-white/20 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  <Calendar className="w-8 h-8 mb-4" />
                  <h3 className="text-lg font-medium mb-2">面談管理</h3>
                  <p className="text-sm text-gray-300">面談の予定と履歴</p>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default CompanyDashboard