import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { jugadorSchema } from '@/lib/validations/jugador'

// GET /api/jugadores - Listar jugadores (público)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const equipoId = searchParams.get('equipoId')
    const estado = searchParams.get('estado')

    const where: any = {}
    if (equipoId) where.equipoId = equipoId
    if (estado) where.estado = estado

    const jugadores = await prisma.jugador.findMany({
      where,
      include: {
        equipo: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: [
        { equipo: { nombre: 'asc' } },
        { apellido: 'asc' },
      ],
    })

    return NextResponse.json(jugadores)
  } catch (error) {
    console.error('Error al obtener jugadores:', error)
    return NextResponse.json(
      { error: 'Error al obtener jugadores' },
      { status: 500 }
    )
  }
}

// POST /api/jugadores - Crear jugador (admin)
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
    const validatedData = jugadorSchema.parse(body)

    // Si tiene equipo, verificar que exista
    if (validatedData.equipoId) {
      const equipo = await prisma.equipo.findUnique({
        where: { id: validatedData.equipoId },
      })

      if (!equipo) {
        return NextResponse.json(
          { error: 'Equipo no encontrado' },
          { status: 400 }
        )
      }
    }

    const jugador = await prisma.jugador.create({
      data: {
        nombre: validatedData.nombre,
        apellido: validatedData.apellido,
        foto: validatedData.foto || null,
        estado: validatedData.estado,
        equipoId: validatedData.equipoId,
      },
      include: {
        equipo: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    })

    return NextResponse.json(jugador, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al crear jugador:', error)
    return NextResponse.json(
      { error: 'Error al crear jugador' },
      { status: 500 }
    )
  }
}

