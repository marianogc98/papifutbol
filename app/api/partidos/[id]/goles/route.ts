import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { actualizarGolesEquipoSchema } from '@/lib/validations/gol'

// PATCH /api/partidos/[id]/goles - Actualizar goles del equipo (solo cuando está "jugando")
export async function PATCH(
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
    })

    if (!partido) {
      return NextResponse.json(
        { error: 'Partido no encontrado' },
        { status: 404 }
      )
    }

    if (partido.estado !== 'jugando') {
      return NextResponse.json(
        { error: 'Solo se pueden actualizar goles cuando el partido está en estado "jugando"' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const validatedData = actualizarGolesEquipoSchema.parse(body)

    // Validar que los nuevos goles no sean menores que los goles ya asignados
    const golesAsignados = await prisma.gol.groupBy({
      by: ['equipoId'],
      where: {
        partidoId: params.id,
        esAutogol: false,
      },
      _count: true,
    })

    const golesLocalAsignados = golesAsignados.find(g => g.equipoId === partido.equipoLocalId)?._count || 0
    const golesVisitanteAsignados = golesAsignados.find(g => g.equipoId === partido.equipoVisitanteId)?._count || 0

    if (validatedData.golesLocal < golesLocalAsignados) {
      return NextResponse.json(
        { error: `No se pueden tener menos goles (${validatedData.golesLocal}) que los ya asignados a jugadores (${golesLocalAsignados})` },
        { status: 400 }
      )
    }

    if (validatedData.golesVisitante < golesVisitanteAsignados) {
      return NextResponse.json(
        { error: `No se pueden tener menos goles (${validatedData.golesVisitante}) que los ya asignados a jugadores (${golesVisitanteAsignados})` },
        { status: 400 }
      )
    }

    // Actualizar goles del partido
    const partidoActualizado = await prisma.partido.update({
      where: { id: params.id },
      data: {
        golesLocal: validatedData.golesLocal,
        golesVisitante: validatedData.golesVisitante,
      },
      include: {
        fecha: {
          select: {
            id: true,
            numero: true,
            nombre: true,
          },
        },
        equipoLocal: {
          select: {
            id: true,
            nombre: true,
            slug: true,
            escudo: true,
          },
        },
        equipoVisitante: {
          select: {
            id: true,
            nombre: true,
            slug: true,
            escudo: true,
          },
        },
      },
    })

    return NextResponse.json(partidoActualizado)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al actualizar goles del partido:', error)
    return NextResponse.json(
      { error: error.message || 'Error al actualizar goles' },
      { status: 500 }
    )
  }
}



