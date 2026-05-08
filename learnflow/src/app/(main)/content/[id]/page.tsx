import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { incrementViewCount } from '@/actions/content'
import FlashcardDeck from '@/components/FlashcardDeck'

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params
  const content = await prisma.content.findFirst({
    where: { id, userId: session.id },
    include: { questions: true },
  })

  if (!content) notFound()

  await incrementViewCount(id)

  const keyPoints = content.keyPoints ? JSON.parse(content.keyPoints) : []
  const flashcards = content.flashcards ? JSON.parse(content.flashcards) : []
  const tags = content.tags ? JSON.parse(content.tags) : []

  return (
    <div className="px-4 py-6 animate-fade-in">
      <div className="mb-6">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((tag: string) => (
            <span key={tag} className="badge-pill text-xs">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-2xl font-bold leading-tight mb-2">{content.title}</h1>
        <p className="text-xs text-[var(--text-muted)]">
          {new Date(content.createdAt).toLocaleDateString('tr-TR')} • {content.viewCount} görüntülenme
        </p>
      </div>

      {/* Summary */}
      <section className="card p-4 mb-4">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <span>📋</span> Özet
        </h2>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
          {content.summary}
        </p>
      </section>

      {/* Key Points */}
      {keyPoints.length > 0 && (
        <section className="card p-4 mb-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <span>💡</span> Önemli Kavramlar
          </h2>
          <ul className="flex flex-col gap-2">
            {keyPoints.map((point: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--text-muted)]">
                <span className="w-5 h-5 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {point}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Flashcards */}
      {flashcards.length > 0 && (
        <section className="mb-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2 px-1">
            <span>🃏</span> Flashcard'lar
          </h2>
          <FlashcardDeck flashcards={flashcards} />
        </section>
      )}

      {/* Quiz CTA */}
      {content.questions.length > 0 && (
        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold">{content.questions.length} Soruluk Quiz</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Bilgini test et, puan kazan</p>
          </div>
          <Link href={`/quiz/${content.id}`} className="btn-primary">
            Quiz Başlat 🎯
          </Link>
        </div>
      )}
    </div>
  )
}
