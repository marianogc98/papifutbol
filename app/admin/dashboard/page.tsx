'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminDashboard() {
  const { data: session } = useSession()
  const isSuperAdmin = session?.user?.role === 'super_admin'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Equipos</CardTitle>
          <CardDescription>Gestionar equipos del torneo</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin/equipos" className="text-primary hover:underline">
            Ver equipos →
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Jugadores</CardTitle>
          <CardDescription>Gestionar jugadores</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin/jugadores" className="text-primary hover:underline">
            Ver jugadores →
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fixture</CardTitle>
          <CardDescription>Gestionar fixture del torneo</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin/fixture" className="text-primary hover:underline">
            Ver fixture →
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Partidos</CardTitle>
          <CardDescription>Gestionar partidos y resultados</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin/partidos" className="text-primary hover:underline">
            Ver partidos →
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resultados</CardTitle>
          <CardDescription>Cargar resultados de partidos</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin/resultados" className="text-primary hover:underline">
            Cargar resultados →
          </Link>
        </CardContent>
      </Card>

      {isSuperAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Publicidades</CardTitle>
            <CardDescription>Gestionar publicidades del sitio</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/publicidades" className="text-primary hover:underline">
              Ver publicidades →
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

