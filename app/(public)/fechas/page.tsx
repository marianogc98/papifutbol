'use client'

import { useFechas } from '@/lib/api/fechas'
import { usePartidos } from '@/lib/api/partidos'
import { useEquipos } from '@/lib/api/equipos'
import { FechaCard } from '@/components/public/FechaCard'
import { Card, CardContent } from '@/components/ui/card'

export default function FechasPage() {
  const { data: fechas, isLoading: fechasLoading } = useFechas()
  const { data: partidos, isLoading: partidosLoading } = usePartidos()
  const { data: equipos, isLoading: equiposLoading } = useEquipos()

  if (fechasLoading || partidosLoading || equiposLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Cargando fechas...</div>
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
        <h1 className="text-3xl font-bold mb-2">Fechas del Torneo</h1>
        <p className="text-muted-foreground">
          Todos los partidos del torneo organizados por fecha
        </p>
      </div>

      <div className="space-y-6">
        {partidosPorFecha && partidosPorFecha.length > 0 ? (
          partidosPorFecha.map(({ fecha, partidos: fechaPartidos, equiposLibres }) => (
            <FechaCard
              key={fecha.id}
              fecha={fecha}
              partidos={fechaPartidos}
              equiposLibres={equiposLibres}
              showEquiposLibres={true}
            />
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

