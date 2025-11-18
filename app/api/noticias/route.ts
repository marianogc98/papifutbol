import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { noticiaSchema } from '@/lib/validations/noticia'

// GET /api/noticias - Listar noticias (público)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tipo = searchParams.get('tipo')

    const where: any = {}
    if (tipo) {
      where.tipo = tipo
    }

    const noticias = await prisma.noticia.findMany({
      where,
      orderBy: [
        { orden: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(noticias)
  } catch (error) {
    console.error('Error al obtener noticias:', error)
    return NextResponse.json(
      { error: 'Error al obtener noticias' },
      { status: 500 }
    )
  }
}

// POST /api/noticias - Crear noticia (admin)
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
    const validatedData = noticiaSchema.parse(body)

    const noticia = await prisma.noticia.create({
      data: {
        titulo: validatedData.titulo,
        contenido: validatedData.contenido || null,
        tipo: validatedData.tipo,
        url: validatedData.url || null,
        orden: validatedData.orden,
      },
    })

    return NextResponse.json(noticia, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al crear noticia:', error)
    return NextResponse.json(
      { error: 'Error al crear noticia' },
      { status: 500 }
    )
  }
}

