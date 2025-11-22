import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PartidoFormData, ResultadoFormData } from '@/lib/validations/partido'
import { apiUrl } from '@/lib/utils/api'

export type Partido = {
  id: string
  fechaId: string
  equipoLocalId: string
  equipoVisitanteId: string
  golesLocal: number
  golesVisitante: number
  estado: string
  createdAt: string
  updatedAt: string
  fecha?: {
    id: string
    numero: number
    nombre: string | null
  }
  equipoLocal?: {
    id: string
    nombre: string
    slug: string
    escudo: string | null
  }
  equipoVisitante?: {
    id: string
    nombre: string
    slug: string
    escudo: string | null
  }
  _count?: {
    goles: number
  }
}

export type PartidoDetalle = Partido & {
  fecha: {
    id: string
    numero: number
    nombre: string | null
    fecha: string
  }
  equipoLocal: {
    id: string
    nombre: string
    slug: string
    escudo: string | null
    vidas: number
    estado: string
  }
  equipoVisitante: {
    id: string
    nombre: string
    slug: string
    escudo: string | null
    vidas: number
    estado: string
  }
  goles: Array<{
    id: string
    equipoId: string
    jugador: {
      id: string
      nombre: string
      apellido: string
      numero: number | null
    }
    esPenal: boolean
    esAutogol: boolean
  }>
}

// Hook para obtener lista de partidos
export function usePartidos(fechaId?: string, estado?: string, equipoId?: string) {
  return useQuery<Partido[]>({
    queryKey: ['partidos', fechaId, estado, equipoId],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (fechaId) params.append('fechaId', fechaId)
      if (estado) params.append('estado', estado)
      if (equipoId) params.append('equipoId', equipoId)
      
      const response = await fetch(apiUrl(`api/partidos?${params.toString()}`))
      if (!response.ok) throw new Error('Error al obtener partidos')
      return response.json()
    },
  })
}

// Hook para obtener un partido por ID
export function usePartido(id: string) {
  return useQuery<PartidoDetalle>({
    queryKey: ['partido', id],
    queryFn: async () => {
      const response = await fetch(apiUrl(`api/partidos/${id}`))
      if (!response.ok) throw new Error('Error al obtener partido')
      return response.json()
    },
    enabled: !!id,
  })
}

// Hook para crear partido
export function useCreatePartido() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: PartidoFormData) => {
      const response = await fetch(apiUrl('api/partidos'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al crear partido')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partidos'] })
      queryClient.invalidateQueries({ queryKey: ['fechas'] })
    },
  })
}

// Hook para actualizar partido
export function useUpdatePartido() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PartidoFormData }) => {
      const response = await fetch(apiUrl(`api/partidos/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al actualizar partido')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['partidos'] })
      queryClient.invalidateQueries({ queryKey: ['partido', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['fechas'] })
    },
  })
}

// Hook para eliminar partido
export function useDeletePartido() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(apiUrl(`api/partidos/${id}`), {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar partido')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partidos'] })
      queryClient.invalidateQueries({ queryKey: ['fechas'] })
    },
  })
}

// Hook para cargar resultado
export function useCargarResultado() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ partidoId, data }: { partidoId: string; data: ResultadoFormData }) => {
      const response = await fetch(apiUrl(`api/resultados/${partidoId}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al cargar resultado')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['partidos'] })
      queryClient.invalidateQueries({ queryKey: ['partido', variables.partidoId] })
      queryClient.invalidateQueries({ queryKey: ['equipos'] })
      queryClient.invalidateQueries({ queryKey: ['tabla'] })
      queryClient.invalidateQueries({ queryKey: ['goleadores'] })
    },
  })
}

