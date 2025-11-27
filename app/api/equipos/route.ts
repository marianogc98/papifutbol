import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { equipoSchema } from '@/lib/validations/equipo'

// GET /api/equipos - Listar equipos (público)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const estado = searchParams.get('estado')

    const where = estado ? { estado } : {}

    const equipos = await prisma.equipo.findMany({
      where,
      include: {
        _count: {
          select: {
            jugadores: true,
          },
        },
      },
      orderBy: [
        { vidas: 'desc' },
        { nombre: 'asc' },
      ],
    })

    return NextResponse.json(equipos)
  } catch (error) {
    console.error('Error al obtener equipos:', error)
    return NextResponse.json(
      { error: 'Error al obtener equipos' },
      { status: 500 }
    )
  }
}

// POST /api/equipos - Crear equipo (admin)
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
    const validatedData = equipoSchema.parse(body)

    // Verificar que el nombre no exista
    const equipoExistente = await prisma.equipo.findUnique({
      where: { nombre: validatedData.nombre },
    })

    if (equipoExistente) {
      return NextResponse.json(
        { error: 'Ya existe un equipo con ese nombre' },
        { status: 400 }
      )
    }

    // Generar slug único
    const { generarSlug, generarSlugUnico } = await import('@/lib/utils/slug')
    const slug = await generarSlugUnico(
      validatedData.nombre,
      async (slug) => {
        const existe = await prisma.equipo.findUnique({ where: { slug } })
        return !!existe
      }
    )

    const equipo = await prisma.equipo.create({
      data: {
        nombre: validatedData.nombre,
        slug,
        escudo: validatedData.escudo || null,
        vidas: validatedData.vidas,
        estado: validatedData.estado,
      },
    })

    return NextResponse.json(equipo, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al crear equipo:', error)
    return NextResponse.json(
      { error: 'Error al crear equipo' },
      { status: 500 }
    )
  }
}

