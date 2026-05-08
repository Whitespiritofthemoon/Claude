'use client'

import Link from 'next/link'
import { SessionUser } from '@/lib/auth'
import { getLevelFromPoints } from '@/lib/utils'

interface Props {
  user: SessionUser
}

export default function TopBar({ user }: Props) {
  const level = getLevelFromPoints(user.points)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 max-w-lg mx-auto">
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--background)] border-b border-[var(--border)]">
        <Link href="/feed" className="text-xl font-bold gradient-text">
          LearnFlow
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--accent)]">⚡</span>
            <span className="text-sm font-bold text-[var(--accent)]">{user.points}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[var(--primary)]/15 px-2.5 py-1 rounded-full">
            <span className="text-xs font-bold text-[var(--primary)]">Lv.{level}</span>
          </div>
          {user.streak > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-sm">🔥</span>
              <span className="text-xs font-bold text-orange-400">{user.streak}</span>
            </div>
          )}
          <Link href="/profile">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center text-white text-sm font-bold">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
