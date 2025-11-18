import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { fechaSchema } from '@/lib/validations/fecha'

// GET /api/fechas/[id] - Obtener fecha por ID (público)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const fecha = await prisma.fecha.findUnique({
      where: { id: params.id },
      include: {
        partidos: {
          include: {
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
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!fecha) {
      return NextResponse.json(
        { error: 'Fecha no encontrada' },
        { status: 404 }
      )
    }

    // Calcular equipos con fecha libre (equipos activos que no tienen partido en esta fecha)
    const equiposActivos = await prisma.equipo.findMany({
      where: { estado: 'activo' },
      select: {
        id: true,
        nombre: true,
        escudo: true,
      },
    })

    // Obtener IDs de equipos que tienen partido en esta fecha
    const equiposConPartido = new Set<string>()
    fecha.partidos.forEach((partido) => {
      equiposConPartido.add(partido.equipoLocalId)
      equiposConPartido.add(partido.equipoVisitanteId)
    })

    // Equipos que NO tienen partido (fecha libre)
    const equiposLibres = equiposActivos.filter(
      (equipo) => !equiposConPartido.has(equipo.id)
    )

    return NextResponse.json({
      ...fecha,
      equiposLibres,
    })
  } catch (error) {
    console.error('Error al obtener fecha:', error)
    return NextResponse.json(
      { error: 'Error al obtener fecha' },
      { status: 500 }
    )
  }
}

// PUT /api/fechas/[id] - Actualizar fecha (admin)
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
    
    // Convertir strings a Date si es necesario
    const dataToValidate = {
      ...body,
      desde: body.desde ? new Date(body.desde) : body.desde,
      hasta: body.hasta ? new Date(body.hasta) : body.hasta,
    }

    const validatedData = fechaSchema.parse(dataToValidate)

    // Verificar que la fecha exista
    const fechaExistente = await prisma.fecha.findUnique({
      where: { id: params.id },
    })

    if (!fechaExistente) {
      return NextResponse.json(
        { error: 'Fecha no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el número no esté en uso por otra fecha
    if (validatedData.numero !== fechaExistente.numero) {
      const numeroEnUso = await prisma.fecha.findUnique({
        where: { numero: validatedData.numero },
      })

      if (numeroEnUso) {
        return NextResponse.json(
          { error: 'Ya existe una fecha con ese número' },
          { status: 400 }
        )
      }
    }

    const fecha = await prisma.fecha.update({
      where: { id: params.id },
      data: {
        numero: validatedData.numero,
        nombre: validatedData.nombre || null,
        desde: validatedData.desde,
        hasta: validatedData.hasta,
      },
    })

    return NextResponse.json(fecha)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al actualizar fecha:', error)
    return NextResponse.json(
      { error: 'Error al actualizar fecha' },
      { status: 500 }
    )
  }
}

// DELETE /api/fechas/[id] - Eliminar fecha (admin)
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

    const fecha = await prisma.fecha.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            partidos: true,
          },
        },
      },
    })

    if (!fecha) {
      return NextResponse.json(
        { error: 'Fecha no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que no tenga partidos asociados
    if (fecha._count.partidos > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una fecha con partidos asociados' },
        { status: 400 }
      )
    }

    await prisma.fecha.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Fecha eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar fecha:', error)
    return NextResponse.json(
      { error: 'Error al eliminar fecha' },
      { status: 500 }
    )
  }
}

