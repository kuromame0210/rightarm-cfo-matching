'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface HeaderProps {
  isLoggedIn?: boolean
  userType?: 'company' | 'cfo'
}

export function Header({ isLoggedIn = false, userType = 'cfo' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigation = isLoggedIn 
    ? [
        { name: 'ホーム', href: '/home', icon: HomeIcon },
        { name: 'スカウト', href: '/scout', icon: MagnifyingGlassIcon },
        { name: 'メッセージ', href: '/messages', icon: ChatBubbleLeftRightIcon },
        { name: '面談', href: '/meetings', icon: CalendarDaysIcon },
      ]
    : [
        { name: 'サービス', href: '/about', icon: null },
        { name: '料金', href: '/pricing', icon: null },
        { name: '使い方', href: '/how-it-works', icon: null },
      ]

  return (
    <header className="bg-white shadow-sm border-b">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <Link href="/" className="-m-1.5 p-1.5">
          <span className="text-2xl font-bold text-orange-500">RIGHTARM</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-semibold leading-6 transition-colors hover:text-orange-500",
                pathname === item.href ? "text-orange-500" : "text-gray-900"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex lg:items-center lg:gap-x-6">
          {isLoggedIn ? (
            <div className="flex items-center gap-x-4">
              <Link href="/discover/cfos" className="text-sm font-semibold leading-6 text-gray-900 hover:text-orange-500">
                {userType === 'company' ? 'CFO検索' : '募集中のCFO一覧'}
              </Link>
              <Link href="/discover/companies" className="text-sm font-semibold leading-6 text-gray-900 hover:text-orange-500">
                {userType === 'cfo' ? '企業検索' : '募集中の企業一覧'}
              </Link>
              <div className="relative">
                <Button variant="ghost" size="icon">
                  <UserCircleIcon className="h-6 w-6" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm font-semibold leading-6 text-gray-900 hover:text-orange-500">
                ログイン
              </Link>
              <Button asChild className="bg-orange-500 hover:bg-orange-600">
                <Link href="/auth/register">新規登録</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5">
                <span className="text-2xl font-bold text-orange-500">RIGHTARM</span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 hover:bg-gray-50",
                        pathname === item.href ? "text-orange-500" : "text-gray-900"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  {isLoggedIn && (
                    <>
                      <Link
                        href="/discover/cfos"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        CFO検索
                      </Link>
                      <Link
                        href="/discover/companies"
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        企業検索
                      </Link>
                    </>
                  )}
                </div>
                <div className="py-6">
                  {isLoggedIn ? (
                    <Link
                      href="/profile"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      プロフィール
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        ログイン
                      </Link>
                      <Link
                        href="/auth/register"
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-orange-500 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        新規登録
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}