import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { JugadorFormData } from '@/lib/validations/jugador'
import { apiUrl } from '@/lib/utils/api'

export type Jugador = {
  id: string
  nombre: string
  apellido: string
  numero: number | null
  fechaNac: string | null
  foto: string | null
  estado: string
  equipoId: string | null
  createdAt: string
  updatedAt: string
  equipo?: {
    id: string
    nombre: string
  }
}

export type JugadorDetalle = Jugador & {
  goles: Array<{
    id: string
    esPenal: boolean
    partido: {
      equipoLocal: { nombre: string }
      equipoVisitante: { nombre: string }
    }
  }>
}

// Hook para obtener lista de jugadores
export function useJugadores(equipoId?: string, estado?: string) {
  return useQuery<Jugador[]>({
    queryKey: ['jugadores', equipoId, estado],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (equipoId) params.append('equipoId', equipoId)
      if (estado) params.append('estado', estado)
      
      const response = await fetch(apiUrl(`api/jugadores?${params.toString()}`))
      if (!response.ok) throw new Error('Error al obtener jugadores')
      return response.json()
    },
  })
}

// Hook para obtener un jugador por ID
export function useJugador(id: string) {
  return useQuery<JugadorDetalle>({
    queryKey: ['jugador', id],
    queryFn: async () => {
      const response = await fetch(apiUrl(`api/jugadores/${id}`))
      if (!response.ok) throw new Error('Error al obtener jugador')
      return response.json()
    },
    enabled: !!id,
  })
}

// Hook para crear jugador
export function useCreateJugador() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: JugadorFormData) => {
      const response = await fetch(apiUrl('api/jugadores'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear jugador')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jugadores'] })
    },
  })
}

// Hook para actualizar jugador
export function useUpdateJugador() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: JugadorFormData }) => {
      const response = await fetch(`/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar jugador')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jugadores'] })
      queryClient.invalidateQueries({ queryKey: ['jugador', variables.id] })
    },
  })
}

// Hook para eliminar jugador
export function useDeleteJugador() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar jugador')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jugadores'] })
    },
  })
}

