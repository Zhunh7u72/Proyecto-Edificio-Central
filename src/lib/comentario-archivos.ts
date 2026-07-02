import 'server-only'
import { saveLocalFile } from '@/lib/storage'
import { TIPO_ARCHIVO_FOTO, TIPO_ARCHIVO_PDF } from '@/lib/archivo-constants'

const MAX_FILE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])

export function detectTipoArchivoComentario(file: File): typeof TIPO_ARCHIVO_FOTO | typeof TIPO_ARCHIVO_PDF | null {
  const name = file.name.toLowerCase()
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) return TIPO_ARCHIVO_PDF
  if (file.type.startsWith('image/') || ALLOWED_IMAGE_TYPES.has(file.type)) return TIPO_ARCHIVO_FOTO
  if (/\.(jpe?g|png|gif|webp)$/i.test(name)) return TIPO_ARCHIVO_FOTO
  return null
}

export async function guardarArchivoComentario(
  file: File,
  id_actividad: number
): Promise<{ ruta: string; tipo: string } | { error: string }> {
  if (file.size > MAX_FILE_BYTES) {
    return { error: 'El archivo no puede superar 5 MB.' }
  }

  const tipo = detectTipoArchivoComentario(file)
  if (!tipo) {
    return { error: 'Solo se permiten imágenes (JPG, PNG, GIF, WEBP) o PDF.' }
  }

  const extension = file.name.split('.').pop()
  const safeName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`
  const storagePath = `comentarios/${id_actividad}/${safeName}`

  let localRuta = ''
  try {
    localRuta = await saveLocalFile(file, storagePath)
  } catch (uploadError: any) {
    return { error: 'Error al subir el archivo: ' + uploadError.message }
  }

  return {
    ruta: localRuta,
    tipo,
  }
}
