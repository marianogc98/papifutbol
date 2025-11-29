import { z } from 'zod'

export const partidoSchema = z.object({
  fechaId: z.string().min(1, 'Debe seleccionar una fecha'),
  fechaHora: z.date().optional(), // Fecha y hora del partido (en UTC)
  equipoLocalId: z.string().min(1, 'Debe seleccionar el equipo local'),
  equipoVisitanteId: z.string().min(1, 'Debe seleccionar el equipo visitante'),
  estado: z.enum([
    'pendiente',
    'jugando',
    'jugado',
    'suspendido',
    'cancelado',
    'no_se_presento_local',
    'no_se_presento_visitante',
  ], {
    errorMap: () => ({ message: 'Estado inválido' }),
  }),
}).refine((data) => data.equipoLocalId !== data.equipoVisitanteId, {
  message: 'El equipo local y visitante deben ser diferentes',
  path: ['equipoVisitanteId'],
})

// Tipo para el formulario (acepta string para hora que se combinará con la fecha)
export type PartidoFormData = Omit<z.infer<typeof partidoSchema>, 'fechaHora'> & {
  fechaHora?: Date | string
  horaLocal?: string // String en formato "HH:mm" para el input time
}

export const resultadoSchema = z.object({
  estado: z.enum([
    'jugando',
    'jugado',
    'suspendido',
    'cancelado',
    'no_se_presento_local',
    'no_se_presento_visitante',
  ]),
  golesLocal: z.number().int().min(0).default(0),
  golesVisitante: z.number().int().min(0).default(0),
  equipoLocalId: z.string().min(1),
  equipoVisitanteId: z.string().min(1),
  goles: z.array(z.object({
    jugadorId: z.string(),
    equipoId: z.string(),
    esPenal: z.boolean().default(false),
    esAutogol: z.boolean().default(false),
  })).default([]),
}).refine((data) => {
  // Si es jugado, la suma de goles debe coincidir
  if (data.estado === 'jugado' && data.goles.length > 0) {
    const golesLocal = data.goles.filter(
      (g) => g.equipoId === data.equipoLocalId && !g.esAutogol
    ).length
    const golesVisitante = data.goles.filter(
      (g) => g.equipoId === data.equipoVisitanteId && !g.esAutogol
    ).length
    return golesLocal === data.golesLocal && golesVisitante === data.golesVisitante
  }
  return true
}, {
  message: 'La suma de goles debe coincidir con el resultado',
  path: ['goles'],
})

export type ResultadoFormData = z.infer<typeof resultadoSchema>

