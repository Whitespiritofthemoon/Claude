import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { updateStudyPlan } from '@/actions/content'

export default async function PlanPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [plan, weekLog] = await Promise.all([
    prisma.studyPlan.findUnique({ where: { userId: session.id } }),
    (async () => {
      const since = new Date()
      since.setDate(since.getDate() - 7)
      const sinceStr = since.toISOString().split('T')[0]
      return prisma.dailyLog.findMany({
        where: { userId: session.id, date: { gte: sinceStr } },
      })
    })(),
  ])

  const weeklyMinutes = weekLog.reduce((acc, l) => acc + l.studyMinutes, 0)
  const weeklyQuizzes = weekLog.reduce((acc, l) => acc + l.quizzesDone, 0)
  const goalMinutes = plan?.weeklyGoalMinutes ?? 140
  const goalQuizzes = plan?.weeklyGoalQuizzes ?? 3

  const minutesPct = Math.min(100, Math.round((weeklyMinutes / goalMinutes) * 100))
  const quizzesPct = Math.min(100, Math.round((weeklyQuizzes / goalQuizzes) * 100))

  return (
    <div className="px-4 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Çalışma Planım</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">Haftalık hedeflerini belirle ve takip et</p>
      </div>

      {/* Weekly Progress */}
      <div className="card p-5 mb-5">
        <h2 className="font-semibold mb-4">Bu Haftanın İlerlemesi</h2>
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="flex items-center gap-1.5">⏱ Çalışma Süresi</span>
              <span className="font-bold">
                {weeklyMinutes} / {goalMinutes} dk
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${minutesPct}%` }} />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">{minutesPct}% tamamlandı</p>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="flex items-center gap-1.5">🎯 Quiz Hedefi</span>
              <span className="font-bold">
                {weeklyQuizzes} / {goalQuizzes} quiz
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${quizzesPct}%` }} />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">{quizzesPct}% tamamlandı</p>
          </div>
        </div>

        {minutesPct >= 100 && quizzesPct >= 100 && (
          <div className="mt-4 bg-[var(--success)]/10 border border-[var(--success)]/30 text-[var(--success)] text-sm p-3 rounded-xl text-center font-semibold">
            🎉 Bu haftanın tüm hedeflerini tamamladın!
          </div>
        )}
      </div>

      {/* Daily Tips */}
      <div className="card p-4 mb-5">
        <h2 className="font-semibold mb-3">💡 Bugünün Önerileri</h2>
        <div className="flex flex-col gap-3">
          {[
            { icon: '📖', text: '20 dakika okuma yapın', points: '+15 puan' },
            { icon: '🎯', text: '1 quiz tamamlayın', points: '+30 puan' },
            { icon: '🃏', text: '5 flashcard çalışın', points: '+10 puan' },
          ].map((tip) => (
            <div key={tip.text} className="flex items-center gap-3">
              <span className="text-2xl">{tip.icon}</span>
              <span className="flex-1 text-sm">{tip.text}</span>
              <span className="text-xs text-[var(--accent)] font-bold">{tip.points}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Settings Form */}
      <div className="card p-5">
        <h2 className="font-semibold mb-4">⚙️ Hedef Ayarları</h2>
        <form action={updateStudyPlan} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-muted)]">
              Haftalık Okuma Hedefi (Dakika)
            </label>
            <input
              name="weeklyGoalMinutes"
              type="number"
              min={10}
              max={1000}
              defaultValue={goalMinutes}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-muted)]">
              Haftalık Quiz Hedefi
            </label>
            <input
              name="weeklyGoalQuizzes"
              type="number"
              min={1}
              max={50}
              defaultValue={goalQuizzes}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-muted)]">
              🔔 Hatırlatma Saati
            </label>
            <input
              name="notifyTime"
              type="time"
              defaultValue={plan?.notifyTime ?? '09:00'}
              className="input"
            />
          </div>
          <button type="submit" className="btn-primary">
            Hedefleri Kaydet
          </button>
        </form>
      </div>
    </div>
  )
}
