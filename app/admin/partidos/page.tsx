'use client'

import { useState, useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { usePartidos, useDeletePartido, Partido } from '@/lib/api/partidos'
import { PartidoForm } from '@/components/admin/PartidoForm'
import { useFechas } from '@/lib/api/fechas'
import { formatDateTimeUTC, formatDateUTC, normalizarFechaHoraParaOrdenamiento } from '@/lib/utils/date'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Pencil, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import { Loader } from '@/components/ui/loader'

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
      no_se_presento_local: 'No se presentó Local',
      no_se_presento_visitante: 'No se presentó Visitante',
    }
    return labels[estado] || estado
  }

  // Ordenar partidos del más nuevo al más viejo
  const partidosOrdenados = useMemo(() => {
    if (!partidos) return []
    return [...partidos].sort((a, b) => {
      // Ordenar por fechaHora si existe, sino por createdAt
      // Normalizar fechas para que partidos después de medianoche se ordenen correctamente
      const fechaA = a.fechaHora 
        ? normalizarFechaHoraParaOrdenamiento(a.fechaHora, a.fecha?.fecha) 
        : new Date(a.createdAt).getTime()
      const fechaB = b.fechaHora 
        ? normalizarFechaHoraParaOrdenamiento(b.fechaHora, b.fecha?.fecha) 
        : new Date(b.createdAt).getTime()
      return fechaB - fechaA
    })
  }, [partidos])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Partidos</h2>
        {!showForm && (
          <Button 
            onClick={handleCreate}
            className="bg-[#852024] hover:bg-[#6a1a1d] text-white"
          >
            Nuevo Partido
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
                    {fechas?.map((fecha) => {
                      const fechaFormateada = formatDateUTC(fecha.fecha)
                      return (
                        <option key={fecha.id} value={fecha.id}>
                          {fecha.nombre || `Fecha ${fecha.numero}`} - {fechaFormateada}
                        </option>
                      )
                    })}
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
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="md:w-auto w-[60%]">Nombre</TableHead>
                    <TableHead className="md:w-auto w-[25%]">Fecha</TableHead>
                    <TableHead className="text-right md:w-auto w-[15%]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partidosOrdenados && partidosOrdenados.length > 0 ? (
                    partidosOrdenados.map((partido) => {
                      const fechaFormateada = partido.fechaHora 
                        ? formatDateUTC(partido.fechaHora)
                        : '-'
                      return (
                      <TableRow key={partido.id}>
                        <TableCell className="font-medium">
                          {partido.equipoLocal?.nombre || '-'} vs {partido.equipoVisitante?.nombre || '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className="md:hidden">{fechaFormateada}</span>
                          <span className="hidden md:inline">{partido.fechaHora ? formatDateUTC(partido.fechaHora) : '-'}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/resultados/${partido.id}`}>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                                title="Ver Resultado"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(partido)}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(partido.id)}
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        No hay partidos registrados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

