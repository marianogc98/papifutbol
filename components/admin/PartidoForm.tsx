'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { partidoSchema, PartidoFormData } from '@/lib/validations/partido'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useCreatePartido, useUpdatePartido, Partido } from '@/lib/api/partidos'
import { useFechas } from '@/lib/api/fechas'
import { useEquipos } from '@/lib/api/equipos'
import { useState } from 'react'

interface PartidoFormProps {
  partido?: Partido
  onSuccess?: () => void
}

export function PartidoForm({ partido, onSuccess }: PartidoFormProps) {
  const [error, setError] = useState<string>('')
  const createPartido = useCreatePartido()
  const updatePartido = useUpdatePartido()
  const { data: fechas } = useFechas()
  const { data: equipos } = useEquipos('activo')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<PartidoFormData>({
    resolver: zodResolver(partidoSchema),
    defaultValues: partido
      ? {
          fechaId: partido.fechaId,
          equipoLocalId: partido.equipoLocalId,
          equipoVisitanteId: partido.equipoVisitanteId,
          estado: partido.estado as any,
        }
      : {
          fechaId: '',
          equipoLocalId: '',
          equipoVisitanteId: '',
          estado: 'pendiente',
        },
  })

  const equipoLocalId = watch('equipoLocalId')

  const onSubmit = async (data: PartidoFormData) => {
    setError('')
    try {
      if (partido) {
        await updatePartido.mutateAsync({ id: partido.id, data })
      } else {
        await createPartido.mutateAsync(data)
      }
      reset()
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Error al guardar partido')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fechaId">Fecha *</Label>
        <select
          id="fechaId"
          {...register('fechaId')}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">Seleccionar fecha</option>
          {fechas?.map((fecha) => (
            <option key={fecha.id} value={fecha.id}>
              Fecha {fecha.numero} {fecha.nombre ? `- ${fecha.nombre}` : ''}
            </option>
          ))}
        </select>
        {errors.fechaId && (
          <p className="text-sm text-destructive">{errors.fechaId.message}</p>
        )}
      </div>

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
          {isSubmitting
            ? 'Guardando...'
            : partido
            ? 'Actualizar Partido'
            : 'Crear Partido'}
        </Button>
        {partido && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset()
              onSuccess?.()
            }}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  )
}

