'use client'

import { motion } from 'framer-motion'
import { Search, MessageSquare, Calendar, TrendingUp, Building2, DollarSign, Bell, Settings, Users, Star } from 'lucide-react'
import Link from 'next/link'

const CFODashboard = () => {
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
    { label: '受信スカウト', value: '8', icon: Users, color: 'text-blue-600' },
    { label: '契約中企業', value: '2', icon: Building2, color: 'text-green-600' },
    { label: '今月の面談', value: '5', icon: Calendar, color: 'text-purple-600' },
    { label: '今月の収益', value: '¥240,000', icon: DollarSign, color: 'text-orange-600' }
  ]

  const recentActivity = [
    { type: 'scout', message: '株式会社ABCからスカウトが届きました', time: '1時間前' },
    { type: 'contract', message: '株式会社XYZとの契約が完了しました', time: '3時間前' },
    { type: 'interview', message: '株式会社DEFとの面談が予定されました', time: '6時間前' },
    { type: 'profile', message: 'プロフィールが閲覧されました', time: '1日前' }
  ]

  const currentContracts = [
    { 
      company: '株式会社テックスタート', 
      industry: 'IT・テクノロジー', 
      duration: '3ヶ月目', 
      rate: '月80万円',
      tasks: ['資金調達サポート', 'IPO準備'],
      status: 'active'
    },
    { 
      company: '株式会社製造業A', 
      industry: '製造業', 
      duration: '1ヶ月目', 
      rate: '月60万円',
      tasks: ['管理会計導入', '原価計算'],
      status: 'active'
    }
  ]

  const opportunityCompanies = [
    { name: '株式会社グロース', industry: 'EC・小売', revenue: '年商15億円', challenge: '資金調達・IPO準備', budget: '月100万円〜' },
    { name: '株式会社リージョナル', industry: '建設業', revenue: '年商8億円', challenge: 'M&A準備', budget: '月70万円〜' },
    { name: '株式会社イノベート', industry: 'SaaS', revenue: '年商3億円', challenge: '管理会計強化', budget: '月50万円〜' }
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
                  CFOダッシュボード
                </h1>
                <p className="text-gray-600">山田 太郎様</p>
                <div className="flex items-center mt-2">
                  <div className="flex items-center mr-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                    <span className="text-sm text-gray-600 ml-2">4.8 (12件)</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-4 md:mt-0">
                <Link href="/dashboard/cfo/profile">
                  <motion.button
                    className="btn-outline px-6 py-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    設定
                  </motion.button>
                </Link>
                <Link href="/search/company">
                  <motion.button
                    className="btn-primary px-6 py-2"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    企業を探す
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
            {/* Current Contracts */}
            <motion.div 
              className="lg:col-span-2 bg-white rounded-lg shadow-md p-6"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light text-gray-900">現在の契約企業</h2>
                <Building2 className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="space-y-6">
                {currentContracts.map((contract, index) => (
                  <motion.div
                    key={index}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{contract.company}</h3>
                        <p className="text-sm text-gray-600">{contract.industry}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-gray-900">{contract.rate}</p>
                        <p className="text-sm text-gray-600">{contract.duration}</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 mb-2">担当業務:</p>
                      <div className="flex flex-wrap gap-2">
                        {contract.tasks.map((task, taskIndex) => (
                          <span key={taskIndex} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {task}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                        詳細確認
                      </button>
                      <button className="flex-1 py-2 px-4 bg-black text-white rounded-md text-sm hover:bg-gray-800">
                        メッセージ
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div 
              className="bg-white rounded-lg shadow-md p-6"
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
                    className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
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
                <Link href="/dashboard/cfo/activity" className="text-sm text-black hover:underline">
                  すべての活動を見る →
                </Link>
              </div>
            </motion.div>
          </div>

          {/* New Opportunities */}
          <motion.div 
            className="mt-8 bg-white rounded-lg shadow-md p-6"
            variants={itemVariants}
          >
            <h2 className="text-xl font-light text-gray-900 mb-6">新しい案件</h2>
            
            <div className="grid lg:grid-cols-3 gap-6">
              {opportunityCompanies.map((company, index) => (
                <motion.div
                  key={index}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                >
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{company.name}</h3>
                    <p className="text-sm text-gray-600">{company.industry}</p>
                    <p className="text-sm text-gray-600">{company.revenue}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 mb-2">課題:</p>
                    <p className="text-sm text-gray-900">{company.challenge}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900">{company.budget}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 px-3 border border-gray-300 rounded text-sm hover:bg-gray-50">
                      詳細
                    </button>
                    <button className="flex-1 py-2 px-3 bg-black text-white rounded text-sm hover:bg-gray-800">
                      応募
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            className="mt-8 bg-gradient-to-r from-gray-900 to-black rounded-lg p-8 text-white"
            variants={itemVariants}
          >
            <h2 className="text-2xl font-light mb-6">クイックアクション</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link href="/search/company">
                <motion.div
                  className="bg-white/10 rounded-lg p-6 hover:bg-white/20 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  <Search className="w-8 h-8 mb-4" />
                  <h3 className="text-lg font-medium mb-2">企業を探す</h3>
                  <p className="text-sm text-gray-300">条件に合う企業を検索</p>
                </motion.div>
              </Link>
              
              <Link href="/dashboard/cfo/messages">
                <motion.div
                  className="bg-white/10 rounded-lg p-6 hover:bg-white/20 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  <MessageSquare className="w-8 h-8 mb-4" />
                  <h3 className="text-lg font-medium mb-2">メッセージ</h3>
                  <p className="text-sm text-gray-300">企業とのやり取り</p>
                </motion.div>
              </Link>
              
              <Link href="/dashboard/cfo/portfolio">
                <motion.div
                  className="bg-white/10 rounded-lg p-6 hover:bg-white/20 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  <TrendingUp className="w-8 h-8 mb-4" />
                  <h3 className="text-lg font-medium mb-2">実績管理</h3>
                  <p className="text-sm text-gray-300">ポートフォリオと成果</p>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default CFODashboard