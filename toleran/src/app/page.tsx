'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'

export default function RootPage() {
  const router = useRouter()
  const user = useAppStore((s) => s.user)

  useEffect(() => {
    // Short splash delay then route
    const timer = setTimeout(() => {
      if (user?.onboardingCompleted) {
        router.replace('/home')
      } else {
        router.replace('/onboarding')
      }
    }, 1200)
    return () => clearTimeout(timer)
  }, [user, router])

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-toleran-bg gap-4">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 animate-fade-in-up">
        <div className="w-20 h-20 rounded-3xl bg-toleran-sage-500 flex items-center justify-center shadow-float">
          <span className="text-white font-bold text-4xl">T</span>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-toleran-sage-700 tracking-tight">toleran</h1>
          <p className="text-sm text-toleran-muted mt-1">Kişisel beslenme karar desteği</p>
        </div>
      </div>

      {/* Loading dots */}
      <div className="flex items-center gap-1.5 mt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-toleran-sage-300 animate-pulse-soft"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}
