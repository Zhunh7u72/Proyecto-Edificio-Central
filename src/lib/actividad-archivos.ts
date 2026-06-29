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

export function mapActividadConImagen<T extends ActividadConArchivos>(actividad: T) {
  const { archivos_actividades, ...rest } = actividad
  return {
    ...rest,
    url_imagen: getRutaImagenActividad(actividad),
  }
}

export async function syncImagenActividad(
  id_actividad: number,
  formData: FormData
): Promise<{ error?: string }> {
  const ruta = (formData.get('ruta_imagen') as string)?.trim() || null

  await supabaseAdmin
    .from('archivos_actividades')
    .delete()
    .eq('id_actividad', id_actividad)
    .eq('tipo_archivo', TIPO_ARCHIVO_FOTO)

  if (!ruta) return {}

  const { error } = await supabaseAdmin.from('archivos_actividades').insert({
    id_actividad,
    ruta_archivo: ruta,
    tipo_archivo: TIPO_ARCHIVO_FOTO,
  })

  if (error) return { error: 'Error al guardar imagen: ' + error.message }
  return {}
}

export async function eliminarArchivosActividad(id_actividad: number) {
  await supabaseAdmin
    .from('archivos_actividades')
    .delete()
    .eq('id_actividad', id_actividad)
}

/** Elimina inscripciones, comentarios y archivos ligados antes de borrar la actividad. */
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

export const ACTIVIDADES_SELECT =
  '*, archivos_actividades(id_archivo_activi, ruta_archivo, tipo_archivo)'
