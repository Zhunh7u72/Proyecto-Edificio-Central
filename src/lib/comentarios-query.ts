import 'server-only'
import { query } from '@/lib/db'
import type { ComentarioPublico } from '@/lib/types/comentarios'

const COMENTARIOS_SQL = `
  SELECT c.id_comentario, c.id_actividad, c.contenido_texto, c.fecha_comentario,
         (SELECT row_to_json(u) FROM (SELECT nombres, apellidos FROM usuarios WHERE id_usuario = c.id_usuario) u) as usuarios,
         (SELECT json_agg(json_build_object('id_archivo_inter', ai.id_archivo_inter, 'ruta_archivo', ai.ruta_archivo, 'tipo_archivo', ai.tipo_archivo)) 
          FROM archivos_interaccion ai WHERE ai.id_comentario = c.id_comentario) as archivos_interaccion
  FROM comentarios c
`

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

export async function fetchComentariosActividad(id_actividad: number) {
  try {
    const res = await query(COMENTARIOS_SQL + ' WHERE c.id_actividad = $1 ORDER BY c.fecha_comentario ASC', [id_actividad])
    return {
      comentarios: (res.rows ?? []).map(mapComentarioRow),
      error: null,
    }
  } catch (error: any) {
    return { comentarios: [], error: error.message }
  }
}

export async function fetchComentariosMap(id_actividades: number[]) {
  const map: Record<number, ComentarioPublico[]> = {}
  for (const id of id_actividades) map[id] = []

  if (id_actividades.length === 0) return map

  try {
    const res = await query(COMENTARIOS_SQL + ' WHERE c.id_actividad = ANY($1) ORDER BY c.fecha_comentario ASC', [id_actividades])
    for (const row of res.rows ?? []) {
      const id = row.id_actividad as number
      if (!map[id]) map[id] = []
      map[id].push(mapComentarioRow(row))
    }
  } catch (error) {
    console.error(error)
  }

  return map
}
