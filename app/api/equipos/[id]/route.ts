import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { equipoSchema } from '@/lib/validations/equipo'
import { deleteFile } from '@/lib/utils/file-upload'

// GET /api/equipos/[slug] - Obtener equipo por slug o ID (público)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Intentar buscar por slug primero, si no existe, buscar por ID (compatibilidad)
    let equipo = await prisma.equipo.findUnique({
      where: { slug: params.id },
      include: {
        jugadores: {
          where: {
            estado: 'activo',
          },
          orderBy: [
            { numero: 'asc' },
            { apellido: 'asc' },
          ],
        },
        _count: {
          select: {
            partidosLocal: true,
            partidosVisitante: true,
            goles: true,
          },
        },
      },
    })

    // Si no se encontró por slug, intentar por ID (compatibilidad con links antiguos)
    if (!equipo) {
      equipo = await prisma.equipo.findUnique({
        where: { id: params.id },
        include: {
          jugadores: {
            where: {
              estado: 'activo',
            },
            orderBy: [
              { numero: 'asc' },
              { apellido: 'asc' },
            ],
          },
          _count: {
            select: {
              partidosLocal: true,
              partidosVisitante: true,
              goles: true,
            },
          },
        },
      })
    }

    if (!equipo) {
      return NextResponse.json(
        { error: 'Equipo no encontrado' },
        { status: 404 }
      )
    }

    // Calcular estadísticas
    const partidosJugados = equipo._count.partidosLocal + equipo._count.partidosVisitante
    const golesAFavor = equipo._count.goles

    // Obtener goles en contra (goles de otros equipos en partidos de este equipo)
    const partidos = await prisma.partido.findMany({
      where: {
        OR: [
          { equipoLocalId: equipo.id },
          { equipoVisitanteId: equipo.id },
        ],
        estado: 'jugado',
      },
      include: {
        goles: true,
      },
    })

    let golesEnContra = 0
    partidos.forEach((partido) => {
      partido.goles.forEach((gol) => {
        if (gol.equipoId !== equipo.id) {
          golesEnContra++
        }
      })
    })

    const diferencia = golesAFavor - golesEnContra

    return NextResponse.json({
      ...equipo,
      estadisticas: {
        partidosJugados,
        golesAFavor,
        golesEnContra,
        diferencia,
      },
    })
  } catch (error) {
    console.error('Error al obtener equipo:', error)
    return NextResponse.json(
      { error: 'Error al obtener equipo' },
      { status: 500 }
    )
  }
}

// PUT /api/equipos/[slug] - Actualizar equipo (admin)
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
    const validatedData = equipoSchema.parse(body)

    // Verificar que el equipo exista (buscar por slug o ID)
    let equipoExistente = await prisma.equipo.findUnique({
      where: { slug: params.id },
    })

    if (!equipoExistente) {
      equipoExistente = await prisma.equipo.findUnique({
        where: { id: params.id },
      })
    }

    if (!equipoExistente) {
      return NextResponse.json(
        { error: 'Equipo no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el nombre no esté en uso por otro equipo
    if (validatedData.nombre !== equipoExistente.nombre) {
      const nombreEnUso = await prisma.equipo.findUnique({
        where: { nombre: validatedData.nombre },
      })

      if (nombreEnUso) {
        return NextResponse.json(
          { error: 'Ya existe un equipo con ese nombre' },
          { status: 400 }
        )
      }
    }

    // Si se está cambiando el escudo y había uno anterior, eliminarlo
    const escudoAnterior = equipoExistente.escudo
    const nuevoEscudo = validatedData.escudo || null
    
    if (escudoAnterior && escudoAnterior !== nuevoEscudo && escudoAnterior.startsWith('/uploads/')) {
      await deleteFile(escudoAnterior)
    }

    // Generar nuevo slug si cambió el nombre
    const { generarSlug, generarSlugUnico } = await import('@/lib/utils/slug')
    let nuevoSlug = equipoExistente.slug
    if (validatedData.nombre !== equipoExistente.nombre) {
      nuevoSlug = await generarSlugUnico(
        validatedData.nombre,
        async (slug) => {
          const existe = await prisma.equipo.findUnique({ where: { slug } })
          return !!existe && existe.id !== equipoExistente.id
        }
      )
    }

    const equipo = await prisma.equipo.update({
      where: { id: equipoExistente.id },
      data: {
        nombre: validatedData.nombre,
        slug: nuevoSlug,
        escudo: nuevoEscudo,
        vidas: validatedData.vidas,
        estado: validatedData.estado,
      },
    })

    return NextResponse.json(equipo)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al actualizar equipo:', error)
    return NextResponse.json(
      { error: 'Error al actualizar equipo' },
      { status: 500 }
    )
  }
}

// DELETE /api/equipos/[slug] - Eliminar equipo (admin)
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

    // Buscar por slug o ID
    let equipo = await prisma.equipo.findUnique({
      where: { slug: params.id },
      include: {
        _count: {
          select: {
            partidosLocal: true,
            partidosVisitante: true,
            jugadores: true,
          },
        },
      },
    })

    if (!equipo) {
      equipo = await prisma.equipo.findUnique({
        where: { id: params.id },
        include: {
          _count: {
            select: {
              partidosLocal: true,
              partidosVisitante: true,
              jugadores: true,
            },
          },
        },
      })
    }

    if (!equipo) {
      return NextResponse.json(
        { error: 'Equipo no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que no tenga partidos o jugadores asociados
    const tienePartidos = equipo._count.partidosLocal > 0 || equipo._count.partidosVisitante > 0
    const tieneJugadores = equipo._count.jugadores > 0

    if (tienePartidos || tieneJugadores) {
      return NextResponse.json(
        { error: 'No se puede eliminar un equipo con partidos o jugadores asociados' },
        { status: 400 }
      )
    }

    // Eliminar escudo si existe
    if (equipo.escudo && equipo.escudo.startsWith('/uploads/')) {
      await deleteFile(equipo.escudo)
    }

    await prisma.equipo.delete({
      where: { id: equipo.id },
    })

    return NextResponse.json({ message: 'Equipo eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar equipo:', error)
    return NextResponse.json(
      { error: 'Error al eliminar equipo' },
      { status: 500 }
    )
  }
}

