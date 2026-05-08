import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import QuizClient from '@/components/quiz/QuizClient'

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params
  const content = await prisma.content.findFirst({
    where: { id, userId: session.id },
    include: { questions: true },
  })

  if (!content || content.questions.length === 0) notFound()

  const questions = content.questions.map((q) => ({
    id: q.id,
    question: q.question,
    options: JSON.parse(q.options),
    correctIndex: q.correctIndex,
    explanation: q.explanation || '',
  }))

  return (
    <QuizClient
      contentId={content.id}
      contentTitle={content.title}
      questions={questions}
    />
  )
}
