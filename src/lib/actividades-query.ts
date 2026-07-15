import 'server-only'
import { query } from '@/lib/db'
import { mapActividadConImagen } from '@/lib/actividad-archivos'
import { fetchComentariosMap } from '@/lib/comentarios-query'
import { fetchInscripcionesMap } from '@/lib/inscripciones-query'
import { parseTipoActividad } from '@/lib/validar-input'
import type { Actividad } from '@/lib/types/admin'
import type { ComentarioPublico } from '@/lib/types/comentarios'

const ACTIVIDADES_SQL = `
  SELECT a.id_actividad, a.id_usuario, a.titulo, a.descripcion, a.tipo, a.fecha_publicacion, a.fecha_inicio, a.fecha_fin, a.visible, a.video_url, a.mostrar_fecha,
         (SELECT json_agg(json_build_object('id_archivo_activi', aa.id_archivo_activi, 'ruta_archivo', aa.ruta_archivo, 'tipo_archivo', aa.tipo_archivo)) 
          FROM archivos_actividades aa WHERE aa.id_actividad = a.id_actividad) as archivos_actividades
  FROM actividades a
`

export async function fetchActividadesByTipo(tipo: string) {
  const tipoSeguro = parseTipoActividad(tipo)
  if (!tipoSeguro) {
    return { data: [] as Actividad[], error: 'Tipo de actividad inválido.' }
  }

  try {
    const res = await query(ACTIVIDADES_SQL + ' WHERE a.tipo = $1 ORDER BY a.fecha_publicacion DESC', [tipoSeguro])
    return {
      data: res.rows.map(mapActividadConImagen) as Actividad[],
      error: null,
    }
  } catch (error: any) {
    return { data: [], error: error.message }
  }
}


export async function fetchActividadesByTipoWithComentarios(tipo: string) {
  const { data, error } = await fetchActividadesByTipo(tipo)
  const idActividades = data.map((a) => a.id_actividad)
  const comentariosPorActividad = await fetchComentariosMap(idActividades)
  const inscripcionesPorActividad = await fetchInscripcionesMap(idActividades)
  return { data, error, comentariosPorActividad, inscripcionesPorActividad }
}

export type ActividadesConComentarios = {
  data: Actividad[]
  error: string | null
  comentariosPorActividad: Record<number, ComentarioPublico[]>
}

export async function fetchAllActividades() {
  try {
    const res = await query(ACTIVIDADES_SQL + ' ORDER BY a.fecha_publicacion DESC')
    return {
      data: res.rows.map(mapActividadConImagen) as Actividad[],
      error: null,
    }
  } catch (error: any) {
    return { data: [], error: error.message }
  }
}

export async function fetchActividadesPublicas(limit = 9) {
  try {
    const res = await query(ACTIVIDADES_SQL + ' WHERE a.visible = true ORDER BY a.fecha_publicacion DESC LIMIT $1', [limit])
    return {
      data: res.rows.map(mapActividadConImagen) as Actividad[],
      error: null,
    }
  } catch (error: any) {
    return { data: [], error: error.message }
  }
}
