'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { TIPO_ARCHIVO_PDF } from '@/lib/actividad-archivos'
import type { ActionState } from '@/lib/types/admin'

async function requireAdmin() {
  const session = await getSession()
  if (!session) throw new Error('No autorizado.')
  return session
}

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

    const { error } = await supabaseAdmin.from('archivos_actividades').insert({
      id_actividad,
      ruta_archivo,
      tipo_archivo: TIPO_ARCHIVO_PDF,
    })

    if (error) return { error: 'Error al crear: ' + error.message }
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

    const { error } = await supabaseAdmin
      .from('archivos_actividades')
      .update({ id_actividad, ruta_archivo, tipo_archivo: TIPO_ARCHIVO_PDF })
      .eq('id_archivo_activi', id)

    if (error) return { error: 'Error al actualizar: ' + error.message }
    revalidate()
    return { success: 'Documento actualizado.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}

export async function eliminarDocumento(id: number): Promise<ActionState> {
  try {
    await requireAdmin()
    const { error } = await supabaseAdmin
      .from('archivos_actividades')
      .delete()
      .eq('id_archivo_activi', id)
    if (error) return { error: 'Error al eliminar: ' + error.message }
    revalidate()
    return { success: 'Documento eliminado.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}
