'use client'

import { useFechas } from '@/lib/api/fechas'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader } from '@/components/ui/loader'

export function TablaFechas() {
  const { data: fechas, isLoading, error } = useFechas()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-destructive">Error al cargar las fechas</p>
      </div>
    )
  }

  if (!fechas || fechas.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">No hay fechas disponibles</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fixture #</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Partidos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fechas.map((fecha) => (
            <TableRow key={fecha.id}>
              <TableCell className="font-medium">{fecha.numero}</TableCell>
              <TableCell>{fecha.nombre || '-'}</TableCell>
              <TableCell>
                {new Date(fecha.fecha).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell>
                {fecha._count?.partidos || 0} partido
                {(fecha._count?.partidos || 0) !== 1 ? 's' : ''}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

