'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { syncImagenActividad, eliminarArchivosActividad } from '@/lib/actividad-archivos'
import type { ActionState } from '@/lib/types/admin'

async function requireAdmin() {
  const session = await getSession()
  if (!session) throw new Error('No autorizado.')
  return session
}

function buildActividadPayload(formData: FormData, tipo: string) {
  const titulo = (formData.get('titulo') as string)?.trim()
  const descripcion = (formData.get('descripcion') as string)?.trim() || null
  const fecha_inicio = (formData.get('fecha_inicio') as string) || null
  const fecha_fin = (formData.get('fecha_fin') as string) || null

  if (!titulo) return { error: 'El título es obligatorio.' as const, payload: null }

  const payload: Record<string, unknown> = {
    titulo,
    descripcion,
    tipo,
    fecha_inicio: fecha_inicio || null,
    fecha_fin: fecha_fin || null,
  }

  return { error: null, payload }
}

function revalidateActividadPaths() {
  revalidatePath('/admin/anuncios')
  revalidatePath('/admin/eventos')
  revalidatePath('/admin/capacitaciones')
  revalidatePath('/admin/talleres')
  revalidatePath('/admin/actividades')
  revalidatePath('/admin/dashboard')
  revalidatePath('/')
}

export async function crearActividad(
  state: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const session = await requireAdmin()
    const tipo = formData.get('tipo') as string
    const { error, payload } = buildActividadPayload(formData, tipo)

    if (error || !payload) return { error: error ?? 'Datos inválidos.' }

    const { data: inserted, error: dbError } = await supabaseAdmin
      .from('actividades')
      .insert({
        ...payload,
        id_usuario: session.userId,
      })
      .select('id_actividad')
      .single()

    if (dbError || !inserted) {
      return { error: 'Error al crear: ' + (dbError?.message ?? 'sin respuesta') }
    }

    const imageResult = await syncImagenActividad(inserted.id_actividad, formData)
    if (imageResult.error) return { error: imageResult.error }

    revalidateActividadPaths()
    return { success: `${tipo} creado exitosamente.` }
  } catch (err: any) {
    console.error('Error en crearActividad:', err)
    if (err.message === 'No autorizado.') return { error: 'No autorizado.' }
    return { error: 'Ocurrió un error inesperado al procesar la solicitud.' }
  }
}

export async function actualizarActividad(
  state: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin()
    const id = parseInt(formData.get('id_actividad') as string)
    const tipo = formData.get('tipo') as string
    const { error, payload } = buildActividadPayload(formData, tipo)

    if (error || !payload) return { error: error ?? 'Datos inválidos.' }

    const { error: dbError } = await supabaseAdmin
      .from('actividades')
      .update(payload)
      .eq('id_actividad', id)

    if (dbError) return { error: 'Error al actualizar: ' + dbError.message }

    const imageResult = await syncImagenActividad(id, formData)
    if (imageResult.error) return { error: imageResult.error }

    revalidateActividadPaths()
    return { success: `${tipo} actualizado exitosamente.` }
  } catch (err: any) {
    console.error('Error en actualizarActividad:', err)
    if (err.message === 'No autorizado.') return { error: 'No autorizado.' }
    return { error: 'Ocurrió un error inesperado al procesar la solicitud.' }
  }
}

export async function eliminarActividad(id: number): Promise<ActionState> {
  try {
    await requireAdmin()

    await eliminarArchivosActividad(id)

    const { error } = await supabaseAdmin
      .from('actividades')
      .delete()
      .eq('id_actividad', id)

    if (error) return { error: 'Error al eliminar: ' + error.message }

    revalidateActividadPaths()
    return { success: 'Registro eliminado.' }
  } catch (err: any) {
    console.error('Error en eliminarActividad:', err)
    if (err.message === 'No autorizado.') return { error: 'No autorizado.' }
    return { error: 'Ocurrió un error inesperado al procesar la solicitud.' }
  }
}

export async function toggleVisibilidadActividad(id: number, visible: boolean): Promise<ActionState> {
  try {
    await requireAdmin()
    const { error } = await supabaseAdmin
      .from('actividades')
      .update({ visible })
      .eq('id_actividad', id)

    if (error) return { error: 'Error al cambiar visibilidad: ' + error.message }

    revalidateActividadPaths()
    return { success: visible ? 'Actividad visible al público.' : 'Actividad oculta del público.' }
  } catch (err: any) {
    console.error('Error en toggleVisibilidadActividad:', err)
    if (err.message === 'No autorizado.') return { error: 'No autorizado.' }
    return { error: 'Ocurrió un error inesperado al procesar la solicitud.' }
  }
}

export async function actualizarInfoActividad(
  id: number,
  data: { titulo?: string; descripcion?: string; fecha_inicio?: string; fecha_fin?: string }
): Promise<ActionState> {
  try {
    await requireAdmin()
    const payload: Record<string, unknown> = {}
    if (data.titulo !== undefined) payload.titulo = data.titulo
    if (data.descripcion !== undefined) payload.descripcion = data.descripcion
    if (data.fecha_inicio !== undefined) payload.fecha_inicio = data.fecha_inicio || null
    if (data.fecha_fin !== undefined) payload.fecha_fin = data.fecha_fin || null

    const { error } = await supabaseAdmin
      .from('actividades')
      .update(payload)
      .eq('id_actividad', id)

    if (error) return { error: 'Error al actualizar: ' + error.message }

    revalidateActividadPaths()
    return { success: 'Información actualizada.' }
  } catch (err: any) {
    console.error('Error en actualizarInfoActividad:', err)
    if (err.message === 'No autorizado.') return { error: 'No autorizado.' }
    return { error: 'Ocurrió un error inesperado al procesar la solicitud.' }
  }
}
