import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LearnFlow — AI Destekli Öğrenme',
  description:
    'Kendi notlarınızı yükleyin, AI ile özetler ve quizler oluşturun. Sosyal medya alışkanlığını öğrenmeye dönüştürün.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0f0f14',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="h-full">
      <body className={`${inter.className} min-h-full`}>{children}</body>
    </html>
  )
}
