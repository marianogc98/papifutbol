/**
 * Genera un slug a partir de un texto
 * Convierte a minúsculas, elimina acentos, reemplaza espacios con guiones
 */
export function generarSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD') // Separar caracteres y acentos
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar espacios y caracteres especiales con guiones
    .replace(/^-+|-+$/g, '') // Eliminar guiones al inicio y final
    .trim()
}

/**
 * Genera un slug único agregando un número si es necesario
 */
export async function generarSlugUnico(
  texto: string,
  verificarUnico: (slug: string) => Promise<boolean>,
  intentos: number = 0
): Promise<string> {
  let slug = generarSlug(texto)
  
  // Si es el primer intento y el slug ya existe, agregar número
  if (intentos > 0) {
    slug = `${slug}-${intentos + 1}`
  }
  
  const existe = await verificarUnico(slug)
  
  if (!existe) {
    return slug
  }
  
  // Si existe, intentar con un número mayor
  return generarSlugUnico(texto, verificarUnico, intentos + 1)
}

