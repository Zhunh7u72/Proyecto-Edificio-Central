import 'server-only'
import { supabaseAdmin } from '@/lib/supabase'
import type { ComentarioPublico } from '@/lib/types/comentarios'
import { parsePositiveInt, parsePositiveIntList } from '@/lib/validar-input'

function mapComentarioRow(row: {
  id_comentario: number
  id_actividad: number
  contenido_texto: string
  fecha_comentario: string
  usuarios: { nombres: string; apellidos: string } | { nombres: string; apellidos: string }[] | null
  archivos_interaccion:
    | { id_archivo_inter: number; ruta_archivo: string; tipo_archivo: string }
    | { id_archivo_inter: number; ruta_archivo: string; tipo_archivo: string }[]
    | null
}): ComentarioPublico {
  const usuario = Array.isArray(row.usuarios) ? row.usuarios[0] : row.usuarios
  const archivos = row.archivos_interaccion
  return {
    id_comentario: row.id_comentario,
    contenido_texto: row.contenido_texto,
    fecha_comentario: row.fecha_comentario,
    usuarios: usuario ?? null,
    archivos_interaccion: Array.isArray(archivos) ? archivos : archivos ? [archivos] : [],
  }
}

const COMENTARIOS_SELECT =
  'id_comentario, id_actividad, contenido_texto, fecha_comentario, usuarios(nombres, apellidos), archivos_interaccion(id_archivo_inter, ruta_archivo, tipo_archivo)'

export async function fetchComentariosActividad(id_actividad: number) {
  const safeId = parsePositiveInt(id_actividad)
  if (!safeId) {
    return { comentarios: [], error: 'ID de actividad inválido.' }
  }

  const { data, error } = await supabaseAdmin
    .from('comentarios')
    .select(COMENTARIOS_SELECT)
    .eq('id_actividad', safeId)
    .order('fecha_comentario', { ascending: true })

  return {
    comentarios: (data ?? []).map(mapComentarioRow),
    error: error?.message ?? null,
  }
}

export async function fetchComentariosMap(id_actividades: number[]) {
  const map: Record<number, ComentarioPublico[]> = {}
  const safeIds = parsePositiveIntList(id_actividades)
  for (const id of safeIds) map[id] = []

  if (safeIds.length === 0) return map

  const { data } = await supabaseAdmin
    .from('comentarios')
    .select(COMENTARIOS_SELECT)
    .in('id_actividad', safeIds)
    .order('fecha_comentario', { ascending: true })

  for (const row of data ?? []) {
    const id = row.id_actividad as number
    if (!map[id]) map[id] = []
    map[id].push(mapComentarioRow(row))
  }

  return map
}
