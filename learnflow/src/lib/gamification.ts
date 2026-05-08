import { prisma } from './prisma'
import { getLevelFromPoints } from './utils'

export const POINTS = {
  UPLOAD_CONTENT: 20,
  VIEW_CONTENT: 2,
  COMPLETE_QUIZ: 30,
  PERFECT_QUIZ: 50,
  DAILY_LOGIN: 10,
  STREAK_BONUS: 5,
  STUDY_15MIN: 15,
  FAVORITE_CONTENT: 3,
}

export const BADGES = [
  { name: 'İlk Adım', description: 'İlk içeriğini yükle', icon: '🚀', pointsRequired: 0 },
  { name: 'Quiz Ustası', description: 'İlk quizi tamamla', icon: '🎯', pointsRequired: 0 },
  { name: 'Azimli Öğrenci', description: '100 puan kazan', icon: '⭐', pointsRequired: 100 },
  { name: 'Bilgi Avcısı', description: '300 puan kazan', icon: '🏹', pointsRequired: 300 },
  { name: 'Bilge', description: '600 puan kazan', icon: '📚', pointsRequired: 600 },
  { name: 'Uzman', description: '1000 puan kazan', icon: '🎓', pointsRequired: 1000 },
  { name: 'Efsane', description: '2500 puan kazan', icon: '👑', pointsRequired: 2500 },
  { name: 'Seri Öğrenci', description: '7 gün streak yap', icon: '🔥', pointsRequired: 0 },
]

export async function seedBadges() {
  for (const badge of BADGES) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: {},
      create: badge,
    })
  }
}

export async function addPoints(
  userId: string,
  amount: number,
  type: string
): Promise<{ newTotal: number; newLevel: number; newBadges: string[] }> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')

  const newTotal = user.points + amount
  const newLevel = getLevelFromPoints(newTotal)

  await prisma.user.update({
    where: { id: userId },
    data: { points: newTotal, level: newLevel },
  })

  const today = new Date().toISOString().split('T')[0]
  await prisma.dailyLog.upsert({
    where: { userId_date: { userId, date: today } },
    update: { pointsEarned: { increment: amount } },
    create: { userId, date: today, pointsEarned: amount },
  })

  const newBadges = await checkAndAwardBadges(userId, newTotal)
  return { newTotal, newLevel, newBadges }
}

export async function checkAndAwardBadges(userId: string, points: number): Promise<string[]> {
  const allBadges = await prisma.badge.findMany()
  const userBadges = await prisma.userBadge.findMany({ where: { userId } })
  const earned = new Set(userBadges.map((ub) => ub.badgeId))

  const newBadges: string[] = []
  for (const badge of allBadges) {
    if (!earned.has(badge.id) && points >= badge.pointsRequired) {
      await prisma.userBadge.create({ data: { userId, badgeId: badge.id } })
      newBadges.push(badge.name)
    }
  }

  return newBadges
}

export async function recordDailyLogin(userId: string): Promise<{ bonus: boolean; streak: number }> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { bonus: false, streak: 0 }

  const today = new Date().toISOString().split('T')[0]
  if (user.lastLoginDate === today) return { bonus: false, streak: user.streak }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const newStreak = user.lastLoginDate === yesterdayStr ? user.streak + 1 : 1
  const bonusPoints = POINTS.DAILY_LOGIN + (newStreak >= 7 ? POINTS.STREAK_BONUS * Math.floor(newStreak / 7) : 0)

  await prisma.user.update({
    where: { id: userId },
    data: { lastLoginDate: today, streak: newStreak },
  })

  await addPoints(userId, bonusPoints, 'daily_login')

  await prisma.dailyLog.upsert({
    where: { userId_date: { userId, date: today } },
    update: { loginBonus: true },
    create: { userId, date: today, loginBonus: true, pointsEarned: bonusPoints },
  })

  return { bonus: true, streak: newStreak }
}
