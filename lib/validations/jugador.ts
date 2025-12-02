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
    .preprocess((val) => {
      // Convertir NaN, string vacío, o valores inválidos a null
      if (val === '' || val === null || val === undefined || (typeof val === 'number' && isNaN(val))) {
        return null
      }
      return val
    }, z
      .union([
        z.number().int('Debe ser un número entero').min(1, 'El número debe ser mayor a 0').max(99, 'El número no puede exceder 99'),
        z.null(),
      ])
      .nullable()
      .optional()
    ),
  fechaNac: z
    .union([z.date(), z.null()])
    .nullable()
    .optional(),
  estado: z.enum(['activo', 'lesionado', 'suspendido', 'dado_de_baja'], {
    errorMap: () => ({ message: 'Estado inválido' }),
  }),
  equipoId: z
    .string()
    .min(1, 'Debe seleccionar un equipo')
    .optional()
    .nullable(),
  foto: z
    .preprocess((val) => {
      // Convertir string vacío, undefined a null
      if (val === '' || val === undefined) {
        return null
      }
      return val
    }, z
      .union([
        z.string().refine(
          (val) => val.startsWith('/uploads/') || val.startsWith('http'),
          'Debe ser una ruta local (/uploads/...) o una URL válida (Cloudinary o externa)'
        ),
        z.null(),
      ])
      .nullable()
      .optional()
    ),
})

// Tipo para el formulario (acepta string o Date para fechaNac)
export type JugadorFormData = Omit<z.infer<typeof jugadorSchema>, 'fechaNac'> & {
  fechaNac?: Date | string | null
}

