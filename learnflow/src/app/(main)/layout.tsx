import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import BottomNav from '@/components/BottomNav'
import TopBar from '@/components/TopBar'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto">
      <TopBar user={session} />
      <main className="flex-1 overflow-y-auto pb-24 pt-16">{children}</main>
      <BottomNav />
    </div>
  )
}
