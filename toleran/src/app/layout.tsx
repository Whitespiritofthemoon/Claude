import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Toleran — Kişisel Beslenme Karar Desteği',
  description:
    'Gıda intoleransı, alerjisi veya çölyak hastalığınıza göre kişiselleştirilmiş beslenme karar desteği.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Toleran',
  },
  openGraph: {
    title: 'Toleran',
    description: 'Kişisel beslenme karar destek uygulaması',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#5B8A7A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-toleran-bg">
        <div className="app-container">{children}</div>
      </body>
    </html>
  )
}
