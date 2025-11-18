import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { partidoSchema } from '@/lib/validations/partido'

// GET /api/partidos - Listar partidos (público)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fechaId = searchParams.get('fechaId')
    const estado = searchParams.get('estado')
    const equipoId = searchParams.get('equipoId')

    const where: any = {}
    if (fechaId) where.fechaId = fechaId
    if (estado) where.estado = estado
    if (equipoId) {
      where.OR = [
        { equipoLocalId: equipoId },
        { equipoVisitanteId: equipoId },
      ]
    }

    const partidos = await prisma.partido.findMany({
      where,
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
        _count: {
          select: {
            goles: true,
          },
        },
      },
      orderBy: [
        { fecha: { numero: 'asc' } },
        { createdAt: 'asc' },
      ],
    })

    return NextResponse.json(partidos)
  } catch (error) {
    console.error('Error al obtener partidos:', error)
    return NextResponse.json(
      { error: 'Error al obtener partidos' },
      { status: 500 }
    )
  }
}

// POST /api/partidos - Crear partido (admin)
export async function POST(request: NextRequest) {
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

    // Verificar que la fecha exista
    const fecha = await prisma.fecha.findUnique({
      where: { id: validatedData.fechaId },
    })

    if (!fecha) {
      return NextResponse.json(
        { error: 'Fecha no encontrada' },
        { status: 400 }
      )
    }

    // Verificar que los equipos existan
    const [equipoLocal, equipoVisitante] = await Promise.all([
      prisma.equipo.findUnique({ where: { id: validatedData.equipoLocalId } }),
      prisma.equipo.findUnique({ where: { id: validatedData.equipoVisitanteId } }),
    ])

    if (!equipoLocal || !equipoVisitante) {
      return NextResponse.json(
        { error: 'Uno o ambos equipos no existen' },
        { status: 400 }
      )
    }

    const partido = await prisma.partido.create({
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

    return NextResponse.json(partido, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al crear partido:', error)
    return NextResponse.json(
      { error: 'Error al crear partido' },
      { status: 500 }
    )
  }
}

