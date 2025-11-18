import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// GET /api/tabla - Tabla de vidas (público)
export async function GET(request: NextRequest) {
  try {
    // Obtener todos los equipos
    const equipos = await prisma.equipo.findMany({
      include: {
        partidosLocal: {
          where: {
            estado: 'jugado',
          },
        },
        partidosVisitante: {
          where: {
            estado: 'jugado',
          },
        },
        goles: {
          where: {
            esAutogol: false,
          },
        },
      },
    })

    // Calcular estadísticas para cada equipo
    const tabla = equipos.map((equipo) => {
      // Partidos jugados
      const partidos = [...equipo.partidosLocal, ...equipo.partidosVisitante]
      const partidosJugados = partidos.length

      // Goles a favor (sumar goles del equipo en cada partido jugado)
      let golesAFavor = 0
      partidos.forEach((partido) => {
        if (partido.equipoLocalId === equipo.id) {
          golesAFavor += partido.golesLocal
        } else {
          golesAFavor += partido.golesVisitante
        }
      })

      // Goles en contra (goles de otros equipos en partidos de este equipo)
      let golesEnContra = 0
      partidos.forEach((partido) => {
        if (partido.equipoLocalId === equipo.id) {
          golesEnContra += partido.golesVisitante
        } else {
          golesEnContra += partido.golesLocal
        }
      })

      const diferencia = golesAFavor - golesEnContra

      // Calcular victorias, empates y derrotas
      let victorias = 0
      let empates = 0
      let derrotas = 0

      partidos.forEach((partido) => {
        if (partido.equipoLocalId === equipo.id) {
          if (partido.golesLocal > partido.golesVisitante) victorias++
          else if (partido.golesLocal < partido.golesVisitante) derrotas++
          else empates++
        } else {
          if (partido.golesVisitante > partido.golesLocal) victorias++
          else if (partido.golesVisitante < partido.golesLocal) derrotas++
          else empates++
        }
      })

      return {
        id: equipo.id,
        nombre: equipo.nombre,
        escudo: equipo.escudo,
        vidas: equipo.vidas,
        estado: equipo.estado,
        partidosJugados,
        victorias,
        empates,
        derrotas,
        golesAFavor,
        golesEnContra,
        diferencia,
      }
    })

    // Ordenar: vidas DESC, partidos jugados ASC, diferencia DESC, goles a favor DESC
    // Equipos con 0 vidas al final
    tabla.sort((a, b) => {
      // Si uno tiene 0 vidas y el otro no, el de 0 vidas va al final
      if (a.vidas === 0 && b.vidas > 0) return 1
      if (b.vidas === 0 && a.vidas > 0) return -1

      // Ordenar por vidas descendente
      if (a.vidas !== b.vidas) return b.vidas - a.vidas

      // Si tienen las mismas vidas, ordenar por partidos jugados ascendente
      if (a.partidosJugados !== b.partidosJugados) {
        return a.partidosJugados - b.partidosJugados
      }

      // Si tienen los mismos partidos, ordenar por diferencia descendente
      if (a.diferencia !== b.diferencia) {
        return b.diferencia - a.diferencia
      }

      // Finalmente, por goles a favor descendente
      return b.golesAFavor - a.golesAFavor
    })

    return NextResponse.json(tabla)
  } catch (error) {
    console.error('Error al calcular tabla:', error)
    return NextResponse.json(
      { error: 'Error al calcular tabla' },
      { status: 500 }
    )
  }
}

