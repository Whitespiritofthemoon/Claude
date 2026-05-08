interface Badge {
  name: string
  description: string
  icon: string
  earnedAt: string
}

interface Props {
  badges: Badge[]
}

export default function BadgeGrid({ badges }: Props) {
  if (badges.length === 0) {
    return (
      <div className="card p-5 text-center text-[var(--text-muted)] text-sm">
        Henüz rozet kazanılmadı. Quiz çöz ve içerik yükle!
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {badges.map((badge) => (
        <div key={badge.name} className="card p-3 text-center animate-fade-in">
          <div className="text-3xl mb-1">{badge.icon}</div>
          <p className="text-xs font-bold">{badge.name}</p>
          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{badge.description}</p>
        </div>
      ))}
    </div>
  )
}
