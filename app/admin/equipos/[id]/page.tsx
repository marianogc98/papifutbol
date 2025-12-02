'use client'

import { useParams } from 'next/navigation'
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
import { CustomImage } from '@/components/ui/Image'
import { tableStyles } from '@/lib/constants/tableStyles'
import { Pencil, Trash2 } from 'lucide-react'

export default function EquipoDetailPage() {
  const params = useParams()
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

  const getVidasColor = (vidas: number) => {
    if (vidas >= 2) return 'text-green-600'
    if (vidas === 1) return 'text-orange-600'
    return 'text-red-600'
  }

  const getVidasBgColor = (vidas: number) => {
    if (vidas >= 2) return 'bg-green-100 border-green-300'
    if (vidas === 1) return 'bg-orange-100 border-orange-300'
    return 'bg-red-100 border-red-300'
  }

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="text-center">Cargando equipo...</div>
      </div>
    )
  }

  if (!equipo) {
    return (
      <div className="w-full">
        <div className="text-center">Equipo no encontrado</div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header con escudo, nombre y vidas */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {equipo.escudo && (
              <CustomImage
                src={equipo.escudo}
                alt={equipo.nombre}
                width={80}
                height={80}
              />
            )}
            <h1 className={`${tableStyles.text.title.mobile} md:${tableStyles.text.title.desktop} font-bold ${tableStyles.colors.primary}`}>
              {equipo.nombre}
            </h1>
          </div>
          {/* Vidas destacadas */}
          <div className={`flex flex-col items-center justify-center px-4 py-3 border-2 rounded-lg ${getVidasBgColor(equipo.vidas)}`}>
            <span className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.secondary} font-medium`}>Vidas</span>
            <span className={`${tableStyles.text.highlighted.mobile} md:${tableStyles.text.highlighted.desktop} font-bold ${getVidasColor(equipo.vidas)}`}>
              {equipo.vidas}
            </span>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Estadísticas</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Datos de partidos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.muted} mb-1`}>Partidos Jugados</div>
              <div className={`${tableStyles.text.highlighted.mobile} md:${tableStyles.text.highlighted.desktop} font-bold ${tableStyles.colors.primary}`}>
                {equipo.estadisticas.partidosJugados}
              </div>
            </div>
            <div className="text-center">
              <div className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.muted} mb-1`}>Partidos Ganados</div>
              <div className={`${tableStyles.text.highlighted.mobile} md:${tableStyles.text.highlighted.desktop} font-bold ${tableStyles.colors.positive}`}>
                {equipo.estadisticas.victorias}
              </div>
            </div>
            <div className="text-center">
              <div className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.muted} mb-1`}>Partidos Empatados</div>
              <div className={`${tableStyles.text.highlighted.mobile} md:${tableStyles.text.highlighted.desktop} font-bold ${tableStyles.colors.warning}`}>
                {equipo.estadisticas.empates}
              </div>
            </div>
            <div className="text-center">
              <div className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.muted} mb-1`}>Partidos Perdidos</div>
              <div className={`${tableStyles.text.highlighted.mobile} md:${tableStyles.text.highlighted.desktop} font-bold ${tableStyles.colors.negative}`}>
                {equipo.estadisticas.derrotas}
              </div>
            </div>
          </div>
          {/* Datos de goles */}
          <div className="grid grid-cols-3 gap-4 border-t pt-4">
            <div className="text-center">
              <div className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.muted} mb-1`}>GF</div>
              <div className={`${tableStyles.text.highlighted.mobile} md:${tableStyles.text.highlighted.desktop} font-bold ${tableStyles.colors.positive}`}>
                {equipo.estadisticas.golesAFavor}
              </div>
            </div>
            <div className="text-center">
              <div className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.muted} mb-1`}>GC</div>
              <div className={`${tableStyles.text.highlighted.mobile} md:${tableStyles.text.highlighted.desktop} font-bold ${tableStyles.colors.negative}`}>
                {equipo.estadisticas.golesEnContra}
              </div>
            </div>
            <div className="text-center">
              <div className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.muted} mb-1`}>DIF</div>
              <div className={`${tableStyles.text.highlighted.mobile} md:${tableStyles.text.highlighted.desktop} font-bold ${equipo.estadisticas.diferencia >= 0 ? tableStyles.colors.positive : tableStyles.colors.negative}`}>
                {equipo.estadisticas.diferencia > 0 ? '+' : ''}{equipo.estadisticas.diferencia}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario para agregar/editar jugador */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingJugador ? 'Editar Jugador' : 'Agregar Jugador'}
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

      {/* Jugadores */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Jugadores</CardTitle>
          {!showForm && (
            <Button 
              onClick={() => {
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
              }}
              className="bg-[#852024] hover:bg-[#6a1a1d] text-white"
            >
              Agregar Jugador
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {jugadoresLoading ? (
            <div className="text-center py-4">Cargando jugadores...</div>
          ) : jugadores && jugadores.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {jugadores.map((jugador) => (
                <div
                  key={jugador.id}
                  className={`${tableStyles.backgrounds.table} ${tableStyles.borders.table} ${tableStyles.shadows.card} p-3 rounded-lg relative group`}
                >
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
                    {jugador.foto ? (
                      <CustomImage
                        src={jugador.foto}
                        alt={`${jugador.nombre} ${jugador.apellido}`}
                        width={60}
                        height={60}
                        className="rounded-lg flex-shrink-0"
                        square={true}
                      />
                    ) : (
                      <div className="w-[60px] h-[60px] rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <span className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.muted} font-medium`}>
                          {jugador.nombre.charAt(0)}{jugador.apellido.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col text-center md:text-left flex-1 min-w-0">
                      <div className={`font-medium ${tableStyles.text.content.mobile} md:${tableStyles.text.content.desktop} ${tableStyles.colors.primary} mb-1 break-words`}>
                        {jugador.nombre}
                      </div>
                      <div className={`font-medium ${tableStyles.text.content.mobile} md:${tableStyles.text.content.desktop} ${tableStyles.colors.primary} mb-1 break-words`}>
                        {jugador.apellido}
                      </div>
                      {jugador.numero && (
                        <div className={`${tableStyles.text.secondary.mobile} md:${tableStyles.text.secondary.desktop} font-semibold ${tableStyles.colors.secondary} mt-1`}>
                          #{jugador.numero}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Botones de acción */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setEditingJugador(jugador)}
                      title="Editar"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDelete(jugador.id)}
                      title="Eliminar"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={`${tableStyles.colors.muted} text-center py-4`}>
              No hay jugadores registrados en este equipo
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
