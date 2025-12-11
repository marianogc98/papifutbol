import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { agregarGolSchema } from '@/lib/validations/gol'

// POST /api/partidos/[id]/goles/individual - Agregar un gol individual (solo cuando está "jugando")
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que el partido exista y esté en estado "jugando"
    const partido = await prisma.partido.findUnique({
      where: { id: params.id },
      include: {
        equipoLocal: true,
        equipoVisitante: true,
      },
    })

    if (!partido) {
      return NextResponse.json(
        { error: 'Partido no encontrado' },
        { status: 404 }
      )
    }

    if (partido.estado !== 'jugando') {
      return NextResponse.json(
        { error: 'Solo se pueden agregar goles cuando el partido está en estado "jugando"' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = agregarGolSchema.parse(body)

    // Validar que el equipo pertenezca al partido
    if (validatedData.equipoId !== partido.equipoLocalId && validatedData.equipoId !== partido.equipoVisitanteId) {
      return NextResponse.json(
        { error: 'El equipo no pertenece a este partido' },
        { status: 400 }
      )
    }

    // Validar que el jugador pertenezca al equipo
    const jugador = await prisma.jugador.findUnique({
      where: { id: validatedData.jugadorId },
    })

    if (!jugador) {
      return NextResponse.json(
        { error: 'Jugador no encontrado' },
        { status: 404 }
      )
    }

    if (jugador.equipoId !== validatedData.equipoId) {
      return NextResponse.json(
        { error: 'El jugador no pertenece al equipo seleccionado' },
        { status: 400 }
      )
    }

    // Validar que no se excedan los goles totales del equipo
    const golesAsignados = await prisma.gol.count({
      where: {
        partidoId: params.id,
        equipoId: validatedData.equipoId,
      },
    })

    const golesMaximos = validatedData.equipoId === partido.equipoLocalId 
      ? partido.golesLocal 
      : partido.golesVisitante

    if (golesAsignados >= golesMaximos) {
      return NextResponse.json(
        { error: `Ya se han asignado todos los goles del equipo (${golesMaximos})` },
        { status: 400 }
      )
    }

    // Crear el gol
    const gol = await prisma.gol.create({
      data: {
        partidoId: params.id,
        jugadorId: validatedData.jugadorId,
        equipoId: validatedData.equipoId,
      },
      include: {
        jugador: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            numero: true,
          },
        },
        equipo: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    })

    return NextResponse.json(gol, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al agregar gol:', error)
    return NextResponse.json(
      { error: error.message || 'Error al agregar gol' },
      { status: 500 }
    )
  }
}



