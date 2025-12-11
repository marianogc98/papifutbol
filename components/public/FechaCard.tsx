'use client'

import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { formatDateUTC } from '@/lib/utils/date'
import { CardTable, CardTableRow } from '@/components/ui/CardTable'
import type { Partido } from '@/lib/api/partidos'
import type { Fecha } from '@/lib/api/fechas'
import type { Equipo } from '@/lib/api/equipos'

interface FechaCardProps {
  fecha: Fecha
  partidos: Partido[]
  equiposLibres?: Equipo[]
  showEquiposLibres?: boolean
}

const getEstadoBadge = (estado: string) => {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pendiente: 'outline',
    jugando: 'default',
    jugado: 'default',
    suspendido: 'secondary',
    cancelado: 'destructive',
    no_se_presento_local: 'destructive',
    no_se_presento_visitante: 'destructive',
  }
  return variants[estado] || 'outline'
}

const getEstadoLabel = (estado: string) => {
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    jugando: 'Jugando',
    jugado: 'Jugado',
    suspendido: 'Suspendido',
    cancelado: 'Cancelado',
    no_se_presento_local: 'No se presentó Local',
    no_se_presento_visitante: 'No se presentó Visitante',
  }
  return labels[estado] || estado
}

export function FechaCard({
  fecha,
  partidos,
  equiposLibres = [],
  showEquiposLibres = true,
}: FechaCardProps) {
  return (
    <CardTable
      title={fecha.nombre || `Fecha ${fecha.numero}`}
      subtitle={formatDateUTC(fecha.fecha)}
      isEmpty={partidos.length === 0}
      emptyMessage="No hay partidos programados para esta fecha"
    >
      {partidos.map((partido) => (
        <CardTableRow key={partido.id}>
          <div className="flex-1 flex items-center gap-4">
            <div className="flex-1 text-right">
              <Link
                href={`/equipo/${partido.equipoLocal?.slug || partido.equipoLocal?.id}`}
                className="font-medium hover:opacity-80 transition-opacity"
              >
                {partido.equipoLocal?.nombre || '-'}
              </Link>
            </div>
            <div className="text-center min-w-[100px]">
              {partido.estado === 'jugado' ||
              partido.estado === 'jugando' ||
              partido.estado === 'no_se_presento_local' ||
              partido.estado === 'no_se_presento_visitante' ? (
                <span className="text-2xl font-bold">
                  {partido.golesLocal} - {partido.golesVisitante}
                </span>
              ) : (
                <span className="text-muted-foreground">vs</span>
              )}
            </div>
            <div className="flex-1 text-left">
              <Link
                href={`/equipo/${partido.equipoVisitante?.slug || partido.equipoVisitante?.id}`}
                className="font-medium hover:opacity-80 transition-opacity"
              >
                {partido.equipoVisitante?.nombre || '-'}
              </Link>
            </div>
          </div>
          <div className="ml-4">
            <Badge variant={getEstadoBadge(partido.estado)}>
              {getEstadoLabel(partido.estado)}
            </Badge>
          </div>
        </CardTableRow>
      ))}

      {/* Mostrar equipos con fecha libre */}
      {showEquiposLibres && equiposLibres && equiposLibres.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <p className="text-sm font-medium mb-3 text-muted-foreground">
            Equipos con Fecha Libre (Descanso):
          </p>
          <div className="flex flex-wrap gap-2">
            {equiposLibres.map((equipo) => (
              <Badge key={equipo.id} variant="outline" className="text-sm">
                {equipo.nombre}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </CardTable>
  )
}

