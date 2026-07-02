import 'server-only'
import { query } from '@/lib/db'
import { TIPO_ARCHIVO_PDF } from '@/lib/archivo-constants'
import { parsePositiveIntList } from '@/lib/validar-input'

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

  const actIds = parsePositiveIntList(Array.from(new Set(pairs.map((p) => p.id_actividad))))
  const userIds = parsePositiveIntList(Array.from(new Set(pairs.map((p) => p.id_usuario))))
  if (actIds.length === 0 || userIds.length === 0) return map

  try {
    const res = await query(
      'SELECT id_actividad, id_usuario, ruta_archivo FROM archivos_actividades WHERE id_actividad = ANY($1) AND id_usuario = ANY($2) AND tipo_archivo = $3',
      [actIds, userIds, TIPO_ARCHIVO_PDF]
    )
    for (const archivo of res.rows ?? []) {
      map.set(`${archivo.id_actividad}:${archivo.id_usuario}`, archivo.ruta_archivo)
    }
  } catch (error) {
    console.error(error)
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

const INSCRIPCIONES_SQL = `
  SELECT m.id_matricula, m.id_actividad, m.fecha_registro,
         (SELECT row_to_json(u) FROM (SELECT id_usuario, nombres, apellidos, correo FROM usuarios WHERE id_usuario = m.id_usuario) u) as usuarios,
         (SELECT row_to_json(a) FROM (SELECT id_actividad, titulo, tipo FROM actividades WHERE id_actividad = m.id_actividad) a) as actividades
  FROM matriculas_eventos m
`

export async function fetchInscripciones() {
  let rows: InscripcionRow[] = []
  let errorMsg = null
  try {
    const res = await query(INSCRIPCIONES_SQL + ' ORDER BY m.fecha_registro DESC')
    rows = res.rows ?? []
  } catch (error: any) {
    errorMsg = error.message
  }
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

  return { inscripciones, error: errorMsg }
}

export async function fetchInscripcionesByActividad(id_actividad: number) {
  const safeId = parsePositiveIntList([id_actividad])[0]
  if (!safeId) return { inscripciones: [], error: 'ID de actividad inválido.' }

  let rows: InscripcionRow[] = []
  let errorMsg = null
  try {
    const res = await query(INSCRIPCIONES_SQL + ' WHERE m.id_actividad = $1 ORDER BY m.fecha_registro DESC', [safeId])
    rows = res.rows ?? []
  } catch (error: any) {
    errorMsg = error.message
  }

  const pairs = rows
    .map((row) => {
      const usuario = unwrapUsuario(row.usuarios)
      if (!usuario) return null
      return { id_actividad: safeId, id_usuario: usuario.id_usuario }
    })
    .filter((p): p is { id_actividad: number; id_usuario: number } => p !== null)

  const pdfMap = await fetchPdfMap(pairs)
  const inscripciones = mapInscripcionRows(rows, pdfMap, safeId)

  return { inscripciones, error: errorMsg }
}

export async function fetchInscripcionesMap(id_actividades: number[]) {
  const map: Record<number, InscripcionAdmin[]> = {}
  const safeIds = parsePositiveIntList(id_actividades)
  for (const id of safeIds) map[id] = []

  if (safeIds.length === 0) return map

  let rows: InscripcionRow[] = []
  try {
    const params = safeIds.map((_, i) => `$${i + 1}`).join(', ')
    const res = await query(
      INSCRIPCIONES_SQL + ` WHERE m.id_actividad IN (${params}) ORDER BY m.fecha_registro DESC`,
      safeIds
    )
    rows = res.rows ?? []
  } catch (error) {
    // Ignore error
  }

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
