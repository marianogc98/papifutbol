'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { partidoSchema, PartidoFormData } from '@/lib/validations/partido'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useCreatePartido, useUpdatePartido, Partido } from '@/lib/api/partidos'
import { useFechas } from '@/lib/api/fechas'
import { useEquipos } from '@/lib/api/equipos'
import { useState } from 'react'
import { utcToTimeString } from '@/lib/utils/date'

interface PartidoFormProps {
  partido?: Partido
  fechaId?: string // Fecha pre-seleccionada (cuando se crea desde la página de fechas)
  onSuccess?: () => void
}

export function PartidoForm({ partido, fechaId: propFechaId, onSuccess }: PartidoFormProps) {
  const router = useRouter()
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
    getValues,
  } = useForm<PartidoFormData>({
    resolver: zodResolver(partidoSchema),
    defaultValues: partido
      ? {
          fechaId: partido.fechaId,
          equipoLocalId: partido.equipoLocalId,
          equipoVisitanteId: partido.equipoVisitanteId,
          estado: partido.estado as any,
          horaLocal: partido.fechaHora ? utcToTimeString(partido.fechaHora) : '',
        }
      : {
          fechaId: propFechaId || '',
          equipoLocalId: '',
          equipoVisitanteId: '',
          estado: 'pendiente',
          horaLocal: '',
        },
  })

  const equipoLocalId = watch('equipoLocalId')
  const fechaId = watch('fechaId')
  // Usar la fecha del prop si existe, o la del form
  const fechaIdFinal = propFechaId || fechaId || (partido?.fechaId)

  const onSubmit = async (data: PartidoFormData) => {
    setError('')
    try {
      // Obtener el valor directamente del input (por si react-hook-form no lo captura)
      const horaLocalValue = (document.getElementById('horaLocal') as HTMLInputElement)?.value || data.horaLocal || ''
      
      // El endpoint combinará la fecha de la fecha seleccionada con la hora
      const submitData: PartidoFormData = {
        ...data,
        // Usar fechaId del prop si existe, o del form
        fechaId: propFechaId || data.fechaId || partido?.fechaId || '',
        // Usar el valor del DOM si el form no lo capturó
        horaLocal: horaLocalValue && horaLocalValue.trim() !== '' ? horaLocalValue.trim() : undefined,
      }
      
      let partidoResultado: Partido
      if (partido) {
        partidoResultado = await updatePartido.mutateAsync({ id: partido.id, data: submitData })
      } else {
        partidoResultado = await createPartido.mutateAsync(submitData)
      }
      
      // Si el estado es "jugado", redirigir a la página de resultados
      if (submitData.estado === 'jugado') {
        router.push(`/admin/resultados/${partidoResultado.id}`)
        return
      }
      
      reset()
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Error al guardar partido')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* No mostrar campo de fecha: se toma del contexto o del partido existente */}

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
          Selecciona la hora (se guardará en UTC 00:00). Se combinará con la fecha del partido.
        </p>
        {errors.fechaHora && (
          <p className="text-sm text-destructive">{errors.fechaHora.message}</p>
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

