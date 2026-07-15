import 'server-only'
import { query } from '@/lib/db'
import { saveLocalFile, deleteLocalFile } from '@/lib/storage'
import { TIPO_ARCHIVO_FOTO, TIPO_ARCHIVO_PDF, TIPO_ARCHIVO_VIDEO, MAX_IMAGEN_BYTES, MAX_VIDEO_BYTES, esVideoPermitido } from '@/lib/archivo-constants'
import { validarArchivoImagen } from '@/lib/validar-contenido-archivo'

export { TIPO_ARCHIVO_FOTO, TIPO_ARCHIVO_PDF, TIPO_ARCHIVO_VIDEO } from '@/lib/archivo-constants'
export interface ArchivoActividad {
  id_archivo_activi?: number
  ruta_archivo: string
  tipo_archivo: string
}

export type ActividadConArchivos = {
  archivos_actividades?: ArchivoActividad[] | null
}

export function esFotoMemoria(ruta: string): boolean {
  return /memoria-\d+-/i.test(ruta)
}

export function getRutaImagenActividad(actividad: ActividadConArchivos): string | null {
  const archivos = actividad.archivos_actividades ?? []
  const foto = archivos.find(
    (a) => a.tipo_archivo === TIPO_ARCHIVO_FOTO && !esFotoMemoria(a.ruta_archivo)
  )
  return foto?.ruta_archivo ?? null
}

export function getRutaVideoActividad(actividad: ActividadConArchivos): string | null {
  const archivos = actividad.archivos_actividades ?? []
  const video = archivos.find((a) => a.tipo_archivo === TIPO_ARCHIVO_VIDEO)
  return video?.ruta_archivo ?? null
}

export function getRutasFotosMemoria(actividad: ActividadConArchivos): string[] {
  const archivos = actividad.archivos_actividades ?? []
  return archivos
    .filter((a) => a.tipo_archivo === TIPO_ARCHIVO_FOTO && esFotoMemoria(a.ruta_archivo))
    .map((a) => a.ruta_archivo)
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
    url_video: getRutaVideoActividad(actividad),
  }
}

const MAX_FILE_BYTES = MAX_IMAGEN_BYTES

export async function guardarArchivoActividad(file: File, id_actividad: number): Promise<{ ruta: string; tipo: string } | { error: string }> {
  const validacion = await validarArchivoImagen(file, MAX_FILE_BYTES)
  if ('error' in validacion) return { error: validacion.error }

  const extension = file.name.split('.').pop()
  const safeName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`
  const storagePath = `imagenes/${safeName}`

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
    const viejasFotos = await query('SELECT ruta_archivo FROM archivos_actividades WHERE id_actividad = $1 AND tipo_archivo = $2', [id_actividad, TIPO_ARCHIVO_FOTO])
    for (const f of viejasFotos.rows) {
      if (f.ruta_archivo) await deleteLocalFile(f.ruta_archivo.replace('/uploads/', ''))
    }
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

export async function guardarVideoActividad(file: File, id_actividad: number): Promise<{ ruta: string; tipo: string } | { error: string }> {
  if (file.size > MAX_VIDEO_BYTES) {
    return { error: 'Los videos no pueden superar 100 MB.' }
  }

  if (!esVideoPermitido(file)) {
    return { error: 'Solo se permiten videos MP4, WEBM o MOV.' }
  }

  const extension = file.name.split('.').pop()
  const safeName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`
  const storagePath = `videos/${safeName}`

  let localRuta = ''
  try {
    localRuta = await saveLocalFile(file, storagePath)
  } catch (uploadError: any) {
    return { error: 'Error al subir el video: ' + uploadError.message }
  }

  return {
    ruta: localRuta,
    tipo: TIPO_ARCHIVO_VIDEO,
  }
}

export async function syncVideoActividad(
  id_actividad: number,
  formData: FormData
): Promise<{ error?: string }> {
  const videoFile = formData.get('video_archivo') as File | null
  if (!videoFile || videoFile.size === 0) return {}

  // Delete old video files for this activity
  try {
    const viejosVideos = await query('SELECT id_archivo_activi, ruta_archivo FROM archivos_actividades WHERE id_actividad = $1 AND tipo_archivo = $2', [id_actividad, TIPO_ARCHIVO_VIDEO])
    for (const v of viejosVideos.rows) {
      if (v.ruta_archivo) await deleteLocalFile(v.ruta_archivo.replace('/uploads/', ''))
    }
    if (viejosVideos.rows.length > 0) {
      await query('DELETE FROM archivos_actividades WHERE id_actividad = $1 AND tipo_archivo = $2', [id_actividad, TIPO_ARCHIVO_VIDEO])
    }
  } catch (deleteError: any) {
    return { error: 'Error al limpiar video anterior: ' + deleteError.message }
  }

  const saved = await guardarVideoActividad(videoFile, id_actividad)
  if ('error' in saved) return { error: saved.error }

  try {
    await query(
      'INSERT INTO archivos_actividades (id_actividad, ruta_archivo, tipo_archivo) VALUES ($1, $2, $3)',
      [id_actividad, saved.ruta, saved.tipo]
    )
  } catch (insertError: any) {
    return { error: 'Error al guardar referencia de video: ' + insertError.message }
  }

  return {}
}

export async function eliminarArchivosActividad(id_actividad: number) {
  try {
    const archivos = await query('SELECT ruta_archivo FROM archivos_actividades WHERE id_actividad = $1', [id_actividad])
    for (const a of archivos.rows) {
      if (a.ruta_archivo) await deleteLocalFile(a.ruta_archivo.replace('/uploads/', ''))
    }
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

export async function eliminarArchivoActividadIndividual(id_archivo_activi: number): Promise<{ success?: string, error?: string }> {
  try {
    const res = await query('SELECT ruta_archivo FROM archivos_actividades WHERE id_archivo_activi = $1', [id_archivo_activi])
    if (res.rows.length > 0 && res.rows[0].ruta_archivo) {
      await deleteLocalFile(res.rows[0].ruta_archivo.replace('/uploads/', ''))
      await query('DELETE FROM archivos_actividades WHERE id_archivo_activi = $1', [id_archivo_activi])
      return { success: 'Archivo eliminado' }
    }
    return { error: 'Archivo no encontrado' }
  } catch (error: any) {
    return { error: error.message }
  }
}

export const ACTIVIDADES_COLUMNS =
  'id_actividad, id_usuario, titulo, descripcion, tipo, fecha_publicacion, fecha_inicio, fecha_fin, visible, mostrar_fecha'

export const ACTIVIDADES_SELECT = `${ACTIVIDADES_COLUMNS}, archivos_actividades(id_archivo_activi, ruta_archivo, tipo_archivo)`
