'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import type { ActionState } from '@/lib/types/admin'

async function requireAdmin() {
  const session = await getSession()
  if (!session) throw new Error('No autorizado.')
  return session
}

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
    const id_facultad_carrera = parseInt(formData.get('id_facultad_carrera') as string)
    const ruta_foto = (formData.get('ruta_foto') as string)?.trim()

    if (!id_facultad_carrera) return { error: 'Selecciona una carrera.' }
    if (!ruta_foto) return { error: 'El link de la imagen es obligatorio.' }

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
    const id = parseInt(formData.get('id_foto_carre') as string)
    const id_facultad_carrera = parseInt(formData.get('id_facultad_carrera') as string)
    const ruta_foto = (formData.get('ruta_foto') as string)?.trim()

    if (!id_facultad_carrera) return { error: 'Selecciona una carrera.' }
    if (!ruta_foto) return { error: 'El link de la imagen es obligatorio.' }

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
    const { error } = await supabaseAdmin.from('fotos_carreras').delete().eq('id_foto_carre', id)
    if (error) return { error: 'Error al eliminar: ' + error.message }
    revalidate()
    return { success: 'Registro eliminado.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}
