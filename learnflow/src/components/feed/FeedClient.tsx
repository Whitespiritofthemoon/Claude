'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ContentCard from './ContentCard'
import EmptyFeed from './EmptyFeed'
import { toggleFavorite, incrementViewCount } from '@/actions/content'

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
  contents: ContentItem[]
  currentSort: string
}

const SORT_OPTIONS = [
  { value: 'recent', label: 'Yeni' },
  { value: 'popular', label: 'Popüler' },
  { value: 'favorites', label: 'Favoriler' },
]

export default function FeedClient({ contents, currentSort }: Props) {
  const router = useRouter()
  const [localContents, setLocalContents] = useState(contents)

  const handleSort = (sort: string) => {
    router.push(`/feed?sort=${sort}`)
  }

  const handleFavorite = async (id: string) => {
    setLocalContents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    )
    await toggleFavorite(id)
  }

  const handleView = async (id: string) => {
    await incrementViewCount(id)
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleSort(opt.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              currentSort === opt.value
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--card)] text-[var(--text-muted)] border border-[var(--border)]'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {localContents.length === 0 ? (
        <EmptyFeed />
      ) : (
        <div className="flex flex-col gap-4">
          {localContents.map((content, index) => (
            <ContentCard
              key={content.id}
              content={content}
              index={index}
              onFavorite={handleFavorite}
              onView={handleView}
            />
          ))}
        </div>
      )}
    </div>
  )
}
