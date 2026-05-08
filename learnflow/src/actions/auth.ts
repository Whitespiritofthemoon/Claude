'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { createSession, deleteSession } from '@/lib/auth'
import { seedBadges, recordDailyLogin } from '@/lib/gamification'

export type AuthState = {
  error?: string
  success?: boolean
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!name || !email || !password) return { error: 'Tüm alanları doldurun.' }
  if (password.length < 6) return { error: 'Şifre en az 6 karakter olmalıdır.' }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: 'Bu e-posta adresi zaten kayıtlı.' }

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
  })

  await seedBadges()
  await createSession(user.id)
  redirect('/feed')
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) return { error: 'E-posta ve şifreyi girin.' }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.password) return { error: 'E-posta veya şifre hatalı.' }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return { error: 'E-posta veya şifre hatalı.' }

  await createSession(user.id)
  await recordDailyLogin(user.id)
  redirect('/feed')
}

export async function logoutAction(): Promise<void> {
  await deleteSession()
  redirect('/login')
}
