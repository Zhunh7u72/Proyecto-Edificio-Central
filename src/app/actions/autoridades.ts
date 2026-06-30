'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export type AutoridadState = { error?: string; success?: string } | undefined

// ── CREAR REPRESENTANTE ────────────────────────────────────────────────
export async function crearAutoridad(
  state: AutoridadState,
  formData: FormData
): Promise<AutoridadState> {
  const nombres = (formData.get('nombres') as string)?.trim()
  const apellidos = (formData.get('apellidos') as string)?.trim()
  const correo = (formData.get('correo_contactos') as string)?.trim()
  const fotoUrl = (formData.get('ruta_foto') as string)?.trim() || ''

  if (!nombres || !apellidos || !correo) {
    return { error: 'Nombres, apellidos y correo son obligatorios.' }
  }

  // id_info_inst: usar el primero disponible (fila única de información institucional)
  const { data: info } = await supabaseAdmin
    .from('informacion_institucional')
    .select('id_info_inst')
    .limit(1)
    .maybeSingle()

  if (!info) {
    return { error: 'No existe un registro de información institucional. Crea uno primero.' }
  }

  const { error } = await supabaseAdmin.from('autoridades_info_institucional').insert({
    nombres,
    apellidos,
    correo_contactos: correo,
    ruta_foto: fotoUrl,
    id_info_inst: info.id_info_inst,
  })

  if (error) return { error: 'Error al crear representante: ' + error.message }

  revalidatePath('/admin/institucional')
  revalidatePath('/institucional')
  return { success: `Representante ${nombres} ${apellidos} creado correctamente.` }
}

// ── ELIMINAR REPRESENTANTE ────────────────────────────────────────────
export async function eliminarAutoridad(id: number) {
  await supabaseAdmin
    .from('autoridades_info_institucional')
    .delete()
    .eq('id_autoridades_info_institu', id)

  revalidatePath('/admin/institucional')
  revalidatePath('/institucional')
}
