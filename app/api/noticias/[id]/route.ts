import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { noticiaSchema } from '@/lib/validations/noticia'

// GET /api/noticias/[id] - Obtener noticia por ID (público)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const noticia = await prisma.noticia.findUnique({
      where: { id: params.id },
    })

    if (!noticia) {
      return NextResponse.json(
        { error: 'Noticia no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(noticia)
  } catch (error) {
    console.error('Error al obtener noticia:', error)
    return NextResponse.json(
      { error: 'Error al obtener noticia' },
      { status: 500 }
    )
  }
}

// PUT /api/noticias/[id] - Actualizar noticia (admin)
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
    const validatedData = noticiaSchema.parse(body)

    const noticia = await prisma.noticia.update({
      where: { id: params.id },
      data: {
        titulo: validatedData.titulo,
        contenido: validatedData.contenido || null,
        tipo: validatedData.tipo,
        url: validatedData.url || null,
        orden: validatedData.orden,
      },
    })

    return NextResponse.json(noticia)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Noticia no encontrada' },
        { status: 404 }
      )
    }

    console.error('Error al actualizar noticia:', error)
    return NextResponse.json(
      { error: 'Error al actualizar noticia' },
      { status: 500 }
    )
  }
}

// DELETE /api/noticias/[id] - Eliminar noticia (admin)
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

    await prisma.noticia.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Noticia eliminada correctamente' })
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Noticia no encontrada' },
        { status: 404 }
      )
    }

    console.error('Error al eliminar noticia:', error)
    return NextResponse.json(
      { error: 'Error al eliminar noticia' },
      { status: 500 }
    )
  }
}

