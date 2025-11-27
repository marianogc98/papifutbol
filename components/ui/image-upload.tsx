'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Image from 'next/image'

interface ImageUploadProps {
  label?: string
  currentImage?: string | null
  onImageUploaded: (path: string) => void
  uploadEndpoint: string
  entityId?: string
  accept?: string
  maxSizeMB?: number
}

export function ImageUpload({
  label = 'Imagen',
  currentImage,
  onImageUploaded,
  uploadEndpoint,
  entityId,
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')

    // Validar tamaño
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`)
      return
    }

    // Validar tipo
    if (!accept.split(',').some((type) => file.type === type.trim())) {
      setError('Tipo de archivo no permitido. Use JPG, PNG o WebP')
      return
    }

    // Crear preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Subir archivo
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (entityId) {
        // Determinar el tipo de entidad basado en el endpoint
        if (uploadEndpoint.includes('equipo')) {
          formData.append('equipoId', entityId)
        } else if (uploadEndpoint.includes('jugador')) {
          formData.append('jugadorId', entityId)
        } else if (uploadEndpoint.includes('publicidad')) {
          formData.append('publicidadId', entityId)
        }
      }

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al subir imagen')
      }

      const data = await response.json()
      onImageUploaded(data.path)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Error al subir imagen')
      setPreview(currentImage || null)
    } finally {
      setUploading(false)
      // Resetear input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onImageUploaded('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {preview && (
        <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-muted">
          {preview.startsWith('http') || preview.startsWith('/') ? (
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Subiendo...' : preview ? 'Cambiar Imagen' : 'Subir Imagen'}
        </Button>
        
        {preview && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            disabled={uploading}
          >
            Eliminar
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <p className="text-xs text-muted-foreground">
        Formatos permitidos: JPG, PNG, WebP. Tamaño máximo: {maxSizeMB}MB
      </p>
    </div>
  )
}

