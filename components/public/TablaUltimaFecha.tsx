'use client'

import { useFechas } from '@/lib/api/fechas'
import { usePartidos } from '@/lib/api/partidos'
import { useMemo } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function TablaUltimaFecha() {
  const { data: fechas, isLoading: fechasLoading } = useFechas()
  const { data: todosPartidos, isLoading: partidosLoading } = usePartidos(undefined, 'jugado')

  // Encontrar la última fecha con partidos jugados
  const ultimaFechaConResultados = useMemo(() => {
    if (!fechas || !todosPartidos || todosPartidos.length === 0) return null

    // Ordenar fechas por número descendente (más reciente primero)
    const fechasOrdenadas = [...fechas].sort((a, b) => b.numero - a.numero)

    // Buscar la primera fecha que tenga partidos jugados
    for (const fecha of fechasOrdenadas) {
      const partidosDeFecha = todosPartidos.filter(p => p.fechaId === fecha.id)
      if (partidosDeFecha.length > 0) {
        return { fecha, partidos: partidosDeFecha }
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

  if (!ultimaFechaConResultados) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">No hay fechas con resultados cargados</p>
      </div>
    )
  }

  const { fecha: ultimaFecha, partidos } = ultimaFechaConResultados

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">
          Fecha {ultimaFecha.numero}
          {ultimaFecha.nombre && ` - ${ultimaFecha.nombre}`}
        </h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Local</TableHead>
            <TableHead className="text-center">Resultado</TableHead>
            <TableHead className="text-right">Visitante</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {partidos.map((partido) => (
            <TableRow key={partido.id}>
              <TableCell>
                <Link
                  href={`/equipo/${partido.equipoLocal?.id}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  {partido.equipoLocal?.escudo && (
                    <img
                      src={partido.equipoLocal.escudo}
                      alt={partido.equipoLocal.nombre}
                      className="w-8 h-8 object-contain"
                    />
                  )}
                  <span className="font-medium">{partido.equipoLocal?.nombre}</span>
                </Link>
              </TableCell>
              <TableCell className="text-center font-bold text-lg">
                {partido.golesLocal} - {partido.golesVisitante}
              </TableCell>
              <TableCell className="text-right">
                <Link
                  href={`/equipo/${partido.equipoVisitante?.id}`}
                  className="flex items-center gap-2 justify-end hover:underline"
                >
                  <span className="font-medium">{partido.equipoVisitante?.nombre}</span>
                  {partido.equipoVisitante?.escudo && (
                    <img
                      src={partido.equipoVisitante.escudo}
                      alt={partido.equipoVisitante.nombre}
                      className="w-8 h-8 object-contain"
                    />
                  )}
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

