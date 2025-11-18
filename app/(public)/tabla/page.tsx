'use client'

import { useTabla } from '@/lib/api/tabla'
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
import Link from 'next/link'

export default function TablaPage() {
  const { data: tabla, isLoading } = useTabla()

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
        <div className="text-center">Cargando tabla...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Tabla de Vidas</h1>
        <p className="text-muted-foreground">
          Clasificación del torneo ordenada por vidas restantes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Posiciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pos</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Vidas</TableHead>
                <TableHead>PJ</TableHead>
                <TableHead>V</TableHead>
                <TableHead>E</TableHead>
                <TableHead>D</TableHead>
                <TableHead>GF</TableHead>
                <TableHead>GC</TableHead>
                <TableHead>DG</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tabla && tabla.length > 0 ? (
                tabla.map((equipo, index) => (
                  <TableRow key={equipo.id}>
                    <TableCell className="font-bold">{index + 1}</TableCell>
                    <TableCell>
                      <Link
                        href={`/equipo/${equipo.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {equipo.nombre}
                      </Link>
                    </TableCell>
                    <TableCell className="font-bold text-lg">
                      {equipo.vidas}
                    </TableCell>
                    <TableCell>{equipo.partidosJugados}</TableCell>
                    <TableCell>{equipo.victorias}</TableCell>
                    <TableCell>{equipo.empates}</TableCell>
                    <TableCell>{equipo.derrotas}</TableCell>
                    <TableCell>{equipo.golesAFavor}</TableCell>
                    <TableCell>{equipo.golesEnContra}</TableCell>
                    <TableCell className={equipo.diferencia >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {equipo.diferencia > 0 ? '+' : ''}{equipo.diferencia}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getEstadoBadge(equipo.estado)}>
                        {equipo.estado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="text-center">
                    No hay equipos en la tabla
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

