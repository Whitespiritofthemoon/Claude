import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SearchClient from '@/components/SearchClient'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { q = '', filter = 'all' } = await searchParams

  const whereBase = { userId: session.id }
  const where =
    q.length > 0
      ? {
          ...whereBase,
          OR: [
            { title: { contains: q } },
            { summary: { contains: q } },
            { tags: { contains: q } },
          ],
        }
      : whereBase

  const filterWhere =
    filter === 'favorites'
      ? { ...where, isFavorite: true }
      : filter === 'popular'
      ? where
      : where

  const orderBy =
    filter === 'popular'
      ? { viewCount: 'desc' as const }
      : filter === 'recent'
      ? { createdAt: 'desc' as const }
      : { createdAt: 'desc' as const }

  const contents = await prisma.content.findMany({
    where: filterWhere,
    orderBy,
    take: 50,
    include: { questions: { select: { id: true } } },
  })

  const serialized = contents.map((c) => ({
    id: c.id,
    title: c.title,
    summary: c.summary || '',
    tags: c.tags ? JSON.parse(c.tags) : [],
    viewCount: c.viewCount,
    isFavorite: c.isFavorite,
    questionCount: c.questions.length,
    createdAt: c.createdAt.toISOString(),
  }))

  return <SearchClient contents={serialized} initialQuery={q} initialFilter={filter} />
}
