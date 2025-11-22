'use client'

import { useFechas } from '@/lib/api/fechas'
import { usePartidos } from '@/lib/api/partidos'
import { useEquipos } from '@/lib/api/equipos'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default function FixturePage() {
  const { data: fechas, isLoading: fechasLoading } = useFechas()
  const { data: partidos, isLoading: partidosLoading } = usePartidos()
  const { data: equipos, isLoading: equiposLoading } = useEquipos()

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pendiente: 'outline',
      jugado: 'default',
      suspendido: 'secondary',
      cancelado: 'destructive',
      no_se_presento_local: 'destructive',
      no_se_presento_visitante: 'destructive',
    }
    return variants[estado] || 'outline'
  }

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      pendiente: 'Pendiente',
      jugado: 'Jugado',
      suspendido: 'Suspendido',
      cancelado: 'Cancelado',
      no_se_presento_local: 'W.O. (Local)',
      no_se_presento_visitante: 'W.O. (Visitante)',
    }
    return labels[estado] || estado
  }

  if (fechasLoading || partidosLoading || equiposLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Cargando fixture...</div>
      </div>
    )
  }

  // Agrupar partidos por fecha y calcular equipos con fecha libre
  // Ordenar fechas de la más nueva a la más antigua (por fecha real descendente)
  const fechasOrdenadas = fechas ? [...fechas].sort((a, b) => {
    // Ordenar por fecha descendente (más reciente primero)
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  }) : []
  
  const partidosPorFecha = fechasOrdenadas.map((fecha) => {
    const fechaPartidos = partidos?.filter((p) => p.fechaId === fecha.id) || []
    
    // Obtener equipos que tienen partido en esta fecha
    const equiposConPartido = new Set<string>()
    fechaPartidos.forEach((partido) => {
      if (partido.equipoLocal?.id) equiposConPartido.add(partido.equipoLocal.id)
      if (partido.equipoVisitante?.id) equiposConPartido.add(partido.equipoVisitante.id)
    })

    // Equipos activos que NO tienen partido (fecha libre)
    const equiposLibres = equipos?.filter(
      (equipo) => equipo.estado === 'activo' && !equiposConPartido.has(equipo.id)
    ) || []

    return {
      fecha,
      partidos: fechaPartidos,
      equiposLibres,
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Fixture Completo</h1>
        <p className="text-muted-foreground">
          Todos los partidos del torneo organizados por fecha
        </p>
      </div>

      <div className="space-y-6">
        {partidosPorFecha && partidosPorFecha.length > 0 ? (
          partidosPorFecha.map(({ fecha, partidos: fechaPartidos, equiposLibres }) => (
            <Card key={fecha.id}>
              <CardHeader>
                <CardTitle>
                  Fecha {fecha.numero}
                  {fecha.nombre && ` - ${fecha.nombre}`}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(fecha.fecha).toLocaleDateString('es-AR')}
                </p>
              </CardHeader>
              <CardContent>
                {fechaPartidos.length > 0 ? (
                  <div className="space-y-4">
                    {fechaPartidos.map((partido) => (
                      <div
                        key={partido.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1 flex items-center gap-4">
                          <div className="flex-1 text-right">
                            <Link
                              href={`/equipo/${partido.equipoLocal?.slug || partido.equipoLocal?.id}`}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {partido.equipoLocal?.nombre || '-'}
                            </Link>
                          </div>
                          <div className="text-center min-w-[100px]">
                            {partido.estado === 'jugado' ||
                            partido.estado === 'no_se_presento_local' ||
                            partido.estado === 'no_se_presento_visitante' ? (
                              <span className="text-2xl font-bold">
                                {partido.golesLocal} - {partido.golesVisitante}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">vs</span>
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <Link
                              href={`/equipo/${partido.equipoVisitante?.slug || partido.equipoVisitante?.id}`}
                              className="font-medium hover:text-primary transition-colors"
                            >
                              {partido.equipoVisitante?.nombre || '-'}
                            </Link>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Badge variant={getEstadoBadge(partido.estado)}>
                            {getEstadoLabel(partido.estado)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No hay partidos programados para esta fecha
                  </p>
                )}
                
                {/* Mostrar equipos con fecha libre */}
                {equiposLibres && equiposLibres.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm font-medium mb-3 text-muted-foreground">
                      Equipos con Fecha Libre (Descanso):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {equiposLibres.map((equipo) => (
                        <Badge key={equipo.id} variant="outline" className="text-sm">
                          {equipo.nombre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No hay fechas registradas
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

