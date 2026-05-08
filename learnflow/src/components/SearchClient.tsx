'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toggleFavorite } from '@/actions/content'

interface ContentItem {
  id: string
  title: string
  summary: string
  tags: string[]
  viewCount: number
  isFavorite: boolean
  questionCount: number
  createdAt: string
}

interface Props {
  contents: ContentItem[]
  initialQuery: string
  initialFilter: string
}

const FILTERS = [
  { value: 'all', label: 'Tümü' },
  { value: 'recent', label: 'Son Eklenen' },
  { value: 'popular', label: 'Popüler' },
  { value: 'favorites', label: '❤️ Favoriler' },
]

export default function SearchClient({ contents, initialQuery, initialFilter }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [query, setQuery] = useState(initialQuery)
  const [localContents, setLocalContents] = useState(contents)

  const handleSearch = (value: string) => {
    setQuery(value)
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(value)}&filter=${initialFilter}`)
    })
  }

  const handleFilter = (filter: string) => {
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(query)}&filter=${filter}`)
    })
  }

  const handleFavorite = async (id: string) => {
    setLocalContents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    )
    await toggleFavorite(id)
  }

  return (
    <div className="px-4 py-4">
      <div className="mb-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="İçerik ara..."
            className="input pl-10"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              initialFilter === f.value
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--card)] text-[var(--text-muted)] border border-[var(--border)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {localContents.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-[var(--text-muted)]">
            {query ? `"${query}" için sonuç bulunamadı` : 'İçerik bulunamadı'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-[var(--text-muted)]">{localContents.length} içerik</p>
          {localContents.map((c) => (
            <div key={c.id} className="card p-4 animate-slide-up">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm leading-tight mb-1">{c.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2">{c.summary}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-[var(--text-muted)]">
                    <span>👁 {c.viewCount}</span>
                    <span>📝 {c.questionCount} soru</span>
                  </div>
                </div>
                <button
                  onClick={() => handleFavorite(c.id)}
                  className="text-xl flex-shrink-0"
                >
                  {c.isFavorite ? '❤️' : '🤍'}
                </button>
              </div>
              <div className="flex gap-2 mt-3">
                <Link
                  href={`/content/${c.id}`}
                  className="flex-1 text-center py-2 text-xs font-semibold rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]"
                >
                  Detay
                </Link>
                <Link
                  href={`/quiz/${c.id}`}
                  className="flex-1 text-center py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white"
                >
                  Quiz 🎯
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
