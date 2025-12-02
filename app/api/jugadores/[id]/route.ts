import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { jugadorSchema } from '@/lib/validations/jugador'
import { deleteFile } from '@/lib/utils/file-upload'

// GET /api/jugadores/[id] - Obtener jugador por ID (público)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jugador = await prisma.jugador.findUnique({
      where: { id: params.id },
      include: {
        equipo: {
          select: {
            id: true,
            nombre: true,
            escudo: true,
          },
        },
        _count: {
          select: {
            goles: true,
          },
        },
      },
    })

    if (!jugador) {
      return NextResponse.json(
        { error: 'Jugador no encontrado' },
        { status: 404 }
      )
    }

    // Obtener goles del jugador (excluyendo autogoles)
    const goles = await prisma.gol.findMany({
      where: {
        jugadorId: params.id,
        esAutogol: false,
      },
      include: {
        partido: {
          include: {
            equipoLocal: {
              select: { nombre: true },
            },
            equipoVisitante: {
              select: { nombre: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      ...jugador,
      goles,
    })
  } catch (error) {
    console.error('Error al obtener jugador:', error)
    return NextResponse.json(
      { error: 'Error al obtener jugador' },
      { status: 500 }
    )
  }
}

// PUT /api/jugadores/[id] - Actualizar jugador (admin)
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
    
    // Convertir fechaNac de string ISO a Date si viene como string válido
    let fechaNacConvertida: Date | null = null
    
    if (body.fechaNac && body.fechaNac !== null && body.fechaNac !== '') {
      if (body.fechaNac instanceof Date) {
        fechaNacConvertida = body.fechaNac
      } else if (typeof body.fechaNac === 'string') {
        const fecha = new Date(body.fechaNac)
        if (!isNaN(fecha.getTime())) {
          fechaNacConvertida = fecha
        }
      }
    }
    
    const bodyWithDate = {
      ...body,
      fechaNac: fechaNacConvertida,
    }
    
    const validatedData = jugadorSchema.parse(bodyWithDate)

    // Verificar que el jugador exista
    const jugadorExistente = await prisma.jugador.findUnique({
      where: { id: params.id },
    })

    if (!jugadorExistente) {
      return NextResponse.json(
        { error: 'Jugador no encontrado' },
        { status: 404 }
      )
    }

    // Si cambia de equipo o número, verificar validaciones
    if (validatedData.equipoId && validatedData.numero) {
      const numeroEnUso = await prisma.jugador.findFirst({
        where: {
          equipoId: validatedData.equipoId,
          numero: validatedData.numero,
          estado: 'activo',
          NOT: {
            id: params.id,
          },
        },
      })

      if (numeroEnUso) {
        return NextResponse.json(
          { error: 'Ya existe un jugador activo con ese número en el equipo' },
          { status: 400 }
        )
      }
    }

    // Si se está cambiando la foto y había una anterior, eliminarla
    const fotoAnterior = jugadorExistente.foto
    const nuevaFoto = validatedData.foto || null
    
    if (fotoAnterior && fotoAnterior !== nuevaFoto && fotoAnterior.startsWith('/uploads/')) {
      await deleteFile(fotoAnterior)
    }

    const jugador = await prisma.jugador.update({
      where: { id: params.id },
      data: {
        nombre: validatedData.nombre,
        apellido: validatedData.apellido,
        numero: validatedData.numero,
        fechaNac: validatedData.fechaNac,
        foto: nuevaFoto,
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

    return NextResponse.json(jugador)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al actualizar jugador:', error)
    return NextResponse.json(
      { error: 'Error al actualizar jugador' },
      { status: 500 }
    )
  }
}

// DELETE /api/jugadores/[id] - Eliminar jugador (admin)
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

    const jugador = await prisma.jugador.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            goles: true,
          },
        },
      },
    })

    if (!jugador) {
      return NextResponse.json(
        { error: 'Jugador no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que no tenga goles asociados
    if (jugador._count.goles > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un jugador con goles asociados' },
        { status: 400 }
      )
    }

    // Eliminar foto si existe
    if (jugador.foto && jugador.foto.startsWith('/uploads/')) {
      await deleteFile(jugador.foto)
    }

    await prisma.jugador.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Jugador eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar jugador:', error)
    return NextResponse.json(
      { error: 'Error al eliminar jugador' },
      { status: 500 }
    )
  }
}

