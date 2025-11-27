import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { saveFile, deleteFile } from '@/lib/utils/file-upload'
import { prisma } from '@/lib/db/prisma'

// POST /api/upload/jugador - Subir foto de jugador (admin/superadmin)
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que sea admin o superadmin
    if (session.user?.role !== 'admin' && session.user?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Obtener datos del form
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const jugadorId = formData.get('jugadorId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 })
    }

    // Si hay jugadorId, obtener la imagen anterior para eliminarla
    let imagenAnterior: string | null = null
    if (jugadorId) {
      const jugador = await prisma.jugador.findUnique({
        where: { id: jugadorId },
        select: { foto: true },
      })
      imagenAnterior = jugador?.foto || null
    }

    // Guardar archivo
    const { filename, path } = await saveFile('jugador', file)

    // Si había imagen anterior, eliminarla
    if (imagenAnterior) {
      await deleteFile(imagenAnterior)
    }

    return NextResponse.json({
      success: true,
      path,
      filename,
    })
  } catch (error: any) {
    console.error('Error al subir imagen de jugador:', error)
    return NextResponse.json(
      { error: error.message || 'Error al subir imagen' },
      { status: 500 }
    )
  }
}

