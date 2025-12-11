import { useQuery } from '@tanstack/react-query'
import { apiUrl } from '@/lib/utils/api'

export type Goleador = {
  jugador: {
    id: string
    nombre: string
    apellido: string
    equipo: { id: string; nombre: string; slug: string; escudo: string | null } | null
  }
  totalGoles: number
  goles: Array<{
    id: string
    partido: {
      equipoLocal: { nombre: string }
      equipoVisitante: { nombre: string }
    }
  }>
}

// Hook para obtener tabla de goleadores
export function useGoleadores() {
  return useQuery<Goleador[]>({
    queryKey: ['goleadores'],
    queryFn: async () => {
      const response = await fetch(apiUrl('api/goleadores'))
      if (!response.ok) throw new Error('Error al obtener goleadores')
      return response.json()
    },
  })
}

