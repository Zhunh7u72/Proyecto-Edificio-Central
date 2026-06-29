import 'server-only'
import { supabaseAdmin } from '@/lib/supabase'

export type InscripcionAdmin = {
  id_matricula: number
  fecha_registro: string
  usuarios: { nombres: string; apellidos: string; correo: string } | null
  actividades: { id_actividad: number; titulo: string; tipo: string } | null
}

export async function fetchInscripciones() {
  const { data, error } = await supabaseAdmin
    .from('matriculas_eventos')
    .select(
      'id_matricula, fecha_registro, usuarios(nombres, apellidos, correo), actividades(id_actividad, titulo, tipo)'
    )
    .order('fecha_registro', { ascending: false })

  const inscripciones: InscripcionAdmin[] = (data ?? []).map((row) => {
    const usuario = Array.isArray(row.usuarios) ? row.usuarios[0] : row.usuarios
    const actividad = Array.isArray(row.actividades) ? row.actividades[0] : row.actividades
    return {
      id_matricula: row.id_matricula,
      fecha_registro: row.fecha_registro,
      usuarios: usuario ?? null,
      actividades: actividad ?? null,
    }
  })

  return { inscripciones, error: error?.message ?? null }
}
