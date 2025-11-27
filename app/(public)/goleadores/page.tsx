'use client'

import { useGoleadores } from '@/lib/api/goleadores'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function GoleadoresPage() {
  const { data: goleadores, isLoading } = useGoleadores()

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Cargando goleadores...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Tabla de Goleadores</h1>
        <p className="text-muted-foreground">
          Ranking de jugadores por cantidad de goles
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Goleadores</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pos</TableHead>
                <TableHead>Jugador</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Goles</TableHead>
                <TableHead>Penales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goleadores && goleadores.length > 0 ? (
                goleadores.map((goleador, index) => (
                  <TableRow key={goleador.jugador.id}>
                    <TableCell className="font-bold">{index + 1}</TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {goleador.jugador.nombre} {goleador.jugador.apellido}
                        {goleador.jugador.numero && (
                          <Badge variant="outline" className="ml-2">
                            {goleador.jugador.numero}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {goleador.jugador.equipo?.nombre || 'Sin equipo'}
                    </TableCell>
                    <TableCell className="font-bold text-lg">
                      {goleador.totalGoles}
                    </TableCell>
                    <TableCell>
                      {goleador.penales > 0 && (
                        <Badge variant="secondary">{goleador.penales}</Badge>
                      )}
                      {goleador.penales === 0 && '-'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No hay goleadores registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

