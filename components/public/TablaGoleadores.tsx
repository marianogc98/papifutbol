'use client'

import { useGoleadores } from '@/lib/api/goleadores'
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

export function TablaGoleadores() {
  const { data: goleadores, isLoading, error } = useGoleadores()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">Cargando tabla de goleadores...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-destructive">Error al cargar la tabla de goleadores</p>
      </div>
    )
  }

  if (!goleadores || goleadores.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">No hay goleadores registrados</p>
      </div>
    )
  }

  // Ordenar por total de goles descendente
  const goleadoresOrdenados = [...goleadores].sort((a, b) => {
    if (b.totalGoles !== a.totalGoles) return b.totalGoles - a.totalGoles
    return b.penales - a.penales
  })

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">Pos</TableHead>
            <TableHead>Jugador</TableHead>
            <TableHead>Equipo</TableHead>
            <TableHead className="text-center">Goles</TableHead>
            <TableHead className="text-center">Penales</TableHead>
            <TableHead className="text-center">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {goleadoresOrdenados.map((goleador, index) => (
            <TableRow key={goleador.jugador.id}>
              <TableCell className="text-center font-bold">
                {index + 1}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {goleador.jugador.numero && (
                    <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                      {goleador.jugador.numero}
                    </Badge>
                  )}
                  <span className="font-medium">
                    {goleador.jugador.nombre} {goleador.jugador.apellido}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {goleador.jugador.equipo ? (
                  <Link
                    href={`/equipo/${goleador.jugador.equipo.id}`}
                    className="hover:underline"
                  >
                    {goleador.jugador.equipo.nombre}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">Sin equipo</span>
                )}
              </TableCell>
              <TableCell className="text-center font-medium">
                {goleador.totalGoles - goleador.penales}
              </TableCell>
              <TableCell className="text-center">
                {goleador.penales > 0 && (
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                    {goleador.penales}
                  </Badge>
                )}
                {goleador.penales === 0 && <span className="text-muted-foreground">0</span>}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="default" className="font-bold text-lg">
                  {goleador.totalGoles}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}








