import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { publicidadSchema } from '@/lib/validations/publicidad'
import { deleteFile } from '@/lib/utils/file-upload'

// GET /api/publicidades/[id] - Obtener publicidad por ID (público)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const publicidad = await prisma.publicidad.findUnique({
      where: { id: params.id },
    })

    if (!publicidad) {
      return NextResponse.json(
        { error: 'Publicidad no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(publicidad)
  } catch (error) {
    console.error('Error al obtener publicidad:', error)
    return NextResponse.json(
      { error: 'Error al obtener publicidad' },
      { status: 500 }
    )
  }
}

// PUT /api/publicidades/[id] - Actualizar publicidad (super_admin)
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

    if (session.user?.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requiere rol de super administrador' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = publicidadSchema.parse(body)

    // Verificar que la publicidad exista
    const publicidadExistente = await prisma.publicidad.findUnique({
      where: { id: params.id },
    })

    if (!publicidadExistente) {
      return NextResponse.json(
        { error: 'Publicidad no encontrada' },
        { status: 404 }
      )
    }

    // Si se está cambiando la imagen y había una anterior, eliminarla
    const imagenAnterior = publicidadExistente.imagen
    const nuevaImagen = validatedData.imagen || null
    
    if (imagenAnterior && imagenAnterior !== nuevaImagen && imagenAnterior.startsWith('/uploads/')) {
      await deleteFile(imagenAnterior)
    }

    const publicidad = await prisma.publicidad.update({
      where: { id: params.id },
      data: {
        titulo: validatedData.titulo,
        imagen: nuevaImagen,
        url: validatedData.url || null,
        activa: validatedData.activa,
        posicion: validatedData.posicion || null,
        orden: validatedData.orden,
      },
    })

    return NextResponse.json(publicidad)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al actualizar publicidad:', error)
    return NextResponse.json(
      { error: 'Error al actualizar publicidad' },
      { status: 500 }
    )
  }
}

// DELETE /api/publicidades/[id] - Eliminar publicidad (super_admin)
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

    if (session.user?.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requiere rol de super administrador' },
        { status: 403 }
      )
    }

    const publicidad = await prisma.publicidad.findUnique({
      where: { id: params.id },
    })

    if (!publicidad) {
      return NextResponse.json(
        { error: 'Publicidad no encontrada' },
        { status: 404 }
      )
    }

    // Eliminar imagen si existe
    if (publicidad.imagen && publicidad.imagen.startsWith('/uploads/')) {
      await deleteFile(publicidad.imagen)
    }

    await prisma.publicidad.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Publicidad eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar publicidad:', error)
    return NextResponse.json(
      { error: 'Error al eliminar publicidad' },
      { status: 500 }
    )
  }
}

