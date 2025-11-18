import { z } from 'zod'

export const jugadorSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  apellido: z
    .string()
    .min(1, 'El apellido es requerido')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  numero: z
    .number()
    .int('Debe ser un número entero')
    .min(1, 'El número debe ser mayor a 0')
    .max(99, 'El número no puede exceder 99')
    .optional()
    .nullable(),
  fechaNac: z
    .union([z.date(), z.string()])
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return null
      if (val instanceof Date) return val
      return new Date(val)
    }),
  estado: z.enum(['activo', 'lesionado', 'suspendido', 'dado_de_baja'], {
    errorMap: () => ({ message: 'Estado inválido' }),
  }),
  equipoId: z
    .string()
    .min(1, 'Debe seleccionar un equipo')
    .optional()
    .nullable(),
  foto: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || val.startsWith('/uploads/') || val.startsWith('http'),
      'Debe ser una ruta local (/uploads/...) o una URL válida'
    ),
})

export type JugadorFormData = z.infer<typeof jugadorSchema>

