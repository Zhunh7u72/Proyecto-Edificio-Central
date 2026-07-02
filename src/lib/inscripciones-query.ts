import 'server-only'
import { supabaseAdmin } from '@/lib/supabase'
import { TIPO_ARCHIVO_PDF } from '@/lib/archivo-constants'

export type InscripcionAdmin = {
  id_matricula: number
  fecha_registro: string
  usuarios: { id_usuario: number; nombres: string; apellidos: string; correo: string } | null
  actividades: { id_actividad: number; titulo: string; tipo: string } | null
  pdf_ruta: string | null
}

type InscripcionRow = {
  id_matricula: number
  id_actividad?: number
  fecha_registro: string
  usuarios:
    | { id_usuario: number; nombres: string; apellidos: string; correo: string }
    | { id_usuario: number; nombres: string; apellidos: string; correo: string }[]
    | null
  actividades?: { id_actividad: number; titulo: string; tipo: string } | { id_actividad: number; titulo: string; tipo: string }[] | null
}

function unwrapUsuario(
  usuarios: InscripcionRow['usuarios']
): { id_usuario: number; nombres: string; apellidos: string; correo: string } | null {
  if (!usuarios) return null
  return Array.isArray(usuarios) ? usuarios[0] ?? null : usuarios
}

function unwrapActividad(
  actividades: InscripcionRow['actividades']
): { id_actividad: number; titulo: string; tipo: string } | null {
  if (!actividades) return null
  return Array.isArray(actividades) ? actividades[0] ?? null : actividades
}

async function fetchPdfMap(
  pairs: { id_actividad: number; id_usuario: number }[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  if (pairs.length === 0) return map

  const actIds = Array.from(new Set(pairs.map((p) => p.id_actividad)))
  const userIds = Array.from(new Set(pairs.map((p) => p.id_usuario)))

  const { data: archivos } = await supabaseAdmin
    .from('archivos_actividades')
    .select('id_actividad, id_usuario, ruta_archivo')
    .in('id_actividad', actIds)
    .in('id_usuario', userIds)
    .eq('tipo_archivo', TIPO_ARCHIVO_PDF)

  for (const archivo of archivos ?? []) {
    map.set(`${archivo.id_actividad}:${archivo.id_usuario}`, archivo.ruta_archivo)
  }

  return map
}

function mapInscripcionRows(
  rows: InscripcionRow[],
  pdfMap: Map<string, string>,
  actividadFija?: number
): InscripcionAdmin[] {
  return rows.map((row) => {
    const usuario = unwrapUsuario(row.usuarios)
    const actividad = unwrapActividad(row.actividades)
    const actId = actividadFija ?? row.id_actividad ?? actividad?.id_actividad

    let pdf_ruta: string | null = null
    if (usuario && actId) {
      pdf_ruta = pdfMap.get(`${actId}:${usuario.id_usuario}`) ?? null
    }

    return {
      id_matricula: row.id_matricula,
      fecha_registro: row.fecha_registro,
      usuarios: usuario,
      actividades: actividad,
      pdf_ruta,
    }
  })
}

export async function fetchInscripciones() {
  const { data, error } = await supabaseAdmin
    .from('matriculas_eventos')
    .select(
      'id_matricula, id_actividad, fecha_registro, usuarios(id_usuario, nombres, apellidos, correo), actividades(id_actividad, titulo, tipo)'
    )
    .order('fecha_registro', { ascending: false })

  const rows = data ?? []
  const pairs = rows
    .map((row) => {
      const usuario = unwrapUsuario(row.usuarios)
      const actividad = unwrapActividad(row.actividades)
      const actId = row.id_actividad ?? actividad?.id_actividad
      if (!usuario || !actId) return null
      return { id_actividad: actId, id_usuario: usuario.id_usuario }
    })
    .filter((p): p is { id_actividad: number; id_usuario: number } => p !== null)

  const pdfMap = await fetchPdfMap(pairs)
  const inscripciones = mapInscripcionRows(rows, pdfMap)

  return { inscripciones, error: error?.message ?? null }
}

export async function fetchInscripcionesByActividad(id_actividad: number) {
  const { data, error } = await supabaseAdmin
    .from('matriculas_eventos')
    .select('id_matricula, fecha_registro, usuarios(id_usuario, nombres, apellidos, correo)')
    .eq('id_actividad', id_actividad)
    .order('fecha_registro', { ascending: false })

  const rows = data ?? []
  const pairs = rows
    .map((row) => {
      const usuario = unwrapUsuario(row.usuarios)
      if (!usuario) return null
      return { id_actividad, id_usuario: usuario.id_usuario }
    })
    .filter((p): p is { id_actividad: number; id_usuario: number } => p !== null)

  const pdfMap = await fetchPdfMap(pairs)
  const inscripciones = mapInscripcionRows(rows, pdfMap, id_actividad)

  return { inscripciones, error: error?.message ?? null }
}

export async function fetchInscripcionesMap(id_actividades: number[]) {
  const map: Record<number, InscripcionAdmin[]> = {}
  for (const id of id_actividades) map[id] = []

  if (id_actividades.length === 0) return map

  const { data } = await supabaseAdmin
    .from('matriculas_eventos')
    .select(
      'id_matricula, id_actividad, fecha_registro, usuarios(id_usuario, nombres, apellidos, correo)'
    )
    .in('id_actividad', id_actividades)
    .order('fecha_registro', { ascending: false })

  const rows = data ?? []
  if (rows.length === 0) return map

  const pairs = rows
    .map((row) => {
      const usuario = unwrapUsuario(row.usuarios)
      if (!usuario) return null
      return { id_actividad: row.id_actividad as number, id_usuario: usuario.id_usuario }
    })
    .filter((p): p is { id_actividad: number; id_usuario: number } => p !== null)

  const pdfMap = await fetchPdfMap(pairs)

  for (const row of rows) {
    const id = row.id_actividad as number
    const usuario = unwrapUsuario(row.usuarios)

    let pdf_ruta: string | null = null
    if (usuario) {
      pdf_ruta = pdfMap.get(`${id}:${usuario.id_usuario}`) ?? null
    }

    if (!map[id]) map[id] = []
    map[id].push({
      id_matricula: row.id_matricula,
      fecha_registro: row.fecha_registro,
      usuarios: usuario,
      actividades: null,
      pdf_ruta,
    })
  }

  return map
}
