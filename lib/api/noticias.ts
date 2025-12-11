import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { NoticiaFormData } from '@/lib/validations/noticia'
import { apiUrl } from '@/lib/utils/api'

export type Noticia = {
  id: string
  titulo: string
  contenido: string | null
  tipo: 'informacion' | 'urgente' | 'otra'
  url: string | null
  orden: number
  createdAt: string
  updatedAt: string
}

// Hook para obtener lista de noticias
// - Sin parámetro: devuelve todas las noticias
// - tipo: filtra por tipo específico
export function useNoticias(tipo?: string) {
  return useQuery<Noticia[]>({
    queryKey: ['noticias', tipo],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (tipo) {
        params.append('tipo', tipo)
      }
      const response = await fetch(apiUrl(`api/noticias?${params.toString()}`))
      if (!response.ok) throw new Error('Error al obtener noticias')
      return response.json()
    },
  })
}

// Hook para obtener una noticia por ID
export function useNoticia(id: string) {
  return useQuery<Noticia>({
    queryKey: ['noticia', id],
    queryFn: async () => {
      const response = await fetch(apiUrl(`api/noticias/${id}`))
      if (!response.ok) throw new Error('Error al obtener noticia')
      return response.json()
    },
    enabled: !!id,
  })
}

// Hook para crear noticia
export function useCreateNoticia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: NoticiaFormData) => {
      const response = await fetch(apiUrl('api/noticias'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear noticia')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noticias'] })
    },
  })
}

// Hook para actualizar noticia
export function useUpdateNoticia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: NoticiaFormData }) => {
      const response = await fetch(apiUrl(`api/noticias/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar noticia')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['noticias'] })
      queryClient.invalidateQueries({ queryKey: ['noticia', variables.id] })
    },
  })
}

// Hook para eliminar noticia
export function useDeleteNoticia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(apiUrl(`api/noticias/${id}`), {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar noticia')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['noticias'] })
    },
  })
}

