'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { usePartidos, useDeletePartido, Partido } from '@/lib/api/partidos'
import { PartidoForm } from '@/components/admin/PartidoForm'
import { useFechas } from '@/lib/api/fechas'
import { formatDateTimeUTC } from '@/lib/utils/date'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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

export default function PartidosPage() {
  const pathname = usePathname()
  const [showForm, setShowForm] = useState(false)
  const [editingPartido, setEditingPartido] = useState<Partido | undefined>()
  const [selectedFechaId, setSelectedFechaId] = useState<string>('')
  const { data: partidos, isLoading } = usePartidos()
  const { data: fechas } = useFechas()
  const deletePartido = useDeletePartido()

  // Cerrar formulario cuando se hace click en el link de navegación
  useEffect(() => {
    const handleNavClick = (e: CustomEvent) => {
      if (e.detail.href === '/admin/partidos') {
        setShowForm(false)
        setEditingPartido(undefined)
      }
    }

    window.addEventListener('admin-nav-click', handleNavClick as EventListener)

    return () => {
      window.removeEventListener('admin-nav-click', handleNavClick as EventListener)
    }
  }, [])

  const handleEdit = (partido: Partido) => {
    setEditingPartido(partido)
    setSelectedFechaId('')
    setShowForm(true)
  }

  const handleCreate = () => {
    setEditingPartido(undefined)
    setSelectedFechaId('')
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este partido?')) return

    try {
      await deletePartido.mutateAsync(id)
    } catch (error: any) {
      alert(error.message || 'Error al eliminar partido')
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingPartido(undefined)
    setSelectedFechaId('')
  }

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pendiente: 'outline',
      jugando: 'default',
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
      jugando: '🟢',
      jugado: 'Jugado',
      suspendido: 'Suspendido',
      cancelado: 'Cancelado',
      no_se_presento_local: 'W.O. (Local)',
      no_se_presento_visitante: 'W.O. (Visitante)',
    }
    return labels[estado] || estado
  }

  if (isLoading) {
    return <div>Cargando partidos...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Partidos</h2>
        {!showForm && (
          <Button onClick={handleCreate}>
            Crear Nuevo Partido
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPartido ? 'Editar Partido' : 'Nuevo Partido'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!editingPartido && !selectedFechaId ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="selectFecha">Selecciona la Fecha *</Label>
                  <select
                    id="selectFecha"
                    value={selectedFechaId}
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedFechaId(e.target.value)
                      }
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Seleccionar fecha</option>
                    {fechas?.map((fecha) => (
                      <option key={fecha.id} value={fecha.id}>
                        Fecha {fecha.numero} {fecha.nombre ? `- ${fecha.nombre}` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-muted-foreground">
                    Selecciona una fecha para continuar con la creación del partido.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setSelectedFechaId('')
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <PartidoForm
                partido={editingPartido}
                fechaId={selectedFechaId || editingPartido?.fechaId}
                onSuccess={handleFormSuccess}
              />
            )}
          </CardContent>
        </Card>
      )}

      {!showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Partidos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Visitante</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partidos && partidos.length > 0 ? (
                  partidos.map((partido) => (
                    <TableRow key={partido.id}>
                      <TableCell>
                        {partido.fecha ? (
                          <Link 
                            href={`/admin/fechas/${partido.fecha.id}`}
                            className="text-primary hover:underline"
                          >
                            Fecha {partido.fecha.numero}
                          </Link>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {partido.fechaHora ? formatDateTimeUTC(partido.fechaHora) : '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {partido.equipoLocal?.nombre || '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {partido.equipoVisitante?.nombre || '-'}
                      </TableCell>
                      <TableCell>
                        {partido.estado === 'jugando' ||
                        partido.estado === 'jugado' ||
                        partido.estado === 'no_se_presento_local' ||
                        partido.estado === 'no_se_presento_visitante'
                          ? `${partido.golesLocal} - ${partido.golesVisitante}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getEstadoBadge(partido.estado)}>
                          {getEstadoLabel(partido.estado)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/resultados/${partido.id}`}>
                            <Button variant="outline" size="sm">
                              Resultado
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(partido)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(partido.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No hay partidos registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

