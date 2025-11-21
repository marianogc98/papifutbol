import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { Navbar } from '@/components/layout/Navbar'
import { AdminNav } from '@/components/admin/AdminNav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/papifutbol/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground">
            Bienvenido, {session.user.name}
          </p>
        </div>
        <AdminNav />
        {children}
      </div>
    </div>
  )
}

