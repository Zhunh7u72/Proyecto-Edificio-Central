'use server'

import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-admin'
import { revalidatePath } from 'next/cache'
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
    const id_facultad_carrera = parseInt(formData.get('id_facultad_carrera') as string)
    const ruta_foto = (formData.get('ruta_foto') as string)?.trim()

    if (!id_facultad_carrera) return { error: 'Selecciona una carrera.' }
    if (!ruta_foto) return { error: 'El link de la imagen es obligatorio.' }

    try {
      await query(
        'INSERT INTO fotos_carreras (id_facultad_carrera, ruta_foto) VALUES ($1, $2)',
        [id_facultad_carrera, ruta_foto]
      )
    } catch (error: any) {
      return { error: 'Error al crear: ' + error.message }
    }
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

    try {
      await query(
        'UPDATE fotos_carreras SET id_facultad_carrera = $1, ruta_foto = $2 WHERE id_foto_carre = $3',
        [id_facultad_carrera, ruta_foto, id]
      )
    } catch (error: any) {
      return { error: 'Error al actualizar: ' + error.message }
    }
    revalidate()
    return { success: 'Galería actualizada.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}

export async function eliminarGaleria(id: number): Promise<ActionState> {
  try {
    await requireAdmin()
    try {
      await query('DELETE FROM fotos_carreras WHERE id_foto_carre = $1', [id])
    } catch (error: any) {
      return { error: 'Error al eliminar: ' + error.message }
    }
    revalidate()
    return { success: 'Registro eliminado.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}
