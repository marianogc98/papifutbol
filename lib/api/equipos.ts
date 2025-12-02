import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { EquipoFormData } from '@/lib/validations/equipo'
import { apiUrl } from '@/lib/utils/api'

export type Equipo = {
  id: string
  nombre: string
  slug: string
  escudo: string | null
  vidas: number
  estado: string
  createdAt: string
  updatedAt: string
  _count?: {
    jugadores: number
  }
}

export type EquipoDetalle = Equipo & {
  jugadores: Array<{
    id: string
    nombre: string
    apellido: string
    numero: number | null
    foto: string | null
  }>
  estadisticas: {
    partidosJugados: number
    victorias: number
    empates: number
    derrotas: number
    golesAFavor: number
    golesEnContra: number
    diferencia: number
  }
}

// Hook para obtener lista de equipos
export function useEquipos(estado?: string) {
  return useQuery<Equipo[]>({
    queryKey: ['equipos', estado],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (estado) params.append('estado', estado)
      
      const response = await fetch(apiUrl(`api/equipos?${params.toString()}`))
      if (!response.ok) throw new Error('Error al obtener equipos')
      return response.json()
    },
  })
}

// Hook para obtener un equipo por slug o ID
export function useEquipo(slugOrId: string) {
  return useQuery<EquipoDetalle>({
    queryKey: ['equipo', slugOrId],
    queryFn: async () => {
      const response = await fetch(apiUrl(`api/equipos/${slugOrId}`))
      if (!response.ok) throw new Error('Error al obtener equipo')
      return response.json()
    },
    enabled: !!slugOrId,
  })
}

// Hook para crear equipo
export function useCreateEquipo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: EquipoFormData) => {
      const response = await fetch(apiUrl('api/equipos'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear equipo')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipos'] })
    },
  })
}

// Hook para actualizar equipo
export function useUpdateEquipo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: EquipoFormData }) => {
      const response = await fetch(apiUrl(`api/equipos/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar equipo')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipos'] })
      queryClient.invalidateQueries({ queryKey: ['equipo', variables.id] })
    },
  })
}

// Hook para eliminar equipo
export function useDeleteEquipo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(apiUrl(`api/equipos/${id}`), {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar equipo')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipos'] })
    },
  })
}

