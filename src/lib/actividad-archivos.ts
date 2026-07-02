import 'server-only'
import { query } from '@/lib/db'
import { saveLocalFile } from '@/lib/storage'
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

  let localRuta = ''
  try {
    localRuta = await saveLocalFile(file, storagePath)
  } catch (uploadError: any) {
    return { error: 'Error al subir la imagen: ' + uploadError.message }
  }

  return {
    ruta: localRuta,
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

  try {
    await query('DELETE FROM archivos_actividades WHERE id_actividad = $1 AND tipo_archivo = $2', [id_actividad, TIPO_ARCHIVO_FOTO])
  } catch (deleteError: any) {
    return { error: 'Error al limpiar imágenes anteriores: ' + deleteError.message }
  }

  for (const archivo of archivosValidos) {
    const saved = await guardarArchivoActividad(archivo, id_actividad)
    if ('error' in saved) return { error: saved.error }

    try {
      await query(
        'INSERT INTO archivos_actividades (id_actividad, ruta_archivo, tipo_archivo) VALUES ($1, $2, $3)',
        [id_actividad, saved.ruta, saved.tipo]
      )
    } catch (insertError: any) {
      return { error: 'Error al guardar referencia de imagen: ' + insertError.message }
    }
  }

  return {}
}

export async function eliminarArchivosActividad(id_actividad: number) {
  try {
    await query('DELETE FROM archivos_actividades WHERE id_actividad = $1', [id_actividad])
  } catch (e) {
    console.error(e)
  }
}

/** Elimina inscripciones, comentarios y archivos antes de borrar la actividad. */
export async function eliminarDependenciasActividad(id_actividad: number) {
  const resCom = await query('SELECT id_comentario FROM comentarios WHERE id_actividad = $1', [id_actividad])
  const idsComentarios = resCom.rows.map(c => c.id_comentario)

  if (idsComentarios.length > 0) {
    try {
      await query('DELETE FROM archivos_interaccion WHERE id_comentario = ANY($1)', [idsComentarios])
    } catch (archivosError: any) {
      throw new Error(archivosError.message)
    }
  }

  try {
    await query('DELETE FROM comentarios WHERE id_actividad = $1', [id_actividad])
  } catch (comentariosError: any) {
    throw new Error(comentariosError.message)
  }

  try {
    await query('DELETE FROM matriculas_eventos WHERE id_actividad = $1', [id_actividad])
  } catch (inscripcionesError: any) {
    throw new Error(inscripcionesError.message)
  }

  await eliminarArchivosActividad(id_actividad)
}

export const ACTIVIDADES_COLUMNS =
  'id_actividad, id_usuario, titulo, descripcion, tipo, fecha_publicacion, fecha_inicio, fecha_fin, visible'

export const ACTIVIDADES_SELECT = `${ACTIVIDADES_COLUMNS}, archivos_actividades(id_archivo_activi, ruta_archivo, tipo_archivo)`
