'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect, useMemo } from 'react'
import { 
  usePartido, 
  useCargarResultado,
  useActualizarGolesEquipo,
  useAgregarGol,
  useEliminarGol,
  useCambiarEstadoPartido,
} from '@/lib/api/partidos'
import { useJugadores } from '@/lib/api/jugadores'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resultadoSchema, ResultadoFormData } from '@/lib/validations/partido'
import { AgregarGolFormData } from '@/lib/validations/gol'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader } from '@/components/ui/loader'
import { Trash2, Plus, Minus } from 'lucide-react'

export default function ResultadoPage() {
  const params = useParams()
  const router = useRouter()
  const partidoId = params.partidoId as string
  const { data: partido, isLoading, refetch } = usePartido(partidoId)
  const cargarResultado = useCargarResultado()
  const actualizarGolesEquipo = useActualizarGolesEquipo()
  const agregarGol = useAgregarGol()
  const eliminarGol = useEliminarGol()
  const cambiarEstado = useCambiarEstadoPartido()
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  // Obtener jugadores de ambos equipos
  const { data: jugadoresLocal } = useJugadores(
    partido?.equipoLocalId,
    'activo'
  )
  const { data: jugadoresVisitante } = useJugadores(
    partido?.equipoVisitanteId,
    'activo'
  )

  // Estados locales para modo en vivo
  const [golesLocalInput, setGolesLocalInput] = useState(0)
  const [golesVisitanteInput, setGolesVisitanteInput] = useState(0)
  const [nuevoGol, setNuevoGol] = useState<AgregarGolFormData>({
    jugadorId: '',
    equipoId: partido?.equipoLocalId || '',
  })

  // Sincronizar estados locales con datos del partido
  useEffect(() => {
    if (partido) {
      setGolesLocalInput(partido.golesLocal)
      setGolesVisitanteInput(partido.golesVisitante)
      if (partido.estado === 'jugando') {
        setNuevoGol(prev => ({
          ...prev,
          equipoId: partido.equipoLocalId,
        }))
      }
    }
  }, [partido])

  // Formulario para modo tradicional (jugado)
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<ResultadoFormData>({
    resolver: zodResolver(resultadoSchema),
    defaultValues: {
      estado: 'jugado',
      golesLocal: 0,
      golesVisitante: 0,
      equipoLocalId: '',
      equipoVisitanteId: '',
      goles: [],
    },
  })

  // Resetear formulario cuando se cargue el partido
  useEffect(() => {
    if (partido && !isLoading && partido.estado !== 'jugando') {
      reset({
        estado: partido.estado as any,
        golesLocal: partido.golesLocal,
        golesVisitante: partido.golesVisitante,
        equipoLocalId: partido.equipoLocalId,
        equipoVisitanteId: partido.equipoVisitanteId,
        goles: partido.goles.map((g) => ({
          jugadorId: g.jugador.id,
          equipoId: g.equipoId,
        })),
      })
    }
  }, [partido, isLoading, reset])

  const { fields: golesFields, append: appendGol, remove: removeGol } = useFieldArray({
    control,
    name: 'goles',
  })

  const estado = watch('estado')

  // Calcular goles asignados por equipo
  const golesAsignados = useMemo(() => {
    if (!partido) return { local: 0, visitante: 0 }
    
    const local = partido.goles.filter(
      g => g.equipoId === partido.equipoLocalId
    ).length
    const visitante = partido.goles.filter(
      g => g.equipoId === partido.equipoVisitanteId
    ).length
    
    return { local, visitante }
  }, [partido])

  // ============================================
  // FUNCIONES PARA MODO EN VIVO
  // ============================================

  const handleIniciarPartido = async () => {
    setError('')
    setSuccess('')
    try {
      await cambiarEstado.mutateAsync({ partidoId, estado: 'jugando' })
      setSuccess('Partido iniciado. Puedes comenzar a agregar goles.')
      refetch()
    } catch (err: any) {
      setError(err.message || 'Error al iniciar partido')
    }
  }

  const handleFinalizarPartido = async () => {
    setError('')
    setSuccess('')
    try {
      await cambiarEstado.mutateAsync({ partidoId, estado: 'jugado' })
      setSuccess('Partido finalizado. Puedes revisar y ajustar los goles antes de guardar.')
      refetch()
    } catch (err: any) {
      setError(err.message || 'Error al finalizar partido')
    }
  }

  const handleActualizarGolesEquipo = async (nuevosGolesLocal?: number, nuevosGolesVisitante?: number) => {
    setError('')
    try {
      const golesLocal = nuevosGolesLocal !== undefined ? nuevosGolesLocal : golesLocalInput
      const golesVisitante = nuevosGolesVisitante !== undefined ? nuevosGolesVisitante : golesVisitanteInput
      
      await actualizarGolesEquipo.mutateAsync({
        partidoId,
        data: {
          golesLocal,
          golesVisitante,
        },
      })
      refetch()
    } catch (err: any) {
      setError(err.message || 'Error al actualizar goles')
    }
  }

  const handleIncrementarGolLocal = async () => {
    const nuevoValor = golesLocalInput + 1
    setGolesLocalInput(nuevoValor)
    await handleActualizarGolesEquipo(nuevoValor, undefined)
  }

  const handleDecrementarGolLocal = async () => {
    const nuevoValor = Math.max(0, golesLocalInput - 1)
    // No permitir bajar por debajo de los goles asignados
    if (nuevoValor >= golesAsignados.local) {
      setGolesLocalInput(nuevoValor)
      await handleActualizarGolesEquipo(nuevoValor, undefined)
    }
  }

  const handleIncrementarGolVisitante = async () => {
    const nuevoValor = golesVisitanteInput + 1
    setGolesVisitanteInput(nuevoValor)
    await handleActualizarGolesEquipo(undefined, nuevoValor)
  }

  const handleDecrementarGolVisitante = async () => {
    const nuevoValor = Math.max(0, golesVisitanteInput - 1)
    // No permitir bajar por debajo de los goles asignados
    if (nuevoValor >= golesAsignados.visitante) {
      setGolesVisitanteInput(nuevoValor)
      await handleActualizarGolesEquipo(undefined, nuevoValor)
    }
  }

  const handleAgregarGol = async () => {
    if (!nuevoGol.jugadorId) {
      setError('Debes seleccionar un jugador')
      return
    }

    setError('')
    try {
      await agregarGol.mutateAsync({
        partidoId,
        data: nuevoGol,
      })
      setNuevoGol({
        jugadorId: '',
        equipoId: nuevoGol.equipoId,
      })
      refetch()
    } catch (err: any) {
      setError(err.message || 'Error al agregar gol')
    }
  }

  const handleEliminarGol = async (golId: string) => {
    if (!confirm('¿Estás seguro de eliminar este gol?')) return

    setError('')
    try {
      await eliminarGol.mutateAsync({ partidoId, golId })
      refetch()
    } catch (err: any) {
      setError(err.message || 'Error al eliminar gol')
    }
  }

  // ============================================
  // FUNCIONES PARA MODO TRADICIONAL
  // ============================================

  const onSubmit = async (data: ResultadoFormData) => {
    setError('')
    setSuccess('')
    try {
      await cargarResultado.mutateAsync({
        partidoId,
        data: {
          ...data,
          equipoLocalId: partido!.equipoLocalId,
          equipoVisitanteId: partido!.equipoVisitanteId,
        },
      })
      router.push('/admin/partidos')
    } catch (err: any) {
      setError(err.message || 'Error al cargar resultado')
    }
  }

  const handleEstadoChange = (newEstado: string) => {
    setValue('estado', newEstado as any)
    
    // Si es W.O., establecer resultado automático
    if (newEstado === 'no_se_presento_local') {
      setValue('golesLocal', 0)
      setValue('golesVisitante', 3)
    } else if (newEstado === 'no_se_presento_visitante') {
      setValue('golesLocal', 3)
      setValue('golesVisitante', 0)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader />
      </div>
    )
  }

  if (!partido) {
    return <div>Partido no encontrado</div>
  }

  const jugadoresEquipo = (equipoId: string) => {
    if (equipoId === partido.equipoLocalId) {
      return jugadoresLocal || []
    }
    return jugadoresVisitante || []
  }

  const esModoEnVivo = partido.estado === 'jugando'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">
          {esModoEnVivo ? 'Partido en Vivo' : 'Cargar Resultado'}
        </h2>
        <p className="text-muted-foreground">
          {partido.equipoLocal.nombre} vs {partido.equipoVisitante.nombre}
        </p>
        {esModoEnVivo && (
          <Badge variant="default" className="mt-2 bg-transparent">
            🟢
          </Badge>
        )}
      </div>

      {/* Mensajes de éxito/error */}
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* ============================================ */}
      {/* MODO EN VIVO (estado: jugando) */}
      {/* ============================================ */}
      {esModoEnVivo ? (
        <div className="space-y-6">
          {/* Goles del Equipo (Actualizable en tiempo real) */}
          <Card>
            <CardHeader>
              <CardTitle>Goles del Partido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>
                    {partido.equipoLocal.nombre}
                  </Label>
                  <div className="flex items-center gap-3 justify-center">
                    <Button
                      type="button"
                      onClick={handleDecrementarGolLocal}
                      disabled={actualizarGolesEquipo.isPending || golesLocalInput === 0 || golesLocalInput <= golesAsignados.local}
                      variant="outline"
                      size="icon"
                      className="h-12 w-12"
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <div className="text-4xl font-bold min-w-[60px] text-center">
                      {golesLocalInput}
                    </div>
                    <Button
                      type="button"
                      onClick={handleIncrementarGolLocal}
                      disabled={actualizarGolesEquipo.isPending}
                      variant="outline"
                      size="icon"
                      className="h-12 w-12"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {golesAsignados.local} de {golesLocalInput} goles asignados
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>
                    {partido.equipoVisitante.nombre}
                  </Label>
                  <div className="flex items-center gap-3 justify-center">
                    <Button
                      type="button"
                      onClick={handleDecrementarGolVisitante}
                      disabled={actualizarGolesEquipo.isPending || golesVisitanteInput === 0 || golesVisitanteInput <= golesAsignados.visitante}
                      variant="outline"
                      size="icon"
                      className="h-12 w-12"
                    >
                      <Minus className="h-5 w-5" />
                    </Button>
                    <div className="text-4xl font-bold min-w-[60px] text-center">
                      {golesVisitanteInput}
                    </div>
                    <Button
                      type="button"
                      onClick={handleIncrementarGolVisitante}
                      disabled={actualizarGolesEquipo.isPending}
                      variant="outline"
                      size="icon"
                      className="h-12 w-12"
                    >
                      <Plus className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    {golesAsignados.visitante} de {golesVisitanteInput} goles asignados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agregar Gol Individual */}
          <Card>
            <CardHeader>
              <CardTitle>Agregar Gol</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Equipo</Label>
                    <select
                      value={nuevoGol.equipoId}
                      onChange={(e) => setNuevoGol(prev => ({ ...prev, equipoId: e.target.value, jugadorId: '' }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value={partido.equipoLocalId}>
                        {partido.equipoLocal.nombre}
                      </option>
                      <option value={partido.equipoVisitanteId}>
                        {partido.equipoVisitante.nombre}
                      </option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Jugador *</Label>
                    <select
                      value={nuevoGol.jugadorId}
                      onChange={(e) => setNuevoGol(prev => ({ ...prev, jugadorId: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Seleccionar</option>
                      {jugadoresEquipo(nuevoGol.equipoId).map((jugador) => (
                        <option key={jugador.id} value={jugador.id}>
                          {jugador.nombre} {jugador.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={handleAgregarGol}
                  disabled={!nuevoGol.jugadorId || agregarGol.isPending}
                  className="w-full"
                >
                  {agregarGol.isPending ? 'Agregando...' : 'Agregar Gol'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Goles Agregados */}
          <Card>
            <CardHeader>
              <CardTitle>Goles Registrados</CardTitle>
            </CardHeader>
            <CardContent>
              {partido.goles.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No hay goles registrados aún
                </p>
              ) : (
                <div className="space-y-2">
                  {partido.goles.map((gol) => (
                    <div
                      key={gol.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {gol.jugador.nombre} {gol.jugador.apellido}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {gol.equipoId === partido.equipoLocalId
                            ? partido.equipoLocal.nombre
                            : partido.equipoVisitante.nombre}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleEliminarGol(gol.id)}
                        disabled={eliminarGol.isPending}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botón para finalizar partido */}
          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleFinalizarPartido}
                variant="outline"
                className="w-full"
              >
                Finalizar Partido
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : partido.estado === 'pendiente' ? (
        /* ============================================ */
        /* MODO INICIO (estado: pendiente) */
        /* ============================================ */
        <Card>
          <CardHeader>
            <CardTitle>Iniciar Partido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Este partido está pendiente. Haz clic en el botón para iniciarlo y comenzar a registrar goles en tiempo real.
            </p>
            <Button
              onClick={handleIniciarPartido}
              disabled={cambiarEstado.isPending}
              className="w-full"
              size="lg"
            >
              {cambiarEstado.isPending ? 'Iniciando...' : '🚀 Iniciar Partido'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* ============================================ */
        /* MODO TRADICIONAL (estado: jugado, suspendido, etc.) */
        /* ============================================ */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Estado del Partido */}
          <Card>
            <CardHeader>
              <CardTitle>Estado del Partido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado *</Label>
                <select
                  id="estado"
                  {...register('estado')}
                  onChange={(e) => handleEstadoChange(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
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
            </CardContent>
          </Card>

          {/* Resultado */}
          {(estado === 'jugado' || estado.includes('no_se_presento')) && (
            <Card>
              <CardHeader>
                <CardTitle>Resultado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="golesLocal">
                      Goles {partido.equipoLocal.nombre}
                    </Label>
                    <Input
                      id="golesLocal"
                      type="number"
                      {...register('golesLocal', { valueAsNumber: true })}
                      min="0"
                      disabled={estado.includes('no_se_presento')}
                    />
                    {errors.golesLocal && (
                      <p className="text-sm text-destructive">{errors.golesLocal.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="golesVisitante">
                      Goles {partido.equipoVisitante.nombre}
                    </Label>
                    <Input
                      id="golesVisitante"
                      type="number"
                      {...register('golesVisitante', { valueAsNumber: true })}
                      min="0"
                      disabled={estado.includes('no_se_presento')}
                    />
                    {errors.golesVisitante && (
                      <p className="text-sm text-destructive">{errors.golesVisitante.message}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Goles */}
          {estado === 'jugado' && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Goles</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendGol({
                      jugadorId: '',
                      equipoId: partido.equipoLocalId,
                    })}
                  >
                    Agregar Gol
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {golesFields.map((field, index) => (
                    <div key={field.id} className="flex gap-4 items-end p-4 border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <Label>Equipo</Label>
                        <select
                          {...register(`goles.${index}.equipoId`)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value={partido.equipoLocalId}>
                            {partido.equipoLocal.nombre}
                          </option>
                          <option value={partido.equipoVisitanteId}>
                            {partido.equipoVisitante.nombre}
                          </option>
                        </select>
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label>Jugador</Label>
                        <select
                          {...register(`goles.${index}.jugadorId`)}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          <option value="">Seleccionar</option>
                          {jugadoresEquipo(watch(`goles.${index}.equipoId`)).map((jugador) => (
                            <option key={jugador.id} value={jugador.id}>
                              {jugador.nombre} {jugador.apellido}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeGol(index)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {golesFields.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No hay goles registrados. Agrega goles haciendo clic en &quot;Agregar Gol&quot;
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Resultado'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/partidos')}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
