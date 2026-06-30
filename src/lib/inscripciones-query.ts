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
