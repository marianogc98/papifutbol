import { z } from 'zod'

// Schema para agregar un gol individual
export const agregarGolSchema = z.object({
  jugadorId: z.string().min(1, 'Debe seleccionar un jugador'),
  equipoId: z.string().min(1, 'Debe seleccionar un equipo'),
})

export type AgregarGolFormData = z.infer<typeof agregarGolSchema>

// Schema para actualizar goles del equipo
export const actualizarGolesEquipoSchema = z.object({
  golesLocal: z.number().int().min(0),
  golesVisitante: z.number().int().min(0),
})

export type ActualizarGolesEquipoFormData = z.infer<typeof actualizarGolesEquipoSchema>



