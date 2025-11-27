import { z } from 'zod'

export const noticiaSchema = z.object({
  titulo: z
    .string()
    .min(1, 'El título es requerido')
    .max(200, 'El título no puede exceder 200 caracteres'),
  contenido: z
    .string()
    .max(1000, 'El contenido no puede exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
  tipo: z.enum(['informacion', 'urgente', 'otra'], {
    errorMap: () => ({ message: 'Tipo inválido' }),
  }),
  url: z
    .string()
    .url('Debe ser una URL válida')
    .optional()
    .or(z.literal('')),
  orden: z
    .number()
    .int('Debe ser un número entero')
    .min(0, 'El orden no puede ser negativo')
    .default(0),
})

export type NoticiaFormData = z.infer<typeof noticiaSchema>

