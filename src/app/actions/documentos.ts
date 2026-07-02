'use server'

import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-admin'
import { revalidatePath } from 'next/cache'
import { TIPO_ARCHIVO_PDF } from '@/lib/actividad-archivos'
import type { ActionState } from '@/lib/types/admin'

function revalidate() {
  revalidatePath('/admin/documentos')
  revalidatePath('/admin/dashboard')
}

export async function crearDocumento(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin()
    const id_actividad = parseInt(formData.get('id_actividad') as string)
    const ruta_archivo = (formData.get('ruta_archivo') as string)?.trim()

    if (!id_actividad) return { error: 'Selecciona una actividad.' }
    if (!ruta_archivo) return { error: 'La URL del PDF es obligatoria.' }

    try {
      await query(
        'INSERT INTO archivos_actividades (id_actividad, ruta_archivo, tipo_archivo) VALUES ($1, $2, $3)',
        [id_actividad, ruta_archivo, TIPO_ARCHIVO_PDF]
      )
    } catch (error: any) {
      return { error: 'Error al crear: ' + error.message }
    }
    revalidate()
    return { success: 'Documento PDF creado exitosamente.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}

export async function actualizarDocumento(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin()
    const id = parseInt(formData.get('id_archivo_activi') as string)
    const id_actividad = parseInt(formData.get('id_actividad') as string)
    const ruta_archivo = (formData.get('ruta_archivo') as string)?.trim()

    if (!id_actividad) return { error: 'Selecciona una actividad.' }
    if (!ruta_archivo) return { error: 'La URL del PDF es obligatoria.' }

    try {
      await query(
        'UPDATE archivos_actividades SET id_actividad = $1, ruta_archivo = $2, tipo_archivo = $3 WHERE id_archivo_activi = $4',
        [id_actividad, ruta_archivo, TIPO_ARCHIVO_PDF, id]
      )
    } catch (error: any) {
      return { error: 'Error al actualizar: ' + error.message }
    }
    revalidate()
    return { success: 'Documento actualizado.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}

export async function eliminarDocumento(id: number): Promise<ActionState> {
  try {
    await requireAdmin()
    try {
      await query('DELETE FROM archivos_actividades WHERE id_archivo_activi = $1', [id])
    } catch (error: any) {
      return { error: 'Error al eliminar: ' + error.message }
    }
    revalidate()
    return { success: 'Documento eliminado.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}
