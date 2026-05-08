import Link from 'next/link'

export default function EmptyFeed() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="text-6xl mb-4">📂</div>
      <h2 className="text-xl font-bold mb-2">Henüz içerik yok</h2>
      <p className="text-[var(--text-muted)] text-sm mb-6 max-w-xs">
        İlk notunu veya PDF&apos;ini yükle, AI otomatik özet ve quiz oluştursun!
      </p>
      <Link href="/upload" className="btn-primary">
        İlk İçeriği Yükle
      </Link>
    </div>
  )
}
