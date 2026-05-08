import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { prisma } from './prisma'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret'
)

export interface SessionUser {
  id: string
  email: string
  name: string | null
  image: string | null
  points: number
  level: number
  streak: number
}

export async function createSession(userId: string): Promise<void> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(SECRET)

  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, SECRET)
    const userId = payload.userId as string
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        points: true,
        level: true,
        streak: true,
      },
    })
    return user
  } catch {
    return null
  }
}

export function getLevelInfo(points: number) {
  const levels = [
    { level: 1, name: 'Başlangıç', min: 0, max: 100 },
    { level: 2, name: 'Meraklı', min: 100, max: 300 },
    { level: 3, name: 'Öğrenci', min: 300, max: 600 },
    { level: 4, name: 'Azimli', min: 600, max: 1000 },
    { level: 5, name: 'Bilge', min: 1000, max: 1500 },
    { level: 6, name: 'Uzman', min: 1500, max: 2500 },
    { level: 7, name: 'Usta', min: 2500, max: 4000 },
    { level: 8, name: 'Efsane', min: 4000, max: Infinity },
  ]

  const current = levels.find((l) => points >= l.min && points < l.max) || levels[0]
  const next = levels.find((l) => l.level === current.level + 1)

  return {
    level: current.level,
    name: current.name,
    current: points - current.min,
    needed: next ? next.min - current.min : 0,
    nextLevel: next?.name || null,
  }
}
