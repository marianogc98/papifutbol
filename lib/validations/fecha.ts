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
  fecha: z.date({
    required_error: 'La fecha es requerida',
  }),
})

// Tipo para el formulario (acepta string o Date para fecha)
// Permite string vacío para los defaultValues, pero el schema validará que sea una fecha válida
export type FechaFormData = Omit<z.infer<typeof fechaSchema>, 'fecha'> & {
  fecha: Date | string
}

