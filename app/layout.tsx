import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import Umami from '@/components/Umami'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Papi Fútbol - Torneo 2025',
  description: 'Torneo de Papi Fútbol temporada 2025.',
  icons: {
    icon: '/images/favicon.ico',
  },
  openGraph: {
    title: 'Papi Fútbol - Torneo 2025',
    description: 'Torneo de Papi Fútbol temporada 2025.',
    type: 'website',
    locale: 'es_AR',
    siteName: 'Papi Fútbol',
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'Papi Fútbol - Torneo 2025',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Papi Fútbol - Torneo 2025',
    description: 'Torneo de Papi Fútbol temporada 2025.',
    images: ['/images/logo.png'],
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

