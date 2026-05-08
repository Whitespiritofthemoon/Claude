'use client'

import { useState } from 'react'

interface Flashcard {
  front: string
  back: string
}

interface Props {
  flashcards: Flashcard[]
}

export default function FlashcardDeck({ flashcards }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const current = flashcards[currentIndex]

  const next = () => {
    setFlipped(false)
    setTimeout(() => setCurrentIndex((i) => (i + 1) % flashcards.length), 150)
  }

  const prev = () => {
    setFlipped(false)
    setTimeout(() => setCurrentIndex((i) => (i - 1 + flashcards.length) % flashcards.length), 150)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="w-full min-h-40 card p-5 cursor-pointer flex items-center justify-center text-center relative overflow-hidden transition-all duration-300"
        style={{
          background: flipped
            ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)'
            : 'var(--card)',
        }}
        onClick={() => setFlipped(!flipped)}
      >
        <div>
          {flipped ? (
            <div className="animate-fade-in">
              <p className="text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">Cevap</p>
              <p className="text-white font-semibold text-base leading-relaxed">{current.back}</p>
            </div>
          ) : (
            <div className="animate-fade-in">
              <p className="text-xs font-medium text-[var(--text-muted)] mb-2 uppercase tracking-wider">Soru</p>
              <p className="font-semibold text-base leading-relaxed">{current.front}</p>
              <p className="text-xs text-[var(--text-muted)] mt-3">Çevirmek için dokun</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={prev} className="btn-secondary px-4 py-2 text-sm">
          ← Önceki
        </button>
        <span className="text-sm text-[var(--text-muted)]">
          {currentIndex + 1} / {flashcards.length}
        </span>
        <button onClick={next} className="btn-secondary px-4 py-2 text-sm">
          Sonraki →
        </button>
      </div>

      <div className="flex gap-1.5">
        {flashcards.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === currentIndex ? 'w-6 bg-[var(--primary)]' : 'w-1.5 bg-[var(--border)]'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
