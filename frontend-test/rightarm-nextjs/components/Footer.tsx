'use client'

import { motion } from 'framer-motion'

const Footer = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
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

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white overflow-hidden">
      {/* Background Gradient Effects */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-gray-600/10 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '10%', left: '20%' }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-l from-gray-500/10 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ bottom: '10%', right: '20%' }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        <motion.div
          className="grid md:grid-cols-4 gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Company Info */}
          <motion.div className="md:col-span-2" variants={itemVariants}>
            <motion.h3 
              className="text-2xl font-thin tracking-[0.3em] uppercase mb-6 text-white relative"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              RightArm
              <motion.div 
                className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-white to-transparent"
                initial={{ width: 0 }}
                whileInView={{ width: '60px' }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </motion.h3>
            <motion.p 
              className="text-gray-300 text-base font-light leading-relaxed mb-6 max-w-md"
              variants={itemVariants}
            >
              全国の企業に"右腕CFO"を届ける<br />
              新しいマッチングプラットフォーム
            </motion.p>
            
            {/* Social Icons Placeholder */}
            <motion.div 
              className="flex space-x-4"
              variants={itemVariants}
            >
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Services */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-light uppercase tracking-wider mb-6 text-gray-200 relative">
              サービス
              <div className="absolute bottom-0 left-0 w-8 h-px bg-gray-500 mt-2"></div>
            </h4>
            <ul className="space-y-3">
              {['CFOを探す', '企業を探す', '料金プラン'].map((item, index) => (
                <motion.li 
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <motion.a
                    href="#"
                    className="text-gray-400 text-sm font-light hover:text-white transition-all duration-300 relative group inline-block"
                    whileHover={{ x: 5 }}
                  >
                    <span className="relative">
                      {item}
                      <motion.div 
                        className="absolute bottom-0 left-0 h-px bg-white"
                        initial={{ width: 0 }}
                        whileHover={{ width: '100%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </span>
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div variants={itemVariants}>
            <h4 className="text-lg font-light uppercase tracking-wider mb-6 text-gray-200 relative">
              サポート
              <div className="absolute bottom-0 left-0 w-8 h-px bg-gray-500 mt-2"></div>
            </h4>
            <ul className="space-y-3">
              {['よくある質問', 'お問い合わせ', '利用規約', 'プライバシーポリシー'].map((item, index) => (
                <motion.li 
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <motion.a
                    href="#"
                    className="text-gray-400 text-sm font-light hover:text-white transition-all duration-300 relative group inline-block"
                    whileHover={{ x: 5 }}
                  >
                    <span className="relative">
                      {item}
                      <motion.div 
                        className="absolute bottom-0 left-0 h-px bg-white"
                        initial={{ width: 0 }}
                        whileHover={{ width: '100%' }}
                        transition={{ duration: 0.3 }}
                      />
                    </span>
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          className="relative mt-16 pt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <motion.p 
              className="text-gray-500 text-sm font-light"
              whileHover={{ color: '#ffffff' }}
              transition={{ duration: 0.3 }}
            >
              &copy; 2024 RightArm. All rights reserved.
            </motion.p>
            
            <motion.div 
              className="flex space-x-6 text-sm text-gray-500"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              viewport={{ once: true }}
            >
              {['Privacy', 'Terms', 'Cookies'].map((item) => (
                <motion.a
                  key={item}
                  href="#"
                  className="hover:text-white transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  {item}
                </motion.a>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer