'use client'

import { useGoleadores } from '@/lib/api/goleadores'
import Link from 'next/link'

export function TablaGoleadores() {
  const { data: goleadores, isLoading, error } = useGoleadores()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-muted-foreground">Cargando tabla de goleadores...</p>
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
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Tabla de Goleadores</h2>
        </div>
        <div className="bg-white border rounded-xl p-8 text-center">
          <p className="text-muted-foreground">No hay goleadores registrados</p>
        </div>
      </div>
    )
  }

  // Ordenar por total de goles descendente
  const goleadoresOrdenados = [...goleadores].sort((a, b) => {
    return b.totalGoles - a.totalGoles
  })

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Tabla de Goleadores</h2>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden shadow-lg">
        <table className="w-full">
          <thead className="bg-[#f3f3f3] border-b">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider w-12">
                Pos
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Jugador
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider">
                Equipo
              </th>
              <th className="px-6 py-4 text-center text-xs font-medium uppercase tracking-wider w-24">
                Goles
              </th>
            </tr>
          </thead>
          <tbody>
            {goleadoresOrdenados.map((goleador, index) => (
              <tr key={goleador.jugador.id} className="border-b hover:bg-[#f3f3f3] transition-colors">
                <td className="px-6 py-4 text-center font-bold">
                  {index + 1}
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium">
                    {goleador.jugador.nombre} {goleador.jugador.apellido}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {goleador.jugador.equipo ? (
                    <Link
                      href={`/equipo/${goleador.jugador.equipo.slug || goleador.jugador.equipo.id}`}
                      className="hover:opacity-80 transition-opacity group flex items-center gap-2"
                    >
                      {goleador.jugador.equipo.escudo && (
                        <img
                          src={goleador.jugador.equipo.escudo}
                          alt={goleador.jugador.equipo.nombre}
                          className="w-6 h-6 object-contain"
                        />
                      )}
                      <span className="group-hover:text-[#852024] transition-colors">
                        {goleador.jugador.equipo.nombre}
                      </span>
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">Sin equipo</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-l font-bold text-black">
                    {goleador.totalGoles}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}












