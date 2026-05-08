'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitQuizAttempt } from '@/actions/content'

interface Question {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

interface Props {
  contentId: string
  contentTitle: string
  questions: Question[]
}

type QuizState = 'intro' | 'playing' | 'result'

export default function QuizClient({ contentId, contentTitle, questions }: Props) {
  const router = useRouter()
  const [state, setState] = useState<QuizState>('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [pointsEarned, setPointsEarned] = useState(0)
  const [newBadges, setNewBadges] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const current = questions[currentQ]
  const progress = ((currentQ) / questions.length) * 100

  const handleAnswer = (optionIndex: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(optionIndex)
    setShowExplanation(true)
    if (optionIndex === current.correctIndex) setScore((s) => s + 1)
  }

  const handleNext = async () => {
    const newAnswers = [...answers, selectedAnswer ?? -1]
    setAnswers(newAnswers)
    setSelectedAnswer(null)
    setShowExplanation(false)

    if (currentQ + 1 >= questions.length) {
      setSubmitting(true)
      const finalScore = newAnswers.filter((a, i) => a === questions[i].correctIndex).length
      const result = await submitQuizAttempt(contentId, newAnswers, finalScore)
      setPointsEarned(result.pointsEarned)
      setNewBadges(result.newBadges)
      setScore(finalScore)
      setSubmitting(false)
      setState('result')
    } else {
      setCurrentQ((q) => q + 1)
    }
  }

  const getOptionStyle = (optionIndex: number) => {
    if (selectedAnswer === null)
      return 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5 cursor-pointer'
    if (optionIndex === current.correctIndex)
      return 'border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]'
    if (optionIndex === selectedAnswer)
      return 'border-[var(--danger)] bg-[var(--danger)]/10 text-[var(--danger)]'
    return 'border-[var(--border)] bg-[var(--card)] opacity-60'
  }

  if (state === 'intro') {
    return (
      <div className="px-4 py-8 flex flex-col items-center text-center animate-fade-in">
        <div className="text-6xl mb-4">🎯</div>
        <h1 className="text-xl font-bold mb-2">{contentTitle}</h1>
        <p className="text-[var(--text-muted)] text-sm mb-2">{questions.length} soruluk quiz</p>
        <div className="card p-4 mb-8 w-full text-left">
          <h3 className="font-semibold mb-3">Kazanacakların:</h3>
          <div className="flex flex-col gap-2 text-sm text-[var(--text-muted)]">
            <div className="flex items-center gap-2">⚡ Quiz tamamlama: <span className="text-[var(--accent)] font-bold">30 puan</span></div>
            <div className="flex items-center gap-2">🏆 Mükemmel skor: <span className="text-[var(--accent)] font-bold">50 puan</span></div>
          </div>
        </div>
        <button onClick={() => setState('playing')} className="btn-primary w-full">
          Başla!
        </button>
        <button onClick={() => router.back()} className="btn-secondary w-full mt-3">
          Geri Dön
        </button>
      </div>
    )
  }

  if (state === 'result') {
    const percentage = Math.round((score / questions.length) * 100)
    const emoji = percentage === 100 ? '🏆' : percentage >= 80 ? '🌟' : percentage >= 60 ? '👍' : '💪'

    return (
      <div className="px-4 py-8 flex flex-col items-center text-center animate-bounce-in">
        <div className="text-7xl mb-4">{emoji}</div>
        <h1 className="text-2xl font-bold mb-1">Quiz Tamamlandı!</h1>
        <p className="text-[var(--text-muted)] text-sm mb-6">{contentTitle}</p>

        <div className="card p-6 w-full mb-6">
          <div className="text-5xl font-bold gradient-text mb-1">
            {score}/{questions.length}
          </div>
          <div className="text-[var(--text-muted)] text-sm mb-4">doğru cevap ({percentage}%)</div>

          <div className="progress-bar mb-4">
            <div className="progress-fill" style={{ width: `${percentage}%` }} />
          </div>

          <div className="flex items-center justify-center gap-1.5 text-lg font-bold text-[var(--accent)]">
            <span>⚡</span>
            <span>+{pointsEarned} puan kazandın!</span>
          </div>
        </div>

        {newBadges.length > 0 && (
          <div className="card p-4 w-full mb-4 border-[var(--accent)] bg-[var(--accent)]/5">
            <p className="font-semibold mb-2">🏅 Yeni Rozetler Kazandın!</p>
            {newBadges.map((badge) => (
              <p key={badge} className="text-sm text-[var(--accent)]">• {badge}</p>
            ))}
          </div>
        )}

        <div className="flex gap-3 w-full">
          <button onClick={() => router.push('/feed')} className="btn-secondary flex-1">
            Akışa Dön
          </button>
          <button
            onClick={() => {
              setState('intro')
              setCurrentQ(0)
              setAnswers([])
              setScore(0)
              setSelectedAnswer(null)
            }}
            className="btn-primary flex-1"
          >
            Tekrar Çöz
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 animate-fade-in">
      <div className="mb-4">
        <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2">
          <span>Soru {currentQ + 1} / {questions.length}</span>
          <span>{score} doğru</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="card p-5 mb-5">
        <p className="font-semibold leading-relaxed text-base">{current.question}</p>
      </div>

      <div className="flex flex-col gap-3 mb-5">
        {current.options.map((option: string, i: number) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            className={`w-full text-left p-4 rounded-xl border transition-all text-sm leading-relaxed ${getOptionStyle(i)}`}
          >
            <span className="font-bold mr-2 text-[var(--primary)]">
              {String.fromCharCode(65 + i)}.
            </span>
            {option}
          </button>
        ))}
      </div>

      {showExplanation && current.explanation && (
        <div className="card p-4 mb-4 border-[var(--primary)]/30 bg-[var(--primary)]/5 animate-fade-in">
          <p className="text-xs font-semibold text-[var(--primary)] mb-1">💡 Açıklama</p>
          <p className="text-sm text-[var(--text-muted)]">{current.explanation}</p>
        </div>
      )}

      {selectedAnswer !== null && (
        <button
          onClick={handleNext}
          disabled={submitting}
          className="btn-primary w-full"
        >
          {submitting
            ? 'Kaydediliyor...'
            : currentQ + 1 >= questions.length
            ? 'Sonuçları Gör 🎉'
            : 'Sonraki Soru →'}
        </button>
      )}
    </div>
  )
}
