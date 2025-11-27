// Helper para construir URLs de API
export function apiUrl(path: string): string {
  // Asegurar que el path comience con /
  return path.startsWith('/') ? path : `/${path}`
}

