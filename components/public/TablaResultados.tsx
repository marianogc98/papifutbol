'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { CustomImage } from '@/components/ui/Image'
import { formatDateTimeUTC } from '@/lib/utils/date'
import { ChevronRight, Icon } from 'lucide-react'
import { soccerBall } from '@lucide/lab'

import type { Partido } from '@/lib/api/partidos'

interface Goleador {
  nombre: string
  apellido: string
}

interface TablaResultadosProps {
  partidos: Partido[]
  titulo?: string
  mostrarVerTodos?: boolean
  onVerTodos?: () => void
  emptyMessage?: string
  equipoLocalId?: string
  equipoVisitanteId?: string
}

export function TablaResultados({
  partidos,
  titulo,
  mostrarVerTodos = false,
  onVerTodos,
  emptyMessage = 'No hay partidos disponibles',
}: TablaResultadosProps) {
  const formatDateTime = (dateString: string) => {
    return formatDateTimeUTC(dateString).split(' ')[1] // Solo la hora
  }

  const getGoleadores = (partido: Partido, equipoId: string) => {
    if (!partido.goles) return []
    return partido.goles
      .filter(g => g.equipoId === equipoId && !g.esAutogol)
      .map(g => ({
        nombre: g.jugador.nombre,
        apellido: g.jugador.apellido,
      }))
  }

  const mostrarResultado = (estado: string) => {
    return (
      estado === 'jugado' ||
      estado === 'jugando' ||
      estado === 'no_se_presento_local' ||
      estado === 'no_se_presento_visitante'
    )
  }

  const formatGoleadores = (goleadores: Goleador[]) => {
    const golesPorJugador = goleadores.reduce((acc, gol) => {
      const key = `${gol.nombre} ${gol.apellido}`
      if (!acc[key]) {
        acc[key] = { nombre: gol.nombre, apellido: gol.apellido, cantidad: 0 }
      }
      acc[key].cantidad++
      return acc
    }, {} as Record<string, { nombre: string; apellido: string; cantidad: number }>)

    return Object.values(golesPorJugador).map((jugador, idx, arr) => (
      <span key={idx}>
        {jugador.nombre?.[0]?.toUpperCase() || ''}. {jugador.apellido || ''}
        {jugador.cantidad > 1 && ` (${jugador.cantidad})`}
        {idx < arr.length - 1 && ', '}
      </span>
    ))
  }

  if (partidos.length === 0) {
    return (
      <div className="w-full">
        {titulo && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">{titulo}</h2>
          </div>
        )}
        <div className="bg-white border rounded-xl p-8 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      {titulo && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">{titulo}</h2>
          {mostrarVerTodos && onVerTodos && (
            <button
              onClick={onVerTodos}
              className="flex items-center gap-2 text-[#852024] hover:text-[#CA3F42] font-medium transition-colors"
            >
              Ver todos
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Vista Desktop */}
      <div className="hidden md:block bg-white border rounded-xl overflow-hidden shadow-lg">
        <table className="w-full">
          <thead className="bg-[#f3f3f3] border-b">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider w-20">
                Hora
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider w-64">
                Local
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider w-24">
                Resultado
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider w-64">
                Visitante
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider w-32">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {partidos.map((partido) => {
              const goleadoresLocal = getGoleadores(partido, partido.equipoLocalId)
              const goleadoresVisitante = getGoleadores(partido, partido.equipoVisitanteId)
              const mostrar = mostrarResultado(partido.estado)

              return (
                <tr key={partido.id} className="border-b hover:bg-[#f3f3f3] transition-colors">
                  <td className="px-6 py-4">
                    {partido.fechaHora ? (
                      <span className="text-sm font-medium">
                        {formatDateTime(partido.fechaHora)}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>

                  <td className="px-6 py-4 w-64">
                    <div className="flex flex-col gap-1">
                      <Link
                        href={`/equipo/${partido.equipoLocal?.slug || partido.equipoLocal?.id}`}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity w-fit group"
                      >
                        {partido.equipoLocal?.escudo && (
                          <CustomImage
                            src={partido.equipoLocal.escudo}
                            alt={partido.equipoLocal.nombre}
                            width={40}
                            height={40}
                          />
                        )}
                        <span className="font-medium group-hover:text-[#852024] transition-colors">
                          {partido.equipoLocal?.nombre}
                        </span>
                      </Link>
                      {goleadoresLocal.length > 0 && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 min-w-0">
                          <Icon iconNode={soccerBall} className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{formatGoleadores(goleadoresLocal)}</span>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    {mostrar ? (
                      <span className="font-bold text-2xl">
                        {partido.golesLocal} - {partido.golesVisitante}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">vs</span>
                    )}
                  </td>

                  <td className="px-6 py-4 w-64">
                    <div className="flex flex-col gap-1 items-end">
                      <Link
                        href={`/equipo/${partido.equipoVisitante?.slug || partido.equipoVisitante?.id}`}
                        className="flex items-center gap-3 justify-end hover:opacity-80 transition-opacity w-fit group"
                      >
                        <span className="font-medium group-hover:text-[#852024] transition-colors">
                          {partido.equipoVisitante?.nombre}
                        </span>
                        {partido.equipoVisitante?.escudo && (
                          <CustomImage
                            src={partido.equipoVisitante.escudo}
                            alt={partido.equipoVisitante.nombre}
                            width={40}
                            height={40}
                          />
                        )}
                      </Link>
                      {goleadoresVisitante.length > 0 && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 justify-end min-w-0 max-w-full">
                          <span className="truncate text-right">{formatGoleadores(goleadoresVisitante)}</span>
                          <Icon iconNode={soccerBall} className="w-3 h-3 flex-shrink-0" />
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    {partido.estado === 'jugando' && (
                      <span className="w-2 h-2 bg-green-700 rounded-full inline-block animate-pulse"></span>

                    )}
                    {partido.estado === 'jugado' && (
                      <Badge className="bg-muted hover:bg-muted/80 text-black">
                        Finalizado
                      </Badge>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Vista Mobile */}
      <div className="md:hidden space-y-4">
        {partidos.map((partido) => {
          const goleadoresLocal = getGoleadores(partido, partido.equipoLocalId)
          const goleadoresVisitante = getGoleadores(partido, partido.equipoVisitanteId)
          const mostrar = mostrarResultado(partido.estado)

          return (
            <div key={partido.id} className="bg-white border rounded-xl p-4 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium">
                  {partido.fechaHora ? formatDateTime(partido.fechaHora) : '-'}
                </span>
                {partido.estado === 'jugando' && (
                  <span className="w-1.5 h-1.5 bg-white rounded-full mr-1 inline-block animate-pulse"></span>

                )}
                {partido.estado === 'jugado' && (
                  <Badge className="bg-muted hover:bg-muted/80 text-xs text-black">
                    Finalizado
                  </Badge>
                )}
              </div>

              <div className="flex items-start justify-between mb-2">
                <Link
                  href={`/equipo/${partido.equipoLocal?.slug || partido.equipoLocal?.id}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-1"
                >
                  {partido.equipoLocal?.escudo && (
                    <CustomImage
                      src={partido.equipoLocal.escudo}
                      alt={partido.equipoLocal.nombre}
                      width={36}
                      height={36}
                      className="flex-shrink-0"
                    />
                  )}
                  <span className="font-medium text-sm">{partido.equipoLocal?.nombre}</span>
                </Link>
                {mostrar && (
                  <span className="font-bold text-xl ml-2">{partido.golesLocal}</span>
                )}
              </div>

              {goleadoresLocal.length > 0 && (
                <div className="text-xs text-muted-foreground ml-11 mb-3 flex items-center gap-1.5">
                  <Icon iconNode={soccerBall} className="w-3 h-3 flex-shrink-0" />
                  <span>{formatGoleadores(goleadoresLocal)}</span>
                </div>
              )}

              <div className="flex items-start justify-between mb-2">
                <Link
                  href={`/equipo/${partido.equipoVisitante?.slug || partido.equipoVisitante?.id}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-1"
                >
                  {partido.equipoVisitante?.escudo && (
                    <CustomImage
                      src={partido.equipoVisitante.escudo}
                      alt={partido.equipoVisitante.nombre}
                      width={36}
                      height={36}
                      className="flex-shrink-0"
                    />
                  )}
                  <span className="font-medium text-sm">{partido.equipoVisitante?.nombre}</span>
                </Link>
                {mostrar && (
                  <span className="font-bold text-xl ml-2">{partido.golesVisitante}</span>
                )}
              </div>

              {goleadoresVisitante.length > 0 && (
                <div className="text-xs text-muted-foreground ml-11 flex items-center gap-1.5">
                  <Icon iconNode={soccerBall} className="w-3 h-3 flex-shrink-0" />
                  <span>{formatGoleadores(goleadoresVisitante)}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

