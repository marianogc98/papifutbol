import { z } from 'zod'

export const publicidadSchema = z.object({
  titulo: z
    .string()
    .min(1, 'El título es requerido')
    .max(200, 'El título no puede exceder 200 caracteres'),
  imagen: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => !val || val.startsWith('/uploads/') || val.startsWith('http'),
      'Debe ser una ruta local (/uploads/...) o una URL válida'
    ),
  url: z
    .string()
    .url('Debe ser una URL válida')
    .optional()
    .or(z.literal('')),
  activa: z.boolean().default(true),
  posicion: z
    .enum(['banner', 'sidebar', 'footer', 'header'], {
      errorMap: () => ({ message: 'Posición inválida' }),
    })
    .optional()
    .or(z.literal('')),
  orden: z
    .number()
    .int('Debe ser un número entero')
    .min(0, 'El orden no puede ser negativo')
    .default(0),
})

export type PublicidadFormData = z.infer<typeof publicidadSchema>








