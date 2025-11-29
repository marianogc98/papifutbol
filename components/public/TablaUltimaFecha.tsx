'use client'

import { useFechas } from '@/lib/api/fechas'
import { usePartidos } from '@/lib/api/partidos'
import { useMemo } from 'react'
import { TablaResultados } from '@/components/public/TablaResultados'

export function TablaUltimaFecha() {
  const { data: fechas, isLoading: fechasLoading } = useFechas()
  // Obtener todos los partidos (no solo los jugados) para mostrar también los que están "jugando"
  const { data: todosPartidos, isLoading: partidosLoading } = usePartidos()

  // Encontrar la última fecha con partidos (jugados o jugando)
  const ultimaFechaConPartidos = useMemo(() => {
    if (!fechas || !todosPartidos || todosPartidos.length === 0) return null

    // Ordenar fechas por número descendente (más reciente primero)
    const fechasOrdenadas = [...fechas].sort((a, b) => b.numero - a.numero)

    // Buscar la primera fecha que tenga partidos (jugados, jugando o pendientes)
    for (const fecha of fechasOrdenadas) {
      const partidosDeFecha = todosPartidos.filter(p => p.fechaId === fecha.id)
      if (partidosDeFecha.length > 0) {
        // Ordenar partidos por fechaHora (del más temprano al más tarde)
        const partidosOrdenados = [...partidosDeFecha].sort((a, b) => {
          // Si ambos tienen fechaHora, comparar por fechaHora
          if (a.fechaHora && b.fechaHora) {
            return new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
          }
          // Si solo uno tiene fechaHora, el que tiene fechaHora va primero
          if (a.fechaHora && !b.fechaHora) return -1
          if (!a.fechaHora && b.fechaHora) return 1
          // Si ninguno tiene fechaHora, mantener orden original
          return 0
        })
        return { fecha, partidos: partidosOrdenados }
      }
    }

    return null
  }, [fechas, todosPartidos])

  if (fechasLoading || partidosLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">Cargando partidos de la última fecha...</p>
      </div>
    )
  }

  if (!ultimaFechaConPartidos) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">No hay fechas con partidos cargados</p>
      </div>
    )
  }

  const { fecha: ultimaFecha, partidos } = ultimaFechaConPartidos

  return (
    <TablaResultados
      partidos={partidos}
      titulo={`Fecha ${ultimaFecha.numero}${ultimaFecha.nombre ? ` - ${ultimaFecha.nombre}` : ''}`}
      emptyMessage="No hay partidos para esta fecha"
    />
  )
}
