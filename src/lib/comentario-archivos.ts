import 'server-only'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
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

  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const relDir = path.join('uploads', 'comentarios', String(id_actividad))
  const absDir = path.join(process.cwd(), 'public', relDir)

  await mkdir(absDir, { recursive: true })

  const bytes = await file.arrayBuffer()
  await writeFile(path.join(absDir, safeName), Buffer.from(bytes))

  return {
    ruta: `/${relDir.replace(/\\/g, '/')}/${safeName}`,
    tipo,
  }
}
