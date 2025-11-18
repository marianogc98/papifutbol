import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { fechaSchema } from '@/lib/validations/fecha'

// GET /api/fechas - Listar fechas (público)
export async function GET(request: NextRequest) {
  try {
    const fechas = await prisma.fecha.findMany({
      include: {
        _count: {
          select: {
            partidos: true,
          },
        },
      },
      orderBy: {
        numero: 'asc',
      },
    })

    return NextResponse.json(fechas)
  } catch (error) {
    console.error('Error al obtener fechas:', error)
    return NextResponse.json(
      { error: 'Error al obtener fechas' },
      { status: 500 }
    )
  }
}

// POST /api/fechas - Crear fecha (admin)
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
    
    // Convertir strings a Date si es necesario
    const dataToValidate = {
      ...body,
      desde: body.desde ? new Date(body.desde) : body.desde,
      hasta: body.hasta ? new Date(body.hasta) : body.hasta,
    }

    const validatedData = fechaSchema.parse(dataToValidate)

    // Verificar que el número no exista
    const fechaExistente = await prisma.fecha.findUnique({
      where: { numero: validatedData.numero },
    })

    if (fechaExistente) {
      return NextResponse.json(
        { error: 'Ya existe una fecha con ese número' },
        { status: 400 }
      )
    }

    const fecha = await prisma.fecha.create({
      data: {
        numero: validatedData.numero,
        nombre: validatedData.nombre || null,
        desde: validatedData.desde,
        hasta: validatedData.hasta,
      },
    })

    return NextResponse.json(fecha, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al crear fecha:', error)
    return NextResponse.json(
      { error: 'Error al crear fecha' },
      { status: 500 }
    )
  }
}

