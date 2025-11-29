'use client'

import { useTabla } from '@/lib/api/tabla'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { CustomImage } from '@/components/ui/Image'

export function TablaPosiciones() {
  const { data: tabla, isLoading, error } = useTabla()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">Cargando tabla de equipos...</p>
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Tabla de Vidas</h2>
        </div>
        <div className="bg-white border rounded-xl p-8 text-center">
          <p className="text-muted-foreground">No hay equipos en la tabla</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">Tabla de Equipos</h2>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-lg">
        {/* Contenedor con scroll horizontal en mobile */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px]">
            <thead className="bg-[#f3f3f3] border-b">
              <tr>
                <th className="px-2 md:px-6 py-2 md:py-4 text-center text-[10px] md:text-xs font-medium uppercase tracking-wider w-4 md:w-20">
                  Vidas
                </th>
                <th className="px-1 md:px-6 py-2 md:py-4 text-left text-[10px] md:text-xs font-medium uppercase tracking-wider min-w-4 md:min-w-0">
                  Equipo
                </th>
                <th className="px-1 md:px-4 py-2 md:py-4 text-center text-[10px] md:text-xs font-medium uppercase tracking-wider w-4 md:w-16">
                  PJ
                </th>
                <th className="px-1 md:px-4 py-2 md:py-4 text-center text-[10px] md:text-xs font-medium uppercase tracking-wider w-4 md:w-16">
                  G
                </th>
                <th className="px-1 md:px-4 py-2 md:py-4 text-center text-[10px] md:text-xs font-medium uppercase tracking-wider w-4 md:w-16">
                  E
                </th>
                <th className="px-1 md:px-4 py-2 md:py-4 text-center text-[10px] md:text-xs font-medium uppercase tracking-wider w-4 md:w-16">
                  P
                </th>
                <th className="px-1 md:px-4 py-2 md:py-4 text-center text-[10px] md:text-xs font-medium uppercase tracking-wider w-4 md:w-16 hidden md:table-cell">
                  GF
                </th>
                <th className="px-1 md:px-4 py-2 md:py-4 text-center text-[10px] md:text-xs font-medium uppercase tracking-wider w-4 md:w-16 hidden md:table-cell">
                  GC
                </th>
                <th className="px-2 md:px-4 py-2 md:py-4 text-center text-[10px] md:text-xs font-medium uppercase tracking-wider w-4 md:w-20">
                  DG
                </th>
              </tr>
            </thead>
            <tbody>
              {tabla.map((equipo) => (
                <tr key={equipo.id} className="border-b hover:bg-[#f3f3f3] transition-colors">
                  <td className="px-2 md:px-6 py-2 md:py-4 text-center">
                    <Badge
                      variant={equipo.vidas === 0 ? 'destructive' : 'default'}
                      className="font-bold text-[10px] md:text-sm px-1.5 md:px-2.5 py-0.5 md:py-0.5"
                    >
                      {equipo.vidas}
                    </Badge>
                  </td>
                  <td className="px-1 md:px-6 py-2 md:py-4">
                    <Link
                      href={`/equipo/${equipo.slug}`}
                      className="flex items-center gap-0.5 md:gap-3 hover:opacity-80 transition-opacity w-fit group"
                    >
                      {equipo.escudo && (
                        <CustomImage
                          src={equipo.escudo}
                          alt={equipo.nombre}
                          width={16}
                          height={16}
                          className="w-4 h-4 md:w-10 md:h-10 flex-shrink-0"
                        />
                      )}
                      <span className="font-medium text-[10px] md:text-base group-hover:text-[#852024] transition-colors truncate max-w-[60px] md:max-w-none">
                        {equipo.nombre}
                      </span>
                    </Link>
                  </td>
                  <td className="px-1 md:px-6 py-2 md:py-4 text-center text-xs md:text-base">{equipo.partidosJugados}</td>
                  <td className="px-1 md:px-6 py-2 md:py-4 text-center font-medium text-green-600 text-xs md:text-base">
                    {equipo.victorias}
                  </td>
                  <td className="px-1 md:px-6 py-2 md:py-4 text-center text-xs md:text-base">{equipo.empates}</td>
                  <td className="px-1 md:px-6 py-2 md:py-4 text-center font-medium text-red-600 text-xs md:text-base">
                    {equipo.derrotas}
                  </td>
                  <td className="px-1 md:px-6 py-2 md:py-4 text-center text-xs md:text-base hidden md:table-cell">{equipo.golesAFavor}</td>
                  <td className="px-1 md:px-6 py-2 md:py-4 text-center text-xs md:text-base hidden md:table-cell">{equipo.golesEnContra}</td>
                  <td className={`px-2 md:px-6 py-2 md:py-4 text-center font-medium text-xs md:text-base ${
                    equipo.diferencia > 0 ? 'text-green-600' : 
                    equipo.diferencia < 0 ? 'text-red-600' : 
                    'text-muted-foreground'
                  }`}>
                    {equipo.diferencia > 0 ? '+' : ''}{equipo.diferencia}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}












