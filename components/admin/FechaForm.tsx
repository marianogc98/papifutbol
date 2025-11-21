'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { fechaSchema, FechaFormData } from '@/lib/validations/fecha'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateFecha, useUpdateFecha, Fecha } from '@/lib/api/fechas'
import { useState } from 'react'

interface FechaFormProps {
  fecha?: Fecha
  onSuccess?: () => void
}

export function FechaForm({ fecha, onSuccess }: FechaFormProps) {
  const [error, setError] = useState<string>('')
  const createFecha = useCreateFecha()
  const updateFecha = useUpdateFecha()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FechaFormData>({
    resolver: zodResolver(fechaSchema),
    defaultValues: fecha
      ? {
          numero: fecha.numero,
          nombre: fecha.nombre || '',
          fecha: fecha.fecha ? new Date(fecha.fecha).toISOString().split('T')[0] : '',
        }
      : {
          numero: 1,
          nombre: '',
          fecha: '',
        },
  })

  const onSubmit = async (data: FechaFormData) => {
    setError('')
    try {
      const submitData = {
        ...data,
        fecha: data.fecha instanceof Date 
          ? data.fecha 
          : data.fecha 
          ? new Date(data.fecha)
          : new Date(),
      }

      if (fecha) {
        await updateFecha.mutateAsync({ id: fecha.id, data: submitData })
      } else {
        await createFecha.mutateAsync(submitData)
      }
      reset()
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Error al guardar fecha')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="numero">Número de Fecha *</Label>
          <Input
            id="numero"
            type="number"
            {...register('numero', { valueAsNumber: true })}
            min="1"
          />
          {errors.numero && (
            <p className="text-sm text-destructive">{errors.numero.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre (opcional)</Label>
          <Input
            id="nombre"
            {...register('nombre')}
            placeholder="Ej: Fecha Inaugural"
          />
          {errors.nombre && (
            <p className="text-sm text-destructive">{errors.nombre.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fecha">Fecha *</Label>
        <Input
          id="fecha"
          type="date"
          {...register('fecha', {
            setValueAs: (value) => (value ? new Date(value) : undefined),
          })}
        />
        {errors.fecha && (
          <p className="text-sm text-destructive">{errors.fecha.message}</p>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Guardando...'
            : fecha
            ? 'Actualizar Fecha'
            : 'Crear Fecha'}
        </Button>
        {fecha && (
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

