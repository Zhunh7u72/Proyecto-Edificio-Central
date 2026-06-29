import 'server-only'
import { supabaseAdmin } from '@/lib/supabase'
import { ACTIVIDADES_SELECT, mapActividadConImagen } from '@/lib/actividad-archivos'
import { fetchComentariosMap } from '@/lib/comentarios-query'
import type { Actividad } from '@/lib/types/admin'
import type { ComentarioPublico } from '@/lib/types/comentarios'

export async function fetchActividadesByTipo(tipo: string) {
  const { data, error } = await supabaseAdmin
    .from('actividades')
    .select(ACTIVIDADES_SELECT)
    .eq('tipo', tipo)
    .order('fecha_publicacion', { ascending: false })

  return {
    data: (data ?? []).map(mapActividadConImagen) as Actividad[],
    error: error?.message ?? null,
  }
}

export async function fetchActividadesByTipoWithComentarios(tipo: string) {
  const { data, error } = await fetchActividadesByTipo(tipo)
  const comentariosPorActividad = await fetchComentariosMap(data.map((a) => a.id_actividad))
  return { data, error, comentariosPorActividad }
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
    .order('fecha_publicacion', { ascending: false })
    .limit(limit)

  return {
    data: (data ?? []).map(mapActividadConImagen) as Actividad[],
    error,
  }
}
