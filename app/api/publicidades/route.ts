import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { publicidadSchema } from '@/lib/validations/publicidad'

// GET /api/publicidades - Listar publicidades (público)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const activa = searchParams.get('activa')

    // Por defecto, solo mostrar publicidades activas para usuarios públicos
    // Si se especifica activa=false, mostrar todas (para admin)
    // Si se especifica activa=true, mostrar solo activas
    const where: any = {}
    if (activa !== null) {
      if (activa === 'false') {
        // Si es false, no filtrar (mostrar todas)
        // No agregar condición where.activa
      } else {
        where.activa = activa === 'true'
      }
    } else {
      // Si no se especifica, solo mostrar activas (comportamiento público)
      where.activa = true
    }

    const publicidades = await prisma.publicidad.findMany({
      where,
      orderBy: [
        { orden: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(publicidades)
  } catch (error) {
    console.error('Error al obtener publicidades:', error)
    return NextResponse.json(
      { error: 'Error al obtener publicidades' },
      { status: 500 }
    )
  }
}

// POST /api/publicidades - Crear publicidad (super_admin)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    if (session.user?.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requiere rol de super administrador' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = publicidadSchema.parse(body)

    const publicidad = await prisma.publicidad.create({
      data: {
        titulo: validatedData.titulo,
        imagen: validatedData.imagen || null,
        url: validatedData.url || null,
        activa: validatedData.activa,
        posicion: validatedData.posicion || null,
        orden: validatedData.orden,
      },
    })

    return NextResponse.json(publicidad, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al crear publicidad:', error)
    return NextResponse.json(
      { error: 'Error al crear publicidad' },
      { status: 500 }
    )
  }
}

