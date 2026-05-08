'use client'

import { useState } from 'react'
import Link from 'next/link'

const COVER_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
]

interface ContentItem {
  id: string
  title: string
  summary: string
  keyPoints: string[]
  tags: string[]
  viewCount: number
  isFavorite: boolean
  questionCount: number
  coverImage: string | null
  createdAt: string
}

interface Props {
  content: ContentItem
  index: number
  onFavorite: (id: string) => void
  onView: (id: string) => void
}

export default function ContentCard({ content, index, onFavorite, onView }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [favorited, setFavorited] = useState(content.isFavorite)
  const gradient = COVER_GRADIENTS[index % COVER_GRADIENTS.length]

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    setFavorited(!favorited)
    onFavorite(content.id)
  }

  const handleView = () => {
    onView(content.id)
  }

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
    if (diff < 60) return 'Az önce'
    if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`
    if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`
    return `${Math.floor(diff / 86400)} gün önce`
  }

  return (
    <div
      className="feed-card animate-slide-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        className="h-40 flex items-end p-4 relative"
        style={{ background: gradient }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex-1">
          <h2 className="text-white font-bold text-lg leading-tight line-clamp-2">{content.title}</h2>
        </div>
        <button
          onClick={handleFavorite}
          className="relative z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-lg transition-transform hover:scale-110"
        >
          {favorited ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3 text-xs text-[var(--text-muted)]">
          <span>👁 {content.viewCount}</span>
          <span>📝 {content.questionCount} soru</span>
          <span className="ml-auto">{timeAgo(content.createdAt)}</span>
        </div>

        <p className={`text-sm text-[var(--text-muted)] leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
          {content.summary}
        </p>

        {content.summary.length > 200 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-[var(--primary)] mt-1 font-medium"
          >
            {expanded ? 'Daha az göster' : 'Devamını oku'}
          </button>
        )}

        {content.keyPoints.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {content.keyPoints.slice(0, 3).map((point, i) => (
              <span
                key={i}
                className="text-xs bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-0.5 rounded-full"
              >
                {point.length > 30 ? point.slice(0, 30) + '…' : point}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Link
            href={`/content/${content.id}`}
            onClick={handleView}
            className="flex-1 text-center py-2.5 text-sm font-semibold rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 hover:bg-[var(--primary)]/20 transition-colors"
          >
            Detayları Gör
          </Link>
          <Link
            href={`/quiz/${content.id}`}
            className="flex-1 text-center py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white hover:opacity-90 transition-opacity"
          >
            Quiz Başlat 🎯
          </Link>
        </div>
      </div>
    </div>
  )
}
