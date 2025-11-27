import { v2 as cloudinary } from 'cloudinary'
import { UploadType } from './file-upload'

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Folders en Cloudinary según el tipo de upload
 */
const CLOUDINARY_FOLDERS: Record<UploadType, string> = {
  equipo: 'papifutbol/equipos',
  jugador: 'papifutbol/jugadores',
  publicidad: 'papifutbol/publicidades',
}

/**
 * Verifica si Cloudinary está configurado
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  )
}

/**
 * Sube un archivo a Cloudinary
 */
export async function uploadToCloudinary(
  uploadType: UploadType,
  file: File
): Promise<{ url: string; publicId: string }> {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary no está configurado. Verifica las variables de entorno.')
  }

  // Convertir File a Buffer
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Convertir buffer a base64
  const base64 = buffer.toString('base64')
  const dataUri = `data:${file.type};base64,${base64}`

  // Subir a Cloudinary
  const folder = CLOUDINARY_FOLDERS[uploadType]
  
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      dataUri,
      {
        folder,
        resource_type: 'image',
        overwrite: false,
        unique_filename: true,
        use_filename: true,
        transformation: [
          {
            quality: 'auto',
            fetch_format: 'auto',
          },
        ],
      },
      (error, result) => {
        if (error) {
          reject(new Error(`Error al subir a Cloudinary: ${error.message}`))
          return
        }

        if (!result || !result.secure_url || !result.public_id) {
          reject(new Error('Error: Cloudinary no devolvió una URL válida'))
          return
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        })
      }
    )
  })
}

/**
 * Elimina una imagen de Cloudinary usando su URL o public_id
 */
export async function deleteFromCloudinary(
  imageUrl: string | null | undefined
): Promise<void> {
  if (!imageUrl) return

  // Solo eliminar si es una URL de Cloudinary
  if (!imageUrl.includes('cloudinary.com')) {
    return
  }

  if (!isCloudinaryConfigured()) {
    console.warn('Cloudinary no está configurado, no se puede eliminar la imagen')
    return
  }

  try {
    // Extraer public_id de la URL
    // Formato: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
    const urlParts = imageUrl.split('/')
    const uploadIndex = urlParts.findIndex((part) => part === 'upload')
    
    if (uploadIndex === -1) {
      console.warn('No se pudo extraer public_id de la URL de Cloudinary')
      return
    }

    // Obtener public_id (después de 'upload' y posiblemente 'v{version}')
    let publicIdParts = urlParts.slice(uploadIndex + 1)
    
    // Si el primer elemento es 'v{numero}', saltarlo
    if (publicIdParts[0]?.match(/^v\d+$/)) {
      publicIdParts = publicIdParts.slice(1)
    }

    // Unir las partes y remover la extensión
    let publicId = publicIdParts.join('/')
    publicId = publicId.replace(/\.(jpg|jpeg|png|webp)$/i, '')

    // Eliminar de Cloudinary
    await new Promise<void>((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) {
          console.error(`Error al eliminar imagen de Cloudinary: ${error.message}`)
          reject(error)
          return
        }
        resolve()
      })
    })
  } catch (error) {
    // Log error pero no fallar (la imagen puede no existir)
    console.error(`Error al eliminar imagen de Cloudinary ${imageUrl}:`, error)
  }
}

/**
 * Verifica si una URL es de Cloudinary
 */
export function isCloudinaryUrl(url: string | null | undefined): boolean {
  if (!url) return false
  return url.includes('cloudinary.com')
}

