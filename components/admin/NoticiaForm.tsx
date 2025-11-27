'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { noticiaSchema, NoticiaFormData } from '@/lib/validations/noticia'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateNoticia, useUpdateNoticia, Noticia } from '@/lib/api/noticias'
import { useState } from 'react'

interface NoticiaFormProps {
  noticia?: Noticia
  onSuccess?: () => void
}

export function NoticiaForm({ noticia, onSuccess }: NoticiaFormProps) {
  const [error, setError] = useState<string>('')
  const createNoticia = useCreateNoticia()
  const updateNoticia = useUpdateNoticia()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<NoticiaFormData>({
    resolver: zodResolver(noticiaSchema),
    defaultValues: noticia
      ? {
          titulo: noticia.titulo,
          contenido: noticia.contenido || '',
          tipo: noticia.tipo,
          url: noticia.url || '',
          orden: noticia.orden,
        }
      : {
          titulo: '',
          contenido: '',
          tipo: 'informacion',
          url: '',
          orden: 0,
        },
  })

  const onSubmit = async (data: NoticiaFormData) => {
    setError('')
    try {
      if (noticia) {
        await updateNoticia.mutateAsync({ id: noticia.id, data })
      } else {
        await createNoticia.mutateAsync(data)
      }
      reset()
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || 'Error al guardar noticia')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="titulo">Título *</Label>
        <Input
          id="titulo"
          {...register('titulo')}
          placeholder="Ej: Nueva fecha del torneo"
        />
        {errors.titulo && (
          <p className="text-sm text-destructive">{errors.titulo.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contenido">Contenido</Label>
        <textarea
          id="contenido"
          {...register('contenido')}
          placeholder="Descripción o contenido de la noticia (opcional)"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          rows={3}
        />
        {errors.contenido && (
          <p className="text-sm text-destructive">{errors.contenido.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipo">Tipo de Noticia *</Label>
        <select
          id="tipo"
          {...register('tipo')}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="informacion">Información</option>
          <option value="urgente">Urgente</option>
          <option value="otra">Otra</option>
        </select>
        <p className="text-sm text-muted-foreground">
          El tipo determina el color del slide: Información (azul), Urgente (rojo), Otra (gris)
        </p>
        {errors.tipo && (
          <p className="text-sm text-destructive">{errors.tipo.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">URL de Destino</Label>
        <Input
          id="url"
          type="url"
          {...register('url')}
          placeholder="https://ejemplo.com (opcional)"
        />
        {errors.url && (
          <p className="text-sm text-destructive">{errors.url.message}</p>
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
          Menor número = aparece primero en el slide
        </p>
        {errors.orden && (
          <p className="text-sm text-destructive">{errors.orden.message}</p>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Guardando...'
            : noticia
            ? 'Actualizar Noticia'
            : 'Crear Noticia'}
        </Button>
        {noticia && (
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

