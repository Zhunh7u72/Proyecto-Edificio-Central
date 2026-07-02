'use server'

import { query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-admin'
import { revalidatePath } from 'next/cache'
import {
  parseCorreo,
  sanitizarTexto,
  parseUrlHttp,
  assertIdEntero,
} from '@/lib/validar-input'

export type AutoridadState = { error?: string; success?: string } | undefined

export async function crearAutoridad(
  state: AutoridadState,
  formData: FormData
): Promise<AutoridadState> {
  try {
    await requireAdmin()
    const nombres = sanitizarTexto(formData.get('nombres'), 100)
    const apellidos = sanitizarTexto(formData.get('apellidos'), 100)
    const correo = parseCorreo(formData.get('correo_contactos'))
    const fotoRaw = sanitizarTexto(formData.get('ruta_foto'), 2048)
    const fotoUrl = fotoRaw ? parseUrlHttp(fotoRaw) ?? '' : ''

    if (!nombres || !apellidos || !correo) {
      return { error: 'Nombres, apellidos y correo válidos son obligatorios.' }
    }
    if (fotoRaw && !fotoUrl) {
      return { error: 'La URL de la foto no es válida.' }
    }

    const infoRes = await query('SELECT id_info_inst FROM informacion_institucional LIMIT 1')
    const info = infoRes.rows[0]

    if (!info) {
      return { error: 'No existe un registro de información institucional. Crea uno primero.' }
    }

    try {
      await query(
        'INSERT INTO autoridades_info_institucional (nombres, apellidos, correo_contactos, ruta_foto, id_info_inst) VALUES ($1, $2, $3, $4, $5)',
        [nombres, apellidos, correo, fotoUrl, info.id_info_inst]
      )
    } catch (e: any) {
      return { error: 'Error al crear representante: ' + e.message }
    }

    revalidatePath('/admin/institucional')
    revalidatePath('/institucional')
    return { success: `Representante ${nombres} ${apellidos} creado correctamente.` }
  } catch {
    return { error: 'No autorizado.' }
  }
}

export async function eliminarAutoridad(id: number): Promise<AutoridadState> {
  try {
    await requireAdmin()
    const safeId = assertIdEntero(id)
    if (!safeId) return { error: 'ID inválido.' }

    try {
      await query('DELETE FROM autoridades_info_institucional WHERE id_autoridades_info_institu = $1', [safeId])
    } catch (e: any) {
      return { error: 'Error al eliminar: ' + e.message }
    }

    revalidatePath('/admin/institucional')
    revalidatePath('/institucional')
    return { success: 'Representante eliminado.' }
  } catch {
    return { error: 'No autorizado.' }
  }
}
