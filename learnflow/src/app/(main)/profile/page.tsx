import { getSession, getLevelInfo } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { logoutAction } from '@/actions/auth'
import ProfileStats from '@/components/profile/ProfileStats'
import BadgeGrid from '@/components/profile/BadgeGrid'
import QuizHistory from '@/components/profile/QuizHistory'

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [user, badges, attempts, dailyLogs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      include: { contents: { select: { id: true } } },
    }),
    prisma.userBadge.findMany({
      where: { userId: session.id },
      include: { badge: true },
    }),
    prisma.quizAttempt.findMany({
      where: { userId: session.id },
      include: { content: { select: { title: true } } },
      orderBy: { completedAt: 'desc' },
      take: 10,
    }),
    prisma.dailyLog.findMany({
      where: { userId: session.id },
      orderBy: { date: 'desc' },
      take: 7,
    }),
  ])

  if (!user) redirect('/login')

  const levelInfo = getLevelInfo(user.points)
  const totalQuizzes = await prisma.quizAttempt.count({ where: { userId: session.id } })
  const avgScore =
    attempts.length > 0
      ? Math.round(
          (attempts.reduce((acc, a) => acc + a.score / a.totalQuestions, 0) / attempts.length) * 100
        )
      : 0

  const serializedAttempts = attempts.map((a) => ({
    id: a.id,
    contentTitle: a.content.title,
    score: a.score,
    totalQuestions: a.totalQuestions,
    pointsEarned: a.pointsEarned,
    completedAt: a.completedAt.toISOString(),
  }))

  const serializedLogs = dailyLogs.map((l) => ({
    date: l.date,
    studyMinutes: l.studyMinutes,
    quizzesDone: l.quizzesDone,
    pointsEarned: l.pointsEarned,
  }))

  return (
    <div className="px-4 py-6 animate-fade-in">
      {/* Profile Header */}
      <div className="card p-5 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] flex items-center justify-center text-white text-2xl font-bold">
            {user.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h1 className="font-bold text-lg">{user.name || 'Kullanıcı'}</h1>
            <p className="text-[var(--text-muted)] text-sm">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="badge-pill text-xs">Lv.{levelInfo.level} {levelInfo.name}</span>
              {user.streak > 0 && (
                <span className="text-xs text-orange-400 font-medium">🔥 {user.streak} gün seri</span>
              )}
            </div>
          </div>
        </div>

        {/* Level Progress */}
        {levelInfo.nextLevel && (
          <div>
            <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1.5">
              <span>{levelInfo.name}</span>
              <span>{levelInfo.nextLevel}</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${levelInfo.needed > 0 ? (levelInfo.current / levelInfo.needed) * 100 : 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {levelInfo.current} / {levelInfo.needed} puan
            </p>
          </div>
        )}
      </div>

      <ProfileStats
        totalContents={user.contents.length}
        totalPoints={user.points}
        totalQuizzes={totalQuizzes}
        avgScore={avgScore}
        dailyLogs={serializedLogs}
      />

      {/* Badges */}
      <section className="mb-4">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <span>🏅</span> Rozetlerim ({badges.length})
        </h2>
        <BadgeGrid badges={badges.map((b) => ({ name: b.badge.name, description: b.badge.description, icon: b.badge.icon, earnedAt: b.earnedAt.toISOString() }))} />
      </section>

      {/* Quiz History */}
      <section className="mb-6">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <span>📜</span> Son Quizler
        </h2>
        <QuizHistory attempts={serializedAttempts} />
      </section>

      {/* Logout */}
      <form action={logoutAction}>
        <button type="submit" className="btn-secondary w-full text-red-400 border-red-400/30 hover:bg-red-400/10">
          Çıkış Yap
        </button>
      </form>
    </div>
  )
}
