interface Attempt {
  id: string
  contentTitle: string
  score: number
  totalQuestions: number
  pointsEarned: number
  completedAt: string
}

interface Props {
  attempts: Attempt[]
}

export default function QuizHistory({ attempts }: Props) {
  if (attempts.length === 0) {
    return (
      <div className="card p-5 text-center text-[var(--text-muted)] text-sm">
        Henüz quiz çözülmedi. Hadi başla!
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {attempts.map((a) => {
        const pct = Math.round((a.score / a.totalQuestions) * 100)
        const color = pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--accent)' : 'var(--danger)'
        return (
          <div key={a.id} className="card p-3 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: `${color}20`, color }}
            >
              {pct}%
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{a.contentTitle}</p>
              <p className="text-xs text-[var(--text-muted)]">
                {a.score}/{a.totalQuestions} doğru • +{a.pointsEarned} puan
              </p>
            </div>
            <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">
              {new Date(a.completedAt).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        )
      })}
    </div>
  )
}
