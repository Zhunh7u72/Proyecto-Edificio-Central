import 'server-only'
import { supabaseAdmin } from '@/lib/supabase'
import { TIPO_ARCHIVO_FOTO, TIPO_ARCHIVO_PDF } from '@/lib/archivo-constants'

export { TIPO_ARCHIVO_FOTO, TIPO_ARCHIVO_PDF } from '@/lib/archivo-constants'
export interface ArchivoActividad {
  id_archivo_activi?: number
  ruta_archivo: string
  tipo_archivo: string
}

export type ActividadConArchivos = {
  archivos_actividades?: ArchivoActividad[] | null
}

export function getRutaImagenActividad(actividad: ActividadConArchivos): string | null {
  const archivos = actividad.archivos_actividades ?? []
  const foto = archivos.find((a) => a.tipo_archivo === TIPO_ARCHIVO_FOTO)
  return foto?.ruta_archivo ?? null
}

export function getRutasImagenesActividad(actividad: ActividadConArchivos): string[] {
  const archivos = actividad.archivos_actividades ?? []
  return archivos
    .filter((a) => a.tipo_archivo === TIPO_ARCHIVO_FOTO)
    .map((a) => a.ruta_archivo)
}

export function mapActividadConImagen<T extends ActividadConArchivos>(actividad: T) {
  const { archivos_actividades, ...rest } = actividad
  return {
    ...rest,
    url_imagen: getRutaImagenActividad(actividad),
  }
}

const MAX_FILE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])

export async function guardarArchivoActividad(file: File, id_actividad: number): Promise<{ ruta: string; tipo: string } | { error: string }> {
  if (file.size > MAX_FILE_BYTES) {
    return { error: 'Las imágenes no pueden superar 5 MB.' }
  }
  
  if (!file.type.startsWith('image/') && !ALLOWED_IMAGE_TYPES.has(file.type) && !/\.(jpe?g|png|gif|webp)$/i.test(file.name)) {
    return { error: 'Solo se permiten imágenes (JPG, PNG, GIF, WEBP).' }
  }

  const extension = file.name.split('.').pop()
  const safeName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`
  const storagePath = `actividades/${id_actividad}/${safeName}`

  const { error: uploadError } = await supabaseAdmin.storage
    .from('archivos_publicos')
    .upload(storagePath, file, { contentType: file.type })

  if (uploadError) {
    return { error: 'Error al subir la imagen: ' + uploadError.message }
  }

  const { data } = supabaseAdmin.storage.from('archivos_publicos').getPublicUrl(storagePath)

  return {
    ruta: data.publicUrl,
    tipo: TIPO_ARCHIVO_FOTO,
  }
}

export async function syncImagenActividad(
  id_actividad: number,
  formData: FormData
): Promise<{ error?: string }> {
  const archivos = formData.getAll('archivos') as File[]
  const archivosValidos = archivos.filter(f => f.size > 0 && f.name)

  if (archivosValidos.length === 0) return {}

  const { error: deleteError } = await supabaseAdmin
    .from('archivos_actividades')
    .delete()
    .eq('id_actividad', id_actividad)
    .eq('tipo_archivo', TIPO_ARCHIVO_FOTO)

  if (deleteError) return { error: 'Error al limpiar imágenes anteriores: ' + deleteError.message }

  for (const archivo of archivosValidos) {
    const saved = await guardarArchivoActividad(archivo, id_actividad)
    if ('error' in saved) return { error: saved.error }

    const { error: insertError } = await supabaseAdmin.from('archivos_actividades').insert({
      id_actividad,
      ruta_archivo: saved.ruta,
      tipo_archivo: saved.tipo,
    })

    if (insertError) return { error: 'Error al guardar referencia de imagen: ' + insertError.message }
  }

  return {}
}

export async function eliminarArchivosActividad(id_actividad: number) {
  await supabaseAdmin
    .from('archivos_actividades')
    .delete()
    .eq('id_actividad', id_actividad)
}

export const ACTIVIDADES_SELECT =
  '*, archivos_actividades(id_archivo_activi, ruta_archivo, tipo_archivo)'
