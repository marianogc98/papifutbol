'use client'

import { useNoticias } from '@/lib/api/noticias'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function NoticiasSlide() {
  const { data: noticias, isLoading } = useNoticias()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Obtener todas las noticias (ya no filtramos por activa ni imagen)
  const noticiasList = noticias || []

  // Auto-play del slide
  useEffect(() => {
    if (!isAutoPlaying || noticiasList.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % noticiasList.length)
    }, 5000) // Cambia cada 5 segundos

    return () => clearInterval(interval)
  }, [isAutoPlaying, noticiasList.length])

  // Función para obtener el color según el tipo (con transparencia, estilo toast)
  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'urgente':
        return { gradient: 'from-red-500/40 via-red-400/35 to-red-500/40', border: 'border-red-500/30' }
      case 'informacion':
        return { gradient: 'from-blue-500/40 via-blue-400/35 to-blue-500/40', border: 'border-blue-500/30' }
      case 'otra':
        return { gradient: 'from-gray-500/40 via-gray-400/35 to-gray-500/40', border: 'border-gray-500/30' }
      default:
        return { gradient: 'from-gray-500/40 via-gray-400/35 to-gray-500/40', border: 'border-gray-500/30' }
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'urgente':
        return 'URGENTE'
      case 'informacion':
        return 'INFORMACIÓN'
      case 'otra':
        return 'NOTICIA'
      default:
        return 'NOTICIA'
    }
  }

  // No mostrar nada mientras carga o si no hay noticias
  if (isLoading || noticiasList.length === 0) {
    return null
  }

  const currentNoticia = noticiasList[currentIndex]
  const tipoColors = getTipoColor(currentNoticia.tipo)
  const tipoLabel = getTipoLabel(currentNoticia.tipo)

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    // Reanudar auto-play después de 10 segundos
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? noticiasList.length - 1 : prev - 1
    )
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % noticiasList.length)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  const contenido = (
    <div className={`relative w-full rounded-lg border ${tipoColors.border} shadow-md overflow-hidden bg-gradient-to-r ${tipoColors.gradient} backdrop-blur-sm`}>
      {/* Contenido de la noticia */}
      <div className="flex items-start gap-3 p-4 md:p-5">
        {/* Badge del tipo 
        <div className="flex-shrink-0">
          <span className={`px-2.5 py-1 rounded-md text-white text-xs font-semibold uppercase ${
            currentNoticia.tipo === 'urgente' ? 'bg-red-600/80' :
            currentNoticia.tipo === 'informacion' ? 'bg-blue-600/80' :
            'bg-gray-600/80'
          }`}>
            {tipoLabel}
          </span>
        </div>
        */}
        {/* Título y contenido */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg font-semibold mb-1 text-white drop-shadow-sm">
            {currentNoticia.titulo}
          </h3>
          {currentNoticia.contenido && (
            <p className="text-sm text-white/90 drop-shadow-sm line-clamp-2">
              {currentNoticia.contenido}
            </p>
          )}
        </div>
      </div>

      {/* Botones de navegación */}
      {noticiasList.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm rounded-full"
            onClick={goToPrevious}
            aria-label="Noticia anterior"
          >
            <span className="text-sm">←</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-black/30 hover:bg-black/50 text-white backdrop-blur-sm rounded-full"
            onClick={goToNext}
            aria-label="Siguiente noticia"
          >
            <span className="text-sm">→</span>
          </Button>
        </>
      )}
    </div>
  )

  return (
    <div className="w-full space-y-4">
      {currentNoticia.url ? (
        <Link href={currentNoticia.url} className="block hover:opacity-95 transition-opacity">
          {contenido}
        </Link>
      ) : (
        contenido
      )}

      {/* Indicadores de slide */}
      {noticiasList.length > 1 && (
        <div className="flex justify-center gap-2">
          {noticiasList.map((noticia, index) => {
            const isActive = index === currentIndex
            const getIndicatorColor = () => {
              if (!isActive) return 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              
              switch (noticia.tipo) {
                case 'urgente':
                  return 'bg-red-600'
                case 'informacion':
                  return 'bg-blue-600'
                case 'otra':
                  return 'bg-gray-600'
                default:
                  return 'bg-gray-600'
              }
            }
            
            return (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  isActive ? 'w-8' : 'w-2'
                } ${getIndicatorColor()}`}
                aria-label={`Ir a noticia ${index + 1}`}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

