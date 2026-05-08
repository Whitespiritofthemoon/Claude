'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { registerAction } from '@/actions/auth'

export default function RegisterPage() {
  const [state, action, pending] = useActionState(registerAction, {})

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">📚</div>
          <h1 className="text-2xl font-bold">
            <span className="gradient-text">LearnFlow</span>
          </h1>
          <p className="text-[var(--text-muted)] mt-2">Hesap oluştur, öğrenmeye başla</p>
        </div>

        <form action={action} className="card p-6 flex flex-col gap-4">
          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-lg">
              {state.error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-muted)]">Ad Soyad</label>
            <input name="name" type="text" className="input" placeholder="Adın Soyadın" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-muted)]">E-posta</label>
            <input name="email" type="email" className="input" placeholder="ornek@email.com" required />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--text-muted)]">Şifre</label>
            <input name="password" type="password" className="input" placeholder="En az 6 karakter" required />
          </div>

          <button type="submit" disabled={pending} className="btn-primary mt-2">
            {pending ? 'Hesap oluşturuluyor...' : 'Kayıt Ol'}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--text-muted)] mt-4">
          Zaten hesabın var mı?{' '}
          <Link href="/login" className="text-[var(--primary)] font-medium hover:underline">
            Giriş yap
          </Link>
        </p>
      </div>
    </div>
  )
}
