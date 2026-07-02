'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth-admin'
import { revalidatePath } from 'next/cache'
import {
  parseCorreo,
  sanitizarTexto,
  parseUrlHttp,
  assertIdEntero,
} from '@/lib/validar-input'

export type AutoridadState = { error?: string; success?: string } | undefined

export async function crearAutoridad(
  state: AutoridadState,
  formData: FormData
): Promise<AutoridadState> {
  try {
    await requireAdmin()
    const nombres = sanitizarTexto(formData.get('nombres'), 100)
    const apellidos = sanitizarTexto(formData.get('apellidos'), 100)
    const correo = parseCorreo(formData.get('correo_contactos'))
    const fotoRaw = sanitizarTexto(formData.get('ruta_foto'), 2048)
    const fotoUrl = fotoRaw ? parseUrlHttp(fotoRaw) ?? '' : ''

    if (!nombres || !apellidos || !correo) {
      return { error: 'Nombres, apellidos y correo válidos son obligatorios.' }
    }
    if (fotoRaw && !fotoUrl) {
      return { error: 'La URL de la foto no es válida.' }
    }

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
  } catch {
    return { error: 'No autorizado.' }
  }
}

export async function eliminarAutoridad(id: number): Promise<AutoridadState> {
  try {
    await requireAdmin()
    const safeId = assertIdEntero(id)
    if (!safeId) return { error: 'ID inválido.' }

    const { error } = await supabaseAdmin
      .from('autoridades_info_institucional')
      .delete()
      .eq('id_autoridades_info_institu', safeId)

    if (error) return { error: 'Error al eliminar: ' + error.message }

    revalidatePath('/admin/institucional')
    revalidatePath('/institucional')
    return { success: 'Representante eliminado.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}
