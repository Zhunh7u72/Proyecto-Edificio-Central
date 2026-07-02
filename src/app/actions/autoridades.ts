'use server'

import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-admin'
import { revalidatePath } from 'next/cache'

export type AutoridadState = { error?: string; success?: string } | undefined

// ── CREAR REPRESENTANTE ────────────────────────────────────────────────
export async function crearAutoridad(
  state: AutoridadState,
  formData: FormData
): Promise<AutoridadState> {
  try {
    await requireAdmin()
  const nombres = (formData.get('nombres') as string)?.trim()
  const apellidos = (formData.get('apellidos') as string)?.trim()
  const correo = (formData.get('correo_contactos') as string)?.trim()
  const fotoUrl = (formData.get('ruta_foto') as string)?.trim() || ''

  if (!nombres || !apellidos || !correo) {
    return { error: 'Nombres, apellidos y correo son obligatorios.' }
  }

  const infoRes = await query('SELECT id_info_inst FROM informacion_institucional LIMIT 1')
  if (infoRes.rows.length === 0) {
    return { error: 'No existe un registro de información institucional. Crea uno primero.' }
  }
  const info = infoRes.rows[0]

  try {
    await query(
      'INSERT INTO autoridades_info_institucional (nombres, apellidos, correo_contactos, ruta_foto, id_info_inst) VALUES ($1, $2, $3, $4, $5)',
      [nombres, apellidos, correo, fotoUrl, info.id_info_inst]
    )
  } catch (error: any) {
    return { error: 'Error al crear representante: ' + error.message }
  }

  revalidatePath('/admin/institucional')
  revalidatePath('/institucional')
  return { success: `Representante ${nombres} ${apellidos} creado correctamente.` }
  } catch {
    return { error: 'No autorizado.' }
  }
}

// ── ELIMINAR REPRESENTANTE ────────────────────────────────────────────
export async function eliminarAutoridad(id: number): Promise<AutoridadState> {
  try {
    await requireAdmin()
    if (!Number.isFinite(id) || id <= 0) return { error: 'ID inválido.' }

    try {
      await query('DELETE FROM autoridades_info_institucional WHERE id_autoridades_info_institu = $1', [id])
    } catch (error: any) {
      return { error: 'Error al eliminar: ' + error.message }
    }

    revalidatePath('/admin/institucional')
    revalidatePath('/institucional')
    return { success: 'Representante eliminado.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}
