'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'
import { useFecha } from '@/lib/api/fechas'
import { usePartidos, useCreatePartido, useDeletePartido, Partido } from '@/lib/api/partidos'
import { useEquipos } from '@/lib/api/equipos'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { partidoSchema, PartidoFormData } from '@/lib/validations/partido'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import { formatDateTimeUTC, formatDateUTC } from '@/lib/utils/date'

export default function FechaDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slugOrId = params.id as string
  const { data: fecha, isLoading } = useFecha(slugOrId)
  const { data: partidos, isLoading: partidosLoading } = usePartidos(fecha?.id || slugOrId)
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
    getValues,
  } = useForm<PartidoFormData>({
    resolver: zodResolver(partidoSchema),
    defaultValues: {
      fechaId: fecha?.id || slugOrId,
      equipoLocalId: '',
      equipoVisitanteId: '',
      estado: 'pendiente',
      horaLocal: '',
    },
  })

  const equipoLocalId = watch('equipoLocalId')

  const onSubmit = async (data: PartidoFormData) => {
    setError('')
    try {
      // Obtener el valor directamente del input (por si react-hook-form no lo captura)
      const horaLocalValue = (document.getElementById('horaLocal') as HTMLInputElement)?.value || data.horaLocal || ''
      
      // El endpoint combinará la fecha de la fecha con la hora seleccionada
      const submitData: PartidoFormData = {
        ...data,
        fechaId: fecha?.id || slugOrId,
        // Usar el valor del DOM si el form no lo capturó
        horaLocal: horaLocalValue && horaLocalValue.trim() !== '' ? horaLocalValue.trim() : undefined,
      }
      const partidoCreado = await createPartido.mutateAsync(submitData)
      
      // Si el estado es "jugado", redirigir a la página de resultados
      if (submitData.estado === 'jugado') {
        router.push(`/admin/resultados/${partidoCreado.id}`)
        return
      }
      
      reset({
        fechaId: fecha?.id || slugOrId,
        equipoLocalId: '',
        equipoVisitanteId: '',
        estado: 'pendiente',
        horaLocal: undefined,
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

  // Calcular equipos en descanso basándose en los partidos y equipos actuales
  const equiposEnDescanso = useMemo(() => {
    if (!partidos || !equipos) return []

    // Obtener IDs de equipos que tienen partido en esta fecha
    const equiposConPartido = new Set<string>()
    partidos.forEach((partido) => {
      if (partido.equipoLocalId) equiposConPartido.add(partido.equipoLocalId)
      if (partido.equipoVisitanteId) equiposConPartido.add(partido.equipoVisitanteId)
    })

    // Equipos activos que NO tienen partido (fecha libre)
    return equipos.filter(
      (equipo) => equipo.estado === 'activo' && !equiposConPartido.has(equipo.id)
    )
  }, [partidos, equipos])

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
          <h1 className="text-3xl font-bold">
            {fecha.nombre || `Fecha ${fecha.numero}`}
          </h1>
          <p className="text-muted-foreground">
            {formatDateUTC(fecha.fecha)}
          </p>
        </div>
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-[#852024] hover:bg-[#6a1a1d] text-white"
          >
            Agregar Partido
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Agregar Partido a {fecha.nombre || `Fecha ${fecha.numero}`}</CardTitle>
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
                <Label htmlFor="horaLocal">Hora del Partido (opcional)</Label>
                <Input
                  id="horaLocal"
                  type="time"
                  {...register('horaLocal', {
                    setValueAs: (value) => value || undefined, // Convertir string vacío a undefined
                  })}
                />
                <p className="text-sm text-muted-foreground">
                  Selecciona la hora (se guardará en UTC 00:00). Se combinará con la fecha de esta fecha.
                </p>
                {errors.fechaHora && (
                  <p className="text-sm text-destructive">{errors.fechaHora.message}</p>
                )}
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
                        {partido.fechaHora ? formatDateTimeUTC(partido.fechaHora) : '-'}
                      </TableCell>
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
                            <Button 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8"
                              title="Ver Resultado"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(partido.id)}
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
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
      {equiposEnDescanso && equiposEnDescanso.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Equipos con Fecha Libre (Descanso)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {equiposEnDescanso.map((equipo) => (
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
