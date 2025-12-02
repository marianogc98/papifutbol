import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Umami from '@/components/Umami'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Papi Fútbol - Torneo 2025',
  description: 'Sistema de gestión de torneo de fútbol 5 con sistema de vidas',
  icons: {
    icon: '/images/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <body className={inter.className} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', overflowX: 'hidden' }}>
        <Providers>{children}</Providers>
        <Umami />
      </body>
    </html>
  )
}

