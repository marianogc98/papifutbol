'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { usePartido, useCargarResultado } from '@/lib/api/partidos'
import { useJugadores } from '@/lib/api/jugadores'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resultadoSchema, ResultadoFormData } from '@/lib/validations/partido'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ResultadoPage() {
  const params = useParams()
  const router = useRouter()
  const partidoId = params.partidoId as string
  const { data: partido, isLoading } = usePartido(partidoId)
  const cargarResultado = useCargarResultado()
  const [error, setError] = useState<string>('')

  // Obtener jugadores de ambos equipos
  const { data: jugadoresLocal } = useJugadores(
    partido?.equipoLocalId,
    'activo'
  )
  const { data: jugadoresVisitante } = useJugadores(
    partido?.equipoVisitanteId,
    'activo'
  )

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
    if (partido && !isLoading) {
      reset({
        estado: partido.estado as any,
        golesLocal: partido.golesLocal,
        golesVisitante: partido.golesVisitante,
        equipoLocalId: partido.equipoLocalId,
        equipoVisitanteId: partido.equipoVisitanteId,
        goles: partido.goles.map((g) => ({
          jugadorId: g.jugador.id,
          equipoId: g.equipoId,
          esPenal: g.esPenal,
          esAutogol: g.esAutogol,
        })),
      })
    }
  }, [partido, isLoading, reset])

  const { fields: golesFields, append: appendGol, remove: removeGol } = useFieldArray({
    control,
    name: 'goles',
  })

  const estado = watch('estado')
  const golesLocal = watch('golesLocal')
  const golesVisitante = watch('golesVisitante')

  const onSubmit = async (data: ResultadoFormData) => {
    setError('')
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
    return <div>Cargando partido...</div>
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Cargar Resultado</h2>
        <p className="text-muted-foreground">
          {partido.equipoLocal.nombre} vs {partido.equipoVisitante.nombre}
        </p>
      </div>

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
                <option value="no_se_presento_local">No se presentó Local (W.O.)</option>
                <option value="no_se_presento_visitante">No se presentó Visitante (W.O.)</option>
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
              <div className="grid grid-cols-2 gap-4">
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
                    esPenal: false,
                    esAutogol: false,
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
                            {jugador.numero ? ` (${jugador.numero})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register(`goles.${index}.esPenal`)}
                        />
                        Penal
                      </Label>
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          {...register(`goles.${index}.esAutogol`)}
                        />
                        Autogol
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeGol(index)}
                    >
                      Eliminar
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

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
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
    </div>
  )
}

