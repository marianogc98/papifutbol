'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useEquipo } from '@/lib/api/equipos'
import { useJugadores, useCreateJugador, useUpdateJugador, useDeleteJugador, Jugador } from '@/lib/api/jugadores'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { jugadorSchema, JugadorFormData } from '@/lib/validations/jugador'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { CustomImage } from '@/components/ui/Image'

export default function EquipoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slugOrId = params.id as string
  const { data: equipo, isLoading } = useEquipo(slugOrId)
  const { data: jugadores, isLoading: jugadoresLoading } = useJugadores(equipo?.id || slugOrId)
  const createJugador = useCreateJugador()
  const updateJugador = useUpdateJugador()
  const deleteJugador = useDeleteJugador()
  const [showForm, setShowForm] = useState(false)
  const [editingJugador, setEditingJugador] = useState<Jugador | undefined>()
  const [error, setError] = useState<string>('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<JugadorFormData>({
    resolver: zodResolver(jugadorSchema),
    defaultValues: {
      nombre: '',
      apellido: '',
      numero: undefined,
      fechaNac: undefined,
      estado: 'activo',
      equipoId: equipo?.id || slugOrId,
    },
  })

  // Cargar datos del jugador cuando se selecciona para editar
  useEffect(() => {
    if (editingJugador) {
      reset({
        nombre: editingJugador.nombre,
        apellido: editingJugador.apellido,
        numero: editingJugador.numero || undefined,
        fechaNac: editingJugador.fechaNac 
          ? new Date(editingJugador.fechaNac).toISOString().split('T')[0]
          : undefined,
        estado: editingJugador.estado as any,
        equipoId: equipo?.id || slugOrId,
      })
      setShowForm(true)
    }
  }, [editingJugador, equipo?.id, slugOrId, reset])

  const onSubmit = async (data: JugadorFormData) => {
    setError('')
    try {
      // Preparar datos para envío
      const submitData: any = {
        nombre: data.nombre,
        apellido: data.apellido,
        estado: data.estado,
        equipoId: equipo?.id || null,
      }

      // Agregar número solo si existe
      if (data.numero !== undefined && data.numero !== null) {
        submitData.numero = data.numero
      }

      // Agregar fecha solo si existe y convertir a ISO string
      if (data.fechaNac) {
        submitData.fechaNac = data.fechaNac instanceof Date 
          ? data.fechaNac.toISOString() 
          : new Date(data.fechaNac).toISOString()
      }

      if (editingJugador) {
        // Actualizar jugador existente
        await updateJugador.mutateAsync({ id: editingJugador.id, data: submitData })
      } else {
        // Crear nuevo jugador
        await createJugador.mutateAsync(submitData)
      }
      
      reset()
      setShowForm(false)
      setEditingJugador(undefined)
    } catch (err: any) {
      setError(err.message || 'Error al guardar jugador')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este jugador?')) return

    try {
      await deleteJugador.mutateAsync(id)
    } catch (error: any) {
      alert(error.message || 'Error al eliminar jugador')
    }
  }

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      activo: 'default',
      lesionado: 'secondary',
      suspendido: 'secondary',
      dado_de_baja: 'destructive',
    }
    return variants[estado] || 'outline'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('es-AR')
  }

  if (isLoading) {
    return <div>Cargando equipo...</div>
  }

  if (!equipo) {
    return <div>Equipo no encontrado</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link href="/admin/equipos">
              <Button variant="ghost" size="sm">← Volver</Button>
            </Link>
            {equipo.escudo && (
              <CustomImage
                src={equipo.escudo}
                alt={equipo.nombre}
                width={64}
                height={64}
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{equipo.nombre}</h1>
              <Badge variant={equipo.estado === 'activo' ? 'default' : 'destructive'}>
                {equipo.estado}
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground">
            Vidas: <span className="font-bold text-lg">{equipo.vidas}</span>
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => {
            setEditingJugador(undefined)
            setShowForm(true)
            reset({
              nombre: '',
              apellido: '',
              numero: undefined,
              fechaNac: undefined,
              estado: 'activo',
              equipoId: equipo?.id || slugOrId,
            })
          }}>
            + Agregar Jugador
          </Button>
        )}
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingJugador ? 'Editar Jugador' : 'Agregar Jugador a'} {equipo.nombre}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    {...register('nombre')}
                    placeholder="Ej: Juan"
                  />
                  {errors.nombre && (
                    <p className="text-sm text-destructive">{errors.nombre.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido *</Label>
                  <Input
                    id="apellido"
                    {...register('apellido')}
                    placeholder="Ej: Pérez"
                  />
                  {errors.apellido && (
                    <p className="text-sm text-destructive">{errors.apellido.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numero">Número de Camiseta</Label>
                  <Input
                    id="numero"
                    type="number"
                    {...register('numero', { valueAsNumber: true })}
                    min="1"
                    max="99"
                    placeholder="Ej: 10"
                  />
                  {errors.numero && (
                    <p className="text-sm text-destructive">{errors.numero.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaNac">Fecha de Nacimiento</Label>
                  <Input
                    id="fechaNac"
                    type="date"
                    {...register('fechaNac')}
                  />
                  {errors.fechaNac && (
                    <p className="text-sm text-destructive">{errors.fechaNac.message}</p>
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
                  <option value="activo">Activo</option>
                  <option value="lesionado">Lesionado</option>
                  <option value="suspendido">Suspendido</option>
                  <option value="dado_de_baja">Dado de Baja</option>
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
                  {isSubmitting 
                    ? 'Guardando...' 
                    : editingJugador 
                      ? 'Actualizar Jugador' 
                      : 'Agregar Jugador'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset()
                    setShowForm(false)
                    setEditingJugador(undefined)
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
          <CardTitle>Jugadores del Equipo</CardTitle>
        </CardHeader>
        <CardContent>
          {jugadoresLoading ? (
            <div>Cargando jugadores...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Apellido</TableHead>
                  <TableHead>Fecha Nac.</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jugadores && jugadores.length > 0 ? (
                  jugadores.map((jugador) => (
                    <TableRow key={jugador.id}>
                      <TableCell>{jugador.numero || '-'}</TableCell>
                      <TableCell className="font-medium">
                        {jugador.nombre}
                      </TableCell>
                      <TableCell>{jugador.apellido}</TableCell>
                      <TableCell>{formatDate(jugador.fechaNac)}</TableCell>
                      <TableCell>
                        <Badge variant={getEstadoBadge(jugador.estado)}>
                          {jugador.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingJugador(jugador)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(jugador.id)}
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
                      No hay jugadores en este equipo. Agrega el primero haciendo clic en &quot;Agregar Jugador&quot;
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

