'use client'

import { useState, useMemo, useEffect } from 'react'
import { useFechas } from '@/lib/api/fechas'
import { usePartidos } from '@/lib/api/partidos'
import { TablaResultados } from '@/components/public/TablaResultados'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { tableStyles } from '@/lib/constants/tableStyles'

interface TablaUltimaFechaProps {
  soloConPartidos?: boolean // Si true, solo muestra fechas con partidos (comportamiento home)
  ordenAscendente?: boolean // Si true, ordena ascendente (1,2,3...), si false descendente (3,2,1...)
  layoutCentrado?: boolean // Si true, título centrado con flechas a los lados, si false título a la izquierda
}

export function TablaUltimaFecha({ 
  soloConPartidos = true, 
  ordenAscendente = false,
  layoutCentrado = false 
}: TablaUltimaFechaProps = {}) {
  const { data: fechas, isLoading: fechasLoading } = useFechas()
  // Obtener todos los partidos (no solo los jugados) para mostrar también los que están "jugando"
  const { data: todosPartidos, isLoading: partidosLoading } = usePartidos()
  const [fechaIndex, setFechaIndex] = useState(0)

  // Función para calcular el viernes relevante según el día de la semana
  const calcularViernesRelevante = () => {
    const hoy = new Date()
    const diaSemana = hoy.getDay() // 0=domingo, 1=lunes, ..., 5=viernes, 6=sábado
    
    // Obtener componentes de fecha local
    const año = hoy.getFullYear()
    const mes = hoy.getMonth()
    const dia = hoy.getDate()
    
    let viernesRelevante: Date
    
    // Viernes, sábado, domingo, lunes: mostrar el último viernes pasado
    if (diaSemana === 5 || diaSemana === 6 || diaSemana === 0 || diaSemana === 1) {
      // Último viernes pasado
      if (diaSemana === 5) {
        // Si es viernes, mostrar el viernes pasado (hace 7 días)
        viernesRelevante = new Date(año, mes, dia - 7)
      } else if (diaSemana === 6) {
        // Si es sábado, mostrar el viernes pasado (hace 1 día)
        viernesRelevante = new Date(año, mes, dia - 1)
      } else if (diaSemana === 0) {
        // Si es domingo, mostrar el viernes pasado (hace 2 días)
        viernesRelevante = new Date(año, mes, dia - 2)
      } else {
        // Si es lunes, mostrar el viernes pasado (hace 3 días)
        viernesRelevante = new Date(año, mes, dia - 3)
      }
    } else {
      // Martes, miércoles, jueves: mostrar el próximo viernes
      const diasHastaViernes = 5 - diaSemana // Días a avanzar para llegar al viernes
      viernesRelevante = new Date(año, mes, dia + diasHastaViernes)
    }
    
    // Normalizar a UTC 00:00:00 para comparar solo la fecha
    // Usar los componentes de fecha local para crear la fecha UTC
    const añoUTC = viernesRelevante.getFullYear()
    const mesUTC = viernesRelevante.getMonth()
    const diaUTC = viernesRelevante.getDate()
    return new Date(Date.UTC(añoUTC, mesUTC, diaUTC, 0, 0, 0))
  }

  // Calcular el viernes relevante
  const viernesRelevante = useMemo(() => calcularViernesRelevante(), [])

  // Obtener fechas ordenadas y filtradas según las props
  const fechasConPartidos = useMemo(() => {
    if (!fechas) return []

    // Ordenar fechas según la prop ordenAscendente
    const fechasOrdenadas = [...fechas].sort((a, b) => 
      ordenAscendente ? a.numero - b.numero : b.numero - a.numero
    )

    if (soloConPartidos) {
      // Filtrar solo las fechas que tienen partidos
      if (!todosPartidos || todosPartidos.length === 0) return []
      
      const fechasConPartidos = fechasOrdenadas
        .map(fecha => {
          const partidosDeFecha = todosPartidos.filter(p => p.fechaId === fecha.id)
          if (partidosDeFecha.length > 0) {
            // Ordenar partidos por fechaHora (del más temprano al más tarde)
            const partidosOrdenados = [...partidosDeFecha].sort((a, b) => {
              // Si ambos tienen fechaHora, comparar por fechaHora
              if (a.fechaHora && b.fechaHora) {
                return new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
              }
              // Si solo uno tiene fechaHora, el que tiene fechaHora va primero
              if (a.fechaHora && !b.fechaHora) return -1
              if (!a.fechaHora && b.fechaHora) return 1
              // Si ninguno tiene fechaHora, mantener orden original
              return 0
            })
            return { fecha, partidos: partidosOrdenados }
          }
          return null
        })
        .filter((item): item is { fecha: typeof fechas[0], partidos: typeof todosPartidos } => item !== null)

      return fechasConPartidos
    } else {
      // Mostrar todas las fechas, incluso sin partidos
      return fechasOrdenadas.map(fecha => {
        const partidosDeFecha = todosPartidos?.filter(p => p.fechaId === fecha.id) || []
        // Ordenar partidos por fechaHora (del más temprano al más tarde)
        const partidosOrdenados = [...partidosDeFecha].sort((a, b) => {
          if (a.fechaHora && b.fechaHora) {
            return new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
          }
          if (a.fechaHora && !b.fechaHora) return -1
          if (!a.fechaHora && b.fechaHora) return 1
          return 0
        })
        return { fecha, partidos: partidosOrdenados }
      })
    }
  }, [fechas, todosPartidos, soloConPartidos, ordenAscendente])

  // Establecer el índice inicial según el viernes relevante
  useEffect(() => {
    if (fechasConPartidos.length === 0) return

    // Buscar la fecha más cercana al viernes relevante
    let indiceMasCercano = 0
    let menorDiferencia = Infinity

    fechasConPartidos.forEach((item, index) => {
      const fechaFecha = new Date(item.fecha.fecha)
      fechaFecha.setUTCHours(0, 0, 0, 0)
      
      const diferencia = Math.abs(fechaFecha.getTime() - viernesRelevante.getTime())
      
      if (diferencia < menorDiferencia) {
        menorDiferencia = diferencia
        indiceMasCercano = index
      }
    })

    setFechaIndex(indiceMasCercano)
  }, [fechasConPartidos, viernesRelevante])

  // Obtener la fecha actual seleccionada
  const fechaActual = fechasConPartidos[fechaIndex] || null
  const fechaAnterior = fechaIndex > 0 ? fechasConPartidos[fechaIndex - 1] : null
  const fechaSiguiente = fechaIndex < fechasConPartidos.length - 1 ? fechasConPartidos[fechaIndex + 1] : null

  const handleAnterior = () => {
    if (fechaAnterior) {
      setFechaIndex(fechaIndex - 1)
    }
  }

  const handleSiguiente = () => {
    if (fechaSiguiente) {
      setFechaIndex(fechaIndex + 1)
    }
  }

  if (fechasLoading || partidosLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">Cargando fechas...</p>
      </div>
    )
  }

  if (!fechaActual || fechasConPartidos.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">
          {soloConPartidos ? 'No hay fechas con partidos cargados' : 'No hay fechas registradas'}
        </p>
      </div>
    )
  }

  const { fecha, partidos } = fechaActual

  if (layoutCentrado) {
    return (
      <div className="space-y-4">
        {/* Mobile: mismo layout que home (título izquierda, flechas derecha) */}
        <div className="md:hidden flex items-center justify-between gap-4">
          <div>
            <h2 className={`${tableStyles.text.title.mobile} font-bold ${tableStyles.colors.primary}`}>
              {fecha.nombre || `Fecha ${fecha.numero}`}
            </h2>
            {fechasConPartidos.length > 1 && (
              <p className={`${tableStyles.text.content.mobile} ${tableStyles.colors.muted} mt-1`}>
                {fechaIndex + 1} de {fechasConPartidos.length}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAnterior}
              disabled={!fechaAnterior}
              className="h-10 w-10 flex-shrink-0"
              aria-label="Fecha anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSiguiente}
              disabled={!fechaSiguiente}
              className="h-10 w-10 flex-shrink-0"
              aria-label="Fecha siguiente"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
        {/* Desktop: layout centrado */}
        <div className="hidden md:block mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAnterior}
              disabled={!fechaAnterior}
              className="h-10 w-10 flex-shrink-0"
              aria-label="Fecha anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="flex-1 text-center">
              <h1 className={`${tableStyles.text.title.desktop} font-bold ${tableStyles.colors.primary} mb-2 inline-block`}>
                {fecha.nombre || `Fecha ${fecha.numero}`}
              </h1>
              {fechasConPartidos.length > 1 && (
                <p className={`${tableStyles.text.content.mobile} ${tableStyles.colors.muted} mt-2`}>
                  {fecha.numero} de {fechasConPartidos.length}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSiguiente}
              disabled={!fechaSiguiente}
              className="h-10 w-10 flex-shrink-0"
              aria-label="Fecha siguiente"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
        <TablaResultados
          partidos={partidos}
          titulo=""
          emptyMessage="No hay partidos para esta fecha"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className={`${tableStyles.text.title.mobile} md:${tableStyles.text.title.desktop} font-bold ${tableStyles.colors.primary}`}>
            {fecha.nombre || `Fecha ${fecha.numero}`}
          </h2>
          {fechasConPartidos.length > 1 && (
            <p className={`${tableStyles.text.content.mobile} ${tableStyles.colors.muted} mt-1`}>
              {fechaIndex + 1} de {fechasConPartidos.length}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAnterior}
            disabled={!fechaAnterior}
            className="h-10 w-10 flex-shrink-0"
            aria-label="Fecha anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSiguiente}
            disabled={!fechaSiguiente}
            className="h-10 w-10 flex-shrink-0"
            aria-label="Fecha siguiente"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
      <TablaResultados
        partidos={partidos}
        titulo=""
        emptyMessage="No hay partidos para esta fecha"
      />
    </div>
  )
}
