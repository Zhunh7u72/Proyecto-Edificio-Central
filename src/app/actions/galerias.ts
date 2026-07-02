'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin, parsePositiveInt } from '@/lib/auth-admin'
import { revalidatePath } from 'next/cache'
import { parseUrlHttp, assertIdEntero } from '@/lib/validar-input'
import type { ActionState } from '@/lib/types/admin'

function revalidate() {
  revalidatePath('/admin/galerias')
  revalidatePath('/admin/dashboard')
}

export async function crearGaleria(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin()
    const id_facultad_carrera = parsePositiveInt(formData.get('id_facultad_carrera'))
    const ruta_foto = parseUrlHttp(formData.get('ruta_foto'))

    if (!id_facultad_carrera) return { error: 'Selecciona una carrera.' }
    if (!ruta_foto) return { error: 'El link de la imagen es obligatorio y debe ser válido.' }

    const { error } = await supabaseAdmin.from('fotos_carreras').insert({
      id_facultad_carrera,
      ruta_foto,
    })

    if (error) return { error: 'Error al crear: ' + error.message }
    revalidate()
    return { success: 'Foto de galería creada exitosamente.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}

export async function actualizarGaleria(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin()
    const id = parsePositiveInt(formData.get('id_foto_carre'))
    const id_facultad_carrera = parsePositiveInt(formData.get('id_facultad_carrera'))
    const ruta_foto = parseUrlHttp(formData.get('ruta_foto'))

    if (!id) return { error: 'ID de foto inválido.' }
    if (!id_facultad_carrera) return { error: 'Selecciona una carrera.' }
    if (!ruta_foto) return { error: 'El link de la imagen es obligatorio y debe ser válido.' }

    const { error } = await supabaseAdmin
      .from('fotos_carreras')
      .update({ id_facultad_carrera, ruta_foto })
      .eq('id_foto_carre', id)

    if (error) return { error: 'Error al actualizar: ' + error.message }
    revalidate()
    return { success: 'Galería actualizada.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}

export async function eliminarGaleria(id: number): Promise<ActionState> {
  try {
    await requireAdmin()
    const safeId = assertIdEntero(id)
    if (!safeId) return { error: 'ID de foto inválido.' }

    const { error } = await supabaseAdmin.from('fotos_carreras').delete().eq('id_foto_carre', safeId)
    if (error) return { error: 'Error al eliminar: ' + error.message }
    revalidate()
    return { success: 'Registro eliminado.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}
