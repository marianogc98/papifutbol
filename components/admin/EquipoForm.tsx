'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { equipoSchema, EquipoFormData } from '@/lib/validations/equipo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/ui/image-upload'
import { useCreateEquipo, useUpdateEquipo, Equipo } from '@/lib/api/equipos'
import { useState } from 'react'

interface EquipoFormProps {
  equipo?: Equipo
  onSuccess?: () => void
}

export function EquipoForm({ equipo, onSuccess }: EquipoFormProps) {
  const [error, setError] = useState<string>('')
  const createEquipo = useCreateEquipo()
  const updateEquipo = useUpdateEquipo()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<EquipoFormData>({
    resolver: zodResolver(equipoSchema),
    defaultValues: equipo
      ? {
          nombre: equipo.nombre,
          escudo: equipo.escudo || '',
          vidas: equipo.vidas,
          estado: equipo.estado as any,
        }
      : {
          nombre: '',
          escudo: '',
          vidas: 3,
          estado: 'activo',
        },
  })

  const onSubmit = async (data: EquipoFormData) => {
    setError('')
    try {
      if (equipo) {
        await updateEquipo.mutateAsync({ id: equipo.id, data })
      } else {
        await createEquipo.mutateAsync(data)
      }
      reset()
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Error al guardar equipo')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nombre">Nombre del Equipo *</Label>
        <Input
          id="nombre"
          {...register('nombre')}
          placeholder="Ej: Equipo A"
        />
        {errors.nombre && (
          <p className="text-sm text-destructive">{errors.nombre.message}</p>
        )}
      </div>

      <ImageUpload
        label="Escudo del Equipo"
        currentImage={watch('escudo') || undefined}
        onImageUploaded={(path) => setValue('escudo', path)}
        uploadEndpoint="/api/upload/equipo"
        entityId={equipo?.id}
      />
      {errors.escudo && (
        <p className="text-sm text-destructive">{errors.escudo.message}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="vidas">Vidas *</Label>
        <Input
          id="vidas"
          type="number"
          {...register('vidas', { valueAsNumber: true })}
          min="0"
          max="10"
        />
        {errors.vidas && (
          <p className="text-sm text-destructive">{errors.vidas.message}</p>
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
          <option value="eliminado">Eliminado</option>
          <option value="suspendido">Suspendido</option>
          <option value="descalificado">Descalificado</option>
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
            : equipo
            ? 'Actualizar Equipo'
            : 'Crear Equipo'}
        </Button>
        {equipo && (
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

