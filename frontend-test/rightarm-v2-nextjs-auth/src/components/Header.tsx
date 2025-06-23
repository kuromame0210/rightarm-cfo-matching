'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/">
            <h1 className="text-2xl font-bold text-gray-900 tracking-wide cursor-pointer">
              RightArm
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              サービス概要
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              使い方
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              FAQ
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
              お問い合わせ
            </a>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex space-x-3">
            <Link href="/auth/login">
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors">
                ログイン
              </button>
            </Link>
            <Link href="/auth/register">
              <button className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors">
                無料登録
              </button>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-6 h-6"
            onClick={toggleMobileMenu}
            aria-label="メニューを開く"
          >
            <span className={`bg-gray-600 h-0.5 w-6 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`bg-gray-600 h-0.5 w-6 my-1 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`bg-gray-600 h-0.5 w-6 transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <nav className="py-4 space-y-4">
              <a href="#" className="block text-gray-600 hover:text-gray-900 py-2">
                サービス概要
              </a>
              <a href="#" className="block text-gray-600 hover:text-gray-900 py-2">
                使い方
              </a>
              <a href="#" className="block text-gray-600 hover:text-gray-900 py-2">
                FAQ
              </a>
              <a href="#" className="block text-gray-600 hover:text-gray-900 py-2">
                お問い合わせ
              </a>
              <div className="flex space-x-2 pt-4">
                <Link href="/auth/login" className="flex-1">
                  <button className="w-full border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50">
                    ログイン
                  </button>
                </Link>
                <Link href="/auth/register" className="flex-1">
                  <button className="w-full bg-gray-900 text-white py-2 rounded hover:bg-gray-800">
                    無料登録
                  </button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}