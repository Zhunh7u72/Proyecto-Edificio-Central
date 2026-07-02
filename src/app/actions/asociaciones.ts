'use server'

import { query } from '@/lib/db'
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

  await query('DELETE FROM contactos_carreras WHERE id_facultad_carrera = $1', [id_facultad_carrera])
  if (!contacto) return
  const tipo = tipo_contacto && TIPOS_CONTACTO.has(tipo_contacto) ? tipo_contacto : 'mail'
  await query(
    'INSERT INTO contactos_carreras (id_facultad_carrera, contacto, tipo_contacto) VALUES ($1, $2, $3)',
    [id_facultad_carrera, contacto, tipo]
  )
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

    try {
      const res = await query(
        'INSERT INTO facultades_carreras (id_facultad, nombre_carrera) VALUES ($1, $2) RETURNING id_facultad_carrera',
        [id_facultad, nombre_carrera]
      )
      if (res.rowCount === 0) throw new Error()
      const data = res.rows[0]
      await syncContactoCarrera(data.id_facultad_carrera, formData)
    } catch (error: any) {
      return { error: 'Error al crear: ' + (error?.message ?? 'sin respuesta') }
    }
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

    try {
      await query(
        'UPDATE facultades_carreras SET id_facultad = $1, nombre_carrera = $2 WHERE id_facultad_carrera = $3',
        [id_facultad, nombre_carrera, id]
      )
    } catch (error: any) {
      return { error: 'Error al actualizar: ' + error.message }
    }

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

    try {
      await query('DELETE FROM fotos_carreras WHERE id_facultad_carrera = $1', [id])
      await query('DELETE FROM contactos_carreras WHERE id_facultad_carrera = $1', [id])
      await query('DELETE FROM facultades_carreras WHERE id_facultad_carrera = $1', [id])
    } catch (error: any) {
      return { error: 'Error al eliminar: ' + error.message }
    }
    revalidate()
    return { success: 'Asociación eliminada.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}
