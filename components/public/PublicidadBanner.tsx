'use client'

import { usePublicidades } from '@/lib/api/publicidades'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

interface PublicidadBannerProps {
  posicion?: 'banner' | 'footer' | 'sponsor'
  className?: string
}

export function PublicidadBanner({ posicion, className = '' }: PublicidadBannerProps) {
  const { data: publicidades, isLoading } = usePublicidades()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Filtrar por posición si se especifica
  const publicidadesFiltradas = posicion
    ? publicidades?.filter((p) => p.posicion === posicion) || []
    : publicidades || []

  // Ordenar por el campo 'orden'
  const publicidadesOrdenadas = [...publicidadesFiltradas].sort((a, b) => a.orden - b.orden)

  // Auto-play del slider cada 4 segundos
  useEffect(() => {
    if (!isAutoPlaying || publicidadesOrdenadas.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % publicidadesOrdenadas.length)
    }, 4000) // Cambia cada 4 segundos

    return () => clearInterval(interval)
  }, [isAutoPlaying, publicidadesOrdenadas.length])

  if (isLoading) {
    return null
  }

  if (publicidadesOrdenadas.length === 0) {
    return null
  }

  // Configuración de tamaños según la posición (según ESTRUCTURA_HOME.md)
  const getImageConfig = (pos: string | null) => {
    switch (pos) {
      case 'banner':
        return {
          width: 1600,
          height: 600,
          containerHeight: 'h-96 md:h-[500px]', // Móvil: 384px, Desktop: 500px
          className: 'w-full h-full object-cover rounded-xl',
          containerClass: 'w-full relative overflow-hidden rounded-xl'
        }
      case 'footer':
        return {
          width: 1600,
          height: 350,
          containerHeight: 'h-[228px] md:h-[260px]', // Móvil: 228px (128+100), Desktop: 260px (160+100)
          className: 'w-full h-full object-cover rounded-xl',
          containerClass: 'w-full relative overflow-hidden rounded-xl'
        }
      case 'sponsor':
        return {
          width: 300,
          height: 200,
          className: 'w-full h-auto object-contain max-h-32',
          containerClass: 'w-full'
        }
      default:
        return {
          width: 800,
          height: 200,
          className: 'w-full h-auto object-contain',
          containerClass: 'w-full'
        }
    }
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    // Reanudar auto-play después de 10 segundos
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const currentPublicidad = publicidadesOrdenadas[currentIndex]
  const config = getImageConfig(posicion || null)
  const esImagenLocal = currentPublicidad.imagen?.startsWith('/')

  const contenido = (
    <div className={config.containerClass}>
      {config.containerHeight && (
        <div className={config.containerHeight}>
          {currentPublicidad.imagen ? (
            esImagenLocal ? (
              <Image
                src={currentPublicidad.imagen}
                alt={currentPublicidad.titulo}
                width={config.width}
                height={config.height}
                className={config.className}
                unoptimized
              />
            ) : (
              <img
                src={currentPublicidad.imagen}
                alt={currentPublicidad.titulo}
                className={config.className}
              />
            )
          ) : (
            <div className="bg-muted p-4 rounded-xl text-center flex items-center justify-center h-full">
              <p className="text-sm font-medium">{currentPublicidad.titulo}</p>
            </div>
          )}
        </div>
      )}
      {!config.containerHeight && (
        <div className={config.containerClass}>
          {currentPublicidad.imagen ? (
            esImagenLocal ? (
              <Image
                src={currentPublicidad.imagen}
                alt={currentPublicidad.titulo}
                width={config.width}
                height={config.height}
                className={config.className}
                unoptimized
              />
            ) : (
              <img
                src={currentPublicidad.imagen}
                alt={currentPublicidad.titulo}
                className={config.className}
              />
            )
          ) : (
            <div className="bg-muted p-4 rounded text-center">
              <p className="text-sm font-medium">{currentPublicidad.titulo}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className={className}>
      {/* Contenido con link si tiene URL */}
      {currentPublicidad.url ? (
        <Link
          href={currentPublicidad.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:opacity-95 transition-opacity"
        >
          {contenido}
        </Link>
      ) : (
        contenido
      )}

      {/* Indicadores de navegación (solo para banner y footer con múltiples publicidades) */}
      {(posicion === 'banner' || posicion === 'footer') && publicidadesOrdenadas.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {publicidadesOrdenadas.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? 'w-8 bg-[#852024]' : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Ir a publicidad ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

