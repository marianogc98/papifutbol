import { useQuery } from '@tanstack/react-query'

export type Goleador = {
  jugador: {
    id: string
    nombre: string
    apellido: string
    numero: number | null
    equipo: { id: string; nombre: string } | null
  }
  totalGoles: number
  penales: number
  goles: Array<{
    id: string
    esPenal: boolean
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
      const response = await fetch('/api/goleadores')
      if (!response.ok) throw new Error('Error al obtener goleadores')
      return response.json()
    },
  })
}

