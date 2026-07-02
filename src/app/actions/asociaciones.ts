'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin } from '@/lib/auth-admin'
import { revalidatePath } from 'next/cache'
import type { ActionState } from '@/lib/types/admin'

function revalidate() {
  revalidatePath('/admin/asociaciones')
  revalidatePath('/admin/galerias')
  revalidatePath('/admin/dashboard')
}

const TIPOS_CONTACTO = new Set(['telf', 'mail', 'whatsapp'])

async function syncContactoCarrera(id_facultad_carrera: number, formData: FormData) {
  const contacto = (formData.get('contacto') as string)?.trim() || null
  const tipo_contacto = (formData.get('tipo_contacto') as string)?.trim() || null

  await supabaseAdmin
    .from('contactos_carreras')
    .delete()
    .eq('id_facultad_carrera', id_facultad_carrera)

  if (!contacto) return

  const tipo = tipo_contacto && TIPOS_CONTACTO.has(tipo_contacto) ? tipo_contacto : 'mail'

  await supabaseAdmin.from('contactos_carreras').insert({
    id_facultad_carrera,
    contacto,
    tipo_contacto: tipo,
  })
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
  } catch {
    return { error: 'No autorizado.' }
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
  } catch {
    return { error: 'No autorizado.' }
  }
}

export async function eliminarAsociacion(id: number): Promise<ActionState> {
  try {
    await requireAdmin()

    await supabaseAdmin.from('fotos_carreras').delete().eq('id_facultad_carrera', id)
    await supabaseAdmin.from('contactos_carreras').delete().eq('id_facultad_carrera', id)

    const { error } = await supabaseAdmin
      .from('facultades_carreras')
      .delete()
      .eq('id_facultad_carrera', id)

    if (error) return { error: 'Error al eliminar: ' + error.message }
    revalidate()
    return { success: 'Asociación eliminada.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}
