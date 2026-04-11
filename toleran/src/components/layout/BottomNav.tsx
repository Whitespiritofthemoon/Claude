'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ScanLine, MessageCircle, BookOpen, ClipboardList, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/home', label: 'Ana Sayfa', icon: Home },
  { href: '/scan', label: 'Tara', icon: ScanLine },
  { href: '/chat', label: 'Sohbet', icon: MessageCircle },
  { href: '/recipes', label: 'Tarifler', icon: BookOpen },
  { href: '/symptom-log', label: 'Günlük', icon: ClipboardList },
  { href: '/profile', label: 'Profil', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="max-w-lg mx-auto flex items-center justify-around px-1 py-1.5 safe-area-inset-bottom">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/home' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[52px] transition-all duration-150',
                isActive
                  ? 'text-toleran-sage-600'
                  : 'text-gray-400 hover:text-toleran-sage-500 hover:bg-toleran-sage-50'
              )}
            >
              <div className={cn('relative', isActive && 'after:absolute after:-bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-toleran-sage-500')}>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={cn(isActive ? 'text-toleran-sage-600' : 'text-gray-400')}
                />
              </div>
              <span
                className={cn(
                  'text-[10px] font-medium leading-tight',
                  isActive ? 'text-toleran-sage-700' : 'text-gray-400'
                )}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
