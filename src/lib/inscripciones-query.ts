import 'server-only'
import { supabaseAdmin } from '@/lib/supabase'

export type InscripcionAdmin = {
  id_matricula: number
  fecha_registro: string
  usuarios: { id_usuario: number; nombres: string; apellidos: string; correo: string } | null
  actividades: { id_actividad: number; titulo: string; tipo: string } | null
  pdf_ruta: string | null
}

export async function fetchInscripciones() {
  const { data, error } = await supabaseAdmin
    .from('matriculas_eventos')
    .select(
      'id_matricula, fecha_registro, usuarios(id_usuario, nombres, apellidos, correo), actividades(id_actividad, titulo, tipo)'
    )
    .order('fecha_registro', { ascending: false })

  const inscripciones: InscripcionAdmin[] = await Promise.all(
    (data ?? []).map(async (row) => {
      const usuario = Array.isArray(row.usuarios) ? row.usuarios[0] : row.usuarios
      const actividad = Array.isArray(row.actividades) ? row.actividades[0] : row.actividades

      // Buscar si este usuario subió un PDF para esta actividad
      let pdf_ruta: string | null = null
      if (usuario && actividad) {
        const { data: archivo } = await supabaseAdmin
          .from('archivos_actividades')
          .select('ruta_archivo')
          .eq('id_actividad', actividad.id_actividad)
          .eq('id_usuario', usuario.id_usuario)
          .eq('tipo_archivo', 'pdf')
          .limit(1)
          .maybeSingle()
        pdf_ruta = archivo?.ruta_archivo ?? null
      }

      return {
        id_matricula: row.id_matricula,
        fecha_registro: row.fecha_registro,
        usuarios: usuario ?? null,
        actividades: actividad ?? null,
        pdf_ruta,
      }
    })
  )

  return { inscripciones, error: error?.message ?? null }
}

export async function fetchInscripcionesByActividad(id_actividad: number) {
  const { data, error } = await supabaseAdmin
    .from('matriculas_eventos')
    .select(
      'id_matricula, fecha_registro, usuarios(id_usuario, nombres, apellidos, correo)'
    )
    .eq('id_actividad', id_actividad)
    .order('fecha_registro', { ascending: false })

  const inscripciones: InscripcionAdmin[] = await Promise.all(
    (data ?? []).map(async (row) => {
      const usuario = Array.isArray(row.usuarios) ? row.usuarios[0] : row.usuarios

      let pdf_ruta: string | null = null
      if (usuario) {
        const { data: archivo } = await supabaseAdmin
          .from('archivos_actividades')
          .select('ruta_archivo')
          .eq('id_actividad', id_actividad)
          .eq('id_usuario', usuario.id_usuario)
          .eq('tipo_archivo', 'pdf')
          .limit(1)
          .maybeSingle()
        pdf_ruta = archivo?.ruta_archivo ?? null
      }

      return {
        id_matricula: row.id_matricula,
        fecha_registro: row.fecha_registro,
        usuarios: usuario ?? null,
        actividades: null,
        pdf_ruta,
      }
    })
  )

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

  const allInscritos = data ?? []
  if (allInscritos.length === 0) return map

  const userIds = Array.from(new Set(allInscritos.map(r => Array.isArray(r.usuarios) ? r.usuarios[0]?.id_usuario : r.usuarios?.id_usuario).filter(Boolean)))

  // Get all PDFs for these users and activities
  const { data: archivosData } = await supabaseAdmin
    .from('archivos_actividades')
    .select('id_actividad, id_usuario, ruta_archivo')
    .in('id_actividad', id_actividades)
    .in('id_usuario', userIds)
    .eq('tipo_archivo', 'pdf')

  for (const row of allInscritos) {
    const id = row.id_actividad as number
    const usuario = Array.isArray(row.usuarios) ? row.usuarios[0] : row.usuarios

    let pdf_ruta: string | null = null
    if (usuario && archivosData) {
      const archivo = archivosData.find(a => a.id_actividad === id && a.id_usuario === usuario.id_usuario)
      pdf_ruta = archivo?.ruta_archivo ?? null
    }

    if (!map[id]) map[id] = []
    map[id].push({
      id_matricula: row.id_matricula,
      fecha_registro: row.fecha_registro,
      usuarios: usuario ?? null,
      actividades: null,
      pdf_ruta,
    })
  }

  return map
}
