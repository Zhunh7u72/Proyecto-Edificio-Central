import 'server-only'
import { supabaseAdmin } from '@/lib/supabase'
import { TIPO_ARCHIVO_FOTO, TIPO_ARCHIVO_PDF, MAX_IMAGEN_BYTES } from '@/lib/archivo-constants'
import { validarArchivoImagen } from '@/lib/validar-contenido-archivo'

export { TIPO_ARCHIVO_FOTO, TIPO_ARCHIVO_PDF } from '@/lib/archivo-constants'
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
  }
}

const MAX_FILE_BYTES = MAX_IMAGEN_BYTES

export async function guardarArchivoActividad(file: File, id_actividad: number): Promise<{ ruta: string; tipo: string } | { error: string }> {
  const validacion = await validarArchivoImagen(file, MAX_FILE_BYTES)
  if ('error' in validacion) return { error: validacion.error }

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

/** Elimina inscripciones, comentarios y archivos antes de borrar la actividad. */
export async function eliminarDependenciasActividad(id_actividad: number) {
  const { data: comentarios } = await supabaseAdmin
    .from('comentarios')
    .select('id_comentario')
    .eq('id_actividad', id_actividad)

  const idsComentarios = (comentarios ?? []).map((c) => c.id_comentario)

  if (idsComentarios.length > 0) {
    const { error: archivosError } = await supabaseAdmin
      .from('archivos_interaccion')
      .delete()
      .in('id_comentario', idsComentarios)

    if (archivosError) throw new Error(archivosError.message)
  }

  const { error: comentariosError } = await supabaseAdmin
    .from('comentarios')
    .delete()
    .eq('id_actividad', id_actividad)

  if (comentariosError) throw new Error(comentariosError.message)

  const { error: inscripcionesError } = await supabaseAdmin
    .from('matriculas_eventos')
    .delete()
    .eq('id_actividad', id_actividad)

  if (inscripcionesError) throw new Error(inscripcionesError.message)

  await eliminarArchivosActividad(id_actividad)
}

export const ACTIVIDADES_COLUMNS =
  'id_actividad, id_usuario, titulo, descripcion, tipo, fecha_publicacion, fecha_inicio, fecha_fin, visible'

export const ACTIVIDADES_SELECT = `${ACTIVIDADES_COLUMNS}, archivos_actividades(id_archivo_activi, ruta_archivo, tipo_archivo)`
