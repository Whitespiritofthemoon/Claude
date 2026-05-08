'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { addPoints, POINTS } from '@/lib/gamification'

export async function toggleFavorite(contentId: string): Promise<void> {
  const session = await getSession()
  if (!session) return

  const content = await prisma.content.findFirst({
    where: { id: contentId, userId: session.id },
  })
  if (!content) return

  await prisma.content.update({
    where: { id: contentId },
    data: { isFavorite: !content.isFavorite },
  })

  if (!content.isFavorite) {
    await addPoints(session.id, POINTS.FAVORITE_CONTENT, 'favorite')
  }

  revalidatePath('/feed')
  revalidatePath('/search')
}

export async function incrementViewCount(contentId: string): Promise<void> {
  await prisma.content.update({
    where: { id: contentId },
    data: { viewCount: { increment: 1 } },
  })

  const session = await getSession()
  if (session) {
    await addPoints(session.id, POINTS.VIEW_CONTENT, 'view')
  }
}

export async function deleteContent(contentId: string): Promise<void> {
  const session = await getSession()
  if (!session) return

  await prisma.content.delete({
    where: { id: contentId, userId: session.id },
  })

  revalidatePath('/feed')
  revalidatePath('/profile')
}

export async function submitQuizAttempt(
  contentId: string,
  answers: number[],
  score: number
): Promise<{ pointsEarned: number; newBadges: string[] }> {
  const session = await getSession()
  if (!session) return { pointsEarned: 0, newBadges: [] }

  const questions = await prisma.quizQuestion.findMany({ where: { contentId } })
  const total = questions.length

  let points = POINTS.COMPLETE_QUIZ
  if (score === total) points = POINTS.PERFECT_QUIZ

  await prisma.quizAttempt.create({
    data: {
      userId: session.id,
      contentId,
      score,
      totalQuestions: total,
      answers: JSON.stringify(answers),
      pointsEarned: points,
    },
  })

  const today = new Date().toISOString().split('T')[0]
  await prisma.dailyLog.upsert({
    where: { userId_date: { userId: session.id, date: today } },
    update: { quizzesDone: { increment: 1 } },
    create: { userId: session.id, date: today, quizzesDone: 1 },
  })

  const { newBadges } = await addPoints(session.id, points, 'quiz')
  return { pointsEarned: points, newBadges }
}

export async function updateStudyPlan(formData: FormData): Promise<void> {
  const session = await getSession()
  if (!session) return

  const weeklyGoalMinutes = parseInt(formData.get('weeklyGoalMinutes') as string) || 140
  const weeklyGoalQuizzes = parseInt(formData.get('weeklyGoalQuizzes') as string) || 3
  const notifyTime = (formData.get('notifyTime') as string) || '09:00'

  await prisma.studyPlan.upsert({
    where: { userId: session.id },
    update: { weeklyGoalMinutes, weeklyGoalQuizzes, notifyTime },
    create: { userId: session.id, weeklyGoalMinutes, weeklyGoalQuizzes, notifyTime },
  })

  revalidatePath('/plan')
}
