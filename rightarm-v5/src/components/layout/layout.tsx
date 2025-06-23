'use client'

import { ReactNode } from 'react'
import { Header } from './header'
import { BottomNav } from './bottom-nav'

interface LayoutProps {
  children: ReactNode
  isLoggedIn?: boolean
  userType?: 'company' | 'cfo'
  showBottomNav?: boolean
}

export function Layout({ 
  children, 
  isLoggedIn = false, 
  userType = 'cfo',
  showBottomNav = true 
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header isLoggedIn={isLoggedIn} userType={userType} />
      <main className={`${showBottomNav && isLoggedIn ? 'pb-16 lg:pb-0' : ''}`}>
        {children}
      </main>
      {isLoggedIn && showBottomNav && <BottomNav />}
    </div>
  )
}