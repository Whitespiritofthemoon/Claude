'use client'

import { ArrowLeft, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title?: string
  subtitle?: string
  showBack?: boolean
  showNotification?: boolean
  className?: string
  action?: React.ReactNode
  transparent?: boolean
}

export function Header({
  title,
  subtitle,
  showBack = false,
  showNotification = false,
  className,
  action,
  transparent = false,
}: HeaderProps) {
  const router = useRouter()

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex items-center justify-between px-4 py-3',
        !transparent && 'bg-toleran-bg border-b border-gray-100/80 backdrop-blur-sm',
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-toleran-sage-700 hover:bg-toleran-sage-50 transition-colors"
            aria-label="Geri"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
        )}
        {title && (
          <div className="min-w-0">
            <h1 className="text-base font-bold text-toleran-text truncate leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs text-toleran-muted truncate leading-tight mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {action}
        {showNotification && (
          <button
            className="w-9 h-9 rounded-xl flex items-center justify-center text-toleran-sage-700 hover:bg-toleran-sage-50 transition-colors relative"
            aria-label="Bildirimler"
          >
            <Bell size={20} strokeWidth={1.8} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-toleran-coral-400 rounded-full" />
          </button>
        )}
      </div>
    </header>
  )
}

// ─── App logo header ──────────────────────────────────────────────────────────

export function AppHeader({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-toleran-bg">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-toleran-sage-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">T</span>
        </div>
        <div>
          <span className="text-base font-bold text-toleran-sage-700 leading-tight block">
            toleran
          </span>
          {subtitle && (
            <span className="text-xs text-toleran-muted leading-tight block">{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  )
}
