import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'

// DELETE /api/partidos/[id]/goles/[golId] - Eliminar un gol individual (solo cuando está "jugando")
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; golId: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Verificar que el partido exista y esté en estado "jugando"
    const partido = await prisma.partido.findUnique({
      where: { id: params.id },
    })

    if (!partido) {
      return NextResponse.json(
        { error: 'Partido no encontrado' },
        { status: 404 }
      )
    }

    if (partido.estado !== 'jugando') {
      return NextResponse.json(
        { error: 'Solo se pueden eliminar goles cuando el partido está en estado "jugando"' },
        { status: 400 }
      )
    }

    // Verificar que el gol exista y pertenezca al partido
    const gol = await prisma.gol.findUnique({
      where: { id: params.golId },
    })

    if (!gol) {
      return NextResponse.json(
        { error: 'Gol no encontrado' },
        { status: 404 }
      )
    }

    if (gol.partidoId !== params.id) {
      return NextResponse.json(
        { error: 'El gol no pertenece a este partido' },
        { status: 400 }
      )
    }

    // Eliminar el gol
    await prisma.gol.delete({
      where: { id: params.golId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error al eliminar gol:', error)
    return NextResponse.json(
      { error: error.message || 'Error al eliminar gol' },
      { status: 500 }
    )
  }
}



