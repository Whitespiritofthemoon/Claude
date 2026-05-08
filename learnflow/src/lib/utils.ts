import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatPoints(points: number) {
  if (points >= 1000) return `${(points / 1000).toFixed(1)}K`
  return points.toString()
}

export function getToday() {
  return new Date().toISOString().split('T')[0]
}

export function getLevelFromPoints(points: number) {
  if (points < 100) return 1
  if (points < 300) return 2
  if (points < 600) return 3
  if (points < 1000) return 4
  if (points < 1500) return 5
  if (points < 2500) return 6
  if (points < 4000) return 7
  return 8
}
