import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { resultadoSchema } from '@/lib/validations/partido'

// POST /api/resultados/[partidoId] - Cargar resultado completo (admin)
export async function POST(
  request: NextRequest,
  { params }: { params: { partidoId: string } }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener el partido con equipos
    const partido = await prisma.partido.findUnique({
      where: { id: params.partidoId },
      include: {
        equipoLocal: true,
        equipoVisitante: true,
      },
    })

    if (!partido) {
      return NextResponse.json(
        { error: 'Partido no encontrado' },
        { status: 404 }
      )
    }

    const body = await request.json()
    
    // Agregar IDs de equipos al body para la validación
    const bodyWithEquipos = {
      ...body,
      equipoLocalId: partido.equipoLocalId,
      equipoVisitanteId: partido.equipoVisitanteId,
    }
    
    const validatedData = resultadoSchema.parse(bodyWithEquipos)

    // Usar transacción para asegurar consistencia
    const result = await prisma.$transaction(async (tx) => {
      // Determinar goles según estado
      let golesLocal = validatedData.golesLocal
      let golesVisitante = validatedData.golesVisitante

      // Manejar W.O. (Walkover)
      if (validatedData.estado === 'no_se_presento_local') {
        golesLocal = 0
        golesVisitante = 3
      } else if (validatedData.estado === 'no_se_presento_visitante') {
        golesLocal = 3
        golesVisitante = 0
      }

      // Actualizar partido
      const partidoActualizado = await tx.partido.update({
        where: { id: params.partidoId },
        data: {
          estado: validatedData.estado,
          golesLocal,
          golesVisitante,
        },
      })

      // Eliminar goles existentes
      await tx.gol.deleteMany({
        where: { partidoId: params.partidoId },
      })

      // Crear nuevos goles
      if (validatedData.estado === 'jugado' && validatedData.goles.length > 0) {
        await tx.gol.createMany({
          data: validatedData.goles.map((gol) => ({
            partidoId: params.partidoId,
            jugadorId: gol.jugadorId,
            equipoId: gol.equipoId,
          })),
        })
      }

      // Calcular resultado y descontar vidas si corresponde
      if (validatedData.estado === 'jugado' || 
          validatedData.estado === 'no_se_presento_local' ||
          validatedData.estado === 'no_se_presento_visitante') {
        
        // Determinar ganador/perdedor
        let perdedorId: string | null = null

        if (golesLocal > golesVisitante) {
          perdedorId = partido.equipoVisitanteId
        } else if (golesVisitante > golesLocal) {
          perdedorId = partido.equipoLocalId
        }
        // Si es empate, no se descuenta vida

        // Descontar vida al perdedor
        if (perdedorId) {
          const perdedor = await tx.equipo.findUnique({
            where: { id: perdedorId },
          })

          if (perdedor) {
            const nuevasVidas = Math.max(0, perdedor.vidas - 1)
            
            await tx.equipo.update({
              where: { id: perdedorId },
              data: {
                vidas: nuevasVidas,
                // Si llega a 0 vidas, marcar como eliminado
                estado: nuevasVidas === 0 ? 'eliminado' : perdedor.estado,
              },
            })
          }
        }
      }

      return partidoActualizado
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error al cargar resultado:', error)
    return NextResponse.json(
      { error: 'Error al cargar resultado' },
      { status: 500 }
    )
  }
}

