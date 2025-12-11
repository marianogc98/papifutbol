import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// GET /api/goleadores - Tabla de goleadores (público)
export async function GET(request: NextRequest) {
  try {
    // Obtener todos los goles
    const goles = await prisma.gol.findMany({
      where: {},
      include: {
        jugador: {
          include: {
            equipo: {
              select: {
                id: true,
                nombre: true,
                slug: true,
                escudo: true,
              },
            },
          },
        },
        partido: {
          select: {
            id: true,
            equipoLocal: {
              select: { nombre: true },
            },
            equipoVisitante: {
              select: { nombre: true },
            },
          },
        },
      },
    })

    // Agrupar por jugador
    const goleadoresMap = new Map<string, {
      jugador: {
        id: string
        nombre: string
        apellido: string
        equipo: { id: string; nombre: string; slug: string; escudo: string | null } | null
      }
      totalGoles: number
      goles: Array<{
        id: string
        partido: {
          equipoLocal: { nombre: string }
          equipoVisitante: { nombre: string }
        }
      }>
    }>()

    goles.forEach((gol) => {
      const jugadorId = gol.jugadorId
      
      if (!goleadoresMap.has(jugadorId)) {
        goleadoresMap.set(jugadorId, {
          jugador: {
            id: gol.jugador.id,
            nombre: gol.jugador.nombre,
            apellido: gol.jugador.apellido,
            equipo: gol.jugador.equipo,
          },
          totalGoles: 0,
          goles: [],
        })
      }

      const goleador = goleadoresMap.get(jugadorId)!
      goleador.totalGoles++
      goleador.goles.push({
        id: gol.id,
        partido: gol.partido,
      })
    })

    // Convertir a array y ordenar
    const goleadores = Array.from(goleadoresMap.values())
    
    // Ordenar: total goles DESC, apellido ASC
    goleadores.sort((a, b) => {
      if (a.totalGoles !== b.totalGoles) {
        return b.totalGoles - a.totalGoles
      }
      return a.jugador.apellido.localeCompare(b.jugador.apellido)
    })

    return NextResponse.json(goleadores)
  } catch (error) {
    console.error('Error al calcular goleadores:', error)
    return NextResponse.json(
      { error: 'Error al calcular goleadores' },
      { status: 500 }
    )
  }
}

