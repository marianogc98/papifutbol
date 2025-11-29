import NextImage from 'next/image'
import { cn } from '@/lib/utils'

interface CustomImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  rounded?: boolean
  square?: boolean
}

/**
 * Componente de imagen reutilizable con borde redondeado
 * Soporta imágenes de Cloudinary y rutas locales
 * @param rounded - Si es true, aplica borde redondeado (por defecto true)
 * @param square - Si es true, fuerza aspecto cuadrado (por defecto true)
 */
export function CustomImage({
  src,
  alt,
  width = 64,
  height = 64,
  className,
  rounded = true,
  square = true,
}: CustomImageProps) {
  // Si es una URL de Cloudinary o http, usar img normal
  // Si es una ruta local, usar Next.js Image
  const isExternal = src.startsWith('http') || src.startsWith('//')

  const imageClasses = cn(
    'object-contain',
    rounded && 'border rounded',
    square && 'aspect-square',
    className
  )

  if (isExternal) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={imageClasses}
      />
    )
  }

  return (
    <NextImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={imageClasses}
    />
  )
}

