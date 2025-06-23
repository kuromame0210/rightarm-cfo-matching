'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  CalendarDaysIcon as CalendarDaysIconSolid
} from '@heroicons/react/24/solid'

const navigation = [
  { 
    name: 'ホーム', 
    href: '/home', 
    icon: HomeIcon,
    iconSolid: HomeIconSolid
  },
  { 
    name: 'スカウト', 
    href: '/scout', 
    icon: MagnifyingGlassIcon,
    iconSolid: MagnifyingGlassIconSolid
  },
  { 
    name: 'メッセージ', 
    href: '/messages', 
    icon: ChatBubbleLeftRightIcon,
    iconSolid: ChatBubbleLeftRightIconSolid
  },
  { 
    name: '面談', 
    href: '/meetings', 
    icon: CalendarDaysIcon,
    iconSolid: CalendarDaysIconSolid
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden">
      <div className="flex">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = isActive ? item.iconSolid : item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs font-medium transition-colors",
                isActive 
                  ? "text-orange-500" 
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}