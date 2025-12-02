import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { fechaSchema } from '@/lib/validations/fecha'
import { dateToUTC } from '@/lib/utils/date'

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
    
    // Convertir fecha a UTC 00:00:00 (solo fecha, sin hora)
    let fechaDate: Date | undefined
    if (body.fecha) {
      if (typeof body.fecha === 'string') {
        // Si viene como string "YYYY-MM-DD", convertir a UTC 00:00:00
        if (body.fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
          fechaDate = dateToUTC(body.fecha)
        } else {
          // Si viene como ISO string completo, extraer solo la fecha y convertir a UTC 00:00
          const date = new Date(body.fecha)
          fechaDate = dateToUTC(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`)
        }
      } else {
        // Si ya es Date, extraer solo la fecha y convertir a UTC 00:00
        const date = new Date(body.fecha)
        fechaDate = dateToUTC(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`)
      }
    }
    
    const dataToValidate = {
      ...body,
      fecha: fechaDate,
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

    // Generar slug desde el nombre o "fecha-{numero}"
    const { generarSlug, generarSlugUnico } = await import('@/lib/utils/slug')
    const nombreParaSlug = validatedData.nombre || `Fecha ${validatedData.numero}`
    const slug = await generarSlugUnico(
      nombreParaSlug,
      async (slug) => {
        const existe = await prisma.fecha.findUnique({ where: { slug } })
        return !!existe
      }
    )

    const fecha = await prisma.fecha.create({
      data: {
        numero: validatedData.numero,
        nombre: validatedData.nombre || null,
        slug,
        fecha: validatedData.fecha,
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
