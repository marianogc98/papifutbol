import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FechaFormData } from '@/lib/validations/fecha'
import { apiUrl } from '@/lib/utils/api'

export type Fecha = {
  id: string
  numero: number
  nombre: string | null
  fecha: string
  createdAt: string
  updatedAt: string
  _count?: {
    partidos: number
  }
}

export type FechaDetalle = Fecha & {
  partidos: Array<{
    id: string
    equipoLocal: { id: string; nombre: string; escudo: string | null }
    equipoVisitante: { id: string; nombre: string; escudo: string | null }
    golesLocal: number
    golesVisitante: number
    estado: string
  }>
  equiposLibres?: Array<{
    id: string
    nombre: string
    escudo: string | null
  }>
}

// Hook para obtener lista de fechas
export function useFechas() {
  return useQuery<Fecha[]>({
    queryKey: ['fechas'],
    queryFn: async () => {
      const response = await fetch(apiUrl('api/fechas'))
      if (!response.ok) throw new Error('Error al obtener fechas')
      return response.json()
    },
  })
}

// Hook para obtener una fecha por ID
export function useFecha(id: string) {
  return useQuery<FechaDetalle>({
    queryKey: ['fecha', id],
    queryFn: async () => {
      const response = await fetch(apiUrl(`api/fechas/${id}`))
      if (!response.ok) throw new Error('Error al obtener fecha')
      return response.json()
    },
    enabled: !!id,
  })
}

// Hook para crear fecha
export function useCreateFecha() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: FechaFormData) => {
      const response = await fetch(apiUrl('api/fechas'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear fecha')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fechas'] })
    },
  })
}

// Hook para actualizar fecha
export function useUpdateFecha() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FechaFormData }) => {
      const response = await fetch(`/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar fecha')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fechas'] })
      queryClient.invalidateQueries({ queryKey: ['fecha', variables.id] })
    },
  })
}

// Hook para eliminar fecha
export function useDeleteFecha() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar fecha')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fechas'] })
    },
  })
}

