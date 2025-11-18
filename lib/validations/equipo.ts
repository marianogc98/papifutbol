import { z } from 'zod'

export const equipoSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  escudo: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || val.startsWith('/uploads/') || val.startsWith('http'),
      'Debe ser una ruta local (/uploads/...) o una URL válida'
    ),
  vidas: z
    .number()
    .int('Debe ser un número entero')
    .min(0, 'Las vidas no pueden ser negativas')
    .max(10, 'Las vidas no pueden exceder 10'),
  estado: z.enum(['activo', 'eliminado', 'suspendido', 'descalificado'], {
    errorMap: () => ({ message: 'Estado inválido' }),
  }),
})

export type EquipoFormData = z.infer<typeof equipoSchema>

