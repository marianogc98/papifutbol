'use client'

import { useTabla } from '@/lib/api/tabla'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export function TablaPosiciones() {
  const { data: tabla, isLoading, error } = useTabla()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">Cargando tabla de posiciones...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-destructive">Error al cargar la tabla de posiciones</p>
      </div>
    )
  }

  if (!tabla || tabla.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">No hay equipos en la tabla</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">Pos</TableHead>
            <TableHead>Equipo</TableHead>
            <TableHead className="text-center">Vidas</TableHead>
            <TableHead className="text-center">PJ</TableHead>
            <TableHead className="text-center">G</TableHead>
            <TableHead className="text-center">E</TableHead>
            <TableHead className="text-center">P</TableHead>
            <TableHead className="text-center">GF</TableHead>
            <TableHead className="text-center">GC</TableHead>
            <TableHead className="text-center">DG</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tabla.map((equipo, index) => (
            <TableRow key={equipo.id}>
              <TableCell className="text-center font-bold">
                {index + 1}
              </TableCell>
              <TableCell>
                <Link
                  href={`/equipo/${equipo.id}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  {equipo.escudo && (
                    <img
                      src={equipo.escudo}
                      alt={equipo.nombre}
                      className="w-8 h-8 object-contain"
                    />
                  )}
                  <span className="font-medium">{equipo.nombre}</span>
                </Link>
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  variant={equipo.vidas === 0 ? 'destructive' : 'default'}
                  className="font-bold"
                >
                  {equipo.vidas}
                </Badge>
              </TableCell>
              <TableCell className="text-center">{equipo.partidosJugados}</TableCell>
              <TableCell className="text-center font-medium text-green-600">
                {equipo.victorias}
              </TableCell>
              <TableCell className="text-center">{equipo.empates}</TableCell>
              <TableCell className="text-center font-medium text-red-600">
                {equipo.derrotas}
              </TableCell>
              <TableCell className="text-center">{equipo.golesAFavor}</TableCell>
              <TableCell className="text-center">{equipo.golesEnContra}</TableCell>
              <TableCell className={`text-center font-medium ${
                equipo.diferencia > 0 ? 'text-green-600' : 
                equipo.diferencia < 0 ? 'text-red-600' : 
                'text-muted-foreground'
              }`}>
                {equipo.diferencia > 0 ? '+' : ''}{equipo.diferencia}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}








