import { z } from 'zod'

export const fechaSchema = z.object({
  numero: z
    .number()
    .int('Debe ser un número entero')
    .min(1, 'El número debe ser mayor a 0'),
  nombre: z
    .string()
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  desde: z.date({
    required_error: 'La fecha de inicio es requerida',
  }),
  hasta: z.date({
    required_error: 'La fecha de fin es requerida',
  }),
}).refine((data) => data.hasta >= data.desde, {
  message: 'La fecha de fin debe ser posterior o igual a la fecha de inicio',
  path: ['hasta'],
})

// Tipo para el formulario (acepta string o Date para desde y hasta)
// Permite string vacío para los defaultValues, pero el schema validará que sean fechas válidas
export type FechaFormData = Omit<z.infer<typeof fechaSchema>, 'desde' | 'hasta'> & {
  desde: Date | string
  hasta: Date | string
}

