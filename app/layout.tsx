import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Umami from '@/components/Umami'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PapiFutbol - Torneo de Fútbol 5',
  description: 'Sistema de gestión de torneo de fútbol 5 con sistema de vidas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Umami />
      </body>
    </html>
  )
}

