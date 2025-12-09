'use client'

import { useParams } from 'next/navigation'
import { useEquipo } from '@/lib/api/equipos'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomImage } from '@/components/ui/Image'
import { tableStyles } from '@/lib/constants/tableStyles'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader } from '@/components/ui/loader'

export default function EquipoPage() {
  const params = useParams()
  const slugOrId = params.id as string
  const { data: equipo, isLoading } = useEquipo(slugOrId)

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
      <div className="container mx-auto px-4 py-8 flex justify-center items-center">
        <Loader />
      </div>
    )
  }

  if (!equipo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Equipo no encontrado</div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header con escudo, nombre y vidas */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {equipo.escudo && (
              <CustomImage
                src={equipo.escudo}
                alt={equipo.nombre}
                width={80}
                height={80}
              />
            )}
            <h1 className={`${tableStyles.text.title.mobile} md:${tableStyles.text.title.desktop} font-bold ${tableStyles.colors.primary}`}>
              {equipo.nombre}
            </h1>
          </div>
          {/* Vidas destacadas */}
          <div className={`flex flex-col items-center justify-center px-4 py-3 border-2 rounded-lg ${getVidasBgColor(equipo.vidas)}`}>
            <span className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.secondary} font-medium`}>Vidas</span>
            <span className={`${tableStyles.text.highlighted.mobile} md:${tableStyles.text.highlighted.desktop} font-bold ${getVidasColor(equipo.vidas)}`}>
              {equipo.vidas}
            </span>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Estadísticas</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Datos de partidos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.muted} mb-1`}>Partidos Jugados</div>
              <div className={`${tableStyles.text.highlighted.mobile} md:${tableStyles.text.highlighted.desktop} font-bold ${tableStyles.colors.primary}`}>
                {equipo.estadisticas.partidosJugados}
              </div>
            </div>
            <div className="text-center">
              <div className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.muted} mb-1`}>Partidos Ganados</div>
              <div className={`${tableStyles.text.highlighted.mobile} md:${tableStyles.text.highlighted.desktop} font-bold ${tableStyles.colors.positive}`}>
                {equipo.estadisticas.victorias}
              </div>
            </div>
            <div className="text-center">
              <div className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.muted} mb-1`}>Partidos Empatados</div>
              <div className={`${tableStyles.text.highlighted.mobile} md:${tableStyles.text.highlighted.desktop} font-bold ${tableStyles.colors.warning}`}>
                {equipo.estadisticas.empates}
              </div>
            </div>
            <div className="text-center">
              <div className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.muted} mb-1`}>Partidos Perdidos</div>
              <div className={`${tableStyles.text.highlighted.mobile} md:${tableStyles.text.highlighted.desktop} font-bold ${tableStyles.colors.negative}`}>
                {equipo.estadisticas.derrotas}
              </div>
            </div>
          </div>
          {/* Datos de goles */}
          <div className="grid grid-cols-3 gap-4 border-t pt-4">
            <div className="text-center">
              <div className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.muted} mb-1`}>GF</div>
              <div className={`${tableStyles.text.highlighted.mobile} md:${tableStyles.text.highlighted.desktop} font-bold ${tableStyles.colors.positive}`}>
                {equipo.estadisticas.golesAFavor}
              </div>
            </div>
            <div className="text-center">
              <div className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.muted} mb-1`}>GC</div>
              <div className={`${tableStyles.text.highlighted.mobile} md:${tableStyles.text.highlighted.desktop} font-bold ${tableStyles.colors.negative}`}>
                {equipo.estadisticas.golesEnContra}
              </div>
            </div>
            <div className="text-center">
              <div className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.muted} mb-1`}>DIF</div>
              <div className={`${tableStyles.text.highlighted.mobile} md:${tableStyles.text.highlighted.desktop} font-bold ${equipo.estadisticas.diferencia >= 0 ? tableStyles.colors.positive : tableStyles.colors.negative}`}>
                {equipo.estadisticas.diferencia > 0 ? '+' : ''}{equipo.estadisticas.diferencia}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jugadores */}
      <Card>
        <CardHeader>
          <CardTitle>Jugadores</CardTitle>
        </CardHeader>
        <CardContent>
          {equipo.jugadores && equipo.jugadores.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {equipo.jugadores.map((jugador) => (
                <div
                  key={jugador.id}
                  className={`${tableStyles.backgrounds.table} ${tableStyles.borders.table} ${tableStyles.shadows.card} p-3 rounded-lg`}
                >
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
                    {jugador.foto ? (
                      <CustomImage
                        src={jugador.foto}
                        alt={`${jugador.nombre} ${jugador.apellido}`}
                        width={60}
                        height={60}
                        className="rounded-lg flex-shrink-0"
                        square={true}
                      />
                    ) : (
                      <div className="w-[60px] h-[60px] rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <span className={`${tableStyles.text.secondary.mobile} ${tableStyles.colors.muted} font-medium`}>
                          {jugador.nombre.charAt(0)}{jugador.apellido.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col text-center md:text-left flex-1 min-w-0">
                      <div className={`font-medium ${tableStyles.text.content.mobile} md:${tableStyles.text.content.desktop} ${tableStyles.colors.primary} mb-1 break-words`}>
                        {jugador.nombre}
                      </div>
                      <div className={`font-medium ${tableStyles.text.content.mobile} md:${tableStyles.text.content.desktop} ${tableStyles.colors.primary} mb-1 break-words`}>
                        {jugador.apellido}
                      </div>
                      {jugador.numero && (
                        <div className={`${tableStyles.text.secondary.mobile} md:${tableStyles.text.secondary.desktop} font-semibold ${tableStyles.colors.secondary} mt-1`}>
                          #{jugador.numero}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={`${tableStyles.colors.muted} text-center py-4`}>
              No hay jugadores registrados en este equipo
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
