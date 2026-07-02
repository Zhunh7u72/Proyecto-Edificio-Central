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
  revalidatePath('/admin/asociaciones')
  revalidatePath('/admin/galerias')
  revalidatePath('/admin/dashboard')
}

const TIPOS_CONTACTO = new Set(['telf', 'mail', 'whatsapp'])

async function syncContactoCarrera(id_facultad_carrera: number, formData: FormData) {
  const contacto = (formData.get('contacto') as string)?.trim() || null
  const tipo_contacto = (formData.get('tipo_contacto') as string)?.trim() || null

  if (!contacto) {
    await supabaseAdmin
      .from('contactos_carreras')
      .delete()
      .eq('id_facultad_carrera', id_facultad_carrera)
    return
  }

  const tipo = tipo_contacto && TIPOS_CONTACTO.has(tipo_contacto) ? tipo_contacto : 'mail'

  await supabaseAdmin.from('contactos_carreras').upsert({
    id_facultad_carrera,
    contacto,
    tipo_contacto: tipo,
  }, { onConflict: 'id_facultad_carrera' })
}

export async function crearAsociacion(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin()
    const id_facultad = parseInt(formData.get('id_facultad') as string)
    const nombre_carrera = (formData.get('nombre_carrera') as string)?.trim()

    if (!id_facultad) return { error: 'Selecciona una facultad.' }
    if (!nombre_carrera) return { error: 'El nombre de la carrera es obligatorio.' }

    const { data, error } = await supabaseAdmin
      .from('facultades_carreras')
      .insert({ id_facultad, nombre_carrera })
      .select('id_facultad_carrera')
      .single()

    if (error || !data) return { error: 'Error al crear: ' + (error?.message ?? 'sin respuesta') }

    await syncContactoCarrera(data.id_facultad_carrera, formData)
    revalidate()
    return { success: 'Asociación / carrera creada exitosamente.' }
  } catch (err: any) {
    console.error('Error en crearAsociacion:', err)
    if (err.message === 'No autorizado.') return { error: 'No autorizado.' }
    return { error: 'Ocurrió un error inesperado al procesar la solicitud.' }
  }
}

export async function actualizarAsociacion(
  _state: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAdmin()
    const id = parseInt(formData.get('id_facultad_carrera') as string)
    const id_facultad = parseInt(formData.get('id_facultad') as string)
    const nombre_carrera = (formData.get('nombre_carrera') as string)?.trim()

    if (!id_facultad) return { error: 'Selecciona una facultad.' }
    if (!nombre_carrera) return { error: 'El nombre de la carrera es obligatorio.' }

    const { error } = await supabaseAdmin
      .from('facultades_carreras')
      .update({ id_facultad, nombre_carrera })
      .eq('id_facultad_carrera', id)

    if (error) return { error: 'Error al actualizar: ' + error.message }

    await syncContactoCarrera(id, formData)
    revalidate()
    return { success: 'Asociación actualizada.' }
  } catch (err: any) {
    console.error('Error en actualizarAsociacion:', err)
    if (err.message === 'No autorizado.') return { error: 'No autorizado.' }
    return { error: 'Ocurrió un error inesperado al procesar la solicitud.' }
  }
}

export async function eliminarAsociacion(id: number): Promise<ActionState> {
  try {
    await requireAdmin()

    await Promise.all([
      supabaseAdmin.from('fotos_carreras').delete().eq('id_facultad_carrera', id),
      supabaseAdmin.from('contactos_carreras').delete().eq('id_facultad_carrera', id)
    ])

    const { error } = await supabaseAdmin
      .from('facultades_carreras')
      .delete()
      .eq('id_facultad_carrera', id)

    if (error) return { error: 'Error al eliminar: ' + error.message }
    revalidate()
    return { success: 'Asociación eliminada.' }
  } catch (err: any) {
    console.error('Error en eliminarAsociacion:', err)
    if (err.message === 'No autorizado.') return { error: 'No autorizado.' }
    return { error: 'Ocurrió un error inesperado al procesar la solicitud.' }
  }
}
