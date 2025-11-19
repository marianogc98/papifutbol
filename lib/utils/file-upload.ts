import { writeFile, unlink, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { randomBytes } from 'crypto'

// Tipos de upload permitidos
export type UploadType = 'equipo' | 'jugador' | 'publicidad'

// Extensiones permitidas
type AllowedExtension = '.jpg' | '.jpeg' | '.png' | '.webp'

// Configuración de uploads
const UPLOAD_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'] as AllowedExtension[],
  basePath: 'public/uploads',
} as const

// Rutas relativas desde public/
const UPLOAD_PATHS: Record<UploadType, string> = {
  equipo: 'uploads/equipos',
  jugador: 'uploads/jugadores',
  publicidad: 'uploads/publicidades',
}

/**
 * Valida el tipo MIME y tamaño del archivo
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Validar tamaño
  if (file.size > UPLOAD_CONFIG.maxSize) {
    return {
      valid: false,
      error: `El archivo es demasiado grande. Tamaño máximo: ${UPLOAD_CONFIG.maxSize / 1024 / 1024}MB`,
    }
  }

  // Validar tipo MIME
  if (!UPLOAD_CONFIG.allowedMimeTypes.includes(file.type as any)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido. Tipos permitidos: ${UPLOAD_CONFIG.allowedExtensions.join(', ')}`,
    }
  }

  // Validar extensión
  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase() as AllowedExtension
  if (!UPLOAD_CONFIG.allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Extensión no permitida. Extensiones permitidas: ${UPLOAD_CONFIG.allowedExtensions.join(', ')}`,
    }
  }

  return { valid: true }
}

/**
 * Genera un nombre único para el archivo
 */
function generateFileName(originalName: string): string {
  const extension = originalName.substring(originalName.lastIndexOf('.')).toLowerCase()
  const timestamp = Date.now()
  const random = randomBytes(4).toString('hex')
  return `${timestamp}-${random}${extension}`
}

/**
 * Obtiene la ruta completa del archivo
 */
function getFilePath(uploadType: UploadType, filename: string): string {
  const uploadPath = UPLOAD_PATHS[uploadType]
  return join(process.cwd(), UPLOAD_CONFIG.basePath, uploadPath.replace('uploads/', ''), filename)
}

/**
 * Obtiene la ruta relativa desde public/ (para guardar en BD)
 */
export function getRelativePath(uploadType: UploadType, filename: string): string {
  const uploadPath = UPLOAD_PATHS[uploadType]
  return `/${uploadPath}/${filename}`
}

/**
 * Crea los directorios necesarios si no existen
 */
async function ensureDirectoriesExist(uploadType: UploadType): Promise<void> {
  const uploadPath = UPLOAD_PATHS[uploadType]
  const fullPath = join(process.cwd(), UPLOAD_CONFIG.basePath, uploadPath.replace('uploads/', ''))
  
  if (!existsSync(fullPath)) {
    await mkdir(fullPath, { recursive: true })
  }
}

/**
 * Guarda un archivo en el sistema de archivos
 */
export async function saveFile(
  uploadType: UploadType,
  file: File
): Promise<{ filename: string; path: string }> {
  // Validar archivo
  const validation = validateFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Asegurar que los directorios existen
  await ensureDirectoriesExist(uploadType)

  // Generar nombre único
  const filename = generateFileName(file.name)

  // Convertir File a Buffer
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Guardar archivo
  const filePath = getFilePath(uploadType, filename)
  await writeFile(filePath, buffer)

  // Retornar información
  return {
    filename,
    path: getRelativePath(uploadType, filename),
  }
}

/**
 * Elimina un archivo del sistema de archivos
 */
export async function deleteFile(imagePath: string | null | undefined): Promise<void> {
  if (!imagePath) return

  // Solo eliminar si es una ruta local (empieza con /uploads/)
  if (!imagePath.startsWith('/uploads/')) {
    // Es una URL externa, no la eliminamos
    return
  }

  try {
    // Remover el / inicial y construir ruta completa
    const relativePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
    const fullPath = join(process.cwd(), 'public', relativePath)

    if (existsSync(fullPath)) {
      await unlink(fullPath)
    }
  } catch (error) {
    // Log error pero no fallar (el archivo puede no existir)
    console.error(`Error al eliminar archivo ${imagePath}:`, error)
  }
}

/**
 * Extrae el nombre del archivo de una ruta
 */
export function extractFilename(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null
  if (!imagePath.startsWith('/uploads/')) return null
  
  const parts = imagePath.split('/')
  return parts[parts.length - 1] || null
}

