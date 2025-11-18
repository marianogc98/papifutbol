import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PublicidadFormData } from '@/lib/validations/publicidad'

export type Publicidad = {
  id: string
  titulo: string
  imagen: string | null
  url: string | null
  activa: boolean
  posicion: string | null
  orden: number
  createdAt: string
  updatedAt: string
}

// Hook para obtener lista de publicidades
// - Sin parámetro o activa=true: devuelve solo publicidades activas (comportamiento público)
// - activa=false: devuelve todas las publicidades (activas e inactivas, para admin)
export function usePublicidades(activa?: boolean) {
  return useQuery<Publicidad[]>({
    queryKey: ['publicidades', activa],
    queryFn: async () => {
      const params = new URLSearchParams()
      // Si queremos todas (activa=false), enviar el parámetro
      // Si queremos solo activas (activa=true o undefined), no enviar parámetro
      if (activa === false) {
        params.append('activa', 'false')
      }
      
      const url = params.toString() 
        ? `/api/publicidades?${params.toString()}`
        : '/api/publicidades'
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Error al obtener publicidades')
      return response.json()
    },
  })
}

// Hook para obtener una publicidad por ID
export function usePublicidad(id: string) {
  return useQuery<Publicidad>({
    queryKey: ['publicidad', id],
    queryFn: async () => {
      const response = await fetch(`/api/publicidades/${id}`)
      if (!response.ok) throw new Error('Error al obtener publicidad')
      return response.json()
    },
    enabled: !!id,
  })
}

// Hook para crear publicidad
export function useCreatePublicidad() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: PublicidadFormData) => {
      const response = await fetch('/api/publicidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear publicidad')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicidades'] })
    },
  })
}

// Hook para actualizar publicidad
export function useUpdatePublicidad() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PublicidadFormData }) => {
      const response = await fetch(`/api/publicidades/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar publicidad')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['publicidades'] })
      queryClient.invalidateQueries({ queryKey: ['publicidad', variables.id] })
    },
  })
}

// Hook para eliminar publicidad
export function useDeletePublicidad() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/publicidades/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar publicidad')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publicidades'] })
    },
  })
}

