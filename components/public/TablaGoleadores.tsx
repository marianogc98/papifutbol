'use client'

import { useState } from 'react'
import { useGoleadores } from '@/lib/api/goleadores'
import Link from 'next/link'
import { CustomImage } from '@/components/ui/Image'
import { ChevronDown } from 'lucide-react'
import { tableStyles } from '@/lib/constants/tableStyles'
import { Loader } from '@/components/ui/loader'

interface TablaGoleadoresProps {
  mostrarTodos?: boolean
}

export function TablaGoleadores({ mostrarTodos = false }: TablaGoleadoresProps = {}) {
  const { data: goleadores, isLoading, error } = useGoleadores()
  const [goleadoresMostrados, setGoleadoresMostrados] = useState(5)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-destructive">Error al cargar la tabla de goleadores</p>
      </div>
    )
  }

  if (!goleadores || goleadores.length === 0) {
    return null
  }

  // Ordenar por total de goles (descendente)
  const goleadoresOrdenados = [...goleadores].sort((a, b) => b.totalGoles - a.totalGoles)

  const goleadoresAMostrar = mostrarTodos ? goleadoresOrdenados : goleadoresOrdenados.slice(0, goleadoresMostrados)
  const hayMasGoleadores = !mostrarTodos && goleadoresMostrados < goleadoresOrdenados.length

  const cargarMas = () => {
    setGoleadoresMostrados(prev => Math.min(prev + 5, goleadoresOrdenados.length))
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <h2 className={`${tableStyles.text.title.mobile} md:${tableStyles.text.title.desktop} font-bold ${tableStyles.colors.primary}`}>
          Goleadores
        </h2>
      </div>

      {/* Vista Desktop */}
      <div className={`hidden md:block ${tableStyles.backgrounds.table} ${tableStyles.borders.table} overflow-hidden ${tableStyles.shadows.table}`}>
        <table className="w-full">
          <thead className={`${tableStyles.backgrounds.header} ${tableStyles.borders.row}`}>
            <tr>
              <th className={`${tableStyles.padding.header.desktop} text-center ${tableStyles.text.header.desktop} font-medium ${tableStyles.colors.secondary} uppercase w-16`}>Pos</th>
              <th className={`${tableStyles.padding.header.desktop} text-left ${tableStyles.text.header.desktop} font-medium ${tableStyles.colors.secondary} uppercase`}>Jugador</th>
              <th className={`${tableStyles.padding.header.desktop} text-left ${tableStyles.text.header.desktop} font-medium ${tableStyles.colors.secondary} uppercase`}>Equipo</th>
              <th className={`${tableStyles.padding.header.desktop} text-center ${tableStyles.text.header.desktop} font-medium ${tableStyles.colors.secondary} uppercase w-20`}>Goles</th>
            </tr>
          </thead>
          <tbody>
            {goleadoresAMostrar.map((goleador, index) => (
              <tr key={goleador.jugador.id} className={`${tableStyles.borders.row} ${tableStyles.backgrounds.hover} transition-colors`}>
                <td className={`${tableStyles.padding.cell.desktop} text-center`}>
                  <span className={`${tableStyles.text.content.desktop} font-bold ${tableStyles.colors.secondary}`}>{index + 1}</span>
                </td>
                <td className={tableStyles.padding.cell.desktop}>
                  <div className={`font-medium ${tableStyles.colors.primary} ${tableStyles.text.content.desktop}`}>
                    {goleador.jugador.nombre} {goleador.jugador.apellido}
                  </div>
                </td>
                <td className={tableStyles.padding.cell.desktop}>
                  {goleador.jugador.equipo ? (
                    <Link
                      href={`/equipo/${goleador.jugador.equipo.slug || goleador.jugador.equipo.id}`}
                      className="flex items-center gap-2 hover:underline group"
                    >
                      {goleador.jugador.equipo.escudo && (
                        <CustomImage
                          src={goleador.jugador.equipo.escudo}
                          alt={goleador.jugador.equipo.nombre}
                          width={24}
                          height={24}
                        />
                      )}
                      <span className={`${tableStyles.text.content.desktop} ${tableStyles.colors.secondary} group-hover:text-[#852024] transition-colors`}>
                        {goleador.jugador.equipo.nombre}
                      </span>
                    </Link>
                  ) : (
                    <span className={`${tableStyles.text.content.desktop} ${tableStyles.colors.muted}`}>Sin equipo</span>
                  )}
                </td>
                <td className={`${tableStyles.padding.cell.desktop} text-center`}>
                  <span className={`${tableStyles.text.highlighted.desktop} font-bold ${tableStyles.colors.highlighted}`}>
                    {goleador.totalGoles}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista Mobile */}
      <div className="md:hidden space-y-2">
        {goleadoresAMostrar.map((goleador, index) => (
          <div key={goleador.jugador.id} className={`${tableStyles.backgrounds.table} ${tableStyles.borders.table} ${tableStyles.shadows.card} overflow-hidden`}>
            {/* Fila Principal */}
            <div className="flex items-center gap-3 p-3">
              {/* Posición */}
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                <span className={`${tableStyles.text.content.mobile} font-bold ${tableStyles.colors.secondary}`}>{index + 1}</span>
              </div>

              {/* Escudo */}
              {goleador.jugador.equipo?.escudo && (
                <CustomImage
                  src={goleador.jugador.equipo.escudo}
                  alt={goleador.jugador.equipo.nombre}
                  width={40}
                  height={40}
                  className="flex-shrink-0"
                />
              )}

              {/* Info Jugador */}
              <div className="flex-1 min-w-0">
                <div className={`font-semibold ${tableStyles.text.content.mobile} ${tableStyles.colors.primary} truncate`}>
                  {goleador.jugador.nombre} {goleador.jugador.apellido}
                </div>
                {goleador.jugador.equipo ? (
                  <Link
                    href={`/equipo/${goleador.jugador.equipo.slug || goleador.jugador.equipo.id}`}
                    className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.secondary} hover:text-[#852024] transition-colors truncate block`}
                  >
                    {goleador.jugador.equipo.nombre}
                  </Link>
                ) : (
                  <div className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.muted}`}>
                    Sin equipo
                  </div>
                )}
              </div>

              {/* Goles Destacados */}
              <div className="flex-shrink-0 flex items-center justify-center">
                <span className={`${tableStyles.text.highlighted.mobile} font-bold ${tableStyles.colors.highlighted}`}>{goleador.totalGoles}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botón Cargar Más */}
      {hayMasGoleadores && (
        <button
          onClick={cargarMas}
          className="w-full mt-4 py-3 bg-transparent text-slate-600 rounded-lg font-medium flex items-center justify-center gap-2"
        >
          Ver más goleadores
          <ChevronDown className="w-5 h-5" />
        </button>
      )}


    </div>
  )
}
