import { NextRequest, NextResponse } from 'next/server'
import { requireSuperAdmin } from '@/lib/auth/session'
import { saveFile, deleteFile } from '@/lib/utils/file-upload'
import { prisma } from '@/lib/db/prisma'

// POST /api/upload/publicidad - Subir imagen de publicidad (solo superadmin)
export async function POST(request: NextRequest) {
  try {
    // Verificar que sea superadmin
    await requireSuperAdmin()

    // Obtener datos del form
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const publicidadId = formData.get('publicidadId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 })
    }

    // Si hay publicidadId, obtener la imagen anterior para eliminarla
    let imagenAnterior: string | null = null
    if (publicidadId) {
      const publicidad = await prisma.publicidad.findUnique({
        where: { id: publicidadId },
        select: { imagen: true },
      })
      imagenAnterior = publicidad?.imagen || null
    }

    // Guardar archivo
    const { filename, path } = await saveFile('publicidad', file)

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
    console.error('Error al subir imagen de publicidad:', error)
    return NextResponse.json(
      { error: error.message || 'Error al subir imagen' },
      { status: 500 }
    )
  }
}

