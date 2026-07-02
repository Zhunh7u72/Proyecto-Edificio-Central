import 'server-only'
import { supabaseAdmin } from '@/lib/supabase'
import { ACTIVIDADES_SELECT, mapActividadConImagen } from '@/lib/actividad-archivos'
import { fetchComentariosMap } from '@/lib/comentarios-query'
import { parseTipoActividad } from '@/lib/validar-input'
import type { Actividad } from '@/lib/types/admin'
import type { ComentarioPublico } from '@/lib/types/comentarios'

export async function fetchActividadesByTipo(tipo: string) {
  const tipoSeguro = parseTipoActividad(tipo)
  if (!tipoSeguro) {
    return { data: [] as Actividad[], error: 'Tipo de actividad inválido.' }
  }

  const { data, error } = await supabaseAdmin
    .from('actividades')
    .select(ACTIVIDADES_SELECT)
    .eq('tipo', tipoSeguro)
    .order('fecha_publicacion', { ascending: false })

  return {
    data: (data ?? []).map(mapActividadConImagen) as Actividad[],
    error: error?.message ?? null,
  }
}

import { fetchInscripcionesMap } from '@/lib/inscripciones-query'

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
  const { data, error } = await supabaseAdmin
    .from('actividades')
    .select(ACTIVIDADES_SELECT)
    .order('fecha_publicacion', { ascending: false })

  return {
    data: (data ?? []).map(mapActividadConImagen) as Actividad[],
    error: error?.message ?? null,
  }
}

export async function fetchActividadesPublicas(limit = 9) {
  const { data, error } = await supabaseAdmin
    .from('actividades')
    .select(ACTIVIDADES_SELECT)
    .eq('visible', true)
    .order('fecha_publicacion', { ascending: false })
    .limit(limit)

  return {
    data: (data ?? []).map(mapActividadConImagen) as Actividad[],
    error,
  }
}
