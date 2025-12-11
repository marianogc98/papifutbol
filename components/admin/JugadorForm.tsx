'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { jugadorSchema, JugadorFormData } from '@/lib/validations/jugador'
import { apiUrl } from '@/lib/utils/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/ui/image-upload'
import { useCreateJugador, useUpdateJugador, Jugador } from '@/lib/api/jugadores'
import { useEquipos } from '@/lib/api/equipos'
import { useState, useEffect } from 'react'

interface JugadorFormProps {
  jugador?: Jugador
  onSuccess?: () => void
}

export function JugadorForm({ jugador, onSuccess }: JugadorFormProps) {
  const [error, setError] = useState<string>('')
  const createJugador = useCreateJugador()
  const updateJugador = useUpdateJugador()
  const { data: equipos } = useEquipos()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
    control,
  } = useForm<JugadorFormData>({
    resolver: zodResolver(jugadorSchema),
    defaultValues: jugador
      ? {
          nombre: jugador.nombre,
          apellido: jugador.apellido,
          estado: jugador.estado as any,
          equipoId: jugador.equipoId || undefined,
          foto: jugador.foto || undefined,
        }
      : {
          nombre: '',
          apellido: '',
          estado: 'activo',
          equipoId: undefined,
          foto: undefined,
        },
  })

  const equipoId = watch('equipoId')

  // Resetear formulario cuando cambia el jugador a editar
  useEffect(() => {
    if (jugador) {
      reset({
        nombre: jugador.nombre,
        apellido: jugador.apellido,
        estado: jugador.estado as any,
        equipoId: jugador.equipoId || undefined,
        foto: jugador.foto || undefined,
      })
    } else {
      reset({
        nombre: '',
        apellido: '',
        estado: 'activo',
        equipoId: undefined,
        foto: undefined,
      })
    }
  }, [jugador, reset])

  const onSubmit = async (data: JugadorFormData) => {
    setError('')
    try {
      // Preparar datos para envío
      const submitData: any = {
        nombre: data.nombre,
        apellido: data.apellido,
        estado: data.estado,
        equipoId: data.equipoId || null,
        foto: data.foto || null,
      }

      if (jugador) {
        await updateJugador.mutateAsync({ id: jugador.id, data: submitData })
      } else {
        await createJugador.mutateAsync(submitData)
      }
      reset()
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Error al guardar jugador')
    }
  }

  return (
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


      <div className="space-y-2">
        <ImageUpload
          label="Foto del Jugador"
          currentImage={watch('foto') || undefined}
          onImageUploaded={(path) => setValue('foto', path)}
          uploadEndpoint={apiUrl('api/upload/jugador')}
          entityId={jugador?.id}
        />
        {errors.foto && (
          <p className="text-sm text-destructive">{errors.foto.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="equipoId">Equipo</Label>
          <select
            id="equipoId"
            {...register('equipoId')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Sin equipo</option>
            {equipos?.map((equipo) => (
              <option key={equipo.id} value={equipo.id}>
                {equipo.nombre}
              </option>
            ))}
          </select>
          {errors.equipoId && (
            <p className="text-sm text-destructive">{errors.equipoId.message}</p>
          )}
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
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Guardando...'
            : jugador
            ? 'Actualizar Jugador'
            : 'Crear Jugador'}
        </Button>
        {jugador && (
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

