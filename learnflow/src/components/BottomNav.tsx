'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/feed', icon: '🏠', label: 'Akış' },
  { href: '/search', icon: '🔍', label: 'Keşfet' },
  { href: '/upload', icon: '➕', label: 'Yükle', special: true },
  { href: '/plan', icon: '📅', label: 'Plan' },
  { href: '/profile', icon: '👤', label: 'Profil' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto">
      <div className="bg-[var(--card)] border-t border-[var(--border)] px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          if (item.special) {
            return (
              <Link key={item.href} href={item.href}>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center text-xl shadow-lg shadow-purple-500/30 -mt-5 animate-pulse-glow">
                  {item.icon}
                </div>
              </Link>
            )
          }
          return (
            <Link key={item.href} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
