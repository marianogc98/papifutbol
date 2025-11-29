import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { partidoSchema } from '@/lib/validations/partido'
import { combineFechaAndHoraToUTC } from '@/lib/utils/date'

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
        _count: {
          select: {
            goles: true,
          },
        },
      },
      orderBy: [
        { fechaHora: 'asc' },
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
    
    // Si viene horaLocal, combinar con la fecha de la fecha seleccionada
    // IMPORTANTE: Esto debe hacerse ANTES de la validación con Zod
    let fechaHoraUTC: Date | undefined
    if (body.horaLocal && body.horaLocal !== '' && body.fechaId) {
      // Obtener la fecha de la fecha seleccionada
      const fecha = await prisma.fecha.findUnique({
        where: { id: body.fechaId },
      })
      
      if (fecha) {
        // Combinar la fecha (en UTC 00:00) con la hora seleccionada (guardada directamente en UTC)
        fechaHoraUTC = combineFechaAndHoraToUTC(fecha.fecha, body.horaLocal)
      }
    } else if (body.fechaHora) {
      // Si viene fechaHora directamente (para compatibilidad), usarla
      fechaHoraUTC = typeof body.fechaHora === 'string' ? new Date(body.fechaHora) : body.fechaHora
    }
    
    // Preparar datos para validación (sin horaLocal, ya que no está en el schema)
    const dataToValidate: any = {
      fechaId: body.fechaId,
      equipoLocalId: body.equipoLocalId,
      equipoVisitanteId: body.equipoVisitanteId,
      estado: body.estado,
    }
    
    // Solo incluir fechaHora si tiene valor (Zod puede eliminar undefined)
    if (fechaHoraUTC !== undefined) {
      dataToValidate.fechaHora = fechaHoraUTC
    }
    
    const validatedData = partidoSchema.parse(dataToValidate)

    // Verificar que la fecha exista (ya la obtuvimos antes si había horaLocal)
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
        fechaHora: validatedData.fechaHora || null,
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

