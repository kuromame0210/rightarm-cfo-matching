'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  return (
    <header className="bg-black text-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/">
            <motion.h1 
              className="text-xl font-light tracking-[0.2em] uppercase cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              RightArm
            </motion.h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {['サービス概要', '使い方', 'FAQ', 'お問い合わせ'].map((item, index) => (
              <motion.a
                key={item}
                href="#"
                className="text-gray-300 hover:text-white transition-colors duration-300 text-sm font-light"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {item}
              </motion.a>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex space-x-3">
            <Link href="/auth/login">
              <motion.button
                className="border border-white text-white px-4 py-2 text-sm font-medium hover:bg-white hover:text-black transition-all duration-300"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                ログイン
              </motion.button>
            </Link>
            <Link href="/auth/register">
              <motion.button
                className="bg-white text-black px-4 py-2 text-sm font-medium hover:bg-gray-200 transition-all duration-300"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                無料登録
              </motion.button>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden relative w-6 h-6 flex flex-col justify-center items-center"
            onClick={toggleMenu}
          >
            <motion.span
              className="w-5 h-0.5 bg-white absolute transition-all duration-300"
              animate={{
                rotate: isMenuOpen ? 45 : 0,
                y: isMenuOpen ? 0 : -6
              }}
            />
            <motion.span
              className="w-5 h-0.5 bg-white absolute transition-all duration-300"
              animate={{
                opacity: isMenuOpen ? 0 : 1
              }}
            />
            <motion.span
              className="w-5 h-0.5 bg-white absolute transition-all duration-300"
              animate={{
                rotate: isMenuOpen ? -45 : 0,
                y: isMenuOpen ? 0 : 6
              }}
            />
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden border-t border-gray-700"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <nav className="py-4 space-y-4">
                {['サービス概要', '使い方', 'FAQ', 'お問い合わせ'].map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block text-gray-300 hover:text-white transition-colors text-center py-2 border-b border-gray-700 last:border-b-0"
                  >
                    {item}
                  </a>
                ))}
                <div className="flex space-x-2 pt-4">
                  <Link href="/auth/login" className="flex-1">
                    <button className="w-full border border-white text-white py-2 text-sm font-medium hover:bg-white hover:text-black transition-all duration-300">
                      ログイン
                    </button>
                  </Link>
                  <Link href="/auth/register" className="flex-1">
                    <button className="w-full bg-white text-black py-2 text-sm font-medium hover:bg-gray-200 transition-all duration-300">
                      無料登録
                    </button>
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

export default Header