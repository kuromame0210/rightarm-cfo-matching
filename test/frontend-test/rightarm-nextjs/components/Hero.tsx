'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const Hero = () => {
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

  return (
    <section className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden flex items-center pt-12 pb-8">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-r from-black/5 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '20%', left: '10%' }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-gradient-to-l from-gray-400/10 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '50%', right: '10%' }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10 w-full">
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Title */}
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-thin tracking-[0.3em] uppercase mb-6 text-black"
            variants={itemVariants}
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          >
            RightArm
          </motion.h1>

          {/* Subtitle with decorative lines */}
          <motion.div
            className="flex items-center justify-center mb-16"
            variants={itemVariants}
          >
            <div className="hidden sm:block w-8 h-px bg-gray-400 mr-4" />
            <p className="text-gray-600 font-light tracking-[0.1em] text-sm md:text-base">
              全国の企業に、"右腕CFO"を届ける
            </p>
            <div className="hidden sm:block w-8 h-px bg-gray-400 ml-4" />
          </motion.div>

          {/* Service Blocks */}
          <motion.div
            className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            variants={itemVariants}
          >
            {/* Enterprise Block */}
            <motion.div
              className="service-card p-8"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h3
                className="text-lg font-light uppercase tracking-wider mb-6 text-gray-800 relative pb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                企業の方
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-px bg-gray-300" />
              </motion.h3>

              <div className="space-y-3 mb-8">
                {[
                  '週1日から導入可能',
                  'リモートのみでもok',
                  'CFOを低コストで導入'
                ].map((text, index) => (
                  <motion.div
                    key={text}
                    className="flex items-center justify-start text-sm text-gray-600"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                  >
                    <span className="text-gray-400 mr-3">▸</span>
                    {text}
                  </motion.div>
                ))}
              </div>

              <Link href="/search/cfo">
                <motion.button
                  className="btn-primary w-full btn-shimmer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  CFOを探す
                </motion.button>
              </Link>
            </motion.div>

            {/* CFO Block */}
            <motion.div
              className="service-card p-8"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.h3
                className="text-lg font-light uppercase tracking-wider mb-6 text-gray-800 relative pb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                CFOの方
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-px bg-gray-300" />
              </motion.h3>

              <div className="space-y-3 mb-8">
                {[
                  '財務知識で企業を支援',
                  '副業として活動可能',
                  '複業で仕事の幅を広げる'
                ].map((text, index) => (
                  <motion.div
                    key={text}
                    className="flex items-center justify-start text-sm text-gray-600"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 + index * 0.1 }}
                  >
                    <span className="text-gray-400 mr-3">▸</span>
                    {text}
                  </motion.div>
                ))}
              </div>

              <Link href="/search/company">
                <motion.button
                  className="btn-outline w-full btn-shimmer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6 }}
                >
                  企業を探す
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero