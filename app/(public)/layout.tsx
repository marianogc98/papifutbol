import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PublicidadBanner } from '@/components/public/PublicidadBanner'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <PublicidadBanner posicion="header" className="w-full border-b" />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <PublicidadBanner posicion="footer" className="w-full border-t py-4" />
      <Footer />
    </div>
  )
}

