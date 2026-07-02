'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin, parsePositiveInt } from '@/lib/auth-admin'
import { revalidatePath } from 'next/cache'
import { TIPO_ARCHIVO_PDF } from '@/lib/actividad-archivos'
import { parseUrlHttp, assertIdEntero } from '@/lib/validar-input'
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
    const id_actividad = parsePositiveInt(formData.get('id_actividad'))
    const ruta_archivo = parseUrlHttp(formData.get('ruta_archivo'))

    if (!id_actividad) return { error: 'Selecciona una actividad.' }
    if (!ruta_archivo) return { error: 'La URL del PDF es obligatoria y debe ser válida.' }

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
    const id = parsePositiveInt(formData.get('id_archivo_activi'))
    const id_actividad = parsePositiveInt(formData.get('id_actividad'))
    const ruta_archivo = parseUrlHttp(formData.get('ruta_archivo'))

    if (!id) return { error: 'ID de documento inválido.' }
    if (!id_actividad) return { error: 'Selecciona una actividad.' }
    if (!ruta_archivo) return { error: 'La URL del PDF es obligatoria y debe ser válida.' }

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
    const safeId = assertIdEntero(id)
    if (!safeId) return { error: 'ID de documento inválido.' }

    const { error } = await supabaseAdmin
      .from('archivos_actividades')
      .delete()
      .eq('id_archivo_activi', safeId)
    if (error) return { error: 'Error al eliminar: ' + error.message }
    revalidate()
    return { success: 'Documento eliminado.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}
