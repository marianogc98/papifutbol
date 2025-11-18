import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { partidoSchema } from '@/lib/validations/partido'

// GET /api/partidos/[id] - Obtener partido por ID (público)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partido = await prisma.partido.findUnique({
      where: { id: params.id },
      include: {
        fecha: {
          select: {
            id: true,
            numero: true,
            nombre: true,
            desde: true,
            hasta: true,
          },
        },
        equipoLocal: {
          select: {
            id: true,
            nombre: true,
            escudo: true,
            vidas: true,
            estado: true,
          },
        },
        equipoVisitante: {
          select: {
            id: true,
            nombre: true,
            escudo: true,
            vidas: true,
            estado: true,
          },
        },
        goles: {
          include: {
            jugador: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                numero: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!partido) {
      return NextResponse.json(
        { error: 'Partido no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(partido)
  } catch (error) {
    console.error('Error al obtener partido:', error)
    return NextResponse.json(
      { error: 'Error al obtener partido' },
      { status: 500 }
    )
  }
}

// PUT /api/partidos/[id] - Actualizar partido (admin)
export async function PUT(
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

    const body = await request.json()
    const validatedData = partidoSchema.parse(body)

    // Verificar que el partido exista
    const partidoExistente = await prisma.partido.findUnique({
      where: { id: params.id },
    })

    if (!partidoExistente) {
      return NextResponse.json(
        { error: 'Partido no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que la fecha y equipos existan
    const [fecha, equipoLocal, equipoVisitante] = await Promise.all([
      prisma.fecha.findUnique({ where: { id: validatedData.fechaId } }),
      prisma.equipo.findUnique({ where: { id: validatedData.equipoLocalId } }),
      prisma.equipo.findUnique({ where: { id: validatedData.equipoVisitanteId } }),
    ])

    if (!fecha || !equipoLocal || !equipoVisitante) {
      return NextResponse.json(
        { error: 'Fecha o equipos no encontrados' },
        { status: 400 }
      )
    }

    const partido = await prisma.partido.update({
      where: { id: params.id },
      data: {
        fechaId: validatedData.fechaId,
        equipoLocalId: validatedData.equipoLocalId,
        equipoVisitanteId: validatedData.equipoVisitanteId,
        estado: validatedData.estado,
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
            escudo: true,
          },
        },
        equipoVisitante: {
          select: {
            id: true,
            nombre: true,
            escudo: true,
          },
        },
      },
    })

    return NextResponse.json(partido)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al actualizar partido:', error)
    return NextResponse.json(
      { error: 'Error al actualizar partido' },
      { status: 500 }
    )
  }
}

// DELETE /api/partidos/[id] - Eliminar partido (admin)
export async function DELETE(
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

    const partido = await prisma.partido.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            goles: true,
          },
        },
      },
    })

    if (!partido) {
      return NextResponse.json(
        { error: 'Partido no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que no tenga goles asociados
    if (partido._count.goles > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un partido con goles asociados' },
        { status: 400 }
      )
    }

    await prisma.partido.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Partido eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar partido:', error)
    return NextResponse.json(
      { error: 'Error al eliminar partido' },
      { status: 500 }
    )
  }
}

