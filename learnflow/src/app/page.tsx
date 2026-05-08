import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Link from 'next/link'

export default async function HomePage() {
  const session = await getSession()
  if (session) redirect('/feed')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-sm w-full text-center animate-fade-in">
        <div className="text-6xl mb-6">📚</div>
        <h1 className="text-4xl font-bold mb-3">
          <span className="gradient-text">LearnFlow</span>
        </h1>
        <p className="text-[var(--text-muted)] text-lg mb-8 leading-relaxed">
          Notlarını yükle, AI ile öğren. Sosyal medya alışkanlığını
          üretken bir öğrenme deneyimine dönüştür.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-10 text-sm">
          {[
            { icon: '🤖', text: 'AI Özetler' },
            { icon: '🎯', text: 'Akıllı Quizler' },
            { icon: '🏆', text: 'Gamification' },
            { icon: '📊', text: 'İstatistikler' },
          ].map((f) => (
            <div key={f.text} className="card p-4 flex items-center gap-3">
              <span className="text-2xl">{f.icon}</span>
              <span className="font-medium">{f.text}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/register" className="btn-primary w-full">
            Ücretsiz Başla
          </Link>
          <Link href="/login" className="btn-secondary w-full">
            Giriş Yap
          </Link>
        </div>
      </div>
    </div>
  )
}
