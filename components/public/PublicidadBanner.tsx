'use client'

import { usePublicidades } from '@/lib/api/publicidades'
import Link from 'next/link'
import Image from 'next/image'

interface PublicidadBannerProps {
  posicion?: 'banner' | 'sidebar' | 'footer' | 'header'
  className?: string
}

export function PublicidadBanner({ posicion, className = '' }: PublicidadBannerProps) {
  // Sin parámetro, devuelve solo publicidades activas (comportamiento público)
  const { data: publicidades, isLoading } = usePublicidades()

  if (isLoading) {
    return null
  }

  // Filtrar por posición si se especifica
  const publicidadesFiltradas = posicion
    ? publicidades?.filter((p) => p.posicion === posicion) || []
    : publicidades || []

  if (publicidadesFiltradas.length === 0) {
    return null
  }

  return (
    <div className={className}>
      {publicidadesFiltradas.map((publicidad) => {
        // Determinar si es una imagen local (empieza con /) o una URL externa
        const esImagenLocal = publicidad.imagen?.startsWith('/')
        
        const contenido = (
          <div className="relative w-full">
            {publicidad.imagen ? (
              esImagenLocal ? (
                // Imagen local desde la carpeta public
                <Image
                  src={publicidad.imagen}
                  alt={publicidad.titulo}
                  width={800}
                  height={200}
                  className="w-full h-auto object-contain"
                  unoptimized
                />
              ) : (
                // URL externa
                <img
                  src={publicidad.imagen}
                  alt={publicidad.titulo}
                  className="w-full h-auto object-contain"
                />
              )
            ) : (
              <div className="bg-muted p-4 rounded text-center">
                <p className="text-sm font-medium">{publicidad.titulo}</p>
              </div>
            )}
          </div>
        )

        if (publicidad.url) {
          return (
            <Link
              key={publicidad.id}
              href={publicidad.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:opacity-90 transition-opacity"
            >
              {contenido}
            </Link>
          )
        }

        return <div key={publicidad.id}>{contenido}</div>
      })}
    </div>
  )
}

