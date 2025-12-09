'use client'

import { useState } from 'react'
import { useTabla } from '@/lib/api/tabla'
import Link from 'next/link'
import { CustomImage } from '@/components/ui/Image'
import { ChevronDown } from 'lucide-react'
import { tableStyles } from '@/lib/constants/tableStyles'
import { Loader } from '@/components/ui/loader'

interface TablaPosicionesProps {
  mostrarTodos?: boolean
}

export function TablaPosiciones({ mostrarTodos = false }: TablaPosicionesProps = {}) {
  const { data: tabla, isLoading, error } = useTabla()
  const [equiposMostrados, setEquiposMostrados] = useState(5)

  const getVidasColor = (vidas: number) => {
    if (vidas >= 2) return 'text-green-600'
    if (vidas === 1) return 'text-orange-600'
    return 'text-red-600'
  }

  const getVidasBgColor = (vidas: number) => {
    if (vidas >= 2) return 'bg-green-100 border-green-300'
    if (vidas === 1) return 'bg-orange-100 border-orange-300'
    return 'bg-red-100 border-red-300'
  }

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
        <p className="text-destructive">Error al cargar la tabla de equipos</p>
      </div>
    )
  }

  if (!tabla || tabla.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className={`${tableStyles.text.title.mobile} md:${tableStyles.text.title.desktop} font-bold ${tableStyles.colors.primary}`}>Posiciones</h2>
        </div>
        <div className={`${tableStyles.backgrounds.table} ${tableStyles.borders.table} p-8 text-center`}>
          <p className={tableStyles.colors.muted}>No hay equipos en la tabla</p>
        </div>
      </div>
    )
  }

  // Ordenar por vidas (mayor a menor), luego por puntos
  const equiposOrdenados = [...tabla].sort((a, b) => {
    if (b.vidas !== a.vidas) return b.vidas - a.vidas
    // Calcular puntos: victorias * 3 + empates
    const puntosA = a.victorias * 3 + a.empates
    const puntosB = b.victorias * 3 + b.empates
    return puntosB - puntosA
  })

  const equiposAMostrar = mostrarTodos ? equiposOrdenados : equiposOrdenados.slice(0, equiposMostrados)
  const hayMasEquipos = !mostrarTodos && equiposMostrados < equiposOrdenados.length

  const cargarMas = () => {
    setEquiposMostrados(prev => Math.min(prev + 5, equiposOrdenados.length))
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className={`${tableStyles.text.title.mobile} md:${tableStyles.text.title.desktop} font-bold ${tableStyles.colors.primary}`}>Posiciones</h2>
      </div>

      {/* Vista Desktop */}
      <div className={`hidden md:block ${tableStyles.backgrounds.table} ${tableStyles.borders.table} overflow-hidden ${tableStyles.shadows.table}`}>
        <table className="w-full">
          <thead className={`${tableStyles.backgrounds.header} ${tableStyles.borders.row}`}>
            <tr>
              <th className={`${tableStyles.padding.header.desktop} text-left ${tableStyles.text.header.desktop} font-medium ${tableStyles.colors.secondary} uppercase`}>Equipo</th>
              <th className={`${tableStyles.padding.header.desktop} text-center ${tableStyles.text.header.desktop} font-medium ${tableStyles.colors.secondary} uppercase w-20`}>Vidas</th>
              <th className={`${tableStyles.padding.header.desktop} text-center ${tableStyles.text.header.desktop} font-medium ${tableStyles.colors.secondary} uppercase w-16`}>PJ</th>
              <th className={`${tableStyles.padding.header.desktop} text-center ${tableStyles.text.header.desktop} font-medium ${tableStyles.colors.secondary} uppercase w-16`}>G</th>
              <th className={`${tableStyles.padding.header.desktop} text-center ${tableStyles.text.header.desktop} font-medium ${tableStyles.colors.secondary} uppercase w-16`}>E</th>
              <th className={`${tableStyles.padding.header.desktop} text-center ${tableStyles.text.header.desktop} font-medium ${tableStyles.colors.secondary} uppercase w-16`}>P</th>
              <th className={`${tableStyles.padding.header.desktop} text-center ${tableStyles.text.header.desktop} font-medium ${tableStyles.colors.secondary} uppercase w-16`}>GF</th>
              <th className={`${tableStyles.padding.header.desktop} text-center ${tableStyles.text.header.desktop} font-medium ${tableStyles.colors.secondary} uppercase w-16`}>GC</th>
              <th className={`${tableStyles.padding.header.desktop} text-center ${tableStyles.text.header.desktop} font-medium ${tableStyles.colors.secondary} uppercase w-16`}>DIF</th>
            </tr>
          </thead>
          <tbody>
            {equiposAMostrar.map((equipo) => {
              return (
                <tr 
                  key={equipo.id} 
                  className={`${tableStyles.borders.row} ${tableStyles.backgrounds.hover} transition-colors ${equipo.vidas === 0 ? 'opacity-50' : ''}`}
                >
                  <td className={tableStyles.padding.cell.desktop}>
                    <Link
                      href={`/equipo/${equipo.slug}`}
                      className="flex items-center gap-3 hover:underline group"
                    >
                      {equipo.escudo && (
                        <CustomImage
                          src={equipo.escudo}
                          alt={equipo.nombre}
                          width={32}
                          height={32}
                        />
                      )}
                      <span className={`font-medium ${tableStyles.colors.primary} group-hover:text-[#852024] transition-colors ${tableStyles.text.content.desktop}`}>
                        {equipo.nombre}
                      </span>
                      {equipo.vidas === 0 && (
                        <span className={`${tableStyles.text.secondary.desktop} bg-red-100 text-red-700 px-2 py-0.5 rounded`}>
                          Eliminado
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className={`${tableStyles.padding.cell.desktop} text-center`}>
                    <span className={`${tableStyles.text.highlighted.desktop} font-bold ${getVidasColor(equipo.vidas)}`}>
                      {equipo.vidas}
                    </span>
                  </td>
                  <td className={`${tableStyles.padding.cell.desktop} text-center ${tableStyles.text.content.desktop} ${tableStyles.colors.secondary}`}>{equipo.partidosJugados}</td>
                  <td className={`${tableStyles.padding.cell.desktop} text-center ${tableStyles.text.content.desktop} ${tableStyles.colors.secondary}`}>{equipo.victorias}</td>
                  <td className={`${tableStyles.padding.cell.desktop} text-center ${tableStyles.text.content.desktop} ${tableStyles.colors.secondary}`}>{equipo.empates}</td>
                  <td className={`${tableStyles.padding.cell.desktop} text-center ${tableStyles.text.content.desktop} ${tableStyles.colors.secondary}`}>{equipo.derrotas}</td>
                  <td className={`${tableStyles.padding.cell.desktop} text-center ${tableStyles.text.content.desktop} ${tableStyles.colors.secondary}`}>{equipo.golesAFavor}</td>
                  <td className={`${tableStyles.padding.cell.desktop} text-center ${tableStyles.text.content.desktop} ${tableStyles.colors.secondary}`}>{equipo.golesEnContra}</td>
                  <td className={`${tableStyles.padding.cell.desktop} text-center`}>
                    <span className={`${tableStyles.text.content.desktop} font-semibold ${equipo.diferencia > 0 ? tableStyles.colors.positive : equipo.diferencia < 0 ? tableStyles.colors.negative : tableStyles.colors.secondary}`}>
                      {equipo.diferencia > 0 ? '+' : ''}{equipo.diferencia}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Vista Mobile */}
      <div className="md:hidden space-y-2">
        {equiposAMostrar.map((equipo) => {
          return (
            <div 
              key={equipo.id} 
              className={`${tableStyles.backgrounds.table} ${tableStyles.borders.table} ${tableStyles.shadows.card} overflow-hidden ${equipo.vidas === 0 ? 'opacity-60' : ''}`}
            >
              {/* Fila Principal */}
              <div className="flex items-center gap-3 p-3">
                {/* Escudo */}
                {equipo.escudo && (
                  <CustomImage
                    src={equipo.escudo}
                    alt={equipo.nombre}
                    width={40}
                    height={40}
                    className="flex-shrink-0"
                  />
                )}

                {/* Nombre del Equipo */}
                <Link
                  href={`/equipo/${equipo.slug}`}
                  className="flex-1 min-w-0"
                >
                  <div className={`font-semibold ${tableStyles.text.content.mobile} ${tableStyles.colors.primary} truncate`}>
                    {equipo.nombre}
                  </div>
                  <div className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.muted}`}>
                    {equipo.partidosJugados} PJ
                    {equipo.vidas === 0 && (
                      <span className={`ml-2 ${tableStyles.colors.negative} font-semibold`}>• Eliminado</span>
                    )}
                  </div>
                </Link>

                {/* Vidas Destacadas */}
                <div className={`flex flex-col items-center justify-center flex-shrink-0 px-3 py-2 border-2 rounded-lg ${getVidasBgColor(equipo.vidas)}`}>
                  <span className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.secondary} font-medium`}>Vidas</span>
                  <span className={`${tableStyles.text.highlighted.mobile} font-bold ${getVidasColor(equipo.vidas)}`}>
                    {equipo.vidas}
                  </span>
                </div>
              </div>

              {/* Fila de Estadísticas */}
              <div className="grid grid-cols-4 gap-2 px-3 pb-3 text-center border-t border-slate-100 pt-2">
                <div>
                  <div className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.muted}`}>G-E-P</div>
                  <div className={`${tableStyles.text.content.mobile} font-semibold ${tableStyles.colors.secondary}`}>
                    {equipo.victorias}-{equipo.empates}-{equipo.derrotas}
                  </div>
                </div>
                <div>
                  <div className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.muted}`}>GF</div>
                  <div className={`${tableStyles.text.content.mobile} font-semibold ${tableStyles.colors.secondary}`}>{equipo.golesAFavor}</div>
                </div>
                <div>
                  <div className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.muted}`}>GC</div>
                  <div className={`${tableStyles.text.content.mobile} font-semibold ${tableStyles.colors.secondary}`}>{equipo.golesEnContra}</div>
                </div>
                <div>
                  <div className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.muted}`}>DIF</div>
                  <div className={`${tableStyles.text.content.mobile} font-semibold ${equipo.diferencia > 0 ? tableStyles.colors.positive : equipo.diferencia < 0 ? tableStyles.colors.negative : tableStyles.colors.secondary}`}>
                    {equipo.diferencia > 0 ? '+' : ''}{equipo.diferencia}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Botón Cargar Más */}
      {hayMasEquipos && (
        <button
          onClick={cargarMas}
          className="w-full mt-4 py-3 bg-transparent text-slate-600 rounded-lg font-medium flex items-center justify-center gap-2"
        >
          Ver más equipos
          <ChevronDown className="w-5 h-5" />
        </button>
      )}

      {/* Footer */}
     
    </div>
  )
}
