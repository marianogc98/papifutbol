'use client'

import { useParams } from 'next/navigation'
import { useEquipo } from '@/lib/api/equipos'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function EquipoPage() {
  const params = useParams()
  const slugOrId = params.id as string
  const { data: equipo, isLoading } = useEquipo(slugOrId)

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      activo: 'default',
      eliminado: 'destructive',
      suspendido: 'secondary',
      descalificado: 'destructive',
    }
    return variants[estado] || 'outline'
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Cargando equipo...</div>
      </div>
    )
  }

  if (!equipo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Equipo no encontrado</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          {equipo.escudo && (
            <img
              src={equipo.escudo}
              alt={equipo.nombre}
              className="w-20 h-20 object-contain"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold">{equipo.nombre}</h1>
            <Badge variant={getEstadoBadge(equipo.estado)} className="mt-2">
              {equipo.estado}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vidas Restantes:</span>
              <span className="font-bold text-lg">{equipo.vidas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado:</span>
              <Badge variant={getEstadoBadge(equipo.estado)}>
                {equipo.estado}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Partidos Jugados:</span>
              <span className="font-medium">{equipo.estadisticas.partidosJugados}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Goles a Favor:</span>
              <span className="font-medium">{equipo.estadisticas.golesAFavor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Goles en Contra:</span>
              <span className="font-medium">{equipo.estadisticas.golesEnContra}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Diferencia:</span>
              <span className={`font-medium ${equipo.estadisticas.diferencia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {equipo.estadisticas.diferencia > 0 ? '+' : ''}{equipo.estadisticas.diferencia}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jugadores</CardTitle>
        </CardHeader>
        <CardContent>
          {equipo.jugadores && equipo.jugadores.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Apellido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {equipo.jugadores.map((jugador) => (
                  <TableRow key={jugador.id}>
                    <TableCell>
                      {jugador.numero || '-'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {jugador.nombre}
                    </TableCell>
                    <TableCell className="font-medium">
                      {jugador.apellido}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No hay jugadores registrados en este equipo
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

