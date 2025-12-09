'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { publicidadSchema, PublicidadFormData } from '@/lib/validations/publicidad'
import { apiUrl } from '@/lib/utils/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageUpload } from '@/components/ui/image-upload'
import { useCreatePublicidad, useUpdatePublicidad, Publicidad } from '@/lib/api/publicidades'
import { useState } from 'react'

interface PublicidadFormProps {
  publicidad?: Publicidad
  onSuccess?: () => void
}

export function PublicidadForm({ publicidad, onSuccess }: PublicidadFormProps) {
  const [error, setError] = useState<string>('')
  const createPublicidad = useCreatePublicidad()
  const updatePublicidad = useUpdatePublicidad()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm<PublicidadFormData>({
    resolver: zodResolver(publicidadSchema),
    defaultValues: publicidad
      ? {
          titulo: publicidad.titulo,
          imagen: publicidad.imagen || '',
          url: publicidad.url || '',
          activa: publicidad.activa,
          posicion: (publicidad.posicion as any) || '',
          orden: publicidad.orden,
        }
      : {
          titulo: '',
          imagen: '',
          url: '',
          activa: true,
          posicion: '',
          orden: 0,
        },
  })

  const onSubmit = async (data: PublicidadFormData) => {
    setError('')
    try {
      if (publicidad) {
        await updatePublicidad.mutateAsync({ id: publicidad.id, data })
      } else {
        await createPublicidad.mutateAsync(data)
      }
      reset()
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Error al guardar publicidad')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="titulo">Título *</Label>
        <Input
          id="titulo"
          {...register('titulo')}
          placeholder="Ej: Promoción Especial"
        />
        {errors.titulo && (
          <p className="text-sm text-destructive">{errors.titulo.message}</p>
        )}
      </div>

      <ImageUpload
        label="Imagen de Publicidad"
        currentImage={watch('imagen') || undefined}
        onImageUploaded={(path) => setValue('imagen', path)}
        uploadEndpoint={apiUrl('api/upload/publicidad')}
        entityId={publicidad?.id}
      />
      {errors.imagen && (
        <p className="text-sm text-destructive">{errors.imagen.message}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="url">URL de Destino</Label>
        <Input
          id="url"
          type="url"
          {...register('url')}
          placeholder="https://ejemplo.com"
        />
        {errors.url && (
          <p className="text-sm text-destructive">{errors.url.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="posicion">Posición</Label>
        <select
          id="posicion"
          {...register('posicion')}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">Sin posición específica</option>
          <option value="banner">🥇 Oro - Banner (Hero en Home)</option>
          <option value="footer">🥈 Plata - Footer (Arriba del footer)</option>
          <option value="sponsor">🥉 Bronce - Sponsor (Página Sponsors)</option>
        </select>
        <p className="text-sm text-muted-foreground">
          <strong>Oro:</strong> Hero principal solo en página de inicio<br />
          <strong>Plata:</strong> Arriba del footer en todas las páginas<br />
          <strong>Bronce:</strong> Grid en página de sponsors
        </p>
        {errors.posicion && (
          <p className="text-sm text-destructive">{errors.posicion.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="orden">Orden *</Label>
        <Input
          id="orden"
          type="number"
          {...register('orden', { valueAsNumber: true })}
          min="0"
        />
        <p className="text-sm text-muted-foreground">
          Menor número = aparece primero
        </p>
        {errors.orden && (
          <p className="text-sm text-destructive">{errors.orden.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="activa"
          {...register('activa')}
          className="h-4 w-4 rounded border-gray-300"
        />
        <Label htmlFor="activa" className="cursor-pointer">
          Publicidad activa
        </Label>
      </div>
      {errors.activa && (
        <p className="text-sm text-destructive">{errors.activa.message}</p>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Guardando...'
            : publicidad
            ? 'Actualizar Publicidad'
            : 'Crear Publicidad'}
        </Button>
        {publicidad && (
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

