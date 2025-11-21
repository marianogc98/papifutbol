// Helper para construir URLs de API con basePath
const BASE_PATH = '/papifutbol'

export function apiUrl(path: string): string {
  // Remover el slash inicial si existe para evitar dobles slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${BASE_PATH}/${cleanPath}`
}

