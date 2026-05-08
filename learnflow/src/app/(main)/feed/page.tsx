import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import FeedClient from '@/components/feed/FeedClient'

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')
  const { sort = 'recent' } = await searchParams

  const orderBy =
    sort === 'popular'
      ? { viewCount: 'desc' as const }
      : sort === 'favorites'
      ? { isFavorite: 'desc' as const }
      : { createdAt: 'desc' as const }

  const contents = await prisma.content.findMany({
    where: { userId: session!.id },
    orderBy,
    include: { questions: { select: { id: true } } },
  })

  const serialized = contents.map((c) => ({
    id: c.id,
    title: c.title,
    summary: c.summary || '',
    keyPoints: c.keyPoints ? JSON.parse(c.keyPoints) : [],
    tags: c.tags ? JSON.parse(c.tags) : [],
    viewCount: c.viewCount,
    isFavorite: c.isFavorite,
    questionCount: c.questions.length,
    coverImage: c.coverImage,
    createdAt: c.createdAt.toISOString(),
  }))

  return <FeedClient contents={serialized} currentSort={sort} />
}
