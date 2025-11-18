'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useFecha } from '@/lib/api/fechas'
import { usePartidos, useCreatePartido, useDeletePartido, Partido } from '@/lib/api/partidos'
import { useEquipos } from '@/lib/api/equipos'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { partidoSchema, PartidoFormData } from '@/lib/validations/partido'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'

export default function FechaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const fechaId = params.id as string
  const { data: fecha, isLoading } = useFecha(fechaId)
  const { data: partidos, isLoading: partidosLoading } = usePartidos(fechaId)
  const { data: equipos } = useEquipos('activo')
  const createPartido = useCreatePartido()
  const deletePartido = useDeletePartido()
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<PartidoFormData>({
    resolver: zodResolver(partidoSchema),
    defaultValues: {
      fechaId: fechaId,
      equipoLocalId: '',
      equipoVisitanteId: '',
      estado: 'pendiente',
    },
  })

  const equipoLocalId = watch('equipoLocalId')

  const onSubmit = async (data: PartidoFormData) => {
    setError('')
    try {
      await createPartido.mutateAsync({
        ...data,
        fechaId: fechaId,
      })
      reset({
        fechaId: fechaId,
        equipoLocalId: '',
        equipoVisitanteId: '',
        estado: 'pendiente',
      })
      setShowForm(false)
    } catch (err: any) {
      setError(err.message || 'Error al crear partido')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este partido?')) return

    try {
      await deletePartido.mutateAsync(id)
    } catch (error: any) {
      alert(error.message || 'Error al eliminar partido')
    }
  }

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pendiente: 'outline',
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
      jugado: 'Jugado',
      suspendido: 'Suspendido',
      cancelado: 'Cancelado',
      no_se_presento_local: 'W.O. (Local)',
      no_se_presento_visitante: 'W.O. (Visitante)',
    }
    return labels[estado] || estado
  }

  if (isLoading) {
    return <div>Cargando fecha...</div>
  }

  if (!fecha) {
    return <div>Fecha no encontrada</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/fechas">
            <Button variant="ghost" size="sm" className="mb-2">← Volver</Button>
          </Link>
          <h1 className="text-3xl font-bold">
            Fecha {fecha.numero}
            {fecha.nombre && ` - ${fecha.nombre}`}
          </h1>
          <p className="text-muted-foreground">
            {new Date(fecha.desde).toLocaleDateString('es-AR')} -{' '}
            {new Date(fecha.hasta).toLocaleDateString('es-AR')}
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            + Agregar Partido
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Agregar Partido a Fecha {fecha.numero}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="equipoLocalId">Equipo Local *</Label>
                  <select
                    id="equipoLocalId"
                    {...register('equipoLocalId')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Seleccionar equipo</option>
                    {equipos?.map((equipo) => (
                      <option key={equipo.id} value={equipo.id}>
                        {equipo.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.equipoLocalId && (
                    <p className="text-sm text-destructive">{errors.equipoLocalId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="equipoVisitanteId">Equipo Visitante *</Label>
                  <select
                    id="equipoVisitanteId"
                    {...register('equipoVisitanteId')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Seleccionar equipo</option>
                    {equipos?.filter((e) => e.id !== equipoLocalId).map((equipo) => (
                      <option key={equipo.id} value={equipo.id}>
                        {equipo.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.equipoVisitanteId && (
                    <p className="text-sm text-destructive">{errors.equipoVisitanteId.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
                <select
                  id="estado"
                  {...register('estado')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="jugado">Jugado</option>
                  <option value="suspendido">Suspendido</option>
                  <option value="cancelado">Cancelado</option>
                  <option value="no_se_presento_local">No se presentó Local</option>
                  <option value="no_se_presento_visitante">No se presentó Visitante</option>
                </select>
                {errors.estado && (
                  <p className="text-sm text-destructive">{errors.estado.message}</p>
                )}
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Agregar Partido'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset()
                    setShowForm(false)
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Partidos de la Fecha</CardTitle>
        </CardHeader>
        <CardContent>
          {partidosLoading ? (
            <div>Cargando partidos...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
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
                      <TableCell className="font-medium">
                        {partido.equipoLocal?.nombre || '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {partido.equipoVisitante?.nombre || '-'}
                      </TableCell>
                      <TableCell>
                        {partido.estado === 'jugado' ||
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
                    <TableCell colSpan={5} className="text-center">
                      No hay partidos en esta fecha. Agrega el primero haciendo clic en &quot;Agregar Partido&quot;
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Equipos con Fecha Libre */}
      {fecha?.equiposLibres && fecha.equiposLibres.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Equipos con Fecha Libre (Descanso)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {fecha.equiposLibres.map((equipo) => (
                <Badge key={equipo.id} variant="outline" className="text-sm p-2">
                  {equipo.nombre}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

