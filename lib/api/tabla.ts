import { useQuery } from '@tanstack/react-query'
import { apiUrl } from '@/lib/utils/api'

export type TablaEquipo = {
  id: string
  nombre: string
  escudo: string | null
  vidas: number
  estado: string
  partidosJugados: number
  victorias: number
  empates: number
  derrotas: number
  golesAFavor: number
  golesEnContra: number
  diferencia: number
}

// Hook para obtener tabla de vidas
export function useTabla() {
  return useQuery<TablaEquipo[]>({
    queryKey: ['tabla'],
    queryFn: async () => {
      const response = await fetch(apiUrl('api/tabla'))
      if (!response.ok) throw new Error('Error al obtener tabla')
      return response.json()
    },
  })
}

